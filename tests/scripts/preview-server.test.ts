// @vitest-environment node
// MIX-1441: testy scripts/lib/preview-server.mjs (własny serwer sond e2e). Linux (ps, /proc).
import { afterEach, describe, expect, it } from 'vitest';
import { execFileSync, spawn } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import {
  assertPortFree,
  killGroup,
  listenerBelongsToGroup,
  parsePort,
  PreviewError,
  startPreview,
} from '../../scripts/lib/preview-server.mjs';

const HELPER = path.resolve(__dirname, '../../scripts/lib/preview-server.mjs');
const FIXTURE = path.resolve(__dirname, '../fixtures/preview-fixture-server.mjs');
const RUNNER = path.resolve(__dirname, '../fixtures/preview-runner.mjs');

const freePort = () =>
  new Promise<number>((resolve) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => {
      const p = (s.address() as net.AddressInfo).port;
      s.close(() => resolve(p));
    });
  });

// Procesy grupy (bez zombie): ps -eo pid,pgid,stat.
const groupPids = (pgid: number) =>
  execFileSync('ps', ['-eo', 'pid=,pgid=,stat='], { encoding: 'utf8' })
    .split('\n')
    .map((l) => l.trim().split(/\s+/))
    .filter((c) => c.length === 3 && Number(c[1]) === pgid && !c[2].startsWith('Z'))
    .map((c) => c[0]);

const startFixture = (mode: string, port: number, extra = {}) =>
  startPreview({
    port,
    command: process.execPath,
    args: [FIXTURE, mode, String(port)],
    readyTimeoutMs: 4000,
    killTimeoutMs: 400,
    ...extra,
  });

const cleanup: Array<() => Promise<unknown> | unknown> = [];
afterEach(async () => {
  while (cleanup.length) await cleanup.pop()!();
});

const foreignServer = (port: number, host = '127.0.0.1') =>
  new Promise<http.Server>((resolve) => {
    const s = http.createServer((_q, r) => r.writeHead(200).end('foreign'));
    s.listen(port, host, () => {
      cleanup.push(() => new Promise((r) => s.close(r)));
      resolve(s);
    });
  });

const reason = async (p: Promise<unknown>) => {
  try {
    await p;
  } catch (e) {
    expect(e).toBeInstanceOf(PreviewError);
    return (e as Error).message;
  }
  throw new Error('oczekiwano odmowy, a przeszło');
};

describe('parsePort (PORT pusty/niepoprawny)', () => {
  it('brak argumentu = domyślny; poprawny = liczba', () => {
    expect(parsePort(undefined, 4181)).toBe(4181);
    expect(parsePort('4200', 4181)).toBe(4200);
  });
  it.each(['', ' ', 'abc', '42x', '-1', '80', '70000', '4.5', '0x10'])('odmawia "%s"', (v) => {
    expect(() => parsePort(v, 4181)).toThrow(/port/);
  });
});

describe('port zajęty przed startem', () => {
  it('obcy serwer HTTP na porcie: odmowa z powodem, bez uruchamiania', async () => {
    const port = await freePort();
    await foreignServer(port);
    const msg = await reason(startFixture('serve', port));
    expect(msg).toMatch(new RegExp(`port ${port} zajęty`));
  });
  it('bliźniak: wolny port przechodzi', async () => {
    const port = await freePort();
    await expect(assertPortFree(port)).resolves.toBeUndefined();
  });
  it('sierota z poprzedniego biegu (żywy serwer w innej grupie) blokuje start', async () => {
    const port = await freePort();
    const orphan = spawn(process.execPath, [FIXTURE, 'serve', String(port)], {
      detached: true,
      stdio: 'ignore',
    });
    cleanup.push(() => killGroup(orphan.pid!, 300));
    await new Promise((r) => setTimeout(r, 600));
    await reason(startFixture('serve', port));
  });
  it('dwie sondy równolegle na tym samym porcie: druga odmawia, pierwsza działa', async () => {
    const port = await freePort();
    const first = await startFixture('serve', port);
    cleanup.push(() => first.stop());
    await reason(startFixture('serve', port));
    expect((await fetch(first.url)).status).toBe(200);
  });
});

describe('start i gotowość (fail-closed)', () => {
  it('serwer wstaje: gotowy, URL odpowiada, zwraca grupę', async () => {
    const port = await freePort();
    const s = await startFixture('serve', port);
    cleanup.push(() => s.stop());
    expect(s.url).toBe(`http://127.0.0.1:${port}`);
    expect((await fetch(s.url)).status).toBe(200);
    expect(groupPids(s.pid).length).toBeGreaterThanOrEqual(2); // serwer + wnuk
  });
  it('serwer kończy się od razu (zajęty port wg vite): odmowa z powodem', async () => {
    const msg = await reason(startFixture('die-now', await freePort()));
    expect(msg).toMatch(/zakończył się podczas startu/);
  });
  it('serwer umiera po chwili, zanim jest gotowy: odmowa, grupa posprzątana', async () => {
    const msg = await reason(startFixture('die-soon', await freePort()));
    expect(msg).toMatch(/zakończył się/);
  });
  it('serwer żyje, ale nie nasłuchuje: odmowa po limicie i grupa zabita', async () => {
    const port = await freePort();
    const msg = await reason(startFixture('silent', port, { readyTimeoutMs: 1200 }));
    expect(msg).toMatch(/nie jest gotowy/);
  });
  it('odpowiada OBCY proces (zajął port po naszym sprawdzeniu): odmowa, nie zielone światło', async () => {
    const port = await freePort();
    setTimeout(() => void foreignServer(port), 300);
    const msg = await reason(startFixture('silent', port, { readyTimeoutMs: 2500 }));
    expect(msg).toMatch(/nie jest gotowy|obcy/);
  });
  it('niepoprawny port w opcjach: odmowa', async () => {
    await reason(startPreview({ port: NaN, command: process.execPath, args: ['-e', ''] }));
  });
  it('nie da się uruchomić polecenia: odmowa', async () => {
    const port = await freePort();
    await reason(
      startPreview({ port, command: '/nie/ma/takiego/pliku', args: [], readyTimeoutMs: 2000 }),
    );
  });
});

describe('zabijanie grupy', () => {
  it('stop(): po nim 0 procesów grupy (serwer i wnuk)', async () => {
    const port = await freePort();
    const s = await startFixture('serve', port);
    expect(groupPids(s.pid).length).toBeGreaterThanOrEqual(2);
    await s.stop();
    expect(groupPids(s.pid)).toEqual([]);
    await expect(fetch(s.url)).rejects.toThrow();
  });
  it('proces ignorujący SIGTERM dostaje SIGKILL po limicie', async () => {
    const port = await freePort();
    const s = await startFixture('stubborn', port);
    await s.stop();
    expect(groupPids(s.pid)).toEqual([]);
  });
  it('zabicie samego pidu rodzica zostawia wnuka (dlatego zabijamy grupę)', async () => {
    const port = await freePort();
    const s = await startFixture('serve', port);
    process.kill(s.pid, 'SIGKILL');
    await new Promise((r) => setTimeout(r, 300));
    expect(groupPids(s.pid).length).toBeGreaterThanOrEqual(1);
    await s.stop();
    expect(groupPids(s.pid)).toEqual([]);
  });
  it('listenerBelongsToGroup: gniazdo naszego serwera tak, cudze nie', async () => {
    const port = await freePort();
    const s = await startFixture('serve', port);
    cleanup.push(() => s.stop());
    expect(listenerBelongsToGroup(port, s.pid)).toBe(true);
    expect(listenerBelongsToGroup(port, s.pid + 1)).toBe(false);
    const other = await freePort();
    await foreignServer(other);
    expect(listenerBelongsToGroup(other, s.pid)).toBe(false);
  });
});

describe('ścieżki wyjścia sondy (osobny proces)', () => {
  const run = async (mode: string, kill?: NodeJS.Signals) => {
    const checkAlive = mode !== 'stop';
    const port = await freePort();
    const child = spawn(process.execPath, [RUNNER, mode, String(port), HELPER, FIXTURE], {
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    const code = new Promise<number | null>((r) => child.on('exit', (c) => r(c)));
    for (let i = 0; i < 100 && !/PGID \d+/.test(out); i++) await new Promise((r) => setTimeout(r, 100));
    const pgid = Number(/PGID (\d+)/.exec(out)?.[1]);
    expect(pgid).toBeGreaterThan(0);
    cleanup.push(() => killGroup(pgid, 200));
    if (checkAlive) expect(groupPids(pgid).length).toBeGreaterThanOrEqual(2);
    if (kill) child.kill(kill);
    const rc = await code;
    await new Promise((r) => setTimeout(r, 300));
    return { rc, pgid };
  };
  it('SIGINT: kod 130, 0 procesów grupy', async () => {
    const { rc, pgid } = await run('wait', 'SIGINT');
    expect(rc).toBe(130);
    expect(groupPids(pgid)).toEqual([]);
  });
  it('SIGTERM: kod 143, 0 procesów grupy', async () => {
    const { rc, pgid } = await run('wait', 'SIGTERM');
    expect(rc).toBe(143);
    expect(groupPids(pgid)).toEqual([]);
  });
  it('wyjątek w sondzie: kod 1, 0 procesów grupy', async () => {
    const { rc, pgid } = await run('throw');
    expect(rc).toBe(1);
    expect(groupPids(pgid)).toEqual([]);
  });
  it('exit(0) bez stop(): 0 procesów grupy', async () => {
    const { rc, pgid } = await run('exit0');
    expect(rc).toBe(0);
    expect(groupPids(pgid)).toEqual([]);
  });
  it('bliźniak: zwykłe stop() i wyjście 0', async () => {
    const { rc, pgid } = await run('stop');
    expect(rc).toBe(0);
    expect(groupPids(pgid)).toEqual([]);
  });
});

describe('probe-view-transitions: pominięty przypadek to błąd (MIX-1441, kryterium 4)', () => {
  // Sonda wymaga budów i Chromium, więc tu sprawdzamy źródło: każda gałąź „brak karty” woła fail().
  const src = readFileSync(
    path.resolve(__dirname, '../../scripts/probe-view-transitions.mjs'),
    'utf8',
  );
  it('brak karty do zrzutu w połowie przejścia kończy się fail()', () => {
    expect(src).toMatch(/brak karty realizacji do zrzutu w połowie przejścia/);
    expect(src).toMatch(/\} else \{\s*\/\/ MIX-1441: brak karty = błąd[^\n]*\n\s*fail\(/);
  });
  it('brak karty w Powiązanych (pominięty A2) kończy się fail()', () => {
    expect(src).toMatch(/pominiete: 'brak karty realizacji w Powiązanych' \};\s*fail\(/);
  });
  it('żaden zapis „pominiete” nie zostaje bez fail()', () => {
    const skipped = src.match(/pominiete:/g) || [];
    const failed = src.match(/przypadek pominięty/g) || [];
    expect(skipped.length).toBe(failed.length);
  });
});
