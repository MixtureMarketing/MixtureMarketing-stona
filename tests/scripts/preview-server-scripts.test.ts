// MIX-1443: audit-performance, test-e2e-contact, audit-a11y, audit-health używają wspólnego
// pomocnika scripts/lib/preview-server.mjs (grupa procesów, odmowa przy zajętym porcie).
import { afterEach, describe, expect, it } from 'vitest';
import { spawn } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { tmpdir } from 'node:os';
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { assertPortFree } from '../../scripts/lib/preview-server.mjs';

const ROOT = path.resolve(__dirname, '../..');
const SCRIPTS = [
  { file: 'scripts/audit-performance.js', port: 4173, work: /Analyzing performance/ },
  { file: 'scripts/test-e2e-contact.js', port: 4174, work: /🌐/ },
  { file: 'scripts/audit-a11y.js', port: 4173, work: /Auditing:/ },
  { file: 'scripts/audit-health.js', port: 4173, work: /Checking:/ },
];

describe.each(SCRIPTS)('$file: źródło używa wspólnego pomocnika', ({ file }) => {
  const src = readFileSync(path.join(ROOT, file), 'utf8');
  it('importuje startPreviewOrExit z ./lib/preview-server.mjs', () => {
    expect(src).toMatch(/import \{ startPreviewOrExit \} from '\.\/lib\/preview-server\.mjs';/);
    expect(src).toMatch(/await startPreviewOrExit\(\{ port: PORT \}\)/);
  });
  it('nie startuje serwera sam (spawn) i nie zabija go po pidzie', () => {
    expect(src).not.toMatch(/node:child_process/);
    expect(src).not.toMatch(/\bspawn\(/);
    expect(src).not.toMatch(/process\.kill\(|server\.kill\(/);
  });
  it('zatrzymuje serwer przez stop() pomocnika (cała grupa)', () => {
    expect(src).toMatch(/await server\.stop\(\)/);
  });
  it('nie czeka stałego czasu zamiast sprawdzenia gotowości', () => {
    expect(src).not.toMatch(/setTimeout\(resolve, \d+\)/);
  });
});

// Zajęty port: skrypt kończy się kodem 1 z jedną linią powodu i niczego nie testuje.
// Port trzyma obcy serwer HTTP z testu; gdy port jest już zajęty przez kogoś innego,
// warunek („zajęty”) i oczekiwany wynik są te same.
const holdPort = (port: number) =>
  new Promise<http.Server | null>((resolve) => {
    const s = http.createServer((_q, r) => r.writeHead(200).end('obcy'));
    s.once('error', () => resolve(null));
    s.listen(port, '127.0.0.1', () => resolve(s));
  });

const runScript = (file: string) =>
  new Promise<{ rc: number | null; out: string; err: string }>((resolve) => {
    const childEnv = { ...process.env };
    delete childEnv.E2E_BASE_URL; // test-e2e-contact ma startować WŁASNY serwer
    const c = spawn(process.execPath, [file], { cwd: ROOT, env: childEnv });
    let out = '';
    let err = '';
    c.stdout.on('data', (d) => (out += d));
    c.stderr.on('data', (d) => (err += d));
    c.on('exit', (rc) => resolve({ rc, out, err }));
  });

describe.each(SCRIPTS)('$file: port zajęty = odmowa bez testu', ({ file, port, work }) => {
  it(`port ${port} zajęty: kod 1, linia powodu, zero sprawdzeń`, async () => {
    const held = await holdPort(port);
    try {
      const { rc, out, err } = await runScript(file);
      expect(rc).toBe(1);
      expect(err).toMatch(
        new RegExp(
          `^SONDA NIE URUCHOMIONA: port ${port} zajęty lub niedostępny \\(EADDRINUSE\\)$`,
          'm',
        ),
      );
      expect(out).not.toMatch(work);
    } finally {
      await new Promise((r) => (held ? held.close(r) : r(null)));
    }
  }, 30000);
});

// MIX-1445 (X5, X6 z werdyktu 1443): skrypty uruchomione NAPRAWDĘ, w małym katalogu-atrapie.
// Skrypt kopiowany bajt w bajt z repo (mutant w repo trafia do kopii); zmieniony jest tylko
// numer portu (wolny zamiast 4173, by nie zderzać się z innymi biegami), trasy z atrapy
// routes.js, `puppeteer` = atrapa (tests/fixtures/fake-puppeteer.mjs), `npx` = atrapa
// uruchamiająca serwer-atrapę (tests/fixtures/preview-fixture-server.mjs) pod prawdziwym
// pomocnikiem preview-server.mjs. Raporty JSON lądują w katalogu-atrapie, nie w repo.
const FIX = path.join(ROOT, 'tests/fixtures');
const ROUTES = ['/', '/kontakt/'];
const tmpDirs: string[] = [];
afterEach(() => {
  while (tmpDirs.length) rmSync(tmpDirs.pop()!, { recursive: true, force: true });
});

const freePort = () =>
  new Promise<number>((resolve) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => {
      const p = (s.address() as net.AddressInfo).port;
      s.close(() => resolve(p));
    });
  });

const portFreeSoon = async (port: number) => {
  for (let i = 0; i < 30; i++) {
    try {
      await assertPortFree(port);
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  return false;
};

type Sandbox = { dir: string; script: string };
const sandbox = (file: string, port: number, helper: 'prawdziwy' | 'atrapa'): Sandbox => {
  const dir = mkdtempSync(path.join(tmpdir(), 'mix1445-'));
  tmpDirs.push(dir);
  mkdirSync(path.join(dir, 'scripts/lib'), { recursive: true });
  mkdirSync(path.join(dir, 'node_modules/puppeteer'), { recursive: true });
  mkdirSync(path.join(dir, 'node_modules/axe-core'), { recursive: true });
  mkdirSync(path.join(dir, 'bin'));
  writeFileSync(path.join(dir, 'package.json'), '{"type":"module"}\n');
  writeFileSync(path.join(dir, 'routes.js'), `export const routes = ${JSON.stringify(ROUTES)};\n`);
  writeFileSync(
    path.join(dir, 'node_modules/puppeteer/package.json'),
    '{"name":"puppeteer","type":"module","main":"index.js"}\n',
  );
  copyFileSync(
    path.join(FIX, 'fake-puppeteer.mjs'),
    path.join(dir, 'node_modules/puppeteer/index.js'),
  );
  writeFileSync(path.join(dir, 'node_modules/axe-core/axe.min.js'), '/* atrapa axe */\n');
  copyFileSync(
    helper === 'prawdziwy'
      ? path.join(ROOT, 'scripts/lib/preview-server.mjs')
      : path.join(FIX, 'fake-preview-helper.mjs'),
    path.join(dir, 'scripts/lib/preview-server.mjs'),
  );
  const src = readFileSync(path.join(ROOT, file), 'utf8');
  expect(src.match(/const PORT = 4173;/g)).toHaveLength(1);
  const script = path.join(dir, file);
  writeFileSync(script, src.replace('const PORT = 4173;', `const PORT = ${port};`));
  // Atrapa `npx vite preview --port N ...`: exec serwera-atrapy (ta sama grupa procesów).
  const npx = path.join(dir, 'bin/npx');
  writeFileSync(
    npx,
    [
      '#!/bin/sh',
      'port=""',
      'while [ $# -gt 0 ]; do [ "$1" = "--port" ] && port="$2"; shift; done',
      `exec ${JSON.stringify(process.execPath)} ${JSON.stringify(path.join(FIX, 'preview-fixture-server.mjs'))} "$ATRAPA_TRYB" "$port"`,
      '',
    ].join('\n'),
  );
  chmodSync(npx, 0o755);
  return { dir, script };
};

const runIn = (sb: Sandbox, args: string[] = [], extra: Record<string, string> = {}) =>
  new Promise<{ rc: number | null; out: string; err: string }>((resolve) => {
    const base = { ...process.env };
    const c = spawn(process.execPath, [sb.script, ...args], {
      cwd: sb.dir,
      env: { ...base, PATH: `${path.join(sb.dir, 'bin')}:${base.PATH}`, ...extra },
    });
    let out = '';
    let err = '';
    c.stdout.on('data', (d) => (out += d));
    c.stderr.on('data', (d) => (err += d));
    c.on('exit', (rc) => resolve({ rc, out, err }));
  });

const gotos = (err: string) =>
  err
    .split('\n')
    .filter((l) => l.startsWith('ATRAPA-GOTO '))
    .map((l) => l.slice('ATRAPA-GOTO '.length));

describe('MIX-1445: audit-health uruchomiony naprawdę (prawdziwy pomocnik, mutant X5)', () => {
  it('sprawdza trasy pod adresem WŁASNEGO serwera (server.url), kod 0, port wolny po wyjściu', async () => {
    const port = await freePort();
    const sb = sandbox('scripts/audit-health.js', port, 'prawdziwy');
    const { rc, out, err } = await runIn(sb, [], { ATRAPA_TRYB: 'serve' });
    expect(gotos(err)).toEqual(ROUTES.map((r) => `http://127.0.0.1:${port}${r}`));
    expect(out).toMatch(/^- Healthy: 2$/m);
    expect(out).toMatch(/^- Broken: 0$/m);
    expect(rc).toBe(0);
    const report = JSON.parse(readFileSync(path.join(sb.dir, 'health-report.json'), 'utf8'));
    expect(report.success).toEqual(ROUTES);
    expect(await portFreeSoon(port)).toBe(true);
  }, 30000);

  it('negatyw: serwer-atrapa kończy się przy starcie = kod 1, linia powodu, zero tras', async () => {
    const port = await freePort();
    const sb = sandbox('scripts/audit-health.js', port, 'prawdziwy');
    const { rc, out, err } = await runIn(sb, [], { ATRAPA_TRYB: 'die-now' });
    expect(rc).toBe(1);
    expect(err).toMatch(
      /^SONDA NIE URUCHOMIONA: serwer zakończył się podczas startu \(kod 1, sygnał null\); port zajęty albo błąd startu$/m,
    );
    expect(gotos(err)).toEqual([]);
    expect(out).not.toMatch(/Checking:/);
    expect(existsSync(path.join(sb.dir, 'health-report.json'))).toBe(false);
  }, 30000);

  it('negatyw: obcy serwer na porcie = kod 1, linia powodu, zero tras', async () => {
    const port = await freePort();
    const sb = sandbox('scripts/audit-health.js', port, 'prawdziwy');
    const held = await holdPort(port);
    try {
      const { rc, err } = await runIn(sb, [], { ATRAPA_TRYB: 'serve' });
      expect(rc).toBe(1);
      expect(err).toMatch(
        new RegExp(
          `^SONDA NIE URUCHOMIONA: port ${port} zajęty lub niedostępny \\(EADDRINUSE\\)$`,
          'm',
        ),
      );
      expect(gotos(err)).toEqual([]);
    } finally {
      await new Promise((r) => (held ? held.close(r) : r(null)));
    }
  }, 30000);
});

describe('MIX-1445: audit-a11y, gdy stop() serwera zawodzi (mutant X6)', () => {
  const site = () =>
    new Promise<{ url: string; close: () => Promise<unknown> }>((resolve) => {
      const s = http.createServer((_q, r) => r.writeHead(200).end('<div id="root"></div>'));
      s.listen(0, '127.0.0.1', () => {
        const p = (s.address() as net.AddressInfo).port;
        resolve({ url: `http://127.0.0.1:${p}`, close: () => new Promise((r) => s.close(r)) });
      });
    });

  it('stop() odrzucony: kod 1 i linia powodu, mimo czystego audytu', async () => {
    const web = await site();
    try {
      const sb = sandbox('scripts/audit-a11y.js', 4173, 'atrapa');
      const { rc, out, err } = await runIn(sb, ['/'], {
        ATRAPA_URL: web.url,
        ATRAPA_STOP_FAIL: '1',
      });
      expect(out).toMatch(/✅ \/ passed audit/);
      expect(err).toMatch(/^❌ grupa serwera 4242 nie zniknęła po SIGKILL$/m);
      expect(rc).toBe(1);
    } finally {
      await web.close();
    }
  }, 30000);

  it('bliźniak: stop() udany, czysty audyt = kod 0', async () => {
    const web = await site();
    try {
      const sb = sandbox('scripts/audit-a11y.js', 4173, 'atrapa');
      const { rc, out, err } = await runIn(sb, ['/'], { ATRAPA_URL: web.url });
      expect(gotos(err)).toEqual([`${web.url}/`]);
      expect(out).toMatch(/✅ \/ passed audit/);
      expect(err).not.toMatch(/nie zniknęła/);
      expect(rc).toBe(0);
    } finally {
      await web.close();
    }
  }, 30000);
});
