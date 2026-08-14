// Tiny static server for the smoke test that also saves submissions to
// examples/dummy-data/ so you can verify captured values + file references.
// Run: node examples/dev-server.mjs   (from the repo root)
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DUMMY_DIR = join(ROOT, 'examples', 'dummy-data');
const PORT = 4173;

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.map': 'application/json',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/examples/dummy-data/save') {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = Buffer.concat(chunks).toString('utf8');
      const parsed = JSON.parse(body);
      await mkdir(DUMMY_DIR, { recursive: true });
      const name = `submission-${Date.now()}.json`;
      await writeFile(join(DUMMY_DIR, name), JSON.stringify(parsed, null, 2));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, savedTo: `examples/dummy-data/${name}` }));
      console.log('Saved submission ->', name);
      return;
    }

    // Static files (strip query string, prevent path traversal).
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    let filePath = normalize(join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    if (urlPath === '/') filePath = join(ROOT, 'examples', 'smoke-test.html');

    const data = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`DocFill demo server: http://localhost:${PORT}/examples/smoke-test.html`);
  console.log(`Submissions save to: ${DUMMY_DIR}`);
});
