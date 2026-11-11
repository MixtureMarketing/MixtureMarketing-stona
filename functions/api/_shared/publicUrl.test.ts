import { describe, it, expect, vi } from 'vitest';
import {
  assertPublicUrl,
  assertUrlShape,
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
