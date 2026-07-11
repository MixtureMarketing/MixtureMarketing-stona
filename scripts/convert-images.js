import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '../public/assets/images');
// Manifest hashy zrodel — skip oparty na TRESCI, nie na mtime.
// Powod: `git checkout` w CI resetuje mtime, wiec porownanie mtime zawsze
// wymuszalo re-konwersje wszystkich obrazow (najwiekszy ukryty koszt builda).
// webp/avif sa commitowane, wiec przy niezmienionych zrodlach CI pomija je od razu.
const MANIFEST_PATH = path.join(__dirname, '.image-manifest.json');

function md5(filePath) {
  return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
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

    const srcHash = md5(filePath);

    // Skip: hash zrodla sie zgadza I oba warianty istnieja.
    if (manifest[file] === srcHash && fs.existsSync(webpPath) && fs.existsSync(avifPath)) {
      skipped++;
      continue;
    }

    console.log(`Processing: ${file}`);
    processed++;

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
