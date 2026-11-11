// Odświeża data/seo/lastmod.json (realne daty zmian stron statycznych z gita).
// Użycie: npm run lastmod   (wymaga pełnej historii gita; wynik commitujemy).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { routes } from '../routes.js';
import { computeLastmods } from './lib/lastmod.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'data/seo/lastmod.json');

const lastmods = computeLastmods(root, routes);
const missing = Object.entries(lastmods)
  .filter(([, d]) => !d)
  .map(([r]) => r);
if (missing.length > 0) {
  console.error(
    `❌ Brak daty zmiany (komponent w routes.tsx / historia gita) dla: ${missing.join(', ')}`,
  );
  process.exit(1);
}
fs.writeFileSync(out, `${JSON.stringify(lastmods, null, 2)}\n`);
console.log(`Zapisano ${Object.keys(lastmods).length} dat do ${path.relative(root, out)}`);
