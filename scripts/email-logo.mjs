/**
 * Logo do maili (MIX-1866): PNG z public/assets/images/logo.svg, białe (nagłówek maila jest
 * granatowy #0b1120). Gmail i Outlook nie pokazują SVG, więc mail ładuje PNG z domeny strony:
 * https://mixturemarketing.pl/assets/email/logo-mixture-white.png (300 px = 2× szerokości 150 px).
 *
 * Uruchom: node scripts/email-logo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'public/assets/images/logo.svg');
const OUT = path.join(ROOT, 'public/assets/email/logo-mixture-white.png');

const svg = fs.readFileSync(SRC, 'utf8').replace(/fill:#3f3d91/gi, 'fill:#ffffff');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const info = await sharp(Buffer.from(svg), { density: 300 })
  .resize({ width: 300 })
  .png({ compressionLevel: 9 })
  .toFile(OUT);
console.log(`LOGO ${path.relative(ROOT, OUT)} ${info.width}x${info.height} ${info.size} B`);
