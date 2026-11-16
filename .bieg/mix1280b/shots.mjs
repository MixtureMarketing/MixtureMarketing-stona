// MIX-1280 b: zrzuty (375, 768, 1280), axe (serious/critical), CLS, przepelnienie poziome, reduced-motion.
//   node .bieg/mix1280b/shots.mjs <port> [OUT=.bieg/mix1280b/out]. Zrzuty 375 i 1280 wypisuje tez jako base64 w logu
//   (BIEG:PNG <nazwa> <b64>), bo z maszyny puli wraca tylko log; dekoduje .bieg/mix1280b/dekoduj.py.
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

const port = process.argv[2] || '4401';
const OUT = process.env.OUT || '.bieg/mix1280b/out';
const URLP = '/baza-wiedzy/aplikacje-dedykowane-z-ai-kiedy-warto/';
fs.mkdirSync(OUT, { recursive: true });
const axeSrc = fs.readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let bad = 0;

async function run(w, h, mobile, reduce) {
  const tag = `${w}${reduce ? '-reduced' : ''}`;
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  if (reduce) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.evaluateOnNewDocument(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(`http://127.0.0.1:${port}${URLP}`, { waitUntil: 'networkidle0', timeout: 90000 }).catch(() => {});
  await sleep(1500);
  if (reduce) {
    // bez przewijania: wszystkie infografiki w stanie końcowym (opacity 1, zero ruchu)
    const r = await page.evaluate(() =>
      [...document.querySelectorAll('[data-infographic] svg g, [data-infographic] li')].map(
        (e) => getComputedStyle(e).opacity,
      ),
    );
    const notOne = r.filter((o) => Number(o) < 0.99).length;
    console.log(`reduced ${tag}: elementow ${r.length}, opacity<1: ${notOne}`);
    if (notOne > 0) bad++;
  } else {
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(h * 0.5)) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await sleep(260);
    }
    await sleep(1200);
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);
  }
  const m = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    iw: window.innerWidth,
    cls: window.__cls,
    infos: document.querySelectorAll('[data-infographic]').length,
    svgs: document.querySelectorAll('[data-infographic] svg[role="img"][aria-label]').length,
    anim: document.querySelectorAll('div.duration-700.ease-out.transform').length,
  }));
  console.log(`page ${tag}: scrollWidth ${m.sw} / innerWidth ${m.iw}, CLS ${m.cls.toFixed(4)}, infografik ${m.infos}, svg z role+label ${m.svgs}, AnimateOnScroll ${m.anim}`);
  if (m.sw > m.iw) bad++;
  if (m.infos < 3) bad++;
  if (!reduce) {
    await page.addScriptTag({ content: axeSrc });
    const res = await page.evaluate(() =>
      window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } }),
    );
    const sc = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    console.log(`axe ${tag}: naruszen ${res.violations.length}, serious/critical ${sc.length}`);
    for (const v of res.violations) console.log(`  axe ${v.impact} ${v.id} (${v.nodes.length}) ${v.nodes[0]?.target?.join(' ')}`);
    if (sc.length) bad++;
    const file = path.join(OUT, `ai-${w}.png`);
    await page.screenshot({ path: file, fullPage: true });
    const size = fs.statSync(file).size;
    console.log(`png ${file} ${size} B`);
    if (w !== 768) console.log(`BIEG:PNG ai-${w}.png ${fs.readFileSync(file).toString('base64')}`);
    // zrzut samych infografik (czytelność)
    const els = await page.$$('[data-infographic]');
    let i = 0;
    for (const el of els) {
      const f = path.join(OUT, `ai-${w}-info${++i}.png`);
      await el.screenshot({ path: f }).catch(() => {});
    }
  }
  if (reduce) await page.screenshot({ path: path.join(OUT, `ai-${w}-reduced.png`), fullPage: true });
  await page.close();
}

await run(375, 800, true, false);
await run(768, 1024, false, false);
await run(1280, 800, false, false);
await run(375, 800, true, true);
await browser.close();
console.log(bad ? `SHOTS: NIE (${bad} problemow)` : 'SHOTS: OK');
process.exit(bad ? 1 : 0);
