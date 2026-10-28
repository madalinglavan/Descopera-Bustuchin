const fs = require('fs');
const http = require('http');
const path = require('path');
const assert = require('assert/strict');
const { chromium } = require('C:/Users/Bustuchin03/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
process.chdir(path.resolve(__dirname, '..'));
const mode = 'contrast';
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
 try {
  for (const width of [1440, 414]) {
   const page = await browser.newPage({ viewport: { width, height: 896 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
   await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
   await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'load' });
   await page.addStyleTag({content:'*,*::before,*::after { transition: none !important; animation: none !important; }'});
   await page.locator('[data-reading-mode]').evaluate(e => e.click());
   await page.evaluate(() => {
     document.querySelectorAll('main .reveal,main .history-card').forEach(e => e.classList.add('active'));
     document.querySelectorAll('main details').forEach(e => e.open = true);
   });
   await page.waitForTimeout(400);
   const report = await page.evaluate(() => {
    const rgba = value => { const a = value.match(/[\d.]+/g)?.map(Number) || [0,0,0]; return [a[0],a[1],a[2],a[3] ?? 1]; };
    const blend = (a,b) => a.slice(0,3).map((v,i) => v*a[3]+b[i]*(1-a[3]));
    const lum = c => c.slice(0,3).map(v => { v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4; }).reduce((s,v,i) => s+v*[.2126,.7152,.0722][i],0);
    const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
    const failures = [], seen = new Set(); let text, checked = 0;
    while (text = walker.nextNode()) {
     const e=text.parentElement;
     if (!text.textContent.trim() || e.closest('#hero,script,style,[aria-disabled="true"],button:disabled') || !e.checkVisibility({ checkOpacity:true, checkVisibilityCSS:true })) continue;
     const style=getComputedStyle(e);
     if (style.clip !== 'auto' || style.clipPath !== 'none') continue; // Screen-reader-only labels are not visual text.
     const chain=[];
     for(let p=e;p;p=p.parentElement)chain.unshift(p);
     let bg=[255,255,255],surface='',image=false;
     chain.forEach(p=>{const s=getComputedStyle(p), c=rgba(s.backgroundColor);bg=blend(c,bg);if(c[3]>.5)surface=p.id?'#'+p.id:p.className;if(s.backgroundImage!=='none')image=true;});
     const fg=blend(rgba(style.color),bg),l1=lum(fg),l2=lum(bg),ratio=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
     const large=parseFloat(style.fontSize)>=24 || (parseFloat(style.fontSize)>=18.66 && Number(style.fontWeight)>=700);
     checked++;
     if(ratio < (large?3:4.5)) {
      const key=surface+'|'+e.className+'|'+style.color;
      if(!seen.has(key)){ seen.add(key); failures.push({tag:e.tagName,class:e.className,id:e.id,parents:chain.slice(-5).map(p => p.id || p.className || p.tagName),surface,color:style.color,bg:bg.map(Math.round),ratio:+ratio.toFixed(2),image,text:text.textContent.trim().slice(0,100)}); }
     }
    }
    return { checked, failures };
   });
   fs.writeFileSync(path.join(out, `contrast-${width}.json`),JSON.stringify(report,null,2));
   console.log(JSON.stringify({width,checked:report.checked,failures:report.failures}));
   await page.locator('#societate-proprietate').evaluate(e => window.scrollTo({top:e.getBoundingClientRect().top+scrollY-window.bustuchinReadingOffset(),behavior:'instant'}));
   await page.waitForTimeout(200);
   await page.screenshot({path:path.join(out,`contrast-history-${width}.png`)});
   await page.locator('.transformation-atlas').evaluate(e => window.scrollTo({top:e.getBoundingClientRect().top+scrollY-window.bustuchinReadingOffset(),behavior:'instant'}));
   await page.screenshot({path:path.join(out,`contrast-transformation-${width}.png`)});
   for (const [name,selector] of [['industry','#industrie-altadata'],['culture','.culture-hero'],['tourism','.tourism-portal__feature']]) {
     await page.locator(selector).evaluate(e => window.scrollTo({top:e.getBoundingClientRect().top+scrollY-window.bustuchinReadingOffset(),behavior:'instant'}));
     await page.screenshot({path:path.join(out,`contrast-${name}-${width}.png`)});
   }
   assert.equal(report.failures.length, 0, `Low-contrast text at ${width}px; inspect contrast-${width}.json`);
   await page.close();
  }
 } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
