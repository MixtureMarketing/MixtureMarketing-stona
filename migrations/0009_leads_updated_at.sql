-- Czas ostatniej zmiany leada: Mixture CRM dociąga po nim leady, których wysyłka w tle (_crm.ts) nie przeszła,
-- także kolejne kroki formularza (GET /api/crm/leady). Wyzwalacze ustawiają go przy każdym INSERT i UPDATE,
-- więc żaden endpoint (contact-submit, admin/reply_lead, admin/convert_lead…) nie musi o nim pamiętać.
ALTER TABLE leads ADD COLUMN updated_at TEXT;
UPDATE leads SET updated_at = created_at WHERE updated_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_updated ON leads(updated_at);

CREATE TRIGGER IF NOT EXISTS leads_updated_at_insert AFTER INSERT ON leads
WHEN NEW.updated_at IS NULL
BEGIN
  UPDATE leads SET updated_at = coalesce(NEW.created_at, datetime('now')) WHERE id = NEW.id;
END;

-- WHEN: tylko gdy UPDATE sam nie ustawił updated_at; zapis z wyzwalacza zmienia updated_at, więc nie zapętla się.
CREATE TRIGGER IF NOT EXISTS leads_updated_at_update AFTER UPDATE ON leads
WHEN NEW.updated_at IS OLD.updated_at
BEGIN
  UPDATE leads SET updated_at = datetime('now') WHERE id = NEW.id;
END;
