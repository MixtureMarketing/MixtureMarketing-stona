// Kontrola workflow CI (.github/workflows/ci.yml): push na dev i ręczne uruchomienie na dev wdrażają
// Preview, main tylko po push i po strażniku powtórek, pull requesty nigdy nie wdrażają, a Preview
// buduje się ze WSZYSTKIMI przełącznikami VITE_MM_* włączonymi (MIX-1411), produkcja tylko z tymi
// z WLACZONE_NA_PROD (MIX-1465, MIX-1833, MIX-1838); konfigurator wyceny (MIX-1377) na produkcji wyłączony.
// Cel wdrożenia wyznacza skrypt scripts/ci-deploy-guard.sh (czuły na wielkość liter; jego testy:
// tests/scripts/ciDeployGuard.test.ts). Tu: prawdziwy plik YAML, też na wariantach psutych celowo
// (każda odmowa ma swojego dozwolonego bliźniaka).
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { parse } from 'yaml';

const root = path.resolve(__dirname, '../..');
const plik = path.join(root, '.github/workflows/ci.yml');

type Krok = {
  name?: string;
  id?: string;
  if?: string;
  uses?: string;
  run?: string;
  env?: Record<string, string>;
  with?: Record<string, string>;
  'continue-on-error'?: boolean;
};
type Zadanie = { env?: Record<string, string>; steps: Krok[]; [k: string]: unknown };
type Workflow = {
  on: { push: { branches: string[] }; pull_request?: { branches?: string[] } };
  env?: Record<string, string>;
  jobs: { ci: Zadanie } & Record<string, Zadanie>;
};

const wczytaj = (): Workflow => parse(fs.readFileSync(plik, 'utf8')) as Workflow;

const IF_PROD = "steps.target.outputs.target == 'prod'";
const IF_PREVIEW = "steps.target.outputs.target == 'preview'";
const RUN_TARGET = 'bash scripts/ci-deploy-guard.sh target >> "$GITHUB_OUTPUT"';
const RUN_GUARD = 'bash scripts/ci-deploy-guard.sh main-tip';
const KOMENDA_MAIN =
  'pages deploy dist --project-name=mixturemarketing-stona --branch=main --commit-dirty=true --commit-message="${{ steps.commit.outputs.msg }}" --commit-hash=${{ github.sha }}';
const KOMENDA_DEV =
  'pages deploy dist --project-name=mixturemarketing-stona --branch=dev --commit-dirty=true --commit-message="${{ steps.commit_dev.outputs.msg }}" --commit-hash=${{ github.sha }}';

/** Zmienne VITE_MM_*, które są wartościami konfiguracji, nie przełącznikami funkcji. */
const NIE_PRZELACZNIKI = new Set(['VITE_MM_HUB_URL', 'VITE_MM_PREONBOARD_KEY']);
/** Przełączniki włączone także na produkcji decyzją właściciela. */
const WLACZONE_NA_PROD = new Set([
  'VITE_MM_MOBILE_MENU_B', // MIX-1465: menu mobilne B
  'VITE_MM_VIEW_TRANSITIONS', // MIX-1311/MIX-1833: animacja przejść realizacji (akceptacja na Preview)
  // MIX-1311/MIX-1838: gotowe funkcje włączone jednym wdrożeniem (decyzja Jakuba 16.11)
  'VITE_MM_POWIAZANE', // MIX-1268: blok „Powiązane”
  'VITE_MM_COOKIE_BANNER_STATIC', // MIX-1579: baner ciasteczek w HTML
  'VITE_MM_TESTIMONIALS', // MIX-1326: opinie Google
  'VITE_MM_RZESZOW_SEKCJE', // MIX-1286: sekcje Rzeszów
  'VITE_MM_AI_SECTION', // MIX-1276: sekcja o AI i systemach
]);
/** Konfigurator wyceny w budowie (MIX-1377): Preview 1, produkcja i PR puste. */
const WYCENA_WYLACZONA_NA_PROD = [
  'VITE_MM_BOOKING_EMBED', // MIX-1814: harmonogram rozmów pod wynikiem (Z9)
  'VITE_MM_CONFIG_LINK',
  'VITE_MM_CONFIG_PREVIEW',
  'VITE_MM_LEAD_CONFIG', // MIX-1813: lead z konfiguracją (Z10)
  'VITE_MM_LIVE_PRICE_BAR',
];
/** Strona /cennik/ (MIX-1855): Preview 1, produkcja i PR puste do akceptacji Jakuba. */
const CENNIK_WYLACZONY_NA_PROD = ['VITE_MM_CENNIK'];
/** Wszystkie przełączniki wyłączone na produkcji (kolejność alfabetyczna jak lista z kodu). */
const WYLACZONE_NA_PROD = [...CENNIK_WYLACZONY_NA_PROD, ...WYCENA_WYLACZONA_NA_PROD].sort();
const WYRAZENIE_PREVIEW = "${{ steps.target.outputs.target == 'preview' && '1' || '' }}";

const wdrozenia = (w: Workflow) =>
  w.jobs.ci.steps.filter((k) => (k.uses ?? '').startsWith('cloudflare/wrangler-action'));
// Kroki wdrożeń rozpoznajemy po nazwie (komenda bywa psuta w testach, więc nie po niej).
const wdrozenieMain = (w: Workflow) =>
  wdrozenia(w).find((k) => !(k.name ?? '').includes('Preview dev'));
const wdrozenieDev = (w: Workflow) =>
  wdrozenia(w).find((k) => (k.name ?? '').includes('Preview dev'));
const krokBuild = (w: Workflow) => w.jobs.ci.steps.find((k) => k.run === 'npm run build')!;
/** Zmienne środowiska kroku budowy (rozszerzalny słownik, żeby testy mogły je psuć). */
const zmienneBuildu = (w: Workflow): Record<string, string> => {
  const k = krokBuild(w);
  k.env = k.env ?? {};
  return k.env;
};

/** Przełączniki VITE_MM_* czytane przez kod aplikacji (bez testów, skryptów pomiarowych, dokumentów). */
function przelacznikiZKodu(): string[] {
  const pomin = new Set([
    'node_modules',
    'dist',
    '.git',
    '.bieg',
    'tests',
    'scripts',
    'docs',
    'coverage',
    '.github',
    'studio-mixture-marketing',
    'public',
  ]);
  const znalezione = new Set<string>();
  const wzorzec = /VITE_MM_[A-Z0-9]+(?:_[A-Z0-9]+)*/g;
  const idz = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (!pomin.has(e.name)) idz(path.join(dir, e.name));
      } else if (/\.(tsx?|jsx?|mjs|cjs)$/.test(e.name) && !/\.(test|spec)\./.test(e.name)) {
        const tekst = fs.readFileSync(path.join(dir, e.name), 'utf8');
        for (const m of tekst.matchAll(wzorzec)) znalezione.add(m[0]);
      }
    }
  };
  idz(root);
  return [...znalezione].filter((n) => !NIE_PRZELACZNIKI.has(n)).sort();
}

/**
 * Wartość zmiennej budowy dla celu (`prod` | `preview` | `none`); nieznana postać wyrażenia = błąd.
 * Allowlista (MIX-1846, mutant M2): włączone wyłącznie dokładnie napis '1' albo wyrażenie
 * tylko-dla-celu; 'true', ' 1', '1 ', 'yes', same spacje, liczba 1 i bool true = błąd.
 */
function wartoscFlagi(wyrazenie: unknown, cel: string): string {
  if (typeof wyrazenie !== 'string')
    throw new Error(`nieznana postać wyrażenia flagi: ${JSON.stringify(wyrazenie)} (nie napis)`);
  if (wyrazenie === '1') return '1';
  const m = /^\$\{\{ steps\.target\.outputs\.target == '(\w+)' && '1' \|\| '' \}\}$/.exec(
    wyrazenie,
  );
  if (!m) throw new Error(`nieznana postać wyrażenia flagi: ${JSON.stringify(wyrazenie)}`);
  return cel === m[1] ? '1' : '';
}

/** Postać zmiennych konfiguracji w kroku budowy przypięta do obecnej (MIX-1846, forma O3/A10). */
const PRZYPIETE: Record<string, string> = {
  VITE_MM_PREONBOARD_KEY: '${{ secrets.VITE_MM_PREONBOARD_KEY }}',
  VITE_MM_HUB_URL: "${{ vars.VITE_MM_HUB_URL || 'https://api.mixturemarketing.pl' }}",
};
const WZOR_VITE_MM = /VITE_MM_/i;
const WZOR_BUDOWY = /\bvite\b[^\n]*\bbuild\b|\bnpm\s+run\s+build|\bnpm\s+run-script\s+build/;
const nazwaKroku = (k: Krok, i: number) => k.name ?? k.id ?? `#${i}`;

/**
 * MIX-1846 (allowlista, fail-closed): przełączniki i zmienne VITE_MM_* żyją WYŁĄCZNIE w env
 * kanonicznego kroku `npm run build` zadania ci. Sprawdzane są env całego workflow, env (i reszta
 * pól) każdego zadania oraz każdy krok każdego zadania: inny krok budowy, wpis w `run:`, zapis do
 * $GITHUB_ENV albo nieznany klucz VITE_MM_* w buildzie = naruszenie.
 */
function naruszeniaZasiegu(w: Workflow): string[] {
  const bledy: string[] = [];
  const build = krokBuild(w);
  const { jobs, ...reszta } = w;
  if (WZOR_VITE_MM.test(JSON.stringify(reszta)))
    bledy.push('workflow: VITE_MM_* poza krokiem budowy');
  for (const [id, zad] of Object.entries(jobs ?? {})) {
    const { steps, ...polaZadania } = zad;
    if (WZOR_VITE_MM.test(JSON.stringify(polaZadania)))
      bledy.push(`zadanie „${id}”: VITE_MM_* poza krokiem budowy`);
    (steps ?? []).forEach((k, i) => {
      const n = nazwaKroku(k, i);
      if (k === build) {
        const bezEnv: Partial<Krok> = { ...k };
        delete bezEnv.env;
        if (WZOR_VITE_MM.test(JSON.stringify(bezEnv)))
          bledy.push(`krok „${n}”: VITE_MM_* poza env kroku budowy`);
        return;
      }
      if (WZOR_VITE_MM.test(JSON.stringify(k)))
        bledy.push(`krok „${n}”: VITE_MM_* poza krokiem budowy`);
      if (WZOR_BUDOWY.test(String(k.run ?? '')))
        bledy.push(`krok „${n}”: budowa poza krokiem budowy`);
      if (/GITHUB_ENV/i.test(JSON.stringify(k))) bledy.push(`krok „${n}”: zapis do $GITHUB_ENV`);
    });
  }
  const env = build?.env ?? {};
  const znane = new Set([...przelacznikiZKodu(), ...NIE_PRZELACZNIKI]);
  for (const klucz of Object.keys(env))
    if (WZOR_VITE_MM.test(klucz) && !znane.has(klucz)) bledy.push(`build: nieznany klucz ${klucz}`);
  for (const [klucz, postac] of Object.entries(PRZYPIETE))
    if (env[klucz] !== postac)
      bledy.push(`${klucz}: zmieniona postać (przypięta do sekretu/zmiennej)`);
  return bledy;
}

/** Lista naruszeń reguł CI (pusta = poprawne). */
function naruszenia(w: Workflow): string[] {
  const bledy: string[] = [];
  const kroki = w.jobs.ci.steps;
  if (!w.on.push.branches.includes('dev')) bledy.push('push nie obejmuje dev');
  for (const b of ['main', 'master'])
    if (!w.on.push.branches.includes(b)) bledy.push(`push nie obejmuje ${b}`);
  if ((w.on.pull_request?.branches ?? []).includes('dev'))
    bledy.push('PR na dev uruchamia CI z wdrożeniem');
  // Żaden warunek nie może sam porównywać ref/zdarzenia: `==` w Actions ignoruje wielkość liter.
  for (const k of kroki)
    if (/github\.(ref|event_name)/.test(k.if ?? ''))
      bledy.push(
        `krok „${k.name}”: warunek na github.ref/event_name (bez rozróżnienia wielkości liter)`,
      );
  const iTarget = kroki.findIndex((k) => k.id === 'target');
  if (iTarget < 0) bledy.push('brak kroku target');
  else {
    if (kroki[iTarget].run !== RUN_TARGET) bledy.push('krok target nie woła skryptu strażnika');
    if (kroki[iTarget].if) bledy.push('krok target ma warunek');
  }
  const wd = wdrozenia(w);
  if (wd.length !== 2) bledy.push(`oczekiwano 2 wdrożeń, jest ${wd.length}`);
  const main = wdrozenieMain(w);
  const dev = wdrozenieDev(w);
  if (!main) bledy.push('brak wdrożenia main');
  else {
    if (main.if !== IF_PROD) bledy.push('wdrożenie main nie wymaga target=prod');
    if (main.with?.command.includes('--branch=dev'))
      bledy.push('wdrożenie main używa --branch=dev');
  }
  if (!dev) bledy.push('brak wdrożenia dev');
  else {
    if (dev.if !== IF_PREVIEW) bledy.push('wdrożenie dev nie wymaga target=preview');
    if (dev.with?.command.includes('--branch=main'))
      bledy.push('wdrożenie na dev nie używa --branch=dev');
  }
  for (const k of wd) {
    if (
      !(k.with?.command ?? '').startsWith(
        'pages deploy dist --project-name=mixturemarketing-stona ',
      )
    )
      bledy.push(`wdrożenie „${k.name}”: zła komenda`);
    if (kroki.indexOf(k) < iTarget) bledy.push(`wdrożenie „${k.name}” przed krokiem target`);
  }
  // Strażnik powtórek: przed wdrożeniem produkcji, ten sam warunek, bez continue-on-error.
  const strazPos = kroki.findIndex((k) => k.run === RUN_GUARD);
  if (strazPos < 0) bledy.push('brak strażnika powtórek (main-tip)');
  else {
    const s = kroki[strazPos];
    if (s.if !== IF_PROD) bledy.push('strażnik powtórek nie wymaga target=prod');
    if (s['continue-on-error']) bledy.push('strażnik powtórek nie blokuje (continue-on-error)');
    if (main && strazPos > kroki.indexOf(main)) bledy.push('strażnik powtórek po wdrożeniu main');
  }
  // Kroki jakości (bez `if`, więc idą też na dev) poprzedzają oba wdrożenia.
  const jakosc = [
    ['npm run lint', 'lint'],
    ['npx tsc --noEmit -p tsconfig.json', 'tsc'],
    ['npx tsc --noEmit -p functions/tsconfig.json', 'tsc functions'],
    ['npm run test -- --run', 'testy'],
    ['npm run build', 'build'],
  ];
  for (const [run, nazwa] of jakosc) {
    const i = kroki.findIndex((k) => k.run === run);
    if (i < 0) bledy.push(`brak kroku ${nazwa}`);
    else {
      if (kroki[i].if) bledy.push(`krok ${nazwa} ma warunek (nie pójdzie na dev)`);
      for (const d of [main, dev])
        if (d && kroki.indexOf(d) < i) bledy.push(`wdrożenie przed krokiem ${nazwa}`);
    }
  }
  // Przełączniki: każdy z kodu jest w buildzie; w Preview '1', na produkcji i w PR puste (poza MIX-1465).
  const zmienne = krokBuild(w)?.env ?? {};
  for (const f of przelacznikiZKodu()) {
    const wyr = zmienne[f];
    if (wyr === undefined) {
      bledy.push(`build bez ${f}`);
      continue;
    }
    let preview = '';
    let prod = '';
    let poza = '';
    try {
      preview = wartoscFlagi(wyr, 'preview');
      prod = wartoscFlagi(wyr, 'prod');
      poza = wartoscFlagi(wyr, 'none');
    } catch (e) {
      bledy.push(`${f}: ${(e as Error).message}`);
      continue;
    }
    const naProd = WLACZONE_NA_PROD.has(f) ? '1' : '';
    if (preview !== '1') bledy.push(`${f} nie jest włączony w Preview`);
    if (prod !== naProd) bledy.push(`${f}: zła wartość na produkcji (${JSON.stringify(prod)})`);
    if (poza !== naProd) bledy.push(`${f}: zła wartość poza wdrożeniem (${JSON.stringify(poza)})`);
  }
  bledy.push(...naruszeniaZasiegu(w));
  return bledy;
}

const kopia = (): Workflow => structuredClone(wczytaj());
const krokiCi = (w: Workflow) => w.jobs.ci.steps;
const wstawPoBuildzie = (w: Workflow, k: Krok) =>
  krokiCi(w).splice(krokiCi(w).indexOf(krokBuild(w)) + 1, 0, k);
const wstawPrzedBuildem = (w: Workflow, k: Krok) =>
  krokiCi(w).splice(krokiCi(w).indexOf(krokBuild(w)), 0, k);

describe('ci.yml: wdrożenie Preview z gałęzi dev i produkcji z main', () => {
  it('prawdziwy plik spełnia wszystkie reguły', () => {
    expect(naruszenia(wczytaj())).toEqual([]);
  });

  it('push obejmuje main, master i dev; pull_request nie obejmuje dev', () => {
    const w = wczytaj();
    expect(w.on.push.branches).toEqual(['main', 'master', 'dev']);
    expect(w.on.pull_request?.branches).toEqual(['main', 'master']);
  });

  it('cel wyznacza skrypt (krok target), a nie wyrażenie github.ref', () => {
    const k = wczytaj().jobs.ci.steps.find((x) => x.id === 'target');
    expect(k?.run).toBe(RUN_TARGET);
    expect(k?.if).toBeUndefined();
  });

  it('wdrożenie dev: target=preview i dokładna komenda', () => {
    const dev = wdrozenieDev(wczytaj());
    expect(dev?.if).toBe(IF_PREVIEW);
    expect(dev?.with?.command).toBe(KOMENDA_DEV);
  });

  it('wdrożenie main: target=prod, dokładna komenda, strażnik powtórek przed nim', () => {
    const w = wczytaj();
    const main = wdrozenieMain(w)!;
    expect(main.if).toBe(IF_PROD);
    expect(main.with?.command).toBe(KOMENDA_MAIN);
    expect(main.with?.wranglerVersion).toBe('4');
    const kroki = w.jobs.ci.steps;
    const straz = kroki.find((k) => k.run === RUN_GUARD)!;
    expect(straz.if).toBe(IF_PROD);
    expect(kroki.indexOf(straz)).toBeLessThan(kroki.indexOf(main));
  });

  it('kroki sanityzacji: main tylko dla prod, dev tylko dla preview', () => {
    const kroki = wczytaj().jobs.ci.steps;
    expect(kroki.find((x) => x.id === 'commit')?.if).toBe(IF_PROD);
    const dev = kroki.find((x) => x.id === 'commit_dev');
    expect(dev?.if).toBe(IF_PREVIEW);
    expect(dev?.run).toContain('(dev)');
  });

  it('żaden warunek nie porównuje github.ref ani github.event_name', () => {
    for (const k of wczytaj().jobs.ci.steps)
      expect(k.if ?? '').not.toMatch(/github\.(ref|event_name)/);
  });
});

describe('ci.yml: przełączniki VITE_MM_* (MIX-1411: Preview włączone; produkcja = WLACZONE_NA_PROD)', () => {
  it('lista z kodu jest niepusta i zawiera znane przełączniki (kontrola grepa)', () => {
    const lista = przelacznikiZKodu();
    expect(lista.length).toBeGreaterThanOrEqual(5);
    for (const f of [
      'VITE_MM_MOBILE_MENU_B',
      'VITE_MM_TESTIMONIALS',
      'VITE_MM_VIEW_TRANSITIONS',
      'VITE_MM_LIVE_PRICE_BAR',
      'VITE_MM_COOKIE_BANNER_STATIC',
    ])
      expect(lista).toContain(f);
    for (const n of NIE_PRZELACZNIKI) expect(lista).not.toContain(n);
  });

  it('build Preview ustawia KAŻDY przełącznik z kodu na 1', () => {
    const zmienne = zmienneBuildu(wczytaj());
    for (const f of przelacznikiZKodu()) expect(wartoscFlagi(zmienne[f], 'preview')).toBe('1');
  });

  it('build produkcji i PR: puste poza WLACZONE_NA_PROD (MIX-1465, MIX-1833, MIX-1838)', () => {
    const zmienne = zmienneBuildu(wczytaj());
    for (const f of przelacznikiZKodu()) {
      const oczekiwane = WLACZONE_NA_PROD.has(f) ? '1' : '';
      expect(wartoscFlagi(zmienne[f], 'prod')).toBe(oczekiwane);
      expect(wartoscFlagi(zmienne[f], 'none')).toBe(oczekiwane);
    }
  });
});

describe('ci.yml: warianty psute celowo są wykrywane (negatywne nogi)', () => {
  it('bez dev w push', () => {
    const w = kopia();
    w.on.push.branches = ['main', 'master'];
    expect(naruszenia(w)).toContain('push nie obejmuje dev');
  });
  it('wdrożenie dev bez żadnego warunku', () => {
    const w = kopia();
    delete wdrozenieDev(w)!.if;
    expect(naruszenia(w)).toContain('wdrożenie dev nie wymaga target=preview');
  });
  it('wdrożenie dev z warunkiem na github.ref (bez rozróżnienia wielkości liter)', () => {
    const w = kopia();
    wdrozenieDev(w)!.if = "github.event_name == 'push' && github.ref == 'refs/heads/dev'";
    const b = naruszenia(w).join('|');
    expect(b).toMatch(/warunek na github\.ref\/event_name/);
    expect(b).toMatch(/wdrożenie dev nie wymaga target=preview/);
  });
  it('wdrożenie dev na celu prod', () => {
    const w = kopia();
    wdrozenieDev(w)!.if = IF_PROD;
    expect(naruszenia(w)).toContain('wdrożenie dev nie wymaga target=preview');
  });
  it('wdrożenie dev pushuje na --branch=main (nadpisałoby produkcję)', () => {
    const w = kopia();
    const dev = wdrozenieDev(w)!;
    dev.with!.command = dev.with!.command.replace('--branch=dev', '--branch=main');
    expect(naruszenia(w).join('|')).toMatch(/wdrożenie na dev nie używa --branch=dev/);
  });
  it('wdrożenie main na celu preview (produkcja z Preview)', () => {
    const w = kopia();
    wdrozenieMain(w)!.if = IF_PREVIEW;
    expect(naruszenia(w)).toContain('wdrożenie main nie wymaga target=prod');
  });
  it('wdrożenie main z warunkiem alternatywnym', () => {
    const w = kopia();
    wdrozenieMain(w)!.if = `${IF_PROD} || ${IF_PREVIEW}`;
    expect(naruszenia(w)).toContain('wdrożenie main nie wymaga target=prod');
  });
  it('brak kroku target', () => {
    const w = kopia();
    w.jobs.ci.steps = w.jobs.ci.steps.filter((k) => k.id !== 'target');
    expect(naruszenia(w)).toContain('brak kroku target');
  });
  it('krok target nie woła skryptu strażnika', () => {
    const w = kopia();
    w.jobs.ci.steps.find((k) => k.id === 'target')!.run = 'echo target=prod >> "$GITHUB_OUTPUT"';
    expect(naruszenia(w)).toContain('krok target nie woła skryptu strażnika');
  });
  it('brak strażnika powtórek', () => {
    const w = kopia();
    w.jobs.ci.steps = w.jobs.ci.steps.filter((k) => k.run !== RUN_GUARD);
    expect(naruszenia(w)).toContain('brak strażnika powtórek (main-tip)');
  });
  it('strażnik powtórek po wdrożeniu main', () => {
    const w = kopia();
    const kroki = w.jobs.ci.steps;
    const [s] = kroki.splice(
      kroki.findIndex((k) => k.run === RUN_GUARD),
      1,
    );
    kroki.push(s);
    expect(naruszenia(w)).toContain('strażnik powtórek po wdrożeniu main');
  });
  it('strażnik powtórek nieblokujący (continue-on-error)', () => {
    const w = kopia();
    w.jobs.ci.steps.find((k) => k.run === RUN_GUARD)!['continue-on-error'] = true;
    expect(naruszenia(w)).toContain('strażnik powtórek nie blokuje (continue-on-error)');
  });
  it('strażnik powtórek na celu preview', () => {
    const w = kopia();
    w.jobs.ci.steps.find((k) => k.run === RUN_GUARD)!.if = IF_PREVIEW;
    expect(naruszenia(w)).toContain('strażnik powtórek nie wymaga target=prod');
  });
  it('PR na dev uruchamia CI', () => {
    const w = kopia();
    w.on.pull_request = { branches: ['main', 'dev'] };
    expect(naruszenia(w).join('|')).toMatch(/PR na dev/);
  });
  it('krok jakości z warunkiem (pomijany na dev)', () => {
    const w = kopia();
    w.jobs.ci.steps.find((k) => k.run === 'npm run lint')!.if = IF_PROD;
    expect(naruszenia(w).join('|')).toMatch(/krok lint ma warunek/);
  });
  it('usunięty krok testów', () => {
    const w = kopia();
    w.jobs.ci.steps = w.jobs.ci.steps.filter((k) => k.run !== 'npm run test -- --run');
    expect(naruszenia(w)).toContain('brak kroku testy');
  });
  it('wdrożenie przed krokiem build', () => {
    const w = kopia();
    const kroki = w.jobs.ci.steps;
    const [build] = kroki.splice(
      kroki.findIndex((k) => k.run === 'npm run build'),
      1,
    );
    kroki.push(build);
    expect(naruszenia(w).join('|')).toMatch(/wdrożenie przed krokiem build/);
  });
  it('trzecie wdrożenie bez ograniczeń', () => {
    const w = kopia();
    w.jobs.ci.steps.push({
      name: 'x',
      uses: 'cloudflare/wrangler-action@v4',
      with: { command: 'pages deploy dist' },
    });
    expect(naruszenia(w).join('|')).toMatch(/oczekiwano 2 wdrożeń/);
  });
  it('przełącznik usunięty z buildu', () => {
    const w = kopia();
    delete zmienneBuildu(w).VITE_MM_TESTIMONIALS;
    expect(naruszenia(w)).toContain('build bez VITE_MM_TESTIMONIALS');
  });
  it('przełącznik włączony tylko na produkcji (nie w Preview)', () => {
    const w = kopia();
    zmienneBuildu(w).VITE_MM_LIVE_PRICE_BAR =
      "${{ steps.target.outputs.target == 'prod' && '1' || '' }}";
    const b = naruszenia(w).join('|');
    expect(b).toMatch(/VITE_MM_LIVE_PRICE_BAR nie jest włączony w Preview/);
    expect(b).toMatch(/VITE_MM_LIVE_PRICE_BAR: zła wartość na produkcji/);
  });
  it('przełącznik włączony na stałe (także na produkcji)', () => {
    const w = kopia();
    zmienneBuildu(w).VITE_MM_LIVE_PRICE_BAR = '1';
    expect(naruszenia(w).join('|')).toMatch(/VITE_MM_LIVE_PRICE_BAR: zła wartość na produkcji/);
  });
  it.each(WYCENA_WYLACZONA_NA_PROD)(
    'MIX-1838: %s (konfigurator wyceny, MIX-1377) włączony na produkcji = naruszenie',
    (f) => {
      const w = kopia();
      zmienneBuildu(w)[f] = '1';
      const b = naruszenia(w);
      expect(b).toContain(`${f}: zła wartość na produkcji ("1")`);
      expect(b).toContain(`${f}: zła wartość poza wdrożeniem ("1")`);
    },
  );
  it.each(CENNIK_WYLACZONY_NA_PROD)(
    'MIX-1855: %s (strona /cennik/) włączony na produkcji = naruszenie',
    (f) => {
      const w = kopia();
      zmienneBuildu(w)[f] = '1';
      const b = naruszenia(w);
      expect(b).toContain(`${f}: zła wartość na produkcji ("1")`);
      expect(b).toContain(`${f}: zła wartość poza wdrożeniem ("1")`);
    },
  );
  it('MIX-1855: VITE_MM_CENNIK w ci.yml to dokładnie wyrażenie „Preview 1, produkcja i PR puste”', () => {
    const w = wczytaj();
    const wyr = String(zmienneBuildu(w).VITE_MM_CENNIK);
    expect(wyr).toBe(WYRAZENIE_PREVIEW);
    expect(wartoscFlagi(wyr, 'preview')).toBe('1');
    expect(wartoscFlagi(wyr, 'prod')).toBe('');
    expect(wartoscFlagi(wyr, 'none')).toBe('');
    expect(przelacznikiZKodu()).toContain('VITE_MM_CENNIK');
    expect(WLACZONE_NA_PROD.has('VITE_MM_CENNIK')).toBe(false);
  });
  it('MIX-1855: VITE_MM_CENNIK usunięty z buildu = naruszenie; wyłączony w Preview = naruszenie', () => {
    const w = kopia();
    delete zmienneBuildu(w).VITE_MM_CENNIK;
    expect(naruszenia(w)).toContain('build bez VITE_MM_CENNIK');
    const w2 = kopia();
    zmienneBuildu(w2).VITE_MM_CENNIK = '';
    expect(naruszenia(w2).join('|')).toMatch(/VITE_MM_CENNIK: nieznana postać wyrażenia/);
  });
  it('MIX-1838/1855: poza WLACZONE_NA_PROD zostają dokładnie strona /cennik/ i konfigurator wyceny', () => {
    const inne = przelacznikiZKodu().filter((x) => !WLACZONE_NA_PROD.has(x));
    expect(inne).toEqual(WYLACZONE_NA_PROD);
    const zmienne = zmienneBuildu(wczytaj());
    for (const f of WYLACZONE_NA_PROD) expect(zmienne[f]).toBe(WYRAZENIE_PREVIEW);
  });
  it.each([...WLACZONE_NA_PROD].sort())(
    'MIX-1838: %s zdjęty z produkcji (wyrażenie tylko-Preview) = naruszenie',
    (f) => {
      const w = kopia();
      zmienneBuildu(w)[f] = WYRAZENIE_PREVIEW;
      const b = naruszenia(w);
      expect(b).toContain(`${f}: zła wartość na produkcji ("")`);
      expect(b).toContain(`${f}: zła wartość poza wdrożeniem ("")`);
    },
  );
  it('każdy przełącznik spoza WLACZONE_NA_PROD włączony na stałe jest wykrywany', () => {
    const inne = przelacznikiZKodu().filter((x) => !WLACZONE_NA_PROD.has(x));
    expect(inne.length).toBeGreaterThanOrEqual(3);
    for (const f of inne) {
      const w = kopia();
      zmienneBuildu(w)[f] = '1';
      expect(naruszenia(w).join('|')).toContain(`${f}: zła wartość na produkcji`);
    }
  });
  it('na produkcji włączone są dokładnie MOBILE_MENU_B, VIEW_TRANSITIONS i pięć z MIX-1838', () => {
    expect([...WLACZONE_NA_PROD].sort()).toEqual([
      'VITE_MM_AI_SECTION',
      'VITE_MM_COOKIE_BANNER_STATIC',
      'VITE_MM_MOBILE_MENU_B',
      'VITE_MM_POWIAZANE',
      'VITE_MM_RZESZOW_SEKCJE',
      'VITE_MM_TESTIMONIALS',
      'VITE_MM_VIEW_TRANSITIONS',
    ]);
  });
  it('MIX-1838: prawdziwy ci.yml ma siedem przełączników produkcji jako stałe 1', () => {
    const zmienne = zmienneBuildu(wczytaj());
    for (const f of WLACZONE_NA_PROD) expect(zmienne[f]).toBe('1');
  });
  it('VIEW_TRANSITIONS wyłączone na produkcji (MIX-1833 zdjęte)', () => {
    const w = kopia();
    zmienneBuildu(w).VITE_MM_VIEW_TRANSITIONS =
      "${{ steps.target.outputs.target == 'preview' && '1' || '' }}";
    expect(naruszenia(w).join('|')).toMatch(/VITE_MM_VIEW_TRANSITIONS: zła wartość na produkcji/);
  });
  it('przełącznik z nieznanym wyrażeniem (fail-closed)', () => {
    const w = kopia();
    zmienneBuildu(w).VITE_MM_TESTIMONIALS = "${{ github.ref == 'refs/heads/dev' && '1' || '' }}";
    expect(naruszenia(w).join('|')).toMatch(/VITE_MM_TESTIMONIALS: nieznana postać wyrażenia/);
  });
  it('MOBILE_MENU_B wyłączone na produkcji (MIX-1465 zdjęte)', () => {
    const w = kopia();
    zmienneBuildu(w).VITE_MM_MOBILE_MENU_B =
      "${{ steps.target.outputs.target == 'preview' && '1' || '' }}";
    expect(naruszenia(w).join('|')).toMatch(/VITE_MM_MOBILE_MENU_B: zła wartość na produkcji/);
  });
});

// MIX-1846 (uwagi a i b weryfikatora MIX-1838): formy A10 (inna postać PREONBOARD_KEY), O3 (dodatkowy
// krok budowy z przełącznikiem wyceny), M2 (parser wartości przyjmujący nie-'1'). Każda odmowa ma
// dozwolonego bliźniaka.
describe('MIX-1846: zasięg przełączników — wszystkie kroki, zadania i workflow (allowlista)', () => {
  const WYCENA = 'VITE_MM_LIVE_PRICE_BAR';

  it('prawdziwy ci.yml: zero naruszeń zasięgu, PREONBOARD i HUB_URL w przypiętej postaci', () => {
    const w = wczytaj();
    expect(naruszeniaZasiegu(w)).toEqual([]);
    for (const [k, v] of Object.entries(PRZYPIETE)) expect(zmienneBuildu(w)[k]).toBe(v);
  });

  it.each(WYCENA_WYLACZONA_NA_PROD)(
    'O3: dodatkowy krok `npm run build` po buildzie z %s=1 = naruszenie',
    (f) => {
      const w = kopia();
      wstawPoBuildzie(w, { name: 'Build 2', run: 'npm run build', env: { [f]: '1' } });
      const b = naruszenia(w);
      expect(b).toContain('krok „Build 2”: VITE_MM_* poza krokiem budowy');
      expect(b).toContain('krok „Build 2”: budowa poza krokiem budowy');
    },
  );

  it('O3: dodatkowy krok `npx vite build` z przełącznikiem w wyrażeniu prod = naruszenie', () => {
    const w = kopia();
    wstawPoBuildzie(w, {
      name: 'Rebuild',
      run: 'npx vite build',
      env: { [WYCENA]: "${{ steps.target.outputs.target == 'prod' && '1' || '' }}" },
    });
    const b = naruszenia(w);
    expect(b).toContain('krok „Rebuild”: VITE_MM_* poza krokiem budowy');
    expect(b).toContain('krok „Rebuild”: budowa poza krokiem budowy');
  });

  it('O3: przełącznik w `run:` innego kroku (bez env) = naruszenie', () => {
    const w = kopia();
    wstawPoBuildzie(w, { name: 'Full', run: `${WYCENA}=1 npm run build:full` });
    const b = naruszenia(w);
    expect(b).toContain('krok „Full”: VITE_MM_* poza krokiem budowy');
    expect(b).toContain('krok „Full”: budowa poza krokiem budowy');
  });

  it('O3: dodatkowy krok budowy BEZ przełączników też jest odmową (jedno miejsce budowy)', () => {
    const w = kopia();
    wstawPoBuildzie(w, { name: 'Build bez flag', run: 'npm run build' });
    expect(naruszenia(w)).toEqual(['krok „Build bez flag”: budowa poza krokiem budowy']);
  });

  it('O3: zapis przełącznika do $GITHUB_ENV przed buildem = naruszenie (także rozbity napis)', () => {
    const w = kopia();
    wstawPrzedBuildem(w, { name: 'Env', run: `echo "${WYCENA}=1" >> "$GITHUB_ENV"` });
    let b = naruszenia(w);
    expect(b).toContain('krok „Env”: VITE_MM_* poza krokiem budowy');
    expect(b).toContain('krok „Env”: zapis do $GITHUB_ENV');
    const w2 = kopia();
    wstawPrzedBuildem(w2, {
      name: 'Env2',
      run: 'echo "VITE_""MM_LIVE_PRICE_BAR=1" >> $GITHUB_ENV',
    });
    b = naruszenia(w2);
    expect(b).toEqual(['krok „Env2”: zapis do $GITHUB_ENV']);
  });

  it('O3: przełącznik w env zadania ci = naruszenie', () => {
    const w = kopia();
    w.jobs.ci.env = { [WYCENA]: '1' };
    expect(naruszenia(w)).toEqual(['zadanie „ci”: VITE_MM_* poza krokiem budowy']);
  });

  it('O3: przełącznik w env całego workflow = naruszenie', () => {
    const w = kopia();
    w.env = { ...w.env, [WYCENA]: '1' };
    expect(naruszenia(w)).toEqual(['workflow: VITE_MM_* poza krokiem budowy']);
  });

  it('O3: drugie zadanie budujące z przełącznikiem = naruszenie (sprawdzane wszystkie zadania)', () => {
    const w = kopia();
    w.jobs.drugie = {
      'runs-on': 'ubuntu-latest',
      steps: [{ name: 'Build prod', run: 'npm run build', env: { [WYCENA]: '1' } }],
    };
    const b = naruszenia(w);
    expect(b).toContain('krok „Build prod”: VITE_MM_* poza krokiem budowy');
    expect(b).toContain('krok „Build prod”: budowa poza krokiem budowy');
  });

  it('małe litery w kluczu (vite_mm_) też są łapane', () => {
    const w = kopia();
    wstawPoBuildzie(w, { name: 'X', run: 'npm run audit:x', env: { vite_mm_live_price_bar: '1' } });
    expect(naruszenia(w)).toEqual(['krok „X”: VITE_MM_* poza krokiem budowy']);
  });

  it('nieznany klucz VITE_MM_* w buildzie = naruszenie', () => {
    const w = kopia();
    zmienneBuildu(w).VITE_MM_NOWA_WYCENA = '1';
    expect(naruszenia(w)).toEqual(['build: nieznany klucz VITE_MM_NOWA_WYCENA']);
  });

  it('przełącznik w `with:` kroku budowy (poza env) = naruszenie', () => {
    const w = kopia();
    krokBuild(w).with = { args: `${WYCENA}=1` };
    expect(naruszenia(w)).toEqual([
      'krok „🏗️ Build, Sitemap, Prerender, Size-check”: VITE_MM_* poza env kroku budowy',
    ]);
  });

  it('bliźniaki dozwolone: krok audytu z innym env, env zadania bez VITE_MM_*, zapis do GITHUB_OUTPUT', () => {
    const w = kopia();
    wstawPoBuildzie(w, { name: 'Audyt', run: 'npm run audit:x', env: { NODE_OPTIONS: '--x' } });
    wstawPrzedBuildem(w, { name: 'Out', id: 'o', run: 'echo "a=1" >> "$GITHUB_OUTPUT"' });
    w.jobs.ci.env = { FORCE_COLOR: '1' };
    w.env = { ...w.env, CI_X: '1' };
    expect(naruszenia(w)).toEqual([]);
  });

  it.each([
    ['1'],
    ['abc'],
    ['${{ vars.VITE_MM_PREONBOARD_KEY }}'],
    ['${{ secrets.VITE_MM_PREONBOARD_KEY_TEST }}'],
    ["${{ secrets.VITE_MM_PREONBOARD_KEY || 'x' }}"],
    [' ${{ secrets.VITE_MM_PREONBOARD_KEY }}'],
    [''],
  ])('A10: VITE_MM_PREONBOARD_KEY w postaci %j = naruszenie', (v) => {
    const w = kopia();
    zmienneBuildu(w).VITE_MM_PREONBOARD_KEY = v;
    expect(naruszenia(w)).toEqual([
      'VITE_MM_PREONBOARD_KEY: zmieniona postać (przypięta do sekretu/zmiennej)',
    ]);
  });

  it('A10: VITE_MM_PREONBOARD_KEY usunięty z buildu = naruszenie', () => {
    const w = kopia();
    delete zmienneBuildu(w).VITE_MM_PREONBOARD_KEY;
    expect(naruszenia(w)).toEqual([
      'VITE_MM_PREONBOARD_KEY: zmieniona postać (przypięta do sekretu/zmiennej)',
    ]);
  });

  it('A10: VITE_MM_HUB_URL podmieniony = naruszenie', () => {
    const w = kopia();
    zmienneBuildu(w).VITE_MM_HUB_URL = 'https://evil.example';
    expect(naruszenia(w)).toEqual([
      'VITE_MM_HUB_URL: zmieniona postać (przypięta do sekretu/zmiennej)',
    ]);
  });
});

describe('MIX-1846: wartoscFlagi włącza wyłącznie dokładnie "1" (M2)', () => {
  it('"1" i wyrażenie tylko-dla-celu są przyjmowane (bliźniaki)', () => {
    expect(wartoscFlagi('1', 'prod')).toBe('1');
    expect(wartoscFlagi(WYRAZENIE_PREVIEW, 'preview')).toBe('1');
    expect(wartoscFlagi(WYRAZENIE_PREVIEW, 'prod')).toBe('');
  });

  it.each([
    ['true'],
    [' 1'],
    ['1 '],
    ['yes'],
    ['TRUE'],
    ['  '],
    [' \t'],
    [''],
    ['01'],
    [true],
    [1],
    [null],
  ])('wartość %j = nieznana postać (błąd)', (v) => {
    expect(() => wartoscFlagi(v, 'prod')).toThrow(/nieznana postać wyrażenia flagi/);
  });

  it.each([['true'], [' 1'], ['yes'], ['  ']])(
    'przełącznik wyceny z wartością %j w ci.yml = naruszenie (nie jest brany za włączony ani wyłączony)',
    (v) => {
      const w = kopia();
      zmienneBuildu(w).VITE_MM_LIVE_PRICE_BAR = v;
      expect(naruszenia(w)).toEqual([
        `VITE_MM_LIVE_PRICE_BAR: nieznana postać wyrażenia flagi: ${JSON.stringify(v)}`,
      ]);
    },
  );

  it('przełącznik produkcji jako bool true z YAML (bez cudzysłowu) = naruszenie', () => {
    const w = kopia();
    (zmienneBuildu(w) as Record<string, unknown>).VITE_MM_TESTIMONIALS = true;
    expect(naruszenia(w).join('|')).toMatch(
      /VITE_MM_TESTIMONIALS: nieznana postać wyrażenia flagi: true \(nie napis\)/,
    );
  });
});

describe('MIX-1846: package.json nie ustawia przełączników poza ci.yml', () => {
  it('żaden skrypt npm nie zawiera VITE_MM_*', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };
    expect(Object.keys(pkg.scripts).length).toBeGreaterThan(5);
    for (const [n, s] of Object.entries(pkg.scripts))
      expect(`${n}: ${s}`).not.toMatch(WZOR_VITE_MM);
  });
});
