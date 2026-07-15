-- Moduł wycen: domknięcie snapshotu pod dokumenty f2a (oferta PDF + Karta decyzji).
-- Inwariant 3 („snapshot kopiuje KAŻDĄ wartość, której wycena używa") był spełniony dla LICZB,
-- ale nie dla TREŚCI: oferta pokazuje zakres po ludzku (nazwa + opis wybranego poziomu), a te
-- żyły wyłącznie w bibliotece (est_levels). Czytanie ich na żywo znaczyłoby, że edycja
-- biblioteki zmienia treść WYSŁANEJ oferty — dokładnie to, czemu snapshot ma zapobiegać.
-- Analogicznie alerty (archetype_warning, „brak macierzy zależności") były liczone i pokazywane
-- na żywo, ale nigdy nie zapisywane — Karta decyzji nie miała ich skąd wziąć po finalize.
--
-- Migracja WYŁĄCZNIE addytywna: trzy kolumny nullable, zero zmian w istniejących danych.
-- Wyceny sprzed migracji mają NULL → dokumenty degradują się do samej nazwy obszaru.
-- Bez wpływu na liczby ⇒ BEZ bumpu engine_version (docs/03).

ALTER TABLE est_quote_aspects ADD COLUMN level_name TEXT;
ALTER TABLE est_quote_aspects ADD COLUMN level_description TEXT;
ALTER TABLE est_quotes ADD COLUMN warnings_json TEXT;
