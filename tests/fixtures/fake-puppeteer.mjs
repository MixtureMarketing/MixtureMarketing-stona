// MIX-1445: atrapa pakietu `puppeteer` dla testów, które NAPRAWDĘ uruchamiają skrypty audytów
// (audit-health, audit-a11y) w małym katalogu-atrapie. Każde goto() wypisuje na stderr linię
// `ATRAPA-GOTO <url>` i robi prawdziwe żądanie HTTP pod ten adres (status trafia do skryptu).
import http from 'node:http';

const get = (url) =>
  new Promise((resolve) => {
    const req = http.get(url, { timeout: 3000 }, (res) => {
      res.resume();
      resolve(res.statusCode ?? 0);
    });
    req.on('error', () => resolve(0));
    req.on('timeout', () => {
      req.destroy();
      resolve(0);
    });
  });

const newPage = async () => ({
  on() {},
  async setRequestInterception() {},
  async setUserAgent() {},
  async setViewport() {},
  async goto(url) {
    process.stderr.write(`ATRAPA-GOTO ${url}\n`);
    const status = await get(url);
    if (status === 0) throw new Error(`ATRAPA: brak odpowiedzi z ${url}`);
    return { ok: () => status >= 200 && status < 300, status: () => status };
  },
  async waitForSelector() {},
  async waitForNetworkIdle() {},
  async evaluate(fn) {
    if (typeof fn !== 'function') return undefined; // wstrzyknięcie axe-core
    const src = String(fn);
    if (src.includes('axe.run')) return { violations: [] };
    if (src.includes('scrollTo')) return 1;
    if (src.includes('innerText')) return 'strona atrapy';
    return undefined;
  },
  async close() {},
});

export default {
  async launch() {
    return {
      newPage,
      async userAgent() {
        return 'HeadlessChrome/1.0';
      },
      async close() {},
    };
  },
};
