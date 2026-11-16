// MIX-1719: rest classes of the human double back (from .bieg/mix1707/classes.mjs), per spacing.
// Usage: node classes.mjs <width> <label> <gaps csv> <checked.txt> <off.txt> <base.txt>
//   (files with probe "NUM <width> double-back-<gap>-r<i> ..." lines, .bieg/mix1719/probe-x.mjs with PROBE_REPEAT=8)
// For every gap g of <gaps>:
//   (1) rest class: every checked rest at g is within 4 px of some rest of OFF or base (all gaps of this run, the
//       set of resting positions the browser itself produces in this scenario);
//   (2) no brief jump: max rootFramesMaxY of the checked runs at g <= max rootFramesMaxY of OFF at g + 4 px
//       (rootFramesMaxY = max scrollY over every frame on "/" after the double back).
// Fail-closed: a gap without exactly 8 runs in any file, or a value that is not a number, is a failure.
// Exit 0 = every gap GREEN. Lines: GAP <width> <label> <g>: GREEN|RED ..., REDGAPS, CLASSES <width> <label>: GREEN|RED.
import fs from 'node:fs';

const TOL = 4;
const RUNS = 8;
const [width, label, gapsCsv, checkedPath, offPath, basePath] = process.argv.slice(2);
const problems = [];
const gaps = String(gapsCsv || '')
  .split(',')
  .filter(Boolean);
if (!gaps.length || gaps.some((g) => !/^\d+$/.test(g))) problems.push(`gaps "${gapsCsv}" invalid`);

function rows(file) {
  let text = '';
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (e) {
    problems.push(`${file}: unreadable (${e.code})`);
    return [];
  }
  return text
    .split('\n')
    .filter((l) => l.startsWith(`NUM ${width} double-back-`))
    .map((l) => ({
      gap: (l.match(/ double-back-(\d+)-r\d+ /) || [])[1] ?? null,
      rest: Number((l.match(/ rest=(\S+)/) || [])[1]),
      maxY: Number((l.match(/ rootFramesMaxY=(\S+)/) || [])[1]),
    }));
}
function atGap(all, g, file) {
  const r = all.filter((x) => x.gap === g);
  if (r.length !== RUNS) problems.push(`${file}: gap ${g}: ${r.length} runs (expected ${RUNS})`);
  for (const x of r)
    if (!Number.isFinite(x.rest) || !Number.isFinite(x.maxY)) problems.push(`${file}: gap ${g}: non-numeric value`);
  return r;
}

const off = rows(offPath);
const base = rows(basePath);
const checked = rows(checkedPath);
const offGaps = [...new Set(off.map((x) => x.gap))].filter(Boolean);
for (const g of offGaps) {
  atGap(off, g, offPath);
  atGap(base, g, basePath);
}
const ref = [...off, ...base].map((r) => r.rest).filter(Number.isFinite);
const inClass = (v) => ref.some((r) => Math.abs(v - r) <= TOL);
const sorted = (r) => r.map((x) => x.rest).sort((a, b) => a - b).join(',');
const max = (r) => Math.max(...r.map((x) => x.maxY).filter(Number.isFinite));
console.log(`REF ${width}: rests OFF+base over gaps [${offGaps.join(',')}] +-${TOL} px: [${[...new Set(ref)].sort((a, b) => a - b).join(',')}]`);
const red = [];
for (const g of gaps) {
  const c = atGap(checked, g, checkedPath);
  const o = off.filter((x) => x.gap === g);
  const b = base.filter((x) => x.gap === g);
  const out = c.filter((x) => !inClass(x.rest)).map((x) => x.rest);
  const cMax = max(c);
  const oMax = max(o);
  const bad = [];
  if (!c.length || !o.length) bad.push('no runs');
  if (out.length) bad.push(`${out.length} rest(s) outside [${out.join(',')}]`);
  if (!(cMax <= oMax + TOL)) bad.push(`rootFramesMaxY ${cMax} > OFF ${oMax} + ${TOL}`);
  if (bad.length) red.push(g);
  console.log(
    `GAP ${width} ${label} ${g}: ${bad.length ? 'RED' : 'GREEN'} rests [${sorted(c)}] maxY ${cMax} | OFF rests [${sorted(o)}] maxY ${oMax} | base rests [${sorted(b)}] maxY ${max(b)}${bad.length ? ` | ${bad.join('; ')}` : ''}`,
  );
  for (const x of bad) problems.push(`${label} ${width} gap ${g}: ${x}`);
}
console.log(`REDGAPS ${width} ${label}: [${red.join(',')}]`);
for (const p of problems) console.log(`CLASSFAIL ${p}`);
console.log(`CLASSES ${width} ${label}: ${problems.length ? 'RED' : 'GREEN'}`);
process.exit(problems.length ? 1 : 0);
