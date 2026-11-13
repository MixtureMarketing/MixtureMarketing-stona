// MIX-1268: liczy blok „Powiązane” w zbudowanym HTML (dist/). Ścieżki względne do repo.
// Wynik: tabela na rodzaj (strony, strony z blokiem, linki), linki do siebie, linki bez pliku w dist.
import fs from 'node:fs';
import path from 'node:path';

const DIST = process.argv[2] || 'dist';
const RODZAJE = { 'baza-wiedzy': 'article', portfolio: 'caseStudy', branza: 'industry' };
const wiersze = [];
let doSiebie = 0;
let bezPliku = 0;
let pustaSekcja = 0;
const przyklady = [];
for (const [kat, typ] of Object.entries(RODZAJE)) {
  const dir = path.join(DIST, kat);
  if (!fs.existsSync(dir)) continue;
  let strony = 0;
  let zBlokiem = 0;
  let linki = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const plik = path.join(dir, e.name, 'index.html');
    if (!fs.existsSync(plik)) continue;
    strony += 1;
    const html = fs.readFileSync(plik, 'utf8');
    const m = /<section[^>]*data-powiazane="(\d+)"[^>]*>([\s\S]*?)<\/section>/.exec(html);
    if (!m) continue;
    zBlokiem += 1;
    const hrefs = [...m[2].matchAll(/<a[^>]*href="([^"]+)"/g)].map((x) => x[1]);
    if (hrefs.length === 0) pustaSekcja += 1;
    if (Number(m[1]) !== hrefs.length) pustaSekcja += 1;
    linki += hrefs.length;
    const self = `/${kat}/${e.name}/`;
    for (const h of hrefs) {
      if (h === self) doSiebie += 1;
      if (!fs.existsSync(path.join(DIST, h, 'index.html'))) bezPliku += 1;
    }
    if (przyklady.filter((p) => p.startsWith(typ)).length < 2)
      przyklady.push(`${typ} ${self} -> ${hrefs.length}: ${hrefs.join(' ')}`);
  }
  wiersze.push({ typ, strony, zBlokiem, linki });
}
console.log('| rodzaj | strony | z blokiem | linki |');
for (const w of wiersze) console.log(`| ${w.typ} | ${w.strony} | ${w.zBlokiem} | ${w.linki} |`);
const suma = wiersze.reduce((a, w) => ({ s: a.s + w.zBlokiem, l: a.l + w.linki }), { s: 0, l: 0 });
console.log(
  `RAZEM strony z blokiem=${suma.s} linki=${suma.l} doSiebie=${doSiebie} bezPliku=${bezPliku} niespojne=${pustaSekcja}`,
);
for (const p of przyklady) console.log(`PRZYKLAD ${p}`);
process.exitCode = doSiebie || bezPliku || pustaSekcja ? 1 : 0;
