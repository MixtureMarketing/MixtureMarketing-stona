import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestGet as getPerformanceStats } from './get_performance_stats';
import { createFakeD1, fnContext, type FakeD1 } from '../../../tests/helpers/fakeD1';

type Handler = (ctx: never) => Promise<Response> | Response;
let db: FakeD1;
const call = async () =>
  (await (getPerformanceStats as Handler)(
    fnContext({ env: { DB: db }, user: { id: 1, role: 'admin' } }) as never,
  )) as Response;

beforeEach(() => {
  db = createFakeD1();
});

describe('admin/get_performance_stats', () => {
  it('pusta tabela → puste listy i sample_size 0 (UI pokaże „Brak danych”, nie zera)', async () => {
    const res = await call();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ averages: [], recent: [], sample_size: 0 });
  });

  it('średnie per metryka i urządzenie + ostatnie pomiary', async () => {
    const ins = db.raw.prepare(
      'INSERT INTO performance_metrics (metric_name, metric_value, page_url, device_type) VALUES (?, ?, ?, ?)',
    );
    ins.run('LCP', 2000, '/', 'desktop');
    ins.run('LCP', 4000, '/', 'mobile');
    ins.run('LCP', 6000, '/oferta/', 'mobile');

    const body = await (await call()).json();
    const byDevice = Object.fromEntries(
      body.averages.map((r: { device_type: string; avg_value: number; count: number }) => [
        r.device_type,
        [r.avg_value, r.count],
      ]),
    );
    expect(byDevice).toEqual({ desktop: [2000, 1], mobile: [5000, 2] });
    expect(body.recent).toHaveLength(3);
    expect(body.sample_size).toBe(3);
  });
});
