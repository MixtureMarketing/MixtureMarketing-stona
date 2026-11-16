#!/usr/bin/env node
/**
 * MIX-1816 (Z13): próba osi czasu na ekranie wyniku /wycena/ w prawdziwej przeglądarce
 * (wzór .bieg/m1799/probe.mjs: serwer statyczny na localhost, ruch poza localhost abortowany,
 * API wyceny i Turnstile to atrapy).
 *
 *   node .bieg/m1816/probe.mjs <dist> <out> on    (budowa z VITE_MM_NEW_CLIENT_TIMELINE=1)
 *   node .bieg/m1816/probe.mjs <dist> <out> off   (budowa bez przełącznika)
 *
 * on, 390/1024/1366 px: sekcja jest, <ol> z 3 <li>, nagłówki h1,h2,h3,h3,h3; brak przewijania
 * poziomego (też z 400-znakowym słowem w punkcie); przycisk ciasteczek nakłada się na sekcję 0 px²
 * (widoczny przycisk, pomiar co 50 px przewijania) i wraca na górze strony; axe (wcag2a/aa/22aa):
 * 0 serious/critical w sekcji i na ekranie wyniku (reszta strony: tylko wypis pageNodes);
 * prefers-reduced-motion: 0 animacji.
 * MIX-1885: gradienty tła wyłączone na czas axe (PROBE_OVERLAY=keep je zostawia);
 * color-contrast w `incomplete` na ekranie wyniku = błąd; własny pomiar kontrastu podtytułu ≥ 4,5:1.
 * off: 0 elementów osi czasu, ekran wyniku identyczny z zapisem .bieg/m1816/base.html.
 * Wynik: <out>/probe.json; kod 0 = progi spełnione, 1 = nie, 2 = złe wywołanie.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

// MIX-1892: czwarty argument = wygląd kalkulatora zbudowany w <dist> (old = bez VITE_MM_CALC_NEW_UI,
// new = VITE_MM_CALC_NEW_UI=1); sonda sprawdza, że wynik jest w tym wyglądzie, a oś czasu (gdy
// włączona) jest ostatnim elementem ekranu wyniku.
const [distArg, outArg, mode, ui = 'old'] = process.argv.slice(2);
if (!distArg || !outArg || !['on', 'off'].includes(mode) || !['old', 'new'].includes(ui)) {
  console.error('użycie: probe.mjs <dist> <out> on|off [old|new]');
  process.exit(2);
}
const DIST = path.resolve(distArg);
const OUT = path.resolve(outArg);
await fs.mkdir(path.join(OUT, 'shots'), { recursive: true });
const BASE_HTML = (await fs.readFile(new URL('./base.html', import.meta.url), 'utf8')).trim();
const AXE_JS = path.resolve('node_modules/axe-core/axe.min.js');

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
};
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
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

const QUESTIONS = {
  questions: [
    {
      code: 'project_goal',
      text: 'Jaki jest cel projektu?',
      help_text: null,
      answer_type: 'select',
      options: [
        { value: 'sklep', label: 'Sklep internetowy' },
        { value: 'wizytowka', label: 'Wizytówka' },
      ],
      visible_if: null,
      group: 'projekt',
      sort_order: 1,
    },
  ],
};
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 MixtureE2E/1';
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const results = { mode, ui };
const SCREEN_SEL = ui === 'new' ? '[data-testid="calc-result"]' : 'div.text-center.space-y-6';
const fails = [];
const check = (ok, msg) => {
  if (!ok) fails.push(msg);
};
const VIEWPORTS =
  mode === 'on'
    ? [
        { name: 'm390', width: 390, height: 844, mobile: true, shots: true },
        { name: 'd1024', width: 1024, height: 768, mobile: false, shots: false },
        { name: 'd1366', width: 1366, height: 768, mobile: false, shots: true },
      ]
    : [{ name: 'm390', width: 390, height: 844, mobile: true, shots: false }];

async function openResult(vp, reducedMotion = false) {
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.setViewport({
    width: vp.width,
    height: vp.height,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    deviceScaleFactor: 1,
  });
  if (reducedMotion)
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setRequestInterception(true);
  const blocked = [];
  const calls = [];
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin === ORIGIN && u.pathname.startsWith('/api/'))
      calls.push(req.method() + ' ' + u.pathname);
    if (u.origin !== ORIGIN) {
      blocked.push(u.host);
      return req.abort();
    }
    if (u.pathname === '/api/estimation/public-questions' && req.method() === 'GET')
      return req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(QUESTIONS),
      });
    if (u.pathname === '/api/estimation/public-quote' && req.method() === 'POST')
      return req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ priceRange: { min: 27500, max: 53000 } }),
      });
    if (req.method() !== 'GET') return req.abort();
    return req.continue();
  });
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem(
      'cookie-consent-v2',
      JSON.stringify({ analytics: false, marketing: false }),
    );
    window.turnstile = {
      render: () => 'w1',
      execute: () => {},
      reset: () => {},
      getResponse: () => 'tok-mock',
      remove: () => {},
    };
  });
  page.on('pageerror', (e) => console.error(`[${vp.name}] pageerror: ${e.message}`));
  await page.goto(`${ORIGIN}/wycena/`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('[role="radiogroup"]');
  await page.evaluate(() =>
    [...document.querySelectorAll('[role="radio"]')]
      .find((e) => e.textContent.includes('Sklep internetowy'))
      .click(),
  );
  const clickText = (t) =>
    page.evaluate((txt) => {
      const b = [...document.querySelectorAll('button')].find(
        (e) => e.textContent.replace('→', '').trim() === txt,
      );
      if (!b) return false;
      b.click();
      return true;
    }, t);
  for (let i = 0; i < 4 && !(await page.$('#calc-email')); i += 1) {
    await clickText('Dalej');
    await new Promise((r) => setTimeout(r, 200));
  }
  await page.type('#calc-email', 'jan@firma.pl');
  await clickText('Poznaj widełki');
  try {
    await page.waitForFunction(() => /orientacyjne widełki/i.test(document.body.innerText), {
      timeout: 8000,
    });
  } catch (e) {
    const snap = await page.evaluate(() => ({
      text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 700),
      buttons: [...document.querySelectorAll('button')]
        .map((b) => b.textContent.trim())
        .slice(0, 12),
      alerts: [...document.querySelectorAll('[role="alert"]')].map((x) => x.textContent.trim()),
      checked: [...document.querySelectorAll('[role="radio"][aria-checked="true"]')].length,
    }));
    console.error(
      'NIE DOSZLO DO WYNIKU: ' +
        JSON.stringify(snap) +
        ' blocked=' +
        JSON.stringify(blocked.slice(0, 8)) +
        ' calls=' +
        JSON.stringify(calls),
    );
    throw e;
  }
  await new Promise((r) => setTimeout(r, 300));
  await page.addStyleTag({ content: '*{transition:none!important}' });
  return page;
}

const frames = (page) =>
  page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
const measure = (page) =>
  page.evaluate(() => {
    const r = (e) => {
      if (!e) return null;
      const b = e.getBoundingClientRect();
      return { x: b.x, y: b.y, w: b.width, h: b.height };
    };
    const ov = (a, b) => {
      if (!a || !b) return 0;
      const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      return w > 0 && h > 0 ? Math.round(w * h) : 0;
    };
    const sec = r(document.querySelector('[data-testid="new-client-timeline"]'));
    const cookieEl = [...document.querySelectorAll('.cookie-floating-btn')].find(
      (e) => e.getBoundingClientRect().width > 0,
    );
    const cs = cookieEl ? getComputedStyle(cookieEl) : null;
    const shown = !!cookieEl && cs.visibility !== 'hidden' && Number(cs.opacity) > 0;
    const c = cookieEl ? r(cookieEl) : null;
    return { shown, covered: shown ? ov(sec, c) : 0, raw: ov(sec, c), hasCookie: !!cookieEl };
  });

for (const vp of VIEWPORTS) {
  if (mode === 'off') {
    const page = await openResult(vp);
    const info = await page.evaluate(
      (sel) => ({
        sections: document.querySelectorAll('[data-testid="new-client-timeline"]').length,
        text: /co dostajesz i kiedy/i.test(document.body.innerText),
        html: document.querySelector(sel)?.outerHTML ?? null,
        oldScreen: !!document.querySelector('div.text-center.space-y-6'),
        newScreen: !!document.querySelector('[data-testid="calc-result"]'),
        flag: document.body.dataset.timelineCookie ?? null,
      }),
      SCREEN_SEL,
    );
    results[vp.name] = {
      sections: info.sections,
      text: info.text,
      identical: info.html === BASE_HTML,
      oldScreen: info.oldScreen,
      newScreen: info.newScreen,
    };
    check(info.sections === 0 && !info.text, `${vp.name} off: oś czasu w DOM`);
    check(info.html !== null, `${vp.name} off: brak ekranu wyniku w wyglądzie ${ui}`);
    check(info.newScreen === (ui === 'new'), `${vp.name} off: wygląd wyniku inny niż ${ui}`);
    // stary wygląd bez osi: DOM wyniku dosłownie jak przed MIX-1816 (zrzut base.html)
    if (ui === 'old') check(info.html === BASE_HTML, `${vp.name} off: DOM wyniku inny niż przed zmianą`);
    check(info.flag === null, `${vp.name} off: znacznik ciasteczek`);
    if (info.html !== BASE_HTML) console.error(`off html: ${info.html}`);
    await page.close();
    continue;
  }

  const page = await openResult(vp);
  const structure = await page.evaluate((sel) => {
    const s = document.querySelector('[data-testid="new-client-timeline"]');
    const box = document.querySelector(sel);
    const ol = s?.querySelector('ol');
    return {
      present: !!s,
      lastInScreen: !!(s && box && box.lastElementChild === s),
      newScreen: !!document.querySelector('[data-testid="calc-result"]'),
      olItems: ol ? [...ol.children].map((li) => li.tagName) : [],
      headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => h.tagName),
      periods: [...(s?.querySelectorAll('h3') ?? [])].map((h) => h.textContent),
      points: [...(s?.querySelectorAll('ol > li') ?? [])].map(
        (li) => li.querySelectorAll('ul > li').length,
      ),
    };
  }, SCREEN_SEL);
  const scrollW = () =>
    page.evaluate(() => ({
      doc: document.documentElement.scrollWidth,
      win: window.innerWidth,
      sec: (() => {
        const s = document.querySelector('[data-testid="new-client-timeline"]');
        return s ? [s.scrollWidth, s.clientWidth] : null;
      })(),
    }));
  const sw = await scrollW();
  await page.evaluate(() => window.scrollTo(0, 0));
  await frames(page);
  const atTop = await measure(page);
  const maxY = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  );
  const sweep = { steps: 0, covered: 0, raw: 0, cookieHiddenSteps: 0 };
  for (let y = 0; y <= maxY; y += 50) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await frames(page);
    const m = await measure(page);
    sweep.steps += 1;
    sweep.covered = Math.max(sweep.covered, m.covered);
    sweep.raw = Math.max(sweep.raw, m.raw);
    if (!m.shown) sweep.cookieHiddenSteps += 1;
  }
  if (vp.shots) {
    await page.evaluate(() =>
      document
        .querySelector('[data-testid="new-client-timeline"]')
        ?.scrollIntoView({ block: 'center', behavior: 'instant' }),
    );
    await frames(page);
    await page.screenshot({
      path: path.join(OUT, 'shots', `${vp.name}-timeline.jpg`),
      type: 'jpeg',
      quality: 70,
    });
  }
  // MIX-1885: gradienty tła (warstwa `fixed inset-0 z-[100]` nad stroną i tła przodków) sprawiają,
  // że axe odkłada kontrast tekstów do `incomplete` (bgGradient) = fałszywe zero. Na czas pomiaru
  // wyłączamy `background-image` wszystkim elementom (jak weryfikator MIX-1816; PROBE_OVERLAY=keep
  // zostawia gradienty, do testu sondy), a `incomplete` color-contrast na ekranie wyniku = błąd.
  const overlays = await page.evaluate((keep) => {
    const found = [...document.querySelectorAll('*')].filter((el) =>
      getComputedStyle(el).backgroundImage.includes('gradient'),
    ).length;
    if (!keep) {
      const st = document.createElement('style');
      st.id = 'probe-no-gradients';
      st.textContent = '*, *::before, *::after { background-image: none !important; }';
      document.head.append(st);
    }
    return { gradients: found, off: !keep };
  }, process.env.PROBE_OVERLAY === 'keep');
  // własny pomiar kontrastu podtytułu (WCAG 2.x, próg 4,5:1 dla zwykłego tekstu)
  const sub = await page.evaluate(() => {
    const rgb = (css) => {
      const c = document.createElement('canvas');
      c.width = c.height = 1;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.clearRect(0, 0, 1, 1);
      x.fillStyle = css;
      x.fillRect(0, 0, 1, 1);
      return [...x.getImageData(0, 0, 1, 1).data];
    };
    const lum = ([r, g, b]) =>
      [r, g, b]
        .map((v) => v / 255)
        .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
        .reduce((a, v, k) => a + v * [0.2126, 0.7152, 0.0722][k], 0);
    const hex = (a) =>
      '#' +
      a
        .slice(0, 3)
        .map((v) => v.toString(16).padStart(2, '0'))
        .join('');
    const p = document.querySelector('[data-testid="new-client-timeline"] h2 + p');
    if (!p) return null;
    let bg = null;
    for (let el = p; el && !bg; el = el.parentElement) {
      const c = rgb(getComputedStyle(el).backgroundColor);
      if (c[3] === 255) bg = c;
    }
    bg = bg ?? rgb(getComputedStyle(document.documentElement).backgroundColor);
    if (bg[3] !== 255) bg = [255, 255, 255, 255];
    const fg = rgb(getComputedStyle(p).color);
    const a = fg[3] / 255;
    const mix = fg.slice(0, 3).map((v, k) => Math.round(v * a + bg[k] * (1 - a)));
    const [l1, l2] = [lum(mix), lum(bg)].sort((m, n) => n - m);
    return {
      fg: hex(mix),
      bg: hex(bg),
      ratio: Math.round(((l1 + 0.05) / (l2 + 0.05)) * 100) / 100,
    };
  });
  // axe w prawdziwej przeglądarce (z kontrastem), na całym ekranie wyniku i w samej sekcji
  await page.addScriptTag({ path: AXE_JS });
  const axeRes = await page.evaluate(async () => {
    const res = await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
    });
    const sec = document.querySelector('[data-testid="new-client-timeline"]');
    const screenBox = sec?.parentElement ?? null;
    const inBox = (box, n) => {
      const el = document.querySelector(n.target[0]);
      return !!(el && box?.contains(el));
    };
    const bad = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    const inc = res.incomplete.filter((v) => v.id === 'color-contrast');
    return {
      all: bad.map((v) => ({ id: v.id, n: v.nodes.length })),
      screen: bad.flatMap((v) =>
        v.nodes.filter((n) => inBox(screenBox, n)).map((n) => `${v.id} ${n.target[0]}`),
      ),
      pageNodes: bad.flatMap((v) => v.nodes.map((n) => `${v.id} ${n.target[0]}`)).slice(0, 30),
      sectionNodes: bad.flatMap((v) => v.nodes.filter((n) => inBox(sec, n)).map(() => v.id)),
      incompleteScreen: inc.flatMap((v) =>
        v.nodes
          .filter((n) => inBox(screenBox, n))
          .map((n) => `${n.target[0]} ${(n.any[0]?.data?.messageKey ?? '').slice(0, 20)}`),
      ),
      incompletePage: inc.reduce((k, v) => k + v.nodes.length, 0),
    };
  });
  // długi tekst bez spacji w punkcie: bez przewijania poziomego
  await page.evaluate(() => {
    const li = document.querySelector('[data-testid="new-client-timeline"] ul > li');
    if (li) li.textContent = 'Z'.repeat(400);
  });
  await frames(page);
  const swLong = await scrollW();
  // prefers-reduced-motion: osobne ładowanie, 0 animacji w sekcji
  const rm = await openResult(vp, true);
  const anims = await rm.evaluate(
    () =>
      document
        .querySelector('[data-testid="new-client-timeline"]')
        ?.getAnimations({ subtree: true }).length ?? -1,
  );
  const rmMatch = await rm.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  await rm.close();
  await page.close();

  results[vp.name] = {
    structure,
    sw,
    swLong,
    atTop,
    sweep,
    overlays,
    sub,
    axe: axeRes,
    anims,
    rmMatch,
  };
  check(structure.present, `${vp.name}: brak sekcji`);
  check(structure.lastInScreen, `${vp.name}: oś czasu nie jest ostatnim elementem ekranu wyniku`);
  check(structure.newScreen === (ui === 'new'), `${vp.name}: wygląd wyniku inny niż ${ui}`);
  check(
    JSON.stringify(structure.olItems) === '["LI","LI","LI"]',
    `${vp.name}: <ol> ${JSON.stringify(structure.olItems)}`,
  );
  const hs = structure.headings;
  const iSec = hs.lastIndexOf('H2');
  check(
    hs[0] === 'H1' &&
      hs.slice(iSec).join() === 'H2,H3,H3,H3' &&
      hs.every((h, i) => i === 0 || Number(h[1]) <= Number(hs[i - 1][1]) + 1),
    `${vp.name}: kolejność nagłówków ${hs.join(',')}`,
  );
  check(
    JSON.stringify(structure.periods) === '["Tydzień 1","Miesiąc 1","90 dni"]',
    `${vp.name}: okresy ${JSON.stringify(structure.periods)}`,
  );
  check(
    structure.points.every((n) => n >= 1 && n <= 3),
    `${vp.name}: punkty ${structure.points}`,
  );
  check(sw.doc <= sw.win, `${vp.name}: przewijanie poziome ${sw.doc}>${sw.win}`);
  check(sw.sec && sw.sec[0] <= sw.sec[1], `${vp.name}: sekcja szersza niż jej pole`);
  check(
    swLong.doc <= swLong.win,
    `${vp.name}: długi tekst: przewijanie poziome ${swLong.doc}>${swLong.win}`,
  );
  check(
    swLong.sec && swLong.sec[0] <= swLong.sec[1],
    `${vp.name}: długi tekst: sekcja szersza niż jej pole ${JSON.stringify(swLong.sec)}`,
  );
  check(
    sweep.covered === 0 && atTop.covered === 0,
    `${vp.name}: przycisk ciasteczek nakłada się ${JSON.stringify({ sweep, atTop })}`,
  );
  check(atTop.shown, `${vp.name}: przycisk ciasteczek niewidoczny na górze`);
  check(sweep.cookieHiddenSteps < sweep.steps, `${vp.name}: przycisk schowany przez cały czas`);
  check(
    axeRes.sectionNodes.length === 0,
    `${vp.name}: axe w sekcji ${JSON.stringify(axeRes.sectionNodes)}`,
  );
  check(
    axeRes.screen.length === 0,
    `${vp.name}: axe serious/critical na ekranie wyniku ${JSON.stringify(axeRes.screen)}`,
  );
  check(
    axeRes.incompleteScreen.length === 0,
    `${vp.name}: axe incomplete color-contrast na ekranie wyniku ${JSON.stringify(axeRes.incompleteScreen)}`,
  );
  check(sub && sub.ratio >= 4.5, `${vp.name}: kontrast podtytułu ${JSON.stringify(sub)} < 4.5`);
  check(rmMatch && anims === 0, `${vp.name}: reduced-motion match=${rmMatch} animacji=${anims}`);
}

await browser.close();
server.close();
results.fails = fails.filter(Boolean);
await fs.writeFile(path.join(OUT, 'probe.json'), JSON.stringify(results, null, 2));
for (const [key, v] of Object.entries(results)) {
  if (key === 'fails' || key === 'mode') continue;
  console.log(`PROBE ${mode}-${ui} ${key}: ${JSON.stringify(v)}`);
}
console.log(`PROBE ${mode}-${ui} fails ${results.fails.length}: ${JSON.stringify(results.fails)}`);
process.exit(results.fails.length ? 1 : 0);
