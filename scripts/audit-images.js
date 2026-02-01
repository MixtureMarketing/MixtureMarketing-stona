import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const IMAGES_DIR = path.resolve(ROOT_DIR, 'public/assets/images');
const SOURCE_DIR = path.resolve(ROOT_DIR, 'components');

const imageFiles = fs
  .readdirSync(IMAGES_DIR)
  .filter((file) =>
    ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.avif'].includes(path.extname(file).toLowerCase()),
  );

console.log(`🔎 Found ${imageFiles.length} images in assets.`);

const usedImages = new Set();

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (['.tsx', '.ts', '.js', '.json'].includes(path.extname(file))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      for (const img of imageFiles) {
        if (content.includes(img)) {
          usedImages.add(img);
        }
      }
    }
  }
}

console.log('🚀 Scanning components and content for image usage...');
scanDir(SOURCE_DIR);
scanDir(path.resolve(ROOT_DIR, 'data'));

const unusedImages = imageFiles.filter((img) => !usedImages.has(img));

if (unusedImages.length > 0) {
  console.log('\n❌ Unused Images detected:');
  unusedImages.forEach((img) => console.log(` - ${img}`));
  console.log(`\n💰 Total potential saving: ${unusedImages.length} files.`);
} else {
  console.log('\n✨ No unused images found! All assets are clean.');
}
