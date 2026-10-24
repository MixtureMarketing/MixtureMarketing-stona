/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/get_performance_stats
 * Path: /api/admin/get_performance_stats
 */

import { serverError } from '../_shared/errors';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    // 1. Średnie per metryka i urządzenie (panel pokazuje desktop/mobile osobno,
    // a średnią łączną liczy ważoną liczbą próbek).
    const averages: any = await env.DB.prepare(
      `
      SELECT metric_name, device_type, AVG(metric_value) as avg_value, COUNT(*) as count
      FROM performance_metrics
      GROUP BY metric_name, device_type
    `,
    ).all();

    // 2. Get Recent Entries
    const recent: any = await env.DB.prepare(
      `
      SELECT * FROM performance_metrics ORDER BY created_at DESC LIMIT 50
    `,
    ).all();

    return new Response(
      JSON.stringify({
        averages: averages.results,
        recent: recent.results,
        sample_size: (averages.results as any[]).reduce((n, r) => n + Number(r.count || 0), 0),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err: any) {
    return serverError(err, 'admin/get_performance_stats');
  }
};
