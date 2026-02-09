import puppeteer from 'puppeteer';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4175;
const URL = `http://localhost:${PORT}/contact`;

async function runTest() {
  console.log('🚀 Starting E2E Contact Form Test...');

  const server = spawn('npm', ['run', 'preview', '--', '--port', PORT.toString()], {
    stdio: 'ignore',
    shell: true,
    detached: true,
  });

  await new Promise((resolve) => setTimeout(resolve, 10000));

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
      await page.waitForSelector('button', { visible: true, timeout: 15000 });
      const ctaBtn = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find((b) =>
          b.getAttribute('data-testid') === 'contact-cta' ||
          b.innerText.toLowerCase().includes('wypełnij brief online')
        );
      });
      if (ctaBtn) {
        const element = ctaBtn.asElement();
        if (element) {
          await element.click();
        } else {
          throw new Error('CTA button handle is not an element');
        }
      } else {
        throw new Error('Could not find contact-cta button');
      }
    } catch (e) {
      console.error('❌ Could not find contact-cta.');
      await page.screenshot({ path: 'test-error.png' });
      const content = await page.content();
      console.log('Page content snippet:', content.substring(0, 1000));
      throw e;
    }

    console.log('✅ CTA Button clicked. Waiting for modal...');
    try {
      await page.waitForSelector('input[name="name"]', { visible: true, timeout: 15000 });
    } catch (e) {
      console.error('❌ Modal Step 1 did not appear.');
      const content = await page.content();
      console.log('Page content snippet:', content.substring(0, 1000));
      await page.screenshot({ path: 'test-error-step1.png' });
      throw e;
    }

    console.log('📝 Filling Step 1...');
    await page.type('input[name="name"]', 'Test Automatyczny');
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="phone"]', '123456789');

    await page.evaluate(() => {
      const checkbox = document.querySelector('input[name="privacy"]');
      if (checkbox) checkbox.click();
    });

    console.log('🖱️ Clicking Next to Step 2...');
    const nextBtn1 = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find((b) => b.innerText.toLowerCase().includes('zapisz i przejdź dalej'));
    });
    if (nextBtn1) {
      await nextBtn1.asElement().click();
    } else {
      throw new Error('Could not find button "Zapisz i przejdź dalej"');
    }

    console.log('📝 Filling Step 2...');
    await new Promise((r) => setTimeout(r, 2000));
    try {
      await page.waitForSelector('input[name="website"]', { visible: true, timeout: 15000 });
    } catch (e) {
      console.error('❌ Modal Step 2 did not appear.');
      await page.screenshot({ path: 'test-error-step2.png' });
      throw e;
    }
    
    await page.type('input[name="website"]', 'https://mixturemarketing.pl');
    
    console.log('🖱️ Clicking Next to Step 3...');
    const nextBtn2 = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find((b) => b.innerText.toLowerCase().includes('dalej'));
    });
    if (nextBtn2) {
      await nextBtn2.asElement().click();
    } else {
      throw new Error('Could not find button "Dalej"');
    }

    console.log('📝 Filling Step 3...');
    await new Promise((r) => setTimeout(r, 2000));
    try {
      await page.waitForSelector('textarea[name="message"]', { visible: true, timeout: 15000 });
    } catch (e) {
      console.error('❌ Modal Step 3 did not appear.');
      await page.screenshot({ path: 'test-error-step3.png' });
      throw e;
    }
    await page.type('textarea[name="message"]', 'To jest automatyczny test E2E.');

    console.log('🚀 Submitting...');
    const submitBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find((b) => b.innerText.toLowerCase().includes('wyślij zgłoszenie'));
    });
    if (submitBtn) {
      await submitBtn.asElement().click();
    } else {
      throw new Error('Could not find button "Wyślij zgłoszenie"');
    }

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
