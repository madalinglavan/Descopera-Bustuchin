const fs = require('fs');
const http = require('http');
const path = require('path');
const assert = require('assert/strict');
const { chromium } = require('C:/Users/Bustuchin03/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
process.chdir(path.resolve(__dirname, '..'));
const mode = 'improvements';
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
  const results = {};
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      // External services are outside this deterministic local regression check.
      await page.route('**/*', route => {
        const url = new URL(route.request().url());
        return url.hostname === '127.0.0.1' && !url.pathname.endsWith('/vendor/leaflet/leaflet.js') ? route.continue() : route.abort();
      });
      await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'load' });
      await page.waitForTimeout(1200);
      const structure = await page.evaluate(() => ({
        headings: [...document.querySelectorAll('h1,h2,h3')].map(e => e.textContent.trim()),
        controls: document.querySelectorAll('button,input,select,iframe').length,
        deadComponents: document.querySelectorAll('.media-card,.heritage-slide,.heritage-slider').length,
        brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].map(e => e.getAttribute('href')).filter(h => h !== '#' && !document.getElementById(decodeURIComponent(h.slice(1))))
      }));
      const styles = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => !['SCRIPT', 'STYLE'].includes(e.tagName)).map(e => {
        const s = getComputedStyle(e);
        return [e.tagName, e.id, s.display, s.position, s.color, s.backgroundColor, s.fontSize, s.gridTemplateColumns];
      }));
      await page.screenshot({ path: path.join(out, `${mode}-${width}.png`) });
      const checks = [];
      const check = async (name, fn) => { await fn(); checks.push(name); };
      await check('hero video opens and Escape closes', async () => {
        await page.evaluate(() => document.getElementById('playVideoBtn').click());
        assert(await page.locator('#hero').evaluate(e => e.classList.contains('is-video-playing')));
        await page.keyboard.press('Escape');
        assert(!(await page.locator('#hero').evaluate(e => e.classList.contains('is-video-playing'))));
      });
      await check('internal navigation and transition', async () => {
        await page.evaluate(() => document.querySelector('a[href="#istorie"]').click());
        await page.waitForTimeout(900);
        assert.equal(new URL(page.url()).hash, '#istorie');
        assert.equal(await page.locator('#pageTransition').getAttribute('aria-hidden'), 'true');
      });
      if (width === 390) await check('mobile menu toggles', async () => {
        await page.locator('#menuToggle').click();
        assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'), 'true');
        await page.locator('#menuToggle').click();
        assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'), 'false');
      });
      await check('magazine edition selection', async () => {
        await page.evaluate(() => document.querySelectorAll('.magazine-edition')[1].click());
        assert.equal(await page.locator('.magazine-edition.active').count(), 1);
        assert((await page.locator('#magazineViewer').getAttribute('src')).includes('.pdf'));
      });
      await check('facility filtering', async () => {
        const filter = await page.locator('[data-facility-filter]').nth(1).getAttribute('data-facility-filter');
        await page.locator('[data-facility-filter]').nth(1).evaluate(e => e.click());
        assert(await page.evaluate(filter => [...document.querySelectorAll('[data-facility]')].every(e => e.hidden === (e.dataset.facility !== filter)), filter));
      });
      await check('search opens, filters and closes', async () => {
        await page.locator('.chapter-guide').evaluate(e => e.click());
        await page.locator('.site-search input').fill('Bustuchin');
        assert(await page.locator('.site-search__result').count() > 0);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(250);
        assert(await page.locator('.site-search').evaluate(e => e.hidden));
      });
      await check('senior gallery advances', async () => {
        const old = await page.locator('.senior-gallery__controls b').textContent();
        await page.locator('[data-senior-next]').evaluate(e => e.click());
        assert.notEqual(await page.locator('.senior-gallery__controls b').textContent(), old);
      });
      await check('installation instructions open and close', async () => {
        await page.locator('#installAppButton').evaluate(e => e.click());
        assert(await page.locator('#installAppDialog').evaluate(e => e.open));
        await page.keyboard.press('Escape');
        assert(!(await page.locator('#installAppDialog').evaluate(e => e.open)));
      });
      await check('nature audio starts and stops', async () => {
        await page.locator('.ambient-toggle').evaluate(e => e.click());
        await page.locator('[data-sound-mode="nature"]').evaluate(e => e.click());
        assert.equal(await page.locator('.ambient-toggle').getAttribute('aria-pressed'), 'true');
        await page.locator('[data-sound-stop]').evaluate(e => e.click());
        assert.equal(await page.locator('.ambient-toggle').getAttribute('aria-pressed'), 'false');
      });
      await check('discovery fact expands', async () => {
        await page.locator('.discovery-fact__button').first().evaluate(e => e.click());
        assert.equal(await page.locator('.discovery-fact__button').first().getAttribute('aria-expanded'), 'true');
      });
      await check('missing PDFs explicitly disabled and available edition retained', async () => {
        assert.equal(await page.locator('.magazine-edition:disabled').count(), 21);
        assert.equal(await page.locator('.magazine-edition:not(:disabled)').count(), 1);
        assert.equal(await page.locator('a[data-unavailable-href][href]').count(), 0);
      });
      await check('full text search, highlights, chapter filtering and focus trap', async () => {
        await page.locator('.chapter-guide').evaluate(e => e.click());
        await page.locator('.site-search input').fill('subterane');
        await page.locator('.search-chapter-filter').selectOption('geografie');
        assert(await page.locator('.site-search__result').count() > 0);
        assert(await page.locator('.site-search mark').count() > 0);
        assert(await page.locator('.site-search__result small').evaluateAll(es => es.every(e => e.textContent === 'Geografie')));
        await page.locator('.site-search__close').focus();
        await page.keyboard.press('Shift+Tab');
        assert(await page.locator('.site-search__result').last().evaluate(e => e === document.activeElement));
        await page.keyboard.press('Escape');
        await page.waitForTimeout(250);
      });
      await check('reading size and bookmarks persist across reload', async () => {
        const originalFont = await page.locator('.section-block__text').first().evaluate(e => parseFloat(getComputedStyle(e).fontSize));
        await page.locator('.reading-tools select').selectOption('125');
        assert.equal(await page.locator('html').getAttribute('data-reading-size'), '125');
        const enlargedFont = await page.locator('.section-block__text').first().evaluate(e => parseFloat(getComputedStyle(e).fontSize));
        assert(Math.abs(enlargedFont / originalFont - 1.25) < .02);
        await page.locator('#istorie .chapter-bookmark').evaluate(e => e.click());
        assert.equal(await page.locator('#istorie .chapter-bookmark').getAttribute('aria-pressed'), 'true');
        await page.evaluate(() => window.navigateBustuchinToHash('#geografie'));
        await page.waitForTimeout(1000);
        await page.locator('[data-save-position]').evaluate(e => e.click());
        assert.equal(JSON.parse(await page.evaluate(() => localStorage.getItem('bustuchin-reading-position'))).id, 'geografie');
        const manualPosition = await page.evaluate(() => localStorage.getItem('bustuchin-reading-position'));
        await page.evaluate(() => window.navigateBustuchinToHash('#religie'));
        await page.waitForTimeout(900);
        assert.equal(await page.evaluate(() => localStorage.getItem('bustuchin-reading-position')), manualPosition);
        await page.reload({ waitUntil: 'load' });
        await page.waitForTimeout(1000);
        assert.equal(await page.locator('html').getAttribute('data-reading-size'), '125');
        assert.equal(await page.locator('#istorie .chapter-bookmark').getAttribute('aria-pressed'), 'true');
        assert(!(await page.locator('[data-resume]').evaluate(e => e.hidden)));
        await page.locator('[data-resume]').evaluate(e => e.click());
        await page.waitForTimeout(900);
        assert.equal(new URL(page.url()).hash, '#geografie');
        const restored = await page.evaluate(() => {
          const saved = JSON.parse(localStorage.getItem('bustuchin-reading-position'));
          const rect = document.getElementById(saved.anchor).getBoundingClientRect();
          return rect.top + rect.height * saved.fraction - window.bustuchinReadingOffset() - (saved.before || 0);
        });
        assert(Math.abs(restored) < 5);
        await page.locator('[data-reading-mode]').evaluate(e => e.click());
        await page.waitForTimeout(450);
        assert(await page.locator('html').evaluate(e => e.classList.contains('book-reading')));
        assert.equal(await page.locator('#geografie .section-block__text').first().evaluate(e => getComputedStyle(e).color), 'rgb(51, 44, 35)');
        await page.locator('[data-reading-mode]').evaluate(e => e.click());
        assert(!(await page.locator('html').evaluate(e => e.classList.contains('book-reading'))));
        await page.locator('[data-clear-reading]').evaluate(e => e.click());
        assert.equal(await page.evaluate(() => localStorage.getItem('bustuchin-bookmarks')), null);
        assert.equal(await page.locator('#istorie .chapter-bookmark').getAttribute('aria-pressed'), 'false');
      });
      await check('map fallback lists working anchors and routes', async () => {
        assert(await page.locator('.map-directory a[href^="#"]').count() > 25);
        assert.equal(await page.locator('.map-directory a[href^="#"]').evaluateAll(es => es.filter(e => !document.getElementById(e.hash.slice(1))).map(e => e.hash)).then(es => es.length), 0);
        assert(await page.locator('.map-directory a[href^="https://www.google.com/maps/dir/"]').count() > 25);
      });
      assert.deepEqual(errors, []);
      const toolbar = await page.locator('.reading-tools').boundingBox();
      const navbar = await page.locator('#navbar').boundingBox();
      assert(Math.abs(toolbar.y - (navbar.y + navbar.height)) < 3);
      assert.equal(Math.round(toolbar.width), width);
      assert(toolbar.height < 110);
      assert(await page.locator('.reading-tools').evaluate(e => e.scrollWidth <= innerWidth));
      await page.evaluate(() => window.navigateBustuchinToHash('#istorie'));
      await page.waitForTimeout(800);
      await page.locator('[data-reading-mode]').evaluate(e => e.click());
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(out, `reading-${width}.png`) });
      results[width] = { errors, structure, styles, checks };

      await page.close();
    }
    const hardened = await browser.newPage();
    const storageErrors = [];
    hardened.on('pageerror', error => storageErrors.push(error.message));
    await hardened.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    await hardened.addInitScript(() => {
      Storage.prototype.getItem = () => { throw new DOMException('Storage disabled', 'SecurityError'); };
      Storage.prototype.setItem = () => { throw new DOMException('Storage disabled', 'SecurityError'); };
    });
    await hardened.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'load' });
    assert.equal(await hardened.locator('.reading-tools').count(), 1);
    await hardened.locator('.chapter-guide').evaluate(e => e.click());
    await hardened.locator('.site-search input').fill('Bustuchin');
    assert(await hardened.locator('.site-search__result').count() > 0);
    assert.deepEqual(storageErrors, []);
    await hardened.close();
    const recordedWeather = path.join('.codex-backups', 'improvements-2026-10-28', 'weather');
    if (fs.existsSync(path.join(recordedWeather, 'weather.json'))) {
      const weatherPage = await browser.newPage();
      const weatherErrors = [];
      weatherPage.on('pageerror', error => weatherErrors.push(error.message));
      await weatherPage.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.hostname === 'api.openweathermap.org') {
          const endpoint = url.pathname.endsWith('/forecast') ? 'forecast' : 'weather';
          return route.fulfill({ status: 200, contentType: 'application/json', body: fs.readFileSync(path.join(recordedWeather, `${endpoint}.json`)) });
        }
        return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
      });
      await weatherPage.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'load' });
      await weatherPage.locator('.weather-card').first().waitFor({ state: 'attached' });
      assert.equal(await weatherPage.locator('.weather-card').count(), 3);
      assert((await weatherPage.locator('.weather-current__temp').textContent()).includes('°C'));
      await weatherPage.locator('[data-reading-mode]').evaluate(e => e.click());
      await weatherPage.waitForTimeout(450);
      for (const selector of ['.weather-current__temp','.weather-detail__value','.weather-detail__label','.weather-card__temperatures strong','.weather-desc','.weather-forecast__heading span']) {
        const color = await weatherPage.locator(selector).first().evaluate(e => getComputedStyle(e).color);
        assert(['rgb(64, 54, 41)', 'rgb(89, 76, 57)'].includes(color), `${selector}: ${color}`);
      }
      await weatherPage.setViewportSize({ width: 414, height: 896 });
      await weatherPage.locator('#weatherCurrent').evaluate(e => window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - window.bustuchinReadingOffset(), behavior: 'instant' }));
      await weatherPage.waitForTimeout(250);
      await weatherPage.screenshot({ path: path.join(out, 'reader-weather-414.png') });
      assert.deepEqual(weatherErrors, []);
      await weatherPage.close();
    }
    fs.writeFileSync(path.join(out, `${mode}.json`), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(Object.fromEntries(Object.entries(results).map(([w, r]) => [w, { errors: r.errors, checks: r.checks, brokenAnchors: r.structure.brokenAnchors, deadComponents: r.structure.deadComponents }]))));
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
