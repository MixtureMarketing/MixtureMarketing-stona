import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import { routes } from '../routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = path.resolve(__dirname, '../health-report.json');
const PORT = 4173;

async function runHealthCheck() {
  console.log('🛡️ Starting Site Health Audit (Smoke Test)...');

  const server = spawn('npm', ['run', 'preview', '--', '--port', PORT.toString()], {
    stdio: 'ignore',
    shell: true,
  });

  await new Promise((resolve) => setTimeout(resolve, 3000));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const fullReport = {
    timestamp: new Date().toISOString(),
    errors: [],
    success: [],
  };

  try {
    for (const route of routes) {
      const page = await browser.newPage();
      const consoleErrors = [];

      page.on('console', async (msg) => {
        if (msg.type() === 'error') {
          const args = await Promise.all(
            msg.args().map(async (arg) => {
              try {
                const errorDetails = await arg.evaluate((obj) => {
                  if (obj instanceof Error) {
                    return obj.message + (obj.stack ? '\n' + obj.stack : '');
                  }
                  return JSON.stringify(obj, null, 2); // Better serialization
                });
                return errorDetails !== undefined ? errorDetails : String(arg); // Fallback to handle string
              } catch (e) {
                return 'Unserializable Error Argument';
              }
            }),
          );

          const text = args.join(' ');

          // Filter out network noise but keep application errors
          if (
            text &&
            !text.includes('Failed to load resource') &&
            !text.includes('chrome-extension') &&
            !text.includes('ERR_BLOCKED_BY_CLIENT')
          ) {
            consoleErrors.push(text);
          }
        }
      });

      page.on('pageerror', (err) => {
        consoleErrors.push(err.message + (err.stack ? `\nStack: ${err.stack}` : ''));
      });

      const url = `http://localhost:${PORT}${route}`;
      console.log(`🚀 Checking: ${route}`);

      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

        const bodyText = await page.evaluate(() => document.body.innerText);
        const hasErrorUI =
          bodyText.toLowerCase().includes('coś poszło nie tak') && bodyText.length < 500;

        if (consoleErrors.length > 0 || hasErrorUI) {
          fullReport.errors.push({ route, errors: consoleErrors });
          console.log(`❌ Issues detected on ${route}`);
        } else {
          fullReport.success.push(route);
          console.log(`✅ ${route} is healthy.`);
        }
      } catch (err) {
        fullReport.errors.push({ route, errors: [err.message] });
      } finally {
        await page.close();
      }
    }

    fs.writeFileSync(REPORT_PATH, JSON.stringify(fullReport, null, 2));

    console.log('\n📊 Health Summary:');
    console.log(`- Healthy: ${fullReport.success.length}`);
    console.log(`- Broken: ${fullReport.errors.length}`);
  } catch (err) {
    console.error('❌ Failed:', err);
  } finally {
    await browser.close();
    server.kill();
    process.exit(fullReport.errors.length > 0 ? 1 : 0);
  }
}

runHealthCheck();
