import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AdminMetrics from '../../components/portal/admin/AdminMetrics';
import {
  toMetricsView,
  formatMetric,
  rate,
  METRICS,
} from '../../components/portal/admin/metricsView';

const lcp = METRICS.find((m) => m.key === 'LCP')!;

describe('toMetricsView (kontrakt API {averages, recent})', () => {
  it('pusta odpowiedź → hasData=false, wartości null (nie 0)', () => {
    const v = toMetricsView({ averages: [], recent: [] });
    expect(v.hasData).toBe(false);
    expect(
      v.summaries.every((s) => s.all === null && s.desktop === null && s.mobile === null),
    ).toBe(true);
  });

  it('średnia ważona liczbą próbek + podział desktop/mobile', () => {
    const v = toMetricsView({
      averages: [
        { metric_name: 'LCP', device_type: 'desktop', avg_value: 2000, count: 1 },
        { metric_name: 'lcp', device_type: 'mobile', avg_value: 5000, count: 3 },
      ],
      recent: [],
    });
    const s = v.summaries.find((x) => x.def.key === 'LCP')!;
    expect(s.desktop).toBe(2000);
    expect(s.mobile).toBe(5000);
    expect(s.all).toBe(4250);
    expect(s.count).toBe(4);
    expect(v.sampleSize).toBe(4);
    expect(v.hasData).toBe(true);
  });

  it('wiersz bez device_type (stary kształt API) liczy się do średniej łącznej', () => {
    const v = toMetricsView({ averages: [{ metric_name: 'LCP', avg_value: 4200, count: 10 }] });
    const s = v.summaries.find((x) => x.def.key === 'LCP')!;
    expect(s.all).toBe(4200);
    expect(s.desktop).toBeNull();
  });

  it('dawny kształt {summary, logs} albo śmieci → brak danych, bez wyjątku', () => {
    expect(toMetricsView({ summary: {}, logs: [] } as never).hasData).toBe(false);
    expect(toMetricsView(null).hasData).toBe(false);
  });

  it('progi oceny i format', () => {
    expect(rate(lcp, null)).toBeNull();
    expect(rate(lcp, 2500)).toBe('good');
    expect(rate(lcp, 3000)).toBe('needs-improvement');
    expect(rate(lcp, 4200)).toBe('poor');
    expect(formatMetric(lcp, null)).toBe('—');
  });
});

describe('AdminMetrics', () => {
  it('bez pomiarów: „Brak danych — metryki nie są zbierane”, żadnego zielonego 0 ms', () => {
    const { container } = render(<AdminMetrics metricsData={{ averages: [], recent: [] }} />);
    expect(screen.getByText(/Brak danych — metryki nie są zbierane/)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\b0\s*ms/);
    const links = [...container.querySelectorAll('a')];
    expect(links.length).toBeGreaterThan(0);
    links.forEach((a) => expect(a.getAttribute('rel')).toContain('noopener'));
  });

  it('z danymi: pokazuje realną wartość (LCP 4200 ms, „źle”) i wiersze tabeli', () => {
    render(
      <AdminMetrics
        metricsData={{
          averages: [{ metric_name: 'LCP', device_type: 'mobile', avg_value: 4200, count: 10 }],
          recent: [
            {
              metric_name: 'LCP',
              metric_value: 4200,
              page_url: '/',
              device_type: 'mobile',
              created_at: '2026-10-24 10:00:00',
            },
          ],
          sample_size: 10,
        }}
      />,
    );
    const values = screen.getAllByText(/4\s?200/);
    expect(values.length).toBeGreaterThan(0);
    expect(screen.getByText(/źle · próbki: 10/)).toBeInTheDocument();
    // metryki bez pomiarów: „Brak pomiarów”, a nie 0
    expect(screen.getAllByText('Brak pomiarów')).toHaveLength(3);
    expect(screen.getAllByRole('row')).toHaveLength(2); // nagłówek + 1 pomiar
  });
});
