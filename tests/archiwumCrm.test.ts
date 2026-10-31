import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// MIX-625: strona nie wysyła leadów do Mixture CRM, a dawny moduł leży w functions/_archiwum/ z
// rozszerzeniem .txt. Cloudflare Pages buduje trasę z każdego pliku .js/.mjs/.ts/.tsx/.jsx w functions/,
// więc plik z takim rozszerzeniem w _archiwum/ (albo ożywiony _crm.ts) wróciłby jako trasa.
const KORZEN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'functions');
const ROZSZERZENIA_TRAS = /\.(js|mjs|ts|tsx|jsx)$/;

function pliki(katalog: string): string[] {
  return readdirSync(katalog).flatMap((nazwa) => {
    const pelna = path.join(katalog, nazwa);
    return statSync(pelna).isDirectory() ? pliki(pelna) : [pelna];
  });
}

const wzgledne = pliki(KORZEN).map((p) => path.relative(KORZEN, p).split(path.sep).join('/'));

describe('archiwum _crm (MIX-625)', () => {
  it('moduły CRM są w functions/_archiwum jako .txt (nic nie skasowane)', () => {
    expect(existsSync(path.join(KORZEN, '_archiwum', '_crm.ts.txt'))).toBe(true);
    expect(existsSync(path.join(KORZEN, '_archiwum', '_crm.test.ts.txt'))).toBe(true);
  });

  it('żaden plik z _archiwum nie ma rozszerzenia trasy Pages (lista tras nie zawiera _archiwum)', () => {
    const trasy = wzgledne.filter((p) => ROZSZERZENIA_TRAS.test(p));
    expect(trasy.length).toBeGreaterThan(5); // sanity: lista tras nie jest pusta
    expect(trasy.filter((p) => p.includes('_archiwum'))).toEqual([]);
  });

  it('dawnego modułu nie ma już wśród plików trasy (api/_crm.ts, api/_crm.test.ts)', () => {
    expect(wzgledne).not.toContain('api/_crm.ts');
    expect(wzgledne).not.toContain('api/_crm.test.ts');
  });

  it('kod funkcji nie wspomina mixture-crm ani wyslijDoCrm (poza komentarzem w crm/leady.ts)', () => {
    const trafienia = wzgledne
      .filter((p) => p.endsWith('.ts') && !p.endsWith('.test.ts'))
      .flatMap((p) =>
        readFileSync(path.join(KORZEN, p), 'utf8')
          .split('\n')
          .filter((l) => /mixture-crm|wyslijDoCrm/.test(l))
          // dozwolony jedyny wyjątek: wiersz komentarza blokowego w crm/leady.ts
          .filter((l) => !(p === 'api/crm/leady.ts' && /^\s*\*/.test(l)))
          .map((l) => `${p}: ${l.trim()}`),
      );
    expect(trafienia).toEqual([]);
  });
});
