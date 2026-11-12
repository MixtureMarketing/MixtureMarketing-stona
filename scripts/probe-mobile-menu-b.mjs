#!/usr/bin/env node
/**
 * MIX-1411: pomiar menu mobilnego (wariant B) w Chromium headless na lokalnym serwerze Vite.
 *
 *   node scripts/probe-mobile-menu-b.mjs <katalog-wynikow> [--off]
 *
 * Domyślnie przełącznik VITE_MM_MOBILE_MENU_B=1 (wariant B); --off = stare menu (tylko zrzuty
 * i pomiary ogólne). Cały ruch poza 127.0.0.1 jest ABORTOWANY (bez CMS, bez analityki).
 * Wynik: <katalog>/probe.json, zrzuty <katalog>/shots/<szer>-<1-zamkniete|2-otwarte|3-oferta>.png.
 * Kod wyjścia 0 = wszystkie progi spełnione (tryb B); 1 = próg niespełniony; 2 = błąd pomiaru.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const [outArg, ...flags] = process.argv.slice(2);
if (!outArg) {
  console.error('użycie: node scripts/probe-mobile-menu-b.mjs <katalog-wynikow> [--off]');
  process.exit(2);
}
const OFF = flags.includes('--off');
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
const CONSENT = JSON.stringify({ necessary: true, analytics: false, marketing: false });
const MENU = '#mobile-menu';
const TOGGLE = 'button[aria-controls="mobile-menu"]';
const OFFER_BTN = '#mobile-menu button[aria-controls="mobile-menu-offer"]';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const server = await createServer({
  logLevel: 'error',
  server: { host: '127.0.0.1', port: 0, strictPort: false, hmr: false },
});
await server.listen();
const addr = server.httpServer.address();
const BASE = `http://127.0.0.1:${addr.port}`;

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const results = { base: BASE, mode: OFF ? 'off' : 'B', widths: {}, clickThrough: null };
let failed = 0;
const check = (cond, what) => {
  if (!cond) {
    failed++;
    console.log(`PROG NIESPELNIONY: ${what}`);
  }
};

async function newPage(w, h) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await ctx.addInitScript((c) => localStorage.setItem('cookie-consent-v2', c), CONSENT);
  await ctx.route('**/*', (route) =>
    route.request().url().startsWith(BASE) ? route.continue() : route.abort(),
  );
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForSelector(TOGGLE, { state: 'attached', timeout: 60000 });
  await wait(1200);
  return { ctx, page };
}

// Pomiary w stronie (jedna funkcja, wołana po każdym stanie).
function measure() {
  const menu = document.querySelector('#mobile-menu');
  const scroller = menu.querySelector('.overflow-y-auto');
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
  };
  const tappables = [...menu.querySelectorAll('a,button')].filter(vis);
  const small = tappables
    .map((el) => [
      el.getAttribute('aria-label') || el.textContent.trim(),
      el.getBoundingClientRect().height,
    ])
    .filter(([, hgt]) => hgt < 44);
  const bs = (el) => {
    const s = getComputedStyle(el);
    const bw = ['Top', 'Right', 'Bottom', 'Left'].some((k) => parseFloat(s[`border${k}Width`]) > 0);
    return bw && s.boxShadow !== 'none';
  };
  const boxed = [...menu.querySelectorAll('*')].filter((el) => vis(el) && bs(el));
  const nested = boxed.filter((el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement)
      if (bs(p)) return true;
    return false;
  });
  const doc = document.documentElement;
  return {
    docScrollW: doc.scrollWidth,
    innerW: innerWidth,
    innerH: innerHeight,
    menuScrollW: scroller ? scroller.scrollWidth : null,
    menuClientW: scroller ? scroller.clientWidth : null,
    scrollH: scroller ? scroller.scrollHeight : null,
    clientH: scroller ? scroller.clientHeight : null,
    tappables: tappables.length,
    under44: small,
    boxedNested: nested.length,
    menuHidden: menu.getAttribute('aria-hidden'),
    bodyOverflow: document.body.style.overflow,
    active: document.activeElement
      ? `${document.activeElement.tagName}#${document.activeElement.id}|${document.activeElement.textContent.trim().slice(0, 30)}`
      : null,
    text: menu.innerText,
  };
}

// Kontrast: każdy węzeł tekstowy w widocznej części menu, tło = najbliższe nieprzezroczyste
// (gradient: najgorszy z jego kolorów). Zwraca najniższy kontrast i listę < 4.5.
function contrast() {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1]
      .split(/[ ,/]+/)
      .filter(Boolean)
      .map(Number);
    return [r, g, b, a];
  };
  const lum = ([r, g, b]) => {
    const f = (x) => ((x /= 255) <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const blend = (fg, bg) => fg.slice(0, 3).map((v, i) => v * fg[3] + bg[i] * (1 - fg[3]));
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const bgsOf = (el) => {
    for (let p = el; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      const img = s.backgroundImage;
      if (img && img.includes('gradient')) {
        return [...img.matchAll(/rgba?\([^)]+\)/g)].map((m) => parse(m[0]));
      }
      const c = parse(s.backgroundColor);
      if (c && c[3] > 0.9) return [c];
    }
    return [[255, 255, 255, 1]];
  };
  const menu = document.querySelector('#mobile-menu');
  const walker = document.createTreeWalker(menu, NodeFilter.SHOW_TEXT);
  const rows = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    if (!r.width || s.visibility === 'hidden' || el.closest('[hidden]') || el.closest('.sr-only'))
      continue;
    const fg = parse(s.color);
    const worst = Math.min(...bgsOf(el).map((bg) => ratio(blend(fg, bg), bg)));
    rows.push([n.textContent.trim().slice(0, 30), Math.round(worst * 100) / 100]);
  }
  rows.sort((a, b) => a[1] - b[1]);
  return {
    min: rows.length ? rows[0][1] : null,
    count: rows.length,
    below: rows.filter((r) => r[1] < 4.5),
  };
}

async function axe(page) {
  await page.addScriptTag({ content: AXE });
  return page.evaluate(async () => {
    const r = await window.axe.run('#mobile-menu', {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    const bad = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    return {
      seriousCritical: bad.map((v) => `${v.id}:${v.nodes.length}`),
      incomplete: r.incomplete.map((v) => v.id),
    };
  });
}

async function cookieVsCta(page) {
  return page.evaluate(() => {
    const cta = [...document.querySelectorAll('#mobile-menu button')].find((b) =>
      b.textContent.includes('Darmowa Konsultacja'),
    );
    const cookie = document.querySelector('.cookie-floating-btn');
    if (!cta) return { error: 'brak przycisku konsultacji' };
    const r = cta.getBoundingClientRect();
    const pts = [
      [r.left + 3, r.top + 3],
      [r.right - 3, r.top + 3],
      [r.left + 3, r.bottom - 3],
      [r.right - 3, r.bottom - 3],
      [r.left + r.width / 2, r.top + r.height / 2],
    ];
    const covered = pts.filter(([x, y]) => {
      const hit = document.elementFromPoint(x, y);
      return !(hit && cta.contains(hit));
    }).length;
    return {
      cookiePresent: !!cookie,
      ctaRect: [r.left, r.top, r.width, r.height].map(Math.round),
      covered,
    };
  });
}

try {
  for (const [w, h] of SIZES) {
    const { ctx, page } = await newPage(w, h);
    const row = {};
    row.closed = await page.evaluate(measure);
    await page.screenshot({ path: path.join(OUT, 'shots', `${w}-1-zamkniete.png`) });
    await page.click(TOGGLE);
    await wait(900);
    row.open = await page.evaluate(measure);
    row.openContrast = await page.evaluate(contrast);
    row.openAxe = await axe(page);
    row.cookie = await cookieVsCta(page);
    await page.screenshot({ path: path.join(OUT, 'shots', `${w}-2-otwarte.png`) });
    if (!OFF) {
      await page.click(OFFER_BTN);
      await wait(400);
      row.offer = await page.evaluate(measure);
      row.offerContrast = await page.evaluate(contrast);
      row.offerAxe = await axe(page);
      row.offerGroupNamed = await page.getByRole('group', { name: 'Oferta' }).count();
      row.fonts = await page.evaluate(() => {
        const a = document.querySelector('#mobile-menu-offer li a');
        const [n, d] = a.querySelectorAll('span');
        const f = (e) => [getComputedStyle(e).fontSize, getComputedStyle(e).fontWeight];
        return { name: f(n), desc: f(d) };
      });
      await page.screenshot({ path: path.join(OUT, 'shots', `${w}-3-oferta.png`) });
      await page.click('#mobile-menu button[aria-label="Wróć do menu"]');
      await wait(200);
      row.afterBack = await page.evaluate(() =>
        document.activeElement?.getAttribute('aria-controls'),
      );
      await page.keyboard.press('Escape');
      await wait(600);
      row.afterEscape = await page.evaluate(measure);
      delete row.afterEscape.text;
    } else {
      const btn = '#mobile-menu button[aria-controls="mobile-offers-submenu"]';
      await page.click(btn);
      await wait(900);
      await page.screenshot({ path: path.join(OUT, 'shots', `${w}-3-oferta.png`) });
    }
    results.widths[w] = row;
    await ctx.close();
  }

  if (!OFF) {
    // Przeklikanie: każdy link obu ekranów (390x844) zamyka menu i odblokowuje przewijanie.
    const { ctx, page } = await newPage(390, 844);
    const count = await page.evaluate(() => ({
      main: document.querySelectorAll('#mobile-menu ul[class*="pt-"] > li > a').length,
      offer: document.querySelectorAll('#mobile-menu-offer a').length,
    }));
    const fails = [];
    let done = 0;
    for (const [where, n] of [
      ['main', count.main],
      ['offer', count.offer],
    ]) {
      for (let i = 0; i < n; i++) {
        await page.goto(`${BASE}/`, { waitUntil: 'load' });
        await page.waitForSelector(TOGGLE, { state: 'attached' });
        await wait(500);
        await page.click(TOGGLE);
        await wait(700);
        if (where === 'offer') {
          await page.click(OFFER_BTN);
          await wait(200);
        }
        const sel =
          where === 'main' ? '#mobile-menu ul[class*="pt-"] > li > a' : '#mobile-menu-offer a';
        const href = await page.locator(sel).nth(i).getAttribute('href');
        await page.locator(sel).nth(i).click();
        await wait(700);
        const st = await page.evaluate(() => ({
          hidden: document.querySelector('#mobile-menu').getAttribute('aria-hidden'),
          overflow: document.body.style.overflow,
          path: location.pathname,
        }));
        done++;
        if (st.hidden !== 'true' || st.overflow !== '' || st.path !== href)
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
const TEXTS = ['Oferta', 'Zobacz całą ofertę', 'Darmowa Konsultacja'];
const lines = [];
for (const [w, r] of Object.entries(results.widths)) {
  for (const st of OFF ? ['closed', 'open'] : ['closed', 'open', 'offer']) {
    const m = r[st];
    check(
      m.docScrollW <= m.innerW,
      `${w} ${st}: poziome przewijanie strony ${m.docScrollW}>${m.innerW}`,
    );
    if (st !== 'closed')
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
    check(r[st].boxedNested === 0, `${w} ${st}: ramka+cień w ramce+cieniu: ${r[st].boxedNested}`);
    check(
      r[`${st}Contrast`].below.length === 0,
      `${w} ${st}: kontrast < 4.5 ${JSON.stringify(r[`${st}Contrast`].below)}`,
    );
    check(
      r[`${st}Axe`].seriousCritical.length === 0,
      `${w} ${st}: axe ${r[`${st}Axe`].seriousCritical}`,
    );
  }
  const all = r.open.text + '\n' + r.offer.text;
  for (const t of TEXTS) check(all.includes(t), `${w}: brak nazwy „${t}”`);
  check(r.offerGroupNamed === 1, `${w}: ekran bez nazwy dla czytnika`);
  check(
    r.offer.active.includes('mobile-menu-offer-title'),
    `${w}: fokus po wejściu ${r.offer.active}`,
  );
  check(r.afterBack === 'mobile-menu-offer', `${w}: fokus po powrocie ${r.afterBack}`);
  check(
    r.afterEscape.menuHidden === 'true' && r.afterEscape.bodyOverflow === '',
    `${w}: Escape nie zamknął`,
  );
  check(
    parseFloat(r.fonts.desc[0]) < parseFloat(r.fonts.name[0]),
    `${w}: opis nie mniejszy niż nazwa ${JSON.stringify(r.fonts)}`,
  );
  check(r.fonts.desc[0] === '10px', `${w}: opis ${r.fonts.desc[0]} zamiast 10px`);
  check(
    r.cookie.covered === 0 && !r.cookie.error,
    `${w}: konsultacja zasłonięta ${JSON.stringify(r.cookie)}`,
  );
  const screens = r.offer.scrollH / r.offer.clientH;
  lines.push(
    `${w}: ekrany oferty=${screens.toFixed(2)} (scrollH ${r.offer.scrollH}/clientH ${r.offer.clientH}), min kontrast open=${r.openContrast.min} offer=${r.offerContrast.min}, dotykane open=${r.open.tappables} offer=${r.offer.tappables}, cookie=${r.cookie.cookiePresent}`,
  );
  if (w === '390') check(screens <= 1.6, `390: oferta ${screens.toFixed(2)} ekranu > 1.6`);
}
if (!OFF) {
  const ct = results.clickThrough;
  check(
    ct.links === 19 && ct.fails.length === 0,
    `przeklikanie: ${ct.links} linków, porażki ${JSON.stringify(ct.fails)}`,
  );
  lines.push(
    `przeklikanie: ${ct.links} linków (główny ${ct.main}, oferta ${ct.offer}), porażki ${ct.fails.length}`,
  );
}
for (const r of Object.values(results.widths))
  for (const st of ['closed', 'open', 'offer']) if (r[st]) delete r[st].text;
await fs.writeFile(path.join(OUT, 'probe.json'), JSON.stringify(results, null, 1));
console.log(lines.join('\n'));
console.log(`PROBE ${results.mode}: progi niespełnione=${failed}`);
process.exit(failed ? 1 : 0);
