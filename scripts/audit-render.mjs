/**
 * Audyt renderowania — klasa błędów „renderuje się źle, ale nic nie krzyczy".
 *
 * Testy jednostkowe, axe i smoke testy przechodzą, gdy wykres ma 0 px wysokości,
 * obraz się nie wczytał, sekcja z nagłówkiem jest pusta albo element wystaje poza
 * ekran telefonu. Ten skrypt odwiedza każdą stronę z sitemapy (+ /portal/) na
 * desktopie (1366×900) i telefonie (390×844, UA mobilny, dotyk), przewija ją do
 * końca krokami (sekcje LazyHydrate muszą się zhydratować — patrz CLAUDE.md),
 * czeka i zbiera:
 *
 *  - błędy strony i konsoli (bez zablokowanej analityki), ostrzeżenia recharts,
 *  - nieudane żądania (4xx/5xx/failed) — własne, CMS, CDN,
 *  - zepsute / niewczytane obrazy, obrazy mocno rozciągnięte (rozmyte) lub
 *    mocno za duże (zmarnowane bajty),
 *  - zwinięte komponenty wizualne (recharts, canvas, svg z wykresem, iframe,
 *    video), placeholdery LazyHydrate/Suspense, które się nie wypełniły,
 *    skeletony/spinnery widoczne po załadowaniu, nagłówki bez treści,
 *  - poziome przewijanie dokumentu i element, który je powoduje,
 *  - tekst ucięty przez kontener z overflow hidden/clip albo wylewający się poza
 *    ramkę/tło swojego pudełka,
 *  - surowy HTML widoczny jako tekst („<strong>…", „&amp;"),
 *  - treść pod stałym Navbarem w spoczynku (scrollY = 0),
 *  - treść z opacity 0 nawet po przewinięciu jej do widoku (utknięta animacja).
 *
 * Kontrast/niewidoczny tekst — poza zakresem (axe, scripts/audit-a11y.js).
 *
 * Bezpieczeństwo produkcji: beacony analityki (Zaraz, GA, GTM, RUM) są blokowane,
 * a każde żądanie inne niż GET/HEAD/OPTIONS jest przerywane (nic nie wysyłamy).
 * UA to zwykły Chrome — App.tsx traktuje „Headless" w UA jak prerender.
 *
 * Użycie:
 *   node scripts/audit-render.mjs [baseUrl] [opcje]
 *     baseUrl              domyślnie https://mixturemarketing.pl
 *     --only=/a/,/b/       tylko te ścieżki (zamiast sitemapy)
 *     --viewport=mobile    tylko jeden viewport (desktop | mobile)
 *     --spa                nawigacja kliencka (pushState) zamiast pełnego ładowania —
 *                          sprawdza leniwy tryb LazyHydrate/Suspense po 1. nawigacji
 *     --concurrency=3      równoległe strony
 *     --screenshots        zrzuty elementów z ustaleniami (do triage)
 *     --out=<dir>          katalog raportu (domyślnie <tmp>/render-audit)
 *   Kod wyjścia 1, gdy są ustalenia.
 *
 *   Lokalnie: `npx vite` (port z .env.local / 3000) i `node scripts/audit-render.mjs
 *   http://localhost:3000` — na serwerze dev LazyHydrate działa w trybie leniwym (brak
 *   prerenderu), a @axe-core/react dokłada swoje console-error (pomijać przy triage).
 *   Za proxy HTTPS (sandbox CI/agent): NODE_USE_ENV_PROXY=1 dla pobrania sitemapy.
 *   Ustalenia to kandydaci — każde potwierdzić zrzutem (--screenshots) przed poprawką.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer';

// ---------------------------------------------------------------- argumenty
const args = process.argv.slice(2);
const flag = (name) => {
  const hit = args.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return undefined;
  return hit.includes('=') ? hit.slice(hit.indexOf('=') + 1) : true;
};
const BASE = (args.find((a) => !a.startsWith('--')) || 'https://mixturemarketing.pl').replace(
  /\/$/,
  '',
);
const ONLY = flag('only') ? String(flag('only')).split(',') : null;
const SPA = Boolean(flag('spa'));
const CONCURRENCY = Number(flag('concurrency') || 3);
const SCREENSHOTS = Boolean(flag('screenshots'));
const OUT = path.resolve(String(flag('out') || path.join(os.tmpdir(), 'render-audit')));

const VIEWPORTS = {
  desktop: {
    viewport: { width: 1366, height: 900, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  },
  mobile: {
    viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
  },
};
const viewportNames = flag('viewport') ? [String(flag('viewport'))] : Object.keys(VIEWPORTS);

// Beacony analityki: blokowane i pomijane w raporcie (nie zaśmiecamy GA4 właściciela).
const BLOCKED =
  /cdn-cgi\/zaraz\/t|\/rifd\/|google-analytics\.com|googletagmanager\.com|analytics\.google\.com|cdn-cgi\/rum|doubleclick\.net|connect\.facebook\.net|facebook\.com\/tr/;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- lista stron
async function loadPaths() {
  if (ONLY) return ONLY;
  const res = await fetch(`${BASE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml: HTTP ${res.status}`);
  const xml = await res.text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1].trim()).pathname);
  return [...new Set([...paths, '/portal/'])];
}

// ---------------------------------------------------------------- kod w stronie
// Funkcje poniżej są serializowane do przeglądarki — muszą być samowystarczalne.

/** Treść pod stałym Navbarem przy scrollY = 0. */
function auditNavbarOverlap() {
  const out = [];
  const vw = window.innerWidth;
  const fixed = [...document.querySelectorAll('body *')].filter((el) => {
    const cs = getComputedStyle(el);
    if (cs.position !== 'fixed' && cs.position !== 'sticky') return false;
    const r = el.getBoundingClientRect();
    return r.top <= 1 && r.width >= vw * 0.8 && r.height >= 30 && r.height <= 200;
  });
  if (!fixed.length) return out;
  const nav = fixed.reduce((a, b) =>
    a.getBoundingClientRect().height >= b.getBoundingClientRect().height ? a : b,
  );
  const navRect = nav.getBoundingClientRect();
  const inFixedLayer = (el) => {
    for (let a = el; a && a !== document.body; a = a.parentElement) {
      if (getComputedStyle(a).position === 'fixed') return true; // menu off-canvas, modal, toast
    }
    return false;
  };
  // jeden wpis na blok (np. cały pasek okruszków), nie na każdy węzeł tekstu
  const blockOf = (el) => {
    let b = el;
    while (
      b.parentElement &&
      b.parentElement.tagName !== 'MAIN' &&
      b.parentElement !== document.body
    )
      b = b.parentElement;
    return b;
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement;
    if (!el || n.textContent.trim().length < 2 || nav.contains(el)) continue;
    if (el.closest('.sr-only, [aria-hidden="true"], dialog:not([open]), script, style')) continue;
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    if (inFixedLayer(el) || seen.has(blockOf(el))) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    const r = range.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (r.top >= navRect.bottom - 1 || r.bottom <= navRect.top + 1) continue;
    const hit = document.elementFromPoint(
      Math.min(vw - 1, Math.max(0, r.left + r.width / 2)),
      Math.max(0, r.top + r.height / 2),
    );
    if (!hit || !nav.contains(hit)) continue; // tekst nie jest zasłonięty
    const block = blockOf(el);
    seen.add(block);
    out.push({
      el: block,
      text: block.textContent.trim().replace(/\s+/g, ' ').slice(0, 60),
      overlap: Math.round(navRect.bottom - r.top),
    });
  }
  return out.map((o) => ({
    category: 'navbar-overlap',
    el: o.el,
    detail: `„${o.text}" zasłonięte przez stały Navbar (${o.overlap}px)`,
  }));
}

/** Główny audyt — po przewinięciu strony do końca (bez powrotu na górę). */
function auditPage() {
  const out = [];
  const vw = window.innerWidth;
  const add = (category, el, detail, extra) => out.push({ category, el, detail, ...extra });
  const isVisible = (el) =>
    el.checkVisibility ? el.checkVisibility({ visibilityProperty: true }) : true;
  const box = (el) => el.getBoundingClientRect();
  const size = (r) => `${Math.round(r.width)}×${Math.round(r.height)}`;
  const ownText = (el) =>
    [...el.childNodes]
      .filter((c) => c.nodeType === 3)
      .map((c) => c.textContent)
      .join('')
      .trim();
  const isSrOnly = (el) =>
    Boolean(el.closest('.sr-only, [class*="visually-hidden"]')) ||
    (box(el).width <= 1 && box(el).height <= 1);

  // --- obrazy
  const resources = new Map(
    performance.getEntriesByType('resource').map((e) => [e.name, e.encodedBodySize || 0]),
  );
  for (const img of document.images) {
    if (!isVisible(img) || isSrOnly(img)) continue;
    const src = img.currentSrc || img.src;
    if (!src) continue;
    const r = box(img);
    if (img.complete && img.naturalWidth === 0) {
      add('image-broken', img, `nie wczytany: ${src}`);
      continue;
    }
    if (!img.complete) {
      add('image-not-loaded', img, `nadal ładuje się po przewinięciu: ${src}`);
      continue;
    }
    if (r.width < 24 || r.height < 24) continue;
    if (/\.svg(\?|#|$)/i.test(src) || src.startsWith('data:image/svg')) continue;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const fit = getComputedStyle(img).objectFit;
    const sx = r.width / nw;
    const sy = r.height / nh;
    // CSS px na piksel źródła wzdłuż osi, która decyduje o ostrości
    const scale = fit === 'contain' || fit === 'scale-down' ? Math.min(sx, sy) : Math.max(sx, sy);
    if (scale > 1.5 && r.width >= 120) {
      add(
        'image-upscaled',
        img,
        `${nw}×${nh} wyświetlany jako ${size(r)} CSS px (×${scale.toFixed(1)} — rozmyty)`,
      );
    }
    const dpr = 2; // zakładamy ekran retina — mniej to już marnotrawstwo także na nim
    const linearWaste = 1 / (scale * dpr);
    const bytes = resources.get(src) || 0;
    if (linearWaste > 3 && nw * nh > 500 * 500 && (bytes === 0 || bytes > 40 * 1024)) {
      add(
        'image-oversized',
        img,
        `${nw}×${nh}${bytes ? ` (${Math.round(bytes / 1024)} kB)` : ''} dla ${size(r)} CSS px @dpr${window.devicePixelRatio} — ${(linearWaste * linearWaste).toFixed(0)}× za dużo pikseli`,
      );
    }
  }

  // --- zwinięte komponenty wizualne
  const visualSel =
    '.recharts-responsive-container, .recharts-wrapper, svg.recharts-surface, canvas, iframe, video';
  for (const el of document.querySelectorAll(visualSel)) {
    if (!isVisible(el)) continue;
    const r = box(el);
    if (r.width < 2 || r.height < 2) {
      const kind = el.className?.baseVal ?? el.className;
      add(
        'collapsed-visual',
        el,
        `${el.tagName.toLowerCase()}${kind ? `.${String(kind).split(' ')[0]}` : ''} ma ${size(r)} px`,
      );
    }
  }
  // svg z rysunkiem (≥ 5 kształtów poza <defs>), który ma zerowy wymiar
  for (const svg of document.querySelectorAll('svg')) {
    if (svg.closest('.recharts-wrapper') || !isVisible(svg)) continue;
    const r = box(svg);
    if (r.width >= 2 && r.height >= 2) continue;
    const shapes = [
      ...svg.querySelectorAll('path, rect, circle, line, polyline, polygon, text, ellipse'),
    ].filter((s) => !s.closest('defs, symbol, clipPath, mask, pattern, linearGradient'));
    if (shapes.length >= 5)
      add('collapsed-visual', svg, `svg z ${shapes.length} kształtami ma ${size(r)} px`);
  }
  // kontenery „chart" z zawartością, ale bez wysokości
  for (const el of document.querySelectorAll('[class*="chart" i], [data-chart]')) {
    // tylko kontenery HTML — grupy <g class="recharts-…"> (np. linie ticków) bywają płaskie z natury
    if (el instanceof SVGElement || !isVisible(el) || !el.children.length) continue;
    const r = box(el);
    if (r.width >= 2 && r.height < 2)
      add('collapsed-visual', el, `kontener wykresu ma ${size(r)} px`);
  }

  // --- placeholdery, które się nie wypełniły
  for (const el of document.querySelectorAll('.lazy-placeholder')) {
    if (isVisible(el))
      add('placeholder-unfilled', el, `LazyHydrate nadal placeholderem (${size(box(el))})`);
  }
  for (const el of document.querySelectorAll('main *, #root > * *')) {
    if (el.children.length || ownText(el) || !isVisible(el)) continue;
    if (
      /^(IMG|SVG|CANVAS|IFRAME|VIDEO|INPUT|TEXTAREA|SELECT|BUTTON|PICTURE|SOURCE|BR|HR|path)$/i.test(
        el.tagName,
      )
    )
      continue;
    const cs = getComputedStyle(el);
    const minH = parseFloat(cs.minHeight) || 0;
    if (minH < 80) continue;
    if (cs.backgroundImage !== 'none' || cs.backgroundColor !== 'rgba(0, 0, 0, 0)') continue;
    if (el.getAttribute('aria-hidden') === 'true') continue;
    add('placeholder-unfilled', el, `pusty element z min-height ${Math.round(minH)}px`);
  }

  // --- skeletony / spinnery po załadowaniu
  for (const el of document.querySelectorAll(
    '.animate-pulse, [class*="skeleton" i], [aria-busy="true"], .animate-spin',
  )) {
    if (!isVisible(el) || el instanceof SVGElement) continue;
    const r = box(el);
    const spin = el.classList.contains('animate-spin');
    if (spin ? r.width < 24 || el.closest('button') : r.width < 40 || r.height < 10) continue;
    const explicit = el.matches('[class*="skeleton" i], [aria-busy="true"]');
    if (!spin && !explicit) {
      // animate-pulse bywa dekoracją (ikony, kolorowe poświaty) — skeleton to pusty, jasnoszary blok
      if (el.textContent.trim() || el.querySelector('svg, img')) continue;
      // Tailwind v4 podaje kolory w oklch() — normalizacja do RGBA przez piksel na canvasie
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.fillStyle = getComputedStyle(el).backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
      const [cr, cg, cb, ca] = ctx.getImageData(0, 0, 1, 1).data;
      const neutral = Math.max(cr, cg, cb) - Math.min(cr, cg, cb) <= 12;
      if (!neutral || ca < 128 || cr < 190 || cr > 248) continue;
    }
    add(
      'skeleton-visible',
      el,
      `${spin ? 'spinner' : 'skeleton'} ${size(r)} widoczny po załadowaniu`,
    );
  }

  // --- nagłówki bez treści
  const isHeading = (el) => /^H[1-6]$/.test(el.tagName);
  const hasContent = (container, heading) => {
    for (const el of container.querySelectorAll('*')) {
      if (heading.contains(el) || el.contains(heading) || el.closest('h1,h2,h3,h4,h5,h6')) continue;
      if (!isVisible(el)) continue;
      const r = box(el);
      if (r.width * r.height < 4) continue;
      if (ownText(el).length >= 2) return true;
      if (/^(IMG|svg|CANVAS|IFRAME|VIDEO|INPUT|TEXTAREA|SELECT|BUTTON|PICTURE)$/i.test(el.tagName))
        return true;
    }
    return false;
  };
  for (const h of document.querySelectorAll('main h2, main h3, main h4')) {
    if (!isVisible(h) || isSrOnly(h) || box(h).height < 1) continue;
    let c = h.parentElement;
    let ok = false;
    for (let level = 0; c && level < 3 && c !== document.body; level++, c = c.parentElement) {
      if (hasContent(c, h)) {
        ok = true;
        break;
      }
      if (c.matches('section, article')) break;
    }
    if (!ok && !isHeading(h.nextElementSibling || h)) {
      add(
        'empty-section',
        h,
        `nagłówek „${h.textContent.trim().slice(0, 60)}" bez widocznej treści`,
      );
    }
  }

  // --- poziome przewijanie
  const docW = document.documentElement.scrollWidth;
  const clipsX = (el) => {
    const o = getComputedStyle(el).overflowX;
    return o !== 'visible';
  };
  const culprits = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = box(el);
    if (r.width < 1 || r.height < 1) continue;
    if (r.right <= vw + 1 && r.left >= -1) continue;
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed') continue;
    let clipped = false;
    let byRoot = false;
    for (let a = el.parentElement; a; a = a.parentElement) {
      if (getComputedStyle(a).position === 'fixed') {
        clipped = true;
        break;
      }
      if (clipsX(a)) {
        if (a === document.body || a === document.documentElement) byRoot = true;
        else clipped = true;
        break;
      }
    }
    if (clipped || !isVisible(el)) continue;
    culprits.push({ el, r, byRoot });
  }
  const top = culprits.filter((c) => !culprits.some((p) => p.el !== c.el && p.el.contains(c.el)));
  if (docW > vw + 1) {
    add('h-overflow', null, `document.scrollWidth ${docW} > viewport ${vw}`);
  }
  for (const c of top.slice(0, 10)) {
    const hasText = c.el.textContent.trim().length > 0;
    if (docW <= vw + 1 && !(c.byRoot && hasText)) continue;
    add(
      docW > vw + 1 ? 'h-overflow-culprit' : 'offscreen-clipped-by-root',
      c.el,
      `wychodzi poza ekran: left ${Math.round(c.r.left)}, right ${Math.round(c.r.right)} (vw ${vw})`,
    );
  }

  // --- tekst ucięty przez kontener
  const clipReport = new Map();
  const overflowSeen = new Set();
  // marquee / karuzela: tor z nieskończoną animacją, szerszy niż rodzic — wychodzi z założenia
  const trackCache = new Map();
  const isTrack = (a) => {
    if (!trackCache.has(a)) {
      const infinite = a
        .getAnimations()
        .some((an) => an.playState === 'running' && an.effect?.getTiming().iterations === Infinity);
      const wider =
        a.scrollWidth > a.clientWidth + 2 || box(a).width > box(a.parentElement || a).width + 2;
      trackCache.set(a, infinite && wider);
    }
    return trackCache.get(a);
  };
  const inMarquee = (el) => {
    for (let a = el; a && a !== document.body; a = a.parentElement) if (isTrack(a)) return true;
    return false;
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement;
    if (!el || n.textContent.trim().length < 2) continue;
    if (el.closest('script, style, noscript, .sr-only, [aria-hidden="true"], dialog:not([open])'))
      continue;
    if (!isVisible(el) || !el.checkVisibility({ opacityProperty: true })) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    const tr = range.getBoundingClientRect();
    if (tr.width < 1 || tr.height < 1 || inMarquee(el)) continue;
    // surowy HTML / encje widoczne jako tekst (treść wstawiona jako tekst zamiast HTML)
    const raw = n.textContent.match(
      /<\/?(strong|em|b|i|a|br|span|p|div|ul|li)(\s[^>]*)?\/?>|&(amp|nbsp|quot|lt|gt|#\d+);/,
    );
    if (raw && !el.closest('pre, code, textarea, kbd, samp, [class*="font-mono"]')) {
      add('raw-markup', el, `widoczny surowy znacznik „${raw[0].slice(0, 60)}"`);
    }
    // tekst wylewa się poza najbliższe widoczne „pudełko" (ramka lub tło) — bez przycinania
    for (
      let a = el, depth = 0;
      a && a !== document.body && depth < 4;
      a = a.parentElement, depth++
    ) {
      const cs = getComputedStyle(a);
      if (a !== el && cs.position === 'absolute') break; // etykiety celowo poza rodzicem
      if (a.tagName === 'PRE' || /auto|scroll/.test(cs.overflowX)) break; // da się przewinąć
      const framed =
        parseFloat(cs.borderLeftWidth) > 0 ||
        !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor);
      if (!framed || cs.display === 'inline') continue;
      const ar = box(a);
      if (
        ar.width > 2 &&
        (tr.right > ar.right + 3 || tr.left < ar.left - 3) &&
        !overflowSeen.has(a)
      ) {
        overflowSeen.add(a);
        add(
          'text-overflows-box',
          el,
          `tekst „${n.textContent.trim().slice(0, 50)}" wychodzi o ${Math.round(Math.max(tr.right - ar.right, ar.left - tr.left))}px poza ramkę/tło kontenera (${size(ar)})`,
        );
      }
      break;
    }
    for (let a = el; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      const hx = cs.overflowX === 'hidden' || cs.overflowX === 'clip';
      const hy = cs.overflowY === 'hidden' || cs.overflowY === 'clip';
      if (cs.textOverflow === 'ellipsis' || (cs.webkitLineClamp && cs.webkitLineClamp !== 'none'))
        break; // celowe skrócenie
      // kontener przewijalny (tabela w overflow-x-auto) — treść jest osiągalna, nie ucięta
      if (/auto|scroll/.test(cs.overflowX + cs.overflowY)) break;
      if (!hx && !hy) continue;
      const ar = box(a);
      if (ar.width <= 2 || ar.height <= 2) break; // sr-only / zwinięty akordeon
      if (cs.pointerEvents === 'none' && cs.position === 'absolute') break; // warstwa dekoracyjna
      const outX = hx && (tr.left < ar.left - 2 || tr.right > ar.right + 2);
      const outY = hy && (tr.top < ar.top - 2 || tr.bottom > ar.bottom + 2);
      const fullyOut =
        tr.right <= ar.left || tr.left >= ar.right || tr.bottom <= ar.top || tr.top >= ar.bottom;
      if ((outX || outY) && !fullyOut) {
        const prev = clipReport.get(a);
        if (prev) prev.count++;
        else
          clipReport.set(a, {
            count: 1,
            textEl: el,
            text: n.textContent.trim().slice(0, 60),
            axis: outX ? 'x' : 'y',
            by: Math.round(
              outX
                ? Math.max(ar.left - tr.left, tr.right - ar.right)
                : Math.max(ar.top - tr.top, tr.bottom - ar.bottom),
            ),
          });
      }
      break;
    }
  }
  for (const [a, info] of clipReport) {
    const cls = (a.getAttribute('class') || '').split(/\s+/).slice(0, 4).join('.');
    add(
      'text-clipped',
      info.textEl,
      `tekst „${info.text}" ucięty w osi ${info.axis} o ${info.by}px przez <${a.tagName.toLowerCase()}.${cls}> (${size(box(a))}, ${info.count} węzł${info.count > 1 ? 'y' : 'eł'})`,
    );
  }

  // --- treść niewidoczna (opacity ≈ 0) — kandydaci do ponownego sprawdzenia w widoku
  const ghosts = [];
  for (const el of document.querySelectorAll('main *')) {
    if (ownText(el).length < 3 || !isVisible(el) || isSrOnly(el)) continue;
    if (el.closest('[aria-hidden="true"]')) continue;
    let op = 1;
    let root = null;
    for (let a = el; a && a !== document.body; a = a.parentElement) {
      const o = parseFloat(getComputedStyle(a).opacity);
      if (o < 0.05) root = a;
      op *= o;
    }
    if (op >= 0.05 || !root || ghosts.includes(root)) continue;
    // celowo ukryte do interakcji: nakładki hover/focus, zwinięte panele (wysokość 0)
    const interactive = (e) =>
      /(^|\s)([\w/-]*(hover|focus|open|checked|active)[\w/-]*):[^\s]*opacity/.test(
        e.getAttribute('class') || '',
      );
    if (interactive(root) || box(root).height < 2) continue;
    if (getComputedStyle(root).maxHeight === '0px') continue;
    ghosts.push(root);
  }
  ghosts.slice(0, 15).forEach((g) => g.setAttribute('data-render-ghost', ''));

  return out;
}

/** Druga próba dla elementów z opacity 0: przewiń do nich i sprawdź jeszcze raz. */
async function recheckGhosts() {
  const out = [];
  const opacityOf = (g) => {
    let op = 1;
    for (let a = g; a && a !== document.body; a = a.parentElement) {
      op *= parseFloat(getComputedStyle(a).opacity);
    }
    return op;
  };
  for (const g of document.querySelectorAll('[data-render-ghost]')) {
    // window.scrollTo zamiast scrollIntoView — ten przewija też kontenery overflow:hidden w poziomie
    window.scrollTo({
      top: g.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2,
      behavior: 'instant',
    });
    await new Promise((r) => setTimeout(r, 1200));
    let op = opacityOf(g);
    // przypięty (sticky) hero wygaszany przewijaniem — „w widoku" dopiero na początku jego kontenera
    let sticky = g;
    while (sticky && getComputedStyle(sticky).position !== 'sticky') sticky = sticky.parentElement;
    if (op < 0.05 && sticky?.parentElement) {
      const top = sticky.parentElement.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, top - 80), behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 1200));
      op = opacityOf(g);
    }
    if (op < 0.05) {
      out.push({
        category: 'stuck-invisible',
        el: g,
        detail: `opacity ${op.toFixed(2)} po przewinięciu do widoku: „${g.textContent.trim().slice(0, 60)}"`,
      });
    }
  }
  return out;
}

/** Zamienia elementy na opis + znacznik do zrzutu (w przeglądarce). */
function serialize(findings) {
  const describe = (el) => {
    const parts = [];
    for (let e = el, i = 0; e && e !== document.body && i < 4; e = e.parentElement, i++) {
      const cls = (e.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 3);
      parts.unshift(
        `${e.tagName.toLowerCase()}${e.id ? `#${e.id}` : ''}${cls.length ? `.${cls.join('.')}` : ''}`,
      );
    }
    return parts.join(' > ');
  };
  window.__renderAuditId = window.__renderAuditId || 0;
  return findings.map(({ el, ...f }) => {
    if (!el) return f;
    const id = String(++window.__renderAuditId);
    el.setAttribute('data-render-audit', id);
    const r = el.getBoundingClientRect();
    return {
      ...f,
      selector: describe(el),
      auditId: id,
      docY: Math.round(r.top + window.scrollY),
    };
  });
}

async function scrollToBottom() {
  const step = Math.round(window.innerHeight * 0.75);
  for (let i = 0; i < 150; i++) {
    window.scrollTo({ top: window.scrollY + step, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 300));
    const el = document.documentElement;
    if (window.innerHeight + window.scrollY >= el.scrollHeight - 2) {
      await new Promise((r) => setTimeout(r, 800)); // dociągnięte sekcje mogą wydłużyć stronę
      if (window.innerHeight + window.scrollY >= el.scrollHeight - 2) break;
    }
  }
}

// ---------------------------------------------------------------- przebieg strony
function attachCollectors(page, sink) {
  page.on('pageerror', (err) =>
    sink.push({ category: 'page-error', detail: String(err.message || err).slice(0, 300) }),
  );
  page.on('console', (msg) => {
    const loc = msg.location()?.url || '';
    if (BLOCKED.test(loc)) return;
    const text = msg.text();
    if (msg.type() === 'error') {
      if (/net::ERR_FAILED|ERR_BLOCKED_BY_CLIENT/.test(text) && sink.blocked.some((u) => u === loc))
        return;
      const category = /\[Report Only\]|Content Security Policy/.test(text)
        ? 'csp-report-only'
        : 'console-error';
      sink.push({ category, detail: `${text.slice(0, 300)}${loc ? ` @ ${loc}` : ''}` });
    } else if (
      msg.type() === 'warn' &&
      /width\(|height\(|recharts|ResponsiveContainer/i.test(text)
    ) {
      sink.push({ category: 'console-warning', detail: text.slice(0, 300) });
    }
  });
  page.on('response', (res) => {
    const url = res.url();
    if (res.status() >= 400 && !BLOCKED.test(url)) {
      sink.push({
        category: 'request-failed',
        detail: `HTTP ${res.status()} ${res.request().method()} ${url}`,
      });
    }
  });
  page.on('requestfailed', (req) => {
    const url = req.url();
    if (BLOCKED.test(url) || sink.blocked.includes(url)) return;
    const err = req.failure()?.errorText || 'failed';
    sink.push({ category: 'request-failed', detail: `${err} ${req.method()} ${url}` });
  });
}

async function preparePage(context, vpName) {
  const page = await context.newPage();
  const vp = VIEWPORTS[vpName];
  await page.setUserAgent(vp.userAgent);
  await page.setViewport(vp.viewport);
  await page.setRequestInterception(true);
  const sink = [];
  sink.blocked = [];
  page.on('request', (req) => {
    const url = req.url();
    const mutating = !['GET', 'HEAD', 'OPTIONS'].includes(req.method());
    if (BLOCKED.test(url) || mutating) {
      sink.blocked.push(url);
      if (mutating && !BLOCKED.test(url)) {
        sink.push({ category: 'info-blocked-mutation', detail: `${req.method()} ${url}` });
      }
      req.abort('blockedbyclient').catch(() => {});
      return;
    }
    req.continue().catch(() => {});
  });
  attachCollectors(page, sink);
  return { page, sink };
}

async function auditCurrent(page, sink, routePath, vpName) {
  const slug = `${vpName}${routePath.replace(/\//g, '_') || '_'}`;
  const dir = path.join(OUT, 'shots');
  if (SCREENSHOTS) fs.mkdirSync(dir, { recursive: true });
  await page.waitForNetworkIdle({ idleTime: 800, timeout: 15000 }).catch(() => {});
  await sleep(800);
  const atRest = await page.evaluate(`(${serialize})((${auditNavbarOverlap})())`);
  if (SCREENSHOTS && atRest.length) {
    const file = path.join(dir, `${slug}-top.png`);
    await page.screenshot({ path: file });
    atRest.forEach((f) => (f.screenshot = file));
  }
  await page.evaluate(`(${scrollToBottom})()`);
  await page.waitForNetworkIdle({ idleTime: 800, timeout: 10000 }).catch(() => {});
  await sleep(1500);
  const main = await page.evaluate(`(${serialize})((${auditPage})())`);
  const ghosts = await page.evaluate(`(async () => (${serialize})(await (${recheckGhosts})()))()`);
  const findings = [...sink.splice(0), ...atRest, ...main, ...ghosts].map((f) => ({
    path: routePath,
    viewport: vpName,
    ...f,
  }));
  if (SCREENSHOTS) {
    // baner cookies zasłania dół ekranu na zrzutach (nie klikamy zgody — to uruchomiłoby analitykę)
    await page.addStyleTag({
      content: '[aria-label="Zarządzanie plikami cookies"]{display:none!important}',
    });
    let n = 0;
    for (const f of findings) {
      if (!f.auditId || f.screenshot || n >= 8) continue;
      const file = path.join(dir, `${slug}-${f.auditId}-${f.category}.png`);
      try {
        // zrzut ekranu z kontekstem: element na środku, obrysowany na czerwono
        const ok = await page.evaluate((id) => {
          const el = document.querySelector(`[data-render-audit="${id}"]`);
          if (!el) return false;
          const r = el.getBoundingClientRect();
          window.scrollTo({
            top:
              r.top +
              window.scrollY -
              (window.innerHeight - Math.min(r.height, window.innerHeight)) / 2,
            behavior: 'instant',
          });
          el.style.outline = '3px solid red';
          el.style.outlineOffset = '-1px';
          return true;
        }, f.auditId);
        if (!ok) continue;
        await sleep(400);
        await page.screenshot({ path: file });
        await page.evaluate((id) => {
          const el = document.querySelector(`[data-render-audit="${id}"]`);
          if (el) el.style.outline = '';
        }, f.auditId);
        f.screenshot = file;
        n++;
      } catch {
        /* element zniknął — pomijamy zrzut */
      }
    }
    if (findings.some((f) => f.category === 'h-overflow')) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: path.join(dir, `${slug}-viewport.png`) });
    }
  }
  return findings;
}

async function auditFullLoad(browser, routePath, vpName) {
  const context = await browser.createBrowserContext();
  const { page, sink } = await preparePage(context, vpName);
  try {
    await page.goto(BASE + routePath, { waitUntil: 'load', timeout: 45000 });
    return await auditCurrent(page, sink, routePath, vpName);
  } catch (err) {
    return [{ path: routePath, viewport: vpName, category: 'audit-error', detail: err.message }];
  } finally {
    await context.close().catch(() => {});
  }
}

async function auditSpa(browser, paths, vpName) {
  const context = await browser.createBrowserContext();
  const { page, sink } = await preparePage(context, vpName);
  const all = [];
  await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 45000 });
  await page.waitForNetworkIdle({ idleTime: 800, timeout: 15000 }).catch(() => {});
  sink.splice(0);
  for (const p of paths) {
    try {
      await page.evaluate((to) => {
        window.history.pushState({}, '', to);
        window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
      }, p);
      all.push(...(await auditCurrent(page, sink, p, `${vpName}-spa`)));
      process.stdout.write('.');
    } catch (err) {
      all.push({
        path: p,
        viewport: `${vpName}-spa`,
        category: 'audit-error',
        detail: err.message,
      });
    }
  }
  await context.close().catch(() => {});
  return all;
}

// ---------------------------------------------------------------- main
async function main() {
  const paths = await loadPaths();
  console.log(
    `Audyt renderowania: ${BASE} — ${paths.length} stron × ${viewportNames.join('+')}${SPA ? ' (SPA)' : ''}`,
  );
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      ...(proxy && !/localhost|127\.0\.0\.1/.test(BASE)
        ? [`--proxy-server=${proxy}`, '--proxy-bypass-list=<-loopback>']
        : []),
    ],
  });
  const findings = [];
  try {
    if (SPA) {
      const runs = viewportNames.map((vp) => auditSpa(browser, paths, vp));
      for (const r of await Promise.all(runs)) findings.push(...r);
    } else {
      const jobs = paths.flatMap((p) => viewportNames.map((vp) => [p, vp]));
      let next = 0;
      const worker = async () => {
        while (next < jobs.length) {
          const [p, vp] = jobs[next++];
          findings.push(...(await auditFullLoad(browser, p, vp)));
          process.stdout.write('.');
        }
      };
      await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    }
  } finally {
    await browser.close();
  }
  process.stdout.write('\n');

  fs.mkdirSync(OUT, { recursive: true });
  const reportPath = path.join(OUT, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(findings, null, 2));

  const byCat = new Map();
  for (const f of findings) {
    if (!byCat.has(f.category)) byCat.set(f.category, []);
    byCat.get(f.category).push(f);
  }
  for (const [cat, list] of [...byCat].sort()) {
    console.log(`\n## ${cat} (${list.length})`);
    for (const f of list.slice(0, 60)) {
      console.log(
        `  ${f.path} [${f.viewport}] ${f.detail}${f.selector ? `\n      ${f.selector}` : ''}`,
      );
    }
    if (list.length > 60) console.log(`  … i ${list.length - 60} więcej (raport JSON)`);
  }
  const real = findings.filter((f) => !f.category.startsWith('info-'));
  console.log(`\nUstaleń: ${real.length}. Raport: ${reportPath}`);
  process.exitCode = real.length ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
