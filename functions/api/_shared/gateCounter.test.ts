// MIX-1382: licznik D1 na prawdziwym SQLite (node:sqlite) z tym samym tekstem SQL i migracją 0010.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  bumpCounter,
  COUNTER_SQL,
  CounterError,
  edgeIpKey,
  hmacHex,
  hmacSecret,
  issuePreviewToken,
  normalizeEmail,
  parseLimitEnv,
  purgeCounters,
  RETENTION_SEC,
  tokenMatchesIp,
  type CounterDb,
} from './gateCounter';
import { sha256Hex } from './security';

// node:sqlite istnieje tylko z prefiksem i bundler środowiska jsdom go nie zna: ładowanie w biegu.
const { DatabaseSync } = process.getBuiltinModule('node:sqlite') as typeof import('node:sqlite');
type DatabaseSync = InstanceType<typeof DatabaseSync>;
// Ścieżka względna do katalogu repo (vitest startuje w katalogu głównym).
const MIG = readFileSync('migrations/0010_rate_counters.sql', 'utf8');

function sqliteD1() {
  const db = new DatabaseSync(':memory:');
  db.exec(MIG);
  const d1: CounterDb = {
    prepare(sql: string) {
      const st = db.prepare(sql);
      return {
        bind: (...v: unknown[]) => ({
          first: async <T>() => ((st.get(...(v as never[])) as T) ?? null) as T | null,
          run: async () => st.run(...(v as never[])),
        }),
      };
    },
  };
  return { db, d1 };
}

const H = 3600;
const T0 = Date.UTC(2026, 10, 12, 10, 0, 0); // 10:00:00 UTC
const rows = (db: DatabaseSync) =>
  db.prepare('SELECT k, n, win, exp FROM rate_counters ORDER BY k').all() as Array<{
    k: string;
    n: number;
    win: number;
    exp: number;
  }>;

describe('bumpCounter (SQL na SQLite)', () => {
  it('liczy po kolei, exp = start okna + 48 h', async () => {
    const { db, d1 } = sqliteD1();
    expect((await bumpCounter(d1, 'a', H, T0)).n).toBe(1);
    expect((await bumpCounter(d1, 'a', H, T0 + 1000)).n).toBe(2);
    const r = rows(db)[0];
    expect(r.win).toBe(T0 / 1000);
    expect(r.exp).toBe(T0 / 1000 + RETENTION_SEC);
  });

  it('Z1-W1 okno: 10:59:59 liczy dalej, 11:00:00 zeruje; cofnięty zegar nie zeruje', async () => {
    const { d1 } = sqliteD1();
    for (let i = 0; i < 5; i++) await bumpCounter(d1, 'a', H, T0 + i * 1000);
    const late = await bumpCounter(d1, 'a', H, T0 + H * 1000 - 1000);
    expect(late.n).toBe(6);
    expect(late.retryAfter).toBe(1);
    expect((await bumpCounter(d1, 'a', H, T0 + H * 1000)).n).toBe(1); // bliźniak: nowe okno
    // izolat z zegarem cofniętym o godzinę: wiersz zostaje w nowszym oknie i liczy dalej
    const back = await bumpCounter(d1, 'a', H, T0 + 1000);
    expect(back.n).toBe(2);
    expect(back.win).toBe(T0 / 1000 + H);
  });

  it('wiersz z przyszłości (> 1 okno) jest zerowany do bieżącego okna; 1 okno w przód liczy dalej', async () => {
    const { db, d1 } = sqliteD1();
    const now = T0 / 1000;
    db.prepare('INSERT INTO rate_counters VALUES (?,?,?,?)').run(
      'fut',
      999,
      now + 10 * 86400,
      now + 12 * 86400,
    );
    db.prepare('INSERT INTO rate_counters VALUES (?,?,?,?)').run(
      'next',
      3,
      now + H,
      now + H + RETENTION_SEC,
    );
    const fut = await bumpCounter(d1, 'fut', H, T0);
    expect(fut).toMatchObject({ n: 1, win: now });
    expect(rows(db).find((r) => r.k === 'fut')?.exp).toBe(now + RETENTION_SEC);
    expect((await bumpCounter(d1, 'next', H, T0)).n).toBe(4);
  });

  it('Z1-A5 wiersz n = -1 → uszkodzony; wyjątek → błąd; zły kształt → uszkodzony', async () => {
    const { db, d1 } = sqliteD1();
    db.prepare('INSERT INTO rate_counters VALUES (?,?,?,?)').run(
      'neg',
      -1,
      T0 / 1000,
      T0 / 1000 + 10,
    );
    await expect(bumpCounter(d1, 'neg', H, T0)).rejects.toMatchObject({ code: 'uszkodzony' });
    const throwing: CounterDb = {
      prepare: () => {
        throw new Error('D1_ERROR');
      },
    };
    await expect(bumpCounter(throwing, 'a', H, T0)).rejects.toMatchObject({ code: 'błąd' });
    const shaped = (row: unknown): CounterDb => ({
      prepare: () => ({ bind: () => ({ first: async <T>() => row as T, run: async () => ({}) }) }),
    });
    for (const bad of [
      null,
      { n: '1', win: T0 / 1000 },
      { n: 1.5, win: T0 / 1000 },
      { n: 1, win: 0 },
    ])
      await expect(bumpCounter(shaped(bad), 'a', H, T0)).rejects.toBeInstanceOf(CounterError);
    await expect(bumpCounter(shaped({ n: 1, win: T0 / 1000 }), 'a', H, T0)).resolves.toMatchObject({
      n: 1,
    });
  });

  it('Z1-T1 licznik milczy dłużej niż limit → timeout; szybki → wynik', async () => {
    const slow = (ms: number): CounterDb => ({
      prepare: () => ({
        bind: () => ({
          first: <T>() =>
            new Promise<T>((r) => setTimeout(() => r({ n: 1, win: T0 / 1000 } as T), ms)),
          run: async () => ({}),
        }),
      }),
    });
    await expect(bumpCounter(slow(200), 'a', H, T0, 30)).rejects.toMatchObject({ code: 'timeout' });
    await expect(bumpCounter(slow(1), 'a', H, T0, 30)).resolves.toMatchObject({ n: 1 });
  });

  it('SQL to jedna instrukcja upsert z RETURNING', () => {
    expect(COUNTER_SQL).toMatch(
      /^INSERT INTO rate_counters[\s\S]*ON CONFLICT\(k\) DO UPDATE[\s\S]*RETURNING n, win$/,
    );
  });
});

describe('retencja 48 h (warunek 1)', () => {
  it('wiersz starszy niż 48 h znika, świeży zostaje, wiersz z przyszłości znika', async () => {
    const { db, d1 } = sqliteD1();
    const now = T0 / 1000;
    const ins = db.prepare('INSERT INTO rate_counters VALUES (?,?,?,?)');
    ins.run('old', 3, now - RETENTION_SEC - H, now - H); // okno sprzed 49 h
    ins.run('fresh', 2, now - 47 * H, now - 47 * H + RETENTION_SEC); // okno sprzed 47 h
    ins.run('future', 1, now + 30 * 86400, now + 32 * 86400);
    await purgeCounters(d1, T0);
    expect(rows(db).map((r) => r.k)).toEqual(['fresh']);
  });
});

describe('edgeIpKey (V1, V2b)', () => {
  it.each([
    [null, 'ip: brak'],
    ['', 'ip: brak'],
    ['1.2.3.4, 5.6.7.8', 'ip: nieczytelny'],
    [' 1.2.3.4', 'ip: nieczytelny'],
    ['1.2.3.4 ', 'ip: nieczytelny'],
    ['01.2.3.4', 'ip: nieczytelny'],
    ['1.2.3', 'ip: nieczytelny'],
    ['256.1.1.1', 'ip: nieczytelny'],
    ['::ffff:01.2.3.4', 'ip: nieczytelny'],
    ['[2001:db8::1]', 'ip: nieczytelny'],
    ['fe80::1%eth0', 'ip: nieczytelny'],
    ['localhost', 'ip: nieczytelny'],
    ['240.1.2.3', 'ip: pseudo-ipv4'],
    ['255.255.255.255', 'ip: pseudo-ipv4'],
    ['::ffff:240.0.0.1', 'ip: pseudo-ipv4'],
  ])('%j → %s', (raw, reason) => {
    expect(edgeIpKey(raw)).toEqual({ ok: false, reason });
  });

  it('bliźniaki: 1.2.3.4 = ::ffff:1.2.3.4; 239.255.255.255 dozwolony; IPv6 → /64', () => {
    expect(edgeIpKey('1.2.3.4')).toEqual({ ok: true, key: 'v4:1.2.3.4' });
    expect(edgeIpKey('::ffff:1.2.3.4')).toEqual({ ok: true, key: 'v4:1.2.3.4' });
    expect(edgeIpKey('239.255.255.255')).toEqual({ ok: true, key: 'v4:239.255.255.255' });
    expect(edgeIpKey('0.0.0.0')).toEqual({ ok: true, key: 'v4:0.0.0.0' });
    const a = edgeIpKey('2001:db8:1:2::1');
    expect(a).toEqual({ ok: true, key: 'v6:2001:db8:1:2::/64' });
    expect(edgeIpKey('2001:DB8:1:2:ffff:1:2:6')).toEqual(a);
    expect(edgeIpKey('2001:db8:1:3::1')).toEqual({ ok: true, key: 'v6:2001:db8:1:3::/64' });
  });
});

describe('normalizeEmail (V3, V3b, warunek 3)', () => {
  it.each([
    ['Ofiara+1@Example.PL', 'ofiara@example.pl'],
    ['OFIARA@EXAMPLE.PL', 'ofiara@example.pl'],
    ['  ofiara@example.pl ', 'ofiara@example.pl'],
    ['o.f.i.a.r.a@googlemail.com', 'ofiara@gmail.com'],
    ['O.Fiara+promo@GMAIL.com', 'ofiara@gmail.com'],
    ['o.f.i.a.r.a@example.pl', 'o.f.i.a.r.a@example.pl'], // warunek 3: kropki zostają poza Gmail
    ['ofiara@xn--bcher-kva.example', 'ofiara@xn--bcher-kva.example'],
  ])('%j → %s', (raw, want) => {
    expect(normalizeEmail(raw)).toBe(want);
  });

  it('warunek 3: o.f.i.a.r.a@example.pl i ofiara@example.pl to różne klucze', () => {
    expect(normalizeEmail('o.f.i.a.r.a@example.pl')).not.toBe(normalizeEmail('ofiara@example.pl'));
    expect(normalizeEmail('o.f.i.a.r.a@gmail.com')).toBe(normalizeEmail('ofiara@gmail.com'));
  });

  it.each([
    ['cyrylickie а', 'оfiara@example.pl'],
    ['homoglif w części lokalnej (greckie ο)', 'ofiarο@example.pl'],
    ['pełna szerokość ＠', 'ofiara＠example.pl'],
    ['NBSP', 'ofi ara@example.pl'],
    ['cudzysłów', '"a"@x.pl'],
    ['nowa linia', 'a@x.pl\nBcc: b@y.pl'],
    ['256 znaków', `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(60)}.pl`],
    ['pusty po +tag', '+x@x.pl'],
    ['same kropki w Gmail', '...@gmail.com'],
    ['domena IDN wprost', 'a@bücher.de'],
    ['null', null],
    ['liczba', 42],
    ['pusty', ''],
  ])('%s → null', (_n, raw) => {
    expect(normalizeEmail(raw)).toBeNull();
  });
});

describe('parseLimitEnv (C1) i sekret HMAC', () => {
  it.each(['0', '00', 'abc', '٣', '99999', '', ' 5', '5.0', '-1'])('%j → null', (v) => {
    expect(parseLimitEnv(v, 3)).toBeNull();
  });
  it('brak zmiennej → domyślna; "5" → 5; "9999" → 9999', () => {
    expect(parseLimitEnv(undefined, 3)).toBe(3);
    expect(parseLimitEnv('5', 3)).toBe(5);
    expect(parseLimitEnv('9999', 3)).toBe(9999);
  });
  it('sekret: brak, pusty, 31 znaków → null; 32 znaki → przyjęty', () => {
    expect(hmacSecret(undefined)).toBeNull();
    expect(hmacSecret('')).toBeNull();
    expect(hmacSecret('x'.repeat(31))).toBeNull();
    expect(hmacSecret('x'.repeat(32))).toBe('x'.repeat(32));
  });
  it('HMAC zależy od sekretu i nie jest zwykłym SHA-256', async () => {
    const a = await hmacHex('a'.repeat(32), 'ip', 'v4:1.2.3.4');
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(await hmacHex('b'.repeat(32), 'ip', 'v4:1.2.3.4')).not.toBe(a);
    expect(await sha256Hex('v1|ip|v4:1.2.3.4')).not.toBe(a);
  });
});

describe('podgląd Z4: tempo tokenów i przypięcie do IP (V4, V5)', () => {
  const secret = 's'.repeat(40);
  it('Z4-V4 tempo tokenów: 10. → token, 11. → 429; bez Turnstile → 403', async () => {
    const { d1 } = sqliteD1();
    const ipKey = 'v4:1.2.3.4';
    for (let i = 0; i < 10; i++) {
      const r = await issuePreviewToken({ captchaOk: true, db: d1, secret, ipKey, nowMs: T0 });
      expect(r.ok).toBe(true);
    }
    expect(await issuePreviewToken({ captchaOk: true, db: d1, secret, ipKey, nowMs: T0 })).toEqual({
      ok: false,
      status: 429,
      reason: 'limit tokenów n=11/10',
    });
    expect(
      await issuePreviewToken({ captchaOk: false, db: d1, secret, ipKey: 'v4:5.6.7.8', nowMs: T0 }),
    ).toEqual({ ok: false, status: 403, reason: 'captcha' });
  });

  it('Z4-V5 token z innego /64 odrzucony, inny host w tym samym /64 przyjęty', async () => {
    const { d1 } = sqliteD1();
    const a = edgeIpKey('2001:db8:1:2::1');
    const same = edgeIpKey('2001:db8:1:2::99');
    const other = edgeIpKey('2001:db8:1:3::1');
    if (!a.ok || !same.ok || !other.ok) throw new Error('ip');
    const r = await issuePreviewToken({ captchaOk: true, db: d1, secret, ipKey: a.key, nowMs: T0 });
    if (!r.ok) throw new Error('token');
    expect(await tokenMatchesIp(r.tag, secret, other.key)).toBe(false);
    expect(await tokenMatchesIp(r.tag, secret, same.key)).toBe(true);
    expect(await tokenMatchesIp(r.tag.slice(1), secret, a.key)).toBe(false);
    expect(await tokenMatchesIp(undefined, secret, a.key)).toBe(false);
  });
});
