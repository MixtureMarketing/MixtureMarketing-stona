#!/usr/bin/env node
// MIX-1815 r3: progi MIX-1937 z wyniku axe1937.mjs: w kalkulatorze 0 „incomplete color-contrast”
// i 0 naruszeń serious/critical przy każdej szerokości i w każdym kroku. Wejście: <out>/<tag>.json.
// Wyjście: linie AXE i kod 0 = progi spełnione, 1 = nie, 2 = brak pliku.
import fs from 'node:fs';

const file = process.argv[2];
let res;
try {
  res = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (e) {
  console.log(`AXE brak wyniku ${file}: ${e.message}`);
  process.exit(2);
}
let bad = res.errors?.length ?? 0;
if (bad) console.log(`AXE errors ${JSON.stringify(res.errors).slice(0, 400)}`);
const vps = Object.keys(res.viewports || {});
if (!vps.length) {
  console.log('AXE brak szerokości');
  process.exit(1);
}
for (const vp of vps) {
  const steps = Object.entries(res.viewports[vp].axe || {});
  let inc = 0;
  let sc = 0;
  const det = [];
  for (const [step, list] of steps) {
    for (const x of list) {
      if (x.impact === 'poza') continue;
      if (x.id === 'incomplete-color-contrast-kalkulator') inc += x.n;
      else sc += x.n;
      det.push(`${step}:${x.id}(${x.n})`);
    }
  }
  bad += inc + sc;
  console.log(
    `AXE vp=${vp} kroki=${steps.length} [${steps.map(([s]) => s).join(',')}] incomplete_kalkulator=${inc} serious_critical=${sc}${det.length ? ' ' + det.slice(0, 10).join(' ') : ''}`,
  );
}
console.log(`AXE wynik fails=${bad}`);
process.exit(bad ? 1 : 0);
