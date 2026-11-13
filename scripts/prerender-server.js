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

/** PRERENDER_PORT (liczba 1-65535) albo wolny port przydzielony przez system. */
export function pickPort(env = process.env) {
  const raw = env.PRERENDER_PORT;
  if (raw !== undefined && raw !== '') {
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 1 || n > 65535) {
      return Promise.reject(new Error(`PRERENDER_PORT=${raw} nie jest poprawnym portem`));
    }
    return Promise.resolve(n);
  }
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
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
