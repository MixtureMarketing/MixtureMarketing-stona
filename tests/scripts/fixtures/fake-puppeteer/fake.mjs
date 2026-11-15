// Fake puppeteer for the proportion gate test. Behaviour comes from the env var FAKE_PUPPETEER (JSON):
//   cardRatio, heroRatio  numbers (default 16/9)
//   errorOn               viewport names that emit a page error while measured
//   newPageFailsAt        1-based newPage() call that throws (a viewport that cannot even be opened)
const R = 16 / 9;
const S = JSON.parse(process.env.FAKE_PUPPETEER || '{}');
const CARD = 'https://cdn.sanity.io/images/p/d/abc-2000x3000.jpg?w=800&h=450&fit=crop';
const HERO = 'https://cdn.sanity.io/images/p/d/abc-2000x3000.jpg?w=1600&h=900&fit=crop';
let pages = 0;

function makePage() {
  const handlers = {};
  let vpName = '';
  let emitted = false;
  return {
    on(ev, cb) {
      (handlers[ev] ||= []).push(cb);
    },
    async setViewport(vp) {
      vpName = vp.name;
    },
    async setUserAgent() {},
    async setRequestInterception() {},
    async goto() {
      if (!emitted && (S.errorOn || []).includes(vpName)) {
        emitted = true;
        for (const cb of handlers.pageerror || []) cb(new Error('boom ' + vpName));
      }
    },
    async waitForSelector() {},
    async waitForFunction() {},
    async evaluate(arg) {
      if (typeof arg === 'string') return { ratio: S.heroRatio ?? R, src: HERO };
      if (String(arg).includes('data-hero-layout')) return 'classic';
      return [{ ratio: S.cardRatio ?? R, src: CARD, href: '/portfolio/x' }];
    },
    async close() {},
  };
}

export default {
  async launch() {
    return {
      on() {},
      async userAgent() {
        return 'fake';
      },
      async newPage() {
        pages++;
        if (pages === S.newPageFailsAt) throw new Error('newPage failed');
        return makePage();
      },
      async close() {},
    };
  },
};
