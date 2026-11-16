// MIX-1412 r2: one line per viewport from probe.json (switch on; optional second file).
import fs from 'node:fs';

const read = (p) => {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.log(`PROBE ${p}: unreadable (${e.message})`);
    return null;
  }
};
const [onPath, offPath] = process.argv.slice(2);
for (const [label, p] of [
  ['on', onPath],
  ['off', offPath],
]) {
  if (!p) continue;
  const j = read(p);
  if (!j) continue;
  for (const [vp, v] of Object.entries(j)) {
    if (vp === 'fails') continue;
    const fv = (v.firstView || [])
      .map((x) => `bW${x.barWstecz}/bD${x.barDalej}/cW${x.cookieWstecz}/cB${x.cookieBar}`)
      .join(' ');
    const s = v.sweep || {};
    console.log(
      `PROBE ${label} ${vp}: first[${fv}] sweep(steps ${s.steps}) bW${s.barWstecz}/bD${s.barDalej}/raisedCW${s.raisedCookieWstecz}/plainCW${s.plainCookieWstecz}/cB${s.cookieBar} ` +
        `optH[${(v.calculatorButtonHeightsPx || []).join(',')}] ms ${JSON.stringify(v.msToPrice)} ` +
        `barBefore ${v.barBeforeAnswer} bar ${JSON.stringify(v.bar)} overlap ${v.overlapPx2}`,
    );
  }
  console.log(`PROBE ${label} fails ${(j.fails || []).length}: ${JSON.stringify(j.fails || [])}`);
}
