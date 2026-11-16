// Kontrola workflow CI (.github/workflows/ci.yml): push na dev i ręczne uruchomienie na dev wdrażają
// Preview, main tylko po push i po strażniku powtórek, pull requesty nigdy nie wdrażają, a Preview
// buduje się ze WSZYSTKIMI przełącznikami VITE_MM_* włączonymi (MIX-1411), produkcja bez nich.
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
type Workflow = {
  on: { push: { branches: string[] }; pull_request?: { branches?: string[] } };
  jobs: { ci: { steps: Krok[] } };
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
/** Przełącznik włączony także na produkcji decyzją właściciela (MIX-1465). */
const WLACZONE_NA_PROD = new Set(['VITE_MM_MOBILE_MENU_B']);

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

/** Wartość zmiennej budowy dla celu (`prod` | `preview` | `none`); nieznana postać wyrażenia = błąd. */
function wartoscFlagi(wyrazenie: string, cel: string): string {
  if (wyrazenie === '1') return '1';
  const m = /^\$\{\{ steps\.target\.outputs\.target == '(\w+)' && '1' \|\| '' \}\}$/.exec(
    wyrazenie,
  );
  if (!m) throw new Error(`nieznana postać wyrażenia flagi: ${wyrazenie}`);
  return cel === m[1] ? '1' : '';
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
      preview = wartoscFlagi(String(wyr), 'preview');
      prod = wartoscFlagi(String(wyr), 'prod');
      poza = wartoscFlagi(String(wyr), 'none');
    } catch (e) {
      bledy.push(`${f}: ${(e as Error).message}`);
      continue;
    }
    const naProd = WLACZONE_NA_PROD.has(f) ? '1' : '';
    if (preview !== '1') bledy.push(`${f} nie jest włączony w Preview`);
    if (prod !== naProd) bledy.push(`${f}: zła wartość na produkcji (${JSON.stringify(prod)})`);
    if (poza !== naProd) bledy.push(`${f}: zła wartość poza wdrożeniem (${JSON.stringify(poza)})`);
  }
  return bledy;
}

const kopia = (): Workflow => structuredClone(wczytaj());

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

describe('ci.yml: przełączniki VITE_MM_* (zasada MIX-1411: Preview włączone, produkcja wyłączona)', () => {
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
    for (const f of przelacznikiZKodu())
      expect(wartoscFlagi(String(zmienne[f]), 'preview')).toBe('1');
  });

  it('build produkcji i PR: przełączniki puste, poza MOBILE_MENU_B (MIX-1465)', () => {
    const zmienne = zmienneBuildu(wczytaj());
    for (const f of przelacznikiZKodu()) {
      const oczekiwane = WLACZONE_NA_PROD.has(f) ? '1' : '';
      expect(wartoscFlagi(String(zmienne[f]), 'prod')).toBe(oczekiwane);
      expect(wartoscFlagi(String(zmienne[f]), 'none')).toBe(oczekiwane);
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
    zmienneBuildu(w).VITE_MM_VIEW_TRANSITIONS = '1';
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
