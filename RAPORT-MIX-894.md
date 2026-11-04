Kryterium 1: każdy skrypt przeglądarkowy wchodzący na produkcję (lub dowolny adres spoza localhost) używa wspólnego modułu: UA z dopiskiem MixtureE2E/1 i blokada całego /cdn-cgi/zaraz/ na dowolnym hoście, /cdn-cgi/rum oraz domen analityki.
Kryterium 2: bezpiecznik, czyli skrypt na produkcji bez zainstalowanej blokady albo z choćby jednym przepuszczonym żądaniem analityki kończy się exit 1 (liczniki zablokowane i przepuszczone).
Kryterium 3: testy modułu (dopasowanie ścieżek i hostów pozytywne i negatywne, UA, ≥ 3 mutanty); nic nie uruchomione na produkcji, bez push i wdrożenia.

# Raport MIX-894 punkt 2: testy bez GA

Gałąź `mix894/testy-bez-ga` (worktree `~/kod/wt-mix894`), baza `fe2f71c`, commit `5928ade` (autor `L-SYS <lsys@noreply.invalid>`), dokument raportu dopisany osobnym commitem (SHA w odpowiedzi do lidera).

## Moduł

`scripts/lib/prod-safe.mjs` (ESM; repo ma `"type": "module"`, wszystkie skrypty są ESM, wersja CJS niepotrzebna):

- `isAnalyticsUrl(url)`: host (google-analytics, analytics.google, googletagmanager, doubleclick, facebook.com/.net, clarity.ms, hotjar.com/.io, cloudflareinsights, razem z subdomenami) albo ścieżka `/cdn-cgi/zaraz` i `/cdn-cgi/rum` na DOWOLNYM hoście, także `/rifd/`. Ścieżka jest normalizowana (małe litery, zdekodowane `%`, zwinięte `//`), więc `/CDN-CGI/Zaraz/t`, `//cdn-cgi//zaraz/t`, `/cdn%2Dcgi/zaraz/t` też są blokowane. Niepoprawny adres = blokada (fail-closed).
- `isProdUrl(url)`: tylko pętla zwrotna (localhost, 127.0.0.1, ::1, *.localhost, 0.0.0.0) to nie produkcja; wszystko inne, także IP w sieci lokalnej, `*.pages.dev` i błędny adres, to produkcja.
- `withE2eUa(ua)`: zdejmuje `Headless`, dopisuje ` MixtureE2E/1` (idempotentnie).
- `createProdSafe(baseUrl)` zwraca obiekt: `protect(page, {userAgent, handler, onBlocked})` ustawia UA i jedyny handler `request` (analityka: abort, reszta do `handler` skryptu albo `continue`), `watchBrowser(browser)` to niezależny obserwator (każda ODPOWIEDŹ z adresu analityki na dowolnej karcie, także w oknach popup, to przeciek; karta główna bez `protect()` jest liczona), `finish()` drukuje `prod-safe: zablokowano N, przepuszczono M, karty z blokadą K` i ustawia `process.exitCode = 1`, gdy: przepuszczono > 0 (zawsze), albo (adres inny niż localhost) nie zainstalowano blokady wcale, albo jest karta główna bez blokady. Komunikat: `PROD-SAFE BŁĄD: ...`.

## Skrypty

| Skrypt | Wchodzi na | Zmiana |
|---|---|---|
| `scripts/e2e-cta-prod.mjs` | prod lub adres z argumentu | własna lista hostów zostaje tylko dla nie-analityki (api.mixturemarketing.pl, stripe, resend, Turnstile); analitykę blokuje moduł (dawniej tylko `^/cdn-cgi/zaraz/t`, teraz całe `/cdn-cgi/zaraz/`); UA z dopiskiem; `onBlocked` zachowuje licznik beaconów używany przez kroki zgody; `finish()` przed raportem; kod wyjścia nie jest już nadpisywany |
| `scripts/audit-render.mjs` | prod lub argument | dawny regex `BLOCKED` (tylko `zaraz/t`) zastąpiony modułem, raport pomija żądania analityki przez `isAnalyticsUrl`; `finish()`; kod wyjścia `real.length` nie kasuje już błędu bezpiecznika |
| `scripts/test-e2e-contact.js` | localhost albo `E2E_BASE_URL` | błąd znaleziony przy okazji: żądania z TEGO SAMEGO origin szły dalej, więc przy `E2E_BASE_URL=https://mixturemarketing.pl` Zaraz nie był blokowany; teraz `protect()` |
| `scripts/e2e-abonament.js` | prod, `/abonament/` | wcześniej brak jakiejkolwiek blokady; teraz moduł |
| `scripts/e2e-mobile-menu.js` | prod `/` | wcześniej brak blokady; UA iPhone z dopiskiem |
| `scripts/e2e-mobile-close.js` | prod `/` | wcześniej brak blokady |

Bez zmian, bo wchodzą wyłącznie na localhost (adres z stałej `PORT`): `prerender.js`, `scripts/audit-a11y.js`, `scripts/audit-health.js` (już blokuje `/cdn-cgi/`), `scripts/audit-performance.js`. Test pokrycia pilnuje, że nie mają adresu produkcji, a każdy nowy skrypt z Puppeteerem spoza tej listy musi importować moduł (inaczej czerwony).

Nie da się zablokować (bez przeglądarki lub zdalnie), opis ryzyka:

- `scripts/fetch-web-facts.mjs` wywołuje PageSpeed Insights API na produkcji: Lighthouse działa w chmurze Google i ładuje stronę razem z Zaraz. Z naszej strony nic nie zablokujemy; pomaga tylko filtr w GA4 albo wykluczenie UA `Chrome-Lighthouse`. Skrypt jest ręczny i rzadki; wątek `functions/api/audit` (PSI na stronach użytkowników) należy do MIX-893.
- `audit-render.mjs` (pobranie `sitemap.xml`), `indexnow-ping.js`, `generate-sitemap.js`: samo `fetch` bez wykonywania JS, nie uruchamia Zaraz. `audit-seo.js` czyta tylko `dist/`.
- `e2e-abonament.js` wpisuje adres `test+puppeteer-…@mixturemarketing.pl` w formularz na produkcji: analityka jest teraz zablokowana, ale to żądanie biznesowe nie było przedmiotem tego zadania (do decyzji lidera, osobne zadanie).

## Testy

`tests/scripts/prodSafe.test.ts`: 67 testów. Dopasowanie: 26 adresów blokowanych (m.in. `/cdn-cgi/zaraz/i`, `/cdn-cgi/zaraz/s.js?z=…`, wariant z wielkimi literami, `//`, `%2D`, host z kropką na końcu, niepoprawny adres) i 14 przepuszczanych (m.in. `/cdn-cgi/image/…`, `/api/contact-submit`, `notgoogle-analytics.com`, `google-analytics.com.example.org`); UA; `protect` (blokada, delegacja, `onBlocked`, żądanie już obsłużone); bezpiecznik (komunikat `PROD-SAFE BŁĄD: blokada analityki nie została zainstalowana`, komunikat o przecieku z adresem, karta bez blokady, popup, lokalnie); pokrycie skryptów; test z prawdziwym Chrome (lokalny serwer, `fetch` do `/cdn-cgi/zaraz/i|t|s.js`, `/cdn-cgi/rum`: serwer widzi 0 trafień, `/cdn-cgi/image/…` i `/api/contact-submit` docierają, UA kończy się na `MixtureE2E/1`).

Przebieg kontrolny skryptu `audit-render.mjs` na lokalnym serwerze (nie produkcja): `prod-safe: zablokowano 3, przepuszczono 0`, serwer zobaczył tylko `/` i `/cdn-cgi/image/…`, UA `…MixtureE2E/1`, rc 0.

## Tabela mutantów (kopia robocza z commita, jeden plik, przywracany `git checkout -- <plik>`)

| mutant | zmieniona linia | wynik |
|---|---|---|
| M1 | usunięcie `/^\/cdn-cgi\/zaraz(\/|$)/` z `BLOCKED_PATHS` | zabity (15 testów czerwonych) |
| M2 | `(^|\.)google-analytics\.com$` bez `$` | zabity (1) |
| M3 | `withE2eUa` zwraca UA bez `MixtureE2E/1` | zabity (4) |
| M4 | próg `stats.passed > 0` na `> 99` | zabity (3) |
| M5 | `if (stats.protectedCount === 0)` na `if (false)` | zabity (1) |
| M6 | pętla dekodowania `i < 3` na `i < 0` | zabity (2) |
| M7 | `req.abort(...)` na `req.continue()` w blokadzie | zabity (2) |
| M8 | usunięcie `/^\/cdn-cgi\/rum(\/|$)/` | zabity (3) |
| M9 | usunięcie `host === '127.0.0.1'` z `isProdUrl` | zabity (1) |
| M10 | `if (!target.opener())` na `if (target.opener())` | zabity (1) |
| M11 | usunięcie `isInterceptResolutionHandled()` | zabity (1) |
| M12 | usunięcie `process.exitCode = 1` | zabity (2) |
| M13 | niepoprawny adres: `return true` na `return false` | zabity (2) |
| M14 | usunięcie zdejmowania `HeadlessChrome` | zabity (3) |
| M15 | `if (bare.length > 0)` na `if (false)` | zabity (1) |

Przeżyło: 0 z 15.

## Formy ataku (blokada jako allowlista/fail-closed)

Obejścia dopasowania ścieżki (wielkie litery, `//`, `%2D`, `%63`, bez ukośnika końcowego, host z kropką, subdomeny, inny host z `/cdn-cgi/zaraz/`, niepoprawny adres) mają każde test blokujący i bliźniaka przepuszczającego (`/cdn-cgi/image/`, `/cdn-cgi/challenge-platform/`, `/api/contact-submit`, `notgoogle-analytics.com`, `google-analytics.com.example.org`, `/zaraz/`, `/blog/cdn-cgi-zaraz`).

## Zrobione i niezrobione

- Nie uruchamiano niczego na produkcji, bez push i wdrożenia, bez sekretów. Przebieg kontrolny na produkcji (1 strona, z blokadą) i porównanie GA4: weryfikator/L-SYS.
- Nie dotknięto plików MIX-893 (`functions/api/audit`, AuditWizard).
- W `CLAUDE.md` dopisany akapit o zasadzie (jedna sekcja po „Analytics”). `CLAUDE.md` i `scripts/convert-images.js` nie przechodzą `prettier --check` także na bazie (stan wcześniejszy, poza `npm run lint`).
- Znane ograniczenie: domyślna pusta karta, którą Chrome otwiera przy starcie, nie jest obserwowana (skrypty jej nie używają).
- Narzędzia do wyniku: `npm ci --legacy-peer-deps` z `PUPPETEER_SKIP_DOWNLOAD=1` (Chrome z `~/.cache/puppeteer`).

## Full check

FULLCHECK_PLACEHOLDER
