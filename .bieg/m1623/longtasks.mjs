// MIX-1623 r2: zadania glownego watku > 50 ms z sladu Lighthouse + top 5 wg czasu wlasnego (profil V8) z URL skryptu.
//   node .bieg/m1623/longtasks.mjs <katalog-lh> <wzorzec-strony> [top=5]
import fs from 'node:fs';
import path from 'node:path';
const [dir, pat, topN = '5'] = process.argv.slice(2);
const files = fs.readdirSync(dir).filter((x) => x.endsWith('.trace.json') && x.includes(pat)).sort();
if (!files.length) { console.log('longtasks: brak sladu'); process.exit(0); }
const selfAll = new Map(); const tasksAll = [];
for (const f of files) {
  const raw = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const ev = Array.isArray(raw) ? raw : raw.traceEvents;
  const sum = new Map();
  for (const e of ev) if (e.name === 'RunTask' && e.ph === 'X') sum.set(`${e.pid}:${e.tid}`, (sum.get(`${e.pid}:${e.tid}`) || 0) + e.dur);
  const main = [...sum.entries()].sort((x, y) => y[1] - x[1])[0]?.[0];
  const nav = ev.find((e) => e.name === 'navigationStart' && `${e.pid}:${e.tid}` === main) || ev.find((e) => e.name === 'navigationStart');
  const t0 = nav ? nav.ts : 0;
  const tasks = ev.filter((e) => e.name === 'RunTask' && e.ph === 'X' && `${e.pid}:${e.tid}` === main && e.dur > 50000 && e.ts >= t0)
    .map((e) => ({ s: e.ts, e: e.ts + e.dur, dur: e.dur }));
  tasks.forEach((t) => tasksAll.push(`${f.replace(/\.trace\.json$/, '')} @${((t.s - t0) / 1000).toFixed(0)}ms dur ${(t.dur / 1000).toFixed(0)}ms (blokuje ${((t.dur - 50000) / 1000).toFixed(0)}ms)`));
  const profStart = new Map();
  for (const e of ev) if (e.name === 'Profile' && e.args?.data?.startTime !== undefined) profStart.set(e.id, e.args.data.startTime);
  const nodesBy = new Map();
  for (const e of ev) {
    if (e.name !== 'ProfileChunk') continue;
    const cp = e.args?.data?.cpuProfile; if (!cp) continue;
    const nm = nodesBy.get(e.id) || new Map(); nodesBy.set(e.id, nm);
    for (const n of cp.nodes || []) nm.set(n.id, { fn: n.callFrame.functionName, url: n.callFrame.url, line: n.callFrame.lineNumber });
    let t = e._t ?? (profStart.get(e.id) ?? 0);
    const tds = e.args.data.timeDeltas || [];
    (cp.samples || []).forEach((s, i) => {
      t += tds[i] || 0;
      const dt = tds[i + 1] ?? tds[i] ?? 0;
      if (!tasks.some((k) => t >= k.s && t <= k.e)) return;
      const n = nm.get(s); if (!n) return;
      const k = `${n.fn || '(anon)'} | ${n.url ? n.url.replace(/^https?:\/\/[^/]+/, '') : '(brak url)'}:${n.line}`;
      selfAll.set(k, (selfAll.get(k) || 0) + dt);
    });
  }
}
console.log(`## ${pat}: sladow ${files.length}, zadan > 50 ms: ${tasksAll.length}`);
tasksAll.slice(0, 20).forEach((t) => console.log(`   ${t}`));
const tot = [...selfAll.values()].reduce((a, b) => a + b, 0);
console.log(`-- top ${topN} wg czasu wlasnego w zadaniach > 50 ms (suma probek ${(tot / 1000).toFixed(0)} ms, ${files.length} przebiegow):`);
for (const [k, v] of [...selfAll.entries()].sort((a, b) => b[1] - a[1]).slice(0, Number(topN))) console.log(`   ${(v / 1000 / files.length).toFixed(1)} ms/przebieg ${k}`);
