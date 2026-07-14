---
description: Rozpocznij pracę nad fazą modułu wycen (użycie: /faza f0 | f1a | f1b | f1c | f2a | f2b | f2c | f3a | f3b | f3c)
---

Rozpoczynasz pracę nad fazą **$ARGUMENTS** modułu wycen. Wykonaj po kolei, NIE pisząc kodu:

1. Przeczytaj `.claude/skills/estimation/SKILL.md` (inwarianty 1–9) oraz sekcję fazy $ARGUMENTS
   w `docs/estimation/07-plan-wdrozenia.md`. Z mapy dokumentów w SKILL.md wybierz i przeczytaj
   pliki docs/estimation/ właściwe dla domeny tej fazy. Przeczytaj też
   `docs/estimation/ZASADY-PRACY.md` (TDD, eskalacje, definicja ukończenia).
2. Sprawdź stan repo: `git status` musi być czysty; upewnij się, że jesteś na gałęzi
   `feat/estimation-<faza>` utworzonej z aktualnego `main` (utwórz, jeśli nie istnieje;
   dla podfaz f1a/f1b/f1c wspólna gałąź `feat/estimation-f1`). Jeśli working tree brudny —
   zatrzymaj się i zapytaj.
3. Jeśli istnieją raporty poprzednich faz (`docs/estimation/raporty/`), przeczytaj ostatni —
   sekcje „Decyzje czekające" i „Ryzyka i długi" mogą dotyczyć tej fazy.
4. Przedstaw plan implementacji: lista plików do utworzenia/zmiany w kolejności, dla każdego
   elementu — jak zostanie przetestowany (test PRZED implementacją dla silnika i logiki API),
   które kryteria akceptacji fazy pokrywa. Wskaż wszystko, co wymaga eskalacji wg
   ZASADY-PRACY.md, ZANIM się pojawi w kodzie.
5. Zatrzymaj się i czekaj na akceptację planu. Kod dopiero po niej.

Przypomnienie twardych granic: zakres nietykalny (istniejące funkcje poza autoryzowanymi
wyjątkami), zero hardkodów domenowych (inwariant 2), migracje wyłącznie addytywne,
produkcyjnego D1 nie dotykasz — dev na lokalnym D1 (`--local`).
Fazę kończy wyłącznie komenda `/zamknij-faze $ARGUMENTS`.
