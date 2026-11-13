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

function fetchText(port, urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}${urlPath}`, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => req.destroy(new Error('timeout')));
  });
}

/**
 * Fail-closed: serwer na porcie ma oddać znacznik TEGO builda. Brak pliku (404 / HTML
 * z fallbacku SPA), inna wartość albo błąd = wyjątek, nigdy ciche przejście.
 */
export async function assertServesThisBuild(port, nonce) {
  const { status, body } = await fetchText(port, `/${NONCE_FILE}`);
  if (status !== 200 || body.trim() !== nonce) {
    throw new Error(
      `Serwer na porcie ${port} nie oddaje znacznika tego builda (status ${status}) — ` +
        'to inny build albo obcy proces; przerywam, żeby nie zapisać cudzych stron do dist/',
    );
  }
}
