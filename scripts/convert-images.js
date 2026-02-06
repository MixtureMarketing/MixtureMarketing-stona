import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '../public/assets/images');
const CONCURRENCY_LIMIT = 4; // Process 4 images at a time

async function processImage(file) {
  const ext = path.extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

  const filePath = path.join(IMAGES_DIR, file);
  const fileName = path.parse(file).name;

  // WebP
  const webpPath = path.join(IMAGES_DIR, `${fileName}.webp`);
  let shouldConvertWebp = true;

  if (fs.existsSync(webpPath)) {
    const srcStat = fs.statSync(filePath);
    const destStat = fs.statSync(webpPath);
    if (srcStat.mtime <= destStat.mtime) {
      shouldConvertWebp = false;
    }
  }

  if (shouldConvertWebp) {
    await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);
    console.log(`  ✅ WebP: ${fileName}.webp`);
  } else {
    console.log(`  ⏩ WebP up to date: ${fileName}.webp`);
  }

  // AVIF
  const avifPath = path.join(IMAGES_DIR, `${fileName}.avif`);
  let shouldConvertAvif = true;

  if (fs.existsSync(avifPath)) {
    const srcStat = fs.statSync(filePath);
    const destStat = fs.statSync(avifPath);
    if (srcStat.mtime <= destStat.mtime) {
      shouldConvertAvif = false;
    }
  }

  if (shouldConvertAvif) {
    await sharp(filePath).avif({ quality: 80 }).toFile(avifPath);
    console.log(`  ✅ AVIF: ${fileName}.avif`);
  } else {
    console.log(`  ⏩ AVIF up to date: ${fileName}.avif`);
  }

  // Optimize Original Fallback (PNG/JPG)
  const stats = fs.statSync(filePath);
  if (stats.size > 1024 * 500) {
    // If original is > 500KB
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
        `  ⚡ Compressed original ${file}: ${(stats.size / 1024 / 1024).toFixed(2)}MB -> ${(newStats.size / 1024 / 1024).toFixed(2)}MB`,
      );
    } else {
      fs.unlinkSync(tempPath);
    }
  }
}

async function convertImages() {
  console.log('🖼️  Starting parallel image conversion...');

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('❌ Images directory not found:', IMAGES_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(IMAGES_DIR);
  const queue = [...files];
  const workers = [];

  const worker = async () => {
    while (queue.length > 0) {
      const file = queue.shift();
      if (file) {
        try {
          await processImage(file);
        } catch (err) {
          console.error(`  ❌ Error processing ${file}:`, err.message);
        }
      }
    }
  };

  // Start parallel workers
  for (let i = 0; i < CONCURRENCY_LIMIT; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  console.log('🎉 Image conversion complete!');
}

convertImages().catch((err) => {
  console.error('❌ Global error in image conversion:', err);
  process.exit(1);
});
