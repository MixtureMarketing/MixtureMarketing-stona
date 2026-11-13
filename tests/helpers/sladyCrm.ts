import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

/**
 * Szukanie śladów dawnej wysyłki do Mixture CRM w drzewie functions/ (strażnik tests/archiwumCrm.test.ts).
 *
 * Dwa rodzaje trafień:
 *  - literał w wierszu: nazwa hosta z myślnikiem albo nazwa funkcji wysyłki;
 *  - tekst "zbity": z pliku znikają wszystkie znaki poza literami i cyframi (cudzysłowy, plusy, przecinki,
 *    kropki, myślniki, nawiasy), więc host sklejony w kodzie (`['mixture','crm.pages.dev'].join('-')`,
 *    `'mixture' + '-crm'`, szablon z dwóch zmiennych w jednym wyrażeniu) nadal się trafia.
 *
 * Skanowane są WSZYSTKIE pliki functions/ (także `*.test.ts`). Pomija się tylko katalog `_archiwum/`
 * (tam dawny moduł leży celowo, jako `.txt`) i jedyny wyjątek z WYJATKI.
 *
 * Granica: host złożony ze zmiennych zadeklarowanych w różnych miejscach pliku ten skan przepuści; taką
 * wysyłkę łapią testy zachowania (zero fetch do hosta i ścieżki CRM w contact-submit, capture-lead, public-quote).
 */

/** Wzorce na tekście zbitym (małe litery i cyfry): ogon hosta, ścieżka przyjmowania, nazwa funkcji. */
export const WZORCE_ZBITE = ['crmpagesdev', 'ingestlead', 'wyslijdocrm'] as const;
const WZORZEC_LITERALNY = /mixture-crm|wyslijDoCrm/i;
const WIERSZ_KOMENTARZA = /^\s*(\/\*|\*|\/\/)/;

/** Ścieżka względem functions/ → w tym pliku wolno wspominać dawny host, ale tylko w wierszach komentarza. */
export const WYJATKI: Readonly<Record<string, 'tylko-komentarze'>> = {
  'api/crm/leady.ts': 'tylko-komentarze',
};

export interface PlikFunkcji {
  sciezka: string;
  tresc: string;
}

export function znajdzSladyCrm(
  { sciezka, tresc }: PlikFunkcji,
  wyjatki: Readonly<Record<string, 'tylko-komentarze'>> = WYJATKI,
): string[] {
  const wiersze = tresc.split('\n');
  const brane =
    wyjatki[sciezka] === 'tylko-komentarze'
      ? wiersze.filter((w) => !WIERSZ_KOMENTARZA.test(w))
      : wiersze;
  const trafienia = brane
    .filter((w) => WZORZEC_LITERALNY.test(w))
    .map((w) => `${sciezka}: literał: ${w.trim()}`);
  const zbity = brane
    .join('\n')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  for (const wzorzec of WZORCE_ZBITE) {
    if (zbity.includes(wzorzec)) trafienia.push(`${sciezka}: sklejone: ${wzorzec}`);
  }
  return trafienia;
}

/** Wszystkie pliki functions/ poza `_archiwum/`, ścieżki względne z ukośnikami. */
export function wczytajFunkcje(korzen: string): PlikFunkcji[] {
  const idz = (katalog: string): string[] =>
    readdirSync(katalog).flatMap((nazwa) => {
      const pelna = path.join(katalog, nazwa);
      return statSync(pelna).isDirectory() ? idz(pelna) : [pelna];
    });
  return idz(korzen)
    .map((p) => path.relative(korzen, p).split(path.sep).join('/'))
    .filter((s) => s !== '_archiwum' && !s.startsWith('_archiwum/'))
    .map((sciezka) => ({ sciezka, tresc: readFileSync(path.join(korzen, sciezka), 'utf8') }));
}

export function sladyWDrzewie(pliki: PlikFunkcji[]): string[] {
  return pliki.flatMap((p) => znajdzSladyCrm(p));
}
