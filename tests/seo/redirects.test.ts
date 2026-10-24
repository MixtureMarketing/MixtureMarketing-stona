import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { routes } from '../../routes.js';

// public/_redirects: pierwsza pasująca reguła wygrywa, catch-all `/*` musi być ostatni.
const rules = fs
  .readFileSync(path.resolve(__dirname, '../../public/_redirects'), 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [from, to, status] = l.split(/\s+/);
    return { from, to, status };
  });

const ALIASES: Record<string, string> = {
  '/kontakt': '/contact/',
  '/oferta': '/offers/',
  '/realizacje': '/portfolio/',
};

describe('public/_redirects — polskie aliasy URL', () => {
  it('catch-all 404 jest ostatnią regułą', () => {
    expect(rules[rules.length - 1]).toEqual({ from: '/*', to: '/404.html', status: '404' });
  });

  it.each(Object.entries(ALIASES))('%s (z i bez slasha) → 301 %s', (alias, target) => {
    for (const from of [alias, `${alias}/`]) {
      const idx = rules.findIndex((r) => r.from === from);
      expect(idx, from).toBeGreaterThanOrEqual(0);
      expect(rules[idx]).toEqual({ from, to: target, status: '301' });
      expect(idx).toBeLessThan(rules.length - 1);
    }
    // Cel to realna, prerenderowana trasa (nie łańcuch przekierowań do 404).
    expect(routes).toContain(target);
    // Alias nie koliduje z istniejącą trasą.
    expect(routes).not.toContain(`${alias}/`);
  });
});
