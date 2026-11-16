#!/usr/bin/env node
/**
 * MIX-1745 round 2: BACK of build B against reference build A per condition (cond.mjs JSON of one width).
 *
 *   node .bieg/mix1745/condcmp.mjs <cond-A.json> <cond-B.json>
 *
 * Per condition and back k (same card in both): same number of transitions, ready/skipped, animated names at the 5
 * sampled fractions, image group and title group rect within 4 px at each fraction (x, y, w, h), same loaded state
 * of the target image. Also FOOTER landings of B. Lines CC (one per differing back), CCSUM per condition, CCALL.
 * Exit 0 = B matches A in every back, 1 = measured and different, 2 = not comparable (fail-closed).
 * CC_REF=<condition> (allowlist: a condition of A): every condition of B except quick (a race with the entry transition
 * in both builds) is compared with that one condition of A (the accepted look: CC_REF=fresh).
 */
import fs from 'node:fs';

const [fa, fb] = process.argv.slice(2);
let A;
let B;
try {
  A = JSON.parse(fs.readFileSync(fa, 'utf8'));
  B = JSON.parse(fs.readFileSync(fb, 'utf8'));
} catch (e) {
  console.log(`CCALL not comparable: ${String(e.message).slice(0, 120)}`);
  process.exit(2);
}
const MAX_PX = 4;
const dr = (ra, rb) => {
  if (!ra && !rb) return 0;
  if (!ra || !rb) return Infinity;
  return Math.max(...['x', 'y', 'w', 'h'].map((k) => Math.abs(ra[k] - rb[k])));
};
let diff = 0;
let broken = 0;
const REF = process.env.CC_REF || '';
if (REF && !Object.keys(A.conds || {}).includes(REF)) {
  console.log(`CCALL not comparable: CC_REF ${REF} not a condition of A`);
  process.exit(2);
}
const conds = REF
  ? Object.keys(B.conds || {}).filter((c) => c !== 'quick')
  : Object.keys(A.conds || {});
if (!conds.length) broken++;
for (const c of conds) {
  const xa = A.conds[REF || c] || [];
  const xb = B.conds?.[c] || [];
  let cd = 0;
  let maxPx = 0;
  if (!xa.length || xa.length !== xb.length) {
    console.log(`CCSUM ${B.vp} ${c} not comparable backs=${xa.length}/${xb.length}`);
    broken++;
    continue;
  }
  for (let i = 0; i < xa.length; i++) {
    const a = xa[i];
    const b = xb[i];
    const why = [];
    if (a.href !== b.href) why.push(`card ${a.href}|${b.href}`);
    if (a.vs.length !== b.vs.length) why.push(`transitions ${a.vs.length}|${b.vs.length}`);
    const va = a.vs[0];
    const vb = b.vs[0];
    if (va && vb) {
      if (va.ready !== vb.ready || va.skipped !== vb.skipped)
        why.push(`ready/skipped ${va.ready}/${va.skipped}|${vb.ready}/${vb.skipped}`);
      if (va.newImg !== vb.newImg) why.push(`newImg ${va.newImg}|${vb.newImg}`);
      for (let j = 0; j < (va.f || []).length; j++) {
        const fa2 = va.f[j];
        const fb2 = vb.f?.[j];
        if (!fb2) {
          why.push(`fraction ${j} missing`);
          continue;
        }
        if (fa2.names.join('+') !== fb2.names.join('+'))
          why.push(`names@${fa2.fr} ${fa2.names.join('+')}|${fb2.names.join('+')}`);
        const di = dr(fa2.img, fb2.img);
        const dt = dr(fa2.tit, fb2.tit);
        maxPx = Math.max(maxPx, di, dt);
        if (di > MAX_PX) why.push(`img@${fa2.fr} ${Math.round(di)}px`);
        if (dt > MAX_PX) why.push(`tit@${fa2.fr} ${Math.round(dt)}px`);
      }
    }
    if (why.length) {
      cd++;
      console.log(`CC ${B.vp} ${c} k=${a.k} ${A.tag}->${B.tag} DIFF ${why.slice(0, 6).join('; ')}`);
    }
  }
  const foot = xb.filter((b) => b.cls === 'FOOTER').length;
  console.log(
    `CCSUM ${B.vp} ${c} ${A.tag}${REF ? `:${REF}` : ''}->${B.tag} backs=${xa.length} diff=${cd} maxPx=${Number.isFinite(maxPx) ? Math.round(maxPx * 10) / 10 : 'inf'} footer${B.tag}=${foot}`,
  );
  diff += cd;
}
console.log(
  `CCALL ${B.vp} ${A.tag}->${B.tag} conds=${conds.length} diff=${diff} notComparable=${broken}`,
);
process.exit(broken ? 2 : diff ? 1 : 0);
