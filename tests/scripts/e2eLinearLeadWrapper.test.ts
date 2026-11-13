// Testy wrappera scripts/e2e-linear-lead.sh: nagłówki Access z plików konfiguracji trafiają do env skryptu
// (bez wypisywania), a brak pliku = odmowa fail-closed (kod 2) przed jakimkolwiek żądaniem sieciowym.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REPO = path.resolve(__dirname, '..', '..');
const WRAPPER = path.join(REPO, 'scripts', 'e2e-linear-lead.sh');
const SKRYPT = path.join(REPO, 'scripts', 'test-e2e-linear-lead.mjs');
const ID = 'wrapper-id-TESTOWE-12345';
const SEKRET = 'wrapper-sekret-TESTOWY-67890-abcdef';

let tmp: string;
let konf: string;
let dom: string;
let robocz: string;

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-wrapper-'));
  konf = path.join(tmp, 'konf');
  dom = path.join(tmp, 'home');
  robocz = path.join(tmp, 'cwd');
  fs.mkdirSync(konf);
  fs.mkdirSync(path.join(dom, 'bin'), { recursive: true });
  fs.mkdirSync(path.join(robocz, 'scripts'), { recursive: true });
  // kopia skryptu (nie dowiązanie: strażnik „uruchomiony bezpośrednio” porównuje ścieżki)
  fs.copyFileSync(SKRYPT, path.join(robocz, 'scripts', 'test-e2e-linear-lead.mjs'));
});
afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

/** Zamiennik `node` w $HOME/bin: wypisuje tylko długości zmiennych Access i argumenty (nigdy wartości). */
function atrapaNode() {
  const plik = path.join(dom, 'bin', 'node');
  fs.writeFileSync(
    plik,
    '#!/bin/bash\n' +
      'echo "ID_LEN=${#CF_ACCESS_CLIENT_ID} SECRET_LEN=${#CF_ACCESS_CLIENT_SECRET} PONOW_LEN=${#E2E_PONOW_SECRET}"\n' +
      'echo "ARGS=$*"\n',
    { mode: 0o755 },
  );
}

/** Podsłuch sieci: każde użycie fetch zostawia znacznik i przerywa. */
function podsluchSieci() {
  const znacznik = path.join(tmp, 'siec-uzyta');
  const preload = path.join(tmp, 'preload.mjs');
  fs.writeFileSync(
    preload,
    `import fs from 'node:fs';\n` +
      `globalThis.fetch = async (u) => { fs.writeFileSync(${JSON.stringify(znacznik)}, String(u)); throw new Error('siec zablokowana'); };\n`,
  );
  return { znacznik, preload };
}

function uruchom(opcje: { atrapa?: boolean; env?: Record<string, string> } = {}) {
  const { znacznik, preload } = podsluchSieci();
  if (opcje.atrapa) atrapaNode();
  const r = spawnSync('bash', [WRAPPER, '--sha', 'abc1234'], {
    cwd: robocz,
    encoding: 'utf8',
    env: {
      PATH: process.env.PATH ?? '',
      HOME: dom,
      LSYS_KONF: konf,
      NODE_OPTIONS: `--import ${preload}`,
      ...(opcje.env ?? {}),
    },
  });
  return { ...r, siecUzyta: fs.existsSync(znacznik) };
}

const zapisz = (nazwa: string, tresc: string) =>
  fs.writeFileSync(path.join(konf, nazwa), tresc, { mode: 0o600 });

describe('wrapper e2e-linear-lead.sh: nagłówki Access z plików', () => {
  it('dozwolony: oba pliki obecne → skrypt dostaje ID i sekret (bez końcowych znaków nowej linii), wartości nie są wypisane', () => {
    zapisz('cf-access-preview-id', `${ID}\n`);
    zapisz('cf-access-preview-secret', `${SEKRET}\r\n`);
    const r = uruchom({ atrapa: true });
    expect(r.status).toBe(0);
    expect(r.stdout).toContain(`ID_LEN=${ID.length} SECRET_LEN=${SEKRET.length} PONOW_LEN=0`);
    expect(r.stdout).toContain('ARGS=scripts/test-e2e-linear-lead.mjs --sha abc1234');
    expect(r.stdout + r.stderr).not.toContain(ID);
    expect(r.stdout + r.stderr).not.toContain(SEKRET);
  });

  it('sekret ponowień jest wczytywany tylko gdy plik istnieje', () => {
    zapisz('cf-access-preview-id', ID);
    zapisz('cf-access-preview-secret', SEKRET);
    zapisz('leady-ponow-sekret-preview', 'ponow-TESTOWY-0123456789');
    const r = uruchom({ atrapa: true });
    expect(r.stdout).toContain(`PONOW_LEN=${'ponow-TESTOWY-0123456789'.length}`);
  });

  const POWOD = /Preview bez ochrony: brak CF_ACCESS_CLIENT_ID \/ CF_ACCESS_CLIENT_SECRET w env/;
  for (const [brakujacy, powod] of [
    ['cf-access-preview-id', POWOD],
    ['cf-access-preview-secret', POWOD],
  ] as const) {
    it(`odmowa: brak pliku ${brakujacy} → kod 2, komunikat o braku danych, zero żądań sieciowych`, () => {
      if (brakujacy !== 'cf-access-preview-id') zapisz('cf-access-preview-id', ID);
      if (brakujacy !== 'cf-access-preview-secret') zapisz('cf-access-preview-secret', SEKRET);
      const r = uruchom({
        env: {
          E2E_HASH_URL: 'https://a1b2c3d4.mixturemarketing-stona.pages.dev',
        },
      });
      expect(r.status).toBe(2);
      expect(r.stdout + r.stderr).toMatch(powod);
      expect(r.siecUzyta).toBe(false);
      expect(r.stdout + r.stderr).not.toContain(ID);
      expect(r.stdout + r.stderr).not.toContain(SEKRET);
    });
  }

  it('odmowa: pusty plik (sam znak nowej linii) = brak danych → kod 2, zero żądań', () => {
    zapisz('cf-access-preview-id', '\n');
    zapisz('cf-access-preview-secret', SEKRET);
    const r = uruchom({
      env: { E2E_HASH_URL: 'https://a1b2c3d4.mixturemarketing-stona.pages.dev' },
    });
    expect(r.status).toBe(2);
    expect(r.stdout + r.stderr).toMatch(POWOD);
    expect(r.siecUzyta).toBe(false);
  });

  it('odmowa: katalog konfiguracji bez żadnego pliku → kod 2, zero żądań', () => {
    const r = uruchom({
      env: { E2E_HASH_URL: 'https://a1b2c3d4.mixturemarketing-stona.pages.dev' },
    });
    expect(r.status).toBe(2);
    expect(r.stdout + r.stderr).toMatch(POWOD);
    expect(r.siecUzyta).toBe(false);
  });

  it('bliźniak dozwolony dla odmowy: komplet plików ale podsłuch sieci widzi pierwsze żądanie z nagłówkami Access dopiero po przejściu bramek adresu', () => {
    zapisz('cf-access-preview-id', ID);
    zapisz('cf-access-preview-secret', SEKRET);
    const r = uruchom({
      env: { E2E_HASH_URL: 'https://a1b2c3d4.mixturemarketing-stona.pages.dev' },
    });
    // z kompletem danych skrypt próbuje sieci (którą atrapa blokuje) i odmawia z powodu ochrony, nie z braku danych
    expect(r.siecUzyta).toBe(true);
    expect(r.status).toBe(2);
    expect(r.stdout + r.stderr).not.toMatch(/brak CF_ACCESS_CLIENT/);
    expect(r.stdout + r.stderr).not.toContain(ID);
    expect(r.stdout + r.stderr).not.toContain(SEKRET);
  });
});
