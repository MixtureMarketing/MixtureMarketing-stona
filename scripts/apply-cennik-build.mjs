// MIX-1855: krok budowy po `vite build` (package.json „build”). Tylko przy VITE_MM_CENNIK=1:
//   - zdejmuje z dist/_redirects reguly /cennik i /cennik/ (301 na /offers/), bo /cennik/ jest strona,
//   - dopisuje /cennik/ do dist/llms.txt.
// Przy wylaczonym przelaczniku nie czyta ani nie zapisuje zadnego pliku (dist bez zmian co do bajta).
// Sitemap (scripts/generate-sitemap.js) i prerender biora /cennik/ z routes.js (ten sam przelacznik).
// Przelacznik czytany ze srodowiska procesu (CI podaje go wprost, jak dla routes.js).
// Uzycie: node scripts/apply-cennik-build.mjs [--dist=<katalog>]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { addCennikToLlms, stripCennikRedirects } from './lib/cennikBuild.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = process.argv.find((a) => a.startsWith('--dist='))?.slice('--dist='.length);
const DIST = path.resolve(ROOT, arg ?? 'dist');

if (process.env.VITE_MM_CENNIK !== '1') {
  console.log('cennik: przelacznik VITE_MM_CENNIK wylaczony, dist bez zmian');
  process.exit(0);
}

try {
  const redirects = path.join(DIST, '_redirects');
  const llms = path.join(DIST, 'llms.txt');
  const newRedirects = stripCennikRedirects(fs.readFileSync(redirects, 'utf8'));
  const newLlms = addCennikToLlms(fs.readFileSync(llms, 'utf8'));
  fs.writeFileSync(redirects, newRedirects);
  fs.writeFileSync(llms, newLlms);
  console.log('cennik: dist/_redirects bez regul /cennik, dist/llms.txt z linia /cennik/');
} catch (e) {
  console.error(`cennik: BLAD: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
}
