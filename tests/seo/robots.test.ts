import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

// Regresja: grupy per User-agent nadpisują grupę `*` w całości (RFC 9309), więc
// nazwane boty (GPTBot, Bingbot…) z samym `Allow: /` mogły crawlować /api/ i /portal/.
// Każda grupa, która nie blokuje całego serwisu, musi powtarzać te blokady.
const robots = fs.readFileSync(path.resolve(__dirname, '../../public/robots.txt'), 'utf8');

type Group = { agents: string[]; rules: string[] };

const parseGroups = (txt: string): Group[] => {
  const groups: Group[] = [];
  let current: Group | null = null;
  for (const raw of txt.split('\n')) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const [key, ...rest] = line.split(':');
    const value = rest.join(':').trim();
    if (/^user-agent$/i.test(key)) {
      if (!current || current.rules.length) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value);
    } else if (current && /^(allow|disallow)$/i.test(key)) {
      current.rules.push(`${key.toLowerCase()}:${value}`);
    }
  }
  return groups;
};

describe('public/robots.txt', () => {
  const groups = parseGroups(robots);

  it('każda grupa bez pełnej blokady ma Disallow dla /api/, /portal/ i /admin/', () => {
    const open = groups.filter((g) => !g.rules.includes('disallow:/'));
    expect(open.length).toBeGreaterThan(1);
    for (const g of open) {
      for (const p of ['/api/', '/portal/', '/admin/']) {
        expect(g.rules, `${g.agents.join(', ')} → brak Disallow: ${p}`).toContain(`disallow:${p}`);
      }
    }
  });

  it('zawiera aktualne UA Anthropic (Claude-SearchBot, Claude-User)', () => {
    const agents = groups.flatMap((g) => g.agents);
    expect(agents).toEqual(expect.arrayContaining(['Claude-SearchBot', 'Claude-User']));
  });

  it('nie ma reguł po WooCommerce (strona nie ma sklepu)', () => {
    expect(robots).not.toMatch(/wc-ajax/i);
  });
});
