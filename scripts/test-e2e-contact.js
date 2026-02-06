import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4174;
const URL = `http://localhost:${PORT}/contact`;

async function runTest() {
  console.log('🚀 Starting E2E Contact Form Test...');

  const server = spawn('npm', ['run', 'preview', '--', '--port', PORT.toString()], {
    stdio: 'ignore',
    shell: true,
    detached: true,
  });

  await new Promise((resolve) => setTimeout(resolve, 5000));

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );

    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (request.url().includes('/api/contact_submit')) {
        console.log('Intercepted API call:', request.postData());
        request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'success' }),
        });
      } else {
        request.continue();
      }
    });

    await page.setViewport({ width: 1280, height: 800 });
    console.log(`🌐 Navigating to ${URL}...`);
    await page.goto(URL, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2000));

    console.log('🖱️ Clicking CTA button...');
    try {
      await page.waitForSelector('[data-testid="contact-cta"]', { visible: true, timeout: 15000 });
      await page.click('[data-testid="contact-cta"]');
    } catch (e) {
      console.error('❌ Could not find contact-cta.');
      await page.screenshot({ path: 'test-error.png' });
      throw e;
    }

    console.log('✅ CTA Button clicked. Waiting for modal...');
    await page.waitForSelector('input[name="name"]', { visible: true, timeout: 10000 });

    console.log('📝 Filling Step 1...');
    await page.type('input[name="name"]', 'Test Automatyczny');
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="phone"]', '123456789');

    await page.evaluate(() => {
      const checkbox = document.querySelector('input[name="privacy"]');
      if (checkbox) checkbox.click();
    });

    const nextBtn1 = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find((b) => b.innerText.includes('Zapisz i przejdź dalej'));
    });
    if (nextBtn1) await nextBtn1.asElement().click();

    console.log('📝 Filling Step 2...');
    await new Promise((r) => setTimeout(r, 2000));
    await page.waitForSelector('textarea[name="message"]', { visible: true, timeout: 10000 });
    await page.type('textarea[name="message"]', 'To jest automatyczny test E2E.');

    console.log('🚀 Submitting...');
    const submitBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find((b) => b.innerText.includes('Wyślij zgłoszenie'));
    });
    if (submitBtn) await submitBtn.asElement().click();

    console.log('✅ Verifying success...');
    await page.waitForFunction(() => document.body.innerText.includes('Zgłoszenie wysłane!'), {
      timeout: 15000,
    });
    console.log('🎉 Test Passed: Contact form works!');
  } catch (error) {
    console.error('❌ Test Failed:', error);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
    if (server.pid) {
      try {
        process.kill(-server.pid, 'SIGTERM');
      } catch (e) {
        server.kill();
      }
    }
  }
}

runTest();