import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

const PORT = 4173;
const HOST = `http://localhost:${PORT}`;

async function checkExternalRequests() {
  console.log('🚀 Starting External Request Audit...');

  // 1. Start the preview server
  const server = spawn('npm', ['run', 'preview', '--', '--port', PORT.toString()], {
    shell: true,
    stdio: 'pipe',
  });

  // Wait for server to be ready
  await new Promise((resolve) => setTimeout(resolve, 3000));

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox'],
    });

    const page = await browser.newPage();
    const externalRequests = new Map(); // URL -> Type

    await page.setRequestInterception(true);

    page.on('request', (req) => {
      const url = req.url();
      const resourceType = req.resourceType();

      // Filter out local requests and data: uris
      if (!url.includes('localhost') && !url.includes('127.0.0.1') && !url.startsWith('data:')) {
        externalRequests.set(url, resourceType);
      }

      req.continue();
    });

    console.log(`📡 Scanning ${HOST}...`);
    await page.goto(HOST, { waitUntil: 'networkidle0' });

    // Scan a subpage too, just in case
    console.log(`📡 Scanning ${HOST}/contact...`);
    await page.goto(`${HOST}/contact`, { waitUntil: 'networkidle0' });

    console.log('\n📊 External Requests Report:');
    if (externalRequests.size === 0) {
      console.log(
        '✅ GREAT JOB! No external requests detected. Your site is fully self-contained (Static).',
      );
    } else {
      console.log(`⚠️  Detected ${externalRequests.size} external requests:`);
      externalRequests.forEach((type, url) => {
        console.log(`- [${type.toUpperCase()}] ${url}`);
      });
    }
  } catch (error) {
    console.error('❌ Error during audit:', error);
  } finally {
    if (browser) await browser.close();
    server.kill(); // Kill the server
    process.exit(0);
  }
}

checkExternalRequests();
