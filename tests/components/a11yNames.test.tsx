import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScrollRegion from '../../components/common/ScrollRegion';
import RevenueLossCalculator from '../../components/articles/visuals/performance/RevenueLossCalculator';
import LazyMap from '../../components/common/LazyMap';

describe('ScrollRegion — przewijany obszar osiągalny z klawiatury', () => {
  it('div: tabIndex 0 + role region + nazwa', () => {
    render(
      <ScrollRegion label="Tabela porównawcza: A vs B">
        <table>
          <tbody>
            <tr>
              <td>x</td>
            </tr>
          </tbody>
        </table>
      </ScrollRegion>,
    );
    const region = screen.getByRole('region', { name: 'Tabela porównawcza: A vs B' });
    expect(region.tagName).toBe('DIV');
    expect(region.getAttribute('tabindex')).toBe('0');
    expect(region.className).toContain('overflow-x-auto');
  });

  it('as="pre" zachowuje element <pre> i własne klasy', () => {
    render(
      <ScrollRegion as="pre" label="Przykład kodu" className="overflow-x-auto text-sm">
        <code>const a = 1;</code>
      </ScrollRegion>,
    );
    const region = screen.getByRole('region', { name: 'Przykład kodu' });
    expect(region.tagName).toBe('PRE');
    expect(region.className).toBe('overflow-x-auto text-sm');
  });
});

describe('nazwy kontrolek', () => {
  it('suwaki kalkulatora strat są powiązane z etykietami (axe: label)', () => {
    render(<RevenueLossCalculator />);
    expect(screen.getByLabelText('Miesięczny ruch').getAttribute('type')).toBe('range');
    expect(screen.getByLabelText('Czas ładowania (s)').getAttribute('aria-valuetext')).toBe('4s');
  });

  it('przycisk mapy: nazwa zaczyna się od widocznego „Załaduj mapę” i mówi, która to mapa', () => {
    render(<LazyMap src="https://www.google.com/maps?q=x&output=embed" title="Mapa — biuro" />);
    const btn = screen.getByRole('button');
    expect(btn.hasAttribute('aria-label')).toBe(false);
    expect(btn.textContent).toMatch(/^Załaduj mapę/);
    expect(btn.textContent).toContain('Mapa — biuro');
  });
});
