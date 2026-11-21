#!/usr/bin/env node
/**
 * MIX-1975: pomiar sekcji dowodu na /web-development/custom-app/ w zbudowanym dist (puppeteer).
 *   node .bieg/m1975/probe.mjs <dist> <out> <tag>
 * Szerokości 390 i 1366. Dla każdej: HTML sekcji (do porównania z bazą), liczba „KorepetytorAI”
 * i „studentpi” w całej stronie, linki sekcji (href + status trasy w dist), obrazy (src, naturalne
 * wymiary, atrybuty width/height, czy wczytane), CLS (layout-shift bez wejścia użytkownika) po
 * przewinięciu do sekcji i axe (wcag2a/aa, 21aa, 22aa) całej strony: liczba naruszeń serious/critical.
 * Bez analityki: żądania do /cdn-cgi/zaraz/ i domen analityki są przerywane. Wynik: linia PROBE (JSON)
 * na szerokość, <out>/<tag>-<w>.section.html, <out>/<tag>-<w>.jpg (zrzut sekcji). Kod 0 zawsze.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const [distArg, outArg, tag] = process.argv.slice(2);
const DIST = path.resolve(distArg);
const OUT = path.resolve(outArg);
await fs.mkdir(OUT, { recursive: true });
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36 MixtureE2E/1';
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};
const BLOK =
  /\/cdn-cgi\/zaraz\/|googletagmanager|google-analytics|doubleclick|facebook|hotjar|clarity\.ms/;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/api/')) return res.writeHead(404).end();
  let file = path.join(DIST, decodeURIComponent(url.pathname));
  if (!file.startsWith(DIST)) return res.writeHead(403).end();
  try {
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
  } catch {
    file = path.join(DIST, 'index.html');
  }
  try {
    const body = await fs.readFile(file);
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
for (const vp of [
  { w: 390, h: 844, mobile: true },
  { w: 1366, h: 768, mobile: false },
]) {
  const wynik = { tag, width: vp.w, errors: [] };
  const page = await browser.newPage();
  try {
    await page.setUserAgent(UA);
    await page.setViewport({ width: vp.w, height: vp.h, isMobile: vp.mobile, hasTouch: vp.mobile });
    await page.setRequestInterception(true);
    page.on('request', (r) => (BLOK.test(r.url()) ? r.abort() : r.continue()));
    page.on('pageerror', (e) => wynik.errors.push(String(e).slice(0, 200)));
    await page.evaluateOnNewDocument(() => {
      window.__cls = 0;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(`${origin}/web-development/custom-app/`, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    await page.waitForFunction(
      () => [...document.querySelectorAll('h2')].some((h) => /nie makieta/.test(h.textContent)),
      { timeout: 30000 },
    );
    // Przewijanie krokami do sekcji (leniwe obrazy, leniwe sekcje), potem czekanie na obrazy.
    for (let i = 0; i < 40; i++) {
      const dalej = await page.evaluate(() => {
        const h = [...document.querySelectorAll('h2')].find((x) =>
          /nie makieta/.test(x.textContent),
        );
        const s = h.closest('section');
        const r = s.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.3) return false;
        window.scrollBy(0, Math.round(window.innerHeight * 0.6));
        return true;
      });
      if (!dalej) break;
      await sleep(150);
    }
    await page.evaluate(() => {
      const h = [...document.querySelectorAll('h2')].find((x) => /nie makieta/.test(x.textContent));
      h.closest('section').scrollIntoView({ block: 'start' });
    });
    await sleep(800);
    await page.evaluate(async () => {
      const h = [...document.querySelectorAll('h2')].find((x) => /nie makieta/.test(x.textContent));
      const imgs = [...h.closest('section').querySelectorAll('img')];
      await Promise.all(
        imgs.map((i) =>
          i.complete ? null : new Promise((r) => (i.onload = i.onerror = () => r(null))),
        ),
      );
    });
    await sleep(1500);
    const dane = await page.evaluate(() => {
      const h = [...document.querySelectorAll('h2')].find((x) => /nie makieta/.test(x.textContent));
      const s = h.closest('section');
      const html = document.documentElement.outerHTML;
      return {
        cls: Math.round(window.__cls * 10000) / 10000,
        korepetytor: (html.match(/KorepetytorAI/g) || []).length,
        studentpi: (html.match(/studentpi/gi) || []).length,
        psychon: (s.outerHTML.match(/PsychON/g) || []).length,
        opis: s.querySelector('p')?.textContent ?? '',
        linki: [...s.querySelectorAll('a')].map((a) => [
          a.getAttribute('href'),
          a.textContent.trim(),
        ]),
        obrazy: [...s.querySelectorAll('img')].map((i) => ({
          src: i.getAttribute('src'),
          attrW: i.getAttribute('width'),
          attrH: i.getAttribute('height'),
          naturalW: i.naturalWidth,
          naturalH: i.naturalHeight,
          boxW: Math.round(i.getBoundingClientRect().width),
          boxH: Math.round(i.getBoundingClientRect().height),
          alt: i.getAttribute('alt'),
        })),
        sectionHtml: s.outerHTML,
      };
    });
    await fs.writeFile(path.join(OUT, `${tag}-${vp.w}.section.html`), dane.sectionHtml);
    delete dane.sectionHtml;
    Object.assign(wynik, dane);
    // Status tras z linków: plik w dist (prerender) albo trasa SPA; /portfolio/<slug>/ bez pliku = 404 w praktyce.
    wynik.linkiPliki = await Promise.all(
      dane.linki.map(async ([href]) => {
        try {
          await fs.stat(path.join(DIST, href, 'index.html'));
          return [href, 'plik'];
        } catch {
          return [href, 'brak-pliku'];
        }
      }),
    );
    const sekcja = await page.evaluateHandle(() =>
      [...document.querySelectorAll('h2')]
        .find((x) => /nie makieta/.test(x.textContent))
        .closest('section'),
    );
    await sekcja
      .asElement()
      .screenshot({ path: path.join(OUT, `${tag}-${vp.w}.jpg`), type: 'jpeg', quality: 50 });
    await page.addScriptTag({ path: path.resolve('node_modules/axe-core/axe.min.js') });
    wynik.axe = await page.evaluate(async () => {
      const r = await window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      });
      const ciezkie = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      const h = [...document.querySelectorAll('h2')].find((x) => /nie makieta/.test(x.textContent));
      const s = h.closest('section');
      const wSekcji = r.violations.filter((v) =>
        v.nodes.some((n) =>
          n.target.some((t) => {
            try {
              return s.contains(document.querySelector(t));
            } catch {
              return false;
            }
          }),
        ),
      );
      return {
        seriousCritical: ciezkie.reduce((a, v) => a + v.nodes.length, 0),
        ids: ciezkie.map((v) => `${v.id}:${v.impact}:${v.nodes.length}`),
        wSekcji: wSekcji.map((v) => `${v.id}:${v.impact}`),
      };
    });
  } catch (e) {
    wynik.errors.push(`probe: ${String(e).slice(0, 300)}`);
  }
  console.log(`PROBE ${JSON.stringify(wynik)}`);
  await page.close();
}
await browser.close();
server.close();
