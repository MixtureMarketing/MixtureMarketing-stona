---
description: Pełna walidacja i raport zamknięcia fazy modułu wycen (użycie: /zamknij-faze f0)
---

Zamykasz fazę **$ARGUMENTS**. Faza NIE jest ukończona, dopóki nie przejdziesz tej procedury
w całości i Jakub nie zaakceptuje raportu. Zasada nadrzędna: **✅ bez dowodu nie istnieje** —
każde „działa" musi mieć wklejony output komendy lub wynik testu.

1. **Pełna bramka lokalna.** Uruchom `npm run build:full` i wklej podsumowanie (lint, liczba
   testów, wynik size-limit). Czerwony wynik = przerwij i napraw, zamiast raportować.
2. **Baza od zera, dwa razy.** Na czystej lokalnej bazie: `wrangler d1 migrations apply DB
   --local`, potem seedy; następnie seedy DRUGI raz (dowód idempotencji). Wklej wyniki.
3. **Scenariusz E2E fazy.** Przeprowadź realny przepływ przez `wrangler pages dev` i wklej
   dowody (żądania/odpowiedzi/zrzuty danych). Minimum per faza:
   - f0: GET /api/admin/estimation/quotes z tokenem admina (200, pusta lista) i tokenem
     klienta (403); silnik: przypadek kontrolny agregacji policzony ręcznie w komentarzu
     testu vs wynik funkcji.
   - f1: utwórz wycenę → komplet odpowiedzi (w tym min. jedno „nie wiem") → walidacja
     (jedna zmiana poziomu z powodem) → finalize → porównaj totals_json z przypadkiem
     kontrolnym policzonym ręcznie krok po kroku (baza → itemy → mnożniki+cap → bufor →
     cena → oferta). Potem edytuj widełki w bibliotece i pokaż, że totals wyceny bez zmian.
   - f2: edycja widełek w UI → nowa wycena liczy po nowemu, stara bez zmian; wygeneruj PDF
     i Kartę decyzji dla wyceny z f1; eksport→import JSON→diff pusty.
   - f3: zamknij wycenę godzinami rzeczywistymi → raport MPE pokazuje odchylenie zgodne
     z ręcznym wyliczeniem; propozycja kalibracji wymaga kliknięcia (brak automatu).
4. **Kryteria akceptacji.** Przejdź listę fazy z `docs/estimation/07-plan-wdrozenia.md`
   punkt po punkcie: przy każdym ✅ dowód, przy każdym ❌ powód i plan.
5. **Self-review diffa.** `git diff main...HEAD --stat` + przegląd krytycznych plików:
   (a) zakres nietykalny nienaruszony poza autoryzowanymi wyjątkami, (b) zero wartości
   domenowych w kodzie TS (inwariant 2 — wszystkie w seedach), (c) nowe/zmienione pytania
   przechodzą test języka biznesowego (inwariant 9), (d) brak nowych błędów TS względem
   baseline'u, (e) wszystko nowe w lazy chunkach.
6. **Raport.** Zapisz `docs/estimation/raporty/RAPORT-$ARGUMENTS.md` wg szablonu i wypisz
   go też w rozmowie:

   ```
   # RAPORT $ARGUMENTS — <data>
   ## Zakres zrealizowany            (kroki fazy: zrobione/pominięte)
   ## Odstępstwa od dokumentacji     (każde z powodem i wskazaniem pliku docs, którego dotyczy)
   ## Decyzje podjęte samodzielnie   (poziom 1 wg ZASADY-PRACY.md — do przeglądu)
   ## Decyzje czekające              (poziom 2 → Jakub; poziom 3 → architekt/chat — sformułowane jako pytania)
   ## Wyniki testów                  (liczby: unit/integr., build:full, size-limit)
   ## Kryteria akceptacji            (checklista z dowodami z pkt 4)
   ## Ryzyka i długi                 (co zostawiamy świadomie, co może ugryźć w następnej fazie)
   ## Propozycja następnego kroku
   ```

7. Zatrzymaj się. Merge do main wykonuje Jakub po akceptacji raportu (i po przeglądzie
   architektonicznym sekcji „Odstępstwa" + „Decyzje" w chacie, jeśli niepuste).
