import { vi } from 'vitest';
import { d1Sqlite } from './d1Sqlite';
import { createFakeKV } from './fakeD1';

/**
 * Wspólne atrapy do testów trzech wejść leadów (formularz, audyt, kalkulator) z modułem Lineara.
 * Zero prawdziwej sieci: `fetch` jest podmieniony i liczy wywołania po hoście.
 */

export type Json = Record<string, unknown>;

export interface Wywolanie {
  op: string;
  vars: Json;
}

export interface Siec {
  /** Wywołania `api.linear.app` w kolejności (nazwa operacji + zmienne). */
  linear: Wywolanie[];
  /** Wszystkie hosty, do których poszło `fetch`, w kolejności. */
  hosty: string[];
  /** Zdarzenia w kolejności (np. „fetch:api.linear.app”, „sql:INSERT”), do testów kolejności zapisu. */
  os: string[];
  /** Liczba maili przez Resend. */
  resend: number;
  /** Wywołania, które wyglądają na CRM (host `mixture-crm` albo ścieżka `ingest/lead`). */
  crm: number;
  /** Wymuszony błąd sieci dla `api.linear.app` (np. wyjątek w module). */
  linearPada: boolean;
}

export const KLUCZ = ['lin_api', 'ATRAPA', 'WEJSCIA'].join('_');
export const MIGRACJE_WEJSC = [
  '0001_init.sql',
  '0002_leads_add_source_company.sql',
  '0009_leads_updated_at.sql',
  '0010_linear_leady.sql',
];

/** Podmienia `fetch`: Turnstile (`captchaOk`), Resend, CRM i Linear (domyślne odpowiedzi bez błędów). */
export function stubSieci(
  opcje: { captchaOk?: boolean | ((token: string) => boolean) } = {},
): Siec {
  const siec: Siec = { linear: [], hosty: [], os: [], resend: 0, crm: 0, linearPada: false };
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const adres = new URL(String(url));
      siec.hosty.push(adres.host);
      siec.os.push(`fetch:${adres.host}`);
      if (adres.host === 'challenges.cloudflare.com') {
        const token = new URLSearchParams(String(init?.body)).get('response') ?? '';
        const ok =
          typeof opcje.captchaOk === 'function'
            ? opcje.captchaOk(token)
            : opcje.captchaOk !== false;
        return new Response(JSON.stringify({ success: ok }));
      }
      if (adres.host === 'api.resend.com') {
        siec.resend += 1;
        return new Response('{}');
      }
      if (adres.host === 'api.linear.app') {
        if (siec.linearPada) throw new TypeError('fetch failed');
        const body = JSON.parse(String(init?.body)) as { operationName: string; variables: Json };
        siec.linear.push({ op: body.operationName, vars: body.variables });
        return new Response(
          JSON.stringify({ data: odpowiedzLineara(body.operationName, body.variables) }),
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }
      if (adres.host.includes('mixture-crm') || adres.pathname.includes('ingest/lead')) {
        siec.crm += 1;
        return new Response('{}', { status: 201 });
      }
      return new Response('{}', { status: 404 });
    }),
  );
  return siec;
}

function odpowiedzLineara(op: string, vars: Json): unknown {
  const input = (vars.input ?? {}) as Json;
  switch (op) {
    case 'Etykiety':
      return {
        team: {
          id: 'team-1',
          key: 'LEA',
          labels: {
            nodes: ['formularz', 'audyt', 'kalkulator', 'bez-firmy', 'test'].map((n) => ({
              id: `lab-${n}`,
              name: n,
            })),
          },
        },
      };
    case 'KlientUpsert':
      return { customerUpsert: { success: true, customer: { id: `cust-${input.externalId}` } } };
    case 'ZadanieUtworz':
      return {
        issueCreate: {
          success: true,
          issue: { id: input.id, identifier: 'LEA-1', url: 'https://linear.app/x/issue/LEA-1' },
        },
      };
    case 'ProsbaKlienta':
      return { customerNeedCreate: { success: true, need: { id: 'need-1' } } };
    case 'Komentarz':
      return { commentCreate: { success: true, comment: { id: 'kom-1' } } };
    default:
      return { issue: null };
  }
}

/** Liczba wywołań danej operacji Lineara. */
export const ileOp = (siec: Siec, op: string) => siec.linear.filter((w) => w.op === op).length;

/** D1 (prawdziwy SQLite z migracjami) + KV + klucze Lineara; `os` dostaje wpisy `sql:INSERT leads` itp. */
export function srodowiskoWejsc(siec: Siec, dodatkowe: Json = {}) {
  const { DB: bazowa, db } = d1Sqlite(MIGRACJE_WEJSC);
  type Arg = string | number | null;
  interface Stmt {
    bind: (...a: Arg[]) => Stmt;
    first: () => Promise<unknown>;
    all: () => Promise<unknown>;
    run: () => Promise<unknown>;
  }
  const DB = {
    prepare: (sql: string): Stmt => {
      const typ = /^\s*(INSERT|UPDATE)\s+(?:OR\s+IGNORE\s+)?(?:INTO\s+)?(\w+)/i.exec(sql);
      const opakuj = (s: Stmt): Stmt => ({
        bind: (...a) => opakuj(s.bind(...a)),
        first: () => s.first(),
        all: () => s.all(),
        run: async () => {
          const wynik = await s.run();
          if (typ) siec.os.push(`sql:${typ[1].toUpperCase()} ${typ[2]}`);
          return wynik;
        },
      });
      return opakuj(bazowa.prepare(sql) as unknown as Stmt);
    },
  };
  const CACHE = createFakeKV();
  return {
    env: {
      DB,
      CACHE,
      LINEAR_API_KEY: KLUCZ,
      LINEAR_TEAM_LEADY_ID: 'team-1',
      ...dodatkowe,
    },
    db,
    DB,
    CACHE,
  };
}

/** Kontekst żądania z `waitUntil`, które zbiera obietnice; `czekaj()` czeka na wszystkie. */
export function zbieracz() {
  const obietnice: Promise<unknown>[] = [];
  return {
    waitUntil: (p: Promise<unknown>) => void obietnice.push(p),
    liczba: () => obietnice.length,
    czekaj: async () => {
      await Promise.all(obietnice);
    },
  };
}

/** Wiersze `linear_leady` (do sprawdzania „0 wierszy”). */
export const wierszeLinear = (db: ReturnType<typeof d1Sqlite>['db']) =>
  db.prepare('SELECT * FROM linear_leady').all();
