import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'public/assets/images');
// Manifest hashy zrodel — skip oparty na TRESCI, nie na mtime.
// Powod: `git checkout` w CI resetuje mtime, wiec porownanie mtime zawsze
// wymuszalo re-konwersje wszystkich obrazow (najwiekszy ukryty koszt builda).
// webp/avif sa commitowane, wiec przy niezmienionych zrodlach CI pomija je od razu.
const MANIFEST_PATH = path.join(__dirname, '.image-manifest.json');

// Warianty szerokosci dla <picture srcset> (components/common/Image.tsx). Zrodla maja
// ~2752 px, a sloty w layoucie 80–1000 px — bez wariantow miniatura 80×64 pobierala
// pelny plik. MUSI byc zgodne z config/responsiveImages.ts (pilnuje tego test).
const RESPONSIVE_WIDTHS = [480, 960, 1600];
// AVIF q80 bywal WIEKSZY niz WebP (np. 539 vs 326 kB) — przy q50 jest ~10× mniejszy
// przy niezauwazalnej roznicy na ilustracjach. effort 4 = rozsadny czas buildu.
const VARIANT_AVIF = { quality: 50, effort: 4 };
const VARIANT_WEBP = { quality: 75 };

// Warianty generujemy TYLKO dla obrazow, do ktorych kod faktycznie sie odwoluje
// (`/assets/images/<plik>` w zrodlach) — nieuzywane pliki nie puchna w repo.
const SOURCE_DIRS = ['components', 'data', 'services', 'config', 'hooks', 'utils'];
const SOURCE_EXT = /\.(tsx?|jsx?|css)$/;

function md5(filePath) {
  return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
}

function referencedImages() {
  const refs = new Set();
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (SOURCE_EXT.test(e.name)) {
        const src = fs.readFileSync(p, 'utf8');
        for (const m of src.matchAll(/\/assets\/images\/([A-Za-z0-9_.-]+\.(?:png|jpe?g))/gi)) {
          refs.add(m[1]);
        }
      }
    }
  };
  for (const d of SOURCE_DIRS) {
    const dir = path.join(ROOT, d);
    if (fs.existsSync(dir)) walk(dir);
  }
  return refs;
}

const variantPaths = (fileName) =>
  RESPONSIVE_WIDTHS.flatMap((w) => [
    path.join(IMAGES_DIR, `${fileName}-${w}.avif`),
    path.join(IMAGES_DIR, `${fileName}-${w}.webp`),
  ]);

async function writeVariants(filePath, fileName) {
  for (const w of RESPONSIVE_WIDTHS) {
    const base = sharp(filePath).resize({ width: w, withoutEnlargement: true });
    await base.clone().avif(VARIANT_AVIF).toFile(path.join(IMAGES_DIR, `${fileName}-${w}.avif`));
    await base.clone().webp(VARIANT_WEBP).toFile(path.join(IMAGES_DIR, `${fileName}-${w}.webp`));
  }
  console.log(`  ✅ Warianty ${RESPONSIVE_WIDTHS.join('/')} px: ${fileName}-<w>.avif|webp`);
}

async function convertImages() {
  console.log('🖼️  Starting image conversion...');

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('❌ Images directory not found:', IMAGES_DIR);
    process.exit(1);
  }

  let manifest = {};
  try {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch {
    /* brak manifestu = pierwszy przebieg */
  }

  const referenced = referencedImages();
  const files = fs.readdirSync(IMAGES_DIR);
  let skipped = 0;
  let processed = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const filePath = path.join(IMAGES_DIR, file);
    const fileName = path.parse(file).name;
    const webpPath = path.join(IMAGES_DIR, `${fileName}.webp`);
    const avifPath = path.join(IMAGES_DIR, `${fileName}.avif`);
    const wantVariants = referenced.has(file);
    const variantsMissing = wantVariants && variantPaths(fileName).some((p) => !fs.existsSync(p));

    const srcHash = md5(filePath);
    const unchanged =
      manifest[file] === srcHash && fs.existsSync(webpPath) && fs.existsSync(avifPath);

    // Skip: hash zrodla sie zgadza I wszystkie warianty istnieja.
    if (unchanged && !variantsMissing) {
      skipped++;
      continue;
    }

    console.log(`Processing: ${file}`);
    processed++;

    // Zrodlo bez zmian, brakuje tylko wariantow szerokosci → nie ruszamy plikow bazowych.
    if (unchanged) {
      await writeVariants(filePath, fileName);
      continue;
    }

    await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);
    console.log(`  ✅ WebP: ${fileName}.webp`);

    await sharp(filePath).avif({ quality: 80 }).toFile(avifPath);
    console.log(`  ✅ AVIF: ${fileName}.avif`);

    // Optymalizacja oryginalu (fallback PNG/JPG) tylko dla >500KB.
    const stats = fs.statSync(filePath);
    if (stats.size > 1024 * 500) {
      console.log(`  ⚡ Optimizing original fallback: ${file}`);
      const tempPath = path.join(IMAGES_DIR, `temp_${file}`);
      const sharpInstance = sharp(filePath);
      if (ext === '.png') {
        await sharpInstance.png({ quality: 80, palette: true }).toFile(tempPath);
      } else {
        await sharpInstance.jpeg({ quality: 80, progressive: true }).toFile(tempPath);
      }
      const newStats = fs.statSync(tempPath);
      if (newStats.size < stats.size) {
        fs.renameSync(tempPath, filePath);
        console.log(
          `  ✅ Compressed ${file}: ${(stats.size / 1024 / 1024).toFixed(2)}MB -> ${(newStats.size / 1024 / 1024).toFixed(2)}MB`,
        );
      } else {
        fs.unlinkSync(tempPath);
      }
    }

    if (wantVariants) await writeVariants(filePath, fileName);

    // Zapisz hash AKTUALNEGO zrodla (moglo sie zmienic przez fallback-optymalizacje).
    manifest[file] = md5(filePath);
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`🎉 Image conversion complete! (przetworzone: ${processed}, pominiete: ${skipped})`);
}

convertImages().catch((err) => {
  console.error('❌ Error converting images:', err);
  process.exit(1);
});
