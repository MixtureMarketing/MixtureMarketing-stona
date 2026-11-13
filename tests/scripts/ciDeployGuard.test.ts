// Strażnik wdrożeń CI (scripts/ci-deploy-guard.sh, MIX-1613 r2): prawdziwe uruchomienia basha.
//  - `target`: zdarzenie × ref -> prod | preview | none; porównanie ref czułe na wielkość liter
//    (`DEV`, `Dev`, `MAIN` = odmowa rc 1), puste wejście = odmowa.
//  - `main-tip`: SHA biegu musi być końcem refs/heads/main w zdalnym repo (ponowne uruchomienie
//    starego biegu = odmowa rc 1 z linią powodu). Zdalne repo to lokalne repo bare (GUARD_REMOTE).
import { spawnSync, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const skrypt = path.resolve(__dirname, '../../scripts/ci-deploy-guard.sh');
let tmp = '';
beforeAll(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-guard-'));
});
afterAll(() => {
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
});

const uruchom = (arg: string | undefined, env: Record<string, string>) => {
  const r = spawnSync('bash', arg === undefined ? [skrypt] : [skrypt, arg], {
    encoding: 'utf8',
    env: {
      PATH: process.env.PATH ?? '/usr/bin:/bin',
      HOME: tmp,
      GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_CONFIG_SYSTEM: '/dev/null',
      ...env,
    },
  });
  return { rc: r.status, out: r.stdout.trim(), err: r.stderr.trim() };
};

describe('ci-deploy-guard.sh target', () => {
  const cel = (event: string, ref: string) =>
    uruchom('target', { GITHUB_EVENT_NAME: event, GITHUB_REF: ref });

  it.each<[string, string, string]>([
    ['push', 'refs/heads/main', 'prod'],
    ['push', 'refs/heads/dev', 'preview'],
    ['workflow_dispatch', 'refs/heads/dev', 'preview'],
    ['workflow_dispatch', 'refs/heads/main', 'none'],
    ['pull_request', 'refs/heads/dev', 'none'],
    ['pull_request', 'refs/pull/5/merge', 'none'],
    ['push', 'refs/heads/master', 'none'],
    ['push', 'refs/heads/dev-x', 'none'],
    ['push', 'refs/heads/feature/dev', 'none'],
    ['push', 'refs/heads/main-hotfix', 'none'],
    ['push', 'refs/tags/dev', 'none'],
    ['push', 'refs/tags/main', 'none'],
    ['repository_dispatch', 'refs/heads/dev', 'none'],
    ['schedule', 'refs/heads/main', 'none'],
    ['release', 'refs/heads/main', 'none'],
    ['PUSH', 'refs/heads/main', 'none'],
    ['push', 'refs/heads/dev/', 'none'],
    ['push', ' refs/heads/dev', 'none'],
  ])('%s na %s -> target=%s (rc 0)', (event, ref, oczekiwany) => {
    const r = cel(event, ref);
    expect(r.rc).toBe(0);
    expect(r.out).toBe(`target=${oczekiwany}`);
  });

  it.each([
    'refs/heads/DEV',
    'refs/heads/Dev',
    'refs/heads/dEv',
    'refs/heads/MAIN',
    'refs/heads/Main',
    'REFS/HEADS/dev',
  ])('ref %s różni się od dev/main tylko wielkością liter: odmowa rc 1 z powodem', (ref) => {
    for (const event of ['push', 'workflow_dispatch']) {
      const r = cel(event, ref);
      expect(r.rc).toBe(1);
      expect(r.out).not.toContain('target=');
      expect(r.err).toMatch(
        /ODMOWA: ref '.*' różni się od 'refs\/heads\/(dev|main)' tylko wielkością liter/,
      );
    }
  });

  it('puste zdarzenie albo ref: odmowa rc 1 z powodem', () => {
    const a = uruchom('target', { GITHUB_REF: 'refs/heads/dev' });
    expect(a.rc).toBe(1);
    expect(a.err).toMatch(/ODMOWA: puste GITHUB_EVENT_NAME/);
    const b = uruchom('target', { GITHUB_EVENT_NAME: 'push' });
    expect(b.rc).toBe(1);
    expect(b.err).toMatch(/ODMOWA: puste GITHUB_REF/);
    const c = cel('', 'refs/heads/dev');
    expect(c.rc).toBe(1);
  });

  it('brak polecenia albo nieznane polecenie: odmowa rc 1', () => {
    for (const arg of [undefined, '', 'deploy', 'TARGET']) {
      const r = uruchom(arg, { GITHUB_EVENT_NAME: 'push', GITHUB_REF: 'refs/heads/main' });
      expect(r.rc).toBe(1);
      expect(r.err).toMatch(/ODMOWA: nieznane polecenie/);
    }
  });
});

describe('ci-deploy-guard.sh main-tip', () => {
  let bare = '';
  let stary = '';
  let koniec = '';
  const git = (cwd: string, ...args: string[]) =>
    execFileSync(
      'git',
      [
        '-c',
        'user.name=t',
        '-c',
        'user.email=t@example.invalid',
        '-c',
        'commit.gpgsign=false',
        ...args,
      ],
      {
        cwd,
        encoding: 'utf8',
        env: { PATH: process.env.PATH ?? '', HOME: tmp, GIT_CONFIG_GLOBAL: '/dev/null' },
      },
    ).trim();

  beforeAll(() => {
    bare = path.join(tmp, 'remote.git');
    const praca = path.join(tmp, 'praca');
    git(tmp, 'init', '--bare', '-b', 'main', bare);
    git(tmp, 'clone', bare, praca);
    git(praca, 'checkout', '-B', 'main');
    fs.writeFileSync(path.join(praca, 'a.txt'), '1');
    git(praca, 'add', 'a.txt');
    git(praca, 'commit', '-m', 'pierwszy');
    stary = git(praca, 'rev-parse', 'HEAD');
    fs.writeFileSync(path.join(praca, 'a.txt'), '2');
    git(praca, 'commit', '-am', 'drugi');
    koniec = git(praca, 'rev-parse', 'HEAD');
    git(praca, 'push', 'origin', 'main');
    // Wabik: ref, który wzorzec `refs/heads/main` w ls-remote też dopasowuje (końcówka ścieżki),
    // wskazujący na STARY commit; strażnik ma brać tylko dokładne refs/heads/main.
    git(praca, 'push', 'origin', `${stary}:refs/heads/x/refs/heads/main`);
    git(praca, 'checkout', '-b', 'dev', stary);
    git(praca, 'push', 'origin', 'dev');
  });

  const tip = (sha: string, remote = bare) =>
    uruchom('main-tip', { GITHUB_SHA: sha, GUARD_REMOTE: remote });

  it('SHA = koniec main: rc 0 (bliźniak)', () => {
    const r = tip(koniec);
    expect(r.rc).toBe(0);
    expect(r.out).toContain(`OK: ${koniec} jest końcem main`);
  });

  it('ponowne uruchomienie starego biegu (starszy SHA): rc 1, produkcja bez zmian', () => {
    expect(stary).not.toBe(koniec);
    const r = tip(stary);
    expect(r.rc).toBe(1);
    expect(r.err).toMatch(
      /ODMOWA: SHA biegu .* nie jest końcem main .*ponowne uruchomienie starego biegu/,
    );
  });

  it('SHA z wabika x/refs/heads/main (stary commit) też odmowa: liczy się tylko dokładny refs/heads/main', () => {
    const r = tip(stary);
    expect(r.rc).toBe(1);
    expect(r.err).toMatch(/nie jest końcem main/);
  });

  it.each<[string, (k: string) => string]>([
    ['skrócony SHA (7 znaków)', (k) => k.slice(0, 7)],
    ['SHA wielkimi literami', (k) => k.toUpperCase()],
    ['SHA z białym znakiem', (k) => `${k} `],
    ['pusty SHA', () => ''],
    ['nazwa gałęzi zamiast SHA', () => 'main'],
    ['SHA o 41 znakach', (k) => `${k}0`],
  ])('%s: odmowa rc 1 z powodem', (_nazwa, zrob) => {
    const r = tip(zrob(koniec));
    expect(r.rc).toBe(1);
    expect(r.err).toMatch(/ODMOWA: GITHUB_SHA nie jest pełnym SHA/);
  });

  it('poprawny format SHA, ale nie koniec main (same zera): odmowa rc 1', () => {
    const r = tip('0'.repeat(40));
    expect(r.rc).toBe(1);
    expect(r.err).toMatch(/ODMOWA: SHA biegu .* nie jest końcem main/);
  });

  it('brak GITHUB_SHA w środowisku: odmowa rc 1', () => {
    const r = uruchom('main-tip', { GUARD_REMOTE: bare });
    expect(r.rc).toBe(1);
    expect(r.err).toMatch(/ODMOWA: GITHUB_SHA nie jest pełnym SHA/);
  });

  it('zdalne repo niedostępne: odmowa rc 1 z powodem (fail-closed)', () => {
    const r = tip(koniec, path.join(tmp, 'nie-ma-takiego.git'));
    expect(r.rc).toBe(1);
    expect(r.err).toMatch(/ODMOWA: git ls-remote .* nie powiódł się/);
  });

  it('zdalne repo bez refs/heads/main: odmowa rc 1', () => {
    const pusty = path.join(tmp, 'pusty.git');
    git(tmp, 'init', '--bare', '-b', 'main', pusty);
    const r = tip(koniec, pusty);
    expect(r.rc).toBe(1);
    expect(r.err).toMatch(/ODMOWA: oczekiwano jednego końca refs\/heads\/main, jest 0/);
  });

  it('zdalne repo z samym wabikiem (bez dokładnego main): odmowa rc 1', () => {
    const wabik = path.join(tmp, 'wabik.git');
    git(tmp, 'init', '--bare', '-b', 'dev', wabik);
    const praca = path.join(tmp, 'praca2');
    git(tmp, 'clone', wabik, praca);
    fs.writeFileSync(path.join(praca, 'b.txt'), '1');
    git(praca, 'checkout', '-B', 'dev');
    git(praca, 'add', 'b.txt');
    git(praca, 'commit', '-m', 'x');
    const sha = git(praca, 'rev-parse', 'HEAD');
    git(praca, 'push', 'origin', `${sha}:refs/heads/x/refs/heads/main`);
    const r = tip(sha, wabik);
    expect(r.rc).toBe(1);
    expect(r.err).toMatch(/ODMOWA: oczekiwano jednego końca refs\/heads\/main, jest 0/);
  });
});
