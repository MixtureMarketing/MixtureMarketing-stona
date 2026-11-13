// MIX-1623 r3: zadania glownego watku > 50 ms z jednego sladu (devtools trace) + top N wg czasu wlasnego z URL skryptu.
//   node .bieg/m1623/longtasks.mjs <trace.json> [top=5]
// Zrodlo 1: profil V8 (ProfileChunk; kursor czasu liczony OSOBNO dla kazdego profilu; r2 mial blad: reset na kazdym chunku).
// Zrodlo 2 (zapas, gdy 0 probek): zdarzenia z URL (EvaluateScript/FunctionCall/v8.compile/...) w oknie zadania, czas calkowity.
import fs from 'node:fs';

export function analyze(file, topN = 5) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const ev = Array.isArray(raw) ? raw : raw.traceEvents || [];
  const lines = [];
  const sum = new Map();
  for (const e of ev) if (e.name === 'RunTask' && e.ph === 'X') sum.set(`${e.pid}:${e.tid}`, (sum.get(`${e.pid}:${e.tid}`) || 0) + e.dur);
  const main = [...sum.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!main) return [`brak RunTask w sladzie (${ev.length} zdarzen)`];
  const nav = ev.find((e) => e.name === 'navigationStart' && `${e.pid}:${e.tid}` === main) || ev.find((e) => e.name === 'navigationStart');
  const t0 = nav ? nav.ts : 0;
  const tasks = ev
    .filter((e) => e.name === 'RunTask' && e.ph === 'X' && `${e.pid}:${e.tid}` === main && e.dur > 50000 && e.ts >= t0)
    .map((e) => ({ s: e.ts, e: e.ts + e.dur, dur: e.dur }));
  lines.push(`zdarzen ${ev.length}, glowny watek ${main}, zadan > 50 ms: ${tasks.length}, suma (dur-50): ${tasks.reduce((a, t) => a + (t.dur - 50000), 0) / 1000} ms`);
  tasks.slice(0, 25).forEach((t) => lines.push(`   @${((t.s - t0) / 1000).toFixed(0)}ms dur ${(t.dur / 1000).toFixed(0)}ms`));
  const start = new Map();
  for (const e of ev) if (e.name === 'Profile' && e.args?.data?.startTime !== undefined) start.set(e.id, e.args.data.startTime);
  const nodes = new Map();
  const cursor = new Map();
  const self = new Map();
  let nSamples = 0;
  let inTasks = 0;
  for (const e of ev) {
    if (e.name !== 'ProfileChunk') continue;
    const cp = e.args?.data?.cpuProfile;
    if (!cp) continue;
    const nm = nodes.get(e.id) || new Map();
    nodes.set(e.id, nm);
    for (const n of cp.nodes || []) nm.set(n.id, n.callFrame);
    let t = cursor.get(e.id) ?? start.get(e.id) ?? e.ts;
    const td = e.args.data.timeDeltas || [];
    (cp.samples || []).forEach((s, i) => {
      t += td[i] || 0;
      nSamples++;
      const dt = td[i + 1] ?? td[i] ?? 0;
      if (!tasks.some((k) => t >= k.s && t <= k.e)) return;
      const cf = nm.get(s);
      if (!cf) return;
      inTasks++;
      const key = `${cf.functionName || '(anon)'} | ${cf.url ? cf.url.replace(/^https?:\/\/[^/]+/, '') : '(brak url)'}:${cf.lineNumber}`;
      self.set(key, (self.get(key) || 0) + dt);
    });
    cursor.set(e.id, t);
  }
  lines.push(`profil V8: probek ${nSamples}, w zadaniach > 50 ms ${inTasks}`);
  if (inTasks > 0) {
    const byUrl = new Map();
    for (const [k, v] of self) {
      const u = k.split(' | ')[1].replace(/:\d+$/, '');
      byUrl.set(u, (byUrl.get(u) || 0) + v);
    }
    lines.push(`-- top ${topN} wg czasu wlasnego (funkcja | url:linia):`);
    for (const [k, v] of [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, topN)) lines.push(`   ${(v / 1000).toFixed(1)} ms ${k}`);
    lines.push(`-- top ${topN} skryptow wg czasu wlasnego:`);
    for (const [k, v] of [...byUrl.entries()].sort((a, b) => b[1] - a[1]).slice(0, topN)) lines.push(`   ${(v / 1000).toFixed(1)} ms ${k}`);
    return lines;
  }
  const NAMES = new Set(['EvaluateScript', 'FunctionCall', 'v8.compile', 'v8.run', 'v8.callFunction', 'TimerFire', 'EventDispatch', 'XHRReadyStateChange', 'ParseHTML', 'Layout', 'UpdateLayoutTree', 'RunMicrotasks']);
  const by = new Map();
  for (const e of ev) {
    if (`${e.pid}:${e.tid}` !== main || e.ph !== 'X' || !NAMES.has(e.name) || !e.dur) continue;
    if (!tasks.some((k) => e.ts >= k.s && e.ts <= k.e)) continue;
    const d = e.args?.data || {};
    const u = d.url || d.fileName || d.scriptName || '';
    const key = `${e.name} | ${u ? u.replace(/^https?:\/\/[^/]+/, '') : '(brak url)'}`;
    by.set(key, (by.get(key) || 0) + e.dur);
  }
  lines.push(`-- ZAPAS (0 probek V8), czas calkowity zdarzen w zadaniach > 50 ms, top ${topN}:`);
  for (const [k, v] of [...by.entries()].sort((a, b) => b[1] - a[1]).slice(0, topN)) lines.push(`   ${(v / 1000).toFixed(1)} ms ${k}`);
  return lines;
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());
if (isMain) {
  const [file, top = '5'] = process.argv.slice(2);
  if (!file) {
    console.error('uzycie: node longtasks.mjs <trace.json> [top]');
    process.exit(2);
  }
  console.log(analyze(file, Number(top)).join('\n'));
}
