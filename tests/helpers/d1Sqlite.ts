import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { DatabaseSync as DatabaseSyncT } from 'node:sqlite';

// Przez getBuiltinModule, nie `import`: Vite na Node 22 nie zna `node:sqlite` jako modułu
// wbudowanego i próbuje go bundlować (CI działa na Node 22).
const { DatabaseSync } = process.getBuiltinModule('node:sqlite') as {
  DatabaseSync: typeof DatabaseSyncT;
};

/**
 * Prawdziwy SQLite w pamięci z interfejsem zgodnym z D1 (prepare → bind → first/all/run).
 * Do testów, w których liczy się semantyka SQL (porównania dat, NULL), a nie tylko
 * treść zapytania — ręczny mockEnv() tego nie sprawdzi.
 */
export function d1Sqlite(migrations: string[] = ['0001_init.sql']) {
  const db = new DatabaseSync(':memory:');
  for (const plik of migrations) {
    db.exec(readFileSync(resolve(__dirname, '../../migrations', plik), 'utf8'));
  }
  type Arg = string | number | null;
  interface Stmt {
    bind: (...a: Arg[]) => Stmt;
    first: () => Promise<unknown>;
    all: () => Promise<{ results: unknown[] }>;
    run: () => Promise<{ meta: { changes: number } }>;
    runSync: () => { meta: { changes: number } };
  }
  const stmt = (sql: string, args: Arg[]): Stmt => {
    const runSync = () => ({ meta: { changes: Number(db.prepare(sql).run(...args).changes) } });
    return {
      bind: (...a: Arg[]) => stmt(sql, a),
      first: async () => db.prepare(sql).get(...args) ?? null,
      all: async () => ({ results: db.prepare(sql).all(...args) }),
      run: async () => runSync(),
      runSync,
    };
  };
  // `batch` jak w D1: wszystkie zapytania w jednej transakcji; błąd jednego cofa całą paczkę.
  const batch = async (lista: Stmt[]) => {
    db.exec('BEGIN');
    try {
      const wyniki = lista.map((s) => s.runSync());
      db.exec('COMMIT');
      return wyniki;
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  };
  const D1 = { prepare: (sql: string) => stmt(sql, []), batch };
  return { DB: D1, db };
}

/** Początek bieżącej doby UTC w formacie ISO — zawsze w przeszłości, ale tego samego dnia. */
export const poczatekDobyUtcIso = () => new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z';
