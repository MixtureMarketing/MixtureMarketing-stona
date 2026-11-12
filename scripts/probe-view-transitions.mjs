#!/usr/bin/env node
/**
 * MIX-1308: próba przejść A1 (lista /portfolio/ → realizacja) i A2 (karta realizacji na
 * /web-development/ i w „Powiązanych” → realizacja) na dwóch lokalnych budowach.
 *
 *   node scripts/probe-view-transitions.mjs <dist-wlaczony> <dist-wylaczony> <katalog-wyników>
 *
 * Budowy: VITE_MM_VIEW_TRANSITIONS=1 npx vite build --outDir <dist-wlaczony> oraz bez zmiennej.
 * Skrypt serwuje każdy dist (SPA) na wolnym porcie localhost. Przepuszcza tylko GET do
 * własnego serwera i do Sanity (API projektu i cdn.sanity.io, tylko odczyt); reszta
 * (analityka, Zaraz, fonty z zewnątrz, POST na /api/*) jest ABORTOWANA.
 * Wyniki: probe.json + 4 zrzuty w połowie przejścia. Kod wyjścia 0 = wszystkie progi spełnione.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const [onArg, offArg, outArg] = process.argv.slice(2);
if (!onArg || !offArg || !outArg) {
  console.error('użycie: probe-view-transitions.mjs <dist-on> <dist-off> <out>');
  process.exit(2);
}
const OUT = path.resolve(outArg);
await fs.mkdir(path.join(OUT, 'shots'), { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

async function serve(distArg) {
  const DIST = path.resolve(distArg);
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    let file = path.join(DIST, decodeURIComponent(url.pathname));
    if (!file.startsWith(DIST)) {
      res.writeHead(403).end();
      return;
    }
    try {
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
    } catch {
      file = path.join(DIST, 'index.html');
    }
    try {
      const body = await fs.readFile(file);
      res.writeHead(200, {
        'content-type': MIME[path.extname(file)] || 'application/octet-stream',
      });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

const ON = await serve(onArg);
const OFF = await serve(offArg);

const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36';
const VIEWPORTS = [
  { tag: 'tel', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
  { tag: 'pc', width: 1366, height: 768, deviceScaleFactor: 1 },
];
const SANITY = /^https:\/\/([a-z0-9]+\.api\.sanity\.io|cdn\.sanity\.io)\//;

// Instrument w stronie: liczy wywołania startViewTransition, nazwy (computed style) na
// starej i nowej stronie, animacje pseudo-elementów, długie zadania i przesunięcia układu.
const INSTRUMENT = () => {
  const vt = { calls: 0, records: [], longtasks: [], shifts: [], errors: [] };
  window.__vt = vt;
  const names = () => {
    const m = {};
    for (const el of document.querySelectorAll('*')) {
      const n = getComputedStyle(el).viewTransitionName;
      if (n && n !== 'none') m[n] = (m[n] || 0) + 1;
    }
    return m;
  };
  window.__vtNames = names;
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) vt.longtasks.push([e.startTime, e.duration]);
    }).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) vt.shifts.push([e.startTime, e.value]);
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    vt.errors.push(String(e));
  }
  if (window.__noVT) {
    delete Document.prototype.startViewTransition;
    return;
  }
  const orig = Document.prototype.startViewTransition;
  if (!orig) return;
  Document.prototype.startViewTransition = function (cb) {
    const mode = window.__vtMode || 'metrics';
    const rec = { t0: performance.now(), old: mode === 'names' ? names() : null };
    vt.calls++;
    vt.records.push(rec);
    const t = orig.call(this, async () => {
      await cb();
      if (mode === 'names') rec.next = names();
    });
    t.ready.then(
      () => {
        rec.tReady = performance.now();
        const an = document
          .getAnimations()
          .filter((a) => String(a.effect?.pseudoElement || '').startsWith('::view-transition'));
        rec.anims = an.length;
        rec.groups = [...new Set(an.map((a) => a.effect.pseudoElement))].sort();
        if (mode === 'shot') {
          an.forEach((a) => {
            a.pause();
            a.currentTime = 150;
          });
          window.__paused = an;
        }
      },
      (e) => (rec.readyErr = String(e)),
    );
    t.finished.then(() => {
      rec.t1 = performance.now();
      rec.after = names();
    });
    return t;
  };
};

const report = { viewports: {}, failures: [] };
const fail = (msg) => report.failures.push(msg);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
let pageErrors = 0;
let blocked = 0;

async function openPage(vp, { reduce = false, noVT = false, mode = 'metrics' } = {}) {
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.setViewport(vp);
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: reduce ? 'reduce' : 'no-preference' },
  ]);
  await page.evaluateOnNewDocument(
    (flags) => {
      window.__noVT = flags.noVT;
      window.__vtMode = flags.mode;
    },
    { noVT, mode },
  );
  await page.evaluateOnNewDocument(INSTRUMENT);
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const u = req.url();
    const own = u.startsWith(ON.origin) || u.startsWith(OFF.origin);
    if (req.method() === 'GET' && (own || SANITY.test(u))) req.continue();
    else {
      blocked++;
      req.abort();
    }
  });
  page.on('pageerror', (e) => {
    pageErrors++;
    report.failures.push(`pageerror: ${String(e.message).slice(0, 160)}`);
  });
  return page;
}

/** Pierwszy link do realizacji z obrazkiem w karcie (ten sam wybór co findCardParts). */
async function pickCard(page, { excludePath } = {}) {
  return page.evaluateHandle((exclude) => {
    const re = /^\/portfolio\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/;
    for (const a of document.querySelectorAll('a[href]')) {
      const href = a.getAttribute('href');
      if (!re.test(href) || href === exclude) continue;
      let node = a;
      let img = a.querySelector('img:not([aria-hidden="true"])');
      for (let d = 0; !img && d < 4 && node.parentElement; d++) {
        node = node.parentElement;
        if (node.querySelectorAll('a[href]').length !== 1) break;
        img = node.querySelector('img:not([aria-hidden="true"])');
      }
      if (img) return a;
    }
    return null;
  }, excludePath ?? null);
}

async function waitForCard(page, opts) {
  for (let i = 0; i < 40; i++) {
    const h = await pickCard(page, opts);
    if (await h.evaluate((a) => !!a)) return h;
    await page.evaluate(() => window.scrollBy(0, 600));
    await sleep(250);
  }
  return null;
}

/** Klik w kartę i pomiar: przejście, nazwy, długie zadania, CLS na celu. */
async function clickAndMeasure(page, card) {
  await card.evaluate((a) => a.scrollIntoView({ block: 'center' }));
  await sleep(400);
  const href = await card.evaluate((a) => a.getAttribute('href'));
  const tClick = await page.evaluate(() => performance.now());
  await card.click();
  await page.waitForFunction((h) => location.pathname === h, { timeout: 8000 }, href);
  await sleep(2000);
  return page.evaluate(
    (t, h) => {
      const vt = window.__vt;
      const rec = vt.records.at(-1) || null;
      const win = [t, t + 2500];
      const lt = vt.longtasks.filter(([s]) => s >= win[0] && s <= win[1]);
      const anim = rec && rec.tReady && rec.t1 ? [rec.tReady, rec.t1] : null;
      return {
        href: h,
        path: location.pathname,
        calls: vt.calls,
        rec,
        namesAtRest: window.__vtNames(),
        longtasks: lt.length,
        longtaskMaxMs: Math.round(Math.max(0, ...lt.map(([, d]) => d))),
        longtasksDuringAnim: anim
          ? vt.longtasks.filter(([s, d]) => s < anim[1] && s + d > anim[0]).length
          : 0,
        cls: Number(
          vt.shifts
            .filter(([s]) => s >= win[0])
            .reduce((acc, [, v]) => acc + v, 0)
            .toFixed(4),
        ),
        errors: vt.errors,
      };
    },
    tClick,
    href,
  );
}

const SOURCES = {
  A1: { url: '/portfolio/' },
  A2: { url: '/web-development/' },
};

for (const vp of VIEWPORTS) {
  const r = (report.viewports[vp.tag] = {});

  // 1) Nazwy na źródle i celu, brak duplikatów, brak nazw po końcu, Wstecz.
  for (const [key, src] of Object.entries(SOURCES)) {
    const page = await openPage(vp, { mode: 'names' });
    await page.goto(ON.origin + src.url, { waitUntil: 'networkidle2', timeout: 30000 });
    const restBefore = await page.evaluate(() => window.__vtNames());
    const card = await waitForCard(page);
    if (!card) {
      fail(`${vp.tag} ${key}: brak karty realizacji na ${src.url}`);
      await page.close();
      continue;
    }
    const m = await clickAndMeasure(page, card);
    await page.goBack({ waitUntil: 'networkidle2' });
    await sleep(800);
    const back = await page.evaluate(() => ({
      path: location.pathname,
      calls: window.__vt.calls,
      names: window.__vtNames(),
    }));
    r[`${key}-nazwy`] = { restBefore, ...m, back };
    const rec = m.rec || {};
    const dup = (o) => Object.entries(o || {}).filter(([, n]) => n > 1).length;
    if (Object.keys(restBefore).length) fail(`${vp.tag} ${key}: nazwy w spoczynku na źródle`);
    if (m.calls !== 1 || !rec.anims) fail(`${vp.tag} ${key}: przejście nie ruszyło`);
    if (rec.old?.['realizacja-zdjecie'] !== 1 || rec.next?.['realizacja-zdjecie'] !== 1)
      fail(`${vp.tag} ${key}: zdjęcie nie ma nazwy na źródle i celu`);
    if (
      key === 'A1' &&
      (rec.old?.['realizacja-tytul'] !== 1 || rec.next?.['realizacja-tytul'] !== 1)
    )
      fail(`${vp.tag} ${key}: tytuł nie ma nazwy na źródle i celu`);
    if (dup(rec.old) || dup(rec.next)) fail(`${vp.tag} ${key}: duplikat nazwy`);
    if (Object.keys(rec.after || {}).length || Object.keys(m.namesAtRest).length)
      fail(`${vp.tag} ${key}: nazwy zostały po przejściu`);
    if (back.path !== src.url || back.calls !== 1 || Object.keys(back.names).length)
      fail(`${vp.tag} ${key}: Wstecz (ścieżka/przejście/nazwy)`);

    // A2 w „Powiązanych”: karta realizacji pod realizacją → inna realizacja.
    if (key === 'A1') {
      const page2 = await openPage(vp, { mode: 'names' });
      await page2.goto(ON.origin + m.href, { waitUntil: 'networkidle2', timeout: 30000 });
      const rel = await waitForCard(page2, { excludePath: m.href });
      if (rel) {
        const m2 = await clickAndMeasure(page2, rel);
        r['A2-powiazane-nazwy'] = m2;
        const rec2 = m2.rec || {};
        if (
          m2.calls !== 1 ||
          rec2.old?.['realizacja-zdjecie'] !== 1 ||
          rec2.next?.['realizacja-zdjecie'] !== 1
        )
          fail(`${vp.tag} A2-powiazane: przejście/nazwy`);
        if (dup(rec2.old) || dup(rec2.next)) fail(`${vp.tag} A2-powiazane: duplikat nazwy`);
        if (Object.keys(m2.namesAtRest).length) fail(`${vp.tag} A2-powiazane: nazwy zostały`);
      } else r['A2-powiazane-nazwy'] = { pominiete: 'brak karty realizacji w Powiązanych' };
      await page2.close();
    }
    await page.close();

    // 2) Zrzut w połowie przejścia (animacje zatrzymane na 150 ms z 300 ms).
    const shot = await openPage(vp, { mode: 'shot' });
    await shot.goto(ON.origin + src.url, { waitUntil: 'networkidle2', timeout: 30000 });
    const c2 = await waitForCard(shot);
    if (c2) {
      await c2.evaluate((a) => a.scrollIntoView({ block: 'center' }));
      await sleep(400);
      await c2.click();
      try {
        await shot.waitForFunction(() => window.__paused, { timeout: 8000 });
        const file = `${key.toLowerCase()}-srodek-${vp.tag}.png`;
        await shot.screenshot({ path: path.join(OUT, 'shots', file) });
        r[`${key}-zrzut`] = {
          file,
          paused: await shot.evaluate(() => window.__paused.length),
          currentTimeMs: await shot.evaluate(() => window.__paused[0]?.currentTime ?? null),
        };
        await shot.evaluate(() => window.__paused.forEach((a) => a.play()));
      } catch {
        fail(`${vp.tag} ${key}: brak zrzutu w połowie przejścia`);
      }
    }
    await shot.close();
  }

  // 3) CLS i długie zadania: włączony vs wyłączony (3 powtórzenia, mediana), A1.
  for (const [build, srv] of [
    ['wlaczony', ON],
    ['wylaczony', OFF],
  ]) {
    const runs = [];
    for (let i = 0; i < 3; i++) {
      const page = await openPage(vp);
      await page.goto(srv.origin + '/portfolio/', { waitUntil: 'networkidle2', timeout: 30000 });
      const card = await waitForCard(page);
      if (!card) {
        fail(`${vp.tag} ${build}: brak karty`);
        await page.close();
        continue;
      }
      runs.push(await clickAndMeasure(page, card));
      await page.close();
    }
    r[`A1-${build}`] = {
      calls: runs.map((x) => x.calls),
      cls: runs.map((x) => x.cls),
      longtasks: runs.map((x) => x.longtasks),
      longtaskMaxMs: runs.map((x) => x.longtaskMaxMs),
      longtasksDuringAnim: runs.map((x) => x.longtasksDuringAnim),
      namesAtRest: runs.map((x) => Object.keys(x.namesAtRest).length),
    };
  }
  const on = r['A1-wlaczony'];
  const off = r['A1-wylaczony'];
  if (on.cls.length && median(on.cls) > 0.1) fail(`${vp.tag}: CLS celu ${median(on.cls)} > 0.1`);
  if (on.longtasks.length && off.longtasks.length && median(on.longtasks) > median(off.longtasks))
    fail(
      `${vp.tag}: więcej długich zadań z przejściem (${median(on.longtasks)} > ${median(off.longtasks)})`,
    );
  if (on.longtasksDuringAnim.some((n) => n > 0))
    fail(`${vp.tag}: długie zadanie w trakcie animacji`);
  if (off.calls.some((n) => n !== 0)) fail(`${vp.tag}: przełącznik wyłączony, a przejście ruszyło`);
  if (off.namesAtRest.some((n) => n !== 0)) fail(`${vp.tag}: przełącznik wyłączony, a nazwy w DOM`);

  // 4) Ogranicz ruch: 0 przejść i 0 animacji pseudo-elementów.
  {
    const page = await openPage(vp, { reduce: true, mode: 'names' });
    await page.goto(ON.origin + '/portfolio/', { waitUntil: 'networkidle2', timeout: 30000 });
    const card = await waitForCard(page);
    const m = card ? await clickAndMeasure(page, card) : null;
    const vtAnims = await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((a) => String(a.effect?.pseudoElement || '').startsWith('::view-transition'))
          .length,
    );
    r['A1-ogranicz-ruch'] = { path: m?.path, calls: m?.calls, vtAnims, names: m?.namesAtRest };
    if (!m || m.path !== m.href) fail(`${vp.tag} reduce: nawigacja nie zadziałała`);
    if (m?.calls !== 0 || vtAnims !== 0) fail(`${vp.tag} reduce: przejście albo animacja`);
    await page.close();
  }

  // 5) Przeglądarka bez API: zwykła nawigacja, bez błędu.
  {
    const page = await openPage(vp, { noVT: true });
    await page.goto(ON.origin + '/portfolio/', { waitUntil: 'networkidle2', timeout: 30000 });
    const card = await waitForCard(page);
    const m = card ? await clickAndMeasure(page, card) : null;
    r['A1-bez-api'] = { path: m?.path, href: m?.href };
    if (!m || m.path !== m.href) fail(`${vp.tag} bez API: nawigacja nie zadziałała`);
    await page.close();
  }
}

report.pageErrors = pageErrors;
report.blockedRequests = blocked;
report.ok = report.failures.length === 0;
await fs.writeFile(path.join(OUT, 'probe.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ok: report.ok, failures: report.failures, pageErrors, blocked }));
await browser.close();
ON.server.close();
OFF.server.close();
process.exit(report.ok ? 0 : 1);
