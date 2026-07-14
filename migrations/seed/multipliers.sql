-- Seed: est_multipliers — mnożniki ryzyka (docs/estimation/03, D6).
-- Wartości STAŁE (nie widełki). Addytywne, cap globalny w est_params.multiplier_cap.
-- Idempotentny: ON CONFLICT(code) DO UPDATE.

INSERT INTO est_multipliers (code, name, value, description) VALUES
  ('multi_tenant', 'Multi-tenant / white-label (koordynacja)', 0.10, 'Wiele organizacji/marek na jednej instancji — narzut koordynacji.'),
  ('new_tech', 'Nowa technologia w zespole', 0.15, 'Stack poza rutyną zespołu (np. pierwszy Sylius/Medusa).'),
  ('data_migration_risk', 'Ryzyko jakości danych źródłowych', 0.10, 'Migracja danych bez znanej jakości źródła (brak próbki/dostępu).'),
  ('hard_deadline', 'Sztywny krótki deadline / praca równoległa', 0.10, 'Deadline wymuszający równoległość i narzut synchronizacji.')
ON CONFLICT(code) DO UPDATE SET
  name = excluded.name, value = excluded.value,
  description = excluded.description, is_active = 1;
