-- Moduł wycen f3a: domknięcie cyklu życia (won → closed) datą zamknięcia.
-- `closed_at` uzupełnia wzorzec sent_at/won_at/lost_at (0006) — data przejścia jest jedynym
-- źródłem dla kalibracji/skuteczności F3; updated_at mówi tylko o OSTATNIEJ zmianie.
--
-- Godziny rzeczywiste NIE dostają nowej kolumny — trafiają do istniejącej est_actual_hours
-- (0003), którą docs/02 specyfikuje, a docs/03 kalibracja czyta (obszary po aspect_code,
-- moduły/integracje po ref_code: 'module:X'/'integration:Y'). Rozstrzygnięcie architekta:
-- brief proponował duplikat tej tabeli jako kolumnę est_quote_aspects.actual_hours — odrzucone
-- (dwa źródła prawdy = dryf; kolumna nie pokrywa itemów). Schemat + docs wygrywają.
--
-- Addytywna, jedna kolumna nullable, zero zmian w danych. Bez wpływu na liczby ⇒ BEZ bumpu
-- engine_version. Wyceny sprzed migracji mają closed_at = NULL.

ALTER TABLE est_quotes ADD COLUMN closed_at TEXT;
