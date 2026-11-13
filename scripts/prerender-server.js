// Port i tożsamość serwera podglądu dla prerender.js (MIX-1590).
// Dawniej port 4173 był na sztywno: dwa buildy równolegle na jednej maszynie
// podpinały się pod serwer drugiego i zapisywały do swojego dist/ jego strony.
// Teraz: wolny port (albo PRERENDER_PORT) + znacznik jednorazowy, którego serwer MUSI oddać.
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';

export const NONCE_FILE = 'prerender-nonce.txt';

/**
 * Porty localhost dozwolone w CORS projektu Sanity (zmierzone OPTIONS z Origin, MIX-1590):
 * 3000, 3333, 4173, 5173. Strona w prerenderze pobiera dane z Sanity z przeglądarki, więc
 * origin musi być z tej listy — dowolny wolny port (listen na 0) daje „stan błędu CMS”.
 */
export const ALLOWED_PORTS = [4173, 5173, 3000, 3333];

function isFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(false));
    srv.listen(port, () => srv.close(() => resolve(true)));
  });
}

/**
 * PRERENDER_PORT (liczba 1-65535, bez sprawdzania wolności) albo pierwszy wolny port z
 * ALLOWED_PORTS poza `exclude`. Brak wolnego = odmowa z komunikatem (fail-closed).
 */
export async function pickPort(env = process.env, exclude = []) {
  const raw = env.PRERENDER_PORT;
  if (raw !== undefined && raw !== '') {
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 1 || n > 65535) {
      throw new Error(`PRERENDER_PORT=${raw} nie jest poprawnym portem`);
    }
    return n;
  }
  for (const port of ALLOWED_PORTS) {
    if (!exclude.includes(port) && (await isFree(port))) return port;
  }
  throw new Error(
    `Brak wolnego portu prerenderu z listy dozwolonej w CORS Sanity (${ALLOWED_PORTS.join(', ')}); ` +
      'zwolnij jeden (inny build na tej maszynie) albo ustaw PRERENDER_PORT',
  );
}

/** Zapisuje losowy znacznik w katalogu dist tego builda; zwraca jego wartość. */
export function writeNonce(distDir) {
  const nonce = crypto.randomBytes(16).toString('hex');
  fs.writeFileSync(path.join(distDir, NONCE_FILE), nonce);
  return nonce;
}

export function removeNonce(distDir) {
  fs.rmSync(path.join(distDir, NONCE_FILE), { force: true });
}

/** Limit jednego żądania do serwera podglądu; po nim błąd z numerem portu (MIX-1601). */
export const REQUEST_TIMEOUT_MS = 3000;

class SilentServerError extends Error {}

function fetchText(port, urlPath, timeoutMs = REQUEST_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}${urlPath}`, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
      res.on('error', reject);
    });
    req.on('error', reject);
    // Limit całkowity (nie tylko bezczynności): nasłuch, który przyjmuje połączenie i milczy
    // albo sączy odpowiedź, nie może zawiesić buildu.
    const timer = setTimeout(
      () =>
        req.destroy(
          new SilentServerError(
            `Serwer na porcie ${port} przyjął połączenie, ale nie odpowiedział w ${timeoutMs} ms ` +
              '(obcy proces na porcie?); przerywam build',
          ),
        ),
      timeoutMs,
    );
    req.on('close', () => clearTimeout(timer));
  });
}

/**
 * Czeka, aż serwer na porcie odpowie 200. Odmowa połączenia = serwer jeszcze nie wstał (ponawiamy
 * co `retryMs` do `timeout`). Przyjęte połączenie bez odpowiedzi w `requestTimeoutMs` = błąd od
 * razu (fail-closed, MIX-1601); tak samo upływ `timeout`.
 */
export async function waitForServer(
  port,
  timeout = 60000,
  { requestTimeoutMs = REQUEST_TIMEOUT_MS, retryMs = 1000 } = {},
) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const { status } = await fetchText(port, '/', requestTimeoutMs);
      if (status === 200) return;
    } catch (e) {
      if (e instanceof SilentServerError) throw e;
    }
    await new Promise((r) => setTimeout(r, retryMs));
  }
  throw new Error(`Server at port ${port} did not start within ${timeout}ms`);
}

/**
 * Fail-closed: serwer na porcie ma oddać znacznik TEGO builda. Brak pliku (404 / HTML
 * z fallbacku SPA), inna wartość albo błąd = wyjątek, nigdy ciche przejście.
 */
export async function assertServesThisBuild(port, nonce, timeoutMs = REQUEST_TIMEOUT_MS) {
  const { status, body } = await fetchText(port, `/${NONCE_FILE}`, timeoutMs);
  if (status !== 200 || body.trim() !== nonce) {
    throw new Error(
      `Serwer na porcie ${port} nie oddaje znacznika tego builda (status ${status}) — ` +
        'to inny build albo obcy proces; przerywam, żeby nie zapisać cudzych stron do dist/',
    );
  }
}

/**
 * Start podglądu na wolnym porcie z listy i dowód, że odpowiada serwer TEGO builda (MIX-1590).
 * `startServer(port)` zwraca proces, `kill(proc)` go zabija. Przegrany wyścig o port = próba
 * następnego portu; PRERENDER_PORT wymuszony = pierwszy błąd kończy build, bez ponowień.
 *
 * @param {object} opts
 * @param {string} opts.nonce
 * @param {Record<string, string | undefined>} [opts.env]
 * @param {(port: number) => any} opts.startServer
 * @param {(server: any) => unknown} opts.kill
 * @param {(port: number) => void} [opts.onPort]
 * @param {{ log: (msg: string) => void, warn: (msg: string) => void }} [opts.log]
 * @param {{ requestTimeoutMs?: number, retryMs?: number }} [opts.waitOptions]
 * @returns {Promise<any>}
 */
export async function acquirePreview({
  nonce,
  env = process.env,
  startServer,
  kill,
  onPort = () => {},
  log = console,
  waitOptions,
}) {
  const tried = [];
  for (;;) {
    const port = await pickPort(env, tried);
    onPort(port);
    log.log(`🔌 Preview port: ${port}`);
    const server = startServer(port);
    try {
      await waitForServer(port, undefined, waitOptions);
      await assertServesThisBuild(port, nonce);
      return server;
    } catch (err) {
      kill(server);
      if (env.PRERENDER_PORT) throw err; // port wymuszony: bez ponowień
      tried.push(port);
      log.warn(`⚠️ Port ${port} nie obsługuje tego builda (${err.message}) — próbuję kolejny`);
    }
  }
}
