// Strażnik public/llms.txt (MIX-1657): gramatyka linii, sitemap, strony ukryte. Użycie:
//   node scripts/check-llms.mjs [--llms=<plik>] [--sitemap=<plik>]
// Wyjście: liczby i linie PROBLEM; rc 0 tylko przy „llms-check: OK”, rc 1 przy każdym błędzie
// (także nieczytelny plik albo brak listy stron ukrytych). Wołany w CI po buildzie (npm run audit:llms).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { llmsReport } from './lib/llms.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, def) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? def;
const llmsPath = path.resolve(ROOT, arg('llms', 'public/llms.txt'));
const sitemapPath = path.resolve(ROOT, arg('sitemap', 'public/sitemap.xml'));

let report;
try {
  const { prerenderOnlyRoutes } = await import('../routes.js');
  report = llmsReport(fs.readFileSync(llmsPath, 'utf8'), fs.readFileSync(sitemapPath, 'utf8'), {
    hiddenPaths: prerenderOnlyRoutes,
  });
} catch (e) {
  console.error(`check-llms: BŁĄD odczytu: ${String(e?.message ?? e).slice(0, 200)}`);
  console.log('llms-check: BŁĄD');
  process.exit(1);
}
console.log(`llms.txt adresów: ${report.llmsCount}, sitemap: ${report.sitemapCount}`);
console.log(`brakujące kluczowe w llms.txt: ${report.missingKey.length}`);
for (const u of report.missingKey) console.log(`  - ${u}`);
console.log(`adresy llms.txt spoza sitemapy: ${report.notInSitemap.length}`);
console.log(`ukryte strony wymienione w llms.txt: ${report.hiddenListed.length}`);
for (const p of report.problems.slice(0, 50)) console.log(`PROBLEM: ${p}`);
if (report.problems.length > 50) console.log(`PROBLEM: … i ${report.problems.length - 50} więcej`);
for (const u of report.keyNotInSitemap) console.log(`PROBLEM: kluczowa strona poza sitemapą: ${u}`);
console.log(report.ok ? 'llms-check: OK' : 'llms-check: BŁĄD');
process.exit(report.ok ? 0 : 1);
