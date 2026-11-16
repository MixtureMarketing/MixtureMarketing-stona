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

/**
 * Limity żądań do serwera podglądu (MIX-1601). Żądanie, które nie dostało odpowiedzi w
 * REQUEST_TIMEOUT_MS, NIE jest ucinane: obok niego idzie kolejne (ta sama odpowiedź może przyjść
 * z któregokolwiek), więc wolny, ale poprawny serwer (przeciążona maszyna) nie jest fałszywym
 * błędem. Dopiero brak odpowiedzi do WAIT_DEADLINE_MS = błąd z numerem portu (fail-closed).
 */
export const REQUEST_TIMEOUT_MS = 3000;
export const WAIT_DEADLINE_MS = 8000;

/**
 * Dolna i górna granica obu limitów (MIX-1618). Bez dolnej granicy `requestTimeoutMs` <= 0 / NaN
 * dawał ok. 520 nowych połączeń na sekundę do cudzego procesu na porcie. Dozwolone są tylko
 * skończone liczby z tego przedziału; wszystko inne (0, ujemne, NaN, Infinity, tekst, null) =
 * natychmiastowy błąd (fail-closed), nigdy ciche przejście na wartość domyślną.
 */
export const MIN_TIMEOUT_MS = 100;
export const MAX_TIMEOUT_MS = 600000;

class SilentServerError extends Error {}
class InvalidOptionError extends Error {}

function checkTimeout(name, value) {
  // Number.isFinite nie rzutuje typów: tekst, null, true i obiekt są odrzucone tak samo jak NaN.
  if (!Number.isFinite(value) || value < MIN_TIMEOUT_MS || value > MAX_TIMEOUT_MS) {
    throw new InvalidOptionError(
      `${name}=${String(value)} jest niedozwolone: wymagana liczba od ${MIN_TIMEOUT_MS} do ${MAX_TIMEOUT_MS} ms`,
    );
  }
}

/**
 * @typedef {{ requestTimeoutMs?: number, retryMs?: number, deadlineMs?: number }} WaitOptions
 */

/**
 * Pierwsza ukończona odpowiedź (dowolny status) z serwera na porcie. Odmowa połączenia
 * (żadne żądanie w toku) = natychmiastowy błąd połączenia, a milczenie do `deadlineMs` =
 * SilentServerError z numerem portu.
 * @param {number} port
 * @param {string} urlPath
 * @param {WaitOptions} [options]
 * @returns {Promise<{ status: number | undefined, body: string }>}
 */
function fetchHedged(
  port,
  urlPath,
  { requestTimeoutMs = REQUEST_TIMEOUT_MS, deadlineMs = WAIT_DEADLINE_MS } = {},
) {
  return new Promise((resolve, reject) => {
    checkTimeout('requestTimeoutMs', requestTimeoutMs); // throw w executorze = reject
    checkTimeout('deadlineMs', deadlineMs);
    const reqs = new Set();
    let finished = false;
    let hedge;
    let deadline;
    const finish = (settle, value) => {
      if (finished) return;
      finished = true;
      clearTimeout(hedge);
      clearTimeout(deadline);
      for (const r of reqs) r.destroy();
      settle(value);
    };
    const launch = () => {
      const req = http.get(`http://localhost:${port}${urlPath}`, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (body += c));
        res.on('end', () => finish(resolve, { status: res.statusCode, body }));
        res.on('error', fail);
      });
      const fail = (err) => {
        reqs.delete(req);
        if (reqs.size === 0) finish(reject, err); // wszystkie próby padły
      };
      reqs.add(req);
      req.on('error', fail);
    };
    const tick = () => {
      launch();
      hedge = setTimeout(tick, requestTimeoutMs);
    };
    deadline = setTimeout(
      () =>
        finish(
          reject,
          new SilentServerError(
            `Serwer na porcie ${port} przyjął połączenie, ale nie odpowiedział w ${deadlineMs} ms ` +
              '(obcy proces na porcie albo przeciążona maszyna); przerywam build',
          ),
        ),
      deadlineMs,
    );
    tick();
  });
}

/**
 * Czeka, aż serwer na porcie odpowie 200. Odmowa połączenia albo status ≠ 200 = serwer jeszcze
 * nie wstał (ponawiamy co `retryMs` do `timeout`). Serwer, który przyjął połączenie, ale nie
 * odpowiada przez `deadlineMs`, = błąd od razu (fail-closed); wolna, lecz poprawna odpowiedź
 * w tym czasie jest przyjmowana.
 * @param {number} port
 * @param {number} [timeout]
 * @param {WaitOptions} [options]
 */
export async function waitForServer(port, timeout = 60000, options = {}) {
  const { retryMs = 1000 } = options;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const { status } = await fetchHedged(port, '/', options);
      if (status === 200) return;
    } catch (e) {
      if (e instanceof SilentServerError || e instanceof InvalidOptionError) throw e;
    }
    await new Promise((r) => setTimeout(r, retryMs));
  }
  throw new Error(`Server at port ${port} did not start within ${timeout}ms`);
}

/**
 * Fail-closed: serwer na porcie ma oddać znacznik TEGO builda. Brak pliku (404 / HTML
 * z fallbacku SPA), inna wartość albo błąd = wyjątek, nigdy ciche przejście.
 * @param {number} port
 * @param {string} nonce
 * @param {WaitOptions} [options]
 */
export async function assertServesThisBuild(port, nonce, options = {}) {
  const { status, body } = await fetchHedged(port, `/${NONCE_FILE}`, options);
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
 * @param {WaitOptions} [opts.waitOptions]
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
      if (err instanceof InvalidOptionError) throw err; // zły limit to błąd konfiguracji, nie powód na kolejny port
      if (env.PRERENDER_PORT) throw err; // port wymuszony: bez ponowień
      tried.push(port);
      log.warn(`⚠️ Port ${port} nie obsługuje tego builda (${err.message}) — próbuję kolejny`);
    }
  }
}
