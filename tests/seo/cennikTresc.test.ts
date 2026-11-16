// MIX-1855: treść /cennik/: tylko ceny już opublikowane na stronie lub w Sanity, bez abonamentu
// i bez obietnic wyniku. Tabela źródeł: docs/tresci/MIX-1855-zrodla-cen.md (cena -> plik:linia).
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { CENNIK_CONTENT } from '../../data/content/pages/cennik';

const root = path.resolve(__dirname, '../..');

/** Wszystkie widoczne teksty treści (SEO, hero, grupy, FAQ, CTA). */
const teksty = (): string[] => {
  const c = CENNIK_CONTENT;
  return [
    ...c.seo.title,
    c.seo.description,
    c.hero.title,
    c.hero.lead,
    c.hero.cta,
    c.hero.calculatorCta,
    c.disclaimer,
    ...c.groups.flatMap((g) => [
      g.title,
      g.intro,
      ...g.items.flatMap((i) => [i.name, i.desc, i.price]),
    ]),
    c.faqTitle,
    ...c.faqs.flatMap((f) => [f.q, f.a]),
    c.finalCta.title,
    c.finalCta.text,
    c.finalCta.button,
  ];
};
const wszystko = () => teksty().join('\n');

/** Kwoty opublikowane na stronie lub w Sanity (źródła w docs/tresci/MIX-1855-zrodla-cen.md). */
const OPUBLIKOWANE = new Set([
  '2 500', // Offers.tsx:79, WebDevRzeszow.tsx:39, LandingPage.tsx:119; Sanity landing-page "Campaign Ready"
  '5 500', // CorporateWebsite.tsx:101; Sanity corporate-website "Business Card"
  '9 500', // Ecommerce.tsx:86; Sanity ecommerce "WooCommerce Start"
  '19 000', // WebDevRzeszow.tsx:39, CustomWebApp.tsx:92
  '23 000', // CustomWebApp.tsx:92, WebDevRzeszow.tsx:39
  '290', // WebDevRzeszow.tsx:59, :499
  '100', // data/content/services/web-development/ecommerce.ts:102 (hosting)
  '1 500', // GoogleAds.tsx:105, MetaAds.tsx:84; Sanity google-ads/meta-ads "Start"
  '2 000', // data/content/services/marketing/main.ts:73; google-ads.ts:130; UiUxDesign.tsx:54
  '3 000', // google-ads.ts:130 (zalecany budżet 2000-3000)
  '1 200', // SeoRzeszow.tsx:444; Sanity seo "Lokalne SEO"
  '3 500', // SeoRzeszow.tsx:468; BrandIdentity.tsx:51
  '1 900', // SeoRzeszow.tsx:480
  '800', // PrintDesign.tsx:53
  '8 000', // BrandIdentity.tsx:51
]);

describe('/cennik/: kwoty tylko z opublikowanych źródeł', () => {
  it('każda kwota w złotych (N NNN zł) jest na liście opublikowanych', () => {
    const kwoty = [
      ...wszystko().matchAll(/(\d{1,3}(?: \d{3})*)(?:–(\d{1,3}(?: \d{3})*))? zł/g),
    ].flatMap((m) => [m[1], m[2]].filter(Boolean) as string[]);
    expect(kwoty.length).toBeGreaterThan(15);
    const obce = kwoty.filter((k) => !OPUBLIKOWANE.has(k));
    expect(obce).toEqual([]);
  });

  it('ceny pozycji są widełkami „od …” (bez cen „sztywnych”)', () => {
    for (const g of CENNIK_CONTENT.groups)
      for (const i of g.items) expect(i.price, `${g.id}/${i.name}`).toMatch(/^od \d/);
  });

  it('ceny kotwic z karty: strony WWW od 2 500 zł netto, kampanie 2–10 tys. zł/mc', () => {
    const www = CENNIK_CONTENT.groups.find((g) => g.id === 'strony-www')!;
    expect(www.items.find((i) => i.name === 'Landing page')?.price).toBe('od 2 500 zł netto');
    const kampanie = CENNIK_CONTENT.groups.find((g) => g.id === 'kampanie')!;
    expect(kampanie.intro).toContain('2–10 tys. zł miesięcznie');
  });

  it('każda kwota z tabeli pozycji ma wiersz w pliku źródeł cen', () => {
    const zrodla = fs.readFileSync(path.join(root, 'docs/tresci/MIX-1855-zrodla-cen.md'), 'utf8');
    for (const g of CENNIK_CONTENT.groups)
      for (const i of g.items) {
        const kwota = /(\d{1,3}(?: \d{3})*) zł/.exec(i.price)![1];
        expect(zrodla, `${i.name}: ${kwota}`).toContain(kwota);
      }
  });
});

describe('/cennik/: bez abonamentu i bez obietnic wyniku', () => {
  it.each([
    ['abonament', /abonament/i],
    ['kwota 179', /179/],
    ['strona w abonamencie', /w abonamencie/i],
    ['gwarancja wyniku', /gwarantuj|gwarancj|gwarantow/i],
    ['pierwsze miejsce', /pierwsz\w+ miejsc|1\. miejsc|top ?3|top ?10|numer 1|nr 1/i],
    ['pewny efekt', /na pewno|bez ryzyka|100 ?%|zawsze (zadziała|działa)/i],
    ['szybkie wyniki', /natychmiast|w tydzień|w kilka dni/i],
  ])('brak: %s', (_nazwa, re) => {
    expect(wszystko()).not.toMatch(re);
  });

  it('SEO: wprost „Nie obiecujemy konkretnej pozycji” (negatywna obietnica zamiast gwarancji)', () => {
    const q = CENNIK_CONTENT.faqs.find((f) => /pozycjonowanie/.test(f.q))!;
    expect(q.a).toContain('Nie obiecujemy konkretnej pozycji');
  });

  it('bez HTML w odpowiedziach FAQ (tekst w JSON-LD = tekst widoczny)', () => {
    for (const f of CENNIK_CONTENT.faqs) {
      expect(f.q).not.toMatch(/[<>]/);
      expect(f.a).not.toMatch(/[<>]/);
    }
  });
});
