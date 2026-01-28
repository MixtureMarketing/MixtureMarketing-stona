import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { routes } from '../routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = path.resolve(__dirname, '../a11y-report.json');
const PORT = 4173; // Preview server port

async function runAudit() {
  console.log('🔍 Starting Accessibility Audit...');

  // 1. Start the preview server
  console.log('📦 Starting preview server...');
  const server = spawn('npm', ['run', 'preview', '--', '--port', PORT.toString()], {
    stdio: 'inherit',
    shell: true,
  });

  // Give server time to start
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const fullReport = {};

  try {
    const axeCoreSource = fs.readFileSync(
      path.resolve(__dirname, '../node_modules/axe-core/axe.min.js'),
      'utf8',
    );

    for (const route of routes) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });

      const url = `http://localhost:${PORT}${route}`;
      console.log(`📡 Auditing: ${route}`);

      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

        // Wait for app to mount
        await page.waitForSelector('#root');

        // Inject axe-core
        await page.evaluate(axeCoreSource);

        // Run audit
        const results = await page.evaluate(async () => {
          return await window.axe.run();
        });

        if (results.violations.length > 0) {
          fullReport[route] = results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            nodes: v.nodes.length,
            help: v.help,
            helpUrl: v.helpUrl,
          }));
          console.log(`❌ Found ${results.violations.length} violations on ${route}`);
        } else {
          console.log(`✅ ${route} passed audit.`);
        }
      } catch (err) {
        console.error(`❌ Failed to audit ${route}:`, err.message);
      } finally {
        await page.close();
      }
    }

    fs.writeFileSync(REPORT_PATH, JSON.stringify(fullReport, null, 2));
    console.log(`\n🎉 Audit complete! Report saved to: ${REPORT_PATH}`);
  } catch (err) {
    console.error('❌ Audit process failed:', err);
  } finally {
    console.log('🛑 Closing browser and server...');
    await browser.close();
    server.kill();
    process.exit(0);
  }
}

runAudit();
