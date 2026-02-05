# Roadmap Migracji do Cloudflare - Mixture Marketing

Status: **Planning** (2026-02-05)

## Cel Strategiczny
Przeniesienie całej infrastruktury z hostingu współdzielonego (Apache/PHP/MySQL) na nowoczesny stack Serverless (Cloudflare Pages, Workers, D1).
**Korzyści:** Globalny CDN (TTFB < 50ms), brak kosztów utrzymania serwera, skalowalność, bezpieczeństwo (DDoS), spójność stacku (Full-Stack TypeScript).

---

## FAZA 1: Frontend & Routing (Cloudflare Pages)

Celem tej fazy jest uruchomienie strony statycznej (SSG) na infrastrukturze Cloudflare.

- [ ] **Konfiguracja Cloudflare Pages**:
    - [ ] Połączenie repozytorium GitHub z Cloudflare Pages.
    - [ ] Ustawienie komendy buildu: `npm run build`.
    - [ ] Ustawienie katalogu wyjściowego: `dist`.
- [ ] **Konfiguracja Routingu (SPA/SSG)**:
    - [ ] Utworzenie pliku `public/_redirects` (dla Cloudflare) obsługującego routing SPA (fallback do index.html dla ścieżek klienckich, jeśli SSG nie pokrywa wszystkiego).
    - [ ] Weryfikacja nagłówków Cache-Control dla zasobów statycznych (assets, images).
- [ ] **Weryfikacja Domeny**:
    - [ ] Przeniesienie DNS domeny `mixturemarketing.pl` do Cloudflare (opcjonalne, ale zalecane dla pełni funkcji).
    - [ ] Konfiguracja rekordów DNS (CNAME/A) na Pages.

## FAZA 2: Backend & API (Cloudflare Workers)

Celem tej fazy jest zastąpienie skryptów PHP (`send_mail.php`, `config.php`) nowoczesnymi funkcjami Serverless w TypeScript.

- [ ] **Inicjalizacja Wrangler**:
    - [ ] Konfiguracja `wrangler.toml` w projekcie (narzędzie CLI Cloudflare).
    - [ ] Utworzenie katalogu `functions/` (dla Cloudflare Pages Functions) lub osobnego Workera. *Rekomendacja: Pages Functions dla prostoty (katalog `functions/api/`).*
- [ ] **Migracja Wysyłki Maili (Zastąpienie PHPMailer)**:
    - [ ] Wybór dostawcy API mailowego (Resend, Mailgun, lub SendGrid). *Rekomendacja: Resend (darmowy tier, proste API).*
    - [ ] Stworzenie funkcji `functions/api/send-email.ts`:
        - [ ] Walidacja danych (Zod).
        - [ ] Weryfikacja Google ReCaptcha (po stronie serwera!).
        - [ ] Wysyłka maila przez `fetch` do API dostawcy.
- [ ] **Obsługa Zmiennych Środowiskowych**:
    - [ ] Dodanie sekretów do Cloudflare (API Keys, ReCaptcha Secret) zamiast plików `.env` na serwerze.

## FAZA 3: Baza Danych (Cloudflare D1 / Sanity)

Celem tej fazy jest uniezależnienie się od MySQL na hostingu współdzielonym. Mamy dwie ścieżki:

### Ścieżka A: Cloudflare D1 (SQLite on Edge) - *Rekomendowana*
- [ ] **Konfiguracja D1**:
    - [ ] Utworzenie bazy danych D1 w panelu Cloudflare.
    - [ ] Zdefiniowanie schematu tabeli `leads` (id, email, type, status, created_at).
- [ ] **Backend (API)**:
    - [ ] Aktualizacja `functions/api/send-email.ts` o zapis leada do bazy D1 przed wysyłką maila.
- [ ] **Migracja Danych (Opcjonalna)**:
    - [ ] Eksport starych leadów z MySQL i import do D1 (jeśli konieczne).

### Ścieżka B: Sanity jako Baza Danych (Headless CMS)
- [ ] Zamiast D1, zapisywanie leadów bezpośrednio w Sanity jako dokumenty typu `lead`.
- [ ] Wymaga stworzenia tokena API z uprawnieniami do zapisu.

## FAZA 4: Cleanup & Switch (Wdrożenie)

- [ ] **Refaktoryzacja Frontendu**:
    - [ ] Aktualizacja `apiClient.ts` i `leadService.ts` – zmiana endpointów z `.php` na `/api/...`.
    - [ ] Usunięcie folderu `public/api/` (stary backend PHP).
- [ ] **Testy E2E**:
    - [ ] Przetestowanie pełnego przepływu: Formularz -> ReCaptcha -> Worker -> Zapis D1 -> Wysyłka Maila.
- [ ] **Przepięcie Domeny**:
    - [ ] Zmiana rekordów DNS na produkcję Cloudflare.
- [ ] **Wyłączenie starego hostingu**:
    - [ ] Wypowiedzenie umowy hostingu współdzielonego.

---

## Notatki Techniczne
*   **Wymagane Sekrety (Cloudflare Dashboard):**
    *   `RESEND_API_KEY` (do maili)
    *   `RECAPTCHA_SECRET_KEY` (do weryfikacji)
    *   `SANITY_API_TOKEN` (jeśli używamy Sanity do zapisu)
*   **Kompatybilność:** Cloudflare Workers używają standardu `fetch` i `Web Standards`, więc kod jest bardzo zbliżony do nowoczesnego JS w przeglądarce. Nie ma dostępu do `fs` (system plików) ani natywnych modułów Node.js (ale można używać polyfili lub API D1).