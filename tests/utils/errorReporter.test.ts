import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  reportError,
  installGlobalErrorHandlers,
  scrubPii,
  MAX_REPORTS_PER_SESSION,
  CLIENT_ERROR_ENDPOINT,
  __resetErrorReporterForTests,
} from '../../utils/errorReporter';

const beacon = vi.fn((_url: string, _data: Blob) => true);

async function lastPayload() {
  const blob = beacon.mock.calls.at(-1)![1];
  // jsdom: Blob bez .text() — czytamy przez FileReader.
  const text = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(blob);
  });
  return JSON.parse(text);
}

describe('errorReporter', () => {
  beforeEach(() => {
    vi.stubEnv('MODE', 'production');
    Object.defineProperty(navigator, 'sendBeacon', { value: beacon, configurable: true });
    beacon.mockClear();
    sessionStorage.clear();
    __resetErrorReporterForTests();
    window.isPrerendering = undefined;
    window.history.replaceState({}, '', '/baza-wiedzy/x?email=jan@firma.pl#sekcja');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    window.isPrerendering = undefined;
  });

  it('wysyła beacon z message, obciętym stackiem, URL bez query i UA', async () => {
    const err = new Error('Kaboom dla jan@firma.pl tel. +48 794 443 551');
    err.stack = 'x'.repeat(5000);
    expect(reportError('react-boundary', err)).toBe(true);
    expect(beacon).toHaveBeenCalledWith(CLIENT_ERROR_ENDPOINT, expect.any(Blob));
    const payload = await lastPayload();
    expect(payload.kind).toBe('react-boundary');
    expect(payload.message).toBe('Error: Kaboom dla [email] tel. [digits]');
    expect(payload.stack.length).toBe(2048);
    expect(payload.url).toBe(`${window.location.origin}/baza-wiedzy/x`);
    expect(payload.ua).toBe(navigator.userAgent.slice(0, 256));
  });

  it(`maksymalnie ${MAX_REPORTS_PER_SESSION} zgłoszeń na sesję + dedupe`, () => {
    expect(reportError('a', new Error('1'))).toBe(true);
    expect(reportError('a', new Error('1'))).toBe(false); // duplikat
    for (let i = 2; i <= 10; i++) reportError('a', new Error(String(i)));
    expect(beacon).toHaveBeenCalledTimes(MAX_REPORTS_PER_SESSION);
  });

  it('nie wysyła w prerenderze ani poza buildem produkcyjnym', () => {
    window.isPrerendering = true;
    expect(reportError('a', new Error('x'))).toBe(false);
    window.isPrerendering = undefined;
    vi.stubEnv('MODE', 'development');
    expect(reportError('a', new Error('y'))).toBe(false);
    expect(beacon).not.toHaveBeenCalled();
  });

  it('nigdy nie rzuca (np. sendBeacon wyrzuca wyjątek)', () => {
    beacon.mockImplementationOnce(() => {
      throw new Error('beacon');
    });
    expect(() => reportError('a', new Error('z'))).not.toThrow();
  });

  it('łapie window error i unhandledrejection', async () => {
    installGlobalErrorHandlers();
    window.dispatchEvent(
      new ErrorEvent('error', { error: new Error('global'), message: 'global' }),
    );
    expect((await lastPayload()).kind).toBe('window.error');
    const ev = new Event('unhandledrejection') as Event & { reason?: unknown };
    ev.reason = new Error('promise');
    window.dispatchEvent(ev);
    expect((await lastPayload()).kind).toBe('unhandledrejection');
  });

  it('scrubPii maskuje e-maile i ciągi cyfr', () => {
    expect(scrubPii('a@b.pl 123456789 ok 12')).toBe('[email] [digits] ok 12');
  });
});
