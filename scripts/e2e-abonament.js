import puppeteer from 'puppeteer';

const URL = 'https://mixturemarketing.pl/abonament/';
const SCREENSHOTS = 'D:/tmp/abonament-e2e';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    // Listen for redirects
    const navigationHistory = [];
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) navigationHistory.push(frame.url());
    });

    console.log('[1/6] Opening /abonament/...');
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: `${SCREENSHOTS}-01-landing.png`, fullPage: false });

    // Close cookie banner if present
    console.log('[2/6] Dismissing cookie banner...');
    try {
      const acceptBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find((b) => /akceptuj/i.test(b.textContent || ''));
      });
      if (acceptBtn && (await acceptBtn.evaluate((el) => !!el))) {
        await acceptBtn.evaluate((el) => el.click());
        await new Promise((r) => setTimeout(r, 800));
      }
    } catch (e) {
      console.log('  (no cookie banner or already dismissed)');
    }

    // Scroll do pricing
    console.log('[3/6] Scrolling to pricing...');
    await page.evaluate(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: `${SCREENSHOTS}-02-pricing.png`, fullPage: false });

    // Klik Standard tier
    console.log('[4/6] Clicking "Wybierz Standard"...');
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find((b) => /wybierz standard/i.test(b.textContent || ''));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });
    if (!clicked) throw new Error('Standard button not found');
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: `${SCREENSHOTS}-03-modal-empty.png`, fullPage: false });

    // Wypełnij formularz
    console.log('[5/6] Filling modal form...');
    await page.type('#pb-business', 'Test E2E Puppeteer Sp z o.o.', { delay: 20 });
    await page.type('#pb-email', `test+puppeteer-${Date.now()}@mixturemarketing.pl`, { delay: 20 });
    await page.evaluate(() => {
      const phone = document.getElementById('pb-phone');
      if (phone) {
        phone.focus();
        phone.value = '';
      }
    });
    await page.type('#pb-phone', '600100200', { delay: 20 });
    // Trigger blur to apply phone mask
    await page.evaluate(() => document.getElementById('pb-phone')?.blur());
    await new Promise((r) => setTimeout(r, 300));
    // Random unique NIP (10 cyfr) zeby uniknac collision z poprzednimi testami
    const randomNip = String(Math.floor(1000000000 + Math.random() * 8999999999)).slice(0, 10);
    console.log('  Random NIP:', randomNip);
    await page.type('#pb-nip', randomNip, { delay: 20 });
    // Check consent
    await page.evaluate(() => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      if (checkboxes[0]) (checkboxes[0]).click();
    });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: `${SCREENSHOTS}-04-modal-filled.png`, fullPage: false });

    // Submit
    console.log('[6/6] Submitting form (expecting Stripe redirect)...');
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]')).find((b) =>
        /zapłać/i.test(b.textContent || ''),
      );
      if (submitBtn) submitBtn.click();
    });

    // Wait for either Stripe redirect or error message
    const result = await Promise.race([
      page.waitForFunction(() => window.location.hostname.includes('stripe.com'), { timeout: 15000 }).then(() => 'stripe_redirect'),
      page.waitForSelector('[role="alert"]', { timeout: 15000 }).then(() => 'error_shown'),
    ]).catch((e) => `timeout: ${e.message}`);

    const finalUrl = page.url();
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: `${SCREENSHOTS}-05-final.png`, fullPage: false });

    console.log('\n=== RESULT ===');
    console.log('Result:', result);
    console.log('Final URL:', finalUrl);
    console.log('Navigation history:', navigationHistory);

    if (result === 'error_shown') {
      const errorText = await page.evaluate(() => {
        const alert = document.querySelector('[role="alert"]');
        return alert ? alert.textContent : null;
      });
      console.log('Error message:', errorText);
    }
  } catch (err) {
    console.error('FAIL:', err.message);
  } finally {
    await browser.close();
  }
})();
