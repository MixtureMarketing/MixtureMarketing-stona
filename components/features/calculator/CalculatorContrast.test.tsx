// MIX-1937: nowy wygląd kalkulatora (VITE_MM_CALC_NEW_UI=1) bez „incomplete color-contrast” w axe.
// axe nie liczy kontrastu tekstu na gradiencie tła ani w elemencie z samym znakiem nietekstowym
// (strzałka). Dlatego: pigułka ma jednolite tło z kontrastem ≥ 4,5:1, strzałki są ikonami SVG,
// a pasek ceny od lg (fixed nad tłem strony z gradientem) ma pełne tło.
// Atrapy API i Turnstile jak w CalculatorFrames.test.tsx (MIX-1894).
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { PublicQuestion } from '../../../services/calculatorService';

const QUESTIONS: PublicQuestion[] = [
  {
    code: 'project_goal',
    text: 'Jaki jest cel projektu?',
    help_text: null,
    answer_type: 'select',
    options: [
      { value: 'sklep', label: 'Sklep' },
      { value: 'wizytowka', label: 'Wizytówka' },
    ],
    visible_if: null,
    group: 'projekt',
    sort_order: 1,
  },
  {
    code: 'languages',
    text: 'Ile wersji językowych?',
    help_text: null,
    answer_type: 'number',
    options: null,
    visible_if: null,
    group: 'platforma',
    sort_order: 2,
  },
];

const submitPublicQuote = vi.fn();
vi.mock('../../../services/calculatorService', () => ({
  fetchPublicQuestions: () => Promise.resolve(QUESTIONS),
  submitPublicQuote: (...a: unknown[]) => submitPublicQuote(...a),
}));

vi.mock('../contact/TurnstileWidget', async () => {
  const R = await import('react');
  return {
    default: R.forwardRef((_p: unknown, ref: React.Ref<unknown>) => {
      R.useImperativeHandle(ref, () => ({
        getToken: () => Promise.resolve('tok'),
        reset: () => {},
        prepare: () => {},
      }));
      return null;
    }),
  };
});

import PublicCalculator from './PublicCalculator';
import { NEW_UI_SHELL, calcUi } from './calcUi';

beforeEach(() => {
  submitPublicQuote.mockReset();
  submitPublicQuote.mockResolvedValue({
    ok: true,
    result: { priceRange: { min: 12000, max: 18000 } },
  });
  vi.stubEnv('VITE_MM_CALC_NEW_UI', '1');
});
afterEach(() => {
  vi.unstubAllEnvs();
});

// Kontrast WCAG 2.x (luminancja względna sRGB).
const lum = (hex: string) => {
  const c = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const l = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
};
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const tokens = (cls: string) => cls.split(/\s+/).filter(Boolean);

/** Teksty w przyciskach i linkach kalkulatora złożone wyłącznie ze znaków nietekstowych (→, ←). */
const symbolOnlyTexts = (root: Element) => {
  const out: string[] = [];
  for (const el of Array.from(root.querySelectorAll('button, a'))) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = (n.textContent || '').trim();
      if (t && !/[\p{L}\p{N}]/u.test(t)) out.push(`${el.textContent?.trim()}: "${t}"`);
    }
  }
  return out;
};
const primaryHasIcon = (name: RegExp) =>
  screen.getByRole('button', { name }).querySelector('svg[aria-hidden="true"]') !== null;

describe('MIX-1937: kontrast liczalny dla axe (nowy wygląd)', () => {
  it('pigułka: jednolite tło bez gradientu, biały tekst ≥ 4,5:1, kolor w zakresie dawnego gradientu', () => {
    const t = tokens(calcUi(true).btnPrimary);
    expect(t.filter((x) => /gradient|^from-|^via-|^to-/.test(x))).toEqual([]);
    expect(t).toContain('text-white');
    const bg = t.map((x) => /^bg-\[#([0-9a-fA-F]{6})\]$/.exec(x)?.[1]).filter(Boolean) as string[];
    expect(bg).toHaveLength(1);
    expect(contrast(bg[0], 'ffffff')).toBeGreaterThanOrEqual(4.5);
    // Dla oka bez zmiany: każdy kanał między #3f3d91 (secondary) a #5A58AD.
    const ch = (h: string) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [lo, hi, c] = [ch('3f3d91'), ch('5a58ad'), ch(bg[0])];
    c.forEach((v, i) => {
      expect(v).toBeGreaterThanOrEqual(lo[i]);
      expect(v).toBeLessThanOrEqual(hi[i]);
    });
  });

  it('stary wygląd (produkcja): pigułka bez zmian', () => {
    expect(calcUi(false).btnPrimary).toBe(
      'px-6 py-2.5 rounded-xl bg-primary text-dark font-semibold hover:brightness-110 disabled:opacity-60 transition',
    );
  });

  it('strzałki w Dalej / Wstecz / Umów rozmowę to ikony SVG, nie znaki tekstu (każdy krok i wynik)', async () => {
    const { container } = render(
      <MemoryRouter>
        <PublicCalculator />
      </MemoryRouter>,
    );
    await screen.findByText('Jaki jest cel projektu?');
    expect(symbolOnlyTexts(container)).toEqual([]);
    expect(primaryHasIcon(/^Dalej$/)).toBe(true);
    fireEvent.click(screen.getByRole('radio', { name: /Sklep/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    await screen.findByText('Ile wersji językowych?');
    expect(symbolOnlyTexts(container)).toEqual([]);
    const back = screen.getByRole('button', { name: /^Wstecz$/ });
    expect(back.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Dalej' }));
    fireEvent.change(screen.getByLabelText('Twój e-mail'), { target: { value: 'jan@firma.pl' } });
    expect(symbolOnlyTexts(container)).toEqual([]);
    fireEvent.click(screen.getByRole('button', { name: 'Poznaj widełki' }));
    const cta = await screen.findByRole('link', { name: /Umów rozmowę/ });
    expect(cta.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(symbolOnlyTexts(container)).toEqual([]);
  });

  it('pasek ceny od lg ma pełne tło bg-deep-dark (bez przezroczystości) w karcie kroku', () => {
    const t = tokens(NEW_UI_SHELL);
    expect(t).toContain('lg:[&_[data-testid=live-price-bar]]:bg-deep-dark');
    expect(t.filter((x) => x.includes('live-price-bar') && /bg-[^\s]*\//.test(x))).toEqual([]);
  });
});
