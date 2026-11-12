/**
 * MIX-1441: wspólny, własny serwer `vite preview` dla sond e2e (puppeteer).
 *
 * Po co: `server.kill()` przy `npx` zabijało tylko powłokę; `vite preview` zostawał jako sierota
 * (ppid 1) i dalej odpowiadał na porcie, więc kolejna sonda mogła przetestować cudzy lub stary
 * build i przejść (MIX-1430, F4). Ten moduł:
 *  - odmawia startu, gdy port jest zajęty (sierota, obcy serwer, druga sonda);
 *  - uruchamia serwer w OSOBNEJ grupie procesów (detached) i zabija całą grupę
 *    (SIGTERM, po limicie SIGKILL) na każdej ścieżce wyjścia: stop(), exit, SIGINT/SIGTERM/SIGHUP,
 *    wyjątek;
 *  - uznaje serwer za gotowy dopiero, gdy proces żyje, odpowiada HTTP (<500, dwa razy z rzędu)
 *    i (Linux) gniazdo nasłuchujące na porcie należy do NASZEJ grupy procesów; inaczej błąd.
 *
 * Zasada: fail-closed. Każdy błąd = wyjątek PreviewError z jednym zdaniem powodu; sonda ma wtedy
 * zakończyć się kodem != 0 bez testowania czegokolwiek.
 */
import { spawn } from 'node:child_process';
import net from 'node:net';
import http from 'node:http';
import fs from 'node:fs';

export class PreviewError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PreviewError';
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Port z argumentu: brak = domyślny; pusty, nie-liczba, poza 1024-65535 = błąd (bez zgadywania). */
export function parsePort(raw, fallback) {
  if (raw === undefined || raw === null) return fallback;
  const s = String(raw).trim();
  if (!/^\d{1,5}$/.test(s)) throw new PreviewError(`niepoprawny port: "${String(raw)}"`);
  const n = Number(s);
  if (n < 1024 || n > 65535) throw new PreviewError(`port poza zakresem 1024-65535: ${n}`);
  return n;
}

/** Wolny port = da się na nim nasłuchiwać. Zajęty lub błąd bindu = PreviewError. */
export async function assertPortFree(port, host = '127.0.0.1') {
  await new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', (e) =>
      reject(new PreviewError(`port ${port} zajęty lub niedostępny (${e.code || e.message})`)),
    );
    probe.listen({ port, host, exclusive: true }, () => probe.close(() => resolve()));
  });
}

/** Liczba niezombie procesów w grupie (Linux, /proc); null = nieznana (inna platforma). */
function liveGroupMembers(pgid) {
  if (process.platform !== 'linux') return null;
  let n = 0;
  for (const pid of fs.readdirSync('/proc').filter((d) => /^\d+$/.test(d))) {
    try {
      const stat = fs.readFileSync(`/proc/${pid}/stat`, 'utf8');
      const f = stat.slice(stat.lastIndexOf(')') + 2).split(' ');
      if (Number(f[2]) === pgid && f[0] !== 'Z') n += 1;
    } catch {
      /* proces zniknął */
    }
  }
  return n;
}

/** Grupa żyje = sygnał 0 dochodzi i (Linux) jest w niej proces inny niż zombie bez rodzica. */
const groupAlive = (pgid) => {
  try {
    process.kill(-pgid, 0);
  } catch (e) {
    return e.code === 'EPERM';
  }
  return liveGroupMembers(pgid) !== 0;
};

/** Zabija całą grupę: SIGTERM, po `timeoutMs` SIGKILL. Zwraca true, gdy grupa znikła. */
export async function killGroup(pgid, timeoutMs = 5000) {
  if (!pgid || !groupAlive(pgid)) return true;
  try {
    process.kill(-pgid, 'SIGTERM');
  } catch {
    /* grupa już znikła */
  }
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    if (!groupAlive(pgid)) return true;
    await sleep(50);
  }
  try {
    process.kill(-pgid, 'SIGKILL');
  } catch {
    /* znikła tuż przed SIGKILL */
  }
  for (let i = 0; i < 40 && groupAlive(pgid); i++) await sleep(50);
  return !groupAlive(pgid);
}

/** Wersja synchroniczna (hak `exit`): od razu SIGKILL grupy. */
function killGroupSync(pgid) {
  if (!pgid) return;
  try {
    process.kill(-pgid, 'SIGKILL');
  } catch {
    /* brak grupy */
  }
}

/**
 * Czy gniazdo nasłuchujące na `port` należy do procesu z grupy `pgid`?
 * true/false na Linuksie; null, gdy nie da się ustalić (inna platforma). Błąd odczytu = false.
 */
export function listenerBelongsToGroup(port, pgid) {
  if (process.platform !== 'linux') return null;
  try {
    const hex = port.toString(16).toUpperCase().padStart(4, '0');
    const inodes = new Set();
    for (const f of ['/proc/net/tcp', '/proc/net/tcp6']) {
      let txt = '';
      try {
        txt = fs.readFileSync(f, 'utf8');
      } catch {
        continue;
      }
      for (const line of txt.split('\n').slice(1)) {
        const c = line.trim().split(/\s+/);
        if (c.length > 9 && c[3] === '0A' && c[1].endsWith(`:${hex}`)) inodes.add(c[9]);
      }
    }
    if (inodes.size === 0) return false;
    for (const pid of fs.readdirSync('/proc').filter((d) => /^\d+$/.test(d))) {
      let pgrp;
      try {
        const stat = fs.readFileSync(`/proc/${pid}/stat`, 'utf8');
        pgrp = Number(stat.slice(stat.lastIndexOf(')') + 2).split(' ')[2]);
      } catch {
        continue;
      }
      if (pgrp !== pgid) continue;
      let fds = [];
      try {
        fds = fs.readdirSync(`/proc/${pid}/fd`);
      } catch {
        continue;
      }
      for (const fd of fds) {
        try {
          const l = fs.readlinkSync(`/proc/${pid}/fd/${fd}`);
          const m = /^socket:\[(\d+)\]$/.exec(l);
          if (m && inodes.has(m[1])) return true;
        } catch {
          /* fd zniknął */
        }
      }
    }
    return false;
  } catch {
    return false;
  }
}

const httpOk = (host, port, path) =>
  new Promise((resolve) => {
    const req = http.get({ host, port, path, timeout: 2000 }, (res) => {
      res.resume();
      resolve(res.statusCode !== undefined && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });

const live = new Set();
let hooksInstalled = false;
function installHooks() {
  if (hooksInstalled) return;
  hooksInstalled = true;
  process.on('exit', () => {
    for (const pgid of live) killGroupSync(pgid);
  });
  const onSignal = (sig, code) => () => {
    for (const pgid of live) killGroupSync(pgid);
    console.error(`przerwano (${sig}): grupa serwera zabita`);
    process.exit(code);
  };
  process.on('SIGINT', onSignal('SIGINT', 130));
  process.on('SIGTERM', onSignal('SIGTERM', 143));
  process.on('SIGHUP', onSignal('SIGHUP', 129));
  process.on('uncaughtException', (e) => {
    for (const pgid of live) killGroupSync(pgid);
    console.error('BLAD', e?.stack || e);
    process.exit(1);
  });
  process.on('unhandledRejection', (e) => {
    for (const pgid of live) killGroupSync(pgid);
    console.error('BLAD', e?.stack || e);
    process.exit(1);
  });
}

/**
 * Startuje własny serwer i czeka na gotowość. Zwraca { pid, port, url, stop }.
 * Opcje: port (wymagany), host, command/args (domyślnie `npx vite preview ... --strictPort`),
 * cwd, readyPath, readyTimeoutMs, killTimeoutMs, requireOwnListener (domyślnie true).
 */
export async function startPreview(opts) {
  const {
    port,
    host = '127.0.0.1',
    command = 'npx',
    args = ['vite', 'preview', '--port', String(port), '--strictPort', '--host', host],
    cwd,
    env,
    readyPath = '/',
    readyTimeoutMs = 60000,
    killTimeoutMs = 5000,
    requireOwnListener = true,
  } = opts || {};
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new PreviewError(`niepoprawny port: "${String(port)}"`);

  await assertPortFree(port, host);

  installHooks();
  const child = spawn(command, args, { stdio: 'ignore', detached: true, cwd, env });
  const pgid = child.pid;
  let exited = null;
  let spawnError = null;
  child.on('exit', (code, signal) => {
    exited = { code, signal };
  });
  child.on('error', (e) => {
    spawnError = e;
  });
  if (!pgid) {
    await sleep(0);
    throw new PreviewError(`nie udało się uruchomić serwera (${spawnError?.code || 'brak pid'})`);
  }
  live.add(pgid);
  const stop = async () => {
    const gone = await killGroup(pgid, killTimeoutMs);
    live.delete(pgid);
    if (!gone) throw new PreviewError(`grupa serwera ${pgid} nie zniknęła po SIGKILL`);
  };

  const fail = async (msg) => {
    await stop().catch(() => {});
    throw new PreviewError(msg);
  };

  const t0 = Date.now();
  let okStreak = 0;
  while (Date.now() - t0 < readyTimeoutMs) {
    if (spawnError) await fail(`serwer nie wystartował (${spawnError.code || spawnError.message})`);
    if (exited)
      await fail(
        `serwer zakończył się podczas startu (kod ${exited.code}, sygnał ${exited.signal}); port zajęty albo błąd startu`,
      );
    if (await httpOk(host, port, readyPath)) {
      // Odpowiedź musi pochodzić od NASZEGO procesu: nadal żyje i to jego grupa trzyma gniazdo.
      if (exited) await fail('serwer zakończył się tuż przed gotowością; odpowiedź od obcego procesu');
      if (requireOwnListener && listenerBelongsToGroup(port, pgid) === false)
        okStreak = 0;
      else okStreak += 1;
      if (okStreak >= 2) {
        return { pid: pgid, port, host, url: `http://${host}:${port}`, stop };
      }
    } else okStreak = 0;
    await sleep(250);
  }
  return fail(
    `serwer nie jest gotowy po ${readyTimeoutMs} ms (brak odpowiedzi lub port trzyma obcy proces)`,
  );
}

/** Pomocnik dla sond: port z argumentu albo koniec z kodem 2 i jedną linią powodu. */
export function portOrExit(raw, fallback) {
  try {
    return parsePort(raw, fallback);
  } catch (e) {
    console.error(`SONDA NIE URUCHOMIONA: ${e.message}`);
    process.exit(2);
  }
}

/** Pomocnik dla sond: start serwera albo koniec z kodem 1 i jedną linią powodu (bez testowania). */
export async function startPreviewOrExit(opts) {
  try {
    return await startPreview(opts);
  } catch (e) {
    console.error(`SONDA NIE URUCHOMIONA: ${e.message}`);
    process.exit(1);
  }
}
