#!/usr/bin/env node
/**
 * E2E CTA + lejki — czytelny dla człowieka test „czy kliknięcie CTA robi to, co obiecuje”,
 * w ŚWIEŻYM kontekście przeglądarki dla każdego sprawdzenia (zero sessionStorage/localStorage
 * z poprzedniego kroku — tak ukrył się błąd „pierwszy klik Wybierz pakiet nic nie robi”).
 *
 *   node scripts/e2e-cta-prod.mjs [baseUrl] [opcje]
 *
 *   baseUrl                 domyślnie https://mixturemarketing.pl (może być http://localhost:3000)
 *   --only=cta,funnels      co uruchomić (domyślnie oba)
 *   --viewports=desktop,mobile
 *   --pages=<regex>         filtr ścieżek z sitemapy (np. --pages='^/(abonament|contact)/')
 *   --funnels=<regex>       filtr lejków po nazwie (np. --funnels=abonament)
 *   --global=sample|all     CTA z nagłówka/stopki: na jednej stronie z każdej grupy (sample) albo wszędzie
 *   --concurrency=6         równoległe konteksty
 *   --paths=/a/,/b/         konkretne ścieżki zamiast sitemapy
 *   --out=<dir>             katalog na raport (report.md, results.json) i zrzuty ekranu
 *   E2E_CONSOLE=1           wypisuj konsolę stron (debug)
 *
 * Kod wyjścia: 0 = brak ✗, 1 = są błędy (szczegóły + zrzuty w --out), 2 = awaria skryptu.
 * Puppeteer (zależność projektu) zamiast Playwrighta — bez nowych paczek; HTTPS_PROXY z env
 * trafia do Chromium (poza localhost).
 *
 * BEZPIECZEŃSTWO (test może iść w produkcję): interceptor ABORTUJE każde żądanie inne niż
 * GET/HEAD/OPTIONS, każde żądanie do huba płatności, Stripe, Resend, Turnstile i analityki
 * (Zaraz /t, /rifd/, /cdn-cgi/rum, GA, GTM). Wyjątek — tylko w lejkach formularza kontaktowego:
 * POST /api/contact-submit dostaje odpowiedź MOCK z samej przeglądarki (żądanie nie wychodzi
 * w sieć), a `window.turnstile` jest atrapą (we wszystkich sesjach — prawdziwy Turnstile sam
 * wysyła POST-y) — dzięki temu da się przejść kroki 1→2→3 bez tworzenia leada. Skrypt nigdy nie klika końcowego „Wyślij/Zapłać/Zamawiam” ani przycisków
 * type=submit; „Poznaj widełki” w kalkulatorze klika wyłącznie z niepoprawnymi danymi (walidacja
 * kliencka, zero żądań). UA to zwykły Chrome (UA z „Headless” aplikacja traktuje jak prerender).
 */
import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

// ---------------------------------------------------------------- konfiguracja
const argv = process.argv.slice(2);
const flags = Object.fromEntries(
  argv
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, ...v] = a.slice(2).split('=');
      return [k, v.length ? v.join('=') : 'true'];
    }),
);
const BASE = (argv.find((a) => !a.startsWith('--')) || 'https://mixturemarketing.pl').replace(
  /\/$/,
  '',
);
const BASE_ORIGIN = new URL(BASE).origin;
const IS_LOCAL = /^(localhost|127\.0\.0\.1)$/.test(new URL(BASE).hostname);
const OUT = path.resolve(flags.out || path.join(os.tmpdir(), `e2e-cta-${Date.now()}`));
const SHOTS = path.join(OUT, 'shots');
const CONCURRENCY = Math.max(1, Number(flags.concurrency || 6));
const ONLY = new Set((flags.only || 'cta,funnels').split(','));
const PAGE_FILTER = flags.pages ? new RegExp(flags.pages) : null;
const FUNNEL_FILTER = flags.funnels ? new RegExp(flags.funnels) : null;
const VIEWPORT_NAMES = (flags.viewports || 'desktop,mobile').split(',');
const GLOBAL_MODE = flags.global || 'sample';

const VIEWPORTS = {
  desktop: {
    viewport: { width: 1366, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
    ua: (v) =>
      `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${v}.0.0.0 Safari/537.36`,
  },
  mobile: {
    viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    ua: (v) =>
      `Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${v}.0.0.0 Mobile Safari/537.36`,
  },
};

// Słownictwo CTA (konsultacja / kontakt / wycena / zamówienie / pakiety).
const CTA_RE =
  /(umów|umow|konsultac|kontakt|skontaktuj|wyce[nń]|zamów|zamow|wybierz|sprawdź|sprawdz|zobacz pakiety|napisz|zadzwoń|zadzwon|porozmawiajmy|rozpocznij|zapytaj|bezpłatn|bezplatn|darmow|zacznij|audyt|poznaj ofert|zobacz ofert|współprac|wspolprac)/i;
// Końcowe akcje — NIGDY nie klikamy.
const FINAL_RE =
  /(wyślij|wyslij|zapłać|zaplac|przejdź do płatności|przejdz do platnosci|zamawiam|kupuję|kupuje|poznaj widełki)/i;

// ---------------------------------------------------------------- bezpieczeństwo sieci
const ALLOWED_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const BLOCKED_HOSTS = [
  /(^|\.)api\.mixturemarketing\.pl$/i, // hub płatności (binary-planet)
  /(^|\.)stripe\.(com|network)$/i,
  /(^|\.)resend\.(com|dev)$/i,
  /(^|\.)challenges\.cloudflare\.com$/i, // Turnstile (sam robi POST-y)
  /(^|\.)google-analytics\.com$/i,
  /(^|\.)analytics\.google\.com$/i,
  /(^|\.)googletagmanager\.com$/i,
  /(^|\.)doubleclick\.net$/i,
  /(^|\.)facebook\.(com|net)$/i,
  /(^|\.)cloudflareinsights\.com$/i,
  /(^|\.)clarity\.ms$/i,
  /(^|\.)hotjar\.(com|io)$/i,
];
const BLOCKED_PATHS = [/^\/cdn-cgi\/zaraz\/t/, /\/rifd\//, /^\/cdn-cgi\/rum/];

const safetyLog = { aborted: 0, mocked: 0, abortedNonGet: [] };

function verdict(req, mockContact) {
  let url;
  try {
    url = new URL(req.url());
  } catch {
    return 'abort';
  }
  if (url.protocol === 'data:' || url.protocol === 'blob:') return 'allow';
  if (BLOCKED_HOSTS.some((r) => r.test(url.hostname))) return 'block-3p';
  if (BLOCKED_PATHS.some((r) => r.test(url.pathname))) return 'block-3p';
  if (req.resourceType() === 'ping') return 'block-3p'; // sendBeacon / <a ping>
  if (!ALLOWED_METHODS.has(req.method())) {
    if (mockContact && url.origin === BASE_ORIGIN && url.pathname === '/api/contact-submit')
      return 'mock';
    return 'abort';
  }
  return 'allow';
}

async function installSafety(page, session) {
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.isInterceptResolutionHandled()) return;
    const v = verdict(req, session.mockContact);
    if (v === 'allow') return req.continue().catch(() => {});
    if (v === 'mock') {
      safetyLog.mocked++;
      let action = '?';
      try {
        action = JSON.parse(req.postData() || '{}').action;
      } catch {
        /* ignore */
      }
      session.mocks.push(action);
      return req
        .respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, e2e_mock: true }),
        })
        .catch(() => {});
    }
    safetyLog.aborted++;
    if (v === 'block-3p') {
      if (!ALLOWED_METHODS.has(req.method())) session.beacons.push(req.url().slice(0, 140));
    } else if (!ALLOWED_METHODS.has(req.method())) {
      const entry = `${req.method()} ${req.url().slice(0, 140)}`;
      session.abortedNonGet.push(entry);
      if (safetyLog.abortedNonGet.length < 200) safetyLog.abortedNonGet.push(entry);
    }
    return req.abort('blockedbyclient').catch(() => {});
  });
}

// ---------------------------------------------------------------- helpery w stronie
function pageHelpers() {
  const H = {};
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  H.label = (el) =>
    norm(
      el.getAttribute('aria-label') ||
        el.innerText ||
        el.textContent ||
        el.getAttribute('title') ||
        el.getAttribute('value') ||
        '',
    );
  H.chainVisible = (el) => {
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse')
        return false;
      if (Number(cs.opacity) < 0.05) return false;
      if (e.inert) return false;
    }
    return true;
  };
  H.rendered = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width >= 4 && r.height >= 4 && H.chainVisible(el);
  };
  H.describe = (el) => {
    if (!el || !el.tagName) return 'null';
    const cls =
      typeof el.className === 'string' && el.className.trim()
        ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
        : '';
    return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls} "${H.label(el).slice(0, 40)}"`;
  };
  H.region = (el) => {
    if (el.closest('dialog, [role=dialog], [role=alertdialog], [aria-modal="true"]'))
      return 'dialog';
    if (el.closest('[aria-label="Baner plików cookies"]')) return 'cookie';
    if (el.closest('#mobile-menu')) return 'mobilemenu';
    if (el.closest('header')) return 'header';
    if (el.closest('footer')) return 'footer';
    for (let e = el; e && e !== document.body; e = e.parentElement)
      if (getComputedStyle(e).position === 'fixed') return 'fixed';
    return 'main';
  };
  H.clickables = () => [
    ...document.querySelectorAll('a[href], button, [role="button"], input[type=button]'),
  ];
  H.key = (el) =>
    `${el.tagName.toLowerCase()}|${H.label(el).toLowerCase()}|${el.getAttribute('href') || ''}`;
  H.find = (key, nth) => {
    let i = 0;
    for (const el of H.clickables()) {
      if (H.key(el) === key) {
        if (i === nth) return el;
        i++;
      }
    }
    return null;
  };
  H.collect = (ctaSrc, finalSrc) => {
    const CTA = new RegExp(ctaSrc, 'i');
    const FINAL = new RegExp(finalSrc, 'i');
    const counts = {};
    const out = [];
    for (const el of H.clickables()) {
      const key = H.key(el);
      const nth = (counts[key] = (counts[key] ?? -1) + 1);
      const href = el.getAttribute('href') || '';
      const label = H.label(el);
      const telMail = /^(tel|mailto):/i.test(href);
      if (!telMail && !CTA.test(label)) continue;
      if (FINAL.test(label)) continue;
      if (el.tagName === 'BUTTON' && el.form && el.type === 'submit') continue;
      if (el.disabled || el.getAttribute('aria-disabled') === 'true') continue;
      const region = H.region(el);
      if (region === 'dialog' || region === 'cookie' || region === 'mobilemenu') continue;
      if (!H.rendered(el)) continue;
      if (region === 'fixed') {
        const fr = el.getBoundingClientRect();
        if (fr.bottom <= 0 || fr.top >= innerHeight || fr.right <= 0 || fr.left >= innerWidth)
          continue;
      }
      out.push({
        key,
        nth,
        label: label.slice(0, 80),
        href,
        tag: el.tagName.toLowerCase(),
        region,
        target: el.getAttribute('target') || '',
        rel: el.getAttribute('rel') || '',
        seenAt: Math.round(scrollY),
      });
    }
    return out;
  };
  H.dialogBox = (d) => {
    const r = d.getBoundingClientRect();
    if (r.width >= innerWidth - 4 && r.height >= innerHeight - 4) {
      const kids = [...d.children]
        .map((k) => [k, k.getBoundingClientRect()])
        .filter(([, kr]) => kr.width > 0 && kr.height > 0)
        .sort((a, b) => b[1].width * b[1].height - a[1].width * a[1].height);
      if (kids.length) return kids[0][0];
    }
    return d;
  };
  H.assessDialog = (d) => {
    const box = H.dialogBox(d);
    const r = box.getBoundingClientRect();
    const res = {
      desc: H.describe(d),
      open: d.tagName !== 'DIALOG' || d.open,
      modal: d.tagName === 'DIALOG' ? d.matches(':modal') : d.getAttribute('aria-modal') === 'true',
      w: Math.round(r.width),
      h: Math.round(r.height),
      top: Math.round(r.top),
    };
    res.styleVisible = H.chainVisible(box) && H.chainVisible(d);
    const x1 = Math.max(0, r.left);
    const y1 = Math.max(0, r.top);
    const x2 = Math.min(innerWidth, r.right);
    const y2 = Math.min(innerHeight, r.bottom);
    res.inViewport = x2 - x1 > 40 && y2 - y1 > 40;
    const top = res.inViewport ? document.elementFromPoint((x1 + x2) / 2, (y1 + y2) / 2) : null;
    res.notCovered = !!top && d.contains(top);
    res.coveredBy = res.notCovered ? null : H.describe(top);
    const head = d.querySelector('h1, h2, h3, [id$="title"]');
    res.heading = head ? H.label(head).slice(0, 80) : '';
    res.ok =
      res.open &&
      r.width > 40 &&
      r.height > 40 &&
      res.styleVisible &&
      res.inViewport &&
      res.notCovered;
    return res;
  };
  H.dialogs = () => {
    const set = new Set(
      document.querySelectorAll('dialog, [role=dialog], [role=alertdialog], [aria-modal="true"]'),
    );
    return [...set].map(H.assessDialog);
  };
  H.navBottom = () => {
    const n = document.querySelector('nav[aria-label="Główna nawigacja"]');
    if (!n || getComputedStyle(n).position !== 'fixed') return 0;
    return Math.max(0, Math.round(n.getBoundingClientRect().bottom));
  };
  H.state = () => {
    const h1 = document.querySelector('main h1, h1');
    const mm = document.getElementById('mobile-menu');
    return {
      href: location.href,
      path: location.pathname,
      hash: location.hash,
      scrollY: Math.round(scrollY),
      dialogs: H.dialogs(),
      bodyOverflow: getComputedStyle(document.body).overflow,
      htmlOverflow: getComputedStyle(document.documentElement).overflow,
      active: H.describe(document.activeElement),
      activeIsTrigger: !!document.activeElement?.closest?.('[data-e2e-trigger]'),
      triggerInDom: !!document.querySelector('[data-e2e-trigger]'),
      title: document.title,
      h1: h1 ? H.label(h1).slice(0, 80) : '',
      h1Visible: !!h1 && H.rendered(h1),
      mobileMenuOpen: !!mm && mm.getAttribute('aria-hidden') === 'false',
    };
  };
  H.hashTarget = (id) => {
    let el = null;
    try {
      el = document.getElementById(decodeURIComponent(id));
    } catch {
      el = document.getElementById(id);
    }
    if (!el) return { found: false };
    const r = el.getBoundingClientRect();
    const head = el.querySelector('h1, h2, h3');
    return {
      found: true,
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      headTop: head ? Math.round(head.getBoundingClientRect().top) : null,
      vh: innerHeight,
      navBottom: H.navBottom(),
    };
  };
  H.hitTest = (el) => {
    // Link zawinięty w kilka linii: środek bounding boxa wypada między fragmentami —
    // celujemy w największy fragment (getClientRects).
    const rects = [...el.getClientRects()].filter((q) => q.width > 2 && q.height > 2);
    const r =
      rects.length > 1
        ? rects.sort((a, b) => b.width * b.height - a.width * a.height)[0]
        : el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const inViewport = x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight;
    const top = inViewport ? document.elementFromPoint(x, y) : null;
    const ok = !!top && (top === el || el.contains(top));
    return {
      x,
      y,
      w: r.width,
      h: r.height,
      inViewport,
      ok,
      coveredBy: ok ? null : H.describe(top),
      coveredByCookie: !!top?.closest?.('[aria-label="Baner plików cookies"]'),
    };
  };
  // Stan „lokalnego” UI wokół przycisku: akordeon/zakładka/demo zmienia aria-* albo treść sekcji.
  H.uiState = (el) => {
    const box = el.closest('section') || el.parentElement?.parentElement || el;
    return {
      aria: ['aria-expanded', 'aria-pressed', 'aria-selected', 'aria-checked', 'data-state']
        .map((a) => el.getAttribute(a))
        .join('|'),
      text: (box.innerText || '').length,
      label: H.label(el),
    };
  };
  window.__e2e = H;
}

function fakeTurnstile() {
  let n = 0;
  const api = {
    render: () => `e2e-widget-${++n}`,
    execute: () => {},
    reset: () => {},
    getResponse: () => 'E2E_FAKE_TURNSTILE_TOKEN',
    remove: () => {},
  };
  try {
    Object.defineProperty(window, 'turnstile', { value: api, writable: true, configurable: true });
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------- sesje i akcje
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let CHROME_MAJOR = '130';

async function newSession(browser, vpName, opts = {}) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  const vp = VIEWPORTS[vpName];
  const session = {
    ctx,
    page,
    vpName,
    isMobile: vp.viewport.isMobile,
    mockContact: !!opts.mockContact,
    mocks: [],
    abortedNonGet: [],
    beacons: [],
    errors: [],
    popups: [],
  };
  await page.setViewport(vp.viewport);
  await page.setUserAgent({ userAgent: vp.ua(CHROME_MAJOR) });
  await page.evaluateOnNewDocument(pageHelpers);
  await page.evaluateOnNewDocument(fakeTurnstile);
  await installSafety(page, session);
  page.on('pageerror', (e) => session.errors.push(`pageerror: ${String(e.message || e)}`));
  page.on('console', (m) => {
    if (process.env.E2E_CONSOLE) console.log(`    [console:${vpName}] ${m.text().slice(0, 300)}`);
    if (
      m.type() === 'error' &&
      !/net::ERR_BLOCKED_BY_CLIENT|Failed to load resource/.test(m.text())
    )
      session.errors.push(`console: ${m.text().slice(0, 200)}`);
  });
  ctx.on('targetcreated', async (t) => {
    if (t.type() !== 'page') return;
    session.popups.push(t.url());
    const p = await t.page().catch(() => null);
    if (p) await p.close().catch(() => {});
  });
  page.on('dialog', (d) => d.dismiss().catch(() => {})); // alert/confirm
  session.close = () => ctx.close().catch(() => {});
  return session;
}

async function openUrl(s, url) {
  const resp = await s.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await s.page
    .waitForFunction(() => document.readyState === 'complete', { timeout: 30000 })
    .catch(() => {});
  await s.page.waitForNetworkIdle({ idleTime: 500, timeout: 15000 }).catch(() => {});
  await sleep(400);
  return resp ? resp.status() : 0;
}

const ev = (s, fn, ...a) => s.page.evaluate(fn, ...a);
const state = (s) => ev(s, () => window.__e2e.state());

/** Przewija „jak człowiek” (krokami) do pozycji Y, dając LazyHydrate czas na montaż. */
async function humanScrollTo(s, targetY) {
  for (let i = 0; i < 60; i++) {
    const done = await ev(
      s,
      (ty) => {
        const step = Math.round(innerHeight * 0.7);
        const before = scrollY;
        const next = ty > scrollY ? Math.min(ty, scrollY + step) : Math.max(ty, scrollY - step);
        window.scrollTo({ top: next, behavior: 'instant' });
        return Math.abs(scrollY - ty) < 4 || scrollY === before;
      },
      targetY,
    );
    await sleep(120);
    if (done) break;
  }
  await sleep(250);
}

async function handleFor(s, key, nth) {
  const h = await s.page.evaluateHandle((k, n) => window.__e2e.find(k, n), key, nth);
  const el = h.asElement();
  if (!el) {
    await h.dispose();
    return null;
  }
  return el;
}

/** Zrzut ekranu do OUT/shots; zwraca ścieżkę. */
let shotNo = 0;
async function shot(s, name) {
  const file = path.join(
    SHOTS,
    `${String(++shotNo).padStart(4, '0')}-${name.replace(/[^a-z0-9]+/gi, '_').slice(0, 90)}.png`,
  );
  try {
    await s.page.screenshot({ path: file });
    return file;
  } catch {
    return null;
  }
}

/** Kliknięcie realnym wejściem: mysz (desktop) albo tap (mobile) w środek elementu. */
async function realClick(s, el, { allowCovered = false } = {}) {
  await el.evaluate((e) =>
    e.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' }),
  );
  await sleep(350);
  // poczekaj, aż element faktycznie jest widoczny (animacje wejścia)
  for (let i = 0; i < 20; i++) {
    if (await el.evaluate((e) => window.__e2e.rendered(e))) break;
    await sleep(150);
  }
  let hit = await el.evaluate((e) => window.__e2e.hitTest(e));
  if (!hit.ok && hit.coveredByCookie) {
    await dismissCookieBanner(s);
    await el.evaluate((e) =>
      e.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' }),
    );
    await sleep(300);
    hit = await el.evaluate((e) => window.__e2e.hitTest(e));
    hit.cookieDismissed = true;
  }
  if (!hit.inViewport)
    throw new Error(`element poza viewportem po scrollIntoView (${hit.x},${hit.y})`);
  if (!hit.ok && !allowCovered) throw new Error(`element zasłonięty przez ${hit.coveredBy}`);
  // Zapamiętaj, w co FAKTYCZNIE trafił click (layout shift między mousedown a mouseup gubi klik).
  await el.evaluate((e) => {
    window.__e2eClick = null;
    document.addEventListener(
      'click',
      (ev) => {
        window.__e2eClick = {
          ok: e.contains(ev.target) || ev.target === e,
          target: window.__e2e.describe(ev.target),
        };
      },
      { capture: true, once: true },
    );
  });
  if (s.isMobile) await s.page.touchscreen.tap(hit.x, hit.y);
  else await s.page.mouse.click(hit.x, hit.y);
  const landed = await s.page.evaluate(() => window.__e2eClick).catch(() => null);
  if (landed && !landed.ok && !allowCovered)
    throw new Error(
      `klik nie trafił w element — przesunął się między mousedown a mouseup (layout shift); click trafił w ${landed.target}`,
    );
  hit.landed = landed;
  return hit;
}

async function dismissCookieBanner(s) {
  const btn = await s.page.evaluateHandle(() =>
    [...document.querySelectorAll('[aria-label="Baner plików cookies"] button')].find((b) =>
      /odrzuć/i.test(b.innerText),
    ),
  );
  const el = btn.asElement();
  if (el) {
    await el.evaluate((b) => b.click());
    await sleep(300);
  }
}

async function waitFor(s, fn, arg, { timeout = 5000, interval = 120 } = {}) {
  const t0 = Date.now();
  let last;
  while (Date.now() - t0 < timeout) {
    last = await s.page.evaluate(fn, arg).catch((e) => ({ __err: String(e) }));
    if (last && last.__ok) return last;
    await sleep(interval);
  }
  return last;
}

async function waitStable(s, ms = 2500) {
  let prev = -1;
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const y = await ev(s, () => Math.round(scrollY));
    if (y === prev) return;
    prev = y;
    await sleep(200);
  }
}

// ---------------------------------------------------------------- wyniki
const results = [];
function record(r) {
  results.push(r);
  const mark = { pass: '✓', fail: '✗', warn: '!', skip: '-' }[r.status] || '?';
  if (r.status === 'fail' || r.status === 'warn')
    console.log(
      `  ${mark} [${r.viewport}] ${r.page} :: ${r.name} — ${r.actual}${r.screenshot ? ` (${path.basename(r.screenshot)})` : ''}`,
    );
}

const normPath = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p) || '/';

// ---------------------------------------------------------------- sitemap
async function loadPaths(browser) {
  if (flags.paths) return flags.paths.split(',');
  const s = await newSession(browser, 'desktop');
  try {
    const resp = await s.page.goto(`${BASE}/sitemap.xml`, { timeout: 30000 });
    const text = resp && resp.ok() ? await resp.text() : '';
    const locs = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    if (locs.length) return locs;
  } finally {
    await s.close();
  }
  const { routes } = await import('../routes.js');
  return routes;
}

// ---------------------------------------------------------------- CTA: odkrywanie
const statusCache = new Map();
async function linkStatus(s, href) {
  const u = new URL(href, BASE);
  const k = u.pathname + u.search;
  if (statusCache.has(k)) return statusCache.get(k);
  const r = await ev(
    s,
    async (p) => {
      try {
        const res = await fetch(p, { method: 'GET', redirect: 'follow', credentials: 'omit' });
        return { status: res.status, redirected: res.redirected, final: new URL(res.url).pathname };
      } catch (e) {
        return { status: 0, error: String(e) };
      }
    },
    k,
  );
  statusCache.set(k, r);
  return r;
}

async function discover(browser, vpName, p) {
  const s = await newSession(browser, vpName);
  const url = BASE + p;
  try {
    const status = await openUrl(s, url);
    const seen = new Map();
    for (let i = 0; i < 120; i++) {
      const list = await ev(
        s,
        (a, b) => window.__e2e.collect(a, b),
        CTA_RE.source,
        FINAL_RE.source,
      );
      for (const c of list) if (!seen.has(`${c.key}#${c.nth}`)) seen.set(`${c.key}#${c.nth}`, c);
      const moved = await ev(s, () => {
        const before = scrollY;
        window.scrollBy({ top: Math.round(innerHeight * 0.7), behavior: 'instant' });
        return scrollY !== before;
      });
      await sleep(220);
      if (!moved) break;
    }
    await sleep(400);
    for (const c of await ev(
      s,
      (a, b) => window.__e2e.collect(a, b),
      CTA_RE.source,
      FINAL_RE.source,
    ))
      if (!seen.has(`${c.key}#${c.nth}`)) seen.set(`${c.key}#${c.nth}`, c);
    const cands = [...seen.values()];
    for (const c of cands) {
      if (/^(https?:)?\/\//i.test(c.href) || c.href.startsWith('/') || c.href.startsWith('#')) {
        let u;
        try {
          u = new URL(c.href, url);
        } catch {
          continue;
        }
        if (u.origin === BASE_ORIGIN && !c.href.startsWith('#'))
          c.linkStatus = await linkStatus(s, u.pathname + u.search);
      }
    }
    return { p, status, cands, errors: s.errors };
  } finally {
    await s.close();
  }
}

function staticCheck(p, vpName, c) {
  const base = {
    kind: 'static',
    page: p,
    viewport: vpName,
    name: `${c.tag} „${c.label}” → ${c.href}`,
  };
  if (/^tel:/i.test(c.href)) {
    const num = c.href.slice(4);
    const ok = /^\+?[0-9]{9,15}$/.test(num);
    return {
      ...base,
      expected: 'tel:+48XXXXXXXXX (same cyfry)',
      actual: ok ? 'ok' : `zły format: ${c.href}`,
      status: ok ? 'pass' : 'fail',
    };
  }
  if (/^mailto:/i.test(c.href)) {
    const ok = /^mailto:[^@\s?]+@[^@\s?]+\.[a-z]{2,}(\?.*)?$/i.test(c.href);
    return {
      ...base,
      expected: 'mailto:adres@domena.tld',
      actual: ok ? 'ok' : `zły format: ${c.href}`,
      status: ok ? 'pass' : 'fail',
    };
  }
  let u;
  try {
    u = new URL(c.href, BASE + p);
  } catch {
    return {
      ...base,
      expected: 'poprawny URL',
      actual: `niepoprawny href ${c.href}`,
      status: 'fail',
    };
  }
  if (u.origin !== BASE_ORIGIN) {
    const ok = /^https?:$/.test(u.protocol);
    const relOk = c.target !== '_blank' || /noopener|noreferrer/.test(c.rel);
    return {
      ...base,
      expected: 'zewnętrzny https + rel=noopener przy _blank',
      actual: ok ? (relOk ? 'ok' : 'target=_blank bez rel=noopener') : `protokół ${u.protocol}`,
      status: ok ? (relOk ? 'pass' : 'warn') : 'fail',
    };
  }
  // wewnętrzny z target=_blank — nie klikamy (nowa karta), sprawdzamy tylko status
  const st = c.linkStatus;
  const ok = st && st.status === 200;
  return {
    ...base,
    expected: 'GET 200',
    actual: st
      ? `HTTP ${st.status}${st.redirected ? ` (redirect → ${st.final})` : ''}`
      : 'brak statusu',
    status: ok ? 'pass' : 'fail',
  };
}

function needsClick(c, p) {
  if (/^(tel|mailto):/i.test(c.href)) return false;
  if (c.href) {
    let u;
    try {
      u = new URL(c.href, BASE + p);
    } catch {
      return false;
    }
    if (u.origin !== BASE_ORIGIN) return false;
    if (c.target === '_blank') return false;
  }
  return true;
}

// ---------------------------------------------------------------- CTA: klik
async function checkCta(browser, vpName, p, c) {
  const name = `${c.tag} „${c.label}”${c.href ? ` → ${c.href}` : ''}${c.nth ? ` [#${c.nth + 1}]` : ''} (${c.region})`;
  const base = { kind: 'cta', page: p, viewport: vpName, name };
  const s = await newSession(browser, vpName);
  try {
    await openUrl(s, BASE + p);
    // dojdź do elementu tak, jak użytkownik: przewijając
    let el = null;
    if (c.region === 'fixed' || c.region === 'header') {
      await humanScrollTo(s, c.seenAt);
      el = await handleFor(s, c.key, c.nth);
    } else {
      el = await handleFor(s, c.key, c.nth);
      // Bez prerenderu (dev) lub przed hydratacją sekcji niżej element pojawia się dopiero
      // po przewinięciu w jego okolice (LazyHydrate) — szukamy, schodząc krokami w dół.
      for (let i = 0; i < 80 && !el; i++) {
        const moved = await ev(s, () => {
          const before = scrollY;
          window.scrollBy({ top: Math.round(innerHeight * 0.7), behavior: 'instant' });
          return scrollY !== before;
        });
        await sleep(moved ? 200 : 600);
        el = await handleFor(s, c.key, c.nth);
        if (!moved && !el && i > 3) break;
      }
      if (el) {
        const y = await el.evaluate(
          (e) => e.getBoundingClientRect().top + scrollY - innerHeight / 2,
        );
        await humanScrollTo(s, Math.max(0, Math.round(y)));
        el = await handleFor(s, c.key, c.nth);
      }
    }
    if (!el) {
      return {
        ...base,
        status: 'warn',
        expected: 'element istnieje',
        actual: 'nie znaleziono elementu w świeżej sesji (niestabilny DOM?)',
        screenshot: await shot(s, `${p}-${vpName}-notfound`),
      };
    }
    await el.evaluate((e) => e.setAttribute('data-e2e-trigger', '1'));
    const before = await state(s);
    const uiBefore = await el.evaluate((e) => window.__e2e.uiState(e));
    // Link do bieżącej strony (bez #) — brak efektu jest oczekiwany (np. „Kontakt” na /contact/).
    if (c.href && !c.href.startsWith('#')) {
      const u = new URL(c.href, BASE + p);
      if (u.origin === BASE_ORIGIN && normPath(u.pathname) === normPath(p) && !u.hash)
        return {
          ...base,
          status: 'skip',
          expected: '-',
          actual: 'link do bieżącej strony (pominięty)',
        };
    }
    const visibleBefore = before.dialogs.filter((d) => d.ok).length;
    let hit;
    try {
      hit = await realClick(s, el);
    } catch (e) {
      return {
        ...base,
        status: 'fail',
        expected: 'CTA widoczny i klikalny',
        actual: e.message,
        screenshot: await shot(s, `${p}-${vpName}-${c.label}-covered`),
      };
    }
    // obserwuj efekt
    const expectedUrl = c.href ? new URL(c.href, BASE + p) : null;
    const isHash =
      !!expectedUrl && normPath(expectedUrl.pathname) === normPath(p) && !!expectedUrl.hash;
    let eff = null;
    let st = before;
    const t0 = Date.now();
    while (Date.now() - t0 < 6000) {
      await sleep(150);
      st = await state(s).catch(() => st);
      const vis = st.dialogs.filter((d) => d.ok);
      if (vis.length > visibleBefore) {
        eff = 'modal';
        break;
      }
      if (normPath(st.path) !== normPath(before.path)) {
        eff = 'nav';
        break;
      }
      if (st.hash !== before.hash && isHash) {
        eff = 'hash';
        break;
      }
      if (s.popups.length) {
        eff = 'popup';
        break;
      }
      // Przewinięcie uznajemy dopiero po 3 s bez modala: leniwy chunk modala potrafi dojechać
      // później, a w tym czasie hydratacja sekcji wyżej przesuwa stronę (fałszywe „scroll”).
      if (Math.abs(st.scrollY - before.scrollY) > 150 && Date.now() - t0 > 3000) {
        eff = 'scroll';
        break;
      }
      if (st.mobileMenuOpen && !before.mobileMenuOpen) {
        eff = 'menu';
        break;
      }
      if (!c.href && Date.now() - t0 > 600) {
        const ui = await el
          .evaluate((e) => (e.isConnected ? window.__e2e.uiState(e) : null))
          .catch(() => null);
        if (
          ui &&
          (ui.aria !== uiBefore.aria ||
            ui.label !== uiBefore.label ||
            Math.abs(ui.text - uiBefore.text) > 15)
        ) {
          eff = 'ui';
          break;
        }
      }
    }
    const extra = hit.cookieDismissed ? ' (najpierw zasłonięty banerem cookies — odrzucony)' : '';
    if (!eff) {
      const hidden = st.dialogs.filter((d) => !d.ok && (d.open || d.w > 0));
      const detail = hidden.length
        ? `dialog w DOM, ale niewidoczny: ${hidden.map((d) => `${d.desc} open=${d.open} ${d.w}x${d.h} coveredBy=${d.coveredBy}`).join('; ')}`
        : st.dialogs.some((d) => !d.open)
          ? `brak efektu (w DOM jest <dialog> bez open: ${st.dialogs
              .filter((d) => !d.open)
              .map((d) => d.desc)
              .join('; ')})`
          : 'brak widocznego efektu (bez modala, nawigacji ani przewinięcia)';
      return {
        ...base,
        status: 'fail',
        expected: c.href ? `nawigacja do ${c.href}` : 'modal / nawigacja / przewinięcie',
        actual: detail + extra,
        screenshot: await shot(s, `${p}-${vpName}-${c.label}-noeffect`),
        errors: s.errors.slice(0, 5),
      };
    }
    if (eff === 'modal') {
      await sleep(500);
      const st2 = await state(s);
      const d = st2.dialogs.find((x) => x.ok);
      if (!d)
        return {
          ...base,
          status: 'fail',
          expected: 'modal otwarty i widoczny',
          actual: 'modal mignął i zniknął',
          screenshot: await shot(s, `${p}-${vpName}-${c.label}-flash`),
        };
      // zamknięcie: Esc na desktopie, przycisk X na mobile
      let closeHow = 'Esc';
      if (s.isMobile) {
        const x = await s.page.evaluateHandle(() => {
          const dd = [
            ...document.querySelectorAll('dialog, [role=dialog], [aria-modal="true"]'),
          ].find((z) => window.__e2e.assessDialog(z).ok);
          return (
            dd &&
            [...dd.querySelectorAll('button')].find((b) =>
              /zamknij|close/i.test(b.getAttribute('aria-label') || b.innerText),
            )
          );
        });
        const xb = x.asElement();
        if (xb) {
          closeHow = 'przycisk X';
          await realClick(s, xb).catch(() => s.page.keyboard.press('Escape'));
        } else await s.page.keyboard.press('Escape');
      } else await s.page.keyboard.press('Escape');
      const closed = await waitFor(
        s,
        () => {
          const st3 = window.__e2e.state();
          return { __ok: !st3.dialogs.some((x) => x.ok), st3 };
        },
        null,
        { timeout: 2500 },
      );
      if (!closed || !closed.__ok)
        return {
          ...base,
          status: 'fail',
          expected: `modal zamyka się (${closeHow})`,
          actual: `modal „${d.heading}” nie zamknął się`,
          screenshot: await shot(s, `${p}-${vpName}-${c.label}-noclose`),
        };
      await sleep(350);
      const st4 = await state(s);
      const issues = [];
      if (!st4.activeIsTrigger)
        issues.push(
          `fokus nie wrócił do CTA (jest na ${st4.active}${st4.triggerInDom ? '' : '; CTA zniknął z DOM'})`,
        );
      if (st4.bodyOverflow === 'hidden' || st4.htmlOverflow === 'hidden')
        issues.push('scroll strony zablokowany po zamknięciu');
      return {
        ...base,
        status: issues.length ? 'warn' : 'pass',
        expected: `modal widoczny → zamknięcie (${closeHow}) → fokus na CTA`,
        actual: `modal „${d.heading}” ${d.w}x${d.h} OK; ${issues.length ? issues.join('; ') : 'zamknięty, fokus wrócił'}${extra}`,
        effect: 'modal',
        modalHeading: d.heading,
        screenshot: issues.length ? await shot(s, `${p}-${vpName}-${c.label}-afterclose`) : null,
      };
    }
    if (eff === 'nav') {
      const target = expectedUrl ? normPath(expectedUrl.pathname) : null;
      // poczekaj na wyrenderowanie trasy
      const done = await waitFor(
        s,
        (prevH1) => {
          const x = window.__e2e.state();
          return { __ok: x.h1Visible && x.h1 !== prevH1, x };
        },
        before.h1,
        { timeout: 10000 },
      );
      const st5 = done?.x || (await state(s));
      const statusInfo = c.linkStatus || (await linkStatus(s, st5.path));
      const problems = [];
      if (target && normPath(st5.path) !== target)
        problems.push(`trafiono na ${st5.path} zamiast ${target}`);
      if (!st5.h1Visible) problems.push('brak widocznego h1 po nawigacji');
      else if (st5.h1 === before.h1)
        problems.push(`treść nie zmieniła się po nawigacji (h1 „${st5.h1}”)`);
      if (/404|nie znaleziono/i.test(st5.title + ' ' + st5.h1))
        problems.push(`strona 404 („${st5.h1}”)`);
      if (statusInfo && statusInfo.status !== 200) problems.push(`HTTP ${statusInfo.status}`);
      if (expectedUrl?.hash) {
        // Docelowa trasa jest lazy, a przewinięcie płynne — dajemy do 6 s na dojazd do sekcji.
        const r = await waitFor(
          s,
          (h) => {
            const t = window.__e2e.hashTarget(h);
            return { __ok: t.found && t.top <= t.vh * 0.6 && t.bottom >= 0, t };
          },
          expectedUrl.hash.slice(1),
          { timeout: 6000, interval: 200 },
        );
        const ht = r?.t || { found: false };
        if (!ht.found) problems.push(`brak elementu ${expectedUrl.hash} na stronie docelowej`);
        else if (ht.top > ht.vh * 0.6 || ht.bottom < 0)
          problems.push(`nie przewinięto do ${expectedUrl.hash} (top=${ht.top})`);
      }
      return {
        ...base,
        status: problems.length ? 'fail' : 'pass',
        expected: `nawigacja do ${target || '(dowolnej)'} + HTTP 200`,
        actual: problems.length
          ? problems.join('; ')
          : `→ ${st5.path} („${st5.h1}”) HTTP ${statusInfo?.status}${extra}`,
        effect: 'nav',
        screenshot: problems.length ? await shot(s, `${p}-${vpName}-${c.label}-nav`) : null,
      };
    }
    if (eff === 'hash' || (eff === 'scroll' && isHash)) {
      await waitStable(s);
      const ht = await ev(s, (h) => window.__e2e.hashTarget(h), expectedUrl.hash.slice(1));
      const problems = [];
      if (!ht.found) problems.push(`brak elementu ${expectedUrl.hash}`);
      else {
        if (ht.top > ht.vh * 0.6 || ht.bottom < 0)
          problems.push(`sekcja ${expectedUrl.hash} poza widokiem (top=${ht.top}px)`);
        const headTop = ht.headTop ?? ht.top;
        if (headTop < ht.navBottom - 4)
          problems.push(
            `nagłówek sekcji pod stałym navbarem (top=${headTop}, nav=${ht.navBottom})`,
          );
      }
      return {
        ...base,
        status: problems.length ? (ht.found && ht.top <= ht.vh * 0.6 ? 'warn' : 'fail') : 'pass',
        expected: `przewinięcie do ${expectedUrl.hash}`,
        actual: problems.length
          ? problems.join('; ')
          : `sekcja ${expectedUrl.hash} w widoku (top=${ht.top})${extra}`,
        effect: 'hash',
        screenshot: problems.length ? await shot(s, `${p}-${vpName}-${c.label}-hash`) : null,
      };
    }
    if (eff === 'popup') {
      return {
        ...base,
        status: 'pass',
        expected: 'nowa karta',
        actual: `otwarto ${s.popups[0]}`,
        effect: 'popup',
      };
    }
    if (eff === 'ui') {
      return {
        ...base,
        status: 'pass',
        expected: 'efekt widoczny',
        actual: 'zmiana UI w sekcji (akordeon / zakładka / demo) — to nie CTA kontaktowe',
        effect: 'ui',
      };
    }
    if (eff === 'menu') {
      return {
        ...base,
        status: 'pass',
        expected: 'menu',
        actual: 'otwarto menu mobilne',
        effect: 'menu',
      };
    }
    // scroll do sekcji (przycisk bez href)
    if (c.href && !isHash) {
      return {
        ...base,
        status: 'fail',
        expected: `nawigacja do ${c.href}`,
        actual: `zamiast nawigacji tylko przewinięcie (${before.scrollY}→${st.scrollY})`,
        screenshot: await shot(s, `${p}-${vpName}-${c.label}-scrollonly`),
      };
    }
    await waitStable(s);
    // Celowe przewinięcie kończy się sekcją (element z id) tuż pod navbarem; inaczej to raczej
    // przesunięcie układu niż efekt kliknięcia.
    const landed = await ev(s, () => {
      const nb = window.__e2e.navBottom();
      const hit = [...document.querySelectorAll('main [id]')].find((e) => {
        const t = e.getBoundingClientRect().top;
        return t >= -4 && t <= nb + 140 && window.__e2e.rendered(e);
      });
      return hit ? `#${hit.id}` : null;
    });
    return {
      ...base,
      status: landed ? 'pass' : 'warn',
      expected: 'efekt widoczny',
      actual: `przewinięcie strony ${before.scrollY}→${st.scrollY}px${landed ? ` do ${landed}` : ' bez sekcji docelowej (możliwy layout shift, nie efekt klików)'}${extra}`,
      effect: 'scroll',
      screenshot: landed ? null : await shot(s, `${p}-${vpName}-${c.label}-scroll`),
    };
  } catch (e) {
    return {
      ...base,
      status: 'fail',
      expected: 'test przechodzi',
      actual: `wyjątek: ${e.message}`,
      screenshot: await shot(s, `${p}-${vpName}-exception`),
    };
  } finally {
    await s.close();
  }
}

// ---------------------------------------------------------------- pula
async function pool(items, n, fn) {
  let i = 0;
  const workers = Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      try {
        await fn(items[idx], idx);
      } catch (e) {
        console.error('worker error', e);
      }
    }
  });
  await Promise.all(workers);
}

function groupOf(p) {
  const seg = p.split('/').filter(Boolean);
  return seg.length === 0 ? '/' : seg.length === 1 ? `/${seg[0]}/` : `/${seg[0]}/*`;
}

async function runCtas(browser, paths) {
  const counts = {};
  for (const vpName of VIEWPORT_NAMES) {
    console.log(`\n== CTA [${vpName}] — odkrywanie na ${paths.length} stronach`);
    const discovered = [];
    await pool(paths, CONCURRENCY, async (p) => {
      try {
        discovered.push(await discover(browser, vpName, p));
      } catch (e) {
        record({
          kind: 'cta',
          page: p,
          viewport: vpName,
          name: '(odkrywanie)',
          status: 'fail',
          expected: 'strona się ładuje',
          actual: e.message,
        });
      }
    });
    discovered.sort((a, b) => paths.indexOf(a.p) - paths.indexOf(b.p));
    const sampledGroups = new Set();
    const jobs = [];
    let staticN = 0;
    for (const d of discovered) {
      if (d.status !== 200)
        record({
          kind: 'page',
          page: d.p,
          viewport: vpName,
          name: '(HTTP strony)',
          status: 'fail',
          expected: '200',
          actual: `HTTP ${d.status}`,
        });
      const g = groupOf(d.p);
      const sampleGlobal = GLOBAL_MODE === 'all' || !sampledGroups.has(g);
      sampledGroups.add(g);
      for (const c of d.cands) {
        if (!needsClick(c, d.p)) {
          staticN++;
          record(staticCheck(d.p, vpName, c));
          continue;
        }
        if ((c.region === 'header' || c.region === 'footer') && !sampleGlobal) continue;
        jobs.push([d.p, c]);
      }
    }
    console.log(
      `== CTA [${vpName}] — ${jobs.length} klików (świeży kontekst każdy) + ${staticN} sprawdzeń statycznych`,
    );
    let done = 0;
    await pool(jobs, CONCURRENCY, async ([p, c]) => {
      const r = await checkCta(browser, vpName, p, c);
      record(r);
      if (++done % 25 === 0) console.log(`   … ${done}/${jobs.length}`);
    });
    counts[vpName] = { clicks: jobs.length, static: staticN, pages: discovered.length };
  }
  return counts;
}

// ---------------------------------------------------------------- lejki
const FAKE = {
  name: 'E2E Test (nie kontaktować)',
  email: 'e2e-test@example.com',
  phone: '600100200',
  business: 'E2E TEST — nie realizować',
  nip: '1234563218', // poprawna suma kontrolna, fikcyjny
  url: 'https://example.com',
};

class StepFail extends Error {
  constructor(msg, level = 'fail') {
    super(msg);
    this.level = level;
  }
}
const warnStep = (msg) => new StepFail(msg, 'warn');

async function runFunnel(browser, vpName, name, fn, opts = {}) {
  if (FUNNEL_FILTER && !FUNNEL_FILTER.test(name)) return;
  const s = await newSession(browser, vpName, opts);
  let n = 0;
  const step = async (stepName, expected, f) => {
    const label = `${String(++n).padStart(2, '0')} ${stepName}`;
    if (s.failed) {
      record({
        kind: 'funnel',
        page: name,
        viewport: vpName,
        name: label,
        status: 'skip',
        expected,
        actual: 'pominięty (wcześniejszy krok nie przeszedł)',
      });
      return false;
    }
    try {
      const actual = await f();
      record({
        kind: 'funnel',
        page: name,
        viewport: vpName,
        name: label,
        status: 'pass',
        expected,
        actual: actual ?? 'ok',
      });
      return true;
    } catch (e) {
      const level = e instanceof StepFail ? e.level : 'fail';
      if (level === 'fail') s.failed = true;
      record({
        kind: 'funnel',
        page: name,
        viewport: vpName,
        name: label,
        status: level,
        expected,
        actual: e.message,
        screenshot: await shot(s, `F-${name}-${vpName}-${stepName}`),
        url: s.page.url(),
      });
      return level === 'warn';
    }
  };
  try {
    await fn(s, step);
  } catch (e) {
    record({
      kind: 'funnel',
      page: name,
      viewport: vpName,
      name: '(przerwany)',
      status: 'fail',
      expected: 'lejek przechodzi',
      actual: e.message,
      screenshot: await shot(s, `F-${name}-${vpName}-abort`),
    });
  } finally {
    if (s.abortedNonGet.length && !opts.expectAborts)
      record({
        kind: 'funnel',
        page: name,
        viewport: vpName,
        name: 'zero wychodzących POST',
        status: 'warn',
        expected: 'brak prób POST',
        actual: `zablokowano: ${s.abortedNonGet.slice(0, 3).join(' | ')}`,
      });
    await s.close();
  }
}

/**
 * Znajdź pierwszy WIDOCZNY element pasujący do selektora + regexu tekstu (opcjonalnie w kontenerze).
 * Czeka do `timeout` (animacje wejścia, lazy sekcje); element obecny, ale niewidoczny, przewija
 * do widoku (sekcje AnimateOnScroll pojawiają się dopiero w viewporcie).
 */
async function findEl(s, selector, re, within, timeout = 4000) {
  const t0 = Date.now();
  for (;;) {
    const h = await s.page.evaluateHandle(
      (sel, src, w) => {
        const root = w ? document.querySelector(w) : document;
        if (!root) return null;
        const rx = src ? new RegExp(src, 'i') : null;
        const all = [...root.querySelectorAll(sel)].filter(
          (e) => !rx || rx.test(window.__e2e.label(e)),
        );
        const vis = all.find((e) => window.__e2e.rendered(e));
        if (vis) return vis;
        all[0]?.scrollIntoView({ block: 'center', behavior: 'instant' });
        return null;
      },
      selector,
      re ? re.source : null,
      within || null,
    );
    const el = h.asElement();
    if (el || Date.now() - t0 > timeout) return el;
    await sleep(150);
  }
}

async function openDialogEl(s) {
  return (
    await s.page.evaluateHandle(
      () =>
        [...document.querySelectorAll('dialog, [role=dialog], [aria-modal="true"]')].find(
          (d) => window.__e2e.assessDialog(d).ok,
        ) || null,
    )
  ).asElement();
}

async function expectDialog(s, headingRe, timeout = 5000) {
  const r = await waitFor(
    s,
    (src) => {
      const ds = window.__e2e.dialogs();
      const ok = ds.find((d) => d.ok && (!src || new RegExp(src, 'i').test(d.heading)));
      return { __ok: !!ok, ok, ds };
    },
    headingRe ? headingRe.source : null,
    { timeout },
  );
  if (!r?.__ok)
    throw new StepFail(
      `modal niewidoczny: ${(r?.ds || []).map((d) => `${d.desc} open=${d.open} ${d.w}x${d.h} heading="${d.heading}" covered=${d.coveredBy}`).join('; ') || 'brak dialogów w DOM'}`,
    );
  return r.ok;
}

async function expectNoDialog(s, timeout = 2500) {
  const r = await waitFor(s, () => ({ __ok: !window.__e2e.dialogs().some((d) => d.ok) }), null, {
    timeout,
  });
  if (!r?.__ok) throw new StepFail('modal nadal widoczny');
}

/** Tekst widoczny dla użytkownika (wyrenderowany i w viewporcie). */
async function expectVisibleText(s, re, { within, timeout = 3000, scroll = false } = {}) {
  const r = await waitFor(
    s,
    ({ src, w, scroll: sc }) => {
      const root = w ? document.querySelector(w) || document : document;
      const rx = new RegExp(src, 'i');
      const els = [
        ...root.querySelectorAll('p, span, div, li, h1, h2, h3, h4, label, button, [role=alert]'),
      ].filter(
        (e) => e.children.length < 4 && rx.test(e.innerText || '') && window.__e2e.rendered(e),
      );
      if (!els.length) return { __ok: false, why: 'brak w DOM / niewyrenderowany' };
      const e = els[els.length - 1];
      if (sc) e.scrollIntoView({ block: 'center', behavior: 'instant' });
      const r2 = e.getBoundingClientRect();
      const inV = r2.bottom > 0 && r2.top < innerHeight;
      return {
        __ok: inV,
        why: inV ? '' : `poza viewportem (top=${Math.round(r2.top)})`,
        text: (e.innerText || '').slice(0, 80),
      };
    },
    { src: re.source, w: within || null, scroll },
    { timeout },
  );
  if (!r?.__ok) throw new StepFail(`tekst /${re.source}/ niewidoczny: ${r?.why || r?.__err}`);
  return r.text;
}

async function typeInto(s, el, text) {
  await realClick(s, el);
  await el.evaluate((e) => {
    e.focus();
    if ('value' in e) e.select?.();
  });
  await s.page.keyboard.type(text, { delay: 5 });
}

// ---- lejek: modal kontaktowy (ContactModal, typy z openModal)
const CONTACT_MODAL_PAGES = [
  ['/', 'general', /Umów bezpłatną rozmowę/i],
  ['/web-development/', 'web'],
  ['/marketing/google-ads/', 'marketing+ads'],
  ['/design/branding/', 'design+branding'],
  ['/pozycjonowanie-rzeszow/', 'general+seo_rzeszow'],
  ['/baza-wiedzy/cdn-globalna-wydajnosc/', 'consultation'],
];
const MODAL_CTA_RE =
  /(konsultac|wyce[nń]|umów|porozmawiajmy|rozpocznij|bezpłatn|darmow|zamów|zacznij|skontaktuj|współprac)/i;

async function contactModalFunnel(s, step, p, triggerRe = MODAL_CTA_RE) {
  await openUrl(s, BASE + p);
  let trigger;
  const ok = await step(
    'otwarcie modala z CTA',
    'dialog „Rozpocznijmy współpracę” widoczny',
    async () => {
      // przewijaj, aż znajdziesz przycisk (nie link), który otwiera modal
      for (let y = 0; y < 30; y++) {
        trigger = await findEl(s, 'main button', triggerRe);
        if (trigger) break;
        await ev(s, () =>
          window.scrollBy({ top: Math.round(innerHeight * 0.7), behavior: 'instant' }),
        );
        await sleep(200);
      }
      if (!trigger) throw new StepFail('brak przycisku CTA otwierającego modal w <main>');
      const label = await trigger.evaluate((e) => window.__e2e.label(e));
      await trigger.evaluate((e) => e.setAttribute('data-e2e-trigger', '1'));
      await realClick(s, trigger);
      const d = await expectDialog(s, /Rozpocznijmy/);
      return `„${label}” → ${d.heading} (${d.w}x${d.h})`;
    },
  );
  if (!ok) return;
  const D = 'dialog[open]';
  await step('krok 1: walidacja pustego formularza', 'komunikaty błędów widoczne', async () => {
    const next = await findEl(s, 'button', /Zapisz i przejdź dalej/, D);
    if (!next) throw new StepFail('brak przycisku „Zapisz i przejdź dalej”');
    await realClick(s, next);
    const t = await expectVisibleText(
      s,
      /(co najmniej 2 znaki|Nieprawidłowy adres|Zgoda na przetwarzanie)/,
      { within: D },
    );
    return t;
  });
  await step(
    'krok 1: wypełnienie fikcyjnymi danymi → krok 2',
    'krok 2 widoczny (API zamockowane)',
    async () => {
      const dlg = await openDialogEl(s);
      const inputs = await dlg.$$('input:not([type=checkbox]):not([tabindex="-1"])');
      const vis = [];
      for (const i of inputs) if (await i.evaluate((e) => window.__e2e.rendered(e))) vis.push(i);
      if (vis.length < 3) throw new StepFail(`spodziewano 3 pól, jest ${vis.length}`);
      await typeInto(s, vis[0], FAKE.name);
      await typeInto(s, vis[1], FAKE.email);
      await typeInto(s, vis[2], FAKE.phone);
      const cb = await dlg.$('input[type=checkbox]');
      await realClick(s, cb, { allowCovered: true });
      const checked = await cb.evaluate((e) => e.checked);
      if (!checked) throw new StepFail('checkbox zgody nie zaznacza się klikiem');
      const next = await findEl(s, 'button', /Zapisz i przejdź dalej/, D);
      await realClick(s, next);
      await expectVisibleText(s, /^Dalej$/, { within: D, timeout: 6000 });
      return `mock API: ${s.mocks.join(',')}`;
    },
  );
  await step('krok 2 → Wstecz zachowuje dane', 'krok 1 z wpisanym imieniem', async () => {
    const back = await findEl(s, 'button', /^Wstecz$/, D);
    if (!back) throw new StepFail('brak „Wstecz”');
    await realClick(s, back);
    const val = await waitFor(
      s,
      (n) => {
        const i = [...document.querySelectorAll('dialog[open] input')].find((e) => e.value === n);
        return { __ok: !!i };
      },
      FAKE.name,
      { timeout: 3000 },
    );
    if (!val?.__ok) throw new StepFail('dane z kroku 1 zniknęły po „Wstecz”');
    const next = await findEl(s, 'button', /Zapisz i przejdź dalej/, D);
    await realClick(s, next);
    await expectVisibleText(s, /^Dalej$/, { within: D, timeout: 6000 });
  });
  await step(
    'krok 2 → krok 3',
    'pole wiadomości + „Wyślij zgłoszenie” widoczne (NIE klikamy)',
    async () => {
      const next = await findEl(s, 'button', /^Dalej$/, D);
      await realClick(s, next);
      await expectVisibleText(s, /Ostatni krok/, { within: D, timeout: 6000 });
      const ta = await findEl(s, 'textarea', null, D);
      if (!ta) throw new StepFail('brak pola wiadomości');
      await typeInto(s, ta, 'Test E2E — proszę zignorować.');
      const send = await findEl(s, 'button[type=submit]', /Wyślij/, D);
      if (!send) throw new StepFail('brak przycisku „Wyślij zgłoszenie”');
      const st = await send.evaluate((e) => ({
        disabled: e.disabled,
        hit: (e.scrollIntoView({ block: 'center', behavior: 'instant' }), window.__e2e.hitTest(e)),
      }));
      if (st.disabled || !st.hit.ok)
        throw new StepFail(
          `„Wyślij” nieklikalny: disabled=${st.disabled} covered=${st.hit.coveredBy}`,
        );
      return '„Wyślij zgłoszenie” widoczny i aktywny';
    },
  );
  await step(
    'zamknięcie przyciskiem X i powrót fokusu',
    'modal znika, fokus na CTA, scroll odblokowany',
    async () => {
      const x = await findEl(s, 'button[aria-label="Zamknij okno"]', null, D);
      if (!x) throw new StepFail('brak przycisku „Zamknij okno”');
      await realClick(s, x);
      await expectNoDialog(s);
      await sleep(350);
      const st = await state(s);
      const msg = [];
      if (!st.activeIsTrigger) msg.push(`fokus na ${st.active}`);
      if (st.bodyOverflow === 'hidden') msg.push('body overflow hidden');
      if (msg.length) throw warnStep(msg.join('; '));
      return `mock API: ${s.mocks.join(',')}`;
    },
  );
}

// ---- lejek: /contact/ (InlineContactForm)
async function contactPageFunnel(s, step) {
  await openUrl(s, `${BASE}/contact/`);
  const F = 'main';
  await step('formularz widoczny', 'krok 1 z polami i przyciskiem', async () => {
    const next = await findEl(s, 'button', /Zapisz i przejdź dalej/, F);
    if (!next) throw new StepFail('brak formularza / przycisku');
    await next.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    return 'ok';
  });
  await step('walidacja pustego kroku 1', 'błędy widoczne', async () => {
    const next = await findEl(s, 'button', /Zapisz i przejdź dalej/, F);
    await realClick(s, next);
    return expectVisibleText(
      s,
      /(co najmniej 2 znaki|Nieprawidłowy adres|Zgoda na przetwarzanie)/,
      { within: F },
    );
  });
  await step('krok 1 → krok 2 (mock API)', 'krok 2', async () => {
    const inputs = [];
    for (const i of await s.page.$$(`${F} form input:not([type=checkbox]):not([tabindex="-1"])`))
      if (await i.evaluate((e) => window.__e2e.rendered(e))) inputs.push(i);
    await typeInto(s, inputs[0], FAKE.name);
    await typeInto(s, inputs[1], FAKE.email);
    await typeInto(s, inputs[2], FAKE.phone);
    const cb = await s.page.$(`${F} form input[type=checkbox]`);
    await realClick(s, cb, { allowCovered: true });
    const next = await findEl(s, 'button', /Zapisz i przejdź dalej/, F);
    await realClick(s, next);
    await expectVisibleText(s, /^Dalej$/, { within: F, timeout: 6000, scroll: true });
    return `mock: ${s.mocks.join(',')}`;
  });
  await step('krok 2 → krok 3', '„Wyślij zgłoszenie” widoczny (NIE klikamy)', async () => {
    const next = await findEl(s, 'button', /^Dalej$/, F);
    await realClick(s, next);
    await expectVisibleText(s, /Ostatni krok/, { timeout: 6000, scroll: true });
    const send = await findEl(s, 'button[type=submit]', /Wyślij/, F);
    if (!send) throw new StepFail('brak „Wyślij zgłoszenie”');
    return 'ok';
  });
  await step('„Edytuj dane” → krok 2', 'krok 2', async () => {
    const b = await findEl(s, 'button', /Edytuj dane/, F);
    await realClick(s, b);
    await expectVisibleText(s, /^Dalej$/, { within: F, timeout: 3000, scroll: true });
  });
}

// ---- lejek: /wycena/ (PublicCalculator)
async function wycenaFunnel(s, step) {
  await openUrl(s, `${BASE}/wycena/`);
  const steps = [];
  await step('pytania załadowane', '„Krok 1 z N” widoczny', async () => {
    const t = await expectVisibleText(s, /Krok 1 z \d+/, { timeout: 15000, scroll: true });
    return t;
  });
  await step(
    'przejście wszystkich kroków bez odpowiedzi',
    'krok kontaktowy osiągnięty',
    async () => {
      for (let i = 0; i < 15; i++) {
        const t = await ev(s, () =>
          (document.body.innerText.match(/Krok (\d+) z (\d+)/) || []).slice(1).map(Number),
        );
        steps.push(t.join('/'));
        if (t[0] === t[1]) break;
        const next = await findEl(s, 'button', /^Dalej$/);
        if (!next) throw new StepFail(`brak „Dalej” na kroku ${t[0]}`);
        await realClick(s, next);
        await sleep(250);
      }
      await expectVisibleText(s, /Gdzie wysłać widełki/, { scroll: true });
      return `kroki: ${steps.join(' → ')}`;
    },
  );
  await step(
    '„Poznaj widełki” bez odpowiedzi → walidacja (bez żądania)',
    'błąd + powrót do kroku z pierwszym błędem + fokus',
    async () => {
      const b = await findEl(s, 'button', /Poznaj widełki/);
      if (!b) throw new StepFail('brak „Poznaj widełki”');
      await realClick(s, b);
      const t = await expectVisibleText(s, /Uzupełnij, żeby poznać widełki/, { timeout: 3000 });
      const info = await ev(s, () => ({
        step: (document.body.innerText.match(/Krok (\d+) z (\d+)/) || [])[0],
        focus: window.__e2e.describe(document.activeElement),
      }));
      if (s.abortedNonGet.length)
        throw new StepFail(`walidacja przepuściła żądanie: ${s.abortedNonGet[0]}`);
      return `${t.slice(0, 60)} | ${info.step} | fokus: ${info.focus}`;
    },
  );
  await step(
    'odpowiedzi na wszystkie pytania (pierwsza opcja)',
    'krok kontaktowy, brak błędów pytań',
    async () => {
      for (let guard = 0; guard < 15; guard++) {
        // zaznacz pierwszą opcję każdej grupy / wpisz liczbę w pola
        await ev(s, () => {
          const main = document.querySelector('main');
          main.querySelectorAll('[role=radiogroup], [role=group]').forEach((g) => {
            if (!g.querySelector('[aria-checked="true"], [aria-pressed="true"]'))
              g.querySelector('button')?.click();
          });
        });
        for (const inp of await s.page.$$(
          'main input[type=number], main input[type=text]:not([name=website_verify])',
        )) {
          if ((await inp.evaluate((e) => window.__e2e.rendered(e) && !e.value)) === true)
            await typeInto(s, inp, '3');
        }
        await sleep(200);
        const t = await ev(s, () =>
          (document.body.innerText.match(/Krok (\d+) z (\d+)/) || []).slice(1).map(Number),
        );
        if (t[0] === t[1]) break;
        const next = await findEl(s, 'button', /^Dalej$/);
        await realClick(s, next);
        await sleep(250);
      }
      await expectVisibleText(s, /Gdzie wysłać widełki/, { scroll: true });
      const remaining = await ev(s, () => document.querySelector('[role=alert]')?.innerText || '');
      if (
        /Uzupełnij.*;/.test(remaining) &&
        !/^Uzupełnij, żeby poznać widełki: adres e-mail$/.test(remaining.trim())
      )
        throw warnStep(`nadal błędy: ${remaining.slice(0, 120)}`);
      return remaining ? `alert: ${remaining.slice(0, 80)}` : 'ok';
    },
  );
  await step(
    'niepoprawny e-mail → walidacja (bez żądania)',
    'błąd e-maila widoczny, zero POST',
    async () => {
      const email = await s.page.$('#calc-email');
      await typeInto(s, email, 'to-nie-jest-email');
      const b = await findEl(s, 'button', /Poznaj widełki/);
      await realClick(s, b);
      await sleep(500);
      if (s.abortedNonGet.length)
        throw new StepFail(`niepoprawny e-mail przepuszczony do API: ${s.abortedNonGet[0]}`);
      const err = await ev(s, () => {
        const e = document.getElementById('calc-email-err');
        return e && window.__e2e.rendered(e) ? e.innerText : null;
      });
      if (!err) throw new StepFail('brak widocznego błędu e-maila');
      return err;
    },
  );
}

// ---- lejek: /audyt-360/
async function auditFunnel(s, step) {
  await openUrl(s, `${BASE}/audyt-360/`);
  await step('pole URL widoczne', 'input + przycisk', async () => {
    const inp = await findEl(s, 'main form input', null);
    if (!inp) throw new StepFail('brak pola URL');
    await inp.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
    const info = await inp.evaluate((e) => ({
      type: e.type,
      required: e.required,
      ph: e.placeholder,
    }));
    return JSON.stringify(info);
  });
  await step(
    'pusty submit → brak żądania, walidacja',
    'zostaje krok INPUT, zero POST',
    async () => {
      const btn = await findEl(s, 'main form button[type=submit], main form button', null);
      await realClick(s, btn);
      await sleep(600);
      if (s.abortedNonGet.length)
        throw new StepFail(`pusty formularz wysłał żądanie: ${s.abortedNonGet[0]}`);
      const v = await ev(s, () => {
        const i = document.querySelector('main form input');
        return {
          invalid: i?.matches(':invalid'),
          msg: i?.validationMessage,
          still: !!i && window.__e2e.rendered(i),
        };
      });
      if (!v.still) throw new StepFail('formularz zniknął po pustym submicie');
      return `:invalid=${v.invalid} „${v.msg}”`;
    },
  );
  await step(
    'wpisanie URL (STOP przed „Skanuj” — POST /api/audit/run_audit)',
    'wartość w polu, przycisk aktywny',
    async () => {
      const inp = await findEl(s, 'main form input', null);
      await typeInto(s, inp, FAKE.url);
      const v = await ev(s, () => {
        const i = document.querySelector('main form input');
        const b = document.querySelector('main form button[type=submit], main form button');
        return {
          value: i.value,
          valid: i.checkValidity(),
          btn: window.__e2e.label(b),
          disabled: b.disabled,
        };
      });
      if (!v.valid || v.disabled) throw new StepFail(JSON.stringify(v));
      return `${v.value} | „${v.btn}” aktywny`;
    },
  );
}

// ---- lejek: /abonament/
const TIER_PRICES = { starter: '179', standard: '249', premium: '349', professional: '549' };
async function abonamentTierFunnel(s, step, tierLabel, tierId) {
  await openUrl(s, `${BASE}/abonament/`);
  let trig;
  const ok = await step(
    `klik „Wybierz ${tierLabel}” (świeża sesja, 1. klik)`,
    'dialog zamówienia otwarty z tym pakietem',
    async () => {
      const tiers = await s.page.$$('main button');
      for (const b of tiers) {
        const l = await b.evaluate((e) => window.__e2e.label(e));
        if (new RegExp(`^Wybierz ${tierLabel}\\b`, 'i').test(l)) {
          trig = b;
          break;
        }
      }
      if (!trig) throw new StepFail(`brak przycisku „Wybierz ${tierLabel}”`);
      const y = await trig.evaluate(
        (e) => e.getBoundingClientRect().top + scrollY - innerHeight / 2,
      );
      await humanScrollTo(s, Math.max(0, Math.round(y)));
      await trig.evaluate((e) => e.setAttribute('data-e2e-trigger', '1'));
      await realClick(s, trig);
      const d = await expectDialog(s, null, 4000);
      const sel = await ev(s, () => document.getElementById('pb-tier')?.value);
      if (sel !== tierId) throw new StepFail(`w modalu pakiet „${sel}” zamiast „${tierId}”`);
      return `${d.heading} | pb-tier=${sel}`;
    },
  );
  if (!ok) return;
  await step('walidacja pól po blur (puste)', 'błędy pod polami widoczne', async () => {
    const errs = [];
    for (const id of ['pb-business', 'pb-email', 'pb-phone', 'pb-nip']) {
      const el = await s.page.$(`#${id}`);
      if (!el) continue;
      await realClick(s, el, { allowCovered: true });
      await s.page.keyboard.press('Tab');
      await sleep(150);
    }
    for (const id of ['pb-business-err', 'pb-email-err', 'pb-phone-err', 'pb-nip-err'])
      if (
        await ev(
          s,
          (i) => {
            const e = document.getElementById(i);
            return !!e && window.__e2e.rendered(e);
          },
          id,
        )
      )
        errs.push(id);
    if (errs.length < 2)
      throw warnStep(`tylko ${errs.length} komunikatów po blur: ${errs.join(',')}`);
    return errs.join(', ');
  });
  await step(
    'wypełnienie fikcyjnymi danymi + zgody',
    'brak błędów, „Zapłać … kartą” aktywny (NIE klikamy)',
    async () => {
      for (const [id, v] of [
        ['pb-business', FAKE.business],
        ['pb-email', FAKE.email],
        ['pb-phone', FAKE.phone],
        ['pb-nip', FAKE.nip],
      ]) {
        const el = await s.page.$(`#${id}`);
        if (!el) continue;
        await el.evaluate(
          (e) => ((e.value = ''), e.dispatchEvent(new Event('input', { bubbles: true }))),
        );
        await typeInto(s, el, v);
      }
      const boxes = await s.page.$$('dialog[open] input[type=checkbox]');
      if (boxes[0]) await realClick(s, boxes[0], { allowCovered: true });
      await s.page.keyboard.press('Tab');
      await sleep(200);
      const st = await ev(s, () => {
        const errs = [...document.querySelectorAll('dialog[open] [id$="-err"]')]
          .filter((e) => window.__e2e.rendered(e))
          .map((e) => e.id + ': ' + e.innerText);
        const b = document.querySelector('dialog[open] button[type=submit]');
        b?.scrollIntoView({ block: 'center', behavior: 'instant' });
        return {
          errs,
          label: b ? window.__e2e.label(b) : null,
          disabled: b?.disabled,
          hit: b ? window.__e2e.hitTest(b) : null,
          consent: document.querySelector('dialog[open] input[type=checkbox]')?.checked,
        };
      });
      if (st.errs.length) throw new StepFail(`błędy przy poprawnych danych: ${st.errs.join('; ')}`);
      if (!st.label || st.disabled || !st.hit?.ok)
        throw new StepFail(`przycisk płatności: ${JSON.stringify(st)}`);
      if (!st.consent) throw new StepFail('zgoda nie zaznaczona');
      if (!st.label.includes(TIER_PRICES[tierId]))
        throw warnStep(`etykieta „${st.label}” bez ceny ${TIER_PRICES[tierId]}`);
      return `„${st.label}” aktywny`;
    },
  );
  await step('zamknięcie i fokus', 'modal zamknięty, fokus na „Wybierz …”', async () => {
    if (s.isMobile)
      await realClick(
        s,
        await findEl(s, 'button[aria-label="Zamknij okno"]', null, 'dialog[open]'),
      );
    else await s.page.keyboard.press('Escape');
    await expectNoDialog(s);
    await sleep(300);
    const st = await state(s);
    if (!st.activeIsTrigger) throw warnStep(`fokus na ${st.active}`);
    return 'ok';
  });
  await step('ponowne otwarcie tym samym przyciskiem', 'dialog otwiera się ponownie', async () => {
    await realClick(s, trig);
    const d = await expectDialog(s, null, 4000);
    return d.heading;
  });
}

async function abonamentDeepLinkFunnel(s, step) {
  await step('?tier=standard (świeża sesja)', 'dialog otwarty z pakietem Standard', async () => {
    await openUrl(s, `${BASE}/abonament/?tier=standard`);
    const d = await expectDialog(s, null, 6000);
    const sel = await ev(s, () => document.getElementById('pb-tier')?.value);
    if (sel !== 'standard') throw new StepFail(`pb-tier=${sel}`);
    return d.heading;
  });
  await step('zmiana pakietu w select', 'nagłówek modala aktualizuje się', async () => {
    await s.page.select('#pb-tier', 'premium');
    await sleep(300);
    const t = await ev(s, () => document.querySelector('dialog[open]')?.innerText.slice(0, 200));
    if (!/Premium/i.test(t)) throw new StepFail(`modal po zmianie: ${t?.slice(0, 80)}`);
    return 'Premium';
  });
}

async function abonamentCanceledFunnel(s, step) {
  await step(
    '?stripe=canceled (świeża sesja)',
    'baner „Anulowałeś płatność” widoczny',
    async () => {
      await openUrl(s, `${BASE}/abonament/?stripe=canceled`);
      return expectVisibleText(s, /Anulowałeś płatność/, { scroll: true, timeout: 5000 });
    },
  );
  await step('„Wróć do pakietów ↑” przewija do cennika', '#pricing w widoku', async () => {
    const a = await findEl(s, 'a', /Wróć do pakietów/);
    if (!a) throw new StepFail('brak linku');
    await realClick(s, a);
    await waitStable(s);
    const ht = await ev(s, () => window.__e2e.hashTarget('pricing'));
    if (!ht.found || ht.top > ht.vh * 0.6 || ht.bottom < 0)
      throw new StepFail(`#pricing top=${ht.top}`);
    return `top=${ht.top}`;
  });
  await step('wybór pakietu po anulowaniu', 'dialog otwiera się', async () => {
    const b = await findEl(s, 'main button', /^Wybierz Standard/);
    await realClick(s, b);
    const d = await expectDialog(s, null, 4000);
    return d.heading;
  });
}

// ---- lejek: baner cookies
async function cookieFunnel(s, step, variant) {
  await openUrl(s, `${BASE}/`);
  const B = '[aria-label="Baner plików cookies"]';
  const bannerVisible = () =>
    ev(
      s,
      (sel) => {
        const b = document.querySelector(sel);
        if (!b) return false;
        const r = b.getBoundingClientRect();
        return window.__e2e.rendered(b) && r.top < innerHeight && r.bottom > 0;
      },
      B,
    );
  await step(
    'baner widoczny w świeżej sesji',
    'region „Baner plików cookies” w viewporcie',
    async () => {
      for (let i = 0; i < 20 && !(await bannerVisible()); i++) await sleep(150);
      if (!(await bannerVisible())) throw new StepFail('banera brak');
      const covers = await ev(
        s,
        (sel) => {
          const b = document.querySelector(sel);
          const r = b.getBoundingClientRect();
          return Math.round((r.height / innerHeight) * 100);
        },
        B,
      );
      return `zajmuje ${covers}% wysokości ekranu`;
    },
  );
  const beaconHosts = () =>
    [
      ...new Set(
        s.beacons.map((u) => {
          const x = new URL(u);
          return x.hostname + x.pathname.slice(0, 20);
        }),
      ),
    ].join(', ');
  await step(
    'przed decyzją: zero beaconów analityki',
    'brak POST do GA/doubleclick/Zaraz przed zgodą',
    async () => {
      await sleep(1500);
      if (s.beacons.length)
        throw warnStep(`${s.beacons.length} beaconów przed decyzją: ${beaconHosts()}`);
      return 'ok';
    },
  );
  const btnRe = {
    accept: /Akceptuję wszystkie/,
    reject: /Odrzuć opcjonalne/,
    settings: /Dostosuj/,
  }[variant];
  const expectedConsent = {
    accept: { analytics: true, marketing: true },
    reject: { analytics: false, marketing: false },
    settings: { analytics: true, marketing: false },
  }[variant];
  await step(`klik „${btnRe.source}”`, 'akcja wykonana', async () => {
    const b = await findEl(s, 'button', btnRe, B);
    if (!b) throw new StepFail('brak przycisku');
    await realClick(s, b);
    if (variant === 'settings') {
      await sleep(300);
      const t = await ev(s, (sel) => document.querySelector(sel)?.innerText || '', B);
      // przełącz analityczne, zapisz
      const toggles = await s.page.$$(
        `${B} button[aria-pressed], ${B} button[role=switch], ${B} button[aria-checked], ${B} input[type=checkbox]:not([disabled])`,
      );
      if (!toggles.length)
        throw new StepFail(`brak przełączników w preferencjach: ${t.slice(0, 120)}`);
      await realClick(s, toggles[0], { allowCovered: true });
      const save = await findEl(s, 'button', /Zapisz wybrane/, B);
      if (!save) throw new StepFail('brak „Zapisz wybrane”');
      await realClick(s, save);
    }
    return 'ok';
  });
  await step(
    'zgoda zapisana, baner znika',
    `cookie-consent-v2=${JSON.stringify(expectedConsent)}`,
    async () => {
      await sleep(400);
      if (await bannerVisible()) throw new StepFail('baner nadal widoczny');
      const c = await ev(s, () => localStorage.getItem('cookie-consent-v2'));
      const parsed = JSON.parse(c || 'null');
      if (
        !parsed ||
        parsed.analytics !== expectedConsent.analytics ||
        parsed.marketing !== expectedConsent.marketing
      )
        throw new StepFail(`zapisano ${c}`);
      return c;
    },
  );
  await step(
    'po przeładowaniu baner się nie pokazuje',
    'brak banera, jest przycisk ustawień',
    async () => {
      s.beacons.length = 0;
      await openUrl(s, `${BASE}/o-nas/`);
      await sleep(500);
      if (await bannerVisible()) throw new StepFail('baner wrócił mimo zapisanej zgody');
      const fb = await findEl(s, 'button[aria-label="Ustawienia plików cookies"]', null);
      if (!fb) throw new StepFail('brak pływającego przycisku ustawień cookies');
      return 'ok';
    },
  );
  if (variant === 'reject')
    await step(
      'po odrzuceniu: zero beaconów analityki',
      'brak POST do GA/doubleclick po „Odrzuć”',
      async () => {
        await sleep(1500);
        if (s.beacons.length)
          throw warnStep(`${s.beacons.length} beaconów po odrzuceniu: ${beaconHosts()}`);
        return 'ok';
      },
    );
  await step(
    'ponowne otwarcie (pływający przycisk 🍪)',
    'baner widoczny, bieżące wybory zachowane',
    async () => {
      await humanScrollTo(s, 99999);
      const fb = await findEl(s, 'button[aria-label="Ustawienia plików cookies"]', null);
      await realClick(s, fb);
      for (let i = 0; i < 10 && !(await bannerVisible()); i++) await sleep(150);
      if (!(await bannerVisible())) throw new StepFail('baner nie otworzył się');
      const footerLink = await ev(s, () =>
        [...document.querySelectorAll('footer a, footer button')].some((e) =>
          /cookie|prywatno.*ustaw|ustawienia prywatności/i.test(e.innerText),
        ),
      );
      return footerLink
        ? 'ok (jest też link w stopce)'
        : 'ok (w stopce brak linku „Ustawienia cookies” — tylko pływający przycisk)';
    },
  );
  if (variant === 'accept') {
    await step('Esc zamyka ponownie otwarty baner', 'baner znika', async () => {
      await s.page.keyboard.press('Escape');
      await sleep(300);
      if (await bannerVisible()) throw new StepFail('Esc nie zamyka');
      return 'ok';
    });
  }
}

// ---- lejek: menu mobilne
async function mobileMenuLinks(browser) {
  const s = await newSession(browser, 'mobile');
  try {
    await openUrl(s, `${BASE}/`);
    await dismissCookieBanner(s);
    await realClick(s, await findEl(s, 'button[aria-controls="mobile-menu"]', null));
    await sleep(700);
    const sub = await findEl(s, '#mobile-menu button[aria-expanded]', null);
    if (sub) await realClick(s, sub);
    await sleep(700);
    return await ev(s, () =>
      [...document.querySelectorAll('#mobile-menu a[href], #mobile-menu button')]
        .filter(
          (e) =>
            !/Zamknij menu/i.test(e.getAttribute('aria-label') || '') &&
            !e.hasAttribute('aria-expanded'),
        )
        .map((e) => ({
          key: window.__e2e.key(e),
          label: window.__e2e.label(e).slice(0, 60),
          href: e.getAttribute('href') || '',
          inSub: !!e.closest('#mobile-offers-submenu'),
        })),
    );
  } finally {
    await s.close();
  }
}

async function mobileMenuFunnel(s, step, item) {
  await openUrl(s, `${BASE}/`);
  await step('otwarcie menu (hamburger)', '#mobile-menu widoczne', async () => {
    const h = await findEl(s, 'button[aria-controls="mobile-menu"]', null);
    if (!h) throw new StepFail('brak hamburgera');
    await realClick(s, h);
    const r = await waitFor(
      s,
      () => {
        const m = document.getElementById('mobile-menu');
        const r2 = m.getBoundingClientRect();
        return {
          __ok:
            m.getAttribute('aria-hidden') === 'false' &&
            window.__e2e.rendered(m) &&
            Math.abs(r2.left) < 2,
        };
      },
      null,
      { timeout: 2500 },
    );
    if (!r?.__ok) throw new StepFail('menu nie wjechało');
    return 'ok';
  });
  if (item.inSub)
    await step('rozwinięcie „Oferta”', 'podmenu widoczne', async () => {
      const sub = await findEl(s, '#mobile-menu button[aria-expanded]', null);
      await realClick(s, sub);
      await sleep(600);
      return 'ok';
    });
  await step(
    `tap „${item.label}”${item.href ? ` → ${item.href}` : ''}`,
    item.href ? 'nawigacja + menu zamknięte' : 'akcja + menu zamknięte',
    async () => {
      let el = null;
      for (let i = 0; i < 10 && !el; i++) {
        el = await s.page
          .evaluateHandle(
            (k) =>
              [...document.querySelectorAll('#mobile-menu a[href], #mobile-menu button')].find(
                (e) => window.__e2e.key(e) === k,
              ) || null,
            item.key,
          )
          .then((h) => h.asElement());
        if (!el) await sleep(150);
      }
      if (!el) throw new StepFail('pozycja menu nie znaleziona');
      if (/^(tel|mailto):/.test(item.href)) {
        const ok = /^tel:\+?\d{9,15}$|^mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(item.href);
        if (!ok) throw new StepFail(`zły href ${item.href}`);
        return `href OK (${item.href})`;
      }
      const before = await state(s);
      await realClick(s, el);
      const r = await waitFor(
        s,
        (bp) => {
          const st = window.__e2e.state();
          return {
            __ok: (st.path !== bp || st.dialogs.some((d) => d.ok)) && !st.mobileMenuOpen,
            st,
          };
        },
        before.path,
        { timeout: 5000 },
      );
      const st = r?.st || (await state(s));
      if (!r?.__ok)
        throw new StepFail(
          `menuOpen=${st.mobileMenuOpen} path=${st.path} dialog=${st.dialogs.some((d) => d.ok)}`,
        );
      if (item.href) {
        const exp = normPath(new URL(item.href, BASE).pathname);
        if (normPath(st.path) !== exp) throw new StepFail(`ścieżka ${st.path} zamiast ${exp}`);
        await waitFor(s, () => ({ __ok: window.__e2e.state().h1Visible }), null, { timeout: 8000 });
        const st2 = await state(s);
        if (st2.bodyOverflow === 'hidden')
          throw new StepFail('scroll body zablokowany po nawigacji z menu');
        return `→ ${st2.path} („${st2.h1}”)`;
      }
      const d = st.dialogs.find((x) => x.ok);
      return d ? `modal „${d.heading}”` : 'ok';
    },
  );
}

async function mobileMenuClose(s, step) {
  await openUrl(s, `${BASE}/`);
  await realClick(s, await findEl(s, 'button[aria-controls="mobile-menu"]', null));
  await sleep(600);
  await step('X zamyka menu', 'menu ukryte, scroll odblokowany', async () => {
    const x = await findEl(s, '#mobile-menu button[aria-label="Zamknij menu nawigacyjne"]', null);
    await realClick(s, x);
    await sleep(700);
    const st = await state(s);
    if (st.mobileMenuOpen) throw new StepFail('menu nadal otwarte');
    if (st.bodyOverflow === 'hidden') throw new StepFail('body overflow hidden');
    return 'ok';
  });
}

// ---- /portal/ (tylko render)
async function portalFunnel(s, step) {
  await step(
    'ekran logowania /portal/',
    'formularz z polem e-mail widoczny, bez błędów JS',
    async () => {
      const st = await openUrl(s, `${BASE}/portal/`);
      await sleep(800);
      const r = await ev(s, () => {
        const inp = document.querySelector('main input[type=email], main input');
        const btn = document.querySelector('main form button, main button');
        return {
          input: !!inp && window.__e2e.rendered(inp),
          btn: btn ? window.__e2e.label(btn) : null,
          h: window.__e2e.state().h1,
        };
      });
      if (!r.input) throw new StepFail(`brak pola logowania (HTTP ${st}, h1=${r.h})`);
      const errs = s.errors.filter((e) => !/turnstile|zaraz/i.test(e));
      if (errs.length) throw warnStep(`błędy konsoli: ${errs.slice(0, 2).join(' | ')}`);
      return `HTTP ${st}; „${r.h}”; przycisk „${r.btn}”`;
    },
  );
}

async function runFunnels(browser) {
  const tasks = [];
  const add = (vp, name, fn, opts) => tasks.push(() => runFunnel(browser, vp, name, fn, opts));
  for (const vp of VIEWPORT_NAMES) {
    for (const [p, t, re] of CONTACT_MODAL_PAGES)
      add(vp, `modal-kontakt ${p} (${t})`, (s, st) => contactModalFunnel(s, st, p, re), {
        mockContact: true,
      });
    add(vp, 'contact-page', contactPageFunnel, { mockContact: true });
    add(vp, 'wycena', wycenaFunnel);
    add(vp, 'audyt-360', auditFunnel);
    for (const [label, id] of [
      ['Starter', 'starter'],
      ['Standard', 'standard'],
      ['Premium', 'premium'],
      ['Professional', 'professional'],
    ])
      add(vp, `abonament-${id}`, (s, st) => abonamentTierFunnel(s, st, label, id));
    add(vp, 'abonament-deeplink', abonamentDeepLinkFunnel);
    add(vp, 'abonament-canceled', abonamentCanceledFunnel);
    for (const v of ['accept', 'reject', 'settings'])
      add(vp, `cookies-${v}`, (s, st) => cookieFunnel(s, st, v));
    add(vp, 'portal', portalFunnel);
  }
  if (VIEWPORT_NAMES.includes('mobile') && (!FUNNEL_FILTER || FUNNEL_FILTER.test('mobile-menu'))) {
    add('mobile', 'mobile-menu-close', mobileMenuClose);
    const items = await mobileMenuLinks(browser);
    console.log(`   menu mobilne: ${items.length} pozycji`);
    for (const it of items)
      add('mobile', `mobile-menu ${it.label}`, (s, st) => mobileMenuFunnel(s, st, it), {
        mockContact: true,
      });
  }
  console.log(`\n== Lejki: ${tasks.length}`);
  await pool(tasks, Math.max(1, Math.floor(CONCURRENCY / 2)), (t) => t());
}

// ---------------------------------------------------------------- raport
async function writeReport(meta) {
  const by = (k) => results.filter((r) => r.status === k);
  const esc = (x) =>
    String(x ?? '')
      .replace(/\|/g, '\\|')
      .replace(/\n/g, ' ');
  const lines = [
    `# E2E CTA + lejki — ${BASE}`,
    '',
    `Data: ${new Date().toISOString()} · Chrome ${CHROME_MAJOR} · viewporty: ${VIEWPORT_NAMES.join(', ')}`,
    '',
    `Wyniki: ✓ ${by('pass').length} · ✗ ${by('fail').length} · ! ${by('warn').length}`,
    '',
    `Bezpieczeństwo: zablokowano ${safetyLog.aborted} żądań (w tym ${safetyLog.abortedNonGet.length} nie-GET), zamockowano ${safetyLog.mocked} POST /api/contact-submit (nie wyszły w sieć).`,
    '',
    '## Liczniki',
    '',
    '```',
    JSON.stringify(meta, null, 2),
    '```',
    '',
    '## Błędy i ostrzeżenia',
    '',
    '| status | viewport | strona / lejek | CTA / krok | oczekiwane | faktyczne | zrzut |',
    '|---|---|---|---|---|---|---|',
    ...results
      .filter((r) => r.status === 'fail' || r.status === 'warn')
      .map(
        (r) =>
          `| ${r.status} | ${r.viewport} | ${esc(r.page)} | ${esc(r.name)} | ${esc(r.expected)} | ${esc(r.actual)} | ${r.screenshot ? esc(path.relative(OUT, r.screenshot)) : ''} |`,
      ),
    '',
  ];
  await fs.writeFile(path.join(OUT, 'report.md'), lines.join('\n'));
  await fs.writeFile(
    path.join(OUT, 'results.json'),
    JSON.stringify({ meta, safety: safetyLog, results }, null, 2),
  );
}

// ---------------------------------------------------------------- main
async function main() {
  await fs.mkdir(SHOTS, { recursive: true });
  const args = ['--no-sandbox', '--disable-dev-shm-usage'];
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (proxy && !IS_LOCAL) args.push(`--proxy-server=${proxy}`);
  const browser = await puppeteer.launch({ headless: true, args, protocolTimeout: 120000 });
  CHROME_MAJOR = (await browser.version()).match(/\/(\d+)/)?.[1] || CHROME_MAJOR;
  console.log(`E2E CTA → ${BASE}  (raport: ${OUT})`);
  const meta = { base: BASE, viewports: VIEWPORT_NAMES };
  try {
    if (ONLY.has('cta')) {
      let paths = await loadPaths(browser);
      if (PAGE_FILTER) paths = paths.filter((p) => PAGE_FILTER.test(p));
      meta.pages = paths.length;
      meta.cta = await runCtas(browser, paths);
    }
    if (ONLY.has('funnels')) await runFunnels(browser);
  } finally {
    await browser.close();
  }
  const fstat = (k, vp) => results.filter((r) => r.kind === k && r.viewport === vp).length;
  meta.checks = Object.fromEntries(
    VIEWPORT_NAMES.map((vp) => [
      vp,
      {
        cta_clicks: fstat('cta', vp),
        static: fstat('static', vp),
        funnel_steps: fstat('funnel', vp),
      },
    ]),
  );
  await writeReport(meta);
  const fails = results.filter((r) => r.status === 'fail').length;
  const warns = results.filter((r) => r.status === 'warn').length;
  console.log(
    `\nGotowe: ${results.length} sprawdzeń, ✗ ${fails}, ! ${warns}. Raport: ${path.join(OUT, 'report.md')}`,
  );
  console.log(
    `Bezpieczeństwo: zablokowano ${safetyLog.aborted} żądań (${safetyLog.abortedNonGet.length} nie-GET), mock ${safetyLog.mocked}.`,
  );
  process.exitCode = fails ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
