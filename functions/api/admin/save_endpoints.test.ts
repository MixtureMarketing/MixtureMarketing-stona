import { describe, it, expect, beforeEach } from 'vitest';
import { onRequestPost as saveProject } from './save_project';
import { onRequestPost as saveMilestone } from './save_milestone';
import { onRequestPost as saveClient } from './save_client';
import { onRequestPost as adminReplyChat } from './admin_reply_chat';
import { onRequestPost as updateProfile } from '../portal/update_profile';
import { createFakeD1, createFakeKV, fnContext, type FakeD1 } from '../../../tests/helpers/fakeD1';

// Handlery Pages Functions wołane z kontekstem zbudowanym w teście (prawdziwy SQLite
// za interfejsem D1 — `undefined` w bind rzuca jak na produkcji).
type Handler = (ctx: never) => Promise<Response> | Response;
const call = (h: Handler, env: unknown, body: unknown, user?: unknown) =>
  h(fnContext({ env, body, user }) as never) as Promise<Response>;

let db: FakeD1;
let env: { DB: FakeD1; CACHE: ReturnType<typeof createFakeKV> };

beforeEach(async () => {
  db = createFakeD1();
  env = { DB: db, CACHE: createFakeKV() };
  await db
    .prepare('INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?)')
    .bind(1, 'admin@mm.pl', 'Admin', 'admin')
    .run();
  await db
    .prepare('INSERT INTO users (id, email, name, company_name, role) VALUES (?, ?, ?, ?, ?)')
    .bind(2, 'klient@firma.pl', 'Klient', 'Firma', 'client')
    .run();
});

const row = (sql: string, ...args: (string | number)[]) =>
  db.raw.prepare(sql).get(...args) as Record<string, unknown> | undefined;

describe('admin/save_project', () => {
  it('nowy projekt z formularza bez pól opcjonalnych → 200 i zapis (wcześniej 500 D1_TYPE_ERROR)', async () => {
    // Dokładnie to, co wysyła GenericEditModal, gdy admin wypełni tylko klienta i nazwę.
    const res = await call(saveProject, env, {
      progress: 0,
      status: 'pending',
      user_id: '2',
      name: 'Sklep',
    });
    expect(res.status).toBe(200);
    const p = row('SELECT * FROM projects WHERE name = ?', 'Sklep');
    expect(p).toMatchObject({
      user_id: 2,
      type: 'web',
      status: 'pending',
      progress: 0,
      drive_link: null,
      budget: null,
    });
  });

  it('brak nazwy albo klienta → 400 z czytelnym komunikatem', async () => {
    const r1 = await call(saveProject, env, { user_id: '2' });
    expect(r1.status).toBe(400);
    expect((await r1.json()).message).toMatch(/Nazwa projektu/);
    const r2 = await call(saveProject, env, { name: 'X' });
    expect(r2.status).toBe(400);
    expect((await r2.json()).message).toMatch(/Klient/);
  });

  it('edycja aktualizuje tylko przesłane pola i pozwala zmienić klienta', async () => {
    await call(saveProject, env, { user_id: 2, name: 'A', budget: '5000', drive_link: 'x' });
    const id = row('SELECT id FROM projects')!.id as number;
    await db
      .prepare('INSERT INTO users (id, email, name) VALUES (?, ?, ?)')
      .bind(3, 'b@b.pl', 'B')
      .run();

    const res = await call(saveProject, env, {
      id,
      user_id: '3',
      progress: 140,
      // pola z GET get_all_data, których nie ma w tabeli — ignorowane
      client_name: 'Klient',
      documents: [],
    });
    expect(res.status).toBe(200);
    expect(row('SELECT * FROM projects WHERE id = ?', id)).toMatchObject({
      user_id: 3,
      name: 'A',
      budget: '5000',
      drive_link: 'x',
      progress: 100,
    });
  });

  it('edycja nieistniejącego projektu → 404', async () => {
    const res = await call(saveProject, env, { id: 999, name: 'X' });
    expect(res.status).toBe(404);
  });

  it('niepoprawny JSON → 400, nie 500', async () => {
    const request = new Request('https://x/api/admin/save_project', {
      method: 'POST',
      body: '{nie-json',
    });
    const res = await (saveProject as Handler)({ request, env, data: {} } as never);
    expect(res.status).toBe(400);
  });
});

describe('admin/save_milestone', () => {
  let projectId: number;
  beforeEach(async () => {
    await call(saveProject, env, { user_id: 2, name: 'P' });
    projectId = row('SELECT id FROM projects')!.id as number;
  });

  it('nowy etap z UI (id: "") → INSERT', async () => {
    const res = await call(saveMilestone, env, {
      id: '',
      project_id: String(projectId),
      title: 'Makieta',
      description: '',
      due_date: '2026-11-01',
      status: 'pending',
      feedback: '',
    });
    expect(res.status).toBe(200);
    expect(row('SELECT * FROM milestones')).toMatchObject({
      project_id: projectId,
      title: 'Makieta',
      order_index: 0,
    });
  });

  it('etap bez opisu i terminu (pola pominięte) → zapis z NULL', async () => {
    const res = await call(saveMilestone, env, { project_id: projectId, title: 'T' });
    expect(res.status).toBe(200);
    expect(row('SELECT description, due_date, status FROM milestones')).toEqual({
      description: null,
      due_date: null,
      status: 'pending',
    });
  });

  it('edycja: brak description/due_date w body nie wywala zapisu i ich nie kasuje', async () => {
    await call(saveMilestone, env, {
      project_id: projectId,
      title: 'T',
      description: 'opis',
      due_date: '2026-11-01',
    });
    const id = row('SELECT id FROM milestones')!.id as number;
    const res = await call(saveMilestone, env, { id, title: 'Nowy', status: 'accepted' });
    expect(res.status).toBe(200);
    expect(row('SELECT * FROM milestones WHERE id = ?', id)).toMatchObject({
      title: 'Nowy',
      status: 'accepted',
      description: 'opis',
      due_date: '2026-11-01',
    });
  });

  it('nieznany status albo brak tytułu → 400', async () => {
    expect(
      (await call(saveMilestone, env, { project_id: projectId, title: 'T', status: 'hacked' }))
        .status,
    ).toBe(400);
    expect((await call(saveMilestone, env, { project_id: projectId })).status).toBe(400);
    expect((await call(saveMilestone, env, { title: 'bez projektu' })).status).toBe(400);
  });
});

describe('admin/save_client', () => {
  it('„Dodaj Klienta” (bez id) tworzy aktywne konto klienta', async () => {
    const res = await call(saveClient, env, {
      name: 'Nowy',
      email: ' nowy@firma.pl ',
      company_name: 'NF',
    });
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBeGreaterThan(0);
    expect(row('SELECT * FROM users WHERE email = ?', 'nowy@firma.pl')).toMatchObject({
      name: 'Nowy',
      role: 'client',
      is_active: 1,
      company_name: 'NF',
    });
  });

  it('nowy klient bez firmy → company_name NULL; zły e-mail → 400; duplikat → 409', async () => {
    expect((await call(saveClient, env, { name: 'X', email: 'x@x.pl' })).status).toBe(200);
    expect(row('SELECT company_name FROM users WHERE email = ?', 'x@x.pl')).toEqual({
      company_name: null,
    });
    expect((await call(saveClient, env, { name: 'X', email: 'nie-mail' })).status).toBe(400);
    const dup = await call(saveClient, env, { name: 'X', email: 'klient@firma.pl' });
    expect(dup.status).toBe(409);
    expect((await dup.json()).message).toMatch(/już istnieje/);
  });

  it('edycja zapisuje też e-mail (pole edytowalne w UI) i nie dotyka is_active, gdy go brak', async () => {
    const res = await call(saveClient, env, {
      id: '2',
      name: 'Klient 2',
      email: 'nowy-adres@firma.pl',
      company_name: 'Firma',
    });
    expect(res.status).toBe(200);
    expect(row('SELECT * FROM users WHERE id = 2')).toMatchObject({
      name: 'Klient 2',
      email: 'nowy-adres@firma.pl',
      is_active: 1,
    });
  });

  it('nie pozwala edytować konta admina przez ten endpoint', async () => {
    const res = await call(saveClient, env, { id: 1, name: 'pwned' });
    expect(res.status).toBe(404);
    expect(row('SELECT name FROM users WHERE id = 1')).toEqual({ name: 'Admin' });
  });
});

describe('admin/admin_reply_chat — walidacja', () => {
  it('brak/zły user_id albo pusta treść → 400; zapis z id zalogowanego admina', async () => {
    expect(
      (await call(adminReplyChat, env, { content: 'x' }, { id: 1, role: 'admin' })).status,
    ).toBe(400);
    expect(
      (await call(adminReplyChat, env, { user_id: 2, content: '  ' }, { id: 1, role: 'admin' }))
        .status,
    ).toBe(400);
    const ok = await call(
      adminReplyChat,
      { ...env, RESEND_API_KEY: '' },
      { user_id: '2', content: 'Dzień dobry' },
      { id: 1, role: 'admin' },
    );
    expect(ok.status).toBe(200);
    expect(row('SELECT user_id, admin_id, project_id FROM messages')).toEqual({
      user_id: 2,
      admin_id: 1,
      project_id: null,
    });
  });
});

describe('portal/update_profile', () => {
  it('bez company_name → NULL zamiast 500; puste imię → 400', async () => {
    const user = { id: 2 };
    const ok = await call(updateProfile, env, { name: 'Jan' }, user);
    expect(ok.status).toBe(200);
    expect(row('SELECT name, company_name FROM users WHERE id = 2')).toEqual({
      name: 'Jan',
      company_name: null,
    });
    expect((await call(updateProfile, env, { name: '' }, user)).status).toBe(400);
  });
});
