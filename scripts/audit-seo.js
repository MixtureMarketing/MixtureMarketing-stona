import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { routes } from '../routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const REPORT_PATH = path.resolve(__dirname, '../seo-report.json');

function getAllHtmlFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllHtmlFiles(fullPath, arrayOfFiles);
    } else if (file === 'index.html') {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

async function runSeoAudit() {
  console.log('🚀 Starting Technical SEO & Data Audit...');

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Error: dist/ directory not found. Run npm run build first.');
    process.exit(1);
  }

  const results = {};
  const allInternalLinks = new Set();
  const htmlFiles = getAllHtmlFiles(DIST_DIR);

  console.log(`🔍 Found ${htmlFiles.length} pages to audit.`);

  for (const filePath of htmlFiles) {
    const route = filePath
      .replace(DIST_DIR, '')
      .replace(/\\/g, '/')
      .replace(/\/index\.html$/, '') || '/';

    const html = fs.readFileSync(filePath, 'utf8');
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const audit = {
      title: {
        text: doc.querySelector('title')?.textContent || 'MISSING',
        length: doc.querySelector('title')?.textContent.length || 0,
      },
      description: {
        text: doc.querySelector('meta[name="description"]')?.getAttribute('content') || 'MISSING',
        length: doc.querySelector('meta[name="description"]')?.getAttribute('content')?.length || 0,
      },
      h1: {
        count: doc.querySelectorAll('h1').length,
        text: Array.from(doc.querySelectorAll('h1')).map((h) => h.textContent.trim()),
      },
      canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || 'MISSING',
      og: {
        title: doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || 'MISSING',
        description:
          doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
          'MISSING',
        image: doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || 'MISSING',
      },
      jsonLd: Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).map(
        (script) => {
          try {
            return JSON.parse(script.textContent);
          } catch (e) {
            return { error: 'Invalid JSON-LD' };
          }
        },
      ),
      links: Array.from(doc.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href'))
        .filter((href) => href.startsWith('/') || href.startsWith('https://mixturemarketing.pl')),
    };

    // Collect all internal links for broken link check
    audit.links.forEach((l) => allInternalLinks.add(l.replace('https://mixturemarketing.pl', '')));

    results[route] = audit;
  }

  // Broken Link Check
  const brokenLinks = [];
  const normalizedRoutes = routes.map((r) => (r === '/' ? '/' : r.replace(/\/$/, '')));

  allInternalLinks.forEach((link) => {
    const cleanLink = link.split('#')[0].split('?')[0].replace(/\/$/, '');
    if (cleanLink && !normalizedRoutes.includes(cleanLink === '' ? '/' : cleanLink)) {
      // Double check if it might be a static file
      if (!fs.existsSync(path.join(DIST_DIR, cleanLink))) {
        brokenLinks.push(link);
      }
    }
  });

  const auditedRoutes = Object.keys(results);
  const finalOutput = {
    pages: results,
    summary: {
      totalPages: auditedRoutes.length,
      brokenLinks: [...new Set(brokenLinks)],
      missingTitles: auditedRoutes.filter((r) => results[r] && results[r].title?.text === 'MISSING')
        .length,
      missingDescriptions: auditedRoutes.filter(
        (r) => results[r] && results[r].description?.text === 'MISSING',
      ).length,
      missingH1: auditedRoutes.filter((r) => results[r] && results[r].h1?.count === 0).length,
      multipleH1: auditedRoutes.filter((r) => results[r] && results[r].h1?.count > 1).length,
    },
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(finalOutput, null, 2));

  console.log('\n📊 Audit Summary:');
  console.log(`- Pages scanned: ${finalOutput.summary.totalPages}`);
  console.log(`- Missing Titles: ${finalOutput.summary.missingTitles}`);
  console.log(`- Missing Descriptions: ${finalOutput.summary.missingDescriptions}`);
  console.log(`- Broken Internal Links: ${finalOutput.summary.brokenLinks.length}`);
  console.log(`- Pages with multiple H1: ${finalOutput.summary.multipleH1}`);

  if (finalOutput.summary.brokenLinks.length > 0) {
    console.log('\n⚠️ Broken links detected:', finalOutput.summary.brokenLinks);
  }

  console.log(`\n✅ Detailed report saved to: ${REPORT_PATH}`);
}

runSeoAudit();
