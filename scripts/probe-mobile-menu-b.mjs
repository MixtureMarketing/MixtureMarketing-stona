#!/usr/bin/env node
/**
 * MIX-1411 / MIX-1465: pomiar menu mobilnego (wariant B = makieta B „Karta pod kciukiem”)
 * w Chromium headless na lokalnym serwerze Vite.
 *
 *   node scripts/probe-mobile-menu-b.mjs <katalog-wynikow> [--off] [--makieta <b.html>]
 *
 * Domyślnie przełącznik VITE_MM_MOBILE_MENU_B=1 (wariant B); --off = stare menu (tylko zrzuty
 * i pomiary ogólne). --makieta = zatwierdzona makieta (git show 3daea5a:makiety/mix1465/b.html):
 * te same stany przy 360 i 390 px, zrzuty <katalog>/shots/makieta-<szer>-*.png i porównanie
 * położenia oraz tekstu elementów karty (makieta ↔ strona, w px).
 * Cały ruch poza 127.0.0.1 jest ABORTOWANY (bez CMS, bez analityki).
 * Wynik: <katalog>/probe.json, zrzuty <katalog>/shots/<szer>-<stan>.png.
 * Kod wyjścia 0 = wszystkie progi spełnione (tryb B); 1 = próg niespełniony; 2 = błąd pomiaru.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const [outArg, ...flags] = process.argv.slice(2);
if (!outArg) {
  console.error(
    'użycie: node scripts/probe-mobile-menu-b.mjs <katalog> [--off] [--makieta <b.html>]',
  );
  process.exit(2);
}
const OFF = flags.includes('--off');
const MOCK = flags.includes('--makieta')
  ? path.resolve(flags[flags.indexOf('--makieta') + 1])
  : null;
process.env.VITE_MM_MOBILE_MENU_B = OFF ? '0' : '1';
const OUT = path.resolve(outArg);
await fs.mkdir(path.join(OUT, 'shots'), { recursive: true });

const { createServer } = await import('vite');
const { chromium } = require('playwright-core');
const AXE = await fs.readFile(require.resolve('axe-core/axe.min.js'), 'utf8');

const SIZES = [
  [360, 740],
  [390, 844],
  [430, 932],
  [768, 1024],
];
const SHOT_W = [360, 390];
const CONSENT = JSON.stringify({ necessary: true, analytics: false, marketing: false });
// Selektory strony i makiety (makieta: te same nazwy klas bez przedrostka mmb-).
const SITE = {
  menu: '#mobile-menu',
  toggle: 'button[aria-controls="mobile-menu"]',
  offerBtn: '#mobile-menu button[aria-controls="mobile-menu-offer"]',
  tab1: '#mobile-menu-tab-1',
  handle: '#mobile-menu .mmb-handle',
  p: 'mmb-',
  title: '.mmb-title',
};
const MOCKUP = {
  menu: '#menu',
  toggle: '#burger',
  offerBtn: '#to-offer',
  tab1: '#tab-1',
  handle: '#handle',
  p: '',
  title: 'h2',
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const server = await createServer({
  logLevel: 'error',
  server: { host: '127.0.0.1', port: 0, strictPort: false, hmr: false },
});
await server.listen();
const BASE = `http://127.0.0.1:${server.httpServer.address().port}`;

const browser = await chromium.launch({
  args: ['--no-sandbox'],
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const results = { base: BASE, mode: OFF ? 'off' : 'B', widths: {}, mockup: {}, clickThrough: null };
let failed = 0;
const check = (cond, what) => {
  if (!cond) {
    failed++;
    console.log(`PROG NIESPELNIONY: ${what}`);
  }
};

async function newPage(w, h, url = `${BASE}/`, sel = SITE) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await ctx.addInitScript((c) => localStorage.setItem('cookie-consent-v2', c), CONSENT);
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    return u.startsWith(BASE) || u.startsWith('file:') || u.startsWith('data:')
      ? route.continue()
      : route.abort();
  });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  await page.waitForSelector(sel.toggle, { state: 'attached', timeout: 60000 });
  // MIX-1465 kryt. 2: menu B to osobny fragment (lazy); czekamy, aż karta jest w DOM.
  if (!OFF && sel === SITE)
    await page.waitForSelector('.mmb #mobile-menu', { state: 'attached', timeout: 60000 });
  await wait(1500);
  await page.evaluate(() => document.fonts.ready);
  return { ctx, page };
}

// Pomiary w stronie (jedna funkcja, wołana po każdym stanie).
function measure(menuSel) {
  const menu = document.querySelector(menuSel);
  const scroller =
    menu.querySelector('.is-active .mmb-scroll') || menu.querySelector('.overflow-y-auto');
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
  };
  const tappables = [...menu.querySelectorAll('a,button')].filter(vis);
  const small = tappables
    .map((el) => [
      el.getAttribute('aria-label') || el.textContent.trim(),
      Math.round(el.getBoundingClientRect().height),
      Math.round(el.getBoundingClientRect().width),
    ])
    .filter(([, hgt, wid]) => hgt < 44 || wid < 44);
  const doc = document.documentElement;
  const a = document.activeElement;
  return {
    docScrollW: doc.scrollWidth,
    innerW: innerWidth,
    menuScrollW: scroller ? scroller.scrollWidth : null,
    menuClientW: scroller ? scroller.clientWidth : null,
    tappables: tappables.length,
    under44: small,
    menuHidden: menu.getAttribute('aria-hidden'),
    sheetTop: Math.round(menu.getBoundingClientRect().top),
    bodyOverflow: document.body.style.overflow,
    bodyPosition: document.body.style.position,
    active: a
      ? `${a.tagName}#${a.id}|${a.getAttribute('aria-label') || a.textContent.trim().slice(0, 30)}`
      : null,
    inMenu: !!(a && menu.contains(a)),
    current: [...menu.querySelectorAll('[aria-current="page"]')].map((e) => e.textContent.trim()),
    text: menu.innerText,
  };
}

// Położenie i tekst elementów karty; ta sama lista dla makiety (p='') i strony (p='mmb-').
function geometry({ menu: menuSel, p, title }) {
  const menu = document.querySelector(menuSel);
  const q = (s) =>
    [...menu.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().height > 0);
  const act = `.${p}screen.is-active`;
  const items = {
    sheet: [menu],
    close: q(`.${p}close`),
    kicker: q(`${act} .${p}head .${p}kicker`),
    rows: q(`${act} .${p}row`),
    chip: q(`${act} .${p}chip`),
    promo: q(`${act} .${p}promo`),
    back: q(`${act} .${p}back`),
    title: q(`${act} ${title}`),
    tabs: q(`${act} .${p}tab`),
    desc: q(`${act} [role="tabpanel"]:not([hidden]) .${p}panel-desc`),
    seeAll: q(`${act} [role="tabpanel"]:not([hidden]) .${p}see-all`),
    actions: q(`.${p}actions .${p}btn`),
  };
  const out = {};
  for (const [k, els] of Object.entries(items))
    out[k] = els.map((e) => {
      const r = e.getBoundingClientRect();
      const t = k === 'sheet' ? '' : e.innerText.replace(/\s+/g, ' ').trim();
      return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height), t];
    });
  return out;
}

function compareGeometry(mock, site) {
  let maxPx = 0;
  const diffs = [];
  for (const k of Object.keys(mock)) {
    if (mock[k].length !== site[k].length) {
      diffs.push(`${k}: liczba ${mock[k].length}≠${site[k].length}`);
      continue;
    }
    mock[k].forEach((m, i) => {
      const s = site[k][i];
      const d = Math.max(...[0, 1, 2, 3].map((j) => Math.abs(m[j] - s[j])));
      maxPx = Math.max(maxPx, d);
      if (d > 2) diffs.push(`${k}[${i}] ${d}px ${JSON.stringify(m)}→${JSON.stringify(s)}`);
      if (m[4] !== s[4]) diffs.push(`${k}[${i}] tekst „${m[4]}”≠„${s[4]}”`);
    });
  }
  return { maxPx, diffs };
}

async function axe(page, menuSel) {
  await page.addScriptTag({ content: AXE });
  return page.evaluate(async (sel) => {
    const r = await window.axe.run(sel, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    const bad = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    return {
      seriousCritical: bad.map((v) => `${v.id}:${v.nodes.length}`),
      all: r.violations.length,
    };
  }, menuSel);
}

async function dragHandle(page, sel, dy, stepMs) {
  const b = await page.locator(sel.handle).boundingBox();
  const x = b.x + b.width / 2;
  const y = b.y + b.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(x, y + (dy * i) / steps);
    await wait(stepMs);
  }
  return async () => {
    await page.mouse.up();
    await wait(600);
  };
}

// Stany karty (wspólne dla strony i makiety): zamknięte, otwarte, Oferta, Oferta/Marketing,
// przeciąganie 120 px (zrzut w trakcie), puszczenie = zamknięcie.
async function states(page, sel, w, prefix, row) {
  const shot = (n) => page.screenshot({ path: path.join(OUT, 'shots', `${prefix}${w}-${n}.png`) });
  const takeShots = SHOT_W.includes(w);
  row.closed = await page.evaluate(measure, sel.menu);
  if (takeShots) await shot('1-zamkniete');
  await page.click(sel.toggle);
  await wait(900);
  row.open = await page.evaluate(measure, sel.menu);
  row.geoOpen = await page.evaluate(geometry, sel);
  if (takeShots) await shot('2-otwarte');
  await page.click(sel.offerBtn);
  await wait(700);
  row.offer = await page.evaluate(measure, sel.menu);
  row.geoOffer = await page.evaluate(geometry, sel);
  if (takeShots) await shot('3-oferta');
  await page.click(sel.tab1);
  await wait(700);
  row.geoMarketing = await page.evaluate(geometry, sel);
  if (takeShots) await shot('4-oferta-marketing');
  await page.keyboard.press('Escape');
  await wait(600);
  row.afterEsc1 = await page.evaluate(measure, sel.menu);
  const release = await dragHandle(page, sel, 120, 30);
  if (takeShots) await shot('6-przeciaganie');
  row.dragMid = await page.evaluate(measure, sel.menu);
  await release();
  row.afterDrag120 = await page.evaluate(measure, sel.menu);
}

try {
  for (const [w, h] of SIZES) {
    const { ctx, page } = await newPage(w, h);
    const row = {};
    if (OFF) {
      row.closed = await page.evaluate(measure, SITE.menu);
      await page.screenshot({ path: path.join(OUT, 'shots', `${w}-1-zamkniete.png`) });
      await page.click(SITE.toggle);
      await wait(900);
      row.open = await page.evaluate(measure, SITE.menu);
      await page.screenshot({ path: path.join(OUT, 'shots', `${w}-2-otwarte.png`) });
      results.widths[w] = row;
      await ctx.close();
      continue;
    }
    // Dostępność i klawiatura na świeżej stronie.
    await page.click(SITE.toggle);
    await wait(900);
    row.openAxe = await axe(page, SITE.menu);
    row.focusOnOpen = await page.evaluate(measure, SITE.menu);
    row.trap = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      row.trap.push(
        await page.evaluate(
          (s) => document.querySelector(s).contains(document.activeElement),
          SITE.menu,
        ),
      );
    }
    await page.click(SITE.offerBtn);
    await wait(700);
    row.offerAxe = await axe(page, SITE.menu);
    row.offerFocus = (await page.evaluate(measure, SITE.menu)).active;
    await page.keyboard.press('Escape');
    await wait(500);
    row.esc1 = await page.evaluate(measure, SITE.menu);
    await page.keyboard.press('Escape');
    await wait(600);
    row.esc2 = await page.evaluate(measure, SITE.menu);
    delete row.esc1.text;
    delete row.esc2.text;
    // Stany jak w makiecie (świeża strona).
    await page.goto(`${BASE}/`, { waitUntil: 'load' });
    await page.waitForSelector(SITE.toggle, { state: 'attached' });
    await wait(1500);
    await states(page, SITE, w, '', row);
    // Krótkie przeciągnięcie (60 px, wolno) = karta wraca.
    await page.click(SITE.toggle);
    await wait(900);
    const rel = await dragHandle(page, SITE, 60, 60);
    await rel();
    row.afterDrag60 = await page.evaluate(measure, SITE.menu);
    delete row.afterDrag60.text;
    results.widths[w] = row;
    await ctx.close();

    if (MOCK && SHOT_W.includes(w)) {
      const m = await newPage(w, h, pathToFileURL(MOCK).href, MOCKUP);
      const mrow = {};
      await states(m.page, MOCKUP, w, 'makieta-', mrow);
      results.mockup[w] = {
        open: compareGeometry(mrow.geoOpen, row.geoOpen),
        offer: compareGeometry(mrow.geoOffer, row.geoOffer),
        marketing: compareGeometry(mrow.geoMarketing, row.geoMarketing),
      };
      await m.ctx.close();
    }
  }

  if (!OFF) {
    // Podświetlenie bieżącej strony (opcja A): / = 0 pozycji, /portfolio/ = „Realizacje”.
    results.current = {};
    for (const route of ['/', '/portfolio/', '/marketing/google-ads/']) {
      const { ctx, page } = await newPage(390, 844, `${BASE}${route}`);
      results.current[route] = (await page.evaluate(measure, SITE.menu)).current;
      await ctx.close();
    }
    // Przeklikanie: każdy link obu ekranów (390x844) zamyka menu i odblokowuje przewijanie.
    const { ctx, page } = await newPage(390, 844);
    const MAIN_A = '#mobile-menu nav.mmb-screen-main a';
    const OFFER_A = '#mobile-menu-offer a';
    const count = await page.evaluate(
      ([a, b]) => ({
        main: document.querySelectorAll(a).length,
        offer: document.querySelectorAll(b).length,
      }),
      [MAIN_A, OFFER_A],
    );
    const fails = [];
    let done = 0;
    for (const [where, n, sel] of [
      ['main', count.main, MAIN_A],
      ['offer', count.offer, OFFER_A],
    ]) {
      for (let i = 0; i < n; i++) {
        await page.goto(`${BASE}/`, { waitUntil: 'load' });
        await page.waitForSelector(SITE.toggle, { state: 'attached' });
        await wait(500);
        await page.click(SITE.toggle);
        await wait(700);
        if (where === 'offer') {
          await page.click(SITE.offerBtn);
          await wait(500);
          const tabId = await page
            .locator(sel)
            .nth(i)
            .evaluate((a) => a.closest('[role="tabpanel"]').getAttribute('aria-labelledby'));
          await page.click(`#${tabId}`);
          await wait(400);
        }
        const href = await page.locator(sel).nth(i).getAttribute('href');
        await page.locator(sel).nth(i).click();
        await wait(700);
        const st = await page.evaluate(() => ({
          hidden: document.querySelector('#mobile-menu').getAttribute('aria-hidden'),
          overflow: document.body.style.overflow,
          position: document.body.style.position,
          path: location.pathname,
        }));
        done++;
        if (st.hidden !== 'true' || st.overflow !== '' || st.position !== '' || st.path !== href)
          fails.push({ where, i, href, ...st });
      }
    }
    results.clickThrough = { links: done, ...count, fails };
    await ctx.close();
  }
} catch (e) {
  console.error('BLAD POMIARU:', e && e.stack ? e.stack : e);
  await browser.close();
  await server.close();
  process.exit(2);
}
await browser.close();
await server.close();

// Progi (tylko wariant B).
const lines = [];
for (const [w, r] of Object.entries(results.widths)) {
  for (const st of OFF ? ['closed', 'open'] : ['closed', 'open', 'offer']) {
    const m = r[st];
    check(
      m.docScrollW <= m.innerW,
      `${w} ${st}: poziome przewijanie strony ${m.docScrollW}>${m.innerW}`,
    );
    if (st !== 'closed' && m.menuScrollW !== null)
      check(
        m.menuScrollW <= m.menuClientW,
        `${w} ${st}: poziome przewijanie menu ${m.menuScrollW}>${m.menuClientW}`,
      );
  }
  if (OFF) continue;
  for (const st of ['open', 'offer']) {
    check(
      r[st].under44.length === 0,
      `${w} ${st}: dotykane < 44 px ${JSON.stringify(r[st].under44)}`,
    );
    check(
      r[`${st}Axe`].seriousCritical.length === 0,
      `${w} ${st}: axe ${r[`${st}Axe`].seriousCritical}`,
    );
  }
  check(
    r.focusOnOpen.active.includes('Zamknij menu'),
    `${w}: fokus po otwarciu ${r.focusOnOpen.active}`,
  );
  check(r.trap.every(Boolean), `${w}: Tab wyszedł z karty ${JSON.stringify(r.trap)}`);
  check(r.offerFocus.includes('mobile-menu-offer-title'), `${w}: fokus po wejściu ${r.offerFocus}`);
  check(
    r.esc1.menuHidden === 'false' &&
      r.esc1.active.includes('Oferta') &&
      r.esc1.bodyPosition === 'fixed',
    `${w}: Escape 1 (Oferta) nie wrócił do menu ${JSON.stringify(r.esc1)}`,
  );
  check(
    r.esc2.menuHidden === 'true' &&
      r.esc2.bodyOverflow === '' &&
      r.esc2.bodyPosition === '' &&
      r.esc2.active.includes('Menu nawigacyjne'),
    `${w}: Escape 2 nie zamknął / fokus ${JSON.stringify(r.esc2)}`,
  );
  check(
    r.dragMid.sheetTop > r.open.sheetTop + 100,
    `${w}: karta nie idzie za palcem ${r.dragMid.sheetTop}`,
  );
  check(r.afterDrag120.menuHidden === 'true', `${w}: przeciągnięcie 120 px nie zamknęło`);
  check(r.afterDrag60.menuHidden === 'false', `${w}: przeciągnięcie 60 px zamknęło`);
  lines.push(
    `${w}: karta top=${r.open.sheetTop}, dotykane open=${r.open.tappables} offer=${r.offer.tappables}, axe open=${r.openAxe.all} offer=${r.offerAxe.all}, drag60 otwarte, drag120 zamknięte`,
  );
}
if (!OFF) {
  for (const [w, cmp] of Object.entries(results.mockup)) {
    for (const [st, c] of Object.entries(cmp)) {
      check(c.diffs.length === 0, `${w} ${st}: makieta≠strona ${c.diffs.slice(0, 6).join('; ')}`);
      lines.push(`makieta ${w} ${st}: max odchyłka ${c.maxPx}px, różnice ${c.diffs.length}`);
    }
  }
  if (MOCK)
    check(Object.keys(results.mockup).length === SHOT_W.length, 'brak porównania z makietą');
  const cur = results.current;
  check(cur['/'].length === 0, `/: podświetlone ${JSON.stringify(cur['/'])}`);
  check(
    cur['/portfolio/'].length === 1 && cur['/portfolio/'][0] === 'Realizacje',
    `/portfolio/: ${JSON.stringify(cur['/portfolio/'])}`,
  );
  check(
    cur['/marketing/google-ads/'].length === 1,
    `/marketing/google-ads/: ${JSON.stringify(cur['/marketing/google-ads/'])}`,
  );
  lines.push(`aria-current: ${JSON.stringify(cur)}`);
  const ct = results.clickThrough;
  check(
    ct.links === 20 && ct.fails.length === 0,
    `przeklikanie: ${ct.links} linków, porażki ${JSON.stringify(ct.fails)}`,
  );
  lines.push(
    `przeklikanie: ${ct.links} linków (główny ${ct.main}, oferta ${ct.offer}), porażki ${ct.fails.length}`,
  );
}
for (const r of Object.values(results.widths))
  for (const v of Object.values(r)) if (v && typeof v === 'object' && 'text' in v) delete v.text;
await fs.writeFile(path.join(OUT, 'probe.json'), JSON.stringify(results, null, 1));
console.log(lines.join('\n'));
console.log(`PROBE ${results.mode}: progi niespełnione=${failed}`);
process.exit(failed ? 1 : 0);
