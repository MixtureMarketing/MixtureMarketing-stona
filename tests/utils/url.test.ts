import { describe, it, expect } from 'vitest';
import { withTrailingSlash, toExternalHref, toTelHref } from '../../utils/url';
import { getBreadcrumbsSchema } from '../../utils/seo/commonSchemas';

describe('withTrailingSlash', () => {
  it('dopisuje slash na końcu ścieżki', () => {
    expect(withTrailingSlash('/baza-wiedzy')).toBe('/baza-wiedzy/');
    expect(withTrailingSlash('/portfolio/driftmark')).toBe('/portfolio/driftmark/');
  });

  it('dopisuje slash przed query i fragmentem', () => {
    expect(withTrailingSlash('/audyt-360?url=x.pl')).toBe('/audyt-360/?url=x.pl');
    expect(withTrailingSlash('/offers#calculator')).toBe('/offers/#calculator');
  });

  it('nie dubluje slasha', () => {
    expect(withTrailingSlash('/')).toBe('/');
    expect(withTrailingSlash('/baza-wiedzy/')).toBe('/baza-wiedzy/');
    expect(withTrailingSlash('/baza-wiedzy/?kategoria=tech')).toBe('/baza-wiedzy/?kategoria=tech');
  });

  it('nie rusza linków zewnętrznych, kotwic, mailto/tel i plików', () => {
    expect(withTrailingSlash('https://example.com/x')).toBe('https://example.com/x');
    expect(withTrailingSlash('//cdn.example.com/x')).toBe('//cdn.example.com/x');
    expect(withTrailingSlash('#faq')).toBe('#faq');
    expect(withTrailingSlash('mailto:a@b.pl')).toBe('mailto:a@b.pl');
    expect(withTrailingSlash('tel:+48123')).toBe('tel:+48123');
    expect(withTrailingSlash('/assets/images/sygnet.png')).toBe('/assets/images/sygnet.png');
    expect(withTrailingSlash('')).toBe('');
  });

  it('normalizuje absolutny URL własnej domeny', () => {
    expect(withTrailingSlash('https://mixturemarketing.pl/baza-wiedzy')).toBe(
      'https://mixturemarketing.pl/baza-wiedzy/',
    );
    expect(withTrailingSlash('https://mixturemarketing.pl')).toBe('https://mixturemarketing.pl/');
    expect(withTrailingSlash('https://mixturemarketing.pl/o-nas/')).toBe(
      'https://mixturemarketing.pl/o-nas/',
    );
  });
});

describe('getBreadcrumbsSchema', () => {
  it('emituje URL-e z trailing slashem (zgodne z canonicalami)', () => {
    const schema = getBreadcrumbsSchema(
      [
        { name: 'Strona Główna', item: '/' },
        { name: 'Baza Wiedzy', item: '/baza-wiedzy' },
        { name: 'Artykuł', item: 'https://mixturemarketing.pl/baza-wiedzy/redis' },
      ],
      'https://mixturemarketing.pl',
    );
    expect(schema?.itemListElement.map((i) => i.item)).toEqual([
      'https://mixturemarketing.pl/',
      'https://mixturemarketing.pl/baza-wiedzy/',
      'https://mixturemarketing.pl/baza-wiedzy/redis/',
    ]);
  });
});

describe('toExternalHref (dane od użytkownika → bezpieczny link)', () => {
  it('przepuszcza http/https i dopisuje https:// do gołej domeny', () => {
    expect(toExternalHref('https://sklep-jan.pl/oferta')).toBe('https://sklep-jan.pl/oferta');
    expect(toExternalHref('http://sklep.pl')).toBe('http://sklep.pl/');
    expect(toExternalHref('  sklep-jan.pl ')).toBe('https://sklep-jan.pl/');
    expect(toExternalHref('www.sklep.pl:8080/x')).toBe('https://www.sklep.pl:8080/x');
  });

  it('odrzuca inne schematy i śmieci', () => {
    expect(toExternalHref('javascript:alert(1)')).toBeNull();
    expect(toExternalHref('JavaScript:alert(1)')).toBeNull();
    expect(toExternalHref('data:text/html,<b>x</b>')).toBeNull();
    expect(toExternalHref('mailto:a@b.pl')).toBeNull();
    expect(toExternalHref('nie mam strony')).toBeNull();
    expect(toExternalHref('')).toBeNull();
    expect(toExternalHref(null)).toBeNull();
  });
});

describe('toTelHref', () => {
  it('czyści separatory, zostawia +', () => {
    expect(toTelHref('+48 600-100 (200)')).toBe('tel:+48600100200');
  });
  it('null dla pustych i zbyt krótkich wartości', () => {
    expect(toTelHref('')).toBeNull();
    expect(toTelHref('brak')).toBeNull();
    expect(toTelHref(undefined)).toBeNull();
  });
});
