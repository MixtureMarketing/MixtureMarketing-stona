/**
 * Generator rastra halftone dla dowodów (kierunek „warsztat + wyspy kropek").
 * BUILD-TIME z rozmysłem: liczenie rastra per piksel w runtime na telefonie
 * odpadło w ocenie kierunku — tu raz powstaje statyczny asset (webp), a strona
 * tylko krzyżuje go z ostrym zrzutem na --p (spoczynek = ostry dowód).
 *
 * Użycie: node scripts/generate-halftone.mjs <src> <out> [step-px]
 * np. node scripts/generate-halftone.mjs \
 *   public/assets/images/realizacje/driftmark-sklep-home.webp \
 *   public/assets/images/realizacje/driftmark-sklep-home-halftone.webp 12
 */
import sharp from 'sharp';

const args = process.argv.slice(2).filter((a) => a !== '--invert');
/**
 * --invert: rastruj TUSZ, nie papier — dla JASNYCH zrzutów (UI na bieli).
 * Bez inwersji jasne źródło daje kropkę w niemal każdej komórce (ściana
 * rastra, ~0.5 MB webp); z inwersją świecą ciemne elementy interfejsu —
 * szkielet layoutu na granacie, plik rzędu dziesiątek kB.
 */
const INVERT = process.argv.includes('--invert');
const [src, out, stepArg] = args;
if (!src || !out) {
  console.error('Użycie: node scripts/generate-halftone.mjs <src> <out> [step-px] [--invert]');
  process.exit(1);
}
const STEP = Number(stepArg) || 12;

/** Tło rastra = granat sekcji ciemnych (--color-deep-dark). */
const BG = '#0b1120';
/** Rampa koloru kropki po luminancji: cień → Błękit Mixture → rozbłysk. */
const RAMP = [
  [43, 91, 119], // ciemny słonecznik błękitu — cienie
  [97, 182, 222], // #61b6de — środek
  [186, 224, 246], // światła (rodzina WAVE ze sceny hero)
];

const mix = (l) => {
  const t = l < 0.5 ? l * 2 : (l - 0.5) * 2;
  const [a, b] = l < 0.5 ? [RAMP[0], RAMP[1]] : [RAMP[1], RAMP[2]];
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
};

const meta = await sharp(src).metadata();
const W = meta.width;
const H = meta.height;
const cols = Math.round(W / STEP);
const rows = Math.round(H / STEP);

const { data } = await sharp(src)
  .resize(cols, rows, { fit: 'fill' })
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true });

let circles = '';
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const lum = INVERT ? 1 - data[r * cols + c] / 255 : data[r * cols + c] / 255;
    // Gamma 0.85 podbija światła — raster czyta sylwetkę layoutu, nie mrok.
    const rad = Math.pow(lum, 0.85) * STEP * 0.46;
    if (rad < 0.6) continue;
    circles += `<circle cx="${(c + 0.5) * STEP}" cy="${(r + 0.5) * STEP}" r="${rad.toFixed(1)}" fill="${mix(lum)}"/>`;
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="${BG}"/>${circles}</svg>`;

await sharp(Buffer.from(svg)).webp({ quality: 78 }).toFile(out);
const kb = (await sharp(out).metadata()).size;
console.log(
  `OK ${out} — siatka ${cols}×${rows}, step ${STEP}px${kb ? `, ${Math.round(kb / 1024)} kB` : ''}`,
);
