// MIX-1443: audit-performance, test-e2e-contact, audit-a11y, audit-health używają wspólnego
// pomocnika scripts/lib/preview-server.mjs (grupa procesów, odmowa przy zajętym porcie).
import { describe, expect, it } from 'vitest';
import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { readFileSync } from 'node:fs';

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
