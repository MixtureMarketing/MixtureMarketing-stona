# Plan: sesja portalu w ciasteczku HttpOnly + tabela sesji

Status: **plan, niezaimplementowany** (2026-10-23, zaktualizowany 2026-10-25). Powód: zmiana dotyka 17 plików frontu
i wymaga migracji D1 oraz wdrożenia w trzech krokach — to nie jest poprawka „przy okazji".

## Stan obecny i ryzyka

| Problem                                                                   | Gdzie                                                                                                            | Skutek                                                                                                    |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Token sesji w `localStorage` (`portal_token`), użytkownik w `portal_user` | `context/AuthContext.tsx`                                                                                        | Każdy XSS na domenie (skrypt z CMS, zależność, Zaraz) czyta token i przejmuje sesję — także admina.       |
| Jedna kolumna `users.session_token` / `session_expires`                   | `verify_token.ts`, oba `_middleware.ts`                                                                          | Logowanie na drugim urządzeniu wylogowuje pierwsze; nie da się zobaczyć ani unieważnić pojedynczej sesji. |
| Token zapisany w bazie jawnie                                             | `users.session_token`                                                                                            | Zrzut bazy (backup, eksport do CRM) = gotowe sesje do przejęcia.                                          |
| Token w nagłówku `Authorization` przekazywany propsami                    | 17 plików w `components/portal/**` (m.in. `EstimationTab`, `useAdminData`, `useAdminActions`, `PortalDashboard`) | Każdy nowy widok musi pamiętać o nagłówku; łatwo o wyciek do logów i komponentów.                         |

Już zrobione osobno (poza tym planem): porównywanie dat wygaśnięcia jako dat (#56,
`julianday(...)`) i wylogowanie po stronie serwera (#68, `POST /api/auth/logout` zeruje
`users.session_token`).

## Docelowo

### 1. Migracja `0009_sessions.sql`

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,        -- SHA-256 (hex) tokenu; sam token tylko w ciasteczku
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,               -- format SQLite (datetime('now', '+7 days')), nie ISO
  last_seen_at TEXT,
  user_agent TEXT,
  revoked_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
```

### 2. Backend

- `functions/api/_session.ts` — jedna funkcja `getSessionUser(request, env)`:
  czyta ciasteczko `mm_session` (w okresie przejściowym także `Authorization: Bearer`),
  liczy SHA-256, szuka w `sessions` z warunkiem
  `revoked_at IS NULL AND datetime(expires_at) > datetime('now')`, dołącza `users.is_active = 1`.
- `verify_token.ts` — po zużyciu magic linku: losowy token 32 bajty, `INSERT INTO sessions`,
  odpowiedź z nagłówkiem
  `Set-Cookie: mm_session=<token>; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=604800`.
- `portal/_middleware.ts` i `admin/_middleware.ts` — korzystają z `getSessionUser`; admin dalej
  sprawdza `role = 'admin'`.
- Ochrona CSRF: `SameSite=Strict` + w middleware odrzucanie metod innych niż GET/HEAD,
  gdy nagłówek `Origin` nie jest `https://mixturemarketing.pl`.
- Nowe endpointy:
  - `POST /api/auth/logout` (istnieje od #68) — przepiąć na `UPDATE sessions SET revoked_at = datetime('now')` + ciasteczko z `Max-Age=0`,
  - `GET /api/auth/me` — zwraca użytkownika z sesji (zastępuje `portal_user` w `localStorage`).
- Opcjonalnie: `POST /api/auth/logout_all` (unieważnia wszystkie sesje użytkownika) i lista sesji w profilu.

### 3. Frontend

- `AuthContext`: bez `sessionToken`; przy starcie `GET /api/auth/me`; `logout()` woła
  `/api/auth/logout`. Usunąć `portal_token` i `portal_user` z `localStorage` (jednorazowo, przy starcie).
- Wszystkie wywołania `/api/portal/*` i `/api/admin/*`: usunąć nagłówki `Authorization`
  i `X-Auth-Token` — przeglądarka wysyła ciasteczko sama (same-origin, domyślne `credentials`).
  Usunąć prop `sessionToken` z drzewa komponentów (`EstimationTab`, `QuoteWizard` itd.).
- Pobieranie dokumentów (`/api/portal/download`) już idzie przez `fetch` + blob — zadziała bez zmian
  poza usunięciem nagłówka.

### 4. Wdrożenie bez masowego wylogowania

1. **Krok A (backend):** migracja + `_session.ts`; middleware akceptuje ciasteczko **i** Bearer
   (stary token z `users.session_token`); `verify_token` ustawia ciasteczko i nadal zwraca `session_token`.
2. **Krok B (frontend):** AuthContext i komponenty bez tokenu. Po tym wdrożeniu nowi zalogowani
   używają już wyłącznie ciasteczka.
3. **Krok C (po 7 dniach — maksymalny czas życia starej sesji):** usunąć fallback Bearer,
   przestać zwracać `session_token`, migracją wyzerować `users.session_token` / `session_expires`
   (kolumny można usunąć później).

### 5. Testy

- `_session.test.ts` na prawdziwym SQLite (`tests/helpers/d1Sqlite.ts`): ważna / wygasła /
  unieważniona sesja, nieaktywny użytkownik, dwie równoległe sesje jednego użytkownika,
  zły `Origin` przy POST.
- `verify_token`: nagłówek `Set-Cookie` z `HttpOnly; Secure; SameSite=Strict`.
- `logout`: po wylogowaniu ten sam token dostaje 401.
- Front: test `AuthContext` (brak zapisu tokenu w `localStorage`).

### 6. Szacunek

Około 1 dnia pracy: backend z testami 3–4 h, front (17 plików) 2–3 h, weryfikacja logowania
w przeglądarce na środowisku testowym 1 h, plus odczekanie 7 dni przed krokiem C.

## Związek z CRM

CRM nie powinien korzystać z sesji portalu ani czytać tokenów z D1. Leady i użytkownicy portalu
trafiają do CRM przez webhook podpisany osobnym sekretem (HMAC), niezależnym od sesji.
