import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ALLOWED_PORTS,
  NONCE_FILE,
  assertServesThisBuild,
  pickPort,
  removeNonce,
  writeNonce,
} from '../../scripts/prerender-server.js';

const servers: http.Server[] = [];
const holders: net.Server[] = [];
const tmpDirs: string[] = [];

function serve(handler: http.RequestListener): Promise<number> {
  return new Promise((resolve) => {
    const s = http.createServer(handler);
    servers.push(s);
    s.listen(0, () => resolve((s.address() as net.AddressInfo).port));
  });
}

function hold(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once('error', () => resolve(false));
    s.listen(port, () => {
      holders.push(s);
      resolve(true);
    });
  });
}

afterEach(() => {
  for (const s of servers.splice(0)) s.close();
  for (const s of holders.splice(0)) s.close();
  for (const d of tmpDirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

describe('pickPort (MIX-1590: wolny port z listy dozwolonej w CORS Sanity)', () => {
  it('zwraca port z listy dozwolonych', async () => {
    expect(ALLOWED_PORTS).toContain(await pickPort({}));
  });

  it('gdy 4173 jest zajęty, daje inny port z listy (nie stały 4173)', async () => {
    await hold(4173); // zajęty przez nas albo już cudzy — w obu przypadkach wynik ma być inny
    const p = await pickPort({});
    expect(p).not.toBe(4173);
    expect(ALLOWED_PORTS).toContain(p);
  });

  it('pomija porty z listy exclude', async () => {
    const first = await pickPort({});
    const second = await pickPort({}, [first]);
    expect(second).not.toBe(first);
    expect(ALLOWED_PORTS).toContain(second);
  });

  it('wszystkie porty zajęte = odmowa z komunikatem (fail-closed)', async () => {
    for (const p of ALLOWED_PORTS) await hold(p);
    await expect(pickPort({})).rejects.toThrow(/Brak wolnego portu prerenderu/);
  });

  it('PRERENDER_PORT wygrywa z listą', async () => {
    expect(await pickPort({ PRERENDER_PORT: '5555' })).toBe(5555);
  });

  it.each(['abc', '0', '70000', '-1', '12.5'])(
    'PRERENDER_PORT=%s = odmowa z komunikatem (fail-closed)',
    async (bad) => {
      await expect(pickPort({ PRERENDER_PORT: bad })).rejects.toThrow(
        /PRERENDER_PORT=.*nie jest poprawnym portem/,
      );
    },
  );
});

describe('assertServesThisBuild (znacznik builda)', () => {
  const nonce = 'abc123';

  it('przepuszcza serwer, który oddaje znacznik tego builda', async () => {
    const port = await serve((_req, res) => res.end(nonce));
    await expect(assertServesThisBuild(port, nonce)).resolves.toBeUndefined();
  });

  it('odmawia, gdy serwer oddaje znacznik INNEGO builda (200, inna treść)', async () => {
    const port = await serve((_req, res) => res.end('inny-build'));
    await expect(assertServesThisBuild(port, nonce)).rejects.toThrow(
      /nie oddaje znacznika tego builda \(status 200\)/,
    );
  });

  it('odmawia, gdy znacznika nie ma (404)', async () => {
    const port = await serve((_req, res) => {
      res.statusCode = 404;
      res.end(nonce); // nawet z dobrą treścią: status ≠ 200 = odmowa
    });
    await expect(assertServesThisBuild(port, nonce)).rejects.toThrow(/status 404/);
  });

  it('odmawia, gdy serwer robi fallback SPA (200 + HTML)', async () => {
    const port = await serve((_req, res) => res.end('<!doctype html><div id="root"></div>'));
    await expect(assertServesThisBuild(port, nonce)).rejects.toThrow(/nie oddaje znacznika/);
  });

  it('odmawia, gdy nic nie nasłuchuje (błąd połączenia, nie ciche przejście)', async () => {
    const port = await serve((_req, res) => res.end(nonce)); // port efemeryczny...
    servers.pop()?.close(); // ...zwolniony: nic nie nasłuchuje
    await expect(assertServesThisBuild(port, nonce)).rejects.toThrow();
  });
});

describe('writeNonce / removeNonce', () => {
  it('zapisuje unikalny znacznik w dist i usuwa go bez śladu', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prn-'));
    tmpDirs.push(dir);
    const a = writeNonce(dir);
    expect(fs.readFileSync(path.join(dir, NONCE_FILE), 'utf8')).toBe(a);
    const b = writeNonce(dir);
    expect(b).not.toBe(a);
    removeNonce(dir);
    expect(fs.readdirSync(dir)).toEqual([]);
    removeNonce(dir); // idempotentne
  });
});

describe('prerender.js: okablowanie', () => {
  const src = fs.readFileSync(path.resolve(__dirname, '../../prerender.js'), 'utf8');

  it('nie ma stałego portu 4173', () => {
    expect(src).not.toMatch(/\b4173\s*;/);
    expect(src).toMatch(/PORT = await pickPort\(process\.env, tried\)/);
  });

  it('preview startuje z --strictPort i sprawdza znacznik builda przed użyciem', () => {
    expect(src).toContain("'--strictPort'");
    expect(src).toMatch(
      /await waitForServer\(PORT\);\s*[\s\S]{0,200}await assertServesThisBuild\(PORT, nonce\)/,
    );
  });

  it('przy odrzuconym porcie próbuje następny (tried.push) i zabija nieudany preview', () => {
    expect(src).toMatch(/killServer\(server\);[\s\S]{0,200}tried\.push\(PORT\)/);
  });

  it('sprząta znacznik w finally', () => {
    expect(src).toMatch(/finally \{[\s\S]*removeNonce\(DIST_DIR\)/);
  });
});
