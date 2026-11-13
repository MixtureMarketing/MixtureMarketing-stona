import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ALLOWED_PORTS,
  REQUEST_TIMEOUT_MS,
  WAIT_DEADLINE_MS,
  MIN_TIMEOUT_MS,
  MAX_TIMEOUT_MS,
  acquirePreview,
  waitForServer,
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

describe('waitForServer / assertServesThisBuild: limit czasu żądania (MIX-1601)', () => {
  /** Nasłuch przyjmujący połączenia i nigdy nie odpowiadający (obcy proces na porcie). */
  function silent(): Promise<number> {
    return new Promise((resolve) => {
      const sockets: net.Socket[] = [];
      const s = net.createServer((sock) => sockets.push(sock));
      const close = s.close.bind(s);
      s.close = ((cb?: (err?: Error) => void) => {
        sockets.forEach((x) => x.destroy());
        return close(cb);
      }) as typeof s.close;
      holders.push(s);
      s.listen(0, () => resolve((s.address() as net.AddressInfo).port));
    });
  }

  it('limit żądania jest krótszy niż 10 s (kryterium: błąd buildu w ≤ 10 s)', () => {
    expect(REQUEST_TIMEOUT_MS).toBeGreaterThan(0);
    expect(REQUEST_TIMEOUT_MS).toBeLessThanOrEqual(8000);
    expect(WAIT_DEADLINE_MS).toBeGreaterThan(REQUEST_TIMEOUT_MS);
    expect(WAIT_DEADLINE_MS).toBeLessThanOrEqual(10000);
  });

  it('nasłuch, który milczy: waitForServer kończy się błędem z numerem portu, nie wisi', async () => {
    const port = await silent();
    const t0 = Date.now();
    await expect(
      waitForServer(port, 60000, { requestTimeoutMs: 300, deadlineMs: 900 }),
    ).rejects.toThrow(new RegExp(`porcie ${port} przyjął połączenie, ale nie odpowiedział`));
    expect(Date.now() - t0).toBeLessThan(5000); // nie 60 s pętli
  });

  it('domyślny limit: milczący nasłuch = błąd w ≤ 10 s', async () => {
    const port = await silent();
    const t0 = Date.now();
    await expect(waitForServer(port)).rejects.toThrow(new RegExp(`porcie ${port}`));
    expect(Date.now() - t0).toBeLessThanOrEqual(10000);
  }, 12000);

  it('nasłuch, który milczy: assertServesThisBuild też odmawia z numerem portu', async () => {
    const port = await silent();
    const t0 = Date.now();
    await expect(
      assertServesThisBuild(port, 'n', { requestTimeoutMs: 300, deadlineMs: 600 }),
    ).rejects.toThrow(new RegExp(`porcie ${port} przyjął połączenie`));
    expect(Date.now() - t0).toBeLessThan(2000); // przekazany limit działa, nie domyślne 3 s
  });

  it('serwer, który sączy odpowiedź bez końca, też jest ucinany (limit całkowity)', async () => {
    const port = await serve((_req, res) => {
      res.write('x');
      const t = setInterval(() => res.write('x'), 50);
      res.on('close', () => clearInterval(t));
    });
    await expect(
      waitForServer(port, 60000, { requestTimeoutMs: 300, deadlineMs: 900 }),
    ).rejects.toThrow(new RegExp(`porcie ${port}`));
  });

  /** Serwer odpowiadający z opóźnieniem: `/` = 200, plik znacznika = `nonce`. */
  function slow(delayMs: number, nonce = 'n'): Promise<number> {
    return serve((req, res) => {
      const t = setTimeout(() => res.end(req.url?.includes(NONCE_FILE) ? nonce : 'ok'), delayMs);
      res.on('close', () => clearTimeout(t));
    });
  }

  it('wolny, ale poprawny serwer (odpowiedź po 4 s > limit żądania 3 s) NIE jest błędem', async () => {
    const port = await slow(4000);
    await expect(waitForServer(port)).resolves.toBeUndefined();
  }, 12000);

  it('wolny serwer znacznika (4 s) z dobrym znacznikiem przechodzi, ze złym odmawia', async () => {
    const port = await slow(4000, 'dobry');
    await expect(assertServesThisBuild(port, 'dobry')).resolves.toBeUndefined();
    await expect(assertServesThisBuild(port, 'zly')).rejects.toThrow(/nie oddaje znacznika/);
  }, 16000);

  it('pierwsze żądanie wisi, kolejne dostaje odpowiedź = sukces (ponowienie, nie ucięcie)', async () => {
    let n = 0;
    const port = await serve((_req, res) => {
      if (++n > 1) res.end('ok'); // pierwsze połączenie zostaje bez odpowiedzi
    });
    await expect(
      waitForServer(port, 60000, { requestTimeoutMs: 200, deadlineMs: 3000 }),
    ).resolves.toBeUndefined();
    expect(n).toBeGreaterThan(1);
  });

  it('status ≠ 200 nie jest gotowością (503 do końca limitu = błąd z numerem portu)', async () => {
    const port = await serve((_req, res) => {
      res.statusCode = 503;
      res.end('ok');
    });
    await expect(waitForServer(port, 600, { retryMs: 100 })).rejects.toThrow(
      new RegExp(`port ${port} did not start`),
    );
  });

  it('bliźniak: 503, a potem 200 = doczekany', async () => {
    let n = 0;
    const port = await serve((_req, res) => {
      res.statusCode = ++n < 3 ? 503 : 200;
      res.end('ok');
    });
    await expect(waitForServer(port, 5000, { retryMs: 50 })).resolves.toBeUndefined();
  });

  it('bliźniak: serwer odpowiadający 200 przechodzi', async () => {
    const port = await serve((_req, res) => res.end('ok'));
    await expect(waitForServer(port, 5000, { requestTimeoutMs: 300 })).resolves.toBeUndefined();
  });

  it('bliźniak: serwer, który wstaje po chwili (odmowa połączenia), jest doczekany', async () => {
    const probe = await serve((_req, res) => res.end('x'));
    servers.pop()?.close(); // port wolny, nic nie nasłuchuje
    const started = new Promise<void>((resolve) => {
      setTimeout(() => {
        const s = http.createServer((_req, res) => res.end('ok'));
        servers.push(s);
        s.listen(probe, () => resolve());
      }, 300);
    });
    await expect(
      waitForServer(probe, 5000, { requestTimeoutMs: 300, retryMs: 50 }),
    ).resolves.toBeUndefined();
    await started;
  });

  it('nic nie nasłuchuje przez cały limit = błąd z numerem portu', async () => {
    const probe = await serve((_req, res) => res.end('x'));
    servers.pop()?.close();
    await expect(waitForServer(probe, 300, { retryMs: 50 })).rejects.toThrow(
      new RegExp(`port ${probe} did not start`),
    );
  });
});

describe('assertServesThisBuild: porównanie znacznika jest dokładne (MIX-1601)', () => {
  const nonce = 'abc123';

  it.each([
    ['nonce + dopisek', `${nonce}x`],
    ['prefiks znacznika', 'abc12'],
    ['znacznik z tyłu innego tekstu', `x${nonce}`],
    ['pusta odpowiedź', ''],
  ])('odmawia: %s', async (_nazwa, body) => {
    const port = await serve((_req, res) => res.end(body));
    await expect(assertServesThisBuild(port, nonce)).rejects.toThrow(
      /nie oddaje znacznika tego builda \(status 200\)/,
    );
  });

  it('bliźniak: znacznik z końcowym znakiem nowej linii przechodzi (trim)', async () => {
    const port = await serve((_req, res) => res.end(`${nonce}\n`));
    await expect(assertServesThisBuild(port, nonce)).resolves.toBeUndefined();
  });
});

describe('ALLOWED_PORTS (MIX-1601)', () => {
  it('odpowiada dokładnie liście localhost z CORS projektu Sanity', () => {
    // Lustro CORS Sanity (zmierzone OPTIONS z Origin, MIX-1590): zmiana tej listy bez zmiany
    // CORS w Sanity daje „stan błędu CMS” w prerenderze, więc zmieniamy obie strony naraz.
    expect(ALLOWED_PORTS).toEqual([4173, 5173, 3000, 3333]);
  });
});

describe('acquirePreview (MIX-1601)', () => {
  const nonce = 'znacznik-tego-builda';
  const quiet = { log: { log: () => {}, warn: () => {} } };

  /** Prawdziwy serwer na porcie, który wybrał acquirePreview; `bodyFor(n)` = odpowiedź n-tego startu. */
  function harness(bodyFor: (call: number) => string | null) {
    const calls: number[] = [];
    const killed: unknown[] = [];
    const startServer = (port: number) => {
      calls.push(port);
      if (calls.length > 4) throw new Error('pętla ponowień bez końca');
      const body = bodyFor(calls.length);
      const proc = { port };
      if (body !== null) {
        const s = http.createServer((_req, res) => res.end(body));
        servers.push(s);
        s.listen(port);
      }
      return proc;
    };
    const kill = (p: unknown) => killed.push(p);
    return { calls, killed, startServer, kill };
  }

  it('PRERENDER_PORT zajęty przez obcy serwer = błąd od razu, bez ponowień', async () => {
    const foreign = await serve((_req, res) => res.end('<!doctype html>'));
    const h = harness(() => null); // nie startujemy własnego: port zajmuje obcy
    await expect(
      acquirePreview({
        nonce,
        env: { PRERENDER_PORT: String(foreign) },
        startServer: h.startServer,
        kill: h.kill,
        ...quiet,
      }),
    ).rejects.toThrow(/nie oddaje znacznika tego builda/);
    expect(h.calls).toEqual([foreign]); // dokładnie jedna próba
    expect(h.killed).toHaveLength(1); // nieudany podgląd zabity
  });

  it('PRERENDER_PORT + wolny, ale poprawny własny podgląd (4 s) = sukces, bez zmiany portu', async () => {
    const port = await serve((req, res) => {
      const t = setTimeout(() => res.end(req.url?.includes(NONCE_FILE) ? nonce : 'ok'), 4000);
      res.on('close', () => clearTimeout(t));
    });
    const h = harness(() => null);
    const started = await acquirePreview({
      nonce,
      env: { PRERENDER_PORT: String(port) },
      startServer: h.startServer,
      kill: h.kill,
      ...quiet,
    });
    expect(started).toEqual({ port });
    expect(h.calls).toEqual([port]);
    expect(h.killed).toHaveLength(0);
  }, 20000);

  it('PRERENDER_PORT zajęty przez milczący nasłuch = błąd z numerem portu, bez ponowień', async () => {
    const port = await new Promise<number>((resolve) => {
      const s = net.createServer(() => {});
      holders.push(s);
      s.listen(0, () => resolve((s.address() as net.AddressInfo).port));
    });
    const h = harness(() => null);
    await expect(
      acquirePreview({
        nonce,
        env: { PRERENDER_PORT: String(port) },
        startServer: h.startServer,
        kill: h.kill,
        waitOptions: { requestTimeoutMs: 300, deadlineMs: 900 },
        ...quiet,
      }),
    ).rejects.toThrow(new RegExp(`porcie ${port}`));
    expect(h.calls).toEqual([port]);
  });

  it('bez PRERENDER_PORT: odrzucony port (cudzy znacznik) = kolejny port, a zły podgląd zabity', async () => {
    const h = harness((n) => (n === 1 ? 'cudzy-build' : nonce));
    const reported: number[] = [];
    const proc = await acquirePreview({
      nonce,
      env: {},
      startServer: h.startServer,
      kill: h.kill,
      onPort: (p: number) => reported.push(p),
      ...quiet,
    });
    expect(reported).toEqual(h.calls); // prerender.js dostaje każdy wybrany port (PORT)
    expect(h.calls).toHaveLength(2);
    expect(h.calls[1]).not.toBe(h.calls[0]);
    expect(h.killed).toEqual([{ port: h.calls[0] }]);
    expect(proc).toEqual({ port: h.calls[1] });
  });

  it('przekazany znacznik jest tym, którego serwer ma oddać (zły = odmowa, dobry = przejście)', async () => {
    const ok = harness(() => nonce);
    const started = await acquirePreview({
      nonce,
      env: {},
      startServer: ok.startServer,
      kill: ok.kill,
      ...quiet,
    });
    expect(started).toEqual({ port: ok.calls[0] });
    const bad = harness(() => nonce);
    await expect(
      acquirePreview({
        nonce: 'inny',
        env: { PRERENDER_PORT: String((await pickPort({})) as number) },
        startServer: bad.startServer,
        kill: bad.kill,
        ...quiet,
      }),
    ).rejects.toThrow(/nie oddaje znacznika/);
  });
});

describe('prerender.js: okablowanie', () => {
  const src = fs.readFileSync(path.resolve(__dirname, '../../prerender.js'), 'utf8');

  it('nie ma stałego portu 4173 ani własnej pętli wyboru portu', () => {
    expect(src).not.toMatch(/\b4173\s*;/);
    expect(src).not.toMatch(/pickPort/);
    expect(src).toMatch(/acquirePreview\(\{/);
  });

  it('preview startuje z --strictPort', () => {
    expect(src).toContain("'--strictPort'");
  });

  it('znacznik zapisany przez writeNonce trafia do startPreview i dalej do acquirePreview', () => {
    expect(src).toMatch(/const nonce = writeNonce\(DIST_DIR\);/);
    expect(src).toMatch(/server = await startPreview\(nonce\);/);
    expect(src).toMatch(/function startPreview\(nonce\) \{\s*return acquirePreview\(\{\s*nonce,/);
  });

  it('używa waitForServer z modułu (z limitem żądania), nie własnej pętli bez limitu', () => {
    expect(src).not.toMatch(/function waitForServer/);
    expect(src).not.toMatch(/http\.get/);
  });

  it('sprząta znacznik w finally', () => {
    expect(src).toMatch(/finally \{[\s\S]*removeNonce\(DIST_DIR\)/);
  });
});

describe('sprzątanie po sukcesie: dodatkowe żądania i liczniki (MIX-1618)', () => {
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const SERVER_JS = path.resolve(__dirname, '../../scripts/prerender-server.js');

  /** Serwer: pierwsze `hang` żądań wisi bez odpowiedzi, kolejne dostają `ok`. Liczy żądania i wiszące. */
  function hanging(hang: number) {
    const state = { total: 0, open: 0 };
    return serve((_req, res) => {
      const n = ++state.total;
      state.open++;
      res.on('close', () => state.open--);
      if (n > hang) res.end('ok');
    }).then((port) => ({ port, state }));
  }

  it('po sukcesie wszystkie wiszące żądania są zamknięte (nic nie zostaje otwarte)', async () => {
    const { port, state } = await hanging(3);
    await waitForServer(port, 60000, { requestTimeoutMs: 100, deadlineMs: 5000 });
    expect(state.total).toBeGreaterThan(3); // były dodatkowe, równoległe żądania
    await delay(400);
    expect(state.open).toBe(0);
  });

  it('po sukcesie nie wychodzą nowe żądania (licznik czasu ponowień wyczyszczony)', async () => {
    const { port, state } = await hanging(2);
    await waitForServer(port, 60000, { requestTimeoutMs: 100, deadlineMs: 5000 });
    await delay(150);
    const after = state.total;
    await delay(600); // 6 okresów ponowienia
    expect(state.total).toBe(after);
  });

  it('po sukcesie proces może się zakończyć sam (bez otwartych uchwytów i liczników)', async () => {
    const { port, state } = await hanging(2);
    const code = `
      import { waitForServer, assertServesThisBuild } from ${JSON.stringify(SERVER_JS)};
      const port = ${port};
      await waitForServer(port, 60000, { requestTimeoutMs: 100, deadlineMs: 600000 });
      await assertServesThisBuild(port, 'ok', { requestTimeoutMs: 100, deadlineMs: 600000 });
    `;
    const { spawn } = await import('node:child_process');
    const child = spawn(process.execPath, ['--input-type=module', '-e', code], { stdio: 'ignore' });
    const exit = await new Promise<{ code: number | null; killed: boolean }>((resolve) => {
      const guard = setTimeout(() => {
        child.kill('SIGKILL');
      }, 5000);
      child.on('exit', (c) => {
        clearTimeout(guard);
        resolve({ code: c, killed: child.killed });
      });
    });
    expect(exit).toEqual({ code: 0, killed: false }); // sam wyszedł w < 5 s (deadline 600 s, nie czeka)
    expect(state.total).toBeGreaterThan(2);
  }, 15000);

  it('jedno żądanie pada, a inne trwa: to nie jest błąd, wygrywa żądanie, które dojdzie', async () => {
    let n = 0;
    const port = await serve((req, res) => {
      const mine = ++n;
      setTimeout(() => {
        if (mine === 1) {
          req.socket.destroy(); // pierwsze żądanie: zerwane połączenie
        } else {
          res.end('ok'); // drugie: poprawna odpowiedź, ale później niż błąd pierwszego
        }
      }, 150);
    });
    // assertServesThisBuild, nie waitForServer: ten drugi ponawia po błędzie (retryMs) i
    // zamaskowałby przedwczesne odrzucenie przez fetchHedged.
    await expect(
      assertServesThisBuild(port, 'ok', { requestTimeoutMs: 100, deadlineMs: 5000 }),
    ).resolves.toBeUndefined();
    expect(n).toBeGreaterThanOrEqual(2); // sukces z żądania równoległego do zerwanego
  });

  it('bliźniak: wszystkie próby padły (zerwane połączenia) = błąd, nie cisza do terminu', async () => {
    const port = await serve((req) => req.socket.destroy());
    const t0 = Date.now();
    await expect(
      assertServesThisBuild(port, 'n', { requestTimeoutMs: 100, deadlineMs: 5000 }),
    ).rejects.toThrow(/socket hang up|ECONNRESET/);
    expect(Date.now() - t0).toBeLessThan(2000);
  });
});

describe('limity czasu: dozwolone tylko skończone liczby w przedziale (MIX-1618)', () => {
  it('przedział jest sensowny i domyślne wartości w nim mieszczą się', () => {
    expect(MIN_TIMEOUT_MS).toBeGreaterThanOrEqual(100);
    expect(MAX_TIMEOUT_MS).toBeLessThanOrEqual(2 ** 31 - 1);
    for (const v of [REQUEST_TIMEOUT_MS, WAIT_DEADLINE_MS]) {
      expect(v).toBeGreaterThanOrEqual(MIN_TIMEOUT_MS);
      expect(v).toBeLessThanOrEqual(MAX_TIMEOUT_MS);
    }
  });

  const bad: Array<[string, unknown]> = [
    ['0', 0],
    ['-1', -1],
    ['NaN', NaN],
    ['Infinity', Infinity],
    ['-Infinity', -Infinity],
    ['tekst "3000"', '3000'],
    ['tekst "5000x"', '5000x'],
    ['null', null],
    ['true', true],
    ['obiekt', {}],
    ['tuż pod minimum', MIN_TIMEOUT_MS - 1],
    ['tuż nad maksimum', MAX_TIMEOUT_MS + 1],
    ['2**40', 2 ** 40],
  ];

  for (const [name, value] of bad) {
    for (const option of ['requestTimeoutMs', 'deadlineMs'] as const) {
      it(`${option} = ${name}: błąd od razu, zero połączeń`, async () => {
        let hits = 0;
        const port = await serve((_req, res) => {
          hits++;
          res.end('ok');
        });
        const t0 = Date.now();
        // timeout pętli 60 s: błąd opcji nie może być połknięty przez ponawianie
        const refusal = new RegExp(`${option}=.*niedozwolone`);
        await expect(waitForServer(port, 60000, { [option]: value } as never)).rejects.toThrow(
          refusal,
        );
        await expect(
          assertServesThisBuild(port, 'ok', { [option]: value } as never),
        ).rejects.toThrow(refusal);
        expect(Date.now() - t0).toBeLessThan(1000);
        expect(hits).toBe(0);
      });
    }
  }

  it('bliźniak: granice dolna i górna są dozwolone, brak opcji = wartości domyślne', async () => {
    const port = await serve((_req, res) => res.end('ok'));
    await expect(
      waitForServer(port, 5000, { requestTimeoutMs: MIN_TIMEOUT_MS, deadlineMs: MAX_TIMEOUT_MS }),
    ).resolves.toBeUndefined();
    await expect(
      waitForServer(port, 5000, { requestTimeoutMs: MAX_TIMEOUT_MS, deadlineMs: MIN_TIMEOUT_MS }),
    ).resolves.toBeUndefined();
    await expect(
      waitForServer(port, 5000, { requestTimeoutMs: undefined, deadlineMs: undefined }),
    ).resolves.toBeUndefined();
  });

  it('acquirePreview przekazuje zły limit jako błąd (nie ponawia po cichu na kolejnym porcie)', async () => {
    const started: number[] = [];
    await expect(
      acquirePreview({
        nonce: 'n',
        env: { PRERENDER_PORT: '' },
        startServer: (p: number) => started.push(p) && {},
        kill: () => {},
        log: { log: () => {}, warn: () => {} },
        waitOptions: { requestTimeoutMs: 0 },
      }),
    ).rejects.toThrow(/requestTimeoutMs=0.*niedozwolone/);
  });
});
