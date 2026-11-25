#!/usr/bin/env node
// MIX-1269: porównanie prerenderowanych HTML dwóch buildów (baza vs HEAD bez przełącznika).
// Wypisuje: index.html identyczny bajt w bajt? (surowo) i po ujednoliceniu skrótów nazw plików
// (/assets/nazwa-<hash>.js|css: zmiana kodu zmienia skróty chunków, nie treść strony).
// Kod 0 = index.html identyczny po ujednoliceniu i ten sam zestaw plików HTML.
import fs from 'node:fs';
import path from 'node:path';
const [a, b] = process.argv.slice(2);
const walk = (d, p = '') =>
  fs.readdirSync(path.join(d, p), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(d, path.join(p, e.name)) : e.name.endsWith('.html') ? [path.join(p, e.name)] : [],
  );
const norm = (s) => s.replace(/([\w.-]+)-[A-Za-z0-9_-]{8}\.(js|css|mjs)/g, '$1-HASH.$2');
const fa = walk(a).sort();
const fb = walk(b).sort();
const only = fa.filter((f) => !fb.includes(f)).concat(fb.filter((f) => !fa.includes(f)));
let raw = 0;
let diff = [];
for (const f of fa.filter((x) => fb.includes(x))) {
  const x = fs.readFileSync(path.join(a, f), 'utf8');
  const y = fs.readFileSync(path.join(b, f), 'utf8');
  if (x !== y) raw++;
  if (norm(x) !== norm(y)) diff.push(f);
}
const ia = fs.readFileSync(path.join(a, 'index.html'), 'utf8');
const ib = fs.readFileSync(path.join(b, 'index.html'), 'utf8');
console.log(`html: ${fa.length} vs ${fb.length}, tylko w jednym: ${only.length}`);
console.log(`index.html surowo identyczny: ${ia === ib} (bajty ${Buffer.byteLength(ia)} vs ${Buffer.byteLength(ib)})`);
console.log(`index.html po ujednoliceniu skrótów identyczny: ${norm(ia) === norm(ib)}`);
console.log(`HTML różne surowo: ${raw}; po ujednoliceniu: ${diff.length}${diff.length ? ' ' + diff.slice(0, 10).join(', ') : ''}`);
const firstDiff = (x, y) => {
  let i = 0;
  while (i < x.length && x[i] === y[i]) i++;
  return `znak ${i}: ${JSON.stringify(x.slice(Math.max(0, i - 120), i + 160))} ≠ ${JSON.stringify(y.slice(Math.max(0, i - 120), i + 160))}`;
};
for (const f of diff.slice(0, 3)) {
  const x = norm(fs.readFileSync(path.join(a, f), 'utf8'));
  const y = norm(fs.readFileSync(path.join(b, f), 'utf8'));
  console.log(`różnica ${f}: ${firstDiff(x, y)}`);
}
if (norm(ia) !== norm(ib)) {
  const la = norm(ia).split(/(?=<)/), lb = norm(ib).split(/(?=<)/);
  for (let i = 0; i < Math.max(la.length, lb.length); i++) if (la[i] !== lb[i]) { console.log('pierwsza różnica:', JSON.stringify(la[i]?.slice(0, 200)), '≠', JSON.stringify(lb[i]?.slice(0, 200))); break; }
}
// Kryterium karty dotyczy strony głównej: kod wyjścia tylko z index.html; reszta to informacja
// (artykuły z CMS bywają różne między buildami niezależnie od kodu, patrz wypis różnic).
process.exit(norm(ia) === norm(ib) && only.length === 0 ? 0 : 1);
