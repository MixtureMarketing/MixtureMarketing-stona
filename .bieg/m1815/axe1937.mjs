#!/usr/bin/env node
/**
 * MIX-1815 r3: kopia .bieg/m1937/shots.mjs (gałąź p7-mix-1937, 44bc3da) do sprawdzenia kryteriów
 * MIX-1937 (axe 0 „incomplete color-contrast” w kalkulatorze, 0 serious/critical przy 390/1024/1366)
 * na budowie z pełnym zestawem przełączników Preview (także VITE_MM_RESULT_CONTACT i LEAD_CONFIG).
 * Jedyna zmiana: przycisk wysyłki „Wyślij i umów rozmowę” (LEAD_CONFIG) = „Poznaj widełki”.
 * MIX-1894: kopia .bieg/m1867/shots.mjs + pomiar ramek wokół odpowiedzi, szerokość odpowiedzi
 * względem ekranu, axe incomplete color-contrast i odcisk DOM starego wyglądu (produkcja bez zmian).
 * MIX-1867: zrzuty i pomiary kalkulatora /wycena/ (wzór: .bieg/m1790/probe.mjs).
 *
 *   node .bieg/m1867/shots.mjs local <dist> <out> <tag>   lokalna budowa, API i Turnstile = atrapy
 *   node .bieg/m1867/shots.mjs serve <dist> <port>         sam serwer z atrapą API (dla Lighthouse)
 *   node .bieg/m1867/shots.mjs prod <out>                  produkcja, tylko GET z mixturemarketing.pl,
 *                                                          bez analityki, bez wysyłki formularza
 *
 * local: 390/1024/1366 px, kroki do wyniku + stany (ładowanie, błąd walidacji, błąd zabezpieczenia,
 * błąd ładowania); cele dotyku w kalkulatorze; axe (wcag2a/aa, 21aa, 22aa) na krokach; przejście
 * całego kalkulatora samą klawiaturą (Tab/Spacja/Enter/pisanie) do ekranu wyniku.
 * Wynik: <out>/<tag>.json + <out>/shots/*.jpg. Kod 0 zawsze (progi ocenia raport z JSON).
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const [mode, a1, a2, a3] = process.argv.slice(2);
const UA =
  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36 MixtureE2E/1';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const QUESTIONS = {
  questions: [
    {
      code: 'project_goal',
      text: 'Jaki jest cel projektu?',
      help_text: 'Wybierz typ najbliższy temu, co planujesz.',
      answer_type: 'select',
      options: [
        { value: 'sklep', label: 'Sklep internetowy' },
        { value: 'wizytowka', label: 'Strona wizytówka' },
        { value: 'portal', label: 'Portal lub serwis' },
        { value: 'aplikacja', label: 'Aplikacja webowa' },
      ],
      visible_if: null,
      group: 'projekt',
      sort_order: 1,
    },
    {
      code: 'has_brand',
      text: 'Czy masz już logo i identyfikację wizualną?',
      help_text: null,
      answer_type: 'bool',
      options: null,
      visible_if: null,
      group: 'projekt',
      sort_order: 2,
    },
    {
      code: 'languages',
      text: 'Ile wersji językowych?',
      help_text: 'Liczymy razem z polską.',
      answer_type: 'number',
      options: null,
      visible_if: null,
      group: 'platforma',
      sort_order: 3,
    },
    {
      code: 'integrations',
      text: 'Jakie integracje są potrzebne?',
      help_text: null,
      answer_type: 'multiselect',
      options: [
        { value: 'platnosci', label: 'Płatności online' },
        { value: 'crm', label: 'CRM' },
        { value: 'newsletter', label: 'Newsletter' },
      ],
      visible_if: null,
      group: 'integracje',
      sort_order: 4,
    },
  ],
};
const PRICE = { min: 27500, max: 53000 };

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
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

async function serve(distArg, port = 0) {
  const DIST = path.resolve(distArg);
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/api/estimation/public-questions') {
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify(QUESTIONS));
    }
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
      res.writeHead(200, {
        'content-type': MIME[path.extname(file)] || 'application/octet-stream',
      });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(port, '127.0.0.1', r));
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

if (mode === 'serve') {
  const { origin } = await serve(a1, Number(a2));
  console.log(`serve ${origin}`);
  await new Promise(() => {});
}

const VIEWPORTS = [
  { name: '390', width: 390, height: 844, mobile: true },
  { name: '1024', width: 1024, height: 768, mobile: false },
  { name: '1366', width: 1366, height: 768, mobile: false },
];
const CALC = '[data-calc-ui], .max-w-2xl > div.rounded-3xl';

async function shot(page, out, name) {
  await sleep(250);
  const el = await page.$('section div.max-w-2xl');
  const file = path.join(out, 'shots', `${name}.jpg`);
  if (el) await el.screenshot({ path: file, type: 'jpeg', quality: 55 });
  else await page.screenshot({ path: file, type: 'jpeg', quality: 55 });
}

/** Klik w przycisk o dokładnym tekście (bez znaków strzałek). */
async function clickText(page, text) {
  const ok = await page.evaluate((t) => {
    const b = [...document.querySelectorAll('button, a')].find(
      (x) => {
        const s = x.textContent.replace(/[←→]/g, '').trim();
        return (s === t || (t === 'Poznaj widełki' && s === 'Wyślij i umów rozmowę')) && !x.disabled;
      },
    );
    if (!b) return false;
    b.click();
    return true;
  }, text);
  if (!ok) throw new Error(`brak przycisku ${text}`);
}

async function axe(page) {
  await page.addScriptTag({ path: path.resolve('node_modules/axe-core/axe.min.js') });
  return page.evaluate(async () => {
    const r = await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    const calc = document.querySelector('section div.max-w-2xl');
    const inside = (n) => {
      try {
        const el = n.target.length === 1 ? document.querySelector(n.target[0]) : null;
        return !!(el && calc && calc.contains(el));
      } catch {
        return false;
      }
    };
    const inc = [];
    for (const v of r.incomplete.filter((x) => x.id === 'color-contrast')) {
      const inC = v.nodes.filter(inside);
      const out = v.nodes.filter((n) => !inside(n));
      if (inC.length)
        inc.push({ id: 'incomplete-color-contrast-kalkulator', impact: 'serious', n: inC.length, inCalc: inC.length, sel: inC.slice(0, 10).map((n) => n.target.join(' ') + ' :: ' + (n.any[0]?.message || '').slice(0, 80)) });
      // MIX-1937: węzły poza kalkulatorem (nagłówek, menu, hero) tylko do wiadomości, nie liczą się.
      if (out.length) inc.push({ id: 'incomplete-color-contrast-poza', impact: 'poza', n: out.length, sel: [] });
      if (out.length) window.__incPoza = { n: out.length, sel: out.slice(0, 4).map((n) => n.target.join(' ') + ' :: ' + (n.any[0]?.data?.messageKey || '')) };
    }
    return inc.concat(r.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => ({
        id: v.id,
        impact: v.impact,
        n: v.nodes.length,
        inCalc: v.nodes.filter((n) => n.target.join(' ').includes('max-w-2xl') || true).length,
        sel: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
      })));
  });
}

/** Ramki (obramowanie ≥ 1 px) i tła między odpowiedzią a sekcją; szerokość odpowiedzi / ekran. */
async function incPoza(page) {
  return page.evaluate(() => window.__incPoza || { n: 0, sel: [] });
}

async function layout(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const root = document.querySelector('section div.max-w-2xl');
    if (!root) return { err: 'brak kalkulatora' };
    const answers = [
      ...root.querySelectorAll('[role="radio"], [role="checkbox"], button[aria-pressed], input[type="number"], input[type="email"], a[href="/contact/"]'),
    ].filter((e) => e.getBoundingClientRect().width > 0);
    if (!answers.length) return { err: 'brak odpowiedzi' };
    const minW = Math.min(...answers.map((e) => e.getBoundingClientRect().width));
    const frames = [];
    const bgs = [];
    for (let p = answers[0].parentElement; p && p !== root.parentElement; p = p.parentElement) {
      const cs = getComputedStyle(p);
      const bw = ['Top', 'Right', 'Bottom', 'Left'].filter(
        (k) => parseFloat(cs[`border${k}Width`]) > 0 && cs[`border${k}Style`] !== 'none',
      );
      const name = `${p.tagName}${p.dataset.calcUi ? '[calc]' : ''}${p.dataset.testid ? '#' + p.dataset.testid : ''}`;
      if (bw.length === 4) frames.push(name);
      const bg = cs.backgroundColor;
      if (bg && bg !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(bg)) bgs.push(`${name}:${bg}`);
    }
    const shell = root.querySelector('[data-calc-ui]') || root.firstElementChild;
    const r = shell.getBoundingClientRect();
    const cs = getComputedStyle(shell);
    return {
      vw,
      answers: answers.length,
      minAnswerW: Math.round(minW),
      ratio: Math.round((minW / vw) * 1000) / 10,
      frames,
      nFrames: frames.length,
      bgs,
      shell: { x: Math.round(r.left), w: Math.round(r.width), padL: cs.paddingLeft, border: cs.borderTopWidth },
      hScroll: document.documentElement.scrollWidth > vw,
    };
  });
}

/** Odcisk DOM kalkulatora (stary wygląd): ma być identyczny przed i po zmianie. */
async function domPrint(page) {
  return page.evaluate(async () => {
    const el = document.querySelector('section div.max-w-2xl');
    const html = el ? el.outerHTML : '';
    const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(html));
    return [...new Uint8Array(d)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('') + `/${html.length}`;
  });
}

async function targets(page) {
  return page.evaluate(() => {
    const root = document.querySelector('section div.max-w-2xl');
    if (!root) return { n: 0, small: [] };
    const els = [...root.querySelectorAll('button, input:not([tabindex="-1"]), a')].filter(
      (e) => e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden',
    );
    const small = els
      .filter((e) => {
        const r = e.getBoundingClientRect();
        // Link w zdaniu (klauzula RODO) jest wyjątkiem WCAG 2.5.8 (inline).
        if (e.tagName === 'A' && getComputedStyle(e).display === 'inline') return false;
        return r.height < 44 || r.width < 44;
      })
      .map((e) => {
        const r = e.getBoundingClientRect();
        return `${e.tagName}:${(e.textContent || e.getAttribute('aria-label') || e.id).trim().slice(0, 30)}:${Math.round(r.width)}x${Math.round(r.height)}`;
      });
    return { n: els.length, small };
  });
}

async function newPage(browser, origin, vp, opts = {}) {
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.setViewport({
    width: vp.width,
    height: vp.height,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    deviceScaleFactor: 1,
  });
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const u = new URL(req.url());
    if (u.origin !== origin) return req.abort();
    if (u.pathname === '/api/estimation/public-questions') {
      if (opts.questionsFail)
        return req.respond({ status: 500, contentType: 'application/json', body: '{}' });
      return setTimeout(
        () =>
          req.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(QUESTIONS),
          }),
        opts.questionsDelay ?? 0,
      );
    }
    if (u.pathname === '/api/estimation/public-preview' && req.method() === 'POST')
      return setTimeout(
        () =>
          req.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ priceRange: PRICE, scope: [], preview_token: 'p' }),
          }),
        150,
      );
    if (u.pathname === '/api/estimation/public-quote' && req.method() === 'POST')
      return setTimeout(
        () =>
          req.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ priceRange: PRICE }),
          }),
        opts.quoteDelay ?? 300,
      );
    if (req.method() !== 'GET') return req.abort();
    return req.continue();
  });
  await page.evaluateOnNewDocument((captchaFail) => {
    localStorage.setItem(
      'cookie-consent-v2',
      JSON.stringify({ analytics: false, marketing: false }),
    );
    window.turnstile = {
      render: () => {
        if (captchaFail) throw new Error('110200');
        return 'w1';
      },
      execute: () => {},
      reset: () => {},
      getResponse: () => (captchaFail ? '' : 'tok-mock'),
      remove: () => {},
      ready: (cb) => cb(),
    };
  }, !!opts.captchaFail);
  return page;
}

async function runLocal(dist, out, tag) {
  await fs.mkdir(path.join(out, 'shots'), { recursive: true });
  const { server, origin } = await serve(dist);
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const res = { tag, viewports: {}, errors: [] };
  const URL_W = `${origin}/wycena/`;
  for (const vp of VIEWPORTS) {
    const r = (res.viewports[vp.name] = { axe: {}, targets: {}, layout: {}, dom: {} });
    try {
      // 01 ładowanie (pytania z opóźnieniem)
      let page = await newPage(browser, origin, vp, { questionsDelay: 2500 });
      await page.goto(URL_W, { waitUntil: 'domcontentloaded' });
      await sleep(900);
      await shot(page, out, `${tag}-${vp.name}-01-ladowanie`);
      await page.waitForSelector('[role="radiogroup"]', { timeout: 15000 });
      await shot(page, out, `${tag}-${vp.name}-02-krok1`);
      r.axe.krok1 = await axe(page);
      r.targets.krok1 = await targets(page);
      r.layout.krok1 = await layout(page);
      r.incPoza = await incPoza(page);
      r.dom.krok1 = await domPrint(page);
      await clickText(page, 'Sklep internetowy');
      await clickText(page, 'Nie');
      await sleep(1600); // pasek ceny (podgląd co ≥ 1 s)
      await shot(page, out, `${tag}-${vp.name}-03-krok1-odpowiedzi`);
      // MIX-1937: axe po odpowiedziach (pasek ceny widoczny) i przycisk cookies vs znaczniki opcji.
      r.axe.krok1odp = await axe(page);
      if (vp.name === '390') {
        r.cookie = {};
        for (const block of ['end', 'center']) {
          r.cookie[block] = await page.evaluate((b) => {
            const opts = [...document.querySelectorAll('section div.max-w-2xl [data-mark]')];
            const last = opts[opts.length - 1];
            if (!last) return { err: 'brak [data-mark]' };
            last.closest('button, [role=radio], [role=checkbox], label')?.scrollIntoView({ block: b });
            const c = document.querySelector('.cookie-floating-btn');
            if (!c) return { err: 'brak .cookie-floating-btn' };
            const cr = c.getBoundingClientRect();
            const ov = (r) => Math.max(0, Math.min(r.right, cr.right) - Math.max(r.left, cr.left)) * Math.max(0, Math.min(r.bottom, cr.bottom) - Math.max(r.top, cr.top));
            const opt = last.closest('button, [role=radio], [role=checkbox], label');
            const mr = last.getBoundingClientRect();
            const or = opt ? opt.getBoundingClientRect() : mr;
            const r4 = (r) => [r.left, r.top, r.width, r.height].map(Math.round);
            return {
              cookie: r4(cr), mark: r4(mr), opcja: r4(or), etykieta: opt?.textContent?.trim().slice(0, 20),
              mark_zasloniete_px2: Math.round(ov(mr)), mark_pole_px2: Math.round(mr.width * mr.height),
              opcja_zasloniete_px2: Math.round(ov(or)),
              na_wierzchu_w_srodku_znacznika: (() => { const e = document.elementFromPoint(mr.left + mr.width / 2, mr.top + mr.height / 2); return e ? (c.contains(e) ? 'cookies' : last.contains(e) || e === last ? 'znacznik' : e.tagName) : null; })(),
            };
          }, block);
          await sleep(300);
          await page.screenshot({ path: path.join(out, 'shots', `${tag}-390-12-cookies-${block}.jpg`), type: 'jpeg', quality: 55 });
        }
      }
      await clickText(page, 'Dalej');
      await page.waitForSelector('input[type="number"]');
      await page.type('input[type="number"]', '2');
      await sleep(1200);
      await shot(page, out, `${tag}-${vp.name}-04-krok2`);
      r.targets.krok2 = await targets(page);
      r.layout.krok2 = await layout(page);
      r.axe.krok2 = await axe(page);
      await clickText(page, 'Dalej');
      await clickText(page, 'Płatności online');
      await sleep(1200);
      await shot(page, out, `${tag}-${vp.name}-05-krok3`);
      r.axe.krok3 = await axe(page);
      r.layout.krok3 = await layout(page);
      await clickText(page, 'Dalej');
      await page.waitForSelector('#calc-email');
      await shot(page, out, `${tag}-${vp.name}-06-kontakt`);
      r.targets.kontakt = await targets(page);
      r.layout.kontakt = await layout(page);
      r.axe.kontakt = await axe(page);
      await clickText(page, 'Poznaj widełki'); // pusty e-mail = błąd walidacji (bez wysyłki)
      await sleep(400);
      await shot(page, out, `${tag}-${vp.name}-07-blad-walidacji`);
      r.axe.blad = await axe(page);
      r.layout.blad = await layout(page);
      await page.type('#calc-email', 'test@example.com');
      await clickText(page, 'Poznaj widełki');
      await sleep(120);
      await shot(page, out, `${tag}-${vp.name}-08-wysylanie`);
      await page.waitForFunction(() => /Policz jeszcze raz/.test(document.body.textContent), {
        timeout: 15000,
      });
      await shot(page, out, `${tag}-${vp.name}-09-wynik`);
      r.axe.wynik = await axe(page);
      r.targets.wynik = await targets(page);
      r.layout.wynik = await layout(page);
      await page.close();

      if (vp.name !== '1024') {
        // 10 błąd zabezpieczenia (Turnstile nie wydaje tokenu)
        page = await newPage(browser, origin, vp, { captchaFail: true });
        await page.goto(URL_W, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('[role="radiogroup"]', { timeout: 15000 });
        await clickText(page, 'Sklep internetowy');
        await clickText(page, 'Dalej');
        await clickText(page, 'Dalej');
        await clickText(page, 'Dalej');
        await page.waitForSelector('#calc-email');
        await page.type('#calc-email', 'test@example.com');
        await clickText(page, 'Poznaj widełki');
        await page
          .waitForFunction(
            () => /zabezpieczenia|antybotowa/.test(document.body.textContent),
            { timeout: 40000 },
          )
          .catch(() => res.errors.push(`${vp.name}: brak komunikatu zabezpieczenia w 40 s`));
        await shot(page, out, `${tag}-${vp.name}-10-blad-zabezpieczenia`);
        r.captchaText = await page.evaluate(() =>
          /Nie udało się uruchomić zabezpieczenia, odśwież stronę/.test(document.body.textContent),
        );
        await page.close();
        // 11 błąd ładowania
        page = await newPage(browser, origin, vp, { questionsFail: true });
        await page.goto(URL_W, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => /Spróbuj ponownie/.test(document.body.textContent), {
          timeout: 15000,
        });
        await shot(page, out, `${tag}-${vp.name}-11-blad-ladowania`);
        r.axe.bladLadowania = await axe(page);
        await page.close();
      }

      // Klawiatura: od góry strony do wyniku bez myszy.
      page = await newPage(browser, origin, vp);
      await page.goto(URL_W, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[role="radiogroup"]', { timeout: 15000 });
      const kb = { tabs: 0, ok: false, log: [] };
      const focused = () =>
        page.evaluate(() => {
          const e = document.activeElement;
          return {
            tag: e?.tagName,
            role: e?.getAttribute('role'),
            text: (e?.textContent || '').replace(/[←→]/g, '').trim().slice(0, 40),
            type: e?.getAttribute('type'),
            inCalc: !!e?.closest('section div.max-w-2xl'),
          };
        });
      const tabTo = async (pred, label) => {
        for (let i = 0; i < 80; i++) {
          await page.keyboard.press('Tab');
          kb.tabs++;
          const f = await focused();
          if (pred(f)) {
            kb.log.push(`${label}@${kb.tabs}`);
            return true;
          }
        }
        throw new Error(`klawiatura: nie doszedłem do ${label}`);
      };
      try {
        await tabTo((f) => f.role === 'radio' && f.text === 'Sklep internetowy', 'opcja');
        await page.keyboard.press('Space');
        await tabTo((f) => f.text === 'Dalej', 'dalej1');
        await page.keyboard.press('Enter');
        kb.headingAfterNext = (await focused()).tag;
        await tabTo((f) => f.type === 'number', 'liczba');
        await page.keyboard.type('3');
        await tabTo((f) => f.text === 'Dalej', 'dalej2');
        await page.keyboard.press('Enter');
        await tabTo((f) => f.text === 'Dalej', 'dalej3');
        await page.keyboard.press('Enter');
        await tabTo((f) => f.type === 'email', 'email');
        await page.keyboard.type('test@example.com');
        await tabTo(
          (f) => f.text === 'Poznaj widełki' || f.text === 'Wyślij i umów rozmowę',
          'wyslij',
        );
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => /Policz jeszcze raz/.test(document.body.textContent), {
          timeout: 15000,
        });
        kb.resultFocus = (await focused()).tag;
        await tabTo((f) => f.text === 'Umów rozmowę', 'cta');
        kb.ok = true;
      } catch (e) {
        kb.err = String(e.message || e);
      }
      r.keyboard = kb;
      await page.close();
    } catch (e) {
      res.errors.push(`${vp.name}: ${e.message || e}`);
    }
  }
  await browser.close();
  server.close();
  await fs.writeFile(path.join(out, `${tag}.json`), JSON.stringify(res, null, 1));
  console.log(`LOCAL ${tag} ${JSON.stringify(summary(res))}`);
}

function summary(res) {
  const s = { errors: res.errors };
  for (const [k, v] of Object.entries(res.viewports)) {
    const axeAll = Object.entries(v.axe || {}).flatMap(([step, list]) =>
      list.filter((x) => x.impact !== 'poza').map((x) => `${step}:${x.id}(${x.impact},${x.n})`),
    );
    const poza = Object.entries(v.axe || {}).flatMap(([step, list]) =>
      list.filter((x) => x.impact === 'poza').map((x) => `${step}:${x.n}`),
    );
    const small = Object.entries(v.targets || {}).flatMap(([step, t]) =>
      t.small.map((x) => `${step}:${x}`),
    );
    s[k] = {
      axe_serious_critical: axeAll.length,
      axe: axeAll.slice(0, 20),
      inc_poza_kalkulatora: poza,
      cookie: v.cookie || null,
      targets_small: small.length,
      small: small.slice(0, 8),
      keyboard: v.keyboard
        ? {
            ok: v.keyboard.ok,
            tabs: v.keyboard.tabs,
            headingAfterNext: v.keyboard.headingAfterNext,
            resultFocus: v.keyboard.resultFocus,
            err: v.keyboard.err,
          }
        : null,
      captchaText: v.captchaText,
      layout: Object.fromEntries(
        Object.entries(v.layout || {}).map(([k, l]) => [
          k,
          l.err || `ratio=${l.ratio}% minW=${l.minAnswerW}/${l.vw} ramki=${l.nFrames}[${l.frames.join(',')}] tla=[${l.bgs.join(',')}] shell=${l.shell.x}+${l.shell.w} pad=${l.shell.padL} border=${l.shell.border} hScroll=${l.hScroll}`,
        ]),
      ),
      dom: v.dom,
      incPoza: v.incPoza,
    };
  }
  return s;
}

async function runProd(out) {
  await fs.mkdir(path.join(out, 'shots'), { recursive: true });
  const ORIGIN = 'https://mixturemarketing.pl';
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const res = { viewports: {}, errors: [], requests: 0 };
  let nextSlot = 0;
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      deviceScaleFactor: 1,
    });
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const u = new URL(req.url());
      // Tylko GET z własnej domeny; bez Zaraz/analityki, bez Turnstile, bez żadnych POST.
      if (u.origin !== ORIGIN || req.method() !== 'GET' || u.pathname.startsWith('/cdn-cgi/'))
        return req.abort();
      // Zasada pomiarów (CLAUDE.md): ≤ 1 żądanie/s do produkcji — kolejka z odstępem 1,05 s.
      const at = Math.max(Date.now(), nextSlot);
      nextSlot = at + 1050;
      res.requests++;
      setTimeout(() => req.continue().catch(() => {}), at - Date.now());
    });
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem(
        'cookie-consent-v2',
        JSON.stringify({ analytics: false, marketing: false }),
      );
    });
    try {
      await page.goto(`${ORIGIN}/wycena/`, { waitUntil: 'networkidle2', timeout: 240000 });
      await page.waitForSelector('[role="radiogroup"], [role="group"]', { timeout: 120000 });
      let step = 1;
      for (; step < 12; step++) {
        await shot(page, out, `prod-${vp.name}-krok${String(step).padStart(2, '0')}`);
        const isLast = await page.evaluate(() => !!document.querySelector('#calc-email'));
        if (isLast) break;
        // Pierwsza opcja każdej grupy wyboru (bez wysyłki; tylko stan w przeglądarce).
        await page.evaluate(() => {
          for (const g of document.querySelectorAll('[role="radiogroup"], [role="group"]'))
            g.querySelector('button')?.click();
        });
        await sleep(300);
        await clickText(page, 'Dalej');
        await sleep(300);
      }
      // Pusty e-mail: walidacja w przeglądarce, żadne zapytanie nie wychodzi.
      await clickText(page, 'Poznaj widełki');
      await sleep(400);
      await shot(page, out, `prod-${vp.name}-krok${String(step).padStart(2, '0')}-blad-walidacji`);
      res.viewports[vp.name] = { steps: step };
    } catch (e) {
      res.errors.push(`${vp.name}: ${e.message || e}`);
      await shot(page, out, `prod-${vp.name}-blad`).catch(() => {});
    }
    await page.close();
    await sleep(3000);
  }
  await browser.close();
  await fs.writeFile(path.join(out, 'prod.json'), JSON.stringify(res, null, 1));
  console.log(`PROD ${JSON.stringify(res)}`);
}

if (mode === 'local') await runLocal(a1, path.resolve(a2), a3);
else if (mode === 'prod') await runProd(path.resolve(a1));
else if (mode !== 'serve') {
  console.error('użycie: shots.mjs local <dist> <out> <tag> | serve <dist> <port> | prod <out>');
  process.exit(2);
}
