// MIX-1707: rest classes of the double back DERIVED from the measured OFF and base runs (same machine, same run).
// Usage: node classes.mjs <width> <label> <checked.txt> <off.txt> <base.txt>   (files with probe "NUM ... double-back" lines)
// Reference set R = every rest of OFF and base. A rest r is in class iff some v in R has |r - v| <= 4 px.
// Rule for <checked>: every rest in class AND rootFramesMaxY max <= OFF max + 4. OFF and base are checked against
// R as well (SELF lines: they pass by construction, printed so the rule is visible). Exit 0 = rule met.
// Fail-closed: a file without exactly 8 double-back runs, or a value that is not a number, is a failure.
import fs from 'node:fs';

const TOL = 4;
const [width, label, checkedPath, offPath, basePath] = process.argv.slice(2);
const problems = [];

function runs(file) {
  let text = '';
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (e) {
    problems.push(`${file}: unreadable (${e.code})`);
    return [];
  }
  const rows = text
    .split('\n')
    .filter((l) => l.startsWith(`NUM ${width} double-back`))
    .map((l) => ({
      rest: Number((l.match(/ rest=(\S+)/) || [])[1]),
      maxY: Number((l.match(/ rootFramesMaxY=(\S+)/) || [])[1]),
    }));
  if (rows.length !== 8) problems.push(`${file}: ${rows.length} runs (expected 8)`);
  for (const r of rows)
    if (!Number.isFinite(r.rest) || !Number.isFinite(r.maxY)) problems.push(`${file}: non-numeric value`);
  return rows;
}

const off = runs(offPath);
const base = runs(basePath);
const checked = runs(checkedPath);
const ref = [...off, ...base].map((r) => r.rest).filter(Number.isFinite);
const offMax = Math.max(...off.map((r) => r.maxY).filter(Number.isFinite));
const inClass = (r) => ref.some((v) => Math.abs(r - v) <= TOL);
const outside = (rows) => rows.filter((r) => !inClass(r.rest)).map((r) => r.rest);
const sorted = (rows) => rows.map((r) => r.rest).sort((a, b) => a - b).join(',');

console.log(`REF ${width}: classes = OFF+base rests +-${TOL} px: off [${sorted(off)}] base [${sorted(base)}]; OFF rootFramesMaxY max ${offMax}`);
console.log(`SELF ${width} off: outside=${outside(off).length}  base: outside=${outside(base).length} (rule: both 0)`);
if (outside(off).length || outside(base).length) problems.push('OFF or base outside their own classes');
const out = outside(checked);
const max = Math.max(...checked.map((r) => r.maxY).filter(Number.isFinite));
console.log(`CHECK ${width} ${label}: rests [${sorted(checked)}] outside=${out.length}${out.length ? ` [${out.join(',')}]` : ''} rootFramesMaxY max ${max} (rule <= ${offMax + TOL})`);
if (out.length) problems.push(`${label} ${width}: ${out.length} rest(s) outside the OFF/base classes: ${out.join(',')}`);
if (!(max <= offMax + TOL)) problems.push(`${label} ${width}: rootFramesMaxY ${max} > OFF max ${offMax} + ${TOL}`);
for (const p of problems) console.log(`CLASSFAIL ${p}`);
console.log(`CLASSES ${width} ${label}: ${problems.length ? 'RED' : 'GREEN'}`);
process.exit(problems.length ? 1 : 0);
