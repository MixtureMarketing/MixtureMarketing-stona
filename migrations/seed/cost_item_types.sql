-- Seed: est_cost_item_types — typy pozycji kosztowych poza roboczogodzinami (docs/estimation/06, D14).
-- unit_price = NULL ⇒ kwota wpisywana ręcznie na wycenie.
-- DRAFT (do korekty Jakuba): travel.unit_price = 1,15 zł/km (przykład z doc 06 „ustal").
-- Idempotentny: ON CONFLICT(code) DO UPDATE.

INSERT INTO est_cost_item_types (code, name, unit, unit_price) VALUES
  ('travel', 'Dojazd na spotkanie/warsztat', 'km', 1.15),
  ('lodging', 'Nocleg przy wyjeździe', 'doba', NULL),
  ('license', 'Licencja/wtyczka premium pod projekt', 'szt', NULL),
  ('license_sylius_plus', 'Licencja Sylius Plus (cena zależna od GMV)', 'ryczałt/rok', NULL),
  ('models_3d', 'Modele 3D produktów (podwykonawca)', 'szt', NULL),
  ('stock', 'Zdjęcia stock / assety', 'ryczałt', NULL),
  ('external', 'Usługa zewnętrzna (pentest, tłumaczenia, certyfikat)', 'ryczałt', NULL)
ON CONFLICT(code) DO UPDATE SET
  name = excluded.name, unit = excluded.unit,
  unit_price = excluded.unit_price, is_active = 1;
