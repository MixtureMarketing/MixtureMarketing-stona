// MIX-1589 r4: co robi główny wątek w oknie [od, do] ms od navigationStart: histogram zdarzeń + profil V8 (funkcje, url:linia).
//   node .bieg/m1589/diag2.mjs <katalog> [wzorzec=baza-wiedzy] [od=600] [do=1500]
import fs from 'node:fs';
import path from 'node:path';
const [dir, pat = 'baza-wiedzy', a = '600', b = '1500'] = process.argv.slice(2);
const W0 = Number(a) * 1000, W1 = Number(b) * 1000;
const f = fs.readdirSync(dir).filter((x) => x.endsWith('.trace.json') && x.includes(pat)).sort()[0];
if (!f) { console.log('diag2: brak śladu'); process.exit(0); }
const raw = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const ev = Array.isArray(raw) ? raw : raw.traceEvents;
console.log(`## ${f}: ${ev.length} zdarzeń`);
const sum = new Map();
for (const e of ev) if (e.name === 'RunTask' && e.ph === 'X') sum.set(`${e.pid}:${e.tid}`, (sum.get(`${e.pid}:${e.tid}`) || 0) + e.dur);
const main = [...sum.entries()].sort((x, y) => y[1] - x[1])[0]?.[0];
const nav = ev.find((e) => e.name === 'navigationStart' && `${e.pid}:${e.tid}` === main) || ev.find((e) => e.name === 'navigationStart');
const t0 = nav ? nav.ts : 0;
console.log(`główny wątek ${main}, t0=${t0}`);
// 1) histogram zdarzeń w oknie na głównym wątku
const hist = new Map();
for (const e of ev) {
  if (`${e.pid}:${e.tid}` !== main || e.ts < t0 + W0 || e.ts > t0 + W1) continue;
  const d = e.args?.data || {};
  const k = `${e.ph} ${e.name} ${d.url || d.fileName || d.functionName || ''}`.trim().slice(0, 120);
  const v = hist.get(k) || { n: 0, dur: 0 };
  v.n++; v.dur += e.dur || 0; hist.set(k, v);
}
console.log('-- zdarzenia w oknie (wg łącznego dur, potem liczby):');
for (const [k, v] of [...hist.entries()].sort((x, y) => y[1].dur - x[1].dur || y[1].n - x[1].n).slice(0, 25)) console.log(`   ${(v.dur / 1000).toFixed(1)}ms n=${v.n} ${k}`);
// 2) profil V8
const profStart = new Map();
for (const e of ev) if (e.name === 'Profile' && e.args?.data?.startTime !== undefined) profStart.set(e.id, e.args.data.startTime);
const nodesBy = new Map(); // profId -> Map(nodeId -> {fn,url,line,parent})
const self = new Map(), incl = new Map();
const key = (n) => `${n.fn || '(anon)'} ${(n.url || '').split('/').slice(-2).join('/')}:${n.line}`;
let total = 0;
for (const e of ev) {
  if (e.name !== 'ProfileChunk') continue;
  const id = e.id;
  const cp = e.args?.data?.cpuProfile;
  if (!cp) continue;
  const nm = nodesBy.get(id) || new Map(); nodesBy.set(id, nm);
  for (const n of cp.nodes || []) nm.set(n.id, { fn: n.callFrame.functionName, url: n.callFrame.url, line: n.callFrame.lineNumber, parent: n.parent });
  for (const n of cp.nodes || []) for (const c of n.children || []) { const cn = nm.get(c); if (cn) cn.parent = n.id; }
  let t = e._t ?? (profStart.get(id) ?? 0);
  const tds = e.args.data.timeDeltas || [];
  (cp.samples || []).forEach((s, i) => {
    t += tds[i] || 0;
    if (t < t0 + W0 || t > t0 + W1) return;
    const dt = tds[i + 1] ?? tds[i] ?? 0;
    const n = nm.get(s); if (!n) return;
    if (['(idle)', '(program)', '(garbage collector)', '(root)'].includes(n.fn) && n.fn !== '(garbage collector)') { total += 0; }
    const dts = dt;
    total += dts;
    self.set(key(n), (self.get(key(n)) || 0) + dts);
    const seen = new Set(); let cur = n; let guard = 0;
    while (cur && guard++ < 200) { const k = key(cur); if (!seen.has(k)) { seen.add(k); incl.set(k, (incl.get(k) || 0) + dts); } cur = cur.parent !== undefined ? nm.get(cur.parent) : null; }
  });
}
console.log(`-- profil V8 w oknie, próbki ${(total / 1000).toFixed(0)} ms; własny czas:`);
for (const [k, v] of [...self.entries()].sort((x, y) => y[1] - x[1]).slice(0, 18)) console.log(`   ${(v / 1000).toFixed(1)}ms ${k}`);
console.log('-- profil V8, czas łączny (z potomkami):');
for (const [k, v] of [...incl.entries()].sort((x, y) => y[1] - x[1]).slice(0, 25)) console.log(`   ${(v / 1000).toFixed(1)}ms ${k}`);
