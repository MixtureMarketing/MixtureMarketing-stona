import React from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import GlassCard from '../../common/GlassCard';
import { PerformanceData, MetricValue } from '../types';

interface AdminMetricsProps {
  metricsData: PerformanceData | null;
}

const AdminMetrics: React.FC<AdminMetricsProps> = ({ metricsData }) => {
  if (!metricsData) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'LCP (Largest Contentful Paint)',
            desc: 'Czas ładowania',
            key: 'lcp',
            unit: 'ms',
            good: 2500,
          },
          {
            label: 'CLS (Layout Shift)',
            desc: 'Stabilność wizualna',
            key: 'cls',
            unit: '',
            good: 0.1,
          },
          {
            label: 'INP (Interaction to Next Paint)',
            desc: 'Interaktywność',
            key: 'inp',
            unit: 'ms',
            good: 200,
          },
          {
            label: 'TTFB (Time to First Byte)',
            desc: 'Szybkość serwera',
            key: 'ttfb',
            unit: 'ms',
            good: 800,
          },
        ].map((m) => {
          const summary = metricsData.summary;
          const key = m.key as keyof typeof summary;
          const metricValue = summary?.[key] as MetricValue | undefined;
          const valDesktop = metricValue?.desktop || 0;
          const valMobile = metricValue?.mobile || 0;
          const isGood = valDesktop <= m.good;

          return (
            <GlassCard key={m.key} className="p-6">
              <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-1">
                {m.label}
              </h3>
              <div className="text-3xl font-black text-dark mb-2">
                {valDesktop}
                <span className="text-base font-normal text-gray-400 ml-1">{m.unit}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1">
                  <Monitor size={14} className="text-gray-400" />
                  <span className={isGood ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                    {valDesktop}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Smartphone size={14} className="text-gray-400" />
                  <span className="text-gray-600">{valMobile}</span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-dark">Ostatnie Pomiary (RUM)</h3>
          <span className="text-xs text-gray-400">
            Próba: {metricsData.summary?.sample_size || 0} zdarzeń
          </span>
        </div>
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
            {(metricsData.logs || []).map((log, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-500 text-xs">
                  {new Date(log.created_at).toLocaleString('pl-PL')}
                </td>
                <td className="px-6 py-3 font-bold text-dark">{log.metric_name}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      (log.metric_name === 'LCP' && log.metric_value > 2500) ||
                      (log.metric_name === 'CLS' && log.metric_value > 0.1)
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {Math.round(log.metric_value * 100) / 100}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-500 capitalize">{log.device_type}</td>
                <td
                  className="px-6 py-3 text-xs text-gray-400 truncate max-w-[200px]"
                  title={log.page_url}
                >
                  {log.page_url}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMetrics;
