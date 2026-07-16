-- Moduł wycen: cykl życia wyceny (f2b) — daty przejść statusów + drugi klucz R2.
--
-- Stan przed: est_quotes miał `status` i `lost_reason`, ale NIE miał kiedy status się zmienił.
-- Bez dat cała kalibracja handlowa F3 (ile ofert wysłanych, jaki czas do decyzji, jaka
-- skuteczność w kwartale) nie ma z czego powstać — `updated_at` mówi tylko o OSTATNIEJ
-- zmianie czegokolwiek i nadpisuje się przy każdym zapisie.
--
-- Trzy kolumny zamiast tabeli historii: przejścia są jednokierunkowe i rozłączne
-- (review→sent→won|lost), więc log przejść nie zapisałby nic, czego nie ma w trzech datach.
-- Gdyby kiedyś doszły cofki albo ponowne wysyłki — wtedy tabela, jako osobna decyzja.
--
-- `card_r2_key`: dokumenty są DWA (oferta + Karta decyzji, D28), a klucz był jeden.
-- Trzymanie obu pod jednym kluczem z domyślaną się nazwą pliku znaczyłoby, że kod zgaduje,
-- co leży w R2. Drugi klucz mówi wprost.
--
-- Migracja WYŁĄCZNIE addytywna: cztery kolumny nullable, zero zmian w istniejących danych.
-- Wyceny sprzed migracji mają NULL — czyli „nie wiadomo kiedy", a nie fałszywą datę.
-- Bez wpływu na liczby ⇒ BEZ bumpu engine_version (docs/03).

ALTER TABLE est_quotes ADD COLUMN sent_at TEXT;
ALTER TABLE est_quotes ADD COLUMN won_at TEXT;
ALTER TABLE est_quotes ADD COLUMN lost_at TEXT;
ALTER TABLE est_quotes ADD COLUMN card_r2_key TEXT;
