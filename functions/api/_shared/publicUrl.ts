// Allowlista adresów dla zapytań wychodzących do adresu podanego przez użytkownika (SSRF).
// MIX-1324: publiczny audyt pobierał dowolny URL i szedł za przekierowaniami bez ponownej
// kontroli. Teraz KAŻDY skok (adres wejściowy i każde przekierowanie) przechodzi:
//   1) kształt: tylko http/https, porty 80/443, bez danych logowania, bez nazw lokalnych;
//   2) adres IP: literał albo WSZYSTKIE adresy z DNS (A i AAAA) muszą być publiczne;
//   3) limit przekierowań (MAX_REDIRECTS).
// DNS rozwiązujemy przez DoH (JSON) — Workers nie mają resolvera. Awaria DNS = odmowa
// (fail-closed). Ryzyko szczątkowe: między naszym DNS a fetch() rekord może się zmienić
// (DNS rebinding); środowisko Workers i tak nie ma dostępu do sieci prywatnej operatora.
// Bez handlerów → nie tworzy trasy.

export const MAX_REDIRECTS = 3;
const ALLOWED_PORTS = new Set(['', '80', '443']);
const DOH_URL = 'https://cloudflare-dns.com/dns-query';
const DOH_TIMEOUT_MS = 3_000;
const BLOCKED_SUFFIXES = ['.localhost', '.local', '.internal', '.lan', '.home.arpa', '.intranet'];

export class UnsafeUrlError extends Error {
  constructor(public reason: string) {
    super(`niedozwolony adres: ${reason}`);
    this.name = 'UnsafeUrlError';
  }
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

// ---------- IPv4 ----------

function parseIPv4(s: string): number[] | null {
  const parts = s.split('.');
  if (parts.length !== 4) return null;
  const out: number[] = [];
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const n = Number(p);
    if (n > 255) return null;
    out.push(n);
  }
  return out;
}

function isPublicIPv4(o: number[]): boolean {
  const [a, b, c] = o;
  if (a === 0) return false; // 0.0.0.0/8 „ta sieć”
  if (a === 10) return false; // prywatna
  if (a === 100 && b >= 64 && b <= 127) return false; // CGNAT 100.64/10
  if (a === 127) return false; // pętla zwrotna
  if (a === 169 && b === 254) return false; // link-local, metadane chmury
  if (a === 172 && b >= 16 && b <= 31) return false; // prywatna
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return false; // IETF, TEST-NET-1
  if (a === 192 && b === 88 && c === 99) return false; // 6to4 relay
  if (a === 192 && b === 168) return false; // prywatna
  if (a === 198 && (b === 18 || b === 19)) return false; // testy wydajności
  if (a === 198 && b === 51 && c === 100) return false; // TEST-NET-2
  if (a === 203 && b === 0 && c === 113) return false; // TEST-NET-3
  if (a >= 224) return false; // multicast, zarezerwowane, broadcast
  return true;
}

// ---------- IPv6 ----------

/** 8 hekstetów (liczby 0–65535) albo null. Obsługuje „::” i końcówkę IPv4. */
export function parseIPv6(input: string): number[] | null {
  let s = input.trim().toLowerCase();
  if (s.startsWith('[') && s.endsWith(']')) s = s.slice(1, -1);
  const zone = s.indexOf('%');
  if (zone >= 0) s = s.slice(0, zone);
  if (!s.includes(':')) return null;
  // Końcówka IPv4 (np. ::ffff:127.0.0.1) → dwa hekstety.
  const lastColon = s.lastIndexOf(':');
  const tail = s.slice(lastColon + 1);
  if (tail.includes('.')) {
    const v4 = parseIPv4(tail);
    if (!v4) return null;
    s =
      s.slice(0, lastColon + 1) +
      ((v4[0] << 8) | v4[1]).toString(16) +
      ':' +
      ((v4[2] << 8) | v4[3]).toString(16);
  }
  const halves = s.split('::');
  if (halves.length > 2) return null;
  const parse = (h: string) => (h === '' ? [] : h.split(':'));
  const head = parse(halves[0]);
  const rest = halves.length === 2 ? parse(halves[1]) : [];
  const fill = halves.length === 2 ? 8 - head.length - rest.length : 0;
  if (halves.length === 2 ? fill < 1 : head.length !== 8) return null;
  const groups = [...head, ...Array(fill).fill('0'), ...rest];
  if (groups.length !== 8) return null;
  const out: number[] = [];
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    out.push(parseInt(g, 16));
  }
  return out;
}

function isPublicIPv6(h: number[]): boolean {
  // Adres z osadzonym IPv4 (zmapowany ::ffff:0:0/96, NAT64 64:ff9b::/96, przestarzały ::/96)
  // → decyduje IPv4.
  const embedded = [h[6] >> 8, h[6] & 255, h[7] >> 8, h[7] & 255];
  if (h.slice(0, 5).every((x) => x === 0) && (h[5] === 0xffff || h[5] === 0)) {
    if (h[5] === 0 && h[6] === 0 && h[7] <= 1) return false; // :: i ::1
    return isPublicIPv4(embedded);
  }
  if (h[0] === 0x64 && h[1] === 0xff9b) return isPublicIPv4(embedded);
  // Tylko globalny unicast 2000::/3, bez zakresów specjalnych w jego wnętrzu.
  if ((h[0] & 0xe000) !== 0x2000) return false; // fc00::/7, fe80::/10, ff00::/8, ::/8 itd.
  if (h[0] === 0x2001 && h[1] === 0x0db8) return false; // dokumentacja
  if (h[0] === 0x2001 && h[1] < 0x0200) return false; // 2001::/23 (Teredo, ORCHID, IETF)
  if (h[0] === 0x2002) return false; // 6to4 (osadzony IPv4 dowolny)
  return true;
}

/** true, gdy napis to adres IP (v4 albo v6, też w nawiasach) z przestrzeni publicznej. */
export function isPublicIp(ip: string): boolean {
  const v4 = parseIPv4(ip.trim());
  if (v4) return isPublicIPv4(v4);
  const v6 = parseIPv6(ip);
  if (v6) return isPublicIPv6(v6);
  return false; // nie-IP traktujemy jak niedozwolone
}

/** Adres IP klienta przycięty do klucza limitu: IPv4 bez zmian, IPv6 → prefiks /64. */
export function ipLimitKey(ip: string): string {
  const v6 = ip.includes(':') ? parseIPv6(ip) : null;
  if (v6) {
    return (
      v6
        .slice(0, 4)
        .map((x) => x.toString(16))
        .join(':') + '::/64'
    );
  }
  return ip.trim() || 'brak-ip';
}

// ---------- URL ----------

/**
 * Kontrola kształtu (bez sieci). Zwraca URL albo rzuca UnsafeUrlError.
 * Literał IP (też 0x7f000001, 2130706433 — parser URL normalizuje je do 127.0.0.1)
 * sprawdzany od razu.
 */
export function assertUrlShape(raw: string): URL {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new UnsafeUrlError('niepoprawny URL');
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new UnsafeUrlError('schemat');
  if (u.username || u.password) throw new UnsafeUrlError('dane logowania w adresie');
  if (!ALLOWED_PORTS.has(u.port)) throw new UnsafeUrlError(`port ${u.port}`);
  const host = u.hostname.toLowerCase().replace(/\.$/, '');
  if (!host) throw new UnsafeUrlError('brak hosta');
  if (host.startsWith('[') || parseIPv4(host)) {
    if (!isPublicIp(host)) throw new UnsafeUrlError('adres prywatny/zarezerwowany');
    return u;
  }
  // „localhost” (bez kropki) odrzuca reguła niżej; tu sufiksy sieci lokalnych.
  if (BLOCKED_SUFFIXES.some((s) => host.endsWith(s))) {
    throw new UnsafeUrlError('nazwa lokalna');
  }
  if (!host.includes('.')) throw new UnsafeUrlError('nazwa bez domeny');
  return u;
}

async function dohQuery(name: string, type: 'A' | 'AAAA', f: FetchLike): Promise<string[]> {
  const res = await f(`${DOH_URL}?name=${encodeURIComponent(name)}&type=${type}`, {
    headers: { accept: 'application/dns-json' },
    signal: AbortSignal.timeout(DOH_TIMEOUT_MS),
  });
  if (!res.ok) throw new UnsafeUrlError(`DNS HTTP ${res.status}`);
  const data = (await res.json()) as {
    Status?: number;
    Answer?: Array<{ type: number; data: string }>;
  };
  // 0 = NOERROR, 3 = NXDOMAIN (brak rekordów to nie awaria); reszta = awaria → odmowa.
  if (data.Status !== 0 && data.Status !== 3) throw new UnsafeUrlError(`DNS status ${data.Status}`);
  const want = type === 'A' ? 1 : 28;
  return (data.Answer ?? []).filter((a) => a.type === want).map((a) => String(a.data));
}

/** Rozwiązuje host i wymaga, by KAŻDY adres był publiczny. Brak adresu/awaria DNS = odmowa. */
export async function assertPublicHost(host: string, f: FetchLike = fetch): Promise<string[]> {
  let addrs: string[];
  try {
    const [a, aaaa] = await Promise.all([dohQuery(host, 'A', f), dohQuery(host, 'AAAA', f)]);
    addrs = [...a, ...aaaa];
  } catch (e) {
    if (e instanceof UnsafeUrlError) throw e;
    throw new UnsafeUrlError('DNS niedostępny');
  }
  if (addrs.length === 0) throw new UnsafeUrlError('host bez adresu');
  const bad = addrs.find((ip) => !isPublicIp(ip));
  if (bad) throw new UnsafeUrlError(`DNS wskazuje adres prywatny/zarezerwowany (${bad})`);
  return addrs;
}

/** Pełna kontrola jednego adresu: kształt + (dla nazw) DNS. */
export async function assertPublicUrl(raw: string, f: FetchLike = fetch): Promise<URL> {
  const u = assertUrlShape(raw);
  const host = u.hostname.toLowerCase().replace(/\.$/, '');
  if (!host.startsWith('[') && !parseIPv4(host)) await assertPublicHost(host, f);
  return u;
}

/**
 * fetch() do adresu użytkownika: przekierowania obsługujemy ręcznie i każdy skok
 * przechodzi assertPublicUrl. Ponad MAX_REDIRECTS = UnsafeUrlError.
 */
export async function safePublicFetch(
  raw: string,
  init: RequestInit = {},
  f: FetchLike = fetch,
): Promise<Response> {
  let current = raw;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(current, f);
    const res = await f(current, { ...init, redirect: 'manual' });
    const loc = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && loc) {
      try {
        current = new URL(loc, current).toString();
      } catch {
        throw new UnsafeUrlError('niepoprawne przekierowanie');
      }
      continue;
    }
    return res;
  }
  throw new UnsafeUrlError(`więcej niż ${MAX_REDIRECTS} przekierowania`);
}
