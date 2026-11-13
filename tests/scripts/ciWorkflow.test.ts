// Kontrola workflow CI (.github/workflows/ci.yml): push na dev wdraża Preview, main bez zmian,
// pull requesty nigdy nie wdrażają. Parsuje prawdziwy plik YAML i sprawdza warunki (też na wariantach
// psutych celowo: każda odmowa ma swojego dozwolonego bliźniaka).
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
  with?: Record<string, string>;
};
type Workflow = {
  on: { push: { branches: string[] }; pull_request?: { branches?: string[] } };
  jobs: { ci: { steps: Krok[] } };
};

const wczytaj = (): Workflow => parse(fs.readFileSync(plik, 'utf8')) as Workflow;

const IF_MAIN = "github.event_name == 'push' && github.ref == 'refs/heads/main'";
const IF_DEV = "github.event_name == 'push' && github.ref == 'refs/heads/dev'";
const KOMENDA_MAIN =
  'pages deploy dist --project-name=mixturemarketing-stona --branch=main --commit-dirty=true --commit-message="${{ steps.commit.outputs.msg }}" --commit-hash=${{ github.sha }}';
const KOMENDA_DEV =
  'pages deploy dist --project-name=mixturemarketing-stona --branch=dev --commit-dirty=true --commit-message="${{ steps.commit_dev.outputs.msg }}" --commit-hash=${{ github.sha }}';

const wdrozenia = (w: Workflow) =>
  w.jobs.ci.steps.filter((k) => (k.uses ?? '').startsWith('cloudflare/wrangler-action'));

/** Lista naruszeń reguł CI (pusta = poprawne). */
function naruszenia(w: Workflow): string[] {
  const bledy: string[] = [];
  const kroki = w.jobs.ci.steps;
  if (!w.on.push.branches.includes('dev')) bledy.push('push nie obejmuje dev');
  for (const b of ['main', 'master'])
    if (!w.on.push.branches.includes(b)) bledy.push(`push nie obejmuje ${b}`);
  if ((w.on.pull_request?.branches ?? []).includes('dev'))
    bledy.push('PR na dev uruchamia CI z wdrożeniem');
  const wd = wdrozenia(w);
  if (wd.length !== 2) bledy.push(`oczekiwano 2 wdrożeń, jest ${wd.length}`);
  for (const k of wd) {
    const warunek = k.if ?? '';
    if (!warunek.includes("github.event_name == 'push'"))
      bledy.push(`wdrożenie „${k.name}” bez warunku push (PR mógłby wdrażać)`);
    const refy = [...warunek.matchAll(/github\.ref == '([^']+)'/g)].map((m) => m[1]);
    if (refy.length !== 1) bledy.push(`wdrożenie „${k.name}”: oczekiwano jednego warunku na gałąź`);
    if (/\|\|/.test(warunek)) bledy.push(`wdrożenie „${k.name}”: alternatywa w warunku`);
    const cmd = k.with?.command ?? '';
    if (
      refy[0] === 'refs/heads/dev' &&
      !(cmd.includes('--branch=dev') && !cmd.includes('--branch=main'))
    )
      bledy.push('wdrożenie na dev nie używa --branch=dev');
    if (
      refy[0] === 'refs/heads/main' &&
      !(cmd.includes('--branch=main') && !cmd.includes('--branch=dev'))
    )
      bledy.push('wdrożenie na main nie używa --branch=main');
    if (!cmd.startsWith('pages deploy dist --project-name=mixturemarketing-stona '))
      bledy.push(`wdrożenie „${k.name}”: zła komenda`);
  }
  const main = wd.find((k) => (k.if ?? '').includes('refs/heads/main'));
  const dev = wd.find((k) => (k.if ?? '').includes('refs/heads/dev'));
  if (!main) bledy.push('brak wdrożenia main');
  if (!dev) bledy.push('brak wdrożenia dev');
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
  return bledy;
}

const kopia = (): Workflow => structuredClone(wczytaj());

describe('ci.yml: wdrożenie Preview z gałęzi dev', () => {
  it('prawdziwy plik spełnia wszystkie reguły', () => {
    expect(naruszenia(wczytaj())).toEqual([]);
  });

  it('push obejmuje main, master i dev; pull_request nie obejmuje dev', () => {
    const w = wczytaj();
    expect(w.on.push.branches).toEqual(['main', 'master', 'dev']);
    expect(w.on.pull_request?.branches).toEqual(['main', 'master']);
  });

  it('wdrożenie dev: warunek tylko push na refs/heads/dev i dokładna komenda', () => {
    const dev = wdrozenia(wczytaj()).find((k) => k.with?.command.includes('--branch=dev'));
    expect(dev?.if).toBe(IF_DEV);
    expect(dev?.with?.command).toBe(KOMENDA_DEV);
  });

  it('wdrożenie main bez zmian (warunek i komenda co do znaku)', () => {
    const main = wdrozenia(wczytaj()).find((k) => k.with?.command.includes('--branch=main'));
    expect(main?.if).toBe(IF_MAIN);
    expect(main?.with?.command).toBe(KOMENDA_MAIN);
    expect(main?.with?.wranglerVersion).toBe('4');
  });

  it('żaden krok wdrożenia nie działa przy pull_request (każdy wymaga zdarzenia push)', () => {
    for (const k of wdrozenia(wczytaj())) expect(k.if).toContain("github.event_name == 'push'");
  });

  it('krok sanityzacji dla dev tylko na dev', () => {
    const k = wczytaj().jobs.ci.steps.find((x) => x.id === 'commit_dev');
    expect(k?.if).toBe(IF_DEV);
    expect(k?.run).toContain('(dev)');
  });
});

describe('ci.yml: warianty psute celowo są wykrywane (negatywne nogi)', () => {
  it('bez dev w push', () => {
    const w = kopia();
    w.on.push.branches = ['main', 'master'];
    expect(naruszenia(w)).toContain('push nie obejmuje dev');
  });
  it('wdrożenie dev bez warunku push (PR mógłby wdrażać)', () => {
    const w = kopia();
    const dev = wdrozenia(w).find((k) => k.with?.command.includes('--branch=dev'))!;
    dev.if = "github.ref == 'refs/heads/dev'";
    expect(naruszenia(w).join('|')).toMatch(/bez warunku push/);
  });
  it('wdrożenie dev bez żadnego warunku', () => {
    const w = kopia();
    const dev = wdrozenia(w).find((k) => k.with?.command.includes('--branch=dev'))!;
    delete dev.if;
    expect(naruszenia(w).join('|')).toMatch(/bez warunku push/);
  });
  it('wdrożenie dev na gałęzi main (warunek)', () => {
    const w = kopia();
    const dev = wdrozenia(w).find((k) => k.with?.command.includes('--branch=dev'))!;
    dev.if = IF_MAIN;
    expect(naruszenia(w).join('|')).toMatch(/--branch=dev|brak wdrożenia dev/);
  });
  it('wdrożenie dev pushuje na --branch=main (nadpisałoby produkcję)', () => {
    const w = kopia();
    const dev = wdrozenia(w).find((k) => k.with?.command.includes('--branch=dev'))!;
    dev.with!.command = dev.with!.command.replace('--branch=dev', '--branch=main');
    expect(naruszenia(w).join('|')).toMatch(/wdrożenie na dev nie używa --branch=dev/);
  });
  it('alternatywa w warunku (dev lub każda gałąź)', () => {
    const w = kopia();
    const dev = wdrozenia(w).find((k) => k.with?.command.includes('--branch=dev'))!;
    dev.if = `${IF_DEV} || github.event_name == 'pull_request'`;
    expect(naruszenia(w).join('|')).toMatch(/alternatywa/);
  });
  it('PR na dev uruchamia CI', () => {
    const w = kopia();
    w.on.pull_request = { branches: ['main', 'dev'] };
    expect(naruszenia(w).join('|')).toMatch(/PR na dev/);
  });
  it('krok jakości z warunkiem (pomijany na dev)', () => {
    const w = kopia();
    const lint = w.jobs.ci.steps.find((k) => k.run === 'npm run lint')!;
    lint.if = "github.ref == 'refs/heads/main'";
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
    const iBuild = kroki.findIndex((k) => k.run === 'npm run build');
    const [build] = kroki.splice(iBuild, 1);
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
});
