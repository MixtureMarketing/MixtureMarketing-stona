/**
 * Generator logo do PDF (jednorazowy, uruchamiany ręcznie — NIE w buildzie).
 *
 * jsPDF nie umie SVG — `addImage` przyjmuje raster. Zamiast ręcznego eksportu z Figmy
 * (aset odkleiłby się od repo przy pierwszej zmianie logo) rasteryzujemy `public/assets/
 * images/logo.svg` — to samo źródło, którego używa strona.
 *
 * Uruchomienie: node scripts/logo/build-pdf-logo.mjs
 * Wymaga: sharp (jest w devDependencies — bez nowej zależności).
 *
 * Determinizm jak w build-pdf-font.py: dwa przebiegi muszą dać identyczny plik, inaczej
 * w commicie ląduje szum nie do odróżnienia od zmiany zamierzonej. PNG z sharpa nie ma
 * znacznika czasu, ale `withMetadata()` by go dołożył — dlatego go NIE wołamy.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';

const SRC = 'public/assets/images/logo.svg';
const OUT = 'lib/pdf/logoPng.ts';

// Szerokość docelowa w dokumencie: 32 mm (nagłówek oferty i Karty).
// Raster robimy pod ~600 DPI, żeby logo zostało ostre także po wydruku i po zoomie
// w czytniku: 32 mm / 25.4 * 600 ≈ 756 px. To „@2x" względem typowych 300 DPI druku.
const SZEROKOSC_MM = 32;
const DPI = 600;
const SZEROKOSC_PX = Math.round((SZEROKOSC_MM / 25.4) * DPI);

const svg = readFileSync(SRC);

// `density` steruje rasteryzacją SVG w librsvg — bez tego sharp renderuje w 72 DPI
// i dopiero potem skaluje, co daje rozmyte krawędzie.
const png = await sharp(svg, { density: DPI })
  .resize({ width: SZEROKOSC_PX })
  .png({ compressionLevel: 9, effort: 10 })
  .toBuffer();

const { width, height } = await sharp(png).metadata();
const b64 = png.toString('base64');

mkdirSync('lib/pdf', { recursive: true });
// Złamanie linii po `=` NIE jest kosmetyką: dokładnie tego chce prettier, a `npm run lint`
// blokuje CI. Generator, którego wynik nie przechodzi bramki, jest pułapką na następną osobę,
// która go uruchomi.
writeFileSync(
  OUT,
  '// WYGENEROWANE — nie edytuj ręcznie. Źródło: scripts/logo/build-pdf-logo.mjs\n' +
    `// Rasteryzacja ${SRC} (${DPI} DPI, ${width}×${height} px) — jsPDF nie przyjmuje SVG.\n` +
    '// Ładowane dynamicznie, więc nie wchodzi do głównego bundla (size-limit).\n' +
    'export const LOGO_PNG_B64 =\n' +
    `  'data:image/png;base64,${b64}';\n` +
    '/** Proporcje rastra — renderer liczy z nich wysokość, żeby nigdy nie zniekształcić logo. */\n' +
    `export const LOGO_PROPORCJE = { szerokosc: ${width}, wysokosc: ${height} };\n`,
  { encoding: 'utf-8' },
);

const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
console.log(`  ${OUT}: ${width}×${height} px, ${kb(png.length)} png → ${kb(b64.length)} base64`);
console.log(`  sha256(png) = ${createHash('sha256').update(png).digest('hex').slice(0, 16)}`);
console.log('OK');
