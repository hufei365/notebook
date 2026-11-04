// Loaded by publication.test.mjs so all workflow test commands include regressions.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { GitHub, main as publishMain } from './publish-blog.mjs';
import { main as verifyMain, verifyOnlinePublication } from './verify-publications.mjs';
import { sourceHashFor, sha256, renderPost } from './publication-core.mjs';

const sourceRepo = 'hufei365/notebook';
const siteRepo = 'hufei365/hufei.github.io';
const baseUrl = new URL('https://hufeispace.com');
const issue = { number: 53, title: '文章', body: '版本 A', created_at: '2026-05-27T00:00:00Z',
  html_url: `https://github.com/${sourceRepo}/issues/53`,
  labels: [{ name: 'published' }, { name: 'ready-to-publish' }] };
const bytesOf = (value) => Buffer.from(JSON.stringify(value) + '\n');
const contentResult = (bytes) => ({ type: 'file', encoding: 'base64', content: bytes.toString('base64'), sha: sha256(bytes) });
const stateFor = (value, intent = 'publish') => ({ number: value.number, sourceRepo,
  sourceHash: sourceHashFor(value), intent });
const markerFor = (state, bytes, removedPaths = []) => ({ ...state, stateHash: sha256(bytes), removedPaths });

function runtime(t) {
  // Main entry points are exercised with API/fetch stubs; suppress simulated write logs.
  t.mock.method(console, 'log', () => {});
  const keys = ['SOURCE_TOKEN', 'GH_TOKEN', 'PUBLISHER_TOKEN', 'SEE_API_TOKEN', 'SOURCE_REPO', 'SITE_REPO',
    'IMAGE_REPO', 'IMAGE_BRANCH', 'SITE_URL', 'GITHUB_EVENT_PATH', 'GITHUB_STEP_SUMMARY', 'ISSUE_NUMBER'];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  const argv = process.argv;
  for (const key of keys) delete process.env[key];
  process.env.SOURCE_TOKEN = 'test-source-token';
  process.env.PUBLISHER_TOKEN = 'test-publisher-token';
  process.argv = ['node', 'publication.test.mjs', '--issue=53', '--apply'];
  t.after(() => {
    process.argv = argv;
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
}

test('GitHub backup larger than 1 MiB is readable and reusable on retry', async (t) => {
  const bytes = Buffer.alloc(1024 * 1024 + 1, 7);
  const client = new GitHub('test-token');
  client.request = async (method) => {
    assert.equal(method, 'GET');
    return { type: 'file', encoding: 'none', content: '', sha: 'existing-blob-sha', size: bytes.length };
  };
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.ok(String(url).startsWith('https://api.github.com/repos/hufei365/myimages/contents/'));
    assert.equal(options.headers.Accept, 'application/vnd.github.raw+json');
    assert.equal(options.redirect, 'error');
    return new Response(bytes);
  });
  assert.deepEqual((await client.content('hufei365/myimages', 'blog/hash.png', 'zhihu')).bytes, bytes);
  assert.equal(await client.put('hufei365/myimages', 'blog/hash.png', 'zhihu', bytes, 'test'), false);
});

test('reverting A to B to A synchronizes the existing PR instead of skipping it', async (t) => {
  runtime(t);
  const temp = await mkdtemp(join(tmpdir(), 'authored-publication-event-'));
  t.after(() => rm(temp, { recursive: true, force: true }));
  process.env.GITHUB_EVENT_PATH = join(temp, 'event.json');
  await writeFile(process.env.GITHUB_EVENT_PATH, JSON.stringify({ sender: { login: 'writer' } }));
  const branch = 'automation/issue-53';
  const articlePath = 'src/content/blog/issue-53.md';
  const statePath = '.publication/issue-53.json';
  const b = { ...issue, body: '版本 B' };
  const markdown = (value) => Buffer.from(renderPost(value, value.body, sourceHashFor(value)));
  const files = new Map([
    [`main:${articlePath}`, markdown(issue)], [`main:${statePath}`, bytesOf(stateFor(issue))],
    [`${branch}:${articlePath}`, markdown(b)], [`${branch}:${statePath}`, bytesOf(stateFor(b))],
  ]);
  let updatedPull = false;
  t.mock.method(GitHub.prototype, 'request', async function(method, endpoint, data) {
    if (method === 'GET' && endpoint === `repos/${sourceRepo}/issues/53`) return issue;
    if (method === 'GET' && endpoint === `repos/${siteRepo}`) return { default_branch: 'main' };
    if (method === 'GET' && endpoint.includes('/collaborators/writer/permission')) return { permission: 'write' };
    if (method === 'GET' && endpoint.includes('/pulls?')) return [{ number: 7 }];
    if (method === 'GET' && endpoint.includes('/git/ref/heads/')) return { object: { sha: 'head' } };
    if (method === 'POST' && endpoint.endsWith('/merges')) return {};
    if (endpoint.startsWith(`repos/${siteRepo}/contents/`)) {
      const [path, query] = endpoint.slice(`repos/${siteRepo}/contents/`.length).split('?');
      if (method === 'GET') {
        const bytes = files.get(`${new URLSearchParams(query).get('ref')}:${path}`);
        return bytes ? contentResult(bytes) : null;
      }
      if (method === 'PUT') { files.set(`${data.branch}:${path}`, Buffer.from(data.content, 'base64')); return {}; }
    }
    if (method === 'PATCH' && endpoint === `repos/${siteRepo}/pulls/7`) {
      assert.equal(data.state, undefined); // No automatic PR closure.
      updatedPull = true;
      return { html_url: 'https://example.test/pull/7' };
    }
    throw new Error(`Unexpected mock GitHub request: ${method} ${endpoint}`);
  });
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected network access'); });
  await publishMain();
  assert.equal(updatedPull, true);
  assert.deepEqual(files.get(`${branch}:${articlePath}`), markdown(issue));
  assert.equal(JSON.parse(files.get(`${branch}:${statePath}`)).sourceHash, sourceHashFor(issue));
});

test('withdrawal needs the deployed state and all known old URLs to be gone', async () => {
  const state = stateFor(issue, 'unpublish');
  const bytes = bytesOf(state);
  const oldPath = '/blog/0053_old_article/';
  const probe = (marker, oldStatus = 404) => async (url) => {
    const path = new URL(url).pathname;
    if (path.startsWith('/.well-known/')) return Response.json(marker);
    if (path === '/blog/issue-53/') return new Response(null, { status: 404 });
    if (path === oldPath) return new Response(null, { status: oldStatus });
    throw new Error(`Unexpected probe: ${path}`);
  };
  assert.equal(await verifyOnlinePublication(state, bytes, baseUrl,
    probe({ ...markerFor(state, bytes, [oldPath]), stateHash: 'old-deployment' })), false);
  assert.equal(await verifyOnlinePublication(state, bytes, baseUrl,
    probe(markerFor(state, bytes, [oldPath]), 200)), false);
  assert.equal(await verifyOnlinePublication(state, bytes, baseUrl,
    probe(markerFor(state, bytes, [oldPath]))), true);
});

test('publish verification needs both the deployed record and matching article marker', async () => {
  const state = stateFor(issue);
  const bytes = bytesOf(state);
  const probe = (html) => async (url) => new URL(url).pathname.startsWith('/.well-known/')
    ? Response.json(markerFor(state, bytes)) : new Response(html);
  assert.equal(await verifyOnlinePublication(state, bytes, baseUrl, probe('<title>Homepage</title>')), false);
  assert.equal(await verifyOnlinePublication(state, bytes, baseUrl,
    probe(`<meta name="blog:source-hash" content="${state.sourceHash}">`)), true);
});

test('draft with explicit unpublish completes withdrawal verification and label cleanup', async (t) => {
  runtime(t);
  const draft = { ...issue, labels: [{ name: 'draft' }, { name: 'unpublish' }, { name: 'published' }] };
  const state = stateFor(draft, 'unpublish');
  const bytes = bytesOf(state);
  const removed = [];
  t.mock.method(GitHub.prototype, 'request', async function(method, endpoint) {
    if (method === 'GET' && endpoint === `repos/${siteRepo}`) return { default_branch: 'main' };
    if (method === 'GET' && endpoint.startsWith(`repos/${sourceRepo}/issues?`)) return [draft];
    if (method === 'GET' && endpoint === `repos/${sourceRepo}/issues/53`) return draft;
    if (method === 'GET' && endpoint.includes('/contents/.publication/issue-53.json')) return contentResult(bytes);
    if (method === 'DELETE' && endpoint.includes('/issues/53/labels/')) { removed.push(endpoint.split('/').at(-1)); return null; }
    throw new Error(`Unexpected mock GitHub request: ${method} ${endpoint}`);
  });
  t.mock.method(globalThis, 'fetch', async (url) => new URL(url).pathname.startsWith('/.well-known/')
    ? Response.json(markerFor(state, bytes)) : new Response(null, { status: 404 }));
  await verifyMain();
  assert.deepEqual(removed, ['published', 'unpublish', 'ready-to-publish']);
});
