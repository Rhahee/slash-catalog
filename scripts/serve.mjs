// Development-only static file server. No application API or dependencies.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const testMode = args.includes('--test');
const portIndex = args.lastIndexOf('--port');
const port = portIndex >= 0 ? Number(args[portIndex + 1]) : 4173;
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Use --port followed by a port from 1 to 65535.');
const routes = new Map([
  ['/', 'index.html'], ['/index.html', 'index.html'], ['/styles.css', 'styles.css'],
  ['/app.js', 'app.js'], ['/catalog.js', 'catalog.js'], ['/i18n.js', 'i18n.js'],
  ['/favicon.svg', 'favicon.svg'], ['/data/catalog.json', 'data/catalog.json']
]);
// Explicit asset allowlist; never expose arbitrary workspace files.
for (const id of ['metaads', '3dbillboard', 'showcase', 'ugcmodel', 'miniature', 'storybook']) {
  routes.set(`/assets/examples/${id}.png`, `assets/examples/${id}.png`);
}
const types = {'.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png'};
const server = http.createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, {Allow: 'GET, HEAD'}).end(); return;
  }
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    let file = routes.get(pathname);
    const fixturePage = testMode && pathname === '/__test/';
    const failurePage = testMode && pathname === '/__test/error';
    if (fixturePage || failurePage) file = 'index.html';
    const fixtureData = testMode && pathname === '/__test/fixture.json';
    if (fixtureData) {
      const {fixtureCatalog} = await import('../tests/fixtures.mjs');
      response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'});
      response.end(request.method === 'HEAD' ? undefined : JSON.stringify(fixtureCatalog()));
      return;
    }
    if (!file) { response.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'}).end('Not found'); return; }
    let content = await readFile(path.join(root, file));
    if (fixturePage || failurePage) {
      content = content.toString().replaceAll('href="./', 'href="/').replaceAll('src="./', 'src="/').replace('data-catalog-source="./data/catalog.json"', `data-catalog-source="${failurePage ? '/__test/missing.json' : '/__test/fixture.json'}"`);
      content = content.replace('<header class="site-header">', '<div class="fixture-banner">TEST FIXTURES ONLY · Synthetic entries, not real ChatGPT commands</div><header class="site-header">');
    }
    const mime = types[path.extname(file)];
    response.writeHead(200, {'Content-Type': mime === 'image/png' ? mime : `${mime}; charset=utf-8`, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'});
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'}).end('Unable to serve file');
  }
});
server.on('error', error => { console.error(`Server could not start: ${error.message}`); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/${testMode ? '\nFixture preview: http://127.0.0.1:' + port + '/__test/' : ''}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
