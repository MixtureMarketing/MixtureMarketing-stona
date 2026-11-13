// Porównuje adresy z public/llms.txt z mapą strony. Użycie:
//   node scripts/check-llms.mjs [--llms=<plik>] [--sitemap=<plik>]
// Wyjście: liczby (adresów, brakujących kluczowych, spoza sitemapy), rc 1 przy jakimkolwiek błędzie.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prerenderOnlyRoutes } from '../routes.js';
import { llmsReport } from './lib/llms.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, def) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? def;
const llmsPath = path.resolve(ROOT, arg('llms', 'public/llms.txt'));
const sitemapPath = path.resolve(ROOT, arg('sitemap', 'public/sitemap.xml'));

let report;
try {
  report = llmsReport(fs.readFileSync(llmsPath, 'utf8'), fs.readFileSync(sitemapPath, 'utf8'), {
    hiddenPaths: prerenderOnlyRoutes,
  });
} catch (e) {
  console.error(`check-llms: BŁĄD odczytu: ${e.message}`);
  process.exit(1);
}
console.log(`llms.txt adresów: ${report.llmsCount}, sitemap: ${report.sitemapCount}`);
console.log(`brakujące kluczowe w llms.txt: ${report.missingKey.length}`);
for (const u of report.missingKey) console.log(`  - ${u}`);
console.log(`adresy llms.txt spoza sitemapy: ${report.notInSitemap.length}`);
for (const u of report.notInSitemap) console.log(`  - ${u}`);
console.log(`ukryte strony wymienione w llms.txt: ${report.hiddenListed.length}`);
for (const u of report.hiddenListed) console.log(`  - ${u}`);
for (const p of report.problems) console.log(`PROBLEM: ${p}`);
for (const u of report.keyNotInSitemap) console.log(`PROBLEM: kluczowa strona poza sitemapą: ${u}`);
console.log(report.ok ? 'llms-check: OK' : 'llms-check: BŁĄD');
process.exit(report.ok ? 0 : 1);
