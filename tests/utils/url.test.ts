import { describe, it, expect } from 'vitest';
import { withTrailingSlash } from '../../utils/url';
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
