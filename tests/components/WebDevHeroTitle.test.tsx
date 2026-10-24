import { afterEach, describe, expect, it, vi } from 'vitest';
import { shrinkLineToFit } from '@/components/features/web-development/WebDevHeroTitle';

/**
 * Regresja (audyt renderowania 2026-10-24): H1 /web-development/ jest skalibrowany w cqw
 * pod jeden font, a strona używa stosu systemowego. Przy szerszym foncie (Linux/Roboto,
 * 1366 px) linia wystawała o 42–57 px i była ucinana przez overflow-hidden przypiętego hero.
 */
const line = (scrollWidth: number, clientWidth: number) => {
  const el = document.createElement('span');
  Object.defineProperty(el, 'scrollWidth', { value: scrollWidth });
  Object.defineProperty(el, 'clientWidth', { value: clientWidth });
  return el;
};

const mockStyle = (whiteSpace: string, fontSize: string) =>
  vi
    .spyOn(window, 'getComputedStyle')
    .mockReturnValue({ whiteSpace, fontSize } as unknown as CSSStyleDeclaration);

describe('shrinkLineToFit', () => {
  afterEach(() => vi.restoreAllMocks());

  it('linia szersza od pudełka dostaje proporcjonalnie mniejszy stopień', () => {
    mockStyle('nowrap', '70.959px');
    const el = line(1359, 1302);
    shrinkLineToFit(el);
    expect(parseFloat(el.style.fontSize)).toBeCloseTo((70.959 * 1302) / 1359, 2);
  });

  it('linia mieszcząca się w pudełku zostaje przy skalibrowanym cqw (bez powiększania)', () => {
    mockStyle('nowrap', '58px');
    const el = line(1250, 1302);
    el.style.fontSize = '40px'; // pozostałość po poprzednim dopasowaniu (np. węższe okno)
    shrinkLineToFit(el);
    expect(el.style.fontSize).toBe('');
  });

  it('mobile (linia się łamie) — nic nie zmienia', () => {
    mockStyle('normal', '28px');
    const el = line(900, 358);
    shrinkLineToFit(el);
    expect(el.style.fontSize).toBe('');
  });
});
