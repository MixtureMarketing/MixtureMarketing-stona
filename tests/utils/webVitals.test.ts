import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Metric } from 'web-vitals';
import { CLS_SCALE, reportWebVitals, toGa4Value, webVitalEvent } from '@/utils/webVitals';

const metric = (name: Metric['name'], value: number, delta = value): Metric =>
  ({
    name,
    value,
    delta,
    id: 'v5-test',
    rating: 'good',
    entries: [],
    navigationType: 'navigate',
  }) as unknown as Metric;

/**
 * Regresja (MIX-1253): CLS (wartosc bezwymiarowa ~0.05) szedl do GA4 przez Math.round,
 * czyli zawsze jako 0 (albo 1 przy CLS >= 0.5) — raport nie odrozniał 0.01 od 0.24.
 * Teraz CLS jest wysylany jako liczba calkowita x1000.
 */
describe('toGa4Value', () => {
  it('CLS: wartosc x1000, zaokraglona do calkowitej', () => {
    expect(toGa4Value('CLS', 0.0734)).toBe(73);
    expect(toGa4Value('CLS', 0.1)).toBe(100);
    expect(toGa4Value('CLS', 0.0004)).toBe(0);
    expect(toGa4Value('CLS', 0.2499)).toBe(250);
    expect(CLS_SCALE).toBe(1000);
  });

  it('CLS: dwie rozne wartosci nie zlewaja sie w jedna (stary blad Math.round)', () => {
    expect(toGa4Value('CLS', 0.01)).not.toBe(toGa4Value('CLS', 0.24));
  });

  it('metryki w ms (LCP, INP, FCP, TTFB) zostaja zaokraglone bez skalowania', () => {
    expect(toGa4Value('LCP', 1834.6)).toBe(1835);
    expect(toGa4Value('INP', 199.4)).toBe(199);
    expect(toGa4Value('FCP', 900)).toBe(900);
    expect(toGa4Value('TTFB', 0.4)).toBe(0);
  });
});

describe('webVitalEvent', () => {
  it('buduje payload CLS z wartoscia i delta x1000', () => {
    expect(webVitalEvent(metric('CLS', 0.0734, 0.0312), '/o-nas/')).toEqual({
      event: 'web_vital_cls',
      data: {
        metric_name: 'CLS',
        metric_value: 73,
        metric_delta: 31,
        metric_id: 'v5-test',
        page_path: '/o-nas/',
      },
    });
  });

  it('LCP: nazwa eventu malymi literami, wartosc w ms', () => {
    const { event, data } = webVitalEvent(metric('LCP', 2100.4), '/');
    expect(event).toBe('web_vital_lcp');
    expect(data.metric_value).toBe(2100);
  });
});

describe('reportWebVitals', () => {
  afterEach(() => {
    delete window.zaraz;
    window.isPrerendering = undefined;
    vi.unstubAllEnvs();
  });

  it('wysyla CLS do zaraz.track jako x1000 (produkcja)', () => {
    vi.stubEnv('DEV', false);
    const track = vi.fn();
    window.zaraz = { track, consent: { set: vi.fn() } };
    reportWebVitals(metric('CLS', 0.0734));
    expect(track).toHaveBeenCalledTimes(1);
    expect(track.mock.calls[0][0]).toBe('web_vital_cls');
    expect(track.mock.calls[0][1]).toMatchObject({ metric_value: 73 });
  });

  // MIX-1300 (mutant V5 z MIX-1253): page_path musi byc biezaca sciezka, nie stala.
  it('page_path = biezaca sciezka strony (window.location.pathname)', () => {
    vi.stubEnv('DEV', false);
    const orig = window.location.href;
    window.history.pushState({}, '', '/wycena/');
    const track = vi.fn();
    window.zaraz = { track, consent: { set: vi.fn() } };
    reportWebVitals(metric('LCP', 1200));
    window.history.pushState({}, '', orig);
    expect(track.mock.calls[0][1]).toMatchObject({ page_path: '/wycena/', metric_value: 1200 });
  });

  it('nie wysyla nic podczas prerenderu', () => {
    vi.stubEnv('DEV', false);
    const track = vi.fn();
    window.zaraz = { track, consent: { set: vi.fn() } };
    window.isPrerendering = true;
    reportWebVitals(metric('CLS', 0.0734));
    expect(track).not.toHaveBeenCalled();
  });

  it('nie wysyla nic w DEV (tylko log)', () => {
    vi.stubEnv('DEV', true);
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const track = vi.fn();
    window.zaraz = { track, consent: { set: vi.fn() } };
    reportWebVitals(metric('CLS', 0.0734));
    expect(track).not.toHaveBeenCalled();
    expect(log.mock.calls[0][0]).toContain('0.0734');
    log.mockRestore();
  });
});
