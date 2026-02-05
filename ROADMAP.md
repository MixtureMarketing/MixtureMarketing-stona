# Roadmap Migracji do Cloudflare - Mixture Marketing

Status: **In Progress (Faza 2)** (2026-02-05)

## Cel Strategiczny
Zastąpienie infrastruktury opartej na PHP (Apache/MySQL/SMTP) nowoczesnym stackiem Edge (Cloudflare Pages, Workers, D1, KV).

---

## FAZA 1: Frontend & Routing (ZAKOŃCZONA)

- [x] **Konfiguracja Cloudflare Pages**:
    - [x] Połączenie repozytorium GitHub.
    - [x] Rozwiązanie konfliktu `react-helmet-async` przez `.npmrc` (legacy-peer-deps).
    - [x] Konfiguracja zmiennych Sanity (`VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET`).
- [x] **Konfiguracja Routingu (SPA/SSG)**:
    - [x] Utworzenie pliku `public/_redirects`.
- [ ] **Weryfikacja Domeny**:
    - [ ] Przeniesienie DNS domeny `mixturemarketing.pl` do Cloudflare.

## FAZA 2: Backend & API (W TOKU)

Celem jest przeniesienie logiki z plików PHP (`public/api/*.php`) do Cloudflare Pages Functions.

### 2.1: Wysyłka Maili (Zastąpienie SMTP z config.php)
- [ ] **Wybór dostawcy API**: Zamiast SMTP (jak w PHPMailer), użyjemy **Resend.com** (zalecane) lub innego API.
- [ ] **Stworzenie endpointu `/api/send-email`**:
    - [ ] Przeniesienie zmiennej `NOTIFY_EMAIL` i `EMAIL_SUBJECT` z `config.php` do konfiguracji Workera.
    - [ ] Implementacja wysyłki przez `fetch`.
- [ ] **Weryfikacja ReCaptcha**:
    - [ ] Przeniesienie `RECAPTCHA_SECRET` z `config.php` do **Cloudflare Secrets**.
    - [ ] Walidacja tokena po stronie serwera wewnątrz funkcji API.

### 2.2: Logika Biznesowa (Zastąpienie submit.php)
- [ ] **Endpoint `/api/contact`**: Zastąpienie `contact_submit.php`.
- [ ] **Endpoint `/api/calculator`**: Zastąpienie `calculator_submit.php`.

### 2.3: Cache (Zastąpienie Redis)
- [ ] W `config.php` widnieje obsługa Redis. Na Cloudflare zastąpimy to przez **Cloudflare KV (Key-Value Storage)** dla globalnego cachowania danych z Sanity lub wyników audytów.

## FAZA 3: Baza Danych (Zastąpienie MySQL)

Zgodnie z `config.php`, obecnie posiadasz dwie bazy danych: `Główną` i `Audytową`.

### 3.1: Cloudflare D1 (SQL on Edge)
- [ ] **Baza Główna (Leady/Sesje)**: Migracja tabel `leads` i `sessions` z MySQL do Cloudflare D1.
- [ ] **Baza Audytowa**: Jeśli dane audytowe są duże, rozważenie pozostawienia ich w zewnętrznym SQL z dostępem przez HTTP API lub migracja do D1.

### 3.2: Auth (Zastąpienie auth_check.php)
- [ ] Implementacja autoryzacji opartej na **JWT** lub **Cloudflare Access** zamiast sesji PHP.

## FAZA 4: Cleanup & Switch (Wdrożenie)

- [ ] **Aktualizacja SITE_CONFIG**: Upewnienie się, że `recaptchaSiteKey` w `site.ts` zgadza się z nowym kluczem (jeśli będzie zmieniany).
- [ ] **Usuwanie Remnantów PHP**:
    - [ ] Skasowanie folderu `public/api/` (w tym `PHPMailer`).
    - [ ] Skasowanie `.htaccess`.
- [ ] **Testy E2E**: Weryfikacja formularzy na domenie `pages.dev`.
