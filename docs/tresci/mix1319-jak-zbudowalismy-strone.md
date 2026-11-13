# Jak zbudowaliśmy tę stronę

> **Status: PROJEKT, do akceptacji Jakuba.** Artykuł do Bazy wiedzy, nieopublikowany: nie ma go w menu, w mapie strony ani w żadnej trasie. Po akceptacji tekstu zostanie osadzony jako strona artykułu z `noindex`, a indeksowanie włączy osobna decyzja.
>
> **Notatki redakcyjne (usunąć przed publikacją):**
> 1. Pomiar z 12.11 wykrył 4 żądania do hostów reklamowych przed zgodą (wiersz „NIE” w raporcie). Artykuł tego nie przemilcza (sekcja „Czego jeszcze nie mamy”), ale to do wyjaśnienia przed publikacją.
> 2. Wyniki Lighthouse dotyczą tylko strony głównej i były mierzone na stacji w symulacji z ostrzeżeniem narzędzia (patrz źródła).
> 3. Tekst bez nazw klientów i bez nazw narzędzi wewnętrznych. Zdjęcia i wykresy: brak, do decyzji.

## W skrócie

Nasza strona to aplikacja w React, zbudowana narzędziem Vite i wgrywana na Cloudflare Pages. Treści marketingowe zaciąga z systemu zarządzania treścią, a formularze obsługują funkcje uruchamiane na brzegu sieci. Poniżej opisujemy wybory technologiczne, pomiary, zabezpieczenia i dostępność. Każdą liczbę możesz sprawdzić w źródłach na końcu.

## Technologie i dlaczego takie

- **React 19 i TypeScript.** Interfejs jest złożony z komponentów, a typy wyłapują błędy przed wdrożeniem. Routing obsługuje React Router 7. [Z1]
- **Vite i Tailwind CSS 4.** Szybka budowa i styl pisany obok komponentu, bez osobnych arkuszy dla każdej podstrony. [Z1]
- **Prerender.** Przy budowie każda podstrona z listy tras (63 ścieżki statyczne plus artykuły z CMS) zamienia się w gotowy plik HTML. Wyszukiwarka i użytkownik dostają treść od razu, bez czekania na wykonanie skryptu. [Z2]
- **Cloudflare Pages i Functions.** Pliki statyczne serwuje sieć brzegowa, a logika formularzy działa w funkcjach: w katalogu funkcji jest 61 plików (bez testów, razem z pomocniczymi). [Z3]
- **Dane.** Baza D1 na zgłoszenia, magazyn R2 na pliki i KV na pamięć podręczną. Migracji bazy jest 12. [Z4]
- **System zarządzania treścią (Sanity).** Teksty ofert i artykuły redaguje się poza kodem. Artykuły o rozbudowanej oprawie graficznej mają własne komponenty. [Z5]
- **Czcionki z własnego serwera** (pakiety Fontsource), a plik `index.html` nie odwołuje się do zewnętrznego serwisu fontów. [Z1][Z12]

## Jak pilnujemy jakości

Nic nie trafia na stronę bez automatycznej kontroli. Ostatni pełny przebieg (13.11) dał:

- 210 plików testowych i **3606 testów, wszystkie zaliczone**, [Z6]
- czysty lint i sprawdzenie typów (osobno dla strony i dla funkcji), [Z6]
- udaną budowę, a w niej bramkę SEO i limit rozmiaru plików: skrypt strony do 300 kB, style do 50 kB (limit pilnuje narzędzie size-limit). [Z1][Z6]


## Wyniki pomiarów

Pomiar strony głównej z 12.11.2026 (Lighthouse 13.6, mediana z 3 pomiarów, symulacja łącza mobilnego; wersja na komputer osobno):

| Wskaźnik | Telefon | Komputer | Nasz próg (telefon / komputer) |
|---|---|---|---|
| Wynik wydajności | 100 | 100 | ≥ 90 / ≥ 95 |
| LCP (największy element) | 1,08 s | 0,32 s | ≤ 2,0 s / ≤ 1,5 s |
| CLS (przesunięcia układu) | 0,000 | 0,001 | ≤ 0,1 |
| TBT (blokowanie wątku) | 26 ms | 0 ms | ≤ 150 ms / ≤ 100 ms |
| Transfer strony głównej | 0,65 MB | – | ≤ 1 MB |

Zastrzeżenie: w trzech pomiarach telefonu narzędzie zgłosiło, że strona wczytywała się zbyt wolno, by zmieścić się w limicie czasu, więc wyniki mogą być niepełne. Mierzyliśmy tylko stronę główną, nie każdą podstronę. [Z7]

## Bezpieczeństwo

Opisujemy tylko to, co widać z zewnątrz, bez szczegółów, które pomagałyby w ataku.

- **Szyfrowanie i nagłówki.** Strona wymusza HTTPS (HSTS na rok, 31536000 s), blokuje zgadywanie typu plików (nosniff), ogranicza przekazywanie adresu odsyłającego i wyłącza kamerę, mikrofon i geolokalizację. Serwer nie ujawnia wersji oprogramowania w nagłówkach. [Z7]
- **Ochrona formularza przed botami.** Formularz kontaktowy weryfikuje po stronie serwera token Cloudflare Turnstile, więc samo ominięcie przeglądarki nie wystarcza. [Z8]
- **Limity.** Pola formularza mają maksymalne długości sprawdzane na serwerze (np. wiadomość do 5000 znaków, e-mail do 254), a przekroczenie kończy się czytelnym komunikatem, zanim cokolwiek trafi do bazy. Akcje bez weryfikacji mają limit 30 na godzinę z jednego adresu IP. [Z9][Z8]
- **Panel klienta i administratora** nie może być osadzony w cudzej ramce i nie jest indeksowany. [Z10]
- **Zgody.** Zgodę na cookies obsługuje Google Consent Mode v2: wszystkie cztery sygnały reklamowe i analityczne startują jako „odmowa”. [Z7][Z11]

### Czego jeszcze nie mamy

Uczciwie, na dzień pomiaru 12.11.2026:

- Polityka CSP działa w trybie raportowania (niczego nie blokuje); przełączenie na wymuszanie planujemy po okresie obserwacji. [Z7][Z10]
- Ocena według listy OWASP ASVS poziom 1 nie jest mierzona automatycznie, więc nie podajemy wyniku. [Z7]
- Pomiar wykrył 4 żądania do hostów reklamowych (Google Tag Manager i DoubleClick) zanim odwiedzający wyrazi zgodę, mimo ustawienia „odmowa” w trybie zgód. To wymaga sprawdzenia. [Z7]

## Dostępność

- Automatyczna kontrola axe (WCAG 2.2 AA) na stronie głównej: 0 naruszeń krytycznych i 0 poważnych (także 0 umiarkowanych i drobnych). [Z7]
- Język dokumentu ustawiony na polski, wszystkie 7 obrazów na stronie głównej ma tekst alternatywny, jest jeden nagłówek H1. [Z7]
- To kontrola automatyczna jednej strony. Nie zastępuje testu z czytnikiem ekranu ani przeglądu ręcznego, który pozostaje do zrobienia.

## Czego się nauczyliśmy

1. Pomiar na własnej stronie pokazuje też to, co wolelibyśmy ukryć (patrz „Czego jeszcze nie mamy”). Lepiej to opisać niż odkryje to ktoś inny.
2. Limity rozmiaru plików i bramki w budowie działają lepiej niż dobre chęci.
3. Wynik 100 w Lighthouse to nie koniec: liczą się też zgody, dostępność i bezpieczeństwo.

---

## Źródła liczb

| Id | Źródło | Co potwierdza |
|---|---|---|
| Z1 | `package.json` (repo, commit cacc8ac): zależności, skrypty, `size-limit` | wersje React 19.3, React Router 7.18, Vite 7.3, Tailwind 4.3, TypeScript 5.9, Fontsource; limity 300 kB i 50 kB |
| Z2 | `routes.js` (commit cacc8ac), `grep -c "^  '/"` = 63; `prerender.js` | liczba tras statycznych, prerender |
| Z3 | `find functions/api -name '*.ts' ! -name '*.test.ts' \| wc -l` = 61 | liczba plików funkcji |
| Z4 | `wrangler.toml` (powiązania DB, FILES, CACHE); `ls migrations \| wc -l` = 12 | D1, R2, KV, liczba migracji |
| Z5 | `data/content/articles/*.ts`, `routes.js` (opis dwóch źródeł artykułów) | CMS i komponenty artykułów |
| Z6 | log pełnej kontroli na commicie cacc8ac: „Test Files 210 passed (210)”, „Tests 3606 passed (3606)”, lint/tsc/tsc-functions/vitest/build rc=0 | wyniki pełnej kontroli 13.11 |
| Z7 | raport audytu strony mixturemarketing.pl z 12.11.2026 (stacja, 12.11.2026 07:10 UTC, Lighthouse 13.6.0, axe-core 4.14.0) | wszystkie pomiary, nagłówki, zgody, dostępność, ostrzeżenia |
| Z8 | `functions/api/contact-submit.ts` (weryfikacja Turnstile, `UNVERIFIED_ACTIONS_PER_HOUR = 30`) | Turnstile, limit 30/h |
| Z9 | `functions/api/_shared/limity.ts` (`message` max 5000, `email` max 254) | limity pól |
| Z10 | `public/_headers` (CSP Report-Only; `/portal*`: X-Frame-Options DENY, noindex) | CSP, panel |
| Z11 | `index.html` (`gtag('consent','default', …)`) | domyślna odmowa zgód |
| Z12 | `index.tsx` (importy `@fontsource/*`); `grep -c "fonts.googleapis" index.html` = 0 | fonty z własnego serwera |
