# ZASADY PRACY — moduł wycen (kod)

Uzupełnienie kontraktu ustalonego w sesji startowej (gałęzie feat/estimation-fN, lokalny D1,
wrangler.toml w repo, migracje przez CI z gate'em, zakres nietykalny). Obowiązuje Claude Code
w każdej sesji nad modułem.

## 1. Testy

- **TDD obowiązkowe dla silnika (`lib/estimation/`) i logiki funkcji API**: test opisujący
  oczekiwane zachowanie powstaje PRZED implementacją. Przypadki kontrolne agregacji liczone
  ręcznie w komentarzu testu (żeby test weryfikował matematykę, nie implementację).
- UI: testy komponentowe tam, gdzie jest logika (walidacje, warunki widoczności pytań,
  blokady); bez testów-wydmuszek na czysty markup.
- Migracje/seedy: test idempotencji (podwójne wykonanie) przy każdym zamknięciu fazy.
- E2E per faza: scenariusze zdefiniowane w komendzie `/zamknij-faze` — wykonywane realnie,
  z dowodami, nie deklaratywnie.

## 2. Poziomy decyzji (eskalacja)

**Poziom 1 — decydujesz sam** (raportujesz w sekcji „Decyzje podjęte samodzielnie"):
nazewnictwo plików/funkcji, struktura komponentów, detale implementacyjne, refaktor
własnego kodu modułu, treść komunikatów UI.

**Poziom 2 — wymaga zgody Jakuba PRZED wykonaniem:** nowe zależności npm; zmiany w CI/
workflow; jakiekolwiek dotknięcie zakresu nietykalnego ponad autoryzowane wyjątki
(_redirects, zakładka w AdminDashboard, wrangler.toml, krok CI migracji); wartości
merytoryczne w seedach (widełki, progi reguł — Jakub jest właścicielem treści);
wszystko, co dotyka produkcyjnego D1.

**Poziom 3 — eskalacja do architekta (Jakub wkleja pytanie do chatu z Claude/Fable):**
zmiana schematu względem `docs/estimation/02`; zmiana formuł lub kolejności obliczeń
względem `03` (każda = bump engine_version); nowe typy akcji reguł lub zmiana semantyki
ewaluacji względem `05`; każde odstępstwo od inwariantów SKILL.md; decyzje bezpieczeństwa
(auth, dane klientów). Format eskalacji: kontekst → problem → 2–3 opcje z konsekwencjami →
rekomendacja. NIE rozwiązuj tych spraw „kreatywnie" w locie — zatrzymaj wątek, oznacz
w raporcie jako czekający, kontynuuj resztę fazy, jeśli niezależna.

**Wzorzec migracji (forward-only).** Nie edytuj migracji już zaaplikowanej na produkcji —
każdą zmianę schematu wprowadzaj jako NOWĄ migrację o kolejnym numerze. Edycja zaaplikowanej
migracji jest decyzją poziomu 2 (jawna zgoda Jakuba) i dopuszczalna wyłącznie gdy udowodniona
równoważność stanu docelowego schematu we wszystkich kontekstach (prod + świeża baza), z zapisem
w sekcji „Odstępstwa" raportu fazy. Precedens: fix `0002` w F0 (usunięcie martwych ALTERów).
Prod D1 jest od 2026-07-14 na trackingu wranglera (`d1_migrations`) — wszystkie przyszłe migracje
prod WYŁĄCZNIE przez `migrations apply --remote` (docelowo krok CI), nigdy przez `execute --file`
z migracjami.

**Nowa reguła w docs = ta sama zmiana w seedach, w TYM SAMYM commicie.** Tabele reguł w `05`
i biblioteki w `06` nie są szkicem — to specyfikacja treści. Reguła opisana w docs, a nieobecna
w `rules.sql`, jest gorsza niż jej brak: wszyscy zakładają, że działa. Precedens (walidacja
rynkowa S2): „Konfigurator bez macierzy opcji → Confidence −15 + alert Discovery" był
udokumentowany w `docs/05` od początku i **nigdy nie trafił do seedów** — konfigurator
z nieokreślonym zakresem mógł pokazać 100% pewności. Ten sam audyt wykrył brak reguły
„CPQ → produkcja". Dotyczy też kierunku odwrotnego: zmiana wartości w seedzie bez zmiany
docs (np. waga kary) tworzy dwie sprzeczne prawdy — **wygrywa docs**, bo to specyfikacja.
Przy każdej fazie dotykającej reguł: przejdź tabele `05`/`06` i sprawdź obecność w seedach.

**Rytuał prod aplikuje KOMPLET seedów — nigdy podzbioru.** Nawet gdy faza ruszyła tylko jeden
plik, re-apply obejmuje wszystkie `migrations/seed/*.sql` w kolejności zależności. Seedy są
idempotentne, więc pełny przebieg nic nie kosztuje, a podzbiór powoduje **cichy dryf prod↔repo**:
precedens f1c — rytuał f1b wgrał tylko `archetypes`/`questions`/`params`, więc prod od f1a-fix
chodził na 44 regułach zamiast 46 (brakowało reguł doboru platformy z pakietu B/C) i nikt tego
nie zauważył do następnego rytuału. Obowiązkowy element rytuału: **liczby przed/po dla wszystkich
tabel `est_*`** — rozjazd względem świeżej bazy lokalnej = dryf do wyjaśnienia, nie do zignorowania.

## 3. Definicja ukończenia (DoD)

Zadanie/faza są ukończone wyłącznie, gdy: (a) przeszła procedura `/zamknij-faze` z dowodami,
(b) kryteria akceptacji fazy odhaczone z dowodem przy każdym punkcie, (c) raport zapisany
w `docs/estimation/raporty/`, (d) Jakub zaakceptował raport. Deklaracja „gotowe" bez tej
ścieżki nie jest ukończeniem. ✅ bez dowodu nie istnieje.

## 4. Pętla feedbacku z architektem

Po każdej fazie Jakub przekazuje RAPORT-fN.md do przeglądu architektonicznego w chacie
(Claude/Fable — autor dokumentacji). Przegląd obejmuje: zasadność odstępstw, mandat decyzji
poziomu 1, rozstrzygnięcie poziomu 3, ewentualną aktualizację docs/estimation/ (rejestr
decyzji D22+). Merge gałęzi fazy do main następuje PO tym przeglądzie. Rozjazd kod ↔
dokumentacja nigdy nie przekracza jednej fazy.

## 5. Higiena sesji

Jedna sesja = jeden spójny zakres (podfazy f1a/f1b/f1c to osobne sesje). Start sesji przez
`/faza`, koniec przez `/zamknij-faze` albo jawne zawieszenie z notatką stanu w raporcie
roboczym. Nie doklejaj zakresu „przy okazji" — nowe pomysły trafiają do sekcji „Ryzyka
i długi / propozycje" raportu, decyduje o nich Jakub z architektem.

**Przed KAŻDYM commitem fazowym: `git branch`.** Commit fazowy nigdy nie idzie bezpośrednio
na `main` — `main` przyjmuje wyłącznie **merge po akceptacji raportu**. Sprawdzenie gałęzi jest
elementem rytuału commita, tak samo jak zielona bramka; „byłem na gałęzi przed chwilą" nie jest
dowodem. Precedens (f1-retro-fixes): po merge poprzedniej rundy sesja została na `main`, kolejny
commit fazowy poszedł prosto na `main` i został wypchnięty — treść była zaakceptowana, ale
**zniknął punkt kontrolny**: bez merge commita nie było momentu, w którym Jakub mógł powiedzieć
„nie". Skutek techniczny zerowy, skutek procesowy realny.
