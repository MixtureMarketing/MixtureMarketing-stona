#!/usr/bin/env node
/**
 * MIX-1745: BACK of build B against the reference build A (frames.mjs JSON of one width).
 *
 *   node .bieg/mix1745/compare.mjs <frames-A.json> <frames-B.json>
 *
 * Per card (second, last), paused steps k = 0..10: the same animated names and pseudo-elements, and the image group
 * (realizacja-zdjecie) and title group (realizacja-tytul) rect within 4 px (x, y, w, h); same T within 20 ms; in the
 * real-time pass the same set of animated names. Lines CMP / CMPSUM. Exit 0 = B matches A, 1 = measured and
 * different, 2 = not comparable (missing card, steps or file; fail-closed).
 */
import fs from 'node:fs';

const [fa, fb] = process.argv.slice(2);
let A;
let B;
try {
  A = JSON.parse(fs.readFileSync(fa, 'utf8'));
  B = JSON.parse(fs.readFileSync(fb, 'utf8'));
} catch (e) {
  console.log(`CMPSUM not comparable: ${String(e.message).slice(0, 120)}`);
  process.exit(2);
}
const MAX_PX = 4;
const MAX_DT = 20;
const STEPS = 10;
let diff = 0;
let broken = 0;
const tag = `${B.vp} ${A.tag}->${B.tag}`;
const d = (ra, rb) => {
  if (!ra && !rb) return 0;
  if (!ra || !rb) return Infinity;
  return Math.max(...['x', 'y', 'w', 'h'].map((k) => Math.abs(ra[k] - rb[k])));
};
for (const card of ['second', 'last']) {
  const a = A.cards?.[card];
  const b = B.cards?.[card];
  if (!a?.steps || !b?.steps || a.steps.length !== STEPS + 1 || b.steps.length !== STEPS + 1) {
    console.log(
      `CMP ${tag} ${card} not comparable (steps ${a?.steps?.length ?? 0}/${b?.steps?.length ?? 0})`,
    );
    broken++;
    continue;
  }
  if (a.href !== b.href) {
    console.log(`CMP ${tag} ${card} different card ${a.href} vs ${b.href}`);
    broken++;
    continue;
  }
  const fails = [];
  if (!(Math.abs(a.T - b.T) <= MAX_DT)) fails.push(`T ${a.T} vs ${b.T}`);
  let maxImg = 0;
  let maxTit = 0;
  for (let k = 0; k <= STEPS; k++) {
    const sa = a.steps[k];
    const sb = b.steps[k];
    if (sa.names.join('+') !== sb.names.join('+'))
      fails.push(`k=${k} names ${sa.names.join('+')} vs ${sb.names.join('+')}`);
    if (sa.pseudos.join('+') !== sb.pseudos.join('+'))
      fails.push(`k=${k} pseudos ${sa.pseudos.length} vs ${sb.pseudos.length}`);
    const di = d(sa.rec['group(realizacja-zdjecie)'], sb.rec['group(realizacja-zdjecie)']);
    const dt = d(sa.rec['group(realizacja-tytul)'], sb.rec['group(realizacja-tytul)']);
    maxImg = Math.max(maxImg, di);
    maxTit = Math.max(maxTit, dt);
    if (!(di <= MAX_PX))
      fails.push(`k=${k} image rect +${Number.isFinite(di) ? di.toFixed(1) : 'missing'} px`);
    if (!(dt <= MAX_PX))
      fails.push(`k=${k} title rect +${Number.isFinite(dt) ? dt.toFixed(1) : 'missing'} px`);
  }
  const rna = (a.rt?.names ?? []).join('+');
  const rnb = (b.rt?.names ?? []).join('+');
  if (!rna || !rnb) {
    console.log(`CMP ${tag} ${card} real-time pass missing (${rna || '-'} / ${rnb || '-'})`);
    broken++;
    continue;
  }
  if (rna !== rnb) fails.push(`rt names ${rna} vs ${rnb}`);
  const res = fails.length ? 'DIFF' : 'SAME';
  if (fails.length) diff++;
  console.log(
    `CMP ${tag} ${card} ${res} maxImg=${maxImg.toFixed(1)} maxTit=${maxTit.toFixed(1)} T=${a.T}/${b.T} rtNames=${rna}|${rnb} rest=${a.rt?.cls}|${b.rt?.cls} ${fails.slice(0, 6).join('; ')}`,
  );
}
console.log(`CMPSUM ${tag} diff=${diff} notComparable=${broken}`);
process.exit(broken ? 2 : diff ? 1 : 0);
