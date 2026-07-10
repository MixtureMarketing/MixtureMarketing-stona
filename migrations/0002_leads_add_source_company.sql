-- Reconcile: baza mixture-db istniała już ze schematem z lutego 2026 (era gałęzi
-- cloudflare-migration), w którym tabela `leads` NIE miała kolumn `source` ani `company`.
-- 0001_init.sql (CREATE TABLE IF NOT EXISTS) był więc no-opem na tej bazie.
-- Ta migracja dorównuje istniejącą tabelę do schematu 0001 bez utraty danych.
--
-- Uwaga: ALTER ... ADD COLUMN rzuci błąd, jeśli kolumna już istnieje (świeża baza
-- z 0001 już je ma) — uruchamiać tylko na starej bazie.

ALTER TABLE leads ADD COLUMN source TEXT DEFAULT 'website';   -- 'website' | 'calculator' | 'audit'
ALTER TABLE leads ADD COLUMN company TEXT;
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
