-- Seed: est_params — parametry globalne silnika (docs/estimation/03).
-- Wartości przechowywane jako TEXT. Idempotentny: ON CONFLICT(key) DO UPDATE.
-- D8: stawka globalna 50 zł/h (edytowalna); stawki per kategoria w est_category_rates
--     (brak wierszy = fallback do hourly_rate — v1 nie seeduje kategorii).

INSERT INTO est_params (key, value, description) VALUES
  ('hourly_rate', '50', 'Globalna stawka godzinowa [zł] (D8).'),
  ('multiplier_cap', '0.40', 'Górny limit sumy mnożników ryzyka (D6): +40% ponad bazę.'),
  ('buffer', '0.10', 'Bufor kontyngencyjny doliczany na końcu (krok 4): +10%.'),
  ('offer_low_k', '0.20', 'Współczynnik zawężenia dolnej granicy oferty (krok 6).'),
  ('offer_high_k', '0.30', 'Współczynnik zawężenia górnej granicy oferty (krok 6).'),
  ('rounding_pln', '100', 'Zaokrąglenie widełek ofertowych w górę [zł].'),
  ('confidence_green', '80', 'Próg Confidence: ≥ zielony („możesz podać widełki").'),
  ('confidence_yellow', '60', 'Próg Confidence: ≥ żółty („widełki z zastrzeżeniami"); poniżej czerwony.')
ON CONFLICT(key) DO UPDATE SET
  value = excluded.value, description = excluded.description;
