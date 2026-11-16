import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { routes, prerenderOnlyRoutes } from '../routes.js';

const root = path.resolve(__dirname, '..');
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

describe('routes.js — trasy prerenderu vs sitemap', () => {
  it('ukryta strona usługi AI jest prerenderowana, ale NIE ma jej w liście sitemapy', () => {
    // MIX-1849: dawny przykład (/abonament/dziekujemy/) usunięty razem z usługą.
    expect(prerenderOnlyRoutes).toContain('/web-development/systemy-ai-aplikacje/');
    expect(routes).not.toContain('/web-development/systemy-ai-aplikacje/');
    expect(routes).not.toContain('/web-development/systemy-ai-aplikacje');
  });

  it('listy są rozłączne i mają trailing slash', () => {
    for (const r of prerenderOnlyRoutes) {
      expect(r.endsWith('/')).toBe(true);
      expect(routes).not.toContain(r);
    }
  });

  it('generator sitemapy czyta wyłącznie `routes` (nie prerenderOnlyRoutes)', () => {
    const src = read('scripts/generate-sitemap.js');
    expect(src).not.toMatch(/prerenderOnlyRoutes/);
    expect(src).toMatch(/import \{ routes \} from '\.\.\/routes\.js'/);
  });

  it('prerender.js dokłada prerenderOnlyRoutes do kolejki', () => {
    const src = read('prerender.js');
    expect(src).toMatch(/import \{ routes, prerenderOnlyRoutes \} from '\.\/routes\.js'/);
    expect(src).toMatch(/\.\.\.prerenderOnlyRoutes/);
  });
});
