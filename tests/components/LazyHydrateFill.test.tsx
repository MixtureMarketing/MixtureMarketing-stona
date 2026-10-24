import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import LazyHydrate from '@/components/common/LazyHydrate';

// Wykresy recharts (`ResponsiveContainer height="100%"`) mierzą rodzica. Wrapper LazyHydrate
// bez wysokości dawał im 0 px — wykresy w artykułach Edge, CDN i Redis były puste na produkcji.
describe('LazyHydrate fill', () => {
  it('z `fill` wrapper wypełnia wysokość rodzica', () => {
    const { container } = render(
      <LazyHydrate fill>
        <span>x</span>
      </LazyHydrate>,
    );
    const wrapper = container.querySelector('.lazy-hydrate') as HTMLElement;
    expect(wrapper.style.height).toBe('100%');
  });

  it('bez `fill` wysokość zostaje automatyczna', () => {
    const { container } = render(
      <LazyHydrate>
        <span>x</span>
      </LazyHydrate>,
    );
    const wrapper = container.querySelector('.lazy-hydrate') as HTMLElement;
    expect(wrapper.style.height).toBe('');
  });

  it('każdy wykres z ResponsiveContainer height="100%" w LazyHydrate ma `fill`', () => {
    const articlesDir = path.resolve(__dirname, '../../components/articles');
    const chartsDir = path.join(articlesDir, 'visuals/charts');
    const charts = fs
      .readdirSync(chartsDir)
      .filter((f) =>
        /ResponsiveContainer[^>]*height="100%"/.test(
          fs.readFileSync(path.join(chartsDir, f), 'utf8'),
        ),
      )
      .map((f) => f.replace(/\.tsx$/, ''));
    expect(charts.length).toBeGreaterThan(0);

    const offenders: string[] = [];
    for (const file of fs.readdirSync(articlesDir).filter((f) => f.endsWith('.tsx'))) {
      const src = fs.readFileSync(path.join(articlesDir, file), 'utf8');
      for (const chart of charts) {
        const re = new RegExp(`<LazyHydrate([^>]*)>\\s*<${chart}\\b`, 'g');
        for (const m of src.matchAll(re)) {
          if (!/\bfill\b/.test(m[1])) offenders.push(`${file}: ${chart}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
