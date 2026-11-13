# Integracja Leady → Linear (zespół LEA): dokumentacja operacyjna

Stan opisany: gałąź `integracja`, commit `edf8472`. Każde twierdzenie o kodzie ma odwołanie `plik:wiersz` względem korzenia repo, liczone na tym commicie. Czego w repo nie widać (panel Cloudflare, Linear, timer na serwerze firmy), jest oznaczone „poza repo”. Każdy punkt prawny i każda liczba retencji jest oznaczona **do zatwierdzenia przez Jakuba**. W przykładach używamy tylko domeny `example.com`; nie ma tu żadnych wartości sekretów.

Klauzula RODO pod formularzami (`VITE_RODO_KLAUZULA`) jest w gałęzi `mix627-scal` (`b5517dc`), jeszcze nie w `integracja`; odwołania do niej mają wprost ten SHA.

## 1. Przepływ danych

### 1.1 Trzy wejścia

Każde wejście najpierw zapisuje lead w D1 (`leads`), dopiero potem zgłasza go do Lineara w tle (`waitUntil`). Odpowiedź HTTP nie czeka na Lineara (`functions/api/_linear.ts:3-6`).

| wejście | zapis w D1 | zgłoszenie do Lineara |
|---|---|---|
| formularz kontaktowy, krok 1 (`create`) | `functions/api/contact-submit.ts:294` | `functions/api/contact-submit.ts:313` (tylko gdy zapis się udał) |
| formularz, kroki 2 i 3 (`update`) i porzucenie | `functions/api/contact-submit.ts:360` | komentarz kroku: `functions/api/contact-submit.ts:398`, porzucenie: `functions/api/contact-submit.ts:428` |
| audyt strony (`capture-lead`) | `functions/api/audit/capture-lead.ts:179` (błąd D1 = 500 bez zgłoszenia, `:192-195`) | `functions/api/audit/capture-lead.ts:198` |
| kalkulator wyceny (`public-quote`) | `functions/api/estimation/public-quote.ts:271` | `functions/api/estimation/public-quote.ts:278` (nie czeka na wycenę) |

Ochrona wejść (nie zmieniana przez integrację): Turnstile `functions/api/contact-submit.ts:277`, limit per IP `functions/api/contact-submit.ts:228`, limit odbiorcy w audycie `functions/api/audit/capture-lead.ts:148`, bramka kalkulatora `functions/api/estimation/public-quote.ts:208` (przy `QUOTE_LIMITS_D1`).

### 1.2 Kolejka `linear_leady` i wysyłka

- Zgłoszenie: `zglosLead` (`functions/api/_linear.ts:865`) wstawia wiersz `stan='kolejka'` (`functions/api/_linear.ts:879`), blokuje go (`w_toku`), przetwarza i przy okazji drenuje do 5 innych wierszy (`functions/api/_linear.ts:885`).
- Stany wiersza: `kolejka`, `w_toku`, `wyslany`, `zablokowany` (`migrations/0010_linear_leady.sql:5`). `customer_request`: 0 do zrobienia, 1 gotowa, 2 nie dotyczy (`migrations/0010_linear_leady.sql:6`).
- Tworzenie zadania (`functions/api/_linear.ts:655`): identyfikator zadania w Linearze = identyfikator leada (`functions/api/_linear.ts:721`), więc ponowienie po niepewnym wyniku nie tworzy duplikatu (sprawdza istniejące zadanie, `functions/api/_linear.ts:732-737`). Zadanie dostaje etykietę źródła (`formularz`, `audyt`, `kalkulator`), `bez-firmy` dla poczty prywatnej i `test` na Preview (`functions/api/_linear.ts:696-698`).
- Customer (tylko poczta firmowa): nazwa i `externalId` = domena (`functions/api/_linear.ts:596-604`). Awaria Customera nie wstrzymuje zadania; brakujący Customer Request dokończy ponowienie (`functions/api/_linear.ts:626`).
- Prowadzący i stan: gdy ustawione `LINEAR_PROWADZACY_ID` zadanie jest do niego przypisane (`functions/api/_linear.ts:727`), gdy ustawione `LINEAR_STAN_TRIAGE_ID` trafia do Triage (`functions/api/_linear.ts:728`).
- **Dedup per adres, 1 godzina:** klucz KV `linear:dedup:<SHA-256 e-maila małymi literami>` (`functions/api/_linear.ts:663`), TTL 3600 s (`functions/api/_linear.ts:62`). Drugi lead z tego adresu w ciągu godziny nie tworzy zadania, tylko komentarz „Kolejny lead z tego adresu e-mail” w istniejącym (`functions/api/_linear.ts:666-678`). Klucz jest zapisywany po utworzeniu zadania (`functions/api/_linear.ts:747`).
- Komentarz kroku formularza: raz na krok, blokada KV 24 h (`functions/api/_linear.ts:64`, `functions/api/_linear.ts:898`); tylko gdy zadanie już istnieje (`stan='wyslany'`).

### 1.3 Ponowienia i timer

- Odstępy po kolejnych porażkach: 1, 5, 15, 60, 180, 360, 720 minut (`functions/api/_linear.ts:55`). Ósma porażka daje `zablokowany` (`functions/api/_linear.ts:56`, `functions/api/_linear.ts:546`). Suma odstępów to 1341 minut, czyli ok. 22 godziny od pierwszej porażki do blokady, plus ziarno timera (15 minut na próbę). Odpowiedź 429 czeka `Retry-After` (do 6 h, `functions/api/_linear.ts:61`) albo 300 s (`functions/api/_linear.ts:60`) i też liczy się jako próba.
- Wiersz zawieszony w `w_toku` dłużej niż 120 s wraca do kolejki (`functions/api/_linear.ts:59`, `functions/api/_linear.ts:843`).
- Endpoint `POST /api/leady/ponow` (`functions/api/leady/ponow.ts:51`) woła `drenujKolejke` (`functions/api/leady/ponow.ts:69`): domyślnie 20 wierszy, najwyżej 50 (`functions/api/_linear.ts:965`, `functions/api/leady/ponow.ts:45`). Body opcjonalne: `limit` 1–50 i `odblokuj` (zamienia `zablokowany` na `kolejka`, zeruje próby, `functions/api/_linear.ts:966-975`).
- Podpis: HMAC-SHA256 z osobnym sekretem `LINEAR_PONOW_SECRET` (minimum 32 znaki, `functions/api/leady/ponow.ts:26` i `:58`), okno 300 s (`functions/api/crm/_podpis.ts:12`), powtórzony nonce = 409 (`functions/api/crm/_podpis.ts:125`). Odpowiedzi: 405 inna metoda niż POST (`functions/api/leady/ponow.ts:52`), 503 wyłączone (`functions/api/leady/ponow.ts:59`), 401 zły podpis, 400 zły body.
- Odpowiedź 200 zawiera liczby: `ponowione`, `w_kolejce`, `zablokowane`, `bez_customer_request`, `czas` (`functions/api/_linear.ts:984-985`).
- Harmonogram (poza repo): timer na serwerze firmy co 15 minut, także gdy nie ma nowych leadów; w repo opisuje go tylko komentarz `functions/api/leady/ponow.ts:3`. Szkic z 1.11 wskazuje skrypt `leady/ponow.py` w repo narzędzi (`fdbae50`), nie sprawdzony w tej dokumentacji.

### 1.4 Bez klucza Lineara (zachowanie, gdy brak `LINEAR_API_KEY` albo `LINEAR_TEAM_LEADY_ID`)

Moduł jest wyłączony (`functions/api/_linear.ts:564`):

- formularz, audyt i kalkulator działają jak dotąd i zwracają 200: zgłoszenie wraca natychmiast z logiem `linear:wylaczone` (`functions/api/_linear.ts:866-869`), a `contact-submit` nie czeka na wynik (`functions/api/contact-submit.ts:313`);
- lead jest w D1 i w mailu do agencji (`functions/api/contact-submit.ts:317`, `functions/api/audit/capture-lead.ts:218`, `functions/api/estimation/public-quote.ts:317`); liczba zadań w Linearze: 0;
- **wiersz `linear_leady` nie powstaje** (powrót jest przed `INSERT`, `functions/api/_linear.ts:867-879`). Leady przyjęte w czasie, gdy klucza nie było, nie trafią do Lineara po jego przywróceniu; trzeba je przepisać ręcznie albo jednorazowo zakolejkować (pytanie O3);
- komentarze kroków są pomijane (`functions/api/_linear.ts:904-906`);
- `POST /api/leady/ponow` zwraca 503 (`functions/api/leady/ponow.ts:57-60`), a wiersze już zakolejkowane czekają bez zmiany.

Awaria Resend nie wstrzymuje leada: brak `RESEND_API_KEY` to log i wynik `ok:false` (`functions/api/_shared/email.ts:33-35`); odpowiedź formularza ma wtedy `degraded:true` (`functions/api/contact-submit.ts:337`), a błąd 500 `LEAD_NOT_SAVED` tylko gdy zawiodły i D1, i mail (`functions/api/contact-submit.ts:321-334`).

### 1.5 Schemat

```
formularz / audyt / kalkulator ─► Pages Function
   ├─► D1 leads (źródło prawdy)
   ├─► Resend ─► skrzynka agencji (NOTIFY_EMAIL) [+ mail do klienta: audyt, kalkulator]
   └─► (po zapisie, w tle) _linear.ts
          ├─► D1 linear_leady (kolejka i stan)
          ├─► KV: dedup 1 h, blokada kroku 24 h, cache etykiet 1 h
          └─► Linear API: Customer (domena), zadanie w LEA, Customer Request, komentarz
timer (poza repo, 15 min) ─► POST /api/leady/ponow ─► drenujKolejke ─► jak wyżej
```

## 2. Sekrety i zmienne: tylko nazwy

Lista pochodzi z użycia `env.` w `functions/` (bez testów). Wartości ustawia człowiek w panelu Cloudflare Pages (Settings → Variables and Secrets), osobno dla środowiska Production i Preview; repo ich nie zawiera, a bindingi produkcji pochodzą z panelu, nie z pliku (`wrangler.toml:3-10`).

| nazwa | rodzaj | gdzie czytana | uwagi |
|---|---|---|---|
| `LINEAR_API_KEY` | sekret | `functions/api/_linear.ts:22`, `functions/api/_linear.ts:447` | klucz konta Linear; brak = moduł wyłączony |
| `LINEAR_PONOW_SECRET` | sekret | `functions/api/leady/ponow.ts:57` | podpis timera, minimum 32 znaki; ta sama wartość po stronie timera (poza repo) |
| `LINEAR_TEAM_LEADY_ID` | zwykła | `functions/api/_linear.ts:23` | identyfikator zespołu LEA; brak = moduł wyłączony |
| `LINEAR_PROWADZACY_ID` | zwykła | `functions/api/_linear.ts:727` | prowadzący zespół Leady (decyzja 2B) |
| `LINEAR_STAN_TRIAGE_ID` | zwykła, opcjonalna | `functions/api/_linear.ts:728` | stan Triage |
| `SRODOWISKO` | zwykła | `functions/api/_linear.ts:662` | `preview` = etykieta `test` i przedrostek `[Preview]` w tytule |
| `RESEND_API_KEY`, `NOTIFY_EMAIL` | sekret, zwykła | `functions/api/_shared/email.ts:33`, `functions/api/contact-submit.ts:39` | mail do agencji (zapas, patrz 4) |
| `TURNSTILE_SECRET`, `LEAD_TOKEN_SECRET` | sekrety | `functions/api/contact-submit.ts:277`, `functions/api/_leadToken.ts:21` | ochrona formularza i token edycji leada |
| `CRM_STRONA_SECRET` | sekret | `functions/api/crm/_podpis.ts:17` | podpis GET z CRM (nie dotyczy Lineara) |
| `QUOTE_KEY_HMAC_SECRET` | sekret | `functions/api/estimation/_quoteGate.ts` | limity kalkulatora (nie dotyczy Lineara) |

### 2.1 Rotacja co 90 dni (decyzja 3A: konto info@, dwa klucze tylko do zespołu Leady)

Klucze: jeden do Production, jeden do Preview. Termin następnej rotacji zapisuje w zadaniu w Linearze osoba, która ją wykonała. Procedura nie wypisuje wartości:

1. Wygeneruj nowy klucz w Linear (konto info@, ograniczony do zespołu LEA). Nie kopiuj go do czatu ani do pliku w repo.
2. Wpisz go w panelu Pages jako sekret `LINEAR_API_KEY` (pole zaszyfrowane) w tym samym środowisku, nadpisując stary.
3. Uruchom nowe wdrożenie tego środowiska (zmiana sekretu działa dopiero na nowym wdrożeniu).
4. Sprawdź: formularz testowy daje zadanie w LEA w czasie krótszym niż 60 s (na produkcji tylko jeden lead próbny z etykietą `test`, potem Canceled), a wywołanie `ponow` zwraca 200 z `zablokowane: 0`. Jeśli zablokowane > 0, powtórz z `{"odblokuj": true}`.
5. Dopiero po poprawnym teście unieważnij stary klucz w Linear.
6. Rotacja `LINEAR_PONOW_SECRET` wymaga jednoczesnej zmiany po obu stronach (Pages i timer); do tego czasu `ponow` odpowiada 401, a kolejka rośnie bez straty danych. Najlepiej robić ją po ponowieniu timera ręcznie i w oknie 15 minut.

W czasie wymiany klucza zadania mogą dostać 401; to liczy się jako próba (`functions/api/_linear.ts:540`), ale zapas to 7 prób w ok. 22 godziny.

## 3. Rollback

- **Wyłączenie Lineara bez cofania kodu:** usuń `LINEAR_API_KEY` ze środowiska (Production albo Preview) i uruchom nowe wdrożenie. Oczekiwane zachowanie: jak w 1.4 (formularze 200, 0 zadań, lead w D1 i w mailu, `ponow` 503, w logach `linear:wylaczone`). Dane w D1 i zadania już założone w Linearze zostają. Próba na Preview (usunięcie klucza → formularz działa, 0 zadań, lead w D1 i w mailu) jest kryterium MIX-627.
- **Powrót do Lineara:** przywróć sekret, nowe wdrożenie, wywołanie `ponow` z `{"odblokuj": true}`. Leady z okresu bez klucza nie mają wiersza w kolejce (1.4).
- **Pełny rollback:** cofnięcie scalenia (`git revert -m 1 <SHA scalenia>` na `main`) i wdrożenie przez CI. Migracje nie są cofane (tabele `linear_leady` i `rate_counters` zostają nieużywane; kod z nich nie korzysta po cofnięciu). Kopia bazy sprzed migracji jest warunkiem wdrożenia produkcji.

## 4. Alarmy, SLA Jakuba (2B), mail zapasowy i przegląd po 30 dniach (5A)

Decyzje Jakuba z MIX-490: prowadzącym zespół Leady jest Jakub (2B, 30.10); SLA: kontakt do 1 dnia roboczego, oferta do 5 dni, zamknięcie do 30 dni, z automatycznym przypisaniem do prowadzącego (P4 A, 30.10; zadanie jest przypisane przez `LINEAR_PROWADZACY_ID`, `functions/api/_linear.ts:727`). Klucze tworzy konto info@ i rotuje co 90 dni (3A). Mail do agencji zostaje jako zapas, z przeglądem po 30 dniach od wdrożenia produkcji (5A).

Sygnały alarmowe, które daje kod:

| sygnał | gdzie | znaczenie | reakcja |
|---|---|---|---|
| `zablokowane > 0` w odpowiedzi `ponow` | `functions/api/_linear.ts:984` | lead nie wszedł do Lineara po 8 próbach | ustal przyczynę (log `[linear] lead <id>: <kod> (próba n, stan)`, `functions/api/_linear.ts:551`), napraw, `odblokuj` |
| `bez_customer_request > 0` długo | `functions/api/_linear.ts:985` | zadanie jest, brak Customer Request | zwykle uprawnienia klucza do Customers |
| `ponow` odpowiada 503 | `functions/api/leady/ponow.ts:59` | brak sekretu, klucza albo identyfikatora zespołu | sprawdź zmienne środowiska (sekcja 2) |
| `ponow` odpowiada 401 | `functions/api/leady/ponow.ts:61` | rozjazd `LINEAR_PONOW_SECRET` albo zegara timera | porównaj datę serwera timera, sekret zmieniaj tylko według 2.1 |
| log `linear:brak-tabeli` | `functions/api/_linear.ts:832` | migracja 0010 nie jest na bazie | sekcja 5 |
| log `linear:wylaczone` na produkcji | `functions/api/_linear.ts:867` | klucz usunięty albo nie ustawiony | sekcja 2 |

Poza repo: timer wysyła alarm, gdy kolejne biegi kończą się błędem (szkic z 1.11, nie sprawdzone tu); odbiorca alarmu to pytanie O1. Lead nie ginie, gdy alarm zawiedzie: leży w D1 i w mailu do agencji.

Mail zapasowy: wysyłka do `NOTIFY_EMAIL` pozostaje bez zmian we wszystkich trzech wejściach (`functions/api/contact-submit.ts:317`, `functions/api/audit/capture-lead.ts:218`, `functions/api/estimation/public-quote.ts:230`). Przegląd po 30 dniach: ocena, czy mail jest nadal potrzebny (stosunek leadów w mailu do zadań w LEA), z decyzją Jakuba. Zadanie przeglądu zakłada L-SYS w dniu wdrożenia produkcji (MIX-627, zakres).

## 5. Migracje

Dwie migracje mają numer 0010 i różne nazwy plików; obie są idempotentne (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`):

| plik | zawartość | idempotencja |
|---|---|---|
| `migrations/0010_linear_leady.sql` | tabela `linear_leady` z kluczem obcym do `leads` (`migrations/0010_linear_leady.sql:8`) i indeksem | `migrations/0010_linear_leady.sql:7`, `:21` |
| `migrations/0010_rate_counters.sql` | tabela `rate_counters` limitów kalkulatora | `migrations/0010_rate_counters.sql:8`, `:14` |

Wrangler śledzi migracje po nazwie pliku, więc zbieżność numerów nie blokuje zastosowania. Plik `0010_rate_counters.sql` jest już w kodzie produkcji (`4557de6`); czy został zastosowany na bazie, rozstrzyga tylko polecenie poniżej.

Kolejność na produkcji (wykonuje człowiek po `TAK <SHA>`; w tej dokumentacji niczego nie uruchamiamy):

1. Kopia bazy `mixture-db`, sprawdzona (kod 0, rozmiar, liczba tabel).
2. `wrangler d1 migrations list mixture-db --remote`: oczekujące mają być wyłącznie pliki 0010 (`0010_linear_leady.sql`, a `0010_rate_counters.sql` tylko jeśli jeszcze nie zastosowany). Każdy inny oczekujący plik = stop i pytanie (`docs/estimation/ZASADY-PRACY.md:51-53`: produkcyjna baza tylko przez `migrations apply --remote`, nigdy `execute --file`).
3. `wrangler d1 migrations apply mixture-db --remote`.
4. Ponowne `migrations list --remote`: 0 oczekujących.
5. Dopiero potem scalenie do `main` i wdrożenie przez CI.

## 6. Dane osobowe

Wszystkie punkty tej sekcji o podstawie prawnej, retencji i usuwaniu są **do zatwierdzenia przez Jakuba**.

### 6.1 Co trafia do Lineara

| dane | gdzie w Linearze | odwołanie |
|---|---|---|
| tytuł: domena firmowa albo „osoba prywatna” i temat; nigdy imię, e-mail ani telefon | tytuł zadania | `functions/api/_linear.ts:275` |
| imię, e-mail, telefon, firma, WWW, pakiet, budżet, rodzaj projektu | opis zadania (tabela) | `functions/api/_linear.ts:314`, `functions/api/_linear.ts:327-336` |
| wiadomość (do 4000 znaków) | opis zadania, komentarz kroku | `functions/api/_linear.ts:354-357`, `functions/api/_linear.ts:378` |
| odpowiedzi kalkulatora i widełki; wynik audytu, klucz pliku w R2 (nie sam PDF) | opis zadania | `functions/api/_linear.ts:346-352` |
| temat, budżet, 200 znaków wiadomości | Customer Request | `functions/api/_linear.ts:366` |
| domena firmowa (nie osoba) | Customer | `functions/api/_linear.ts:596` |

Pomijane pola: nazwy pasujące do `token|secret|captcha|passw|haslo|^ip$|agent` (`functions/api/_linear.ts:281`). Adres IP nie trafia do Lineara ani do D1. Logi modułu zawierają tylko identyfikator leada i kod błędu (`functions/api/_linear.ts:15`); formularze mają własne `console.error`, których treść nie była przeglądana (pytanie O7).

### 6.2 Retencja

| miejsce | okres | stan |
|---|---|---|
| leady w D1 i zadania w Linearze | 12 miesięcy od ostatniego kontaktu | **do zatwierdzenia przez Jakuba**; tekst klauzuli: `data/content/common.ts:253@b5517dc`; w kodzie brak mechanizmu usuwania (żadnego `DELETE FROM leads` w `functions/`) |
| PDF audytu w R2 | 90 dni | **do zatwierdzenia przez Jakuba**; `data/content/common.ts:254@b5517dc`; brak mechanizmu usuwania w kodzie |
| `linear_leady` | razem z leadem (kaskada) | `migrations/0010_linear_leady.sql:8` |
| KV: dedup adresu / blokada kroku / licznik odbiorcy audytu / powiadomienia | 1 h / 24 h / 24 h / 30 dni | `functions/api/_linear.ts:62`, `functions/api/_linear.ts:64`, `functions/api/audit/capture-lead.ts:148`, `functions/api/contact-submit.ts:420` |
| rejestr podpisów `crm_zapytania` | ok. 10 minut | `functions/api/crm/_podpis.ts:116` |

Decyzja Jakuba z 02.11 (MIX-627): 12 miesięcy dla leadów i 90 dni dla PDF z audytu, zgodnie z rekomendacją. Do ustalenia, jak ta retencja jest wykonywana (pytanie O2).

### 6.3 Usuwanie na żądanie osoby

Termin odpowiedzi: 1 miesiąc od zgłoszenia; procedura ma status **do zatwierdzenia przez Jakuba**. Zgłoszenie przyjmuje Jakub; nikt inny nie usuwa danych sam. Kroki (przykładowy adres: `osoba@example.com`):

1. Zapisz zgłoszenie (data, kanał) i potwierdź tożsamość, zanim odpowiesz z jakimikolwiek danymi.
2. D1, tylko odczyt: `SELECT id, details FROM leads WHERE lower(email) = 'osoba@example.com'` i zapisz identyfikatory leadów. Z `details` odczytaj klucz pliku PDF (`pdf_key`) przed usunięciem leada.
3. Wyceny kalkulatora: najpierw `est_quotes` po `lead_id`, bo klucz obcy ma `ON DELETE SET NULL` (`migrations/0003_estimation_core.sql:161`), a nazwa wyceny zawiera e-mail (`functions/api/estimation/public-quote.ts:283`). Odpowiedzi i pozycje wyceny usuwają się kaskadowo (`migrations/0003_estimation_core.sql:186`).
4. `DELETE FROM leads WHERE id = ?` usuwa też `linear_leady` (kaskada).
5. Linear: usuń zadanie (identyfikator w `linear_leady.identifier`, odczytany przed krokiem 4), jego komentarze i Customer Request; Customera (domena firmy) zostaw, gdy ma inne zadania. Sprawdź wyszukiwarką Linear po e-mailu i telefonie.
6. R2: usuń obiekt `pdf_key`. KV: klucze wygasają same (maksymalnie 30 dni); można je usunąć wcześniej po nazwie z sekcji 6.2.
7. Skrzynka agencji (`NOTIFY_EMAIL`) i log wysyłek Resend: usuń wiadomości z adresem osoby; retencję logów dostawcy trzeba sprawdzić (pytanie O6).
8. Kopie zapasowe bazy: dane wracają przy przywróceniu; podaj osobie termin wygaśnięcia kopii (pytanie O6).
9. Powtórz zapytania z kroku 2 i wyszukiwanie w Linear: 0 wyników. Wpisz do rejestru żądań: data, identyfikator leada, miejsca, wykonawca.

### 6.4 Kto ma dostęp (role)

| rola | dostęp |
|---|---|
| administrator konta Cloudflare | D1, KV, R2, sekrety Pages, logi |
| konto wdrażające (CI) | wdrożenie; sekrety CI to osobna lista (`.github/workflows/ci.yml:141`) |
| administrator workspace Linear | wszystkie zadania, Customerzy, komentarze i klucze |
| członkowie zespołu LEA | zadania leadów i komentarze; prowadzący jest przypisany do zadania |
| odbiorca `NOTIFY_EMAIL` | pełna treść maili z formularzy |
| administrator konta Resend | log wysyłek |
| operator timera ponowień (serwer firmy) | wywołanie `ponow`; w logu tylko liczby i kody |

Zmiana ról: tylko za decyzją Jakuba. Lista osób w każdej roli jest poza repo (pytanie O5).

## 7. Pytania otwarte do Jakuba

Każde ma rekomendację; numery zbierają raport odbioru.

| id | pytanie | rekomendacja |
|---|---|---|
| O1 | Kto dostaje alarm ponowień (zablokowane > 0)? | L-SYS (sprawa techniczna), a Jakub tylko leady po SLA |
| O2 | Jak wykonywana jest retencja 12 miesięcy i 90 dni, skoro kod nic nie usuwa? | kwartalny przegląd ręczny z listą w Linearze, osobne zadanie na automat po wdrożeniu |
| O3 | Co z leadami z okresu bez klucza (brak wiersza w kolejce)? | jednorazowy skrypt zakolejkowania po przywróceniu klucza, w zadaniu z oznaczeniem czasu |
| O4 | Czy poczta prywatna ma trafiać do Lineara w opisie zadania (e-mail jawnie)? | tak, bo opis jest dostępny tylko zespołowi LEA; tytuł pozostaje bez danych |
| O5 | Kto jest w rolach z sekcji 6.4 i kto może usuwać zadania w Linear? | lista imienna w rejestrze poza repo, zmiany przez Jakuba |
| O6 | Retencja logów Resend i kopii zapasowych D1: jaka? | sprawdzić w panelach i wpisać do odpowiedzi osobie |
| O7 | Czy `console.error` w formularzach może zawierać treść błędu bazy z wartościami pól? | przegląd w osobnym zadaniu, bez zmiany tej integracji |
| O8 | Podstawa prawna (zgoda czy działania przed umową) i umowy powierzenia z Linear, Cloudflare, Resend: podpisane? | zgodnie z odpowiedzią z 02.11 (bez osobnej zgody), potwierdzić DPA w panelach |
