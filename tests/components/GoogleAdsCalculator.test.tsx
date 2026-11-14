// MIX-1678: kafelki wyników kalkulatora Google Ads — wartość i jednostka w jednym elemencie nowrap,
// liczby (arytmetyka suwaków) bez zmian, etykiety bez zmian.
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GoogleAdsCalculator from '../../components/features/marketing/GoogleAdsCalculator';
import { GOOGLE_ADS_CONTENT as CONTENT } from '../../data/content';

const nbsp = (s: string) => s.replace(/[\u00a0\u202f]/g, ' ');

const tile = (c: HTMLElement, id: string) =>
  c.querySelector<HTMLElement>(`[data-calc-tile="${id}"]`)!;
const value = (c: HTMLElement, id: string) =>
  tile(c, id).querySelector<HTMLElement>('[data-calc-value]')!;
const text = (c: HTMLElement, id: string) => nbsp(value(c, id).textContent ?? '');

const setSlider = (c: HTMLElement, id: string, v: number) => {
  const input = c.querySelector<HTMLInputElement>(`input[aria-labelledby="${id}-label"]`)!;
  fireEvent.change(input, { target: { value: String(v) } });
};

describe('GoogleAdsCalculator: kafelki wyników', () => {
  it('wartość i jednostka są w jednym elemencie whitespace-nowrap', () => {
    const { container } = render(<GoogleAdsCalculator />);
    for (const id of ['cpa', 'revenue']) {
      const v = value(container, id);
      expect(v.className).toContain('whitespace-nowrap');
      expect(v.textContent).toMatch(/\d\s*zł$/);
      // jednostka nie jest osobnym kafelkiem ani elementem poza wartością
      expect(v.querySelectorAll('span').length).toBeGreaterThanOrEqual(1);
    }
    expect(value(container, 'traffic').className).toContain('whitespace-nowrap');
  });

  it('wyniki dla wartości domyślnych bez zmian (5000 zł, 3,5 zł, 2,5%, 400 zł)', () => {
    const { container } = render(<GoogleAdsCalculator />);
    expect(text(container, 'traffic')).toBe('1 428');
    expect(text(container, 'leads')).toBe('35');
    expect(text(container, 'cpa')).toBe('142,86 zł');
    expect(text(container, 'revenue')).toBe('14 000 zł');
  });

  it('wyniki dla maksimum suwaków (liczby 7–8-cyfrowe) bez zmian i w jednym nowrap', () => {
    const { container } = render(<GoogleAdsCalculator />);
    setSlider(container, 'budget', 50000);
    setSlider(container, 'cpc', 0.5);
    setSlider(container, 'cr', 5);
    setSlider(container, 'aov', 5000);
    expect(text(container, 'traffic')).toBe('100 000');
    expect(text(container, 'leads')).toBe('5 000');
    expect(text(container, 'cpa')).toBe('10,00 zł');
    expect(text(container, 'revenue')).toBe('25 000 000 zł');
    expect(value(container, 'revenue').className).toContain('whitespace-nowrap');
  });

  it('brak transakcji: koszt pozyskania to myślnik bez jednostki, wartość zamówień 0 zł', () => {
    const { container } = render(<GoogleAdsCalculator />);
    setSlider(container, 'budget', 1000);
    setSlider(container, 'cpc', 15);
    setSlider(container, 'cr', 0.1);
    expect(text(container, 'leads')).toBe('0');
    expect(text(container, 'cpa')).toBe('—');
    expect(text(container, 'revenue')).toBe('0 zł');
  });

  it('etykiety kafelków to teksty z treści (bez zmian brzmienia)', () => {
    const { container } = render(<GoogleAdsCalculator />);
    const L = CONTENT.calculator.labels;
    const label = (id: string) =>
      tile(container, id).querySelector('[data-calc-label]')!.textContent;
    expect(label('traffic')).toBe(L.traffic);
    expect(label('leads')).toBe(L.leads);
    expect(label('cpa')).toBe(L.cpa);
    expect(label('revenue')).toBe(L.revenue);
  });
});
