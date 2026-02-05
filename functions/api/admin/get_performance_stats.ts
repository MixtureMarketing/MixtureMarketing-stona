/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: admin/get_performance_stats
 * Path: /api/admin/get_performance_stats
 */

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    // 1. Get Averages
    const averages: any = await env.DB.prepare(
      `
      SELECT metric_name, AVG(metric_value) as avg_value, COUNT(*) as count
      FROM performance_metrics
      GROUP BY metric_name
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
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
};
