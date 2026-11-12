#!/usr/bin/env node
/**
 * MIX-1470: scroll-jank probe for Chrome (home page, high-DPR desktop).
 *
 * Scrolls a page top -> bottom with a compositor-driven scroll gesture
 * (CDP Input.synthesizeScrollGesture, the same primitive Chrome's own smoothness
 * benchmarks use), records a Chrome trace and reports, per variant:
 *   frames / janky frames / dropped frames (in-page rAF), long tasks > 50 ms,
 *   total Paint, Layerize+Commit ("Composite Layers"), Layout, Recalculate Style,
 *   Raster ms and the top 5 painted nodes by area.
 * A variant injects a CSS override (and optionally blocks scroll-variable writes)
 * so one suspect can be switched off at a time (A/B).
 *
 * Usage (relative paths, any machine with the repo's node_modules):
 *   node scripts/probe-chrome-scroll.mjs --dist .bieg/m1470/dist --out .bieg/m1470/probe
 *   node scripts/probe-chrome-scroll.mjs --url https://mixturemarketing.pl/ --headed \
 *        --out .bieg/m1470/mac --runs 3 --variants baseline,no-nav-blur
 *   --chrome <path>      use an installed Chrome (e.g. /Applications/Google Chrome.app/...)
 *   --user-data-dir <d>  reuse a profile (e.g. after logging in by hand in --headed mode)
 *   --dpr 2 --width 1440 --height 900 --duration 3000 --runs 3
 *   --keep-cookie-banner   do not pre-seed a "deny" consent (banner stays visible)
 *   --budget-s <s>       stop starting new rounds after <s> seconds (lock time limits)
 *   --list               print the variant names and exit
 * Outputs: <out>/results.json, <out>/results.md, <out>/trace-<variant>-<n>.json (first run).
 * Headless numbers are relative (software raster); compare variants on one machine only.
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';

export const VARIANTS = {
  baseline: { css: '' },
  // Fixed navbar: backdrop-filter re-blurs the scrolling content under it every frame.
  'no-nav-blur': {
    css: 'nav[aria-label]{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}',
  },
  // Every backdrop-filter on the page (navbar, cookie banner, badges).
  'no-backdrop-all': {
    css: '*{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}',
  },
  // Services: three 600-800 px orbs, filter: blur(120px) + mix-blend-multiply, infinite blob animation.
  'no-ambient-orbs': { css: '.animate-blob{display:none!important}' },
  // Full-viewport fixed radial-gradient layer above everything (z-100).
  'no-cursor-glow': { css: '.cursor-glow{display:none!important}' },
  // Hero canvas (2D, DPR up to 1.75, rAF loop while visible).
  'no-hero-canvas': { css: 'section canvas{display:none!important}' },
  // Hero noise.svg overlay.
  'no-grain': { css: '[style*="noise.svg"]{display:none!important}' },
  // Every infinite CSS animation paused (marquee, ping, audit scan, blobs).
  'no-css-anim': { css: '*,*::before,*::after{animation-play-state:paused!important}' },
  // Scroll-linked custom properties (--page-p on :root, --p per section, --cover on hero).
  'no-scroll-vars': { css: '', blockVars: ['--page-p', '--p', '--cover'] },
  // Only the :root page pulse (inherited custom property -> whole-document style recalc).
  'no-page-pulse': { css: '', blockVars: ['--page-p'] },
};

function parseArgs(argv) {
  const a = {
    url: '',
    dist: '',
    out: '.bieg/probe-chrome-scroll',
    headed: false,
    chrome: '',
    userDataDir: '',
    dpr: 2,
    width: 1440,
    height: 900,
    duration: 3000,
    runs: 3,
    budgetS: 0,
    variants: 'baseline',
    keepCookieBanner: false,
    list: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const v = () => argv[++i];
    if (k === '--url') a.url = v();
    else if (k === '--dist') a.dist = v();
    else if (k === '--out') a.out = v();
    else if (k === '--headed') a.headed = true;
    else if (k === '--chrome') a.chrome = v();
    else if (k === '--user-data-dir') a.userDataDir = v();
    else if (k === '--dpr') a.dpr = Number(v());
    else if (k === '--width') a.width = Number(v());
    else if (k === '--height') a.height = Number(v());
    else if (k === '--duration') a.duration = Number(v());
    else if (k === '--runs') a.runs = Number(v());
    else if (k === '--budget-s') a.budgetS = Number(v());
    else if (k === '--variants') a.variants = v();
    else if (k === '--keep-cookie-banner') a.keepCookieBanner = true;
    else if (k === '--list') a.list = true;
    else throw new Error(`unknown option ${k}`);
  }
  return a;
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

/** Static server for a vite dist with SPA fallback (dir/index.html, then /index.html). */
async function serve(distArg) {
  const DIST = path.resolve(distArg);
  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, 'http://x');
    let file = path.join(DIST, decodeURIComponent(u.pathname));
    if (!file.startsWith(DIST)) return res.writeHead(403).end();
    try {
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
      await fs.access(file);
    } catch {
      file = path.join(DIST, 'index.html');
    }
    const body = await fs.readFile(file);
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { server, url: `http://127.0.0.1:${server.address().port}/` };
}

const median = (xs) => {
  const s = [...xs].sort((x, y) => x - y);
  return s.length ? s[Math.floor((s.length - 1) / 2)] : 0;
};

/** Sums trace event durations (ms) for the renderer main thread and raster workers. */
export function summarizeTrace(events) {
  const threads = new Map();
  for (const e of events) {
    if (e.ph === 'M' && e.name === 'thread_name') threads.set(`${e.pid}:${e.tid}`, e.args.name);
  }
  const mainKeys = new Set([...threads].filter(([, n]) => n === 'CrRendererMain').map(([k]) => k));
  const sum = {
    paint: 0,
    composite: 0,
    layout: 0,
    style: 0,
    raster: 0,
    script: 0,
    paintCount: 0,
    longTasks: 0,
  };
  const paints = new Map();
  const NAMES = {
    Paint: 'paint',
    Layerize: 'composite',
    CompositeLayers: 'composite',
    UpdateLayer: 'composite',
    Commit: 'composite',
    Layout: 'layout',
    UpdateLayoutTree: 'style',
    RecalculateStyles: 'style',
    RasterTask: 'raster',
    FunctionCall: 'script',
    FireAnimationFrame: 'script',
    EvaluateScript: 'script',
  };
  for (const e of events) {
    if (e.ph !== 'X' || typeof e.dur !== 'number') continue;
    const key = `${e.pid}:${e.tid}`;
    const ms = e.dur / 1000;
    const bucket = NAMES[e.name];
    if (bucket === 'raster') sum.raster += ms;
    else if (bucket && mainKeys.has(key)) sum[bucket] += ms;
    if (mainKeys.has(key) && e.name === 'RunTask' && ms > 50) sum.longTasks++;
    if (e.name === 'Paint' && mainKeys.has(key)) {
      sum.paintCount++;
      const d = e.args?.data || {};
      const c = d.clip || [];
      const xs = [c[0], c[2], c[4], c[6]].filter(Number.isFinite);
      const ys = [c[1], c[3], c[5], c[7]].filter(Number.isFinite);
      const w = xs.length ? Math.max(...xs) - Math.min(...xs) : 0;
      const h = ys.length ? Math.max(...ys) - Math.min(...ys) : 0;
      const id = d.nodeId ?? 'n/a';
      const p = paints.get(id) || { nodeId: id, count: 0, ms: 0, maxArea: 0, w: 0, h: 0 };
      p.count++;
      p.ms += ms;
      if (w * h > p.maxArea) Object.assign(p, { maxArea: w * h, w, h });
      paints.set(id, p);
    }
  }
  for (const k of Object.keys(sum)) sum[k] = Math.round(sum[k] * 10) / 10;
  const topPaints = [...paints.values()]
    .sort((x, y) => y.count - x.count || y.ms - x.ms)
    .slice(0, 5);
  return { sum, topPaints };
}

const CATEGORIES = [
  'devtools.timeline',
  'disabled-by-default-devtools.timeline',
  'disabled-by-default-devtools.timeline.frame',
  'toplevel',
  'blink.user_timing',
];

async function oneRun(browser, target, variant, opts, runIdx) {
  const page = await browser.newPage();
  await page.setViewport({ width: opts.width, height: opts.height, deviceScaleFactor: opts.dpr });
  const def = VARIANTS[variant];
  await page.evaluateOnNewDocument(
    (blockVars, seedConsent) => {
      if (seedConsent) {
        try {
          localStorage.setItem(
            'cookie-consent-v2',
            JSON.stringify({ analytics: false, marketing: false }),
          );
        } catch {
          /* storage unavailable: banner stays */
        }
      }
      if (blockVars.length) {
        const orig = CSSStyleDeclaration.prototype.setProperty;
        CSSStyleDeclaration.prototype.setProperty = function (name, ...rest) {
          if (blockVars.includes(name)) return undefined;
          return orig.call(this, name, ...rest);
        };
      }
      window.__lt = [];
      try {
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) window.__lt.push(e.duration);
        }).observe({ type: 'longtask', buffered: true });
      } catch {
        /* longtask unsupported */
      }
    },
    def.blockVars || [],
    !opts.keepCookieBanner,
  );
  await page.goto(target, { waitUntil: 'networkidle2', timeout: 60000 });
  if (def.css) await page.addStyleTag({ content: def.css });
  await page.mouse.move(opts.width / 2, opts.height / 2);
  await new Promise((r) => setTimeout(r, 1500));
  const distance = await page.evaluate(() => {
    window.scrollTo(0, 0);
    return document.documentElement.scrollHeight - window.innerHeight;
  });
  await new Promise((r) => setTimeout(r, 300));
  await page.evaluate(() => {
    window.__lt = [];
    window.__frames = [];
    window.__rec = true;
    const tick = (t) => {
      window.__frames.push(t);
      if (window.__rec) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.tracing.start({ categories: CATEGORIES });
  const cdp = await page.createCDPSession();
  const speed = Math.max(800, Math.round(distance / (opts.duration / 1000)));
  await cdp.send('Input.synthesizeScrollGesture', {
    x: Math.round(opts.width / 2),
    y: Math.round(opts.height / 2),
    yDistance: -distance,
    speed,
    gestureSourceType: 'mouse',
    preventFling: true,
  });
  const traceBuf = await page.tracing.stop();
  const inPage = await page.evaluate(() => {
    window.__rec = false;
    const f = window.__frames;
    const iv = f.slice(1).map((t, i) => t - f[i]);
    const janky = iv.filter((d) => d > 25).length;
    const dropped = iv.reduce((s, d) => s + Math.max(0, Math.round(d / 16.667) - 1), 0);
    return {
      frames: f.length,
      janky,
      dropped,
      p95: iv.length ? [...iv].sort((a, b) => a - b)[Math.floor(iv.length * 0.95)] : 0,
      longTasksPO: window.__lt.filter((d) => d > 50).length,
      scrollY: window.scrollY,
    };
  });
  const trace = JSON.parse(Buffer.from(traceBuf).toString('utf8'));
  const { sum, topPaints } = summarizeTrace(trace.traceEvents || []);
  await cdp.send('DOM.getDocument', { depth: 0 });
  for (const p of topPaints) {
    try {
      const { node } = await cdp.send('DOM.describeNode', { backendNodeId: p.nodeId });
      const attrs = node.attributes || [];
      const ci = attrs.indexOf('class');
      p.node = `${node.localName || node.nodeName}${ci >= 0 ? '.' + attrs[ci + 1].trim().split(/\s+/).slice(0, 4).join('.') : ''}`;
    } catch {
      p.node = '(node gone)';
    }
  }
  if (runIdx === 0) {
    await fs.writeFile(path.join(opts.out, `trace-${variant}.json`), traceBuf);
  }
  await page.close();
  return { variant, distance, speed, ...inPage, ...sum, topPaints };
}

export async function main(argv) {
  const opts = parseArgs(argv);
  if (opts.list) {
    console.log(Object.keys(VARIANTS).join('\n'));
    return 0;
  }
  const names = opts.variants === 'all' ? Object.keys(VARIANTS) : opts.variants.split(',');
  for (const n of names) if (!VARIANTS[n]) throw new Error(`unknown variant ${n}`);
  if (!opts.url && !opts.dist) throw new Error('give --url or --dist');
  opts.out = path.resolve(opts.out);
  await fs.mkdir(opts.out, { recursive: true });
  const srv = opts.dist ? await serve(opts.dist) : null;
  const target = opts.url || srv.url;
  const launch = {
    headless: !opts.headed,
    args: ['--no-sandbox', '--enable-precise-memory-info'],
    defaultViewport: null,
  };
  if (opts.chrome) launch.executablePath = opts.chrome;
  if (opts.userDataDir) launch.userDataDir = path.resolve(opts.userDataDir);
  const browser = await puppeteer.launch(launch);
  const results = [];
  try {
    // Interleave variants per round so drift on the machine hits all of them alike.
    const t0 = Date.now();
    for (let r = 0; r < opts.runs; r++) {
      if (r > 0 && opts.budgetS && (Date.now() - t0) / 1000 > opts.budgetS) {
        console.log(`budget ${opts.budgetS} s reached after ${r} round(s)`);
        break;
      }
      for (const v of names) {
        const res = await oneRun(browser, target, v, opts, r);
        results.push(res);
        console.log(
          `${v} run${r + 1} t=${Math.round((Date.now() - t0) / 1000)}s: frames=${res.frames} janky=${res.janky} paint=${res.paint} comp=${res.composite} style=${res.style} layout=${res.layout} raster=${res.raster}`,
        );
      }
    }
  } finally {
    await browser.close();
    srv?.server.close();
  }
  const keys = ['frames', 'janky', 'dropped', 'p95', 'longTasks', 'longTasksPO'];
  const msKeys = ['paint', 'composite', 'layout', 'style', 'raster', 'script', 'paintCount'];
  const med = {};
  for (const v of names) {
    const rs = results.filter((x) => x.variant === v);
    med[v] = {};
    for (const k of [...keys, ...msKeys]) med[v][k] = median(rs.map((x) => x[k]));
    med[v].paintComp = Math.round((med[v].paint + med[v].composite) * 10) / 10;
  }
  const base = med.baseline;
  const pct = (a, b) => (b ? `${Math.round(((a - b) / b) * 100)}%` : 'n/a');
  const lines = [
    `# probe-chrome-scroll ${new Date().toISOString()}`,
    `target ${opts.url || 'local dist'}; viewport ${opts.width}x${opts.height} DPR ${opts.dpr}; ${opts.headed ? 'headed' : 'headless'}; runs ${opts.runs} (median)`,
    '',
    '| variant | frames | janky>25ms | dropped | p95 ms | long tasks | Paint ms | Composite ms | Layout ms | Style ms | Raster ms | Paint+Comp vs base |',
    '|---|---|---|---|---|---|---|---|---|---|---|---|',
  ];
  for (const v of names) {
    const m = med[v];
    lines.push(
      `| ${v} | ${m.frames} | ${m.janky} | ${m.dropped} | ${Math.round(m.p95)} | ${m.longTasks} | ${m.paint} | ${m.composite} | ${m.layout} | ${m.style} | ${m.raster} | ${base ? pct(m.paintComp, base.paintComp) : 'n/a'} |`,
    );
  }
  const first = results.find((x) => x.variant === names[0]);
  lines.push('', `Top 5 paint areas (${names[0]}, run 1): node | count | ms | max w x h`);
  for (const p of first.topPaints) {
    lines.push(
      `- ${p.node} | ${p.count} | ${Math.round(p.ms)} | ${p.maxArea > 1e7 ? 'unbounded' : `${Math.round(p.w)}x${Math.round(p.h)}`}`,
    );
  }
  await fs.writeFile(
    path.join(opts.out, 'results.json'),
    JSON.stringify({ opts, med, results }, null, 1),
  );
  await fs.writeFile(path.join(opts.out, 'results.md'), lines.join('\n') + '\n');
  console.log(lines.join('\n'));
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).then(
    (rc) => process.exit(rc),
    (err) => {
      console.error(`probe-chrome-scroll: ${err.message}`);
      process.exit(1);
    },
  );
}
