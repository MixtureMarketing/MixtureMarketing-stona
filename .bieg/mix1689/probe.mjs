// MIX-1689: plain-node probe of the separator allowlist (forms.mjs + W06/X04 + prose + skeleton).
// Usage from the repo root: node .bieg/mix1689/probe.mjs [repo] ; rc 1 = a failure. No vitest.
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { FORMS, PROSE } from './forms.mjs';
const WT = process.argv[2] ?? '.';
const { llmsReport, skeletonText, WILDCARD: W } = await import(
  pathToFileURL(path.join(WT, 'scripts/lib/llms.js')).href
);
const { prerenderOnlyRoutes: H } = await import(pathToFileURL(path.join(WT, 'routes.js')).href);
const BASE = 'https://mixturemarketing.pl';
const sm = `<urlset><url><loc>${BASE}/a/</loc></url></urlset>`;
const base = `# T\n\n- [a](${BASE}/a/): opis\n`;
let n = 0, bad = 0;
const rep = (line, hidden = H) => llmsReport(`${base}${line}\n`, sm, { keyPaths: ['/a/'], hiddenPaths: hidden });
const check = (id, cond, info = '') => { n++; if (!cond) bad++; console.log(`${cond ? 'ok  ' : 'FAIL'} ${id} ${info}`); };
for (const [id, c, attack, twin] of FORMS) {
  const r = rep(attack), t = rep(twin);
  check(`${id} refused`, !r.ok, r.problems.join(' | ').slice(0, 160));
  check(`${id} twin passes`, t.ok, t.problems.join(' | ').slice(0, 160));
  // U+FF0E: NFKC gives ASCII '.', a listed separator; refused by the dotted-word rule instead.
  const want = c === '．' ? ' ' : W;
  check(`${id} skeleton ${want === W ? 'wildcard' : 'ASCII dot'}`, skeletonText(c) === want, JSON.stringify(skeletonText(c)));
}
for (const p of PROSE) { const r = rep(p); check(`prose ${p.slice(2, 14)}`, r.ok, r.problems.join(' | ').slice(0, 160)); }
const MC = [...H, '/modern-cloud-platform/'];
const w06 = rep('- Strona moderrn-cloud-platform', MC);
check('W06 moderrn passes (extra letter, residual)', w06.ok, w06.problems.join(' | '));
check('W06 control modern refused', !rep('- Strona modern-cloud-platform', MC).ok);
check('X04 refused', !rep('- Strona ABONAMENT/DZIEKUJEMY Г').ok);
check('X04 twin passes', rep('- Strona ABONAMENT/CENNIK Г').ok);
const sk = skeletonText('a b\tc\nd.e,f;g:h!x?j\'k"m(n)o„p”q“r’s«t»u');
check('soft separators', sk === 'a b c d e f g h x j k m n o p q r s t u', JSON.stringify(sk));
const hk = skeletonText('a#b$c%d&e*f+g-h/x<j=k>m@n[o\\p]q^r_s`t{u|v}w~y—z–a');
check('hard separators', hk === 'a/b/c/d/e/f/g/h/x/j/k/m/n/o/p/q/r/s/t/u/v/w/y/z/a', JSON.stringify(hk));
const ctl = skeletonText('a\x01b\rc\u0085d e…f°');
check('controls/NEL wildcard, NBSP and … via NFKC', ctl === `a${W}b${W}c${W}d e   f${W}`, JSON.stringify(ctl));
console.log(`PROBE1689 TOTAL checks=${n} failed=${bad}`);
process.exit(bad ? 1 : 0);
