import type { Metric } from 'web-vitals';
import { trackEvent } from './analytics';

/**
 * Real User Monitoring: Core Web Vitals -> GA4 (przez Zaraz, event `web_vital_<nazwa>`).
 *
 * Jednostki wartosci wysylanej do GA4 (`metric_value`, `metric_delta`):
 * - LCP, INP, FCP, TTFB: milisekundy, zaokraglone do calkowitych;
 * - CLS: wartosc bezwymiarowa (np. 0.0734), wiec `Math.round` dawal zawsze 0 albo 1 i
 *   kasowal informacje (prog „dobry” to 0.1). CLS wysylamy jako liczbe calkowita
 *   x1000 (0.0734 -> 73). Przeliczenie z powrotem w raporcie GA4: wartosc / 1000.
 */
export const CLS_SCALE = 1000;

export const toGa4Value = (name: string, value: number): number =>
  name === 'CLS' ? Math.round(value * CLS_SCALE) : Math.round(value);

export const webVitalEvent = (metric: Metric, pagePath: string) => ({
  event: `web_vital_${metric.name.toLowerCase()}`,
  data: {
    metric_name: metric.name,
    metric_value: toGa4Value(metric.name, metric.value),
    metric_delta: toGa4Value(metric.name, metric.delta),
    metric_id: metric.id,
    page_path: pagePath,
  },
});

export function reportWebVitals(metric: Metric): void {
  // Skip podczas prerenderu (Puppeteer/build) — brak window/zaraz wtedy
  if (window.isPrerendering) return;

  // Local log w DEV
  if (import.meta.env.DEV) {
    const color = metric.value > 2500 ? 'color: #ff4d4f' : 'color: #52c41a';
    const shown = metric.name === 'CLS' ? metric.value.toFixed(4) : `${Math.round(metric.value)}ms`;
    console.log(`%c[RUM] ${metric.name}: ${shown}`, color, { id: metric.id, delta: metric.delta });
    return;
  }

  const { event, data } = webVitalEvent(metric, window.location.pathname);
  trackEvent(event, data);
}
