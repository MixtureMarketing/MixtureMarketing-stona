import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestGet as dashboard } from './dashboard';
import { onRequestGet as getAllData } from '../admin/get_all_data';
import { createFakeD1, fnContext, type FakeD1 } from '../../../tests/helpers/fakeD1';

type Handler = (ctx: never) => Promise<Response> | Response;
const call = (h: Handler, env: unknown, user: unknown) =>
  h(fnContext({ env, user }) as never) as Promise<Response>;

// Limit D1 na planie Free: 50 zapytań na wywołanie. Stary kod robił 2 na projekt.
const D1_FREE_QUERY_LIMIT = 50;
const PROJECTS_PER_CLIENT = 30;

let db: FakeD1;

beforeEach(() => {
  db = createFakeD1();
  const r = db.raw;
  r.exec(
    `INSERT INTO users (id, email, name, role) VALUES
       (1, 'admin@mm.pl', 'Admin', 'admin'),
       (2, 'a@firma.pl', 'A', 'client'),
       (3, 'b@firma.pl', 'B', 'client')`,
  );
  const insP = r.prepare('INSERT INTO projects (user_id, name, type) VALUES (?, ?, ?)');
  const insD = r.prepare(
    'INSERT INTO documents (project_id, name, file_path, type) VALUES (?, ?, ?, ?)',
  );
  const insM = r.prepare('INSERT INTO milestones (project_id, title, due_date) VALUES (?, ?, ?)');
  for (const userId of [2, 3]) {
    for (let i = 0; i < PROJECTS_PER_CLIENT; i++) {
      const pid = Number(insP.run(userId, `P${userId}-${i}`, 'web').lastInsertRowid);
      insD.run(pid, `doc-${pid}`, `uploads/docs/${pid}.pdf`, 'document');
      insM.run(pid, `m2-${pid}`, '2026-12-01');
      insM.run(pid, `m1-${pid}`, '2026-11-01');
    }
  }
  db.queries = 0;
});

describe('bez N+1: stała liczba zapytań niezależnie od liczby projektów', () => {
  it('admin/get_all_data: 60 projektów → ≤ 4 zapytania, dokumenty i etapy przypięte do właściwych projektów', async () => {
    const res = await call(getAllData, { DB: db }, { id: 1, role: 'admin' });
    expect(res.status).toBe(200);
    expect(db.queries).toBeLessThanOrEqual(4);
    expect(db.queries).toBeLessThan(D1_FREE_QUERY_LIMIT);

    const body = await res.json();
    expect(body.clients).toHaveLength(2);
    expect(body.projects).toHaveLength(2 * PROJECTS_PER_CLIENT);
    for (const p of body.projects) {
      expect(p.client_name).toBeTruthy();
      expect(p.documents).toHaveLength(1);
      expect(p.documents[0].name).toBe(`doc-${p.id}`);
      // kolejność etapów po due_date rosnąco (jak wcześniej)
      expect(p.milestones.map((m: { title: string }) => m.title)).toEqual([
        `m1-${p.id}`,
        `m2-${p.id}`,
      ]);
    }
  });

  it('portal/dashboard: ≤ 3 zapytania i wyłącznie projekty/dokumenty zalogowanego klienta', async () => {
    const res = await call(dashboard, { DB: db }, { id: 2, role: 'client' });
    expect(res.status).toBe(200);
    expect(db.queries).toBeLessThanOrEqual(3);

    const { projects } = await res.json();
    expect(projects).toHaveLength(PROJECTS_PER_CLIENT);
    for (const p of projects) {
      expect(p.user_id).toBe(2);
      expect(p.documents.every((d: { project_id: number }) => d.project_id === p.id)).toBe(true);
      expect(p.milestones).toHaveLength(2);
    }
  });

  it('projekt bez dokumentów i etapów dostaje puste tablice (nie undefined)', async () => {
    db.raw.exec(`INSERT INTO users (id, email, name) VALUES (4, 'c@firma.pl', 'C')`);
    db.raw.exec(`INSERT INTO projects (user_id, name, type) VALUES (4, 'pusty', 'web')`);
    const { projects } = await (await call(dashboard, { DB: db }, { id: 4 })).json();
    expect(projects).toEqual([
      expect.objectContaining({ name: 'pusty', documents: [], milestones: [] }),
    ]);
  });
});
