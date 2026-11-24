#!/usr/bin/env node
// MIX-1317: porównanie prerenderowanych HTML dwóch buildów (baza bc51ab2 vs HEAD bez przełącznika)
// dla 6 podstron z sekcją procesu. Ujednolicamy tylko skróty nazw plików (/assets/nazwa-<hash>.js|css):
// zmiana kodu zmienia skróty chunków, nie treść strony. Kod 0 = 6/6 identycznych po ujednoliceniu.
// Pozostałe HTML: informacyjnie (artykuły z CMS bywają różne między buildami niezależnie od kodu).
import fs from 'node:fs';
import path from 'node:path';
const [a, b] = process.argv.slice(2);
const PAGES = ['marketing/google-ads', 'marketing/seo', 'web-development/systemy-ai-aplikacje', 'web-development/custom-app', 'agencja-seo-rzeszow', 'design/branding'];
const norm = (s) => s.replace(/([\w.-]+)-[A-Za-z0-9_-]{8}\.(js|css|mjs)/g, '$1-HASH.$2');
const walk = (d, p = '') =>
  fs.readdirSync(path.join(d, p), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(d, path.join(p, e.name)) : e.name.endsWith('.html') ? [path.join(p, e.name)] : [],
  );
const firstDiff = (x, y) => {
  let i = 0;
  while (i < x.length && x[i] === y[i]) i++;
  return `znak ${i}: ${JSON.stringify(x.slice(Math.max(0, i - 120), i + 160))} ≠ ${JSON.stringify(y.slice(Math.max(0, i - 120), i + 160))}`;
};
let ok = 0;
for (const p of PAGES) {
  const f = path.join(p, 'index.html');
  const x = fs.readFileSync(path.join(a, f), 'utf8');
  const y = fs.readFileSync(path.join(b, f), 'utf8');
  const same = norm(x) === norm(y);
  if (same) ok++;
  console.log(`/${p}/: surowo ${x === y ? 'identyczny' : 'różny'}, po ujednoliceniu ${same ? 'identyczny' : 'RÓŻNY'} (bajty ${Buffer.byteLength(x)} vs ${Buffer.byteLength(y)})`);
  if (!same) console.log(`  ${firstDiff(norm(x), norm(y))}`);
}
const fa = walk(a).sort(), fb = walk(b).sort();
const only = fa.filter((f) => !fb.includes(f)).concat(fb.filter((f) => !fa.includes(f)));
const rozne = fa.filter((f) => fb.includes(f) && norm(fs.readFileSync(path.join(a, f), 'utf8')) !== norm(fs.readFileSync(path.join(b, f), 'utf8')));
console.log(`PORÓWNANIE ${ok}/${PAGES.length} podstron identycznych; wszystkie HTML: ${fa.length} vs ${fb.length}, tylko w jednym ${only.length}, różne po ujednoliceniu ${rozne.length}${rozne.length ? ' ' + rozne.slice(0, 8).join(', ') : ''}`);
process.exit(ok === PAGES.length ? 0 : 1);
