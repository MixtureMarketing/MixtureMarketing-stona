import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOST_CRM, URL_CRM_INGEST } from './helpers/hostCrm';
import { WZORCE_ZBITE, sladyWDrzewie, wczytajFunkcje, znajdzSladyCrm } from './helpers/sladyCrm';

// Strona nie wysyła leadów do Mixture CRM, a dawny moduł leży w functions/_archiwum/ z rozszerzeniem
// .txt. Cloudflare Pages buduje trasę z każdego pliku .js/.mjs/.ts/.tsx/.jsx w functions/, więc plik
// z takim rozszerzeniem w _archiwum/ (albo ożywiony _crm.ts) wróciłby jako trasa.
const KORZEN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'functions');
const ROZSZERZENIA_TRAS = /\.(js|mjs|ts|tsx|jsx)$/;

function pliki(katalog: string): string[] {
  return readdirSync(katalog).flatMap((nazwa) => {
    const pelna = path.join(katalog, nazwa);
    return statSync(pelna).isDirectory() ? pliki(pelna) : [pelna];
  });
}

const wzgledne = pliki(KORZEN).map((p) => path.relative(KORZEN, p).split(path.sep).join('/'));

describe('archiwum _crm', () => {
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
});

describe('strażnik: functions/ nie wspomina dawnego CRM', () => {
  const drzewo = wczytajFunkcje(KORZEN);

  it('skan obejmuje kod produkcyjny i pliki *.test.ts, a pomija tylko _archiwum', () => {
    const sciezki = drzewo.map((p) => p.sciezka);
    expect(sciezki).toContain('api/contact-submit.ts');
    expect(sciezki).toContain('api/contact-submit.test.ts');
    expect(sciezki).toContain('api/crm/leady.ts');
    expect(sciezki.filter((s) => s.startsWith('_archiwum'))).toEqual([]);
    const wArchiwum = wzgledne.filter((s) => s.startsWith('_archiwum/')).length;
    expect(wArchiwum).toBeGreaterThanOrEqual(2);
    expect(drzewo.length).toBe(wzgledne.length - wArchiwum);
  });

  it('(−) w całym drzewie functions/ (kod i testy) zero śladów: literał, host sklejony, ścieżka, funkcja', () => {
    expect(sladyWDrzewie(drzewo)).toEqual([]);
  });

  it('(+) literał w kodzie produkcyjnym jest trafiony', () => {
    const kod = `const U = 'https://${HOST_CRM}/api/x';`;
    expect(znajdzSladyCrm({ sciezka: 'api/a.ts', tresc: kod })).toEqual(
      expect.arrayContaining([expect.stringContaining('api/a.ts: literał:')]),
    );
    expect(
      znajdzSladyCrm({ sciezka: 'api/a.ts', tresc: 'await wyslijDoCrmWTle(w, env, x);' }),
    ).not.toEqual([]);
  });

  it.each([
    ['tablica z join', "const h = ['mixture', 'crm.pages.dev'].join('-');"],
    ['konkatenacja', "const h = 'mixture' + '-crm' + '.pages' + '.dev';"],
    ['szablon ze stałą w wyrażeniu', 'const h = `mixture-${"crm"}.pages.dev`;'],
    ['sam ogon hosta w innym wierszu', "const ogon = 'crm.pages.dev';\nconst glowa = 'mixture';"],
    ['ścieżka przyjmowania w kawałkach', "fetch(base + ['/api/ingest', '/lead'].join(''));"],
    ['ścieżka w szablonie', 'fetch(`${base}/api/ingest/${"lead"}`);'],
    ['nazwa funkcji', 'import { wyslijDoCrmWTle } from "./_crm";'],
  ])('(+) kod produkcyjny: %s', (_nazwa, kod) => {
    expect(znajdzSladyCrm({ sciezka: 'api/nowy.ts', tresc: kod })).not.toEqual([]);
  });

  it('(+) ten sam host sklejony w pliku *.test.ts też jest trafiony (brak pominięcia po nazwie)', () => {
    const kod = "const h = ['mixture', 'crm.pages.dev'].join('-');";
    expect(znajdzSladyCrm({ sciezka: 'api/nowy.test.ts', tresc: kod })).not.toEqual([]);
    expect(
      sladyWDrzewie([
        { sciezka: 'api/ok.ts', tresc: 'export const x = 1;' },
        { sciezka: 'api/zly.test.ts', tresc: kod },
      ]),
    ).toEqual([expect.stringContaining('api/zly.test.ts: sklejone: crmpagesdev')]);
  });

  it('(+) host złożony przez helper testowy (jak w testach) jest trafiony po złożeniu w kodzie', () => {
    const zlozony = `fetch("${URL_CRM_INGEST}");`;
    expect(znajdzSladyCrm({ sciezka: 'api/b.ts', tresc: zlozony }).length).toBeGreaterThan(1);
  });

  it('(−) czysty kod i zwykłe wzmianki o CRM nie są trafieniem', () => {
    const czysty = [
      "import { json } from './_podpis';",
      '// Mixture CRM dociąga leady przez GET /api/crm/leady',
      'export const onRequestGet = async () => json({ ok: true, ingest: 1, lead: 2 }); // pages',
    ].join('\n');
    expect(znajdzSladyCrm({ sciezka: 'api/crm/inny.ts', tresc: czysty })).toEqual([]);
  });

  it('(−) wyjątek crm/leady.ts: wzmianka w komentarzu przechodzi, ten sam host w kodzie tego pliku nie', () => {
    const komentarz = [
      '/**',
      ` * Wysyłka do Mixture CRM (${HOST_CRM}.pages.dev/api/ingest/lead) jest wyłączona.`,
      ' */',
      '/** Dawny `/api/ingest/lead`. */',
      '// crm.pages.dev',
    ].join('\n');
    expect(znajdzSladyCrm({ sciezka: 'api/crm/leady.ts', tresc: komentarz })).toEqual([]);
    // ten sam komentarz w innym pliku jest trafieniem: wyjątek dotyczy jednego pliku
    expect(znajdzSladyCrm({ sciezka: 'api/contact-submit.ts', tresc: komentarz })).not.toEqual([]);
    const wKodzie = `${komentarz}\nconst h = ['mixture', 'crm.pages.dev'].join('-');`;
    expect(znajdzSladyCrm({ sciezka: 'api/crm/leady.ts', tresc: wKodzie })).not.toEqual([]);
  });

  it('wzorce zbite są w małych literach i bez znaków specjalnych (inaczej nigdy nie trafią)', () => {
    for (const w of WZORCE_ZBITE) expect(w).toMatch(/^[a-z0-9]+$/);
  });
});
