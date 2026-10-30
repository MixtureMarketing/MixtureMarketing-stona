-- Synchronizacja leadów z Linearem (zespół LEA): kolejka, mapowanie lead → zadanie, ponowienia (functions/api/_linear.ts).
-- Osobna tabela, a nie kolumna w `leads`: UPDATE `leads` uruchamia wyzwalacz 0009 (updated_at), a GET /api/crm/leady
-- oddawałby lead jako „zmieniony”. Migracja jest idempotentna i nie zmienia istniejących tabel.
--
-- stan: kolejka | w_toku | wyslany | zablokowany
-- customer_request: 0 = do utworzenia (ponawia drenaż), 1 = utworzona, 2 = nie dotyczy (poczta prywatna albo duplikat)
CREATE TABLE IF NOT EXISTS linear_leady (
  lead_id          TEXT PRIMARY KEY REFERENCES leads(id) ON DELETE CASCADE,
  stan             TEXT NOT NULL DEFAULT 'kolejka',
  issue_id         TEXT,
  identifier       TEXT,
  url              TEXT,
  customer_request INTEGER NOT NULL DEFAULT 0,
  duplikat_of      TEXT,
  proby            INTEGER NOT NULL DEFAULT 0,
  ostatni_blad     TEXT,
  nastepna_proba   TEXT NOT NULL DEFAULT (datetime('now')),
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_linear_leady_kolejka ON linear_leady(stan, nastepna_proba);
