import { describe, it, expect } from 'vitest';
import { buildFaqSchema, getFaqSchema } from '../../utils/seo/commonSchemas';

const FAQ = [
  { question: 'Ile to kosztuje?', answer: 'Zależy od zakresu.' },
  { question: 'Jak długo trwa?', answer: '4–8 tygodni.' },
];

// Kształt, który strony lokalne Rzeszowa i StandardFaq składały ręcznie przed
// przejściem na wspólny builder — JSON-LD w prerenderze ma zostać bajt w bajt ten sam.
const LEGACY_INLINE = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};

describe('buildFaqSchema / getFaqSchema', () => {
  it('speakable: null daje dokładnie dawny ręczny JSON-LD (także kolejność kluczy)', () => {
    expect(JSON.stringify(buildFaqSchema(FAQ, { speakable: null }))).toBe(
      JSON.stringify(LEGACY_INLINE),
    );
  });

  it('domyślnie dokłada SpeakableSpecification przed mainEntity (jak Seo `faq`)', () => {
    const schema = getFaqSchema(FAQ);
    expect(Object.keys(schema!)).toEqual(['@context', '@type', 'speakable', 'mainEntity']);
    expect(schema!.speakable).toEqual({
      '@type': 'SpeakableSpecification',
      cssSelector: ['[itemprop="name"]', '[itemprop="acceptedAnswer"]'],
    });
  });

  it('pusta lub brakująca lista → null (Seo nie emituje pustej schemy)', () => {
    expect(getFaqSchema([])).toBeNull();
    expect(getFaqSchema(undefined)).toBeNull();
  });
});
