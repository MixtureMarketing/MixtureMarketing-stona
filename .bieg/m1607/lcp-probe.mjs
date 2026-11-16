// MIX-1579: wszystkie wpisy LCP (element, rozmiar, czas) + FCP + chwila commitu Reacta, mobile 412x823,
// CPU 4x, sieć ~ slow 4G (CDP). Pokazuje, KTÓRY element i KIEDY zostaje ostatecznym LCP.
//   node .bieg/m1579/lcp-probe.mjs <port> "<strony>" [powtórzenia=2]
import puppeteer from 'puppeteer';
const [port, pagesArg, nArg] = process.argv.slice(2);
const pages = pagesArg.split(' ').filter(Boolean);
const N = Number(nArg || 2);
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
for (const p of pages)
  for (let i = 1; i <= N; i++) {
    const page = await browser.newPage();
    await page.setViewport({ width: 412, height: 823, isMobile: true, hasTouch: true, deviceScaleFactor: 1.75 });
    const cdp = await page.createCDPSession();
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8,
    });
    await page.evaluateOnNewDocument(() => {
      window.__lcp = [];
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) {
          const el = e.element;
          let d = '?';
          if (el) {
            d = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + '.' + String(el.className || '').slice(0, 40).replace(/\s+/g, '.');
            const box = el.closest('[role=region],section,header,footer,nav,main');
            d += ' in ' + (box ? box.tagName.toLowerCase() + (box.getAttribute('aria-label') ? '[' + box.getAttribute('aria-label') + ']' : '') : '-');
            d += ' "' + (el.textContent || el.getAttribute('src') || '').trim().slice(0, 40) + '"';
          }
          window.__lcp.push({ t: Math.round(e.startTime), size: e.size, d, inDom: !!(el && el.isConnected) });
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new MutationObserver(() => {
        if (!window.__swap) window.__swap = Math.round(performance.now());
      }).observe(document, { childList: true, subtree: true, attributes: false });
      document.addEventListener('DOMContentLoaded', () => {
        const r = document.getElementById('root');
        if (r) new MutationObserver(() => { if (!window.__commit) window.__commit = Math.round(performance.now()); }).observe(r, { childList: true });
      });
    });
    await page.goto(`http://127.0.0.1:${port}${p}`, { waitUntil: 'networkidle0', timeout: 90000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 3000));
    const res = await page.evaluate(() => ({
      lcp: window.__lcp,
      fcp: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime || -1),
      commit: window.__commit || -1,
      load: Math.round(performance.getEntriesByType('navigation')[0]?.loadEventEnd || -1),
    }));
    console.log(`probe ${p} #${i}: FCP ${res.fcp} rootCommit ${res.commit} load ${res.load}`);
    for (const e of res.lcp) console.log(`  lcp t=${e.t} size=${e.size} inDom=${e.inDom} ${e.d}`);
    await page.close();
  }
await browser.close();
