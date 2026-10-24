import { MetricAverage, MetricLog, PerformanceData } from '../types';

/**
 * Widok zakładki Metrics z odpowiedzi `admin/get_performance_stats`
 * (`{averages, recent, sample_size}`). Czysta funkcja — bez zgadywania liczb:
 * brak pomiarów = `null`, nigdy 0 (0 ms wyglądało na świetny wynik).
 */

export type Rating = 'good' | 'needs-improvement' | 'poor';

export interface MetricDef {
  key: 'LCP' | 'CLS' | 'INP' | 'TTFB';
  label: string;
  desc: string;
  unit: string;
  /** Progi Core Web Vitals (web.dev): ≤ good = dobrze, > poor = źle. */
  good: number;
  poor: number;
}

export const METRICS: readonly MetricDef[] = [
  {
    key: 'LCP',
    label: 'LCP (Largest Contentful Paint)',
    desc: 'Czas ładowania',
    unit: 'ms',
    good: 2500,
    poor: 4000,
  },
  {
    key: 'CLS',
    label: 'CLS (Layout Shift)',
    desc: 'Stabilność wizualna',
    unit: '',
    good: 0.1,
    poor: 0.25,
  },
  {
    key: 'INP',
    label: 'INP (Interaction to Next Paint)',
    desc: 'Interaktywność',
    unit: 'ms',
    good: 200,
    poor: 500,
  },
  {
    key: 'TTFB',
    label: 'TTFB (Time to First Byte)',
    desc: 'Szybkość serwera',
    unit: 'ms',
    good: 800,
    poor: 1800,
  },
];

export interface MetricSummary {
  def: MetricDef;
  /** Średnia ważona liczbą próbek ze wszystkich urządzeń; null = brak pomiarów. */
  all: number | null;
  desktop: number | null;
  mobile: number | null;
  count: number;
}

export interface MetricsView {
  hasData: boolean;
  sampleSize: number;
  summaries: MetricSummary[];
  logs: MetricLog[];
}

const num = (v: unknown): number | null => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};

const weighted = (rows: MetricAverage[]): number | null => {
  let sum = 0;
  let count = 0;
  for (const r of rows) {
    const avg = num(r.avg_value);
    const c = num(r.count) ?? 0;
    if (avg === null || c <= 0) continue;
    sum += avg * c;
    count += c;
  }
  return count > 0 ? sum / count : null;
};

export const findMetric = (name: string | null | undefined): MetricDef | undefined =>
  METRICS.find((m) => m.key === String(name ?? '').toUpperCase());

export function rate(def: MetricDef, value: number | null): Rating | null {
  if (value === null) return null;
  if (value <= def.good) return 'good';
  if (value <= def.poor) return 'needs-improvement';
  return 'poor';
}

export function formatMetric(def: MetricDef | undefined, value: number | null): string {
  if (value === null) return '—';
  const digits = def?.key === 'CLS' ? 3 : 0;
  return value.toLocaleString('pl-PL', { maximumFractionDigits: digits });
}

export function toMetricsView(data: PerformanceData | null | undefined): MetricsView {
  const rawAverages = data?.averages;
  const rawLogs = data?.recent;
  const averages: MetricAverage[] = Array.isArray(rawAverages) ? rawAverages : [];
  const logs: MetricLog[] = Array.isArray(rawLogs) ? rawLogs : [];

  const summaries = METRICS.map((def) => {
    const rows = averages.filter((r) => findMetric(r.metric_name)?.key === def.key);
    const byDevice = (d: string) =>
      weighted(rows.filter((r) => String(r.device_type ?? '').toLowerCase() === d));
    return {
      def,
      all: weighted(rows),
      desktop: byDevice('desktop'),
      mobile: byDevice('mobile'),
      count: rows.reduce((acc, r) => acc + (num(r.count) ?? 0), 0),
    };
  });

  const counted = summaries.reduce((acc, s) => acc + s.count, 0);
  const sampleSize = num(data?.sample_size) ?? counted;
  return {
    hasData: counted > 0 || logs.length > 0,
    sampleSize,
    summaries,
    logs,
  };
}
