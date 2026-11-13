// MIX-1579: zrzuty 390x844 i 1280x800 (reduced motion) z portu A i (opcjonalnie) B, różnica pikseli w przeglądarce.
//   node .bieg/m1579/shots.mjs <portA> [portB] "<strony>"
import puppeteer from 'puppeteer';
const args = process.argv.slice(2);
const pages = args.pop().split(' ').filter(Boolean);
const ports = args;
const sizes = [
  [390, 844, true],
  [1280, 800, false],
];
const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
async function shot(port, path, w, h, mobile) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(`http://127.0.0.1:${port}${path}`, { waitUntil: 'networkidle0', timeout: 60000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 2500));
  const b64 = await page.screenshot({ encoding: 'base64' });
  await page.close();
  return b64;
}
const cmp = await browser.newPage();
async function diff(a, b) {
  return cmp.evaluate(
    async (a, b) => {
      const load = (s) =>
        new Promise((res) => {
          const i = new Image();
          i.onload = () => res(i);
          i.src = 'data:image/png;base64,' + s;
        });
      const [ia, ib] = await Promise.all([load(a), load(b)]);
      const c = document.createElement('canvas');
      c.width = ia.width;
      c.height = ia.height;
      const x = c.getContext('2d');
      x.drawImage(ia, 0, 0);
      const da = x.getImageData(0, 0, c.width, c.height).data;
      x.clearRect(0, 0, c.width, c.height);
      x.drawImage(ib, 0, 0);
      const db = x.getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let k = 0; k < da.length; k += 4)
        if (Math.abs(da[k] - db[k]) + Math.abs(da[k + 1] - db[k + 1]) + Math.abs(da[k + 2] - db[k + 2]) > 30) n++;
      return { n, total: da.length / 4, same: ia.width === ib.width && ia.height === ib.height };
    },
    a,
    b,
  );
}
for (const p of pages)
  for (const [w, h, m] of sizes) {
    const a = await shot(ports[0], p, w, h, m);
    if (ports[1]) {
      const b = await shot(ports[1], p, w, h, m);
      const a2 = await shot(ports[0], p, w, h, m);
      const d = await diff(a, b);
      const self = await diff(a, a2);
      console.log(`shot ${p} ${w}: diff A/B ${((d.n / d.total) * 100).toFixed(2)} % (A/A szum ${((self.n / self.total) * 100).toFixed(2)} %)`);
    } else console.log(`shot ${p} ${w}: ${a.length} b64`);
  }
await browser.close();
