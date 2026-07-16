/**
 * Próbkuje SVG sygnetu do siatki kropek (jak buildForm w mixtureEngine, ale
 * BUILD-TIME → JSON) na potrzeby bookendu strony głównej: mini-konstelacja
 * zbiega się z rozsypki na var(--p) bez żadnego runtime'owego samplowania.
 * Rozsypka deterministyczna (hash jak w silniku) — spoczynek zawsze identyczny.
 *
 * Użycie: node scripts/generate-sygnet-dots.mjs
 * Wyjście: data/content/sygnet-dots.json  { vb: [w,h], dots: [[x,y,w,sx,sy]] }
 */
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const SRC = 'public/assets/images/sygnet-mixture-marketing-fioletowe.svg';
const OUT = 'data/content/sygnet-dots.json';
const COLS = 24;
const ASPECT = 659.5 / 779.22; // viewBox sygnetu (w/h)
const ROWS = Math.round(COLS / ASPECT);
const VB = [100, Math.round(100 / ASPECT)];

const hash = (x, y) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const { data, info } = await sharp(SRC)
  .resize(COLS, ROWS, { fit: 'fill' })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const r1 = (n) => Math.round(n * 10) / 10;
const dots = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const w = data[(r * COLS + c) * info.channels + 3] / 255;
    if (w < 0.14) continue; // ten sam próg co konstelacja hero
    const x = ((c + 0.5) / COLS) * VB[0];
    const y = ((r + 0.5) / ROWS) * VB[1];
    const ang = hash(c * 3 + 1, r * 5 + 2) * Math.PI * 2;
    const dist = 14 + hash(c + 11, r + 29) * 26;
    dots.push([r1(x), r1(y), r1(w), r1(Math.cos(ang) * dist), r1(Math.sin(ang) * dist)]);
  }
}

writeFileSync(OUT, JSON.stringify({ vb: VB, dots }) + '\n');
console.log(`OK ${OUT} — ${dots.length} kropek (siatka ${COLS}×${ROWS})`);
