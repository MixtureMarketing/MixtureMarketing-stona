#!/usr/bin/env node
// MIX-1741: grid class of components/features/portfolio/PortfolioGrid.tsx for a probe variant (footer.sh).
//   node .bieg/mix1741/variant.mjs <bug|fixa|nocv|m2|m3|m5>   (run from the repo root; the file is restored by the caller)
// bug  = the class of 3febcb0 (contain-intrinsic-size without `auto`: a skipped grid collapses to 1500 px),
// fixa = contain-intrinsic-size with `auto` (last remembered size), nocv = no content-visibility on the grid.
// Exit 1 when the class is not found or the result does not hold (fail-closed).
import fs from 'node:fs';

const FILE = 'components/features/portfolio/PortfolioGrid.tsx';
const v = process.argv[2];
const src = fs.readFileSync(FILE, 'utf8');
const re = / \[content-visibility:auto\] \[contain-intrinsic-size:[^\]]*\]/;
if (!re.test(src)) {
  console.error(`variant ${v}: grid class not found in ${FILE}`);
  process.exit(1);
}
const to = {
  bug: ' [content-visibility:auto] [contain-intrinsic-size:1px_1500px]',
  fixa: ' [content-visibility:auto] [contain-intrinsic-size:auto_1px_auto_1500px]',
  nocv: '',
  // mutants of the fix line (mut.sh): auto on the inline axis only, auto on the block axis only, a second size class
  m2: ' [content-visibility:auto] [contain-intrinsic-size:auto_1px_1500px]',
  m3: ' [content-visibility:auto] [contain-intrinsic-size:1px_auto_1500px]',
  m5: ' [content-visibility:auto] [contain-intrinsic-size:auto_1px_auto_1500px] [contain-intrinsic-size:1px_1500px]',
}[v];
if (to === undefined) {
  console.error(`unknown variant ${v}`);
  process.exit(1);
}
const out = src.replace(re, to);
fs.writeFileSync(FILE, out);
const hasCv = out.includes('[content-visibility:auto]');
if ((v === 'nocv') === hasCv) process.exit(1);
console.log(`variant ${v}: ${(out.match(re) || ['(no content-visibility)'])[0].trim()}`);
