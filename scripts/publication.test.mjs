import test from 'node:test';
import assert from 'node:assert/strict';
import { publicationIntent, sourceHashFor, imageReferences, safeImageUrl, sha256,
  replaceImages, imageExtension, renderPost, verifyArticle } from './publication-core.mjs';
import { GitHub, downloadImage } from './publish-blog.mjs';
import './publication-regression-cases.mjs';

const issue = { number: 53, title: '含有引号 " 和冒号: 的标题', body: '文章正文',
  created_at: '2026-05-27T13:05:07Z', html_url: 'https://github.com/hufei365/notebook/issues/53',
  labels: [{ name: 'AI' }, { name: 'ready-to-publish' }] };

test('historical published labels do not create missing source files', () => {
  const historic = { ...issue, labels: [{ name: 'published' }] };
  assert.equal(publicationIntent(historic, false), null);
  assert.equal(publicationIntent(historic, true), 'publish');
  assert.equal(publicationIntent(issue, false), 'publish');
  assert.equal(publicationIntent({ ...issue, pull_request: {} }, false), null);
});

test('draft blocks publication and explicit unpublish wins', () => {
  assert.equal(publicationIntent({ ...issue, labels: ['draft', 'ready-to-publish'] }, true), null);
  assert.equal(publicationIntent({ ...issue, labels: ['draft', 'unpublish'] }, true), 'unpublish');
});

test('source hash ignores publishing labels but tracks title, body and categories', () => {
  assert.equal(sourceHashFor(issue), sourceHashFor({ ...issue, labels: ['published', 'AI'] }));
  assert.notEqual(sourceHashFor(issue), sourceHashFor({ ...issue, body: '修改后的正文' }));
  assert.notEqual(sourceHashFor(issue), sourceHashFor({ ...issue, labels: ['CSS'] }));
});

test('rewrites actual images without rewriting prose links or code examples', () => {
  const url = 'https://github.com/user-attachments/assets/a';
  const body = `![图](${url})\n<img width="20" src="${url}" />\n[链接](${url})\n\`![例](${url})\`\n\n\`\`\`md\n![例](${url})\n\`\`\``;
  const refs = imageReferences(body);
  assert.equal(refs.length, 2);
  const rewritten = replaceImages(body, refs, new Map([[url, 'https://files.seeusercontent.com/a.png']]));
  assert.equal(rewritten.match(/seeusercontent/g).length, 2);
  assert.ok(rewritten.includes(`[链接](${url})`));
  assert.ok(rewritten.includes(`![例](${url})`));
});

test('unsupported reference-style images stop publication', () => {
  assert.throws(() => imageReferences('![图][photo]\n[photo]: https://github.com/a'), /Reference-style/);
  assert.throws(() => replaceImages('![图](https://github.com/a)', imageReferences('![图](https://github.com/a)'), new Map()), /Incomplete/);
});

test('content hashes keep different images separate regardless of filename', () => {
  assert.notEqual(sha256(Buffer.from('embedding')), sha256(Buffer.from('attention')));
  assert.equal(sha256(Buffer.from('same image')), sha256(Buffer.from('same image')));
});

test('rejects unapproved and local download targets', () => {
  for (const url of ['http://github.com/a', 'https://127.0.0.1/a', 'https://github.com.evil.test/a',
    'https://name:secret@github.com/a', 'https://github.com:8443/a']) assert.throws(() => safeImageUrl(url));
  assert.equal(safeImageUrl('https://github.com/user-attachments/assets/a').hostname, 'github.com');
  assert.equal(safeImageUrl('https://i.postimg.cc/MKNWDdBH/quic01.png').hostname, 'i.postimg.cc');
  assert.throws(() => safeImageUrl('https://i.postimg.cc.evil.test/image.png'));
  assert.throws(() => safeImageUrl('images/naruto.gif'));
});

test('download checks redirect destinations before following them', async () => {
  let calls = 0;
  await assert.rejects(downloadImage('https://github.com/a', async () => {
    calls++;
    return new Response(null, { status: 302, headers: { location: 'https://127.0.0.1/secret' } });
  }), /Unsupported image origin/);
  assert.equal(calls, 1);
});

test('detects image type from bytes and rejects HTML error pages', () => {
  assert.equal(imageExtension(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'png');
  assert.equal(imageExtension(Buffer.from([255, 216, 255, 0])), 'jpg');
  assert.equal(imageExtension(Buffer.from('GIF89a...')), 'gif');
  assert.throws(() => imageExtension(Buffer.from('<html>not an image</html>')));
});

test('post metadata quotes YAML-sensitive titles and includes source provenance', () => {
  const hash = sourceHashFor(issue);
  const output = renderPost(issue, issue.body, hash);
  assert.ok(output.includes(`title: ${JSON.stringify(issue.title)}`));
  assert.ok(output.includes('sourceIssue: 53'));
  assert.ok(output.includes(`sourceHash: "${hash}"`));
  assert.ok(output.endsWith('文章正文\n'));
});

test('HTTP 200 homepage and previous article version cannot pass verification', () => {
  const hash = sourceHashFor(issue);
  assert.equal(verifyArticle('<h1>Home</h1>', hash), false);
  assert.equal(verifyArticle(`<meta name="blog:source-hash" content="${'0'.repeat(64)}">`, hash), false);
  assert.equal(verifyArticle(`<meta name="blog:source-hash" content="${hash}">`, hash), true);
  assert.equal(verifyArticle(`<meta content="${hash}" name="blog:source-hash">`, hash), true);
});

test('GitHub writer skips unchanged files and supplies SHA for updates', async () => {
  const client = new GitHub('test-only-token');
  const calls = [];
  client.content = async () => ({ bytes: Buffer.from('old'), sha: 'previous-sha' });
  client.request = async (...args) => { calls.push(args); return {}; };
  assert.equal(await client.put('owner/repo', 'a.md', 'draft', Buffer.from('old'), 'message'), false);
  assert.equal(calls.length, 0);
  assert.equal(await client.put('owner/repo', 'a.md', 'draft', Buffer.from('new'), 'message'), true);
  assert.equal(calls[0][2].sha, 'previous-sha');
  assert.equal(calls[0][2].branch, 'draft');
});
