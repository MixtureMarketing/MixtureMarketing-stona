import React from 'react';
import { Monitor, Smartphone, Activity, ExternalLink } from 'lucide-react';
import GlassCard from '../../common/GlassCard';
import { PerformanceData } from '../types';
import { findMetric, formatMetric, rate, toMetricsView, Rating } from './metricsView';

interface AdminMetricsProps {
  metricsData: PerformanceData | null;
}

const RATING_CLASS: Record<Rating, string> = {
  good: 'text-green-700',
  'needs-improvement': 'text-amber-700',
  poor: 'text-red-600',
};
const RATING_BADGE: Record<Rating, string> = {
  good: 'bg-green-100 text-green-700',
  'needs-improvement': 'bg-amber-100 text-amber-800',
  poor: 'bg-red-100 text-red-700',
};
const RATING_LABEL: Record<Rating, string> = {
  good: 'dobrze',
  'needs-improvement': 'do poprawy',
  poor: 'źle',
};

const EXTERNAL = [
  { href: 'https://analytics.google.com/', label: 'Google Analytics 4 (zdarzenia web_vital_*)' },
  { href: 'https://dash.cloudflare.com/', label: 'Cloudflare → Web Analytics' },
  { href: 'https://pagespeed.web.dev/', label: 'PageSpeed Insights (dane CrUX)' },
];

/**
 * Zakładka Metrics. Tabela `performance_metrics` nie jest dziś zasilana (Web Vitals
 * idą do GA4 przez Zaraz), więc przy braku pomiarów pokazujemy uczciwy stan
 * „Brak danych”, a nie zera, które wyglądały na świetny wynik.
 */
const AdminMetrics: React.FC<AdminMetricsProps> = ({ metricsData }) => {
  if (!metricsData) {
    return <p className="text-gray-500">Wczytywanie metryk…</p>;
  }

  const view = toMetricsView(metricsData);

  if (!view.hasData) {
    return (
      <GlassCard className="p-8 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gray-100 text-gray-500 shrink-0">
            <Activity size={24} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-black text-dark mb-2">
              Brak danych — metryki nie są zbierane
            </h2>
            <p className="text-sm text-gray-600 mb-4 max-w-2xl">
              Panel nie dostał żadnego pomiaru Core Web Vitals (tabela pomiarów RUM jest pusta).
              Dane z przeglądarek użytkowników trafiają do GA4 jako zdarzenia{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">web_vital_*</code> — tam sprawdzisz
              realne wartości:
            </p>
            <ul className="space-y-2">
              {EXTERNAL.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-bold text-secondary hover:underline"
                  >
                    {l.label} <ExternalLink size={14} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {view.summaries.map(({ def, all, desktop, mobile, count }) => {
          const rating = rate(def, all);
          return (
            <GlassCard key={def.key} className="p-6">
              <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-1">
                {def.label}
              </h3>
              <div
                className={`text-3xl font-black mb-1 ${rating ? RATING_CLASS[rating] : 'text-gray-400'}`}
              >
                {formatMetric(def, all)}
                {all !== null && def.unit && (
                  <span className="text-base font-normal text-gray-500 ml-1">{def.unit}</span>
                )}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {all === null
                  ? 'Brak pomiarów'
                  : `${rating ? RATING_LABEL[rating] : ''} · próbki: ${count}`}
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span className="flex items-center gap-1" title="Desktop">
                  <Monitor size={14} className="text-gray-400" aria-label="Desktop" />
                  {formatMetric(def, desktop)}
                </span>
                <span className="flex items-center gap-1" title="Mobile">
                  <Smartphone size={14} className="text-gray-400" aria-label="Mobile" />
                  {formatMetric(def, mobile)}
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-dark">Ostatnie Pomiary (RUM)</h3>
          <span className="text-xs text-gray-500">Próba: {view.sampleSize} zdarzeń</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-3">Czas</th>
                <th className="px-6 py-3">Metryka</th>
                <th className="px-6 py-3">Wartość</th>
                <th className="px-6 py-3">Urządzenie</th>
                <th className="px-6 py-3">Strona</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {view.logs.map((log, i) => {
                const def = findMetric(log.metric_name);
                const value = typeof log.metric_value === 'number' ? log.metric_value : null;
                const rating = def ? rate(def, value) : null;
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-500 text-xs">
                      {new Date(log.created_at).toLocaleString('pl-PL')}
                    </td>
                    <td className="px-6 py-3 font-bold text-dark">{log.metric_name}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${rating ? RATING_BADGE[rating] : 'bg-gray-100 text-gray-600'}`}
                      >
                        {formatMetric(def, value)}
                        {value !== null && def?.unit ? ` ${def.unit}` : ''}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 capitalize">{log.device_type || '—'}</td>
                    <td
                      className="px-6 py-3 text-xs text-gray-500 truncate max-w-[200px]"
                      title={log.page_url ?? undefined}
                    >
                      {log.page_url || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminMetrics;
