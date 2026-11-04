import { pathToFileURL } from 'node:url';
import { GitHub } from './publish-blog.mjs';
import { sourceHashFor, verifyArticle, sha256 } from './publication-core.mjs';

export async function verifyOnlinePublication(state, stateBytes, baseUrl, fetcher = fetch) {
  const options = () => ({ headers: { 'Cache-Control': 'no-cache' }, redirect: 'error',
    signal: AbortSignal.timeout(30000) });
  const stateHash = sha256(stateBytes);
  const markerResponse = await fetcher(new URL(`/.well-known/blog-publications/issue-${state.number}.json?publication=${stateHash}`, baseUrl), options());
  if (markerResponse.status !== 200) return false;
  const marker = await markerResponse.json();
  if (marker.number !== state.number || marker.sourceRepo !== state.sourceRepo
      || marker.sourceHash !== state.sourceHash || marker.intent !== state.intent || marker.stateHash !== stateHash) return false;
  const response = await fetcher(new URL(`/blog/issue-${state.number}/?publication=${stateHash}`, baseUrl), options());
  if (state.intent === 'publish') return response.status === 200 && verifyArticle(await response.text(), state.sourceHash);
  if (state.intent !== 'unpublish' || response.status !== 404 || !Array.isArray(marker.removedPaths)) return false;
  for (const path of new Set(marker.removedPaths)) {
    if (typeof path !== 'string' || !path.startsWith('/blog/') || !path.endsWith('/')) return false;
    const oldResponse = await fetcher(new URL(path + `?publication=${stateHash}`, baseUrl), options());
    if (oldResponse.status !== 404) return false;
  }
  return true;
}

export async function main() {
  const apply = process.argv.includes('--apply');
  const sourceRepo = process.env.SOURCE_REPO || 'hufei365/notebook';
  const siteRepo = process.env.SITE_REPO || 'hufei365/hufei.github.io';
  const baseUrl = new URL(process.env.SITE_URL || 'https://hufeispace.com');
  if (baseUrl.protocol !== 'https:') throw new Error('SITE_URL must use HTTPS.');
  const token = process.env.SOURCE_TOKEN || process.env.GH_TOKEN;
  if (!token) throw new Error('SOURCE_TOKEN or GH_TOKEN is required.');
  const source = new GitHub(token);
  const site = new GitHub(process.env.PUBLISHER_TOKEN || token);
  const info = await site.request('GET', `repos/${siteRepo}`);
  let failures = 0;
  for (let page = 1; ; page++) {
    const issues = await source.request('GET', `repos/${sourceRepo}/issues?state=all&per_page=100&page=${page}`);
    for (const issue of issues) {
      if (issue.pull_request) continue;
      const labels = issue.labels.map((label) => label.name);
      if (!labels.some((label) => ['ready-to-publish', 'unpublish'].includes(label))) continue;
      try {
        const file = await site.content(siteRepo, `.publication/issue-${issue.number}.json`, info.default_branch);
        if (!file) { console.log(`#${issue.number}: awaiting merged publication state.`); continue; }
        const state = JSON.parse(file.bytes.toString('utf8'));
        if (state.number !== issue.number || state.sourceRepo !== sourceRepo
            || state.sourceHash !== sourceHashFor(issue) || (labels.includes('draft') && state.intent !== 'unpublish')) {
          console.log(`#${issue.number}: latest source is not published yet.`); continue;
        }
        if (!['publish', 'unpublish'].includes(state.intent)) throw new Error('Invalid publication intent.');
        const wantsRemoval = labels.includes('unpublish');
        if (wantsRemoval !== (state.intent === 'unpublish')) continue;
        const verified = await verifyOnlinePublication(state, file.bytes, baseUrl);
        if (!verified) {
          console.log(`#${issue.number}: deployment record or online article version not verified.`);
          failures++;
          continue;
        }
        // Re-read to avoid acknowledging a source edit that happened during the online check.
        const latest = await source.request('GET', `repos/${sourceRepo}/issues/${issue.number}`);
        if (sourceHashFor(latest) !== state.sourceHash) continue;
        const latestLabels = latest.labels.map((label) => label.name);
        if ((latestLabels.includes('draft') && !wantsRemoval) || latestLabels.includes('unpublish') !== wantsRemoval
            || (!wantsRemoval && !latestLabels.includes('ready-to-publish'))) continue;
        if (apply) {
          if (!wantsRemoval) await source.request('POST', `repos/${sourceRepo}/issues/${issue.number}/labels`, { labels: ['published'] });
          for (const label of wantsRemoval ? ['published', 'unpublish', 'ready-to-publish'] : ['ready-to-publish']) {
            await source.request('DELETE', `repos/${sourceRepo}/issues/${issue.number}/labels/${label}`, undefined, true);
          }
        }
        console.log(`#${issue.number}: verified ${state.intent}${apply ? '; labels updated.' : ' (dry-run).'} `);
      } catch (error) {
        failures++;
        console.error(`#${issue.number}: ${error.message}`);
      }
    }
    if (issues.length < 100) break;
  }
  if (failures) throw new Error(`${failures} publication(s) still need online verification; labels retained.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
