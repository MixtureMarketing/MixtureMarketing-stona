import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    console.log('[1] Open /');
    await page.goto('https://mixturemarketing.pl/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));

    // Dismiss cookie banner
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        /akceptuj/i.test(b.textContent || ''),
      );
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 500));

    console.log('[2] Click hamburger');
    await page.evaluate(() => {
      const btn = document.querySelector('button[aria-controls="mobile-menu"]');
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Verify menu visible
    const menuVisible = await page.evaluate(() => {
      const menu = document.getElementById('mobile-menu');
      return menu?.className.includes('visible') && !menu?.className.includes('invisible');
    });
    console.log('  Menu visible after click:', menuVisible);
    await page.screenshot({ path: 'D:/tmp/mobile-close-01-open.png' });

    console.log('[3] Click X close button (inside menu)');
    const closed = await page.evaluate(() => {
      // Find aria-label "Zamknij menu" button INSIDE #mobile-menu
      const menu = document.getElementById('mobile-menu');
      if (!menu) return 'no menu';
      const closeBtn = menu.querySelector('button[aria-label*="Zamknij"]');
      if (!closeBtn) return 'no close button found inside menu';
      // Verify visible (not hamburger from nav)
      const rect = closeBtn.getBoundingClientRect();
      if (rect.width === 0) return 'close button has 0 width';
      closeBtn.click();
      return 'clicked';
    });
    console.log('  X click result:', closed);
    await new Promise((r) => setTimeout(r, 800));

    const menuClosed = await page.evaluate(() => {
      const menu = document.getElementById('mobile-menu');
      return menu?.className.includes('invisible');
    });
    console.log('  Menu closed after X:', menuClosed);
    await page.screenshot({ path: 'D:/tmp/mobile-close-02-closed.png' });

    if (menuVisible && menuClosed) {
      console.log('\n✅ PASS: Menu open + close via X works');
    } else {
      console.log('\n❌ FAIL');
    }
  } catch (err) {
    console.error('FAIL:', err.message);
  } finally {
    await browser.close();
  }
})();
