// MIX-1565: streszczenie pomiarów Lighthouse z scripts/measure-m1565.sh.
//   node scripts/measure-m1565-summary.mjs <katalog-lh> [katalog-lh-porownania]
// Pliki: <strona>-<m|d>-<n>.json. Wynik (markdown): mediana TBT/CLS/LCP/wyniku na stronę i profil,
// z drugim katalogiem: baza → gałąź i zmiana TBT w %, oraz 5 najdłuższych zadań (skrypt, ms)
// z przebiegów mobile (audyt `long-tasks`, suma po wszystkich przebiegach / liczba przebiegów).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const THRESHOLD = { m: 150, d: 100 };

const median = (xs) => {
  const s = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!s.length) return NaN;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

export function load(dir) {
  const runs = {};
  for (const f of readdirSync(dir)) {
    const m = /^(.+)-([md])-(\d+)\.json$/.exec(f);
    if (!m) continue;
    let j;
    try {
      j = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    } catch {
      continue;
    }
    const a = j.audits || {};
    const key = `${m[1]}|${m[2]}`;
    (runs[key] ||= []).push({
      tbt: a['total-blocking-time']?.numericValue,
      cls: a['cumulative-layout-shift']?.numericValue,
      lcp: a['largest-contentful-paint']?.numericValue,
      score: (j.categories?.performance?.score ?? NaN) * 100,
      longTasks: (a['long-tasks']?.details?.items || []).map((t) => ({
        url: String(t.url || '?'),
        duration: Number(t.duration) || 0,
      })),
    });
  }
  return runs;
}

const shortUrl = (u) =>
  u.replace(/^https?:\/\/[^/]+/, '').replace(/-[A-Za-z0-9_-]{8}\.js$/, '-*.js');

export function summarize(runs) {
  const rows = {};
  for (const [key, list] of Object.entries(runs)) {
    rows[key] = {
      n: list.length,
      tbt: median(list.map((r) => r.tbt)),
      cls: median(list.map((r) => r.cls)),
      lcp: median(list.map((r) => r.lcp)),
      score: median(list.map((r) => r.score)),
    };
  }
  return rows;
}

export function topLongTasks(runs, form = 'm', limit = 5) {
  const acc = {};
  let nRuns = 0;
  for (const [key, list] of Object.entries(runs)) {
    if (!key.endsWith(`|${form}`)) continue;
    for (const r of list) {
      nRuns += 1;
      for (const t of r.longTasks) {
        const u = shortUrl(t.url);
        acc[u] ||= { count: 0, total: 0, max: 0 };
        acc[u].count += 1;
        acc[u].total += t.duration;
        acc[u].max = Math.max(acc[u].max, t.duration);
      }
    }
  }
  return Object.entries(acc)
    .map(([url, v]) => ({ url, perRun: v.total / Math.max(nRuns, 1), max: v.max, count: v.count }))
    .sort((a, b) => b.perRun - a.perRun)
    .slice(0, limit);
}

const fmt = (x, d = 0) => (Number.isFinite(x) ? x.toFixed(d) : 'brak');

function main() {
  const [dirA, dirB] = process.argv.slice(2);
  if (!dirA) {
    console.error(
      'użycie: node scripts/measure-m1565-summary.mjs <katalog-lh> [katalog-lh-porownania]',
    );
    process.exit(2);
  }
  const A = summarize(load(dirA));
  const runsB = dirB ? load(dirB) : null;
  const B = runsB ? summarize(runsB) : null;
  const out = [];
  out.push(
    B
      ? '| strona | profil | n | TBT baza ms | TBT gałąź ms | zmiana | próg | CLS baza | CLS gałąź | LCP gałąź ms | wynik gałąź |'
      : '| strona | profil | n | TBT ms | próg | CLS | LCP ms | wynik |',
  );
  out.push(
    B ? '|---|---|---|---|---|---|---|---|---|---|---|' : '|---|---|---|---|---|---|---|---|',
  );
  for (const key of Object.keys(A).sort()) {
    const [page, form] = key.split('|');
    const a = A[key];
    if (B) {
      const b = B[key] || {};
      const change = Number.isFinite(b.tbt) && a.tbt > 0 ? ((b.tbt - a.tbt) / a.tbt) * 100 : NaN;
      out.push(
        `| ${page} | ${form} | ${a.n}/${b.n ?? 0} | ${fmt(a.tbt)} | ${fmt(b.tbt)} | ${fmt(change)} % | ${THRESHOLD[form]} | ${fmt(a.cls, 3)} | ${fmt(b.cls, 3)} | ${fmt(b.lcp)} | ${fmt(b.score)} |`,
      );
    } else {
      out.push(
        `| ${page} | ${form} | ${a.n} | ${fmt(a.tbt)} | ${THRESHOLD[form]} | ${fmt(a.cls, 3)} | ${fmt(a.lcp)} | ${fmt(a.score)} |`,
      );
    }
  }
  const sets = runsB
    ? [
        ['baza', load(dirA)],
        ['gałąź', runsB],
      ]
    : [['pomiar', load(dirA)]];
  for (const [name, runs] of sets) {
    out.push('', `Najdłuższe zadania mobile (${name}): skrypt | ms na przebieg | max ms | liczba`);
    for (const t of topLongTasks(runs)) {
      out.push(`- ${t.url} | ${fmt(t.perRun)} | ${fmt(t.max)} | ${t.count}`);
    }
  }
  console.log(out.join('\n'));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
