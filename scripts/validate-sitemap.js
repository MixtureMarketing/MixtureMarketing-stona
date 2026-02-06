import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITEMAP_PATH = path.resolve(__dirname, '../public/sitemap.xml');

function validateSitemap() {
  console.log('🔍 Validating sitemap.xml...');

  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error('❌ Error: sitemap.xml not found in public directory!');
    process.exit(1);
  }

  const content = fs.readFileSync(SITEMAP_PATH, 'utf-8');

  // Basic XML structure check
  if (
    !content.startsWith('<?xml') ||
    !content.includes('<urlset') ||
    !content.includes('</urlset>')
  ) {
    console.error('❌ Error: sitemap.xml is not a valid XML or missing <urlset> tag.');
    process.exit(1);
  }

  // Count links
  const urlCount = (content.match(/<url>/g) || []).length;
  console.log(`📊 Sitemap contains ${urlCount} URLs.`);

  if (urlCount < 10) {
    console.error('❌ Error: Sitemap contains suspiciously few URLs. Check route generation.');
    process.exit(1);
  }

  // Check for common placeholders
  if (content.includes('localhost') || content.includes('example.com')) {
    console.error('❌ Error: Sitemap contains placeholder URLs (localhost/example.com).');
    process.exit(1);
  }

  console.log('✅ Sitemap validation successful!');
}

validateSitemap();
