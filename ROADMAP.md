# Roadmap Migracji do Cloudflare - Mixture Marketing

Status: **In Progress (Faza 2)** (2026-02-05)

## Cel Strategiczny
Zastąpienie infrastruktury opartej na PHP (Apache/MySQL/SMTP) nowoczesnym stackiem Edge (Cloudflare Pages, Workers, D1, R2, Durable Objects, KV).

---

## FAZA 1: Frontend & Routing (ZAKOŃCZONA)

- [x] **Konfiguracja Cloudflare Pages**: GitHub Actions, .npmrc, Zmienne Build.
- [x] **Konfiguracja Routingu (SPA)**: Utworzono `_redirects`.

## FAZA 2: Backend & Logic (W TOKU)

Cel: Stworzenie API Serverless (zamiast PHP) obsługującego formularze, portal i chat.

- [x] **Baza Danych (Cloudflare D1)**:
    - [x] Utworzenie bazy `mixture-db`.
    - [x] Zdefiniowanie schematu SQL (tabele: `users`, `leads`, `projects`, `messages`, `documents`).
- [ ] **Migracja Danych**: Skrypt do importu obecnych użytkowników i leadów z MySQL do D1.
- [x] **Cache & Sesje (Cloudflare KV)**:
    - [x] Utworzenie namespace `mixture-cache`.
    - [x] Implementacja cache'owania zapytań do Sanity w kodzie.
- [x] **Magazyn Plików (Cloudflare R2)**:
    - [x] Utworzenie bucketa `mixture-files`.
- [ ] **Logika Chatu (Cloudflare Durable Objects)**:
    - [ ] Implementacja klasy Durable Object dla pokoju czatu.
    - [ ] Obsługa WebSocketów (Real-time).
- [ ] **Funkcja: Obsługa Leadów (`functions/api/submit-lead.ts`)**:
    - [ ] Walidacja, ReCaptcha, Zapis do D1, Wysyłka maila (Resend).
- [ ] **Funkcja: Portal API (`functions/api/portal/[[path]].ts`)**:
    - [ ] Autoryzacja JWT (zamiast sesji PHP).
    - [ ] CRUD dla projektów i dokumentów (integracja z R2).
    - [ ] Integracja z Chatem (Durable Objects + D1).

### 2.4: Migracja Audyt 360 (Zasilanie danymi)
- [ ] **Konfiguracja Hyperdrive**:
    - [ ] Połączenie Workera z bazą `DB_AUDIT` (MySQL) przez Hyperdrive.
- [ ] **Przepisanie Scrapera**:
    - [ ] Przeniesienie logiki `curl_multi` na `Promise.all()` w TypeScript.
    - [ ] Użycie `HTMLRewriter` lub lekkiej biblioteki DOM dla Workera do analizy tagów.
- [ ] **Cache Audytów (KV)**:
    - [ ] Zastąpienie logiki `classes/RedisCache.php` przez Cloudflare KV.
- [ ] **Generowanie PDF**:
    - [ ] Zastąpienie `generate_pdf.php` przez bibliotekę `jspdf` (już masz ją w projekcie!) działającą po stronie klienta lub lekkie API serverless.

## FAZA 3: Migracja Frontendu

- [ ] **Aktualizacja `apiClient.ts`**: Przepięcie z endpointów `.php` na nowe ścieżki API (`/api/...`).
- [ ] **Refaktoryzacja `AuthContext.tsx`**: Zmiana logiki logowania na tokeny JWT z Workera.
- [ ] **Integracja WebSocket w Portalu**: Połączenie `PortalChat` z nowym serwerem WebSocket.

## FAZA 4: Cleanup & Switch

- [ ] **Weryfikacja Domeny**: DNS na Cloudflare.
- [ ] **Usuwanie PHP**: Kasacja folderu `public/api`.
- [ ] **Finalne Testy E2E**: Pełny audyt sprawności portalu i formularzy.