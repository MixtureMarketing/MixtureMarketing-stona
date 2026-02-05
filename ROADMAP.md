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
- [x] **Migracja Danych**: Skrypt do importu obecnych użytkowników i leadów z MySQL do D1.
- [x] **Cache & Sesje (Cloudflare KV)**:
    - [x] Utworzenie namespace `mixture-cache`.
    - [x] Implementacja cache'owania zapytań do Sanity w kodzie.
- [x] **Magazyn Plików (Cloudflare R2)**:
    - [x] Utworzenie bucketa `mixture-files`.
- [x] **Funkcja: Kalkulator Wycen (`functions/api/calculator_submit.ts`)**:
    - [x] Generowanie maila z załącznikiem PDF (Resend).
- [x] **Funkcja: Analityka RUM (`functions/api/rum-collect.ts`)**:
    - [x] Zbieranie metryk Web Vitals do D1.
- [x] **Logika Chatu (Cloudflare Durable Objects)**:
    - [x] Implementacja klasy Durable Object dla pokoju czatu.
    - [x] Obsługa WebSocketów (Real-time).
    - [x] Integracja WebSocket w Portalu (klient).
- [x] **Funkcja: Obsługa Leadów (`functions/api/contact_submit.ts`)**:
    - [x] Walidacja, ReCaptcha, Zapis do D1, Wysyłka maila (Resend).
- [x] **Funkcja: Portal API (`functions/api/portal/[[path]].ts`)**:
    - [x] Autoryzacja JWT (Middleware + D1).
    - [x] Dashboard (Projekty, Dokumenty, Kamienie milowe).
    - [x] Download plików (Integracja z R2).
    - [x] Historia wiadomości (D1 + KV Cache).
    - [x] Integracja z Chatem Real-time (Durable Objects).
- [x] **Logika Admina (`functions/api/admin/[[path]].ts`)**:
    - [x] Zarządzanie klientami i projektami.
    - [x] Upload/Delete dokumentów (R2).
    - [x] Konwersja leadów i odpowiedzi.

### 2.4: Migracja Audyt 360 (Architektura Edge)
- [ ] **Konfiguracja Hyperdrive**:
    - [ ] Utworzenie połączenia do bazy `DB_AUDIT` (MySQL) - archiwum bota.
- [x] **Funkcja: Pobieranie Raportu (`functions/api/audit/get_result.ts`)**:
    - [x] Odczyt z MySQL (wymaga Hyperdrive).
    - [x] Logika normalizacji JSON (v6.1-deep).
    - [x] Integracja z KV Cache.
- [x] **Funkcja: Skaner Live (`functions/api/audit/run_audit.ts`)**:
    - [x] Implementacja Scrapera opartego na `HTMLRewriter` (Edge).
    - [x] Integracja z Google PageSpeed Insights & Places API.
    - [x] Algorytm punktacji SEO/Performance.
- [ ] **Generowanie PDF**:
    - [ ] Przeniesienie generowania na stronę klienta (jspdf/html2canvas).

## FAZA 3: Migracja Frontendu

- [/] **Aktualizacja `apiClient.ts`**: Przepięcie z endpointów `.php` na nowe ścieżki API (`/api/...`) - autoodszranianie `.php`.
- [ ] **Refaktoryzacja `AuthContext.tsx`**: Zmiana logiki logowania na tokeny JWT z Workera.
- [ ] **Integracja WebSocket w Portalu**: Połączenie `PortalChat` z nowym serwerem WebSocket.

## FAZA 4: Cleanup & Switch

- [ ] **Weryfikacja Domeny**: DNS na Cloudflare.
- [ ] **Usuwanie PHP**: Kasacja folderu `public/api`.
- [ ] **Finalne Testy E2E**: Pełny audyt sprawności portalu i formularzy.