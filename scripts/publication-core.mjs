import { createHash } from 'node:crypto';

export const CONTROL_LABELS = new Set(['draft', 'ready-to-publish', 'published', 'unpublish']);
export const sha256 = (value) => createHash('sha256').update(value).digest('hex');
export const tagsFor = (issue) => issue.labels.map((label) => typeof label === 'string' ? label : label.name)
  .filter((name) => !CONTROL_LABELS.has(name)).sort();
export const sourceHashFor = (issue) => sha256(JSON.stringify({
  title: issue.title, body: issue.body ?? '', tags: tagsFor(issue), createdAt: issue.created_at,
}));

export function publicationIntent(issue, sourceExists) {
  if (issue.pull_request) return null;
  const labels = issue.labels.map((label) => typeof label === 'string' ? label : label.name);
  if (labels.includes('unpublish')) return 'unpublish';
  if (labels.includes('draft')) return null;
  if (labels.includes('ready-to-publish')) return 'publish';
  // Historical 'published' labels alone cannot create a new publication.
  return labels.includes('published') && sourceExists ? 'publish' : null;
}

export function imageReferences(body) {
  const references = [];
  // Ignore fenced and inline code: sample Markdown/HTML must remain literal.
  const segments = body.split(/(^ {0,3}(?:`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}(?:`{3,}|~{3,})\s*$|`+[^`\n]*`+)/gm);
  let offset = 0;
  for (let index = 0; index < segments.length; index++) {
    const part = segments[index];
    if (index % 2 === 0) {
      const regex = /!\[[^\]\n]*\]\(\s*(?:<([^>\n]+)>|([^\s)]+))(?:\s+["'][^\n]*?["'])?\s*\)|<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
      for (const match of part.matchAll(regex)) {
        const url = match[1] ?? match[2] ?? match[3];
        const relativeOffset = match[0].indexOf(url);
        references.push({ url, start: offset + match.index + relativeOffset,
          end: offset + match.index + relativeOffset + url.length });
      }
      if (/!\[[^\]\n]*\]\s*\[[^\]\n]*\]/.test(part)) {
        throw new Error('Reference-style images are not supported yet; use inline image links.');
      }
    }
    offset += part.length;
  }
  return references;
}

export function safeImageUrl(input) {
  const url = new URL(input);
  const allowed = ['github.com', 'raw.githubusercontent.com', 'user-images.githubusercontent.com',
    'private-user-images.githubusercontent.com', 'objects.githubusercontent.com',
    'github-production-user-asset-6210df.s3.amazonaws.com', 'files.seeusercontent.com', 'i.postimg.cc'];
  if (url.protocol !== 'https:' || url.username || url.password || !allowed.includes(url.hostname)
      || (url.port && url.port !== '443')) throw new Error(`Unsupported image origin: ${url.origin}`);
  return url;
}

export function imageExtension(bytes) {
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'jpg';
  if (/^GIF8[79]a/.test(bytes.subarray(0, 6).toString('ascii'))) return 'gif';
  if (bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP') return 'webp';
  throw new Error('Expected PNG, JPEG, GIF or WebP image bytes.');
}

export function replaceImages(body, references, mapping) {
  let output = body;
  for (const reference of [...references].reverse()) {
    if (!mapping.has(reference.url)) throw new Error('Incomplete image mapping.');
    output = output.slice(0, reference.start) + mapping.get(reference.url) + output.slice(reference.end);
  }
  return output;
}

function existingDescriptionField(markdown) {
  if (markdown == null) return null;
  const normalized = markdown.replace(/\r\n/g, '\n');
  const frontmatter = normalized.match(/^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
  if (!frontmatter) throw new Error('Existing article has invalid frontmatter.');
  const lines = frontmatter[1].split('\n');
  const matches = lines.flatMap((line, index) => /^(?:description|'description'|"description")[ \t]*:/.test(line) ? [index] : []);
  if (matches.length > 1) throw new Error('Existing article has duplicate description fields.');
  if (!matches.length) return null;
  const start = matches[0];
  const scalar = lines[start].slice(lines[start].indexOf(':') + 1).trim();
  if (start + 1 < lines.length && /^[ \t]+\S/.test(lines[start + 1])) throw new Error('Unsupported description format: multiline YAML.');
  const singleQuoted = scalar.match(/^'((?:[^']|'')*)'$/);
  let value;
  if (singleQuoted) value = singleQuoted[1].replace(/''/g, "'");
  else if (scalar.startsWith('"')) {
    try { value = JSON.parse(scalar); } catch { throw new Error('Unsupported description format: invalid JSON string.'); }
  } else throw new Error('Unsupported description format: expected a quoted string.');
  if (typeof value !== 'string' || !value.trim()) throw new Error('Unsupported description format: expected a nonempty string.');
  return value;
}

export function renderPost(issue, body, sourceHash, existingMarkdown = null) {
  if (!Number.isSafeInteger(issue.number) || issue.number <= 0) throw new Error('Invalid issue number.');
  if (!issue.title?.trim() || !body?.trim()) throw new Error('Title and body are required.');
  if (Number.isNaN(Date.parse(issue.created_at))) throw new Error('Invalid publication date.');
  const fields = { title: issue.title, pubDate: issue.created_at,
    description: issue.title, tags: tagsFor(issue), sourceIssue: issue.number,
    sourceUrl: issue.html_url, sourceHash };
  const description = existingDescriptionField(existingMarkdown);
  if (description !== null) fields.description = description;
  return '---\n' + Object.entries(fields).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n')
    + '\n---\n\n' + body.replace(/\r\n/g, '\n').trim() + '\n';
}

export function verifyArticle(html, sourceHash) {
  const marker = html.match(/<meta\b(?=[^>]*\bname=["']blog:source-hash["'])(?=[^>]*\bcontent=["']([a-f0-9]{64})["'])[^>]*>/i);
  return marker?.[1] === sourceHash;
}
