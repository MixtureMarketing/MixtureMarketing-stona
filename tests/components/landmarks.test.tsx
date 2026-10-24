import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { hasOwnBreadcrumbs } from '../../config/routes';
import ArticleUseCases from '../../components/articles/shared/ArticleUseCases';

const root = path.resolve(__dirname, '../..');
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

describe('okruszki — jeden <nav aria-label="Breadcrumb"> na stronę (axe landmark-unique)', () => {
  it.each([
    ['/baza-wiedzy/', true],
    ['/baza-wiedzy', true],
    ['/baza-wiedzy/redis-optymalizacja/', true],
    ['/baza-wiedzy/artykul-z-cms/', false],
    ['/marketing/', false],
    ['/portfolio/glamspace/', false],
  ])('%s → własne okruszki: %s', (p, expected) => {
    expect(hasOwnBreadcrumbs(p)).toBe(expected);
  });

  it('każda statyczna trasa /baza-wiedzy/* faktycznie renderuje własne okruszki', () => {
    const src = read('config/routes.tsx');
    const imports = new Map<string, string>();
    for (const m of src.matchAll(/const (\w+) = lazy\(\s*\(\) => import\('@\/([^']+)'\)/g)) {
      imports.set(m[1], m[2]);
    }
    const routes = [...src.matchAll(/path: '(\/baza-wiedzy[^':]*)',\s*element: <(\w+)/g)];
    expect(routes.length).toBeGreaterThan(20);
    for (const [, routePath, comp] of routes) {
      const file = imports.get(comp);
      expect(file, `${routePath}: brak importu ${comp}`).toBeTruthy();
      const body = read(`${file}.tsx`);
      expect(body, `${routePath} (${file}) bez ArticleShell/Breadcrumbs`).toMatch(
        /<ArticleShell|<Breadcrumbs/,
      );
    }
  });
});

describe('zagnieżdżony <main> — szablony renderują się w <main> z App', () => {
  it.each(['components/templates/CaseStudyTemplate.tsx', 'components/portal/PortalDashboard.tsx'])(
    '%s nie renderuje własnego <main>',
    (file) => {
      expect(read(file)).not.toMatch(/<main(\s+className|>)/);
    },
  );
});

describe('ArticleUseCases — kolejność nagłówków', () => {
  const items = [{ title: 'Punkt', desc: 'Opis', icon: null }];

  it('bez tytułu: brak pustego <h3>, punkty jako <h3>', () => {
    const { container } = render(<ArticleUseCases title="" items={items} />);
    expect(container.querySelectorAll('h3')).toHaveLength(1);
    expect(container.querySelector('h3')?.textContent).toBe('Punkt');
    expect(container.querySelector('h4')).toBeNull();
  });

  it('z tytułem: <h3> tytuł, punkty jako <h4>', () => {
    const { container } = render(<ArticleUseCases title="Zastosowania" items={items} />);
    expect(container.querySelector('h3')?.textContent).toBe('Zastosowania');
    expect(container.querySelector('h4')?.textContent).toBe('Punkt');
  });
});
