-- Mixture Marketing — D1 schema (init)
-- Portowane z scripts/db_backup/mysql_schema.sql (MySQL) do dialektu SQLite (D1).
-- Trzymane w przenośnym SQL, żeby ewentualna migracja do Postgresa była łatwa.
-- Kolejność tabel = kolejność zależności FK (users → reszta).

PRAGMA foreign_keys = ON;

-- 1. Użytkownicy (klienci + admini)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  company_name TEXT,
  role TEXT DEFAULT 'client',            -- 'client' | 'admin'
  is_active INTEGER DEFAULT 1,
  session_token TEXT,
  session_expires TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_session ON users(session_token);

-- 2. Leady (formularz kontaktowy, kalkulator, audyt)
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  service_type TEXT,
  package_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  name TEXT,
  company TEXT,
  website TEXT,
  budget TEXT,
  message TEXT,
  details TEXT,                          -- JSON
  source TEXT DEFAULT 'website',         -- 'website' | 'calculator' | 'audit'
  source_url TEXT,
  status TEXT DEFAULT 'new',             -- 'new' | 'contacted' | 'converted'
  current_step INTEGER DEFAULT 1,
  email_abandoned_1_sent INTEGER DEFAULT 0,
  email_abandoned_2_sent INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);

-- 3. Projekty
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  budget TEXT,
  drive_link TEXT,
  next_milestone TEXT,
  next_milestone_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 4. Kamienie milowe (timeline projektu)
CREATE TABLE IF NOT EXISTS milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT,
  status TEXT DEFAULT 'pending',         -- 'pending' | 'accepted' | 'corrections'
  feedback TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 5. Wiadomości (czat klient ↔ admin)
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_id INTEGER,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender_type TEXT NOT NULL,             -- 'client' | 'admin'
  is_read INTEGER DEFAULT 0,
  notification_sent INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id);

-- 6. Dokumenty / faktury (pliki w R2, metadane tutaj)
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,               -- klucz obiektu w R2
  type TEXT NOT NULL,                    -- 'invoice' | 'document'
  subtype TEXT DEFAULT 'other',
  created_at TEXT DEFAULT (datetime('now'))
);

-- 7. Tokeny magic-link
CREATE TABLE IF NOT EXISTS auth_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_auth_token ON auth_tokens(token);

-- 8. Logi
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  context TEXT,                          -- JSON
  created_at TEXT DEFAULT (datetime('now'))
);

-- 9. Metryki wydajności (RUM → panel admina)
CREATE TABLE IF NOT EXISTS performance_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT NOT NULL,
  metric_value REAL,
  page_url TEXT,
  user_agent TEXT,
  device_type TEXT,                      -- 'mobile' | 'desktop'
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_perf_name ON performance_metrics(metric_name);
