// MIX-1607 r2: rozbicie LCP per przebieg Lighthouse: wartosc symulowana vs obserwowana, kandydaci LCP ze sladu
// (czas od navigationStart, rozmiar, typ), element koncowy, czas FCP i startu najdluzszych zadan.
//   node .bieg/m1607/bd.mjs <katalog-lh> [wzorzec=baza-wiedzy]
import fs from 'node:fs';
import path from 'node:path';
const [dir, pat = 'baza-wiedzy'] = process.argv.slice(2);
const files = fs.readdirSync(dir).filter((f) => f.includes(pat) && f.endsWith('.json') && !f.includes('trace') && !f.includes('devtools')).sort();
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const a = j.audits;
  const m = a.metrics?.details?.items?.[0] || {};
  const base = f.replace(/\.json$/, '');
  const tf = fs.readdirSync(dir).find((x) => x.startsWith(base) && x.endsWith('.trace.json'));
  let cands = [];
  let longTasks = [];
  if (tf) {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, tf), 'utf8'));
    const ev = Array.isArray(raw) ? raw : raw.traceEvents;
    const nav = ev.find((e) => e.name === 'navigationStart');
    const t0 = nav ? nav.ts : 0;
    const byFrame = new Map();
    for (const e of ev) {
      if (e.name === 'largestContentfulPaint::Candidate') byFrame.set(e.args?.frame, [...(byFrame.get(e.args?.frame) || []), e]);
    }
    const all = [...byFrame.values()].flat().sort((x, y) => x.ts - y.ts);
    cands = all.map((e) => `${Math.round((e.ts - t0) / 1000)}ms size=${e.args?.data?.size} type=${e.args?.data?.type} node=${e.args?.data?.nodeId}`);
    const evalScripts = ev
      .filter((e) => e.name === 'EvaluateScript' && e.dur > 40000 && e.ph === 'X')
      .map((e) => `${Math.round((e.ts - t0) / 1000)}+${Math.round(e.dur / 1000)}ms ${String(e.args?.data?.url || '').split('/').slice(-1)[0]}`);
    longTasks = evalScripts.slice(0, 8);
  }
  const el = a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node;
  console.log(`## ${f}: LCP sym ${Math.round(a['largest-contentful-paint'].numericValue)} | obs LCP ${m.observedLargestContentfulPaint} obs FCP ${m.observedFirstContentfulPaint} obs load ${m.observedLoad} TBT ${Math.round(a['total-blocking-time'].numericValue)}`);
  console.log(`   element: ${el ? `${el.selector} :: ${String(el.snippet || '').slice(0, 90)}` : '(brak: wezel usuniety z DOM)'}`);
  console.log(`   kandydaci LCP: ${cands.join(' ; ')}`);
  console.log(`   skrypty >40ms: ${longTasks.join(' ; ')}`);
}
