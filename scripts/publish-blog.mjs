import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { sha256, sourceHashFor, publicationIntent, imageReferences, safeImageUrl,
  imageExtension, replaceImages, renderPost } from './publication-core.mjs';

export class GitHub {
  constructor(token) { this.token = token; }
  async request(method, endpoint, data, allowMissing = false) {
    const response = await fetch(`https://api.github.com/${endpoint}`, {
      method, headers: { Authorization: `Bearer ${this.token}`, Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      body: data === undefined ? undefined : JSON.stringify(data), signal: AbortSignal.timeout(45000),
    });
    if (allowMissing && response.status === 404) return null;
    if (!response.ok) throw new Error(`GitHub ${method} ${endpoint.split('?')[0]}: HTTP ${response.status}`);
    return response.status === 204 ? null : response.json();
  }
  async content(repo, path, ref = 'main') {
    const result = await this.request('GET', `repos/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`, undefined, true);
    if (!result) return null;
    if (result.type !== 'file') throw new Error(`Unsupported GitHub content: ${path}`);
    if (result.encoding === 'base64') return { ...result, bytes: Buffer.from(result.content, 'base64') };
    if (result.encoding !== 'none') throw new Error(`Unsupported GitHub encoding: ${path}`);
    // Contents JSON omits bytes for files over 1 MiB; fetch raw bytes from the same API host.
    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`, {
      headers: { Authorization: `Bearer ${this.token}`, Accept: 'application/vnd.github.raw+json',
        'X-GitHub-Api-Version': '2022-11-28' },
      redirect: 'error', signal: AbortSignal.timeout(45000),
    });
    if (!response.ok) throw new Error(`GitHub raw content ${path}: HTTP ${response.status}`);
    return { ...result, bytes: Buffer.from(await response.arrayBuffer()) };
  }
  async put(repo, path, branch, bytes, message) {
    const previous = await this.content(repo, path, branch);
    if (previous && previous.bytes.equals(bytes)) return false;
    await this.request('PUT', `repos/${repo}/contents/${path}`, {
      branch, message, content: bytes.toString('base64'), ...(previous ? { sha: previous.sha } : {}),
    });
    return true;
  }
}

export async function downloadImage(input, fetcher = fetch) {
  let url = safeImageUrl(input);
  for (let hop = 0; hop < 6; hop++) {
    const response = await fetcher(url, { redirect: 'manual', signal: AbortSignal.timeout(45000) });
    if (response.status >= 300 && response.status < 400) {
      url = safeImageUrl(new URL(response.headers.get('location'), url).href);
      await response.body?.cancel();
      continue;
    }
    if (!response.ok) throw new Error(`Image download failed: HTTP ${response.status}`);
    const chunks = [];
    let length = 0;
    for await (const chunk of response.body) {
      length += chunk.length;
      if (length > 10 * 1024 * 1024) throw new Error('Image exceeds publisher limit of 10 MiB.');
      chunks.push(Buffer.from(chunk));
    }
    const bytes = Buffer.concat(chunks);
    return { bytes, extension: imageExtension(bytes), hash: sha256(bytes) };
  }
  throw new Error('Image redirect limit exceeded.');
}

export async function uploadPrimary(bytes, extension, token) {
  const form = new FormData();
  form.append('file', new Blob([bytes]), `${sha256(bytes)}.${extension}`);
  const response = await fetch('https://s.ee/api/v1/file/upload', {
    method: 'POST', headers: { Authorization: token }, body: form, redirect: 'error',
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw new Error(`S.EE upload failed: HTTP ${response.status}`);
  const result = await response.json();
  const url = result.data?.url;
  if ((result.code !== 200 && result.success !== true && result.message !== 'success') || !url) {
    throw new Error('S.EE did not return a successful upload URL.');
  }
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') throw new Error('S.EE returned a non-HTTPS URL.');
  return parsed.href;
}

function decodeJson(file) { return file ? JSON.parse(file.bytes.toString('utf-8')) : null; }
const formattedJson = (object) => Buffer.from(JSON.stringify(object, null, 2) + '\n');

export async function main() {
  const apply = process.argv.includes('--apply');
  const numberArg = process.argv.find((argument) => argument.startsWith('--issue='));
  const event = process.env.GITHUB_EVENT_PATH ? JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8')) : null;
  const number = Number(numberArg?.slice(8) ?? event?.issue?.number ?? process.env.ISSUE_NUMBER);
  if (!Number.isSafeInteger(number) || number <= 0) throw new Error('Provide --issue=N or an issue event.');
  const sourceRepo = process.env.SOURCE_REPO || 'hufei365/notebook';
  const siteRepo = process.env.SITE_REPO || 'hufei365/hufei.github.io';
  const imageRepo = process.env.IMAGE_REPO || 'hufei365/myimages';
  const imageBranch = process.env.IMAGE_BRANCH || 'zhihu';
  const readToken = process.env.SOURCE_TOKEN || process.env.GH_TOKEN;
  if (!readToken) throw new Error('SOURCE_TOKEN or GH_TOKEN is required.');
  const source = new GitHub(readToken);
  const site = new GitHub(process.env.PUBLISHER_TOKEN || readToken);
  const issue = await source.request('GET', `repos/${sourceRepo}/issues/${number}`);
  const siteInfo = await site.request('GET', `repos/${siteRepo}`);
  const base = siteInfo.default_branch;
  const path = `src/content/blog/issue-${number}.md`;
  const existing = await site.content(siteRepo, path, base);
  const intent = publicationIntent(issue, !!existing);
  if (!intent) { console.log(`Issue #${number}: no publication requested.`); return; }
  const sourceHash = sourceHashFor(issue);
  const statePath = `.publication/issue-${number}.json`;
  const oldState = decodeJson(await site.content(siteRepo, statePath, base));
  const branch = `automation/issue-${number}`;
  if (intent === 'publish' && oldState?.intent === 'publish' && oldState.sourceHash === sourceHash && existing) {
    const pending = await site.request('GET', `repos/${siteRepo}/pulls?state=open&head=${encodeURIComponent(siteRepo.split('/')[0] + ':' + branch)}`);
    if (!pending.length) { console.log(`Issue #${number}: source unchanged.`); return; }
    // Keep the existing PR synchronized even when the issue reverts A -> B -> A.
  }
  // Issue editing is open to contributors. Check actor's repository permission before any write/upload.
  if (apply) {
    if (!event?.sender?.login) throw new Error('Apply requires a GitHub Actions event with sender identity.');
    const actor = await source.request('GET', `repos/${sourceRepo}/collaborators/${encodeURIComponent(event.sender.login)}/permission`);
    if (!['admin', 'maintain', 'write'].includes(actor.permission)) throw new Error('Publisher requires a repository writer.');
    if (!process.env.PUBLISHER_TOKEN) throw new Error('PUBLISHER_TOKEN is required for cross-repository writes.');
  }
  const references = intent === 'publish' ? imageReferences(issue.body || '') : [];
  for (const reference of references) safeImageUrl(reference.url);
  console.log(JSON.stringify({ issue: number, intent, sourceHash, imageCount: references.length,
    sourceExists: !!existing, mode: apply ? 'apply' : 'dry-run' }, null, 2));
  if (!apply) return;
  if (intent === 'publish' && references.length && !process.env.SEE_API_TOKEN) throw new Error('SEE_API_TOKEN is required.');
  let branchRef = await site.request('GET', `repos/${siteRepo}/git/ref/heads/${branch}`, undefined, true);
  if (!branchRef) {
    const baseRef = await site.request('GET', `repos/${siteRepo}/git/ref/heads/${base}`);
    branchRef = await site.request('POST', `repos/${siteRepo}/git/refs`, { ref: `refs/heads/${branch}`, sha: baseRef.object.sha });
  } else {
    // Keep an existing publication branch current without force-overwriting a PR.
    await site.request('POST', `repos/${siteRepo}/merges`, { base: branch, head: base, commit_message: 'chore: 同步博客主分支\n\n- 更新发布分支基线\n\nCo-Authored-By: Claude Code <noreply@anthropic.com>' });
  }
  const message = `chore: 同步文章 #${number}\n\n- 根据 Issues 更新文章和图片映射\n\nCo-Authored-By: Claude Code <noreply@anthropic.com>`;
  const mediaMap = new Map();
  const records = new Map();
  let renderedHash = null;
  if (intent === 'publish') {
    for (const url of new Set(references.map((reference) => reference.url))) {
      const image = await downloadImage(url);
      const mediaPath = `.publication/images/${image.hash}.json`;
      let record = records.get(image.hash) ?? decodeJson(await site.content(siteRepo, mediaPath, branch));
      if (record && (record.sha256 !== image.hash || !record.primaryUrl || !record.backupPath)) throw new Error('Invalid saved image mapping.');
      if (!record) {
        const backupPath = `blog/${image.hash}.${image.extension}`;
        const previous = await site.content(imageRepo, backupPath, imageBranch);
        if (previous && sha256(previous.bytes) !== image.hash) throw new Error('Image backup hash mismatch.');
        if (!previous) await site.put(imageRepo, backupPath, imageBranch, image.bytes, message);
        record = { sha256: image.hash, primaryUrl: await uploadPrimary(image.bytes, image.extension, process.env.SEE_API_TOKEN),
          backupRepo: imageRepo, backupBranch: imageBranch, backupPath };
        await site.put(siteRepo, mediaPath, branch, formattedJson(record), message);
      }
      records.set(image.hash, record);
      mediaMap.set(url, record.primaryUrl);
    }
    const body = replaceImages(issue.body, references, mediaMap);
    const markdown = renderPost(issue, body, sourceHash, existing?.bytes.toString('utf8') ?? null);
    renderedHash = sha256(markdown);
    await site.put(siteRepo, path, branch, Buffer.from(markdown), message);
  } else {
    const current = await site.content(siteRepo, path, branch);
    if (current) await site.request('DELETE', `repos/${siteRepo}/contents/${path}`, { branch, sha: current.sha, message });
  }
  const state = { number, sourceRepo, sourceUrl: issue.html_url, sourceHash, renderedHash, intent,
    title: issue.title, canonicalPath: `/blog/issue-${number}/`,
    images: [...records.values()].map((record) => record.sha256) };
  await site.put(siteRepo, statePath, branch, formattedJson(state), message);
  const pulls = await site.request('GET', `repos/${siteRepo}/pulls?state=open&head=${encodeURIComponent(siteRepo.split('/')[0] + ':' + branch)}`);
  const description = `同步 ${issue.html_url}。\n\n- 操作：${intent}\n- 图片：${records.size} 个内容哈希\n- 源版本：\`${sourceHash}\`\n\n合并后由现有部署流程发布，线上核验成功前保留待发布状态。\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)`;
  const payload = { title: `${intent === 'publish' ? '发布' : '撤下'}文章 #${number}：${issue.title}`, body: description };
  const pr = pulls.length
    ? await site.request('PATCH', `repos/${siteRepo}/pulls/${pulls[0].number}`, payload)
    : await site.request('POST', `repos/${siteRepo}/pulls`, { ...payload, head: branch, base });
  if (process.env.GITHUB_STEP_SUMMARY) await writeFile(process.env.GITHUB_STEP_SUMMARY, `发布 PR：${pr.html_url}\n`, { flag: 'a' });
  if (intent === 'publish' && !issue.labels.some((label) => label.name === 'ready-to-publish')) {
    await source.request('POST', `repos/${sourceRepo}/issues/${number}/labels`, { labels: ['ready-to-publish'] });
  }
  console.log(`Publication PR: ${pr.html_url}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
