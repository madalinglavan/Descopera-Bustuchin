const fs = require('fs');
const http = require('http');
const path = require('path');
const assert = require('assert/strict');
const { chromium } = require('C:/Users/Bustuchin03/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
process.chdir(path.resolve(__dirname, '..'));
const mode = 'integrations';
const out = path.join('.codex-backups', 'improvements-2026-10-28', 'checks');
fs.mkdirSync(out, { recursive: true });
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.geojson': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const file = path.resolve('.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname === '/' ? '/index.html' : new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(process.cwd() + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    res.writeHead(error ? 404 : 200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(error ? '' : data);
  });
});
(async () => {
 await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
 const browser = await chromium.launch({ channel: 'msedge', headless: true });
 const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
 const page = await context.newPage();
 const errors = [], responses = [], failedRequests = [];
 page.on('requestfailed', request => {
  if (/leaflet|api.openweathermap/.test(request.url())) failedRequests.push({ url: request.url().replace(/appid=[^&]+/, 'appid=REDACTED'), failure: request.failure()?.errorText });
 });
 page.on('pageerror', error => errors.push(error.message));
 page.on('response', response => {
  if (/leaflet|api.openweathermap|bustuchin-boundary/.test(response.url())) responses.push({ url: response.url().replace(/appid=[^&]+/, 'appid=REDACTED'), status: response.status() });
 });
 try {
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  const map = await page.locator('#bustuchinMap.leaflet-container').count() > 0;
  const markers = await page.locator('.community-marker').count();
  if (map) {
   await page.locator('#mapActivate').evaluate(e => e.click());
   assert(await page.locator('#mapInteraction').evaluate(e => e.classList.contains('is-active')));
   await page.locator('#mapSearch').fill('Pojaru');
   await page.waitForTimeout(500);
   assert((await page.locator('#mapResultsCount').textContent()).includes('loc'));
   await page.locator('#mapDeactivate').evaluate(e => e.click());
  }
  await page.screenshot({ path: path.join(out, 'online-desktop.png') });
  await page.evaluate(() => window.navigateBustuchinToHash('#istorie'));
  await page.waitForTimeout(1200);
  const navigationTop = await page.locator('#istorie').evaluate(e => e.getBoundingClientRect().top);
  await page.screenshot({ path: path.join(out, 'online-reading.png') });
  const sw = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return false;
    const registration = await Promise.race([navigator.serviceWorker.ready, new Promise(resolve => setTimeout(() => resolve(null), 12000))]);
    return Boolean(registration && navigator.serviceWorker.controller);
  });
  let offline = false;
  if (sw) {
   await context.setOffline(true);
   await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
   await page.waitForTimeout(1500);
   offline = await page.locator('.reading-tools').count() === 1 && await page.locator('.chapter-guide').count() === 1;
   assert(offline);
   assert.equal(await page.locator('.community-marker').count(), 40);
   await page.locator('.chapter-guide').evaluate(e => e.click());
   await page.locator('.site-search input').fill('Bustuchin');
   assert(await page.locator('.site-search__result').count() > 0);
  }
  const result = { map, markers, navigationTop, sw, offline, errors, responses, failedRequests };
  fs.writeFileSync(path.join(out, 'integrations.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
  assert.deepEqual(errors, []);
 } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
