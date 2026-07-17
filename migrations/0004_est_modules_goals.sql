-- Moduł wycen: zakres CELÓW projektu per moduł (D24 rozszerzone — f1c, decyzja architekta).
-- Wzorzec jak est_modules.archetypes_json: NULL = moduł dla wszystkich celów; lista kodów =
-- tylko dla wskazanych `project_goal`. Checklista modułów w wizardzie = PRZECIĘCIE
-- archetyp ∩ cel (filtr w buildLibraryData, współdzielony UI↔serwer).
--
-- Migracja WYŁĄCZNIE addytywna: jedna nowa kolumna nullable, zero zmian w istniejących danych
-- (wszystkie moduły startują z NULL = zachowanie sprzed migracji). Forward-only.
--
-- Uwaga: SQLite/D1 nie wspiera „ADD COLUMN IF NOT EXISTS" — migracja jest jednorazowa,
-- tracker d1_migrations pilnuje, by nie uruchomić jej dwa razy.

ALTER TABLE est_modules ADD COLUMN goals_json TEXT;
