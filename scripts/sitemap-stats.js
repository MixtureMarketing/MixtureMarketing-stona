// Liczby z gotowej mapy witryny (MIX-1266): node scripts/sitemap-stats.js [plik.xml]
// (domyślnie dist/sitemap.xml). Wypisuje JSON: urls, withLastmod, retiredImageFields, imageLocs.
// Fail-closed: brak pliku albo mapa bez adresów = rc 1 z komunikatem.
import fs from 'node:fs';
import path from 'node:path';
import { sitemapStats } from './lib/sitemap.js';

const file = path.resolve(process.argv[2] || 'dist/sitemap.xml');
if (!fs.existsSync(file)) {
  console.error(`❌ sitemap-stats: brak pliku ${file}`);
  process.exit(1);
}
const stats = sitemapStats(fs.readFileSync(file, 'utf8'));
if (stats.urls === 0) {
  console.error(`❌ sitemap-stats: ${file} nie ma żadnego adresu <url>`);
  process.exit(1);
}
console.log(JSON.stringify(stats));
