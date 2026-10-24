import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

// public/_headers — składnia Cloudflare Pages: niewcięta linia = wzorzec URL, wcięte linie
// `Nazwa: wartość` (albo `! Nazwa` = odpięcie nagłówka z reguły ogólniejszej), `#` = komentarz.
// Limity Pages: max 100 reguł, max 2000 znaków na linię.
const raw = fs.readFileSync(path.resolve(__dirname, '../../public/_headers'), 'utf8');
const lines = raw.split('\n');

interface Rule {
  pattern: string;
  headers: Record<string, string>;
  detach: string[];
}

const rules: Rule[] = [];
for (const line of lines) {
  if (!line.trim() || line.trim().startsWith('#')) continue;
  if (!/^\s/.test(line)) {
    rules.push({ pattern: line.trim(), headers: {}, detach: [] });
    continue;
  }
  const cur = rules[rules.length - 1];
  const t = line.trim();
  if (t.startsWith('!')) {
    cur.detach.push(t.slice(1).trim().toLowerCase());
    continue;
  }
  const i = t.indexOf(':');
  cur.headers[t.slice(0, i).trim().toLowerCase()] = t.slice(i + 1).trim();
}

const rule = (pattern: string) => {
  const r = rules.find((x) => x.pattern === pattern);
  if (!r) throw new Error(`brak reguły ${pattern}`);
  return r;
};

/** Parsuje wartość CSP do mapy dyrektywa → źródła. */
const parseCsp = (v: string) =>
  Object.fromEntries(
    v
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const [name, ...src] = d.split(/\s+/);
        return [name, src];
      }),
  ) as Record<string, string[]>;

describe('public/_headers — składnia i limity Cloudflare Pages', () => {
  it('każda wcięta linia należy do reguły i ma postać `Nazwa: wartość` albo `! Nazwa`', () => {
    let seenRule = false;
    for (const line of lines) {
      if (!line.trim() || line.trim().startsWith('#')) continue;
      if (!/^\s/.test(line)) {
        expect(line.trim(), 'wzorzec URL zaczyna się od /').toMatch(/^\//);
        seenRule = true;
        continue;
      }
      expect(seenRule, `nagłówek bez reguły: ${line}`).toBe(true);
      expect(line.trim(), line).toMatch(/^(!\s*[A-Za-z0-9-]+|[A-Za-z0-9-]+:\s*\S.*)$/);
    }
  });

  it('mieści się w limitach: ≤ 100 reguł, ≤ 2000 znaków na linię', () => {
    expect(rules.length).toBeLessThanOrEqual(100);
    for (const line of lines) expect(line.length, line.slice(0, 60)).toBeLessThanOrEqual(2000);
  });

  it('wzorce się nie powtarzają (druga reguła o tym samym wzorcu skleja nagłówki)', () => {
    const patterns = rules.map((r) => r.pattern);
    expect(new Set(patterns).size).toBe(patterns.length);
  });
});

describe('public/_headers — polityka cache (bez regresji)', () => {
  it('HTML i reszta domyślnie: rewalidacja', () => {
    expect(rule('/*').headers['cache-control']).toBe('public, max-age=0, must-revalidate');
  });

  it('/assets/* (hash w nazwie): rok + immutable, z odpięciem wartości ogólnej', () => {
    const r = rule('/assets/*');
    expect(r.detach).toContain('cache-control');
    expect(r.headers['cache-control']).toBe('public, max-age=31536000, immutable');
  });

  it.each(['/assets/images/*', '/assets/team/*', '/assets/noise.svg'])(
    '%s (bez hasha): doba + stale-while-revalidate',
    (p) => {
      const r = rule(p);
      expect(r.detach).toContain('cache-control');
      expect(r.headers['cache-control']).toBe(
        'public, max-age=86400, stale-while-revalidate=604800',
      );
    },
  );
});

describe('public/_headers — panel /portal chroniony przed clickjackingiem', () => {
  it.each(['/portal', '/portal/*'])('%s: X-Frame-Options DENY + frame-ancestors none', (p) => {
    const r = rule(p);
    expect(r.headers['x-frame-options']).toBe('DENY');
    expect(parseCsp(r.headers['content-security-policy'])['frame-ancestors']).toEqual(["'none'"]);
  });

  it('wymuszana CSP panelu zawiera WYŁĄCZNIE frame-ancestors (nic poza ramkowaniem nie blokuje)', () => {
    for (const p of ['/portal', '/portal/*']) {
      expect(Object.keys(parseCsp(rule(p).headers['content-security-policy']))).toEqual([
        'frame-ancestors',
      ]);
    }
  });

  it('żadna inna reguła nie wymusza CSP (cała reszta strony: tylko Report-Only)', () => {
    for (const r of rules.filter((x) => !x.pattern.startsWith('/portal'))) {
      expect(r.headers['content-security-policy'], r.pattern).toBeUndefined();
    }
  });
});

describe('public/_headers — CSP Report-Only dla całej strony', () => {
  const value = rule('/*').headers['content-security-policy-report-only'];
  const csp = parseCsp(value ?? '');

  it('istnieje na /* i nie zawiera report-uri bez endpointu', () => {
    expect(value).toBeTruthy();
    expect(csp['report-uri']).toBeUndefined();
    expect(csp['report-to']).toBeUndefined();
  });

  it('frame-ancestors self, default-src self, object-src none, base-uri self', () => {
    expect(csp['frame-ancestors']).toEqual(["'self'"]);
    expect(csp['default-src']).toEqual(["'self'"]);
    expect(csp['object-src']).toEqual(["'none'"]);
    expect(csp['base-uri']).toEqual(["'self'"]);
  });

  it('obejmuje źródła, bez których strona przestałaby działać po wymuszeniu', () => {
    expect(csp['script-src']).toEqual(
      expect.arrayContaining(["'self'", 'https://challenges.cloudflare.com']),
    );
    expect(csp['frame-src']).toEqual(expect.arrayContaining(['https://challenges.cloudflare.com']));
    expect(csp['img-src']).toEqual(expect.arrayContaining(["'self'", 'https://cdn.sanity.io']));
    expect(csp['connect-src']).toEqual(
      expect.arrayContaining([
        "'self'",
        'https://*.api.sanity.io',
        'https://*.apicdn.sanity.io',
        'https://api.mixturemarketing.pl',
      ]),
    );
  });

  it('nie dopuszcza schematów-wytrychów w script-src (http:, https:, *)', () => {
    for (const s of csp['script-src'] ?? [])
      expect(['*', 'http:', 'https:', 'data:']).not.toContain(s);
  });
});
