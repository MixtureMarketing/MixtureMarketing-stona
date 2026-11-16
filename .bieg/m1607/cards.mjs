// MIX-1607: realne wysokosci i pozycje kart /baza-wiedzy/ (do doboru contain-intrinsic-size) + skok układu przy przewijaniu.
//   node .bieg/m1607/cards.mjs <port>
import puppeteer from 'puppeteer';
const port = process.argv[2];
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
for (const [w, h, mobile] of [[390, 844, true], [768, 1024, false], [1280, 800, false]]) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(`http://127.0.0.1:${port}/baza-wiedzy/`, { waitUntil: 'networkidle0', timeout: 60000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1500));
  const info = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('h3')].map((x) => x.closest('.group')).filter(Boolean);
    const hs = cards.map((c) => Math.round(c.getBoundingClientRect().height));
    const tops = cards.map((c) => Math.round(c.getBoundingClientRect().top + scrollY));
    const cv = cards.filter((c) => getComputedStyle(c).contentVisibility === 'auto').length;
    const vis = cards.map((c) => c.checkVisibility && c.checkVisibility({ contentVisibilityAuto: true }));
    return { n: cards.length, cv, hs: hs.slice(0, 8), tops: tops.slice(0, 8), docH: document.documentElement.scrollHeight, renderedOnLoad: vis.filter(Boolean).length };
  });
  // przewiń do końca i zmierz zmianę wysokości dokumentu (skok od kart odroczonych)
  const after = await page.evaluate(async () => {
    const before = document.documentElement.scrollHeight;
    for (let y = 0; y < document.documentElement.scrollHeight; y += 300) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    await new Promise((r) => setTimeout(r, 400));
    return { before, after: document.documentElement.scrollHeight };
  });
  console.log(`cards ${w}: ${JSON.stringify(info)} przewiniecie docH ${after.before} -> ${after.after} (zmiana ${after.after - after.before} px)`);
  await page.close();
}
await browser.close();
