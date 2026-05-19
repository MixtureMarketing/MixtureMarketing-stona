import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    // iPhone 13 viewport
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    );

    console.log('[1/4] Opening mixturemarketing.pl...');
    await page.goto('https://mixturemarketing.pl/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: 'D:/tmp/mobile-menu-01-closed.png' });

    console.log('[2/4] Clicking hamburger button...');
    // Klika hamburger button przez aria-label
    const clicked = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-controls="mobile-menu"]');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    if (!clicked) throw new Error('Hamburger button not found');
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: 'D:/tmp/mobile-menu-02-after-click.png' });

    // Verify menu is visible
    const menuState = await page.evaluate(() => {
      const menu = document.getElementById('mobile-menu');
      const btn = document.querySelector('button[aria-controls="mobile-menu"]');
      if (!menu) return { error: 'menu not found' };
      const style = window.getComputedStyle(menu);
      return {
        ariaHidden: menu.getAttribute('aria-hidden'),
        ariaExpanded: btn?.getAttribute('aria-expanded'),
        visibility: style.visibility,
        transform: style.transform,
        hasTranslateXFull: menu.className.includes('translate-x-full'),
        hasTranslateX0: menu.className.includes('translate-x-0'),
        isInvisible: menu.className.includes('invisible'),
        isVisible: menu.className.includes('visible'),
      };
    });

    console.log('[3/4] Menu state after click:');
    console.log(JSON.stringify(menuState, null, 2));

    // Wait 2s and check again (regression check — menu was closing itself after 0ms)
    await new Promise((r) => setTimeout(r, 2500));
    const menuStateLater = await page.evaluate(() => {
      const menu = document.getElementById('mobile-menu');
      if (!menu) return { error: 'menu not found' };
      return {
        ariaHidden: menu.getAttribute('aria-hidden'),
        isInvisible: menu.className.includes('invisible'),
        isVisible: menu.className.includes('visible'),
      };
    });
    console.log('[4/4] Menu state 2.5s later:');
    console.log(JSON.stringify(menuStateLater, null, 2));
    await page.screenshot({ path: 'D:/tmp/mobile-menu-03-final.png' });

    if (menuStateLater.isVisible && menuStateLater.ariaHidden === 'false') {
      console.log('\n✅ PASS: Mobile menu opens and stays open');
    } else {
      console.log('\n❌ FAIL: Menu zamyka się samo lub nie otworzyło');
    }

    // Test RUM error
    const errors = await page.evaluate(() => {
      return performance
        .getEntriesByType('resource')
        .filter((r) => r.name.includes('rum-collect'))
        .map((r) => r.name);
    });
    console.log('\nrum-collect requests:', errors.length ? errors : 'NONE ✅');
  } catch (err) {
    console.error('FAIL:', err.message);
  } finally {
    await browser.close();
  }
})();
