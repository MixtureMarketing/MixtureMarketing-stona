// MIX-1579: streszczenie Lighthouse (mobile): LCP, części LCP, element LCP, TBT, CLS, blokujące zasoby, fonty.
//   node .bieg/m1579/summary.mjs <katalog-lh> [katalog-lh-porownania]
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const median = (xs) => {
  const s = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!s.length) return NaN;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const fmt = (x, d = 0) => (Number.isFinite(x) ? x.toFixed(d) : 'brak');

function walk(o, fn) {
  if (!o || typeof o !== 'object') return;
  fn(o);
  for (const v of Object.values(o)) walk(v, fn);
}

function one(j) {
  const a = j.audits || {};
  const r = {
    lcp: a['largest-contentful-paint']?.numericValue,
    fcp: a['first-contentful-paint']?.numericValue,
    tbt: a['total-blocking-time']?.numericValue,
    cls: a['cumulative-layout-shift']?.numericValue,
    si: a['speed-index']?.numericValue,
    score: (j.categories?.performance?.score ?? NaN) * 100,
    phases: {},
    node: '',
    blocking: [],
    fonts: [],
    discovery: [],
    longTasks: [],
  };
  for (const id of ['lcp-breakdown-insight', 'largest-contentful-paint-element', 'lcp-phases-insight']) {
    walk(a[id]?.details, (o) => {
      if (o.subpart && Number.isFinite(o.duration)) r.phases[o.subpart] = o.duration;
      if (o.phase && Number.isFinite(o.timing)) r.phases[o.phase] = o.timing;
      if (o.type === 'node' && !r.node)
        r.node = `${o.selector || ''} :: ${String(o.snippet || o.nodeLabel || '').slice(0, 160)}`;
    });
  }
  walk(a['render-blocking-insight']?.details || a['render-blocking-resources']?.details, (o) => {
    if (typeof o.url === 'string' && (o.wastedMs || o.totalBytes))
      r.blocking.push(`${o.url.replace(/^https?:\/\/[^/]+/, '')} ${fmt(o.wastedMs)}ms`);
  });
  walk(a['font-display-insight']?.details || a['font-display']?.details, (o) => {
    if (typeof o.url === 'string') r.fonts.push(o.url.replace(/^https?:\/\/[^/]+/, ''));
  });
  walk(a['lcp-discovery-insight']?.details, (o) => {
    if (o.label && typeof o.value === 'boolean') r.discovery.push(`${o.label}=${o.value}`);
  });
  r.longTasks = (a['long-tasks']?.details?.items || []).map(
    (t) => `${String(t.url || '?').replace(/^https?:\/\/[^/]+/, '')} ${fmt(t.duration)}`,
  );
  return r;
}

function load(dir) {
  const runs = {};
  for (const f of readdirSync(dir).sort()) {
    const m = /^(.+)-([md])-(\d+)\.json$/.exec(f);
    if (!m) continue;
    try {
      (runs[`${m[1]}|${m[2]}`] ||= []).push(one(JSON.parse(readFileSync(join(dir, f), 'utf8'))));
    } catch {
      /* uszkodzony plik pomijamy */
    }
  }
  return runs;
}

function med(list, k) {
  return median(list.map((r) => r[k]));
}

const [dirA, dirB] = process.argv.slice(2);
if (!dirA) {
  console.error('użycie: node .bieg/m1579/summary.mjs <katalog-lh> [katalog-lh-porownania]');
  process.exit(2);
}
const A = load(dirA);
const B = dirB ? load(dirB) : null;
const out = [];
if (B) {
  out.push('| strona | profil | n | LCP baza | LCP gałąź | TBT baza | TBT gałąź | CLS baza | CLS gałąź | FCP baza | FCP gałąź |');
  out.push('|---|---|---|---|---|---|---|---|---|---|---|');
  for (const k of Object.keys(A).sort()) {
    const [p, f] = k.split('|');
    const a = A[k];
    const b = B[k] || [];
    out.push(
      `| ${p} | ${f} | ${a.length}/${b.length} | ${fmt(med(a, 'lcp'))} | ${fmt(med(b, 'lcp'))} | ${fmt(med(a, 'tbt'))} | ${fmt(med(b, 'tbt'))} | ${fmt(med(a, 'cls'), 3)} | ${fmt(med(b, 'cls'), 3)} | ${fmt(med(a, 'fcp'))} | ${fmt(med(b, 'fcp'))} |`,
    );
  }
}
for (const [name, set] of B ? [['baza', A], ['gałąź', B]] : [['pomiar', A]]) {
  out.push('', `## ${name}`);
  out.push('| strona | profil | n | LCP | FCP | TBT | CLS | SI | wynik |', '|---|---|---|---|---|---|---|---|---|');
  for (const k of Object.keys(set).sort()) {
    const [p, f] = k.split('|');
    const l = set[k];
    out.push(
      `| ${p} | ${f} | ${l.length} | ${fmt(med(l, 'lcp'))} | ${fmt(med(l, 'fcp'))} | ${fmt(med(l, 'tbt'))} | ${fmt(med(l, 'cls'), 3)} | ${fmt(med(l, 'si'))} | ${fmt(med(l, 'score'))} |`,
    );
  }
  for (const k of Object.keys(set).sort()) {
    out.push(`### ${k}`);
    set[k].forEach((r, i) => {
      const ph = Object.entries(r.phases).map(([n, v]) => `${n}=${fmt(v)}`).join(' ');
      out.push(`- run${i + 1}: LCP ${fmt(r.lcp)} TBT ${fmt(r.tbt)} | ${ph}`);
      if (i === 0) {
        out.push(`  - node: ${r.node}`);
        out.push(`  - discovery: ${r.discovery.join(', ')}`);
        out.push(`  - blocking: ${r.blocking.slice(0, 6).join(', ')}`);
        out.push(`  - fonts: ${r.fonts.slice(0, 6).join(', ')}`);
      }
      out.push(`  - long: ${r.longTasks.slice(0, 6).join(', ')}`);
    });
  }
}
console.log(out.join('\n'));
