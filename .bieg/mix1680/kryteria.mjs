// MIX-1680: kryteria 1-5 na zbudowanym dist (po `npm run build`). Z korzenia repo; bez zaleznosci. rc 1 = jakies kryterium czerwone.
import fs from 'node:fs';
const SLUG = '/baza-wiedzy/aplikacje-dedykowane-z-ai-kiedy-warto/';
const BEFORE = Number(process.env.SITEMAP_BEFORE || 81); // liczba <loc> w sitemap.xml na bazie 0d6d91c
const html = (p) => fs.readFileSync(`dist${p}index.html`, 'utf8');
const bad = [];
const ok = (c, m) => { console.log(`${c ? 'OK ' : 'BAD'} ${m}`); if (!c) bad.push(m); };

const page = html(SLUG);
ok(!/<meta[^>]+name="robots"[^>]*noindex/i.test(page) && !/noindex/i.test(page.replace(/<script[^>]*>[\s\S]*?<\/script>/g, '')), '(1) strona artykulu: brak noindex w meta/robots');
const canon = /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/.exec(page)?.[1];
ok(canon === `https://mixturemarketing.pl${SLUG}`, `(1) canonical = ${canon}`);
const lds = [...page.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1])).flatMap((d) => (Array.isArray(d) ? d : [d]));
const art = lds.find((d) => d['@type'] === 'Article');
ok(art && art.datePublished?.slice(0, 10) === '2026-11-14', `(1) JSON-LD Article datePublished = ${art?.datePublished}`);

const sm = fs.readFileSync('dist/sitemap.xml', 'utf8');
const locs = (sm.match(/<loc>/g) || []).length;
ok(sm.split(`<loc>https://mixturemarketing.pl${SLUG}</loc>`).length - 1 === 1, '(2) dist/sitemap.xml: adres dokladnie raz');
ok(locs === BEFORE + 1, `(5) liczba <loc> w sitemapie ${locs} = przed (${BEFORE}) + 1`);

const llms = fs.readFileSync('dist/llms.txt', 'utf8');
ok(llms.split(`(https://mixturemarketing.pl${SLUG})`).length - 1 === 1, '(3) dist/llms.txt: wpis dokladnie raz');

const kb = html('/baza-wiedzy/');
ok(kb.includes(`href="${SLUG}"`), '(4) prerenderowany /baza-wiedzy/ zawiera link do artykulu');
console.log(`sitemap <loc>=${locs}`);
process.exit(bad.length ? 1 : 0);
