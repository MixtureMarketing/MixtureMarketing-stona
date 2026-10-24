import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackEvent } from '@/utils/analytics';

/**
 * Regresja (audyt renderowania 2026-10-24): `zaraz.track` zwraca Promise, który przy
 * zablokowanym beaconie (/cdn-cgi/zaraz/t — blokery reklam) jest odrzucany „Failed to
 * fetch". trackEvent łapał tylko wyjątki synchroniczne, więc każde web_vital_* dawało
 * `unhandledrejection` → /api/client-error.
 */
describe('trackEvent', () => {
  afterEach(() => {
    delete window.zaraz;
  });

  it('przekazuje event do zaraz.track', () => {
    const track = vi.fn();
    window.zaraz = { track, consent: { set: vi.fn() } };
    trackEvent('lead_start', { source: 'x' });
    expect(track).toHaveBeenCalledWith('lead_start', { source: 'x' });
  });

  it('obsługuje odrzucony Promise z zaraz.track (brak unhandledrejection)', async () => {
    const rejected = Promise.reject(new TypeError('Failed to fetch'));
    const catchSpy = vi.spyOn(rejected, 'catch');
    window.zaraz = { track: vi.fn(() => rejected), consent: { set: vi.fn() } };

    expect(() => trackEvent('web_vital_lcp', { metric_value: 1 })).not.toThrow();
    expect(catchSpy).toHaveBeenCalledTimes(1);
    await expect(catchSpy.mock.results[0].value).resolves.toBeUndefined();
  });

  it('nie rzuca, gdy Zaraz nie jest załadowany', () => {
    expect(() => trackEvent('phone_click')).not.toThrow();
  });
});
