// Bramka SEO po prerenderze: <title> <= 60 znaków, alt na każdym <img>, lastmod na każdym
// adresie sitemap.xml. Użycie: node scripts/seo-gate.js [katalog dist] (domyślnie ./dist).
// Wpięta w `npm run build` (po prerenderze); exit 1 + lista problemów.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditDist } from './lib/seo-checks.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.resolve(process.argv[2] || path.join(root, 'dist'));

if (!fs.existsSync(dist)) {
  console.error(`❌ seo-gate: brak katalogu ${dist} (najpierw npm run build)`);
  process.exit(1);
}

const { pages, problems } = auditDist(dist);
if (problems.length > 0) {
  console.error(`❌ seo-gate: ${problems.length} problemów na ${pages} stronach:`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`✅ seo-gate: ${pages} stron — title <= 60, alt na każdym <img>, lastmod w sitemap`);
