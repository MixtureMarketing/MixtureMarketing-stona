// MIX-1589 r4: czy /baza-wiedzy/ pyta Sanity po starcie? Liczy żądania do hostów sanity w jednym wczytaniu (mobile, CPU 4x).
//   node .bieg/m1589/req-probe.mjs <port> <ścieżka>
import puppeteer from 'puppeteer';
const [port, p] = process.argv.slice(2);
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 823, isMobile: true, hasTouch: true, deviceScaleFactor: 1.75 });
const urls = [];
page.on('request', (r) => urls.push(r.url()));
await page.goto(`http://127.0.0.1:${port}${p}`, { waitUntil: 'networkidle0', timeout: 90000 }).catch(() => {});
await new Promise((r) => setTimeout(r, 2500));
const snap = await page.evaluate(() => { const e = document.getElementById('cms-snapshot'); return e ? e.textContent.length : -1; });
const sanity = urls.filter((u) => /sanity/i.test(u));
console.log(`req ${p}: żądań ${urls.length}, do sanity ${sanity.length}${sanity.length ? ' np. ' + sanity[0].slice(0, 90) : ''}; cms-snapshot w DOM: ${snap} znaków; kart h3: ${await page.$$eval('h3', (x) => x.length)}`);
await browser.close();
