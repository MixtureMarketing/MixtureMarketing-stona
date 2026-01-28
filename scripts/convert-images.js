import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '../public/assets/images');

async function convertImages() {
  console.log('🖼️  Starting image conversion...');

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('❌ Images directory not found:', IMAGES_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(IMAGES_DIR);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const filePath = path.join(IMAGES_DIR, file);
      const fileName = path.parse(file).name;

      console.log(`Processing: ${file}`);

      // WebP
      const webpPath = path.join(IMAGES_DIR, `${fileName}.webp`);
      let shouldConvertWebp = true;

      if (fs.existsSync(webpPath)) {
        const srcStat = fs.statSync(filePath);
        const destStat = fs.statSync(webpPath);
        if (srcStat.mtime <= destStat.mtime) {
          shouldConvertWebp = false;
          console.log(`  ⏩ WebP up to date, skipping: ${fileName}.webp`);
        }
      }

      if (shouldConvertWebp) {
        await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);
        console.log(`  ✅ Created/Updated WebP: ${fileName}.webp`);
      }

      // AVIF
      const avifPath = path.join(IMAGES_DIR, `${fileName}.avif`);
      let shouldConvertAvif = true;

      if (fs.existsSync(avifPath)) {
        const srcStat = fs.statSync(filePath);
        const destStat = fs.statSync(avifPath);
        if (srcStat.mtime <= destStat.mtime) {
          shouldConvertAvif = false;
          console.log(`  ⏩ AVIF up to date, skipping: ${fileName}.avif`);
        }
      }

      if (shouldConvertAvif) {
        await sharp(filePath).avif({ quality: 80 }).toFile(avifPath);
        console.log(`  ✅ Created/Updated AVIF: ${fileName}.avif`);
      }
    }
  }

  console.log('🎉 Image conversion complete!');
}

convertImages().catch((err) => {
  console.error('❌ Error converting images:', err);
  process.exit(1);
});
