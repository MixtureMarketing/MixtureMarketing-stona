-- Moduł wycen f2c: rozdzielenie treści KLIENCKIEJ od WEWNĘTRZNEJ (przegląd seedów).
-- Biblioteka zyskuje pola „klienckie": polska nazwa obszaru do dokumentów klienta
-- (est_aspects.client_name) i opis poziomu promise-safe do oferty (est_levels.client_description).
--
-- KLUCZOWE (inwariant 3): buildOffer czyta WYŁĄCZNIE snapshot, nie żywą bibliotekę — dokładnie
-- jak level_name/level_description zamrożone w 0005. Gdyby client_* czytało się na żywo, edycja
-- polskiej nazwy obszaru zmieniłaby brzmienie JUŻ WYSŁANEJ oferty. Dlatego snapshot dostaje własne
-- kolumny (aspect_client_name, level_client_description) — finalize zamraża surowe wartości (nullable).
--   Fallback (w buildOffer, na polach SNAPSHOTU): aspect_client_name ?? aspect_name;
--                                                 level_client_description ?? level_description.
-- Karta decyzji zostaje na nazwach WEWNĘTRZNYCH (dokument inżynierski) — bez zmian.
--
-- Migracja WYŁĄCZNIE addytywna: cztery kolumny nullable, zero zmian w istniejących danych.
-- Wyceny sprzed migracji mają NULL → dokumenty degradują się do nazwy/opisu wewnętrznego.
-- Bez wpływu na liczby ⇒ BEZ bumpu engine_version (jak 0005; docs/03).

-- ── Biblioteka (edytowalne w panelu, f2c CRUD) ──────────────────────────────
ALTER TABLE est_aspects ADD COLUMN client_name TEXT;
ALTER TABLE est_levels ADD COLUMN client_description TEXT;

-- ── Snapshot (zamrożenie przy finalize; inwariant 3) ────────────────────────
ALTER TABLE est_quote_aspects ADD COLUMN aspect_client_name TEXT;
ALTER TABLE est_quote_aspects ADD COLUMN level_client_description TEXT;
