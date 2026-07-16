import { describe, it, expect } from 'vitest';
import { decisionCardMarkdown } from './decisionCardDoc';
import type { DecisionCard, DecisionRow } from '@/lib/estimation/documents';

// Backlog f2c: „poziomy domyślne archetypu" zbite w JEDNĄ sekcję zbiorczą, zamiast powtarzać
// notkę przy każdej decyzji (E2E f2a: 11 z 19 obszarów to poziomy domyślne).

const decision = (over: Partial<DecisionRow>): DecisionRow => ({
  title: 'X',
  code: 'x',
  category: 'A',
  level: 1,
  levelName: 'Podstawowy',
  levelDescription: null,
  reasons: [],
  overrideReason: null,
  fromArchetypeDefault: true,
  ...over,
});

const card = (decisions: DecisionRow[]): DecisionCard => ({
  meta: { quoteNumber: 1, projectName: 'Test', clientName: null, issuedAt: '2026-07-16' },
  platform: {
    recommended: null,
    chosen: 'woocommerce',
    reason: null,
    againstRecommendation: false,
  },
  decisions,
  overrides: [],
  alerts: [],
  outOfScope: [],
  confidence: { score: 80, breakdown: null },
  risks: [],
});

describe('decisionCardMarkdown — zbicie poziomów domyślnych', () => {
  const md = decisionCardMarkdown(
    card([
      decision({
        title: 'Frontend',
        code: 'frontend',
        level: 3,
        reasons: ['Sklep wymaga własnego layoutu'],
        fromArchetypeDefault: false,
      }),
      decision({ title: 'Storage', code: 'storage', level: 1 }),
      decision({ title: 'Caching', code: 'caching', level: 1 }),
    ]),
  );

  it('decyzja z uzasadnieniem trafia do „Decyzje architektoniczne" ze szczegółem', () => {
    expect(md).toContain('## Decyzje architektoniczne');
    expect(md).toContain('### Frontend — poziom 3');
    expect(md).toContain('Sklep wymaga własnego layoutu');
  });

  it('poziomy domyślne w JEDNEJ sekcji zbiorczej, nie jako osobne nagłówki', () => {
    expect(md).toContain('## Poziomy domyślne archetypu woocommerce (bez korekt)');
    expect(md).toContain('- **Storage** — poziom 1');
    expect(md).toContain('- **Caching** — poziom 1');
    // NIE ma osobnych nagłówków ### dla domyślnych
    expect(md).not.toContain('### Storage');
    expect(md).not.toContain('### Caching');
    // stara, powtarzana notka per decyzja zniknęła
    expect(md).not.toContain('Poziom domyślny dla archetypu **woocommerce**');
  });

  it('same decyzje z uzasadnieniem → brak sekcji zbiorczej', () => {
    const md2 = decisionCardMarkdown(
      card([decision({ title: 'Frontend', reasons: ['x'], fromArchetypeDefault: false })]),
    );
    expect(md2).toContain('## Decyzje architektoniczne');
    expect(md2).not.toContain('Poziomy domyślne archetypu');
  });

  it('same poziomy domyślne → brak sekcji „Decyzje architektoniczne"', () => {
    const md3 = decisionCardMarkdown(card([decision({ title: 'Storage' })]));
    expect(md3).not.toContain('## Decyzje architektoniczne');
    expect(md3).toContain('## Poziomy domyślne archetypu woocommerce (bez korekt)');
  });
});
