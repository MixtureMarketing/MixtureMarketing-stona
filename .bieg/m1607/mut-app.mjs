// MIX-1607 r2: mutacje App.tsx (kolejnosc banera zgod). node mut-app.mjs <op> ; zmienia plik w miejscu.
import fs from 'node:fs';
const F = 'App.tsx';
let s = fs.readFileSync(F, 'utf8');
const sect = `            <section aria-label="Zarządzanie plikami cookies">
              <CookieBanner />
            </section>
`;
const skipEnd = `              Przejdź do treści
            </a>
`;
const op = process.argv[2];
if (!s.includes(sect)) throw new Error('brak sekcji');
const without = s.replace(sect, '');
const ops = {
  'po-main': () => without.replace('            </main>\n', `            </main>\n${sect}`),
  'przed-skip': () => without.replace(`            {/* Skip Link for WCAG Accessibility */}\n`, `${sect}            {/* Skip Link for WCAG Accessibility */}\n`),
  'po-navbarze': () => without.replace('            <Navbar />\n', `            <Navbar />\n${sect}`),
  'w-main': () => without.replace('            <main id="main-content">\n', `            <main id="main-content">\n${sect}`),
  'bez-sekcji': () => s.replace(sect, '            <CookieBanner />\n'),
  'etykieta': () => s.replace('aria-label="Zarządzanie plikami cookies"', 'aria-label="Cookies"'),
};
if (!ops[op]) throw new Error('nieznana operacja ' + op);
const out = ops[op]();
if (out === s) throw new Error('mutacja bez zmiany');
fs.writeFileSync(F, out);
console.log('mutacja', op, 'zastosowana');
