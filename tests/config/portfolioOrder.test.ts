import { describe, it, expect } from 'vitest';
import { orderPortfolio, PORTFOLIO_PINNED_SLUGS } from '../../config/portfolioOrder';

// MIX-1829: wybrane realizacje na początku listy /portfolio/, reszta po dacie (kolejność z CMS).

const p = (slug: string) => ({ slug });
const slugs = (xs: Array<{ slug: string }>) => xs.map((x) => x.slug);

// Kolejność z CMS: po dacie, najnowsze pierwsze (wyróżnione celowo w środku i odwrotnie).
const cms = [
  p('najnowszy'),
  p('try-dive-szkola-nurkowania'),
  p('drugi'),
  p('impackt-edu'),
  p('trzeci'),
  p('fundacja-niepodzielni'),
  p('najstarszy'),
];

describe('orderPortfolio (MIX-1829)', () => {
  it('lista wyróżnionych: PsychON, Niepodzielni, Impackt Edu, Try Dive — w tej kolejności', () => {
    expect([...PORTFOLIO_PINNED_SLUGS]).toEqual([
      'psychon',
      'fundacja-niepodzielni',
      'impackt-edu',
      'try-dive-szkola-nurkowania',
    ]);
  });

  it('bez PsychON w CMS: pierwsze 3 to Niepodzielni, Impackt Edu, Try Dive; reszta po dacie', () => {
    expect(slugs(orderPortfolio(cms))).toEqual([
      'fundacja-niepodzielni',
      'impackt-edu',
      'try-dive-szkola-nurkowania',
      'najnowszy',
      'drugi',
      'trzeci',
      'najstarszy',
    ]);
  });

  it('PsychON w CMS (dowolne miejsce): wskakuje na pierwsze miejsce', () => {
    const out = slugs(orderPortfolio([...cms.slice(0, 5), p('psychon'), ...cms.slice(5)]));
    expect(out.slice(0, 4)).toEqual([
      'psychon',
      'fundacja-niepodzielni',
      'impackt-edu',
      'try-dive-szkola-nurkowania',
    ]);
    expect(out.slice(4)).toEqual(['najnowszy', 'drugi', 'trzeci', 'najstarszy']);
  });

  it('brakujący slug ze środka listy pominięty bez luki', () => {
    const bezImpackt = cms.filter((x) => x.slug !== 'impackt-edu');
    expect(slugs(orderPortfolio(bezImpackt)).slice(0, 3)).toEqual([
      'fundacja-niepodzielni',
      'try-dive-szkola-nurkowania',
      'najnowszy',
    ]);
  });

  it('żadnego wyróżnionego w CMS: kolejność bez zmian; liczba pozycji zachowana', () => {
    const zwykle = [p('a'), p('b'), p('c')];
    expect(slugs(orderPortfolio(zwykle))).toEqual(['a', 'b', 'c']);
    expect(orderPortfolio(cms)).toHaveLength(cms.length);
    expect(orderPortfolio([])).toEqual([]);
  });

  it('nie zmienia tablicy wejściowej (dane z CMS/zrzutu)', () => {
    const copy = slugs(cms);
    orderPortfolio(cms);
    expect(slugs(cms)).toEqual(copy);
  });

  it('własna lista wyróżnionych (łatwa zmiana kolejności)', () => {
    expect(slugs(orderPortfolio(cms, ['trzeci', 'drugi'])).slice(0, 3)).toEqual([
      'trzeci',
      'drugi',
      'najnowszy',
    ]);
  });
});
