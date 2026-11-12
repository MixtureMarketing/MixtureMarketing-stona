import { describe, it, expect, vi } from 'vitest';
import {
  assertPublicUrl,
  assertUrlShape,
  checkedHostname,
  ipLimitKey,
  isPublicIp,
  parseIPv6,
  safePublicFetch,
  UnsafeUrlError,
} from './publicUrl';

describe('isPublicIp', () => {
  it.each([
    '0.0.0.0',
    '10.1.2.3',
    '100.64.0.1',
    '127.0.0.1',
    '169.254.169.254',
    '172.16.0.1',
    '172.31.255.255',
    '192.0.0.8',
    '192.0.2.1',
    '192.168.0.1',
    '198.18.0.1',
    '198.51.100.1',
    '203.0.113.1',
    '224.0.0.1',
    '255.255.255.255',
    '::',
    '::1',
    '[::1]',
    '::ffff:127.0.0.1',
    '::ffff:7f00:1',
    '::ffff:10.0.0.1',
    '64:ff9b::a00:1',
    'fc00::1',
    'fd12:3456::1',
    'fe80::1',
    'fe80::1%eth0',
    'ff02::1',
    '2001:db8::1',
    '2001::1',
    '2002:7f00:1::1',
    'nie-ip',
    '1.2.3',
    '1.2.3.256',
  ])('niepubliczny/niepoprawny: %s', (ip) => {
    expect(isPublicIp(ip)).toBe(false);
  });

  it.each([
    '1.1.1.1',
    '93.184.216.34',
    '172.15.255.255',
    '172.32.0.1',
    '100.63.255.255',
    '100.128.0.1',
    '169.255.0.1',
    '192.169.0.1',
    '223.255.255.255',
    '2606:4700::1111',
    '[2a00:1450:4001::200e]',
    '::ffff:93.184.216.34',
    '64:ff9b::5db8:d822',
  ])('publiczny: %s', (ip) => {
    expect(isPublicIp(ip)).toBe(true);
  });
});

describe('parseIPv6 / ipLimitKey', () => {
  it('rozwija skróty i końcówkę IPv4', () => {
    expect(parseIPv6('::1')).toEqual([0, 0, 0, 0, 0, 0, 0, 1]);
    expect(parseIPv6('::ffff:1.2.3.4')).toEqual([0, 0, 0, 0, 0, 0xffff, 0x102, 0x304]);
    expect(parseIPv6('1:2:3:4:5:6:7:8')).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(parseIPv6('1::2::3')).toBeNull();
    expect(parseIPv6('1:2:3:4:5:6:7:8:9')).toBeNull();
    expect(parseIPv6('1:2:3:4:5:6:7')).toBeNull();
    expect(parseIPv6('12345::1')).toBeNull();
  });
  it('IPv6 → /64, IPv4 bez zmian, pusty → stały klucz', () => {
    expect(ipLimitKey('2a01:db9:1:2::5')).toBe('2a01:db9:1:2::/64');
    expect(ipLimitKey('2a01:0db9:0001:0002:ffff:1:2:3')).toBe('2a01:db9:1:2::/64');
    expect(ipLimitKey('1.2.3.4')).toBe('1.2.3.4');
    expect(ipLimitKey('')).toBe('brak-ip');
  });
});

describe('assertUrlShape', () => {
  it.each([
    'ftp://firma.pl/',
    'https://u:p@firma.pl/',
    'http://firma.pl:22/',
    'http://localhost/',
    'http://intranet/',
    'http://serwer.local/',
    'http://db.internal/',
    'http://127.1/',
    'http://[fd00::1]/',
  ])('odrzuca %s', (u) => {
    expect(() => assertUrlShape(u)).toThrow(UnsafeUrlError);
  });
  it.each(['https://firma.pl/', 'http://firma.pl:80/x', 'https://firma.pl.:443/'])(
    'przepuszcza %s',
    (u) => {
      expect(assertUrlShape(u).hostname).toMatch(/firma\.pl/);
    },
  );
});

function dohFetch(map: Record<string, string[]>, status = 0) {
  return vi.fn(async (url: string) => {
    const u = new URL(url);
    if (u.hostname !== 'cloudflare-dns.com') return new Response('ok');
    const name = u.searchParams.get('name') ?? '';
    const t = u.searchParams.get('type') === 'A' ? 1 : 28;
    const answer = (map[name] ?? [])
      .filter((a) => (t === 28) === a.includes(':'))
      .map((data) => ({ type: t, data }));
    return new Response(JSON.stringify({ Status: status, Answer: answer }));
  });
}

describe('assertPublicUrl (DNS)', () => {
  it('host bez adresu → odmowa; publiczny → OK', async () => {
    const f = dohFetch({ 'a.pl': ['1.1.1.1'] });
    await expect(assertPublicUrl('https://brak.pl/', f)).rejects.toThrow(/bez adresu/);
    await expect(assertPublicUrl('https://a.pl/', f)).resolves.toBeInstanceOf(URL);
  });
  it('status DNS SERVFAIL → odmowa', async () => {
    const f = dohFetch({ 'a.pl': ['1.1.1.1'] }, 2);
    await expect(assertPublicUrl('https://a.pl/', f)).rejects.toThrow(UnsafeUrlError);
  });
  it('wyjątek sieci przy DNS → odmowa jako UnsafeUrlError', async () => {
    const f = vi.fn(async () => {
      throw new TypeError('network');
    });
    await expect(assertPublicUrl('https://a.pl/', f)).rejects.toThrow(/DNS niedostępny/);
  });
  it('literał IP nie odpytuje DNS', async () => {
    const f = dohFetch({});
    await assertPublicUrl('http://1.1.1.1/', f);
    expect(f).not.toHaveBeenCalled();
  });
});

describe('safePublicFetch', () => {
  it('3xx bez Location → zwraca odpowiedź; zawsze redirect=manual', async () => {
    const f = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes('cloudflare-dns.com')) {
        return new Response(JSON.stringify({ Status: 0, Answer: [{ type: 1, data: '1.1.1.1' }] }));
      }
      expect(init?.redirect).toBe('manual');
      return new Response(null, { status: 304 });
    });
    const res = await safePublicFetch('https://a.pl/', {}, f);
    expect(res.status).toBe(304);
  });
});

// ---------- MIX-1395: uwagi 1–4 werdyktu MIX-1324 (formy ataku z bliźniakami) ----------

/** Odmowa UnsafeUrlError z dokładnym powodem (nie wystarczy „rzuca cokolwiek”). */
function reasonOf(fn: () => unknown): string {
  try {
    fn();
  } catch (e) {
    if (e instanceof UnsafeUrlError) return e.reason;
    return `inny wyjątek: ${String(e)}`;
  }
  return 'przepuszczony';
}

describe('MIX-1395 (a) allowlista kształtu nazwy hosta przed DNS', () => {
  it.each([
    ['F1', 'http://localhost../', 'pusta etykieta w nazwie hosta'],
    ['F2', 'http://a..b.pl/', 'pusta etykieta w nazwie hosta'],
    ['F3', 'http://.example.com/', 'pusta etykieta w nazwie hosta'],
    ['F4', 'http://example.com../', 'pusta etykieta w nazwie hosta'],
    ['F4b', 'http://a.b.pl.../', 'pusta etykieta w nazwie hosta'],
    ['F11a', 'http://../', 'pusta etykieta w nazwie hosta'],
    ['F11b', 'http://./', 'brak hosta'],
    ['F11c', '', 'niepoprawny URL'],
    ['F11d', '   ', 'niepoprawny URL'],
    ['F11e', 'http:// /', 'niepoprawny URL'],
    ['F16a', 'http://a。。b.pl/', 'pusta etykieta w nazwie hosta'],
    ['F16b', 'http://a%2e%2eb.pl/', 'pusta etykieta w nazwie hosta'],
    ['F16c', 'http://ｌｏｃａｌｈｏｓｔ../', 'pusta etykieta w nazwie hosta'],
    ['F15a', 'http://a!b.pl/', 'niedozwolony znak w nazwie hosta'],
    ['F15b', 'http://a*b.pl/', 'niedozwolony znak w nazwie hosta'],
    ['F15c', 'http://a"b.pl/', 'niedozwolony znak w nazwie hosta'],
    ['F15d', 'http://a$b.pl/', 'niedozwolony znak w nazwie hosta'],
    ['F15e', 'http://a(b).pl/', 'niedozwolony znak w nazwie hosta'],
    ['F15f', 'http://a~b.pl/', 'niedozwolony znak w nazwie hosta'],
  ])('%s odrzuca %j: %s', (_id, url, reason) => {
    expect(reasonOf(() => assertUrlShape(url))).toBe(reason);
  });

  it.each([
    ['F1/F4 bliźniak', 'http://example.com./', 'example.com.'],
    ['F2 bliźniak', 'http://a.b.pl/', 'a.b.pl'],
    ['F3 bliźniak', 'http://example.com/', 'example.com'],
    ['F12', 'http://EXAMPLE.COM./', 'example.com.'],
    ['F15 bliźniak', 'http://a_b-c.pl/', 'a_b-c.pl'],
    ['F16 bliźniak (IDN)', 'http://zażółć.pl/', 'xn--za-6ja4f8n1l.pl'],
    ['F16 bliźniak (kropka ideograficzna)', 'http://example。com/', 'example.com'],
  ])('%s przepuszcza %j', (_id, url, hostname) => {
    expect(assertUrlShape(url).hostname).toBe(hostname);
  });

  it('F1 odmowa zapada przed DNS; bliźniak z jedną kropką końcową idzie do DNS bez kropki', async () => {
    const f = dohFetch({ 'example.com': ['93.184.216.34'] });
    await expect(assertPublicUrl('http://localhost../', f)).rejects.toThrow(
      /pusta etykieta w nazwie hosta/,
    );
    await expect(assertPublicUrl('http://example.com../', f)).rejects.toThrow(
      /pusta etykieta w nazwie hosta/,
    );
    expect(f).not.toHaveBeenCalled();
    await expect(assertPublicUrl('http://EXAMPLE.COM./', f)).resolves.toBeInstanceOf(URL);
    const names = f.mock.calls.map(([u]) => new URL(u).searchParams.get('name'));
    expect(names).toEqual(['example.com', 'example.com']);
  });

  it('wA: kropka końcowa zdejmowana przed listą nazw lokalnych (localhost., serwer.local.)', () => {
    expect(reasonOf(() => assertUrlShape('http://localhost./'))).toBe('nazwa bez domeny');
    expect(reasonOf(() => assertUrlShape('http://serwer.local./'))).toBe('nazwa lokalna');
    expect(reasonOf(() => assertUrlShape('http://db.internal./'))).toBe('nazwa lokalna');
    expect(assertUrlShape('http://serwer.pl./').hostname).toBe('serwer.pl.');
  });

  it('checkedHostname: puste, białe znaki, długości, znak Kelvina; bliźniaki na granicy', () => {
    expect(reasonOf(() => checkedHostname(''))).toBe('brak hosta');
    expect(reasonOf(() => checkedHostname('.'))).toBe('brak hosta');
    expect(reasonOf(() => checkedHostname(' '))).toBe('brak hosta');
    expect(reasonOf(() => checkedHostname(' a.pl'))).toBe('niedozwolony znak w nazwie hosta');
    expect(reasonOf(() => checkedHostname('Ka.pl'))).toBe('niedozwolony znak w nazwie hosta');
    expect(reasonOf(() => checkedHostname('еxample.com'))).toBe('niedozwolony znak w nazwie hosta');
    expect(reasonOf(() => checkedHostname(`${'a'.repeat(64)}.pl`))).toBe(
      'etykieta dłuższa niż 63 znaki',
    );
    expect(checkedHostname(`${'a'.repeat(63)}.pl`)).toBe(`${'a'.repeat(63)}.pl`);
    const name253 = `${'a'.repeat(63)}.${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(61)}`;
    expect(name253).toHaveLength(253);
    expect(checkedHostname(name253)).toBe(name253);
    expect(checkedHostname(`${name253}.`)).toBe(name253);
    expect(reasonOf(() => checkedHostname(`${name253}d`))).toBe('nazwa hosta za długa');
    expect(checkedHostname('Firma.PL.')).toBe('firma.pl');
    expect(checkedHostname('[::1]')).toBe('[::1]');
  });

  it('0 zmian dla zwykłych nazw: hosty z istniejących testów przechodzą jak dotąd', () => {
    const plain = [
      'firma.pl',
      'a.pl',
      'inna.pl',
      'pierwszy.pl',
      'drugi.pl',
      'trzeci.pl',
      'h99.pl',
      'g.pl',
      'brak.pl',
      'zly.example.com',
      'wew.example.com',
      'v6.example.com',
      'dobry.example.com',
      'cloudflare-dns.com',
      'example.com',
      'www.mixturemarketing.pl',
    ];
    for (const h of plain) {
      expect(assertUrlShape(`https://${h}/`).hostname).toBe(h);
      expect(assertUrlShape(`https://${h}./`).hostname).toBe(`${h}.`);
    }
    // Dotychczasowe odmowy z tym samym powodem co przed MIX-1395.
    expect(reasonOf(() => assertUrlShape('https://x/'))).toBe('nazwa bez domeny');
    expect(reasonOf(() => assertUrlShape('http://localhost/'))).toBe('nazwa bez domeny');
    expect(reasonOf(() => assertUrlShape('http://serwer.local/'))).toBe('nazwa lokalna');
    expect(reasonOf(() => assertUrlShape('http://127.1/'))).toBe('adres prywatny/zarezerwowany');
    expect(reasonOf(() => assertUrlShape('http://firma.pl:22/'))).toBe('port 22');
  });

  it('F13: przekierowanie na localhost.. → odmowa na tym skoku, cel niepobrany; bliźniak: 302 na b.pl.', async () => {
    const fetched: string[] = [];
    const f = vi.fn(async (url: string) => {
      const u = new URL(url);
      if (u.hostname === 'cloudflare-dns.com') {
        const t = u.searchParams.get('type') === 'A' ? 1 : 28;
        const answer = t === 1 ? [{ type: 1, data: '1.1.1.1' }] : [];
        return new Response(JSON.stringify({ Status: 0, Answer: answer }));
      }
      fetched.push(url);
      if (u.hostname === 'a.pl') {
        return new Response(null, { status: 302, headers: { location: 'http://localhost../x' } });
      }
      if (u.hostname === 'c.pl') {
        return new Response(null, { status: 302, headers: { location: 'https://b.pl./y' } });
      }
      return new Response('ok');
    });
    await expect(safePublicFetch('https://a.pl/', {}, f)).rejects.toThrow(
      /pusta etykieta w nazwie hosta/,
    );
    expect(fetched).toEqual(['https://a.pl/']);
    fetched.length = 0;
    const res = await safePublicFetch('https://c.pl/', {}, f);
    expect(res.status).toBe(200);
    expect(fetched).toEqual(['https://c.pl/', 'https://b.pl./y']);
  });
});

describe('MIX-1395 (c) 3fff::/20 (dokumentacja, RFC 9637) niepubliczny', () => {
  it.each(['3fff::', '3fff::1', '3fff:0:0:0:0:0:0:1', '3fff:0fff:ffff::1', '[3fff:abc::1]'])(
    'F7/F8 niepubliczny: %s',
    (ip) => {
      expect(isPublicIp(ip)).toBe(false);
    },
  );
  it.each(['2a00:1450::1', '3fff:1000::1', '3ffe:ffff::1', '3fff:ffff::1'])(
    'F7/F8 bliźniak publiczny: %s',
    (ip) => {
      expect(isPublicIp(ip)).toBe(true);
    },
  );
  it('F7 URL z literałem 3fff::1 → odmowa; bliźniak 2a00:1450::1 → OK', () => {
    expect(reasonOf(() => assertUrlShape('http://[3fff::1]/'))).toBe(
      'adres prywatny/zarezerwowany',
    );
    expect(assertUrlShape('http://[2a00:1450::1]/').hostname).toBe('[2a00:1450::1]');
  });
});

describe('MIX-1395 IPv4 zmapowany w adresie URL (formy 5, 6)', () => {
  it.each([
    ['F5', 'http://[::ffff:127.0.0.1]/'],
    ['F6', 'http://[::ffff:7f00:1]/'],
    ['F6b', 'http://[::FFFF:7F00:1]/'],
    ['F6c', 'http://[0:0:0:0:0:ffff:a9fe:a9fe]/'],
  ])('%s odrzuca %s', (_id, url) => {
    expect(reasonOf(() => assertUrlShape(url))).toBe('adres prywatny/zarezerwowany');
  });
  it.each(['http://[::ffff:93.184.216.34]/', 'http://[::ffff:808:808]/'])(
    'bliźniak publiczny: %s',
    (url) => {
      expect(assertUrlShape(url)).toBeInstanceOf(URL);
    },
  );
});

describe('MIX-1395 (b) ipLimitKey: IPv4 zmapowany = klucz IPv4', () => {
  it('F9: ::ffff:1.2.3.4 i ::ffff:102:304 dają klucz 1.2.3.4; ::ffff:1.2.3.5 inny', () => {
    expect(ipLimitKey('::ffff:1.2.3.4')).toBe('1.2.3.4');
    expect(ipLimitKey('::ffff:102:304')).toBe('1.2.3.4');
    expect(ipLimitKey('::FFFF:1.2.3.4')).toBe('1.2.3.4');
    expect(ipLimitKey('0:0:0:0:0:ffff:0102:0304')).toBe('1.2.3.4');
    expect(ipLimitKey('[::ffff:1.2.3.4]')).toBe('1.2.3.4');
    expect(ipLimitKey('::ffff:1.2.3.4')).toBe(ipLimitKey('1.2.3.4'));
    expect(ipLimitKey('::ffff:1.2.3.4')).not.toBe(ipLimitKey('::ffff:1.2.3.5'));
    expect(ipLimitKey('::ffff:7f00:1')).toBe('127.0.0.1');
  });
  it('F10: dwa różne zmapowane IPv4 nie dzielą klucza (dawniej oba 0:0:0:0::/64)', () => {
    expect(ipLimitKey('::ffff:1.2.3.4')).not.toBe(ipLimitKey('::ffff:5.6.7.8'));
    expect(ipLimitKey('::ffff:5.6.7.8')).toBe('5.6.7.8');
  });
  it('F18: tylko ::ffff:0:0/96 jest zmapowany; reszta IPv6 → /64 jak dotąd', () => {
    expect(ipLimitKey('2a01::ffff:102:304')).toBe('2a01:0:0:0::/64');
    expect(ipLimitKey('0:0:0:0:1:ffff:102:304')).toBe('0:0:0:0::/64');
    expect(ipLimitKey('::1.2.3.4')).toBe('0:0:0:0::/64');
    expect(ipLimitKey('64:ff9b::102:304')).toBe('64:ff9b:0:0::/64');
    expect(ipLimitKey('2a01:db9:1:2::5')).toBe('2a01:db9:1:2::/64');
  });
  it('F11/F16/F18: puste, białe znaki, nie-IP, cyfry spoza ASCII → wspólny klucz brak-ip', () => {
    for (const bad of [
      '',
      '   ',
      'nie-ip',
      '1.2.3',
      '1.2.3.256',
      '::ffff:1.2.3.256',
      '１.２.３.４',
      '١.٢.٣.٤',
      '1:2:3',
      'x'.repeat(600),
    ]) {
      expect(ipLimitKey(bad)).toBe('brak-ip');
    }
    expect(ipLimitKey(' 1.2.3.4 ')).toBe('1.2.3.4');
    expect(ipLimitKey('01.2.3.4')).toBe('1.2.3.4');
  });
});
