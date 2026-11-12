-- MIX-1382: liczniki ścisłe publicznej wyceny (functions/api/_shared/gateCounter.ts).
-- k   = 'q:ip:<HMAC>' | 'q:em:<HMAC>' | 'q:day' (IP i e-mail tylko jako HMAC-SHA256 z sekretem
--       QUOTE_KEY_HMAC_SECRET, bez wartości jawnej);
-- n   = liczba żądań w oknie; win = początek okna (sekundy epoki UTC);
-- exp = win + 48 h: retencja, wiersze z exp < teraz usuwa kod przy każdym liczeniu.
-- Tylko dodaje tabelę (wycofanie kodu nie wymaga cofania migracji).
CREATE TABLE IF NOT EXISTS rate_counters (
  k TEXT PRIMARY KEY,
  n INTEGER NOT NULL,
  win INTEGER NOT NULL,
  exp INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_counters_exp ON rate_counters(exp);
