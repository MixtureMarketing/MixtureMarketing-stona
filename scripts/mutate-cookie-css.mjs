#!/usr/bin/env node
/**
 * MIX-1400: mutanty regul przycisku ciasteczek w index.css (tylko do biegu kontrolnego).
 *   node scripts/mutate-cookie-css.mjs <base|selektor|desktop|wartosc|prog768>
 * Kod 3 = mutacja nic nie zmienila (mutant pusty), 2 = nieznana nazwa.
 */
import fs from 'node:fs';

const name = process.argv[2];
const file = 'index.css';
const src = fs.readFileSync(file, 'utf8');
const SEL = "body[data-sticky-mobile-bar='true'] .cookie-floating-btn";
const block = `  ${SEL} {\n    bottom: 6.5rem;\n  }\n  @media (min-width: 768px) {\n    ${SEL} {\n      bottom: 1rem;\n    }\n  }\n\n`;

const mutants = {
  // regula wraca z utilities do warstwy base (stan sprzed poprawki)
  base: (s) => s.replace(block, '').replace('@layer base {\n', `@layer base {\n${block}`),
  // zly selektor: inny atrybut body niz ustawia StickyMobileBar
  selektor: (s) =>
    s.split("data-sticky-mobile-bar='true'] .cookie").join("data-sticky-bar='true'] .cookie"),
  // brak nadpisania od 768 px
  desktop: (s) =>
    s.replace(
      `  @media (min-width: 768px) {\n    ${SEL} {\n      bottom: 1rem;\n    }\n  }\n\n`,
      '\n',
    ),
  // za maly odstep: przycisk dalej zaslania pasek
  wartosc: (s) => s.replace('    bottom: 6.5rem;\n', '    bottom: 2rem;\n'),
  // prog desktopu 1280 zamiast 768 (pasek jest md:hidden od 768 px)
  prog768: (s) =>
    s.replace(
      `  @media (min-width: 768px) {\n    ${SEL} {`,
      `  @media (min-width: 1280px) {\n    ${SEL} {`,
    ),
};

if (!mutants[name]) {
  console.error('nieznany mutant:', name);
  process.exit(2);
}
const out = mutants[name](src);
if (out === src) {
  console.error('mutant nic nie zmienil:', name);
  process.exit(3);
}
fs.writeFileSync(file, out);
console.log('mutant zastosowany:', name);
