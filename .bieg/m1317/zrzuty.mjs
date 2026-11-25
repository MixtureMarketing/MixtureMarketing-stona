#!/usr/bin/env node
/**
 * MIX-1317: zrzuty K1 dla Jakuba z gotowego buildu (serwer statyczny 127.0.0.1, ruch poza localhost
 * abortowany, UA z dopiskiem MixtureE2E/1). Baner zgód zamykany „Odrzuć opcjonalne”.
 *   node .bieg/m1317/zrzuty.mjs <dist-on>
 * Komputer (1366×900, 1600×900): oś na 35 % wysokości ekranu = stan po przewinięciu (linia
 * narysowana, kroki opacity 1). Telefon (390×844): góra osi na 15 % ekranu (w trakcie przewijania).
 * Wynik: JPEG jako base64 w logu (ZRZUT-START nazwa … ZRZUT-KONIEC nazwa bajty) + opacity kroków.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const DIST = path.resolve(process.argv[2] || 'dist');
const PAGES = [
  '/marketing/google-ads/',
  '/marketing/seo/',
  '/web-development/systemy-ai-aplikacje/',
  '/web-development/custom-app/',
  '/agencja-seo-rzeszow/',
  '/design/branding/',
];
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
const server = http.createServer(async (req, res) => {
  let file = path.join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(DIST)) return res.writeHead(403).end();
  try {
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(await fs.readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 MixtureE2E/1';
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let bledy = 0;
for (const p of PAGES) {
  const slug = p.replace(/\//g, '-').replace(/^-|-$/g, '');
  for (const [w, h, frac, mob] of [[1366, 900, 0.35, false], [1600, 900, 0.35, false], [390, 844, 0.15, true]]) {
    const page = await browser.newPage();
    try {
      await page.setUserAgent(UA);
      await page.setRequestInterception(true);
      page.on('request', (r) => (r.url().startsWith(ORIGIN) || r.url().startsWith('data:') ? r.continue() : r.abort()));
      await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob });
      await page.goto(ORIGIN + p, { waitUntil: 'networkidle0', timeout: 60000 });
      await sleep(800);
      const zamkniety = await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Odrzuć opcjonalne'));
        if (b) b.click();
        return !!b;
      });
      await sleep(600);
      await page.evaluate((frac) => {
        const k = document.querySelector('[data-k1]');
        const top = k.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: Math.max(0, top - window.innerHeight * frac), behavior: 'instant' });
      }, frac);
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      await sleep(500);
      const op = await page.evaluate(() => [...document.querySelectorAll('[data-k1] .mm-k1-tresc')].map((e) => Number(getComputedStyle(e).opacity).toFixed(2)).join(','));
      const buf = await page.screenshot({ type: 'jpeg', quality: 70 });
      console.log(`INFO ${slug}-${w} baner_zamkniety=${zamkniety} opacity=${op}`);
      console.log(`ZRZUT-START ${slug}-${w}`);
      console.log(Buffer.from(buf).toString('base64'));
      console.log(`ZRZUT-KONIEC ${slug}-${w} ${buf.length}`);
    } catch (e) {
      bledy++;
      console.log(`BLAD ${slug}-${w} ${String(e).slice(0, 200)}`);
    }
    await page.close();
  }
}
await browser.close();
server.close();
console.log(`ZRZUTY koniec bledy=${bledy}`);
process.exit(bledy ? 1 : 0);
