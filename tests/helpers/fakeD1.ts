/**
 * Prawdziwy SQLite (node:sqlite, wbudowany w Node 22) za interfejsem D1 — do testów
 * Pages Functions. Schemat ładowany z migrations/0001_init.sql, więc testy łapią
 * błędy SQL (zła kolumna, NOT NULL), a nie tylko kształt wywołań.
 *
 * Wierne odwzorowanie zachowania D1, które psuło panel:
 * - `undefined` w .bind() rzuca (D1_TYPE_ERROR) — dokładnie jak na produkcji;
 * - boolean jest zamieniany na 1/0;
 * - `queries` liczy zapytania na wywołanie (limit D1: 50 na invocation na planie Free).
 */
import type { DatabaseSync as DatabaseSyncT } from 'node:sqlite';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Vite (vitest) nie rozpoznaje jeszcze `node:sqlite` jako modułu wbudowanego —
// ładujemy go przez require w czasie wykonania, z pominięciem resolvera Vite.
const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as {
  DatabaseSync: typeof DatabaseSyncT;
};

type Bindable = string | number | null | bigint | Uint8Array;

export interface FakeD1 {
  prepare(sql: string): FakeStatement;
  batch(stmts: FakeStatement[]): Promise<Array<{ results: unknown[]; success: true }>>;
  exec(sql: string): Promise<void>;
  /** Liczba wykonanych zapytań (każde first/all/run i każdy element batch). */
  queries: number;
  /** Bezpośredni dostęp do bazy (asercje w testach). */
  raw: DatabaseSyncT;
}

export interface FakeStatement {
  bind(...args: unknown[]): FakeStatement;
  first<T = Record<string, unknown>>(col?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[]; success: true }>;
  run(): Promise<{ success: true; meta: { changes: number; last_row_id: number } }>;
}

const SCHEMA = resolve(__dirname, '../../migrations/0001_init.sql');

function toBindable(v: unknown, i: number): Bindable {
  if (v === undefined) {
    throw new Error(
      `D1_TYPE_ERROR: Type 'undefined' not supported for value 'undefined' (parametr ${i + 1})`,
    );
  }
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v === null || typeof v === 'string' || typeof v === 'number' || typeof v === 'bigint') {
    return v;
  }
  if (v instanceof Uint8Array) return v;
  throw new Error(`D1_TYPE_ERROR: Type '${typeof v}' not supported (parametr ${i + 1})`);
}

export function createFakeD1(): FakeD1 {
  const raw = new DatabaseSync(':memory:');
  raw.exec(readFileSync(SCHEMA, 'utf8'));

  const db: FakeD1 = {
    queries: 0,
    raw,
    prepare(sql: string) {
      return makeStmt(sql, []);
    },
    async batch(stmts) {
      // D1 batch = jedna transakcja.
      raw.exec('BEGIN');
      try {
        const out = [];
        for (const s of stmts) out.push(await s.all());
        raw.exec('COMMIT');
        return out;
      } catch (e) {
        raw.exec('ROLLBACK');
        throw e;
      }
    },
    async exec(sql: string) {
      raw.exec(sql);
    },
  };

  function makeStmt(sql: string, params: Bindable[]): FakeStatement {
    const prepared = () => {
      db.queries += 1;
      return raw.prepare(sql);
    };
    return {
      bind(...args: unknown[]) {
        return makeStmt(sql, args.map(toBindable));
      },
      async first<T>(col?: string) {
        const row = prepared().get(...params) as Record<string, unknown> | undefined;
        if (!row) return null;
        return (col ? row[col] : row) as T;
      },
      async all<T>() {
        const st = prepared();
        // Zapytania bez wyniku (INSERT/UPDATE bez RETURNING) — all() i tak działa w D1.
        const results = (
          /^\s*(select|with)|returning/i.test(sql) ? st.all(...params) : (st.run(...params), [])
        ) as T[];
        return { results, success: true as const };
      },
      async run() {
        const st = prepared();
        if (/returning/i.test(sql)) {
          st.all(...params);
          return { success: true as const, meta: { changes: 1, last_row_id: 0 } };
        }
        const r = st.run(...params);
        return {
          success: true as const,
          meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) },
        };
      },
    };
  }

  return db;
}

/** Minimalny KV w pamięci; `failWrites` symuluje wyczerpany limit zapisów (plan Free). */
export function createFakeKV(opts: { failWrites?: boolean; failReads?: boolean } = {}) {
  const store = new Map<string, string>();
  const ops = { get: 0, put: 0, delete: 0 };
  return {
    store,
    ops,
    async get(key: string, type?: 'json' | 'text') {
      ops.get += 1;
      if (opts.failReads) throw new Error('KV GET failed');
      const v = store.get(key);
      if (v === undefined) return null;
      return type === 'json' ? JSON.parse(v) : v;
    },
    async put(key: string, value: string) {
      ops.put += 1;
      if (opts.failWrites) throw new Error('KV PUT failed: 429 Too Many Requests');
      store.set(key, value);
    },
    async delete(key: string) {
      ops.delete += 1;
      if (opts.failWrites) throw new Error('KV DELETE failed: 429 Too Many Requests');
      store.delete(key);
    },
  };
}

/** Kontekst Pages Function do wywołania handlera w teście. */
export function fnContext(opts: {
  env: unknown;
  body?: unknown;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  user?: unknown;
}): unknown {
  const request = new Request(opts.url ?? 'https://x.test/api/test', {
    method: opts.method ?? (opts.body === undefined ? 'GET' : 'POST'),
    headers: { 'Content-Type': 'application/json', ...(opts.headers ?? {}) },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  const waitUntil: Promise<unknown>[] = [];
  return {
    request,
    env: opts.env,
    data: opts.user ? { user: opts.user } : {},
    params: {},
    next: async () => new Response('next'),
    waitUntil: (p: Promise<unknown>) => waitUntil.push(p),
    passThroughOnException: () => {},
  };
}
