# Roadmap Migracji do Cloudflare - Mixture Marketing

Status: **Ready for Verification (Phase 4)** (2026-02-05)

## Cel Strategiczny
Zastąpienie infrastruktury opartej na PHP (Apache/MySQL/SMTP) nowoczesnym stackiem Edge (Cloudflare Pages, Workers, D1, R2, Durable Objects, KV).

---

## FAZA 1: Frontend & Routing (ZAKOŃCZONA)

- [x] **Konfiguracja Cloudflare Pages**: GitHub Actions, .npmrc, Zmienne Build.
- [x] **Konfiguracja Routingu (SPA)**: Utworzono `_redirects`.

## FAZA 2: Backend & Logic (ZAKOŃCZONA)

Cel: Stworzenie API Serverless (zamiast PHP) obsługującego formularze, portal i chat.

- [x] **Baza Danych (Cloudflare D1)**:
    - [x] Utworzenie bazy `mixture-db`.
    - [x] Zdefiniowanie schematu SQL.
- [x] **Migracja Danych**: Skrypt do importu obecnych użytkowników i leadów z MySQL do D1.
- [x] **Cache & Sesje (Cloudflare KV)**:
    - [x] Utworzenie namespace `mixture-cache`.
    - [x] Implementacja cache'owania w kodzie (Wiadomości, Audyt).
- [x] **Magazyn Plików (Cloudflare R2)**:
    - [x] Utworzenie bucketa `mixture-files`.
- [x] **Logika Chatu (Cloudflare Durable Objects)**:
    - [x] Implementacja klasy Durable Object dla pokoju czatu.
    - [x] Obsługa WebSocketów (Real-time).
- [x] **Funkcja: Kalkulator Wycen (`functions/api/calculator_submit.ts`)**:
    - [x] Generowanie maila z załącznikiem PDF (Resend).
- [x] **Funkcja: Analityka RUM (`functions/api/rum-collect.ts`)**:
    - [x] Zbieranie metryk Web Vitals do D1.
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
- [x] **Integracja Cloudflare Turnstile**:
    - [x] Zastąpienie Google ReCaptcha v3.
    - [x] Weryfikacja tokenów na Edge.

### 2.4: Migracja Audyt 360 (Architektura Edge)
- [x] **Konfiguracja Hyperdrive**: Połączenie do bazy `DB_AUDIT` (MySQL).
- [x] **Funkcja: Pobieranie Raportu (`functions/api/audit/get_result.ts`)**:
    - [x] Odczyt z MySQL (wymaga Hyperdrive).
    - [x] Logika normalizacji JSON (v6.1-deep).
- [x] **Funkcja: Skaner Live (`functions/api/audit/run_audit.ts`)**:
    - [x] Implementacja Scrapera opartego na `HTMLRewriter` (Edge).
- [x] **Generowanie PDF**: Przeniesienie generowania na stronę klienta (jspdf/html2canvas).

## FAZA 3: Migracja Frontendu (ZAKOŃCZONA)

- [x] **Aktualizacja `apiClient.ts`**: Przepięcie na nowe ścieżki API (`/api/...`).
- [x] **Refaktoryzacja `AuthContext.tsx`**: Logika logowania na tokeny D1.
- [x] **Integracja WebSocket w Portalu**: Połączenie `PortalChat` z Durable Objects.

## FAZA 4: Cleanup & Switch (W TOKU)

- [x] **Usuwanie PHP**: Kasacja folderu `public/api` i legacy plików.
- [ ] **Weryfikacja Preview**: Testy na linku z Cloudflare.
- [ ] **Weryfikacja Domeny**: DNS na Cloudflare.
- [ ] **Finalne Testy E2E**: Pełny audyt sprawności portalu i formularzy.

## FAZA 5: Visual Automation & AI (PLANOWANA)

Cel: Wykorzystanie zaawansowanych możliwości Cloudflare do przewagi rynkowej.

- [ ] **Automatyzacja Wizualna (Browser Rendering API)**:
    - [ ] Generowanie realnych screenshotów stron klientów w Audycie 360.
    - [ ] Skanowanie stron renderowanych w JavaScript (SPA).
    - [ ] Automatyczne generowanie grafik OG (Open Graph) dla bloga.
- [ ] **Inteligentna Analiza (Workers AI)**:
    - [ ] Generowanie tekstowych podsumowań audytów przez LLM (np. Llama 3).
    - [ ] Klasyfikacja leadów na podstawie treści wiadomości.
- [ ] **Wyszukiwarka Semantyczna (Vectorize)**:
    - [ ] Wdrożenie wyszukiwania opartego na znaczeniu (nie tylko słowach kluczowych) w Bazie Wiedzy.