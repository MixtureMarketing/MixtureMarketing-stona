# PROMPTS — sesje Claude Code dla modułu wycen

Konwencja: każdą sesję zaczynasz PRIMEREM (weryfikacja kontekstu), potem wklejasz PROMPT
zadania. Jedno zadanie = jeden spójny zakres z kryteriami akceptacji. Po zakończeniu:
`npm run build:full` + przegląd diffa przed commitem.

---

## PRIMER SESJI (wklej na start każdej sesji)

```
Pracujemy nad modułem wycen (estimation). Zanim zaczniesz:
1. Przeczytaj .claude/skills/estimation/SKILL.md oraz docs/estimation/00-przeglad.md.
2. Streść mi w 4 zdaniach: co budujemy, trzy najważniejsze inwarianty modułu
   i czego nie wolno ruszać w istniejącym kodzie.
3. Wypisz, które pliki docs/estimation/ przeczytasz dla dzisiejszego zadania i dlaczego.
Nie pisz żadnego kodu, dopóki nie potwierdzę, że kontekst się zgadza.
```

Jeśli streszczenie nie wspomina determinizmu, snapshotów i wspólnego silnika UI/serwer —
kontekst się nie załadował; każ przeczytać SKILL.md ponownie.

---

## PROMPT F0 — Fundament danych i szkielet

```
Zadanie: FAZA 0 z docs/estimation/07-plan-wdrozenia.md (kroki 1–5).
Tryb: najpierw plan. Przeczytaj docs/estimation/02 (model danych), 04 (obszary/poziomy),
05 (pytania/reguły/archetypy), 03 (inwarianty silnika) i przedstaw plan implementacji:
lista plików do utworzenia/zmiany + kolejność + jak przetestujesz. Czekaj na akceptację planu.

Po akceptacji implementuj w kolejności:
1. migrations/0003_estimation_core.sql — pełny schemat est_* z docs/estimation/02, 1:1.
2. migrations/seed/*.sql — treść z docs/estimation/04 (aspects+levels, obszary "bez zmian"
   przepisz z tabel w docs/estimation/04 i oryginalnymi widełkami wskazanymi tam jako 1:1),
   05 (questions, rules, archetypes+defaults, multipliers), 06 (modules, integrations,
   cost_item_types), 03+01 (params). Seedy idempotentne (INSERT OR REPLACE po code/key).
3. lib/estimation/engine.ts + lib/estimation/types.ts — czysty TS: ewaluator reguł (05)
   i agregacja (03). Pełne testy Vitest wg sekcji "Testing requirements" w SKILL.md.
4. Zakładka "Wyceny" w AdminDashboard (lazy) + GET /api/admin/estimation/quotes (pusta lista).
5. public/_redirects: dodaj "/portal/*  /index.html  200" NAD catch-allem; sprawdź, że
   routes.js i generator sitemapy nie obejmują /portal/*.

Ograniczenia: nie modyfikuj żadnych istniejących plików poza _redirects i rejestracją
zakładki w AdminDashboard. Zero nowych błędów TS. Wszystko lazy (size-limit).

Definition of done: wszystkie kryteria akceptacji F0 z docs/estimation/07 + build:full zielony.
Na koniec: raport co zrobione, co odłożone, instrukcja `wrangler d1 migrations apply` dla
bazy preview.
```

---

## PROMPT F1 — Rdzeń wyceny (szablon; uruchamiaj krokami)

F1 dziel na 3 sesje — nie wklejaj całości naraz:

```
F1a: Wizard formularza biznesowego + autosave draftu + podgląd na żywo (silnik w UI).
Zakres: kroki 1–2 fazy F1 z docs/estimation/07. Przeczytaj docs/estimation/05 (pytania,
visible_if, "nie wiem") i 03 (Confidence). Najpierw plan, czekaj na akceptację.
DoD: przepływ nowa wycena → wszystkie grupy pytań → draft zapisany; "nie wiem" obniża
Confidence w podglądzie; build:full zielony.
```

```
F1b: Walidacja techniczna (widok decyzji per obszar) + itemy.
Zakres: krok 3 fazy F1. Poziomy suggested/chosen, uzasadnienia reguł, override z powodem,
moduły/integracje/mnożniki/koszty. Pamiętaj D20: to widok decyzji architektonicznych —
opis poziomu + powód mają być pierwszoplanowe, godziny drugoplanowe.
DoD: zmiana poziomu bez powodu zablokowana; sugestie odznaczalne; build:full zielony.
```

```
F1c: Finalize + wynik + statusy + powiązanie z leadami.
Zakres: kroki 4–6 fazy F1. Serwerowe przeliczenie, snapshot, totals_json, ekran wyniku
z widełkami pełnymi/ofertowymi i Confidence z breakdownem; lista wycen ze statusami;
"Utwórz wycenę" w AdminLeads.
DoD: kryteria akceptacji F1 z docs/estimation/07 W CAŁOŚCI (w tym test snapshotu
i parytet UI/serwer). Test retrospektywny na 2 projektach robi Jakub ręcznie — przygotuj
mu do tego czystą bazę preview.
```

---

## PROMPT F2 / F3

Analogicznie: wklej primer, potem wskaż fazę i kroki z docs/estimation/07, zażądaj planu
przed kodem, DoD = kryteria akceptacji fazy. F2 rozbij na: (a) CRUD biblioteki,
(b) PDF oferty + Karta decyzji technicznych, (c) eksport/import JSON.
F3 na: (a) zamknięcie + godziny rzeczywiste, (b) raporty MPE + kalibracja, (c) History
Engine + mini-dashboard.

---

## Zasady stałe (dla Ciebie, nie dla agenta)

1. Plan przed kodem — zawsze; poprawka planu kosztuje minuty, poprawka kodu godziny.
2. Jedna sesja = jeden zakres; nie doklejaj "przy okazji zrób jeszcze".
3. Gałęzie feat/estimation-fN + preview deployment + preview D1; merge po odhaczeniu
   kryteriów fazy.
4. Po każdej sesji przejrzyj diff — zwłaszcza czy nie ruszył istniejących funkcji.
5. Korekty merytoryczne (widełki, reguły, progi) rób jako zmiany w migrations/seed/*.sql,
   nie prośby o zmianę kodu.
