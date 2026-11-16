// MIX-1678: zrzuty i pomiary kafelków kalkulatora (przed = port B, po = port A), 360/375/390/412/768/1280,
// suwaki domyślne i maksymalne. Pomiar na kafelek: linie wartości (oczekiwane 1), linie etykiety (<= 2),
// różnica wysokości w rzędzie (<= 2 px), przepełnienie. axe na stronie (serious/critical).
//   node .bieg/mix1678/shots.mjs <portPo> <portPrzed>   OUT=.bieg/mix1678/out
// PNG wracają w logu jako `BIEG:PNG <nazwa> <base64>`; dekoduje .bieg/mix1678/dekoduj.py.
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

const ports = { after: process.argv[2] || '4412', before: process.argv[3] || '4411' };
const OUT = process.env.OUT || '.bieg/mix1678/out';
const URLP = '/marketing/google-ads/';
fs.mkdirSync(OUT, { recursive: true });
const axeSrc = fs.readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const WIDTHS = [360, 375, 390, 412, 768, 1280];
const MAX = { budget: 50000, cpc: 0.5, cr: 5, aov: 5000 };
let bad = 0;
const axeBase = new Map();

async function measure(page) {
  return page.evaluate(() => {
    const h3 = [...document.querySelectorAll('h3')].find((h) =>
      h.textContent.includes('Twoje założenia'),
    );
    const panel = h3.parentElement.parentElement.lastElementChild;
    const grid = panel.querySelector(':scope > div.grid');
    const lines = (el) => {
      const tops = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent.trim()) continue;
        const r = document.createRange();
        r.selectNodeContents(n);
        for (const rect of r.getClientRects()) {
          if (rect.height < 1) continue;
          const mid = rect.top + rect.height / 2;
          if (!tops.some((t) => Math.abs(t - mid) < rect.height * 0.5)) tops.push(mid);
        }
      }
      return tops.length;
    };
    const tiles = [...grid.children].map((t) => {
      const b = t.getBoundingClientRect();
      const label = t.firstElementChild;
      const value = t.lastElementChild;
      return {
        label: label.textContent.trim().slice(0, 24),
        value: value.textContent.trim(),
        top: Math.round(b.top + window.scrollY),
        h: b.height,
        w: Math.round(b.width),
        valueLines: lines(value),
        labelLines: lines(label),
        overflow: t.scrollWidth > t.clientWidth + 1 || value.scrollWidth > value.clientWidth + 1,
      };
    });
    const rows = {};
    for (const t of tiles) (rows[t.top] ||= []).push(t);
    let rowDiff = 0;
    for (const r of Object.values(rows)) {
      const hs = r.map((t) => t.h);
      rowDiff = Math.max(rowDiff, Math.max(...hs) - Math.min(...hs));
    }
    return { tiles, rowDiff, sw: document.documentElement.scrollWidth, iw: window.innerWidth };
  });
}

async function setMax(page) {
  await page.evaluate((MAX) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    for (const [id, v] of Object.entries(MAX)) {
      const el = document.querySelector(`input[aria-labelledby="${id}-label"]`);
      setter.call(el, String(v));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, MAX);
  await sleep(300);
}

async function run(which, w, state) {
  const page = await browser.newPage();
  await page.setViewport({
    width: w,
    height: 900,
    isMobile: w < 768,
    hasTouch: w < 768,
    deviceScaleFactor: 1,
  });
  await page
    .goto(`http://127.0.0.1:${ports[which]}${URLP}`, { waitUntil: 'networkidle0', timeout: 90000 })
    .catch(() => {});
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll('h3')].some((h) => h.textContent.includes('Twoje założenia')),
    { timeout: 60000 },
  );
  await page.evaluate(() => {
    const h3 = [...document.querySelectorAll('h3')].find((h) =>
      h.textContent.includes('Twoje założenia'),
    );
    h3.scrollIntoView({ block: 'start' });
  });
  await sleep(1200);
  if (state === 'max') await setMax(page);
  const m = await measure(page);
  const tag = `${which}-${w}-${state}`;
  const fail = [];
  for (const t of m.tiles) {
    if (which === 'after') {
      if (t.valueLines !== 1) fail.push(`${t.label} wartosc ${t.valueLines} linii`);
      if (t.labelLines > 2) fail.push(`${t.label} etykieta ${t.labelLines} linii`);
      if (t.overflow) fail.push(`${t.label} przepelnienie`);
    }
  }
  if (which === 'after' && m.rowDiff > 2) fail.push(`rowDiff ${m.rowDiff}`);
  if (which === 'after' && m.sw > m.iw) fail.push(`scrollWidth ${m.sw}>${m.iw}`);
  console.log(
    `${tag}: rowDiff ${m.rowDiff.toFixed(1)} sw ${m.sw}/${m.iw} | ` +
      m.tiles
        .map(
          (t) =>
            `[${t.label.slice(0, 10)} "${t.value}" w${t.w} v${t.valueLines} l${t.labelLines}${t.overflow ? ' OVF' : ''}]`,
        )
        .join(' ') +
      (fail.length ? ` => ${which === 'after' ? 'NIE' : 'ref'}: ${fail.join('; ')}` : ' => OK'),
  );
  if (fail.length && which === 'after') bad++;
  // axe: przed i po (375 i 1280); błąd = serious/critical po zmianie, którego nie było przed zmianą (ten sam id i cel)
  if (w === 375 || w === 1280) {
    await page.addScriptTag({ content: axeSrc });
    const res = await page.evaluate(() =>
      window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      }),
    );
    const sc = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    const keys = sc.map((v) => `${v.id} ${v.nodes[0]?.target?.join(' ')}`);
    console.log(`axe ${tag}: naruszen ${res.violations.length}, serious/critical ${sc.length}`);
    for (const k of keys) console.log(`  axe serious/critical ${k}`);
    const base = `${w}-${state}`;
    if (which === 'before') axeBase.set(base, new Set(keys));
    else {
      const novel = keys.filter((k) => !axeBase.get(base)?.has(k));
      console.log(`axe ${tag}: nowych wzgledem przed zmiana ${novel.length}`);
      if (novel.length) bad++;
    }
  }
  // zrzut panelu wyników (bez lepkich pasków i banera)
  await page.addStyleTag({
    content: 'header, [class*="fixed"], [class*="sticky"] { visibility: hidden !important; }',
  });
  await page.evaluate(() => {
    const h3 = [...document.querySelectorAll('h3')].find((h) =>
      h.textContent.includes('Twoje założenia'),
    );
    h3.parentElement.parentElement.lastElementChild.scrollIntoView({ block: 'center' });
  });
  await sleep(500);
  const panelHandle = await page.evaluateHandle(() => {
    const h3 = [...document.querySelectorAll('h3')].find((h) =>
      h.textContent.includes('Twoje założenia'),
    );
    return h3.parentElement.parentElement.lastElementChild;
  });
  const file = path.join(OUT, `${tag}.png`);
  await panelHandle.asElement().screenshot({ path: file });
  console.log(`png ${file} ${fs.statSync(file).size} B`);
  console.log(`BIEG:PNG ${tag}.png ${fs.readFileSync(file).toString('base64')}`);
  await page.close();
}

for (const which of ['before', 'after'])
  for (const w of WIDTHS) for (const state of ['default', 'max']) await run(which, w, state);
await browser.close();
console.log(bad ? `SHOTS: NIE (${bad} problemow)` : 'SHOTS: OK');
process.exit(bad ? 1 : 0);
