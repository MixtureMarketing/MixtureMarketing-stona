-- Mixture Marketing — moduł wycen (System Wycen), schemat rdzenia.
-- Wszystkie tabele `est_*` z docs/estimation/02-model-danych.md.
-- Dialekt przenośny (SQLite/D1; przyszła migracja do Postgresa przy komercjalizacji).
-- CREATE ... IF NOT EXISTS = idempotencja (migracja bezpieczna do ponownego uruchomienia).
-- Migracja WYŁĄCZNIE addytywna: nowe tabele est_*, zero zmian w users/leads/projects.
-- Dwie warstwy: (1) biblioteka wiedzy (edytowalna w panelu), (2) wyceny (snapshot-first).

PRAGMA foreign_keys = ON;

-- ============================================================================
-- WARSTWA BIBLIOTEKI (wiedza; edytowalna w panelu)
-- Kategorie obszarów A..G: A prezentacja, B logika/dane, C bezpieczeństwo,
-- D infrastruktura, E operacje, F marketing/analityka, G realizacja projektu.
-- ============================================================================

-- Obszary wyceny (fundament): np. frontend, observability, discovery
CREATE TABLE IF NOT EXISTS est_aspects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,          -- 'frontend', 'observability', 'discovery'...
  name TEXT NOT NULL,
  category TEXT NOT NULL,             -- 'A'..'G'
  description TEXT,                   -- co wchodzi / co NIE wchodzi (granice, 04)
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1
);

-- Poziomy obszaru 0..4 z widełkami godzin; poziom 0 zawsze istnieje (h=0)
CREATE TABLE IF NOT EXISTS est_levels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aspect_id INTEGER NOT NULL REFERENCES est_aspects(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,             -- 0..4
  name TEXT NOT NULL,
  description TEXT,
  hours_min REAL NOT NULL DEFAULT 0,
  hours_max REAL NOT NULL DEFAULT 0,
  UNIQUE(aspect_id, level)
);
CREATE INDEX IF NOT EXISTS idx_est_levels_aspect ON est_levels(aspect_id);

-- Archetypy = fundament technologiczny projektu (WooCommerce, Laravel...)
CREATE TABLE IF NOT EXISTS est_archetypes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,          -- 'wordpress','woocommerce','prestashop','woo_headless','sylius','medusa','laravel','headless'
  name TEXT NOT NULL,
  description TEXT,
  integration_mode TEXT NOT NULL DEFAULT 'custom',  -- 'platform'|'custom' → wybór taryfy godzin integracji
  is_active INTEGER DEFAULT 1
);

-- Domyślne poziomy per archetyp (is_locked = obszar ukryty dla archetypu)
CREATE TABLE IF NOT EXISTS est_archetype_defaults (
  archetype_id INTEGER NOT NULL REFERENCES est_archetypes(id) ON DELETE CASCADE,
  aspect_id INTEGER NOT NULL REFERENCES est_aspects(id) ON DELETE CASCADE,
  default_level INTEGER NOT NULL DEFAULT 0,
  is_locked INTEGER DEFAULT 0,        -- 1 = obszar zablokowany dla archetypu (np. RLS w WordPress)
  PRIMARY KEY (archetype_id, aspect_id)
);

-- Pytania biznesowe (język klienta) — warstwa 1 formularza
CREATE TABLE IF NOT EXISTS est_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,          -- 'users_concurrent', 'sla', 'has_erp', 'design_source'...
  text TEXT NOT NULL,                 -- treść w języku klienta
  help_text TEXT,                     -- podpowiedź dla prowadzącego spotkanie
  answer_type TEXT NOT NULL,          -- 'bool' | 'select' | 'multiselect' | 'number' | 'text'
  options_json TEXT,                  -- dla select/multiselect: [{value,label}]
  allow_unknown INTEGER DEFAULT 1,    -- odpowiedź „nie wiem" dozwolona (zasila Confidence)
  visibility TEXT NOT NULL DEFAULT 'internal',  -- 'internal' | 'public' (F4) | 'portal' (F4)
  unknown_weight REAL DEFAULT 1.0,    -- waga niewiadomej w Confidence (03)
  visible_if_json TEXT,               -- warunek widoczności (format reguł, 05)
  question_group TEXT,                -- 'projekt','uzytkownicy','integracje','marketing','realizacja'
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1
);

-- Reguły deterministyczne (warstwa 2): warunki na odpowiedziach → akcje
CREATE TABLE IF NOT EXISTS est_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL DEFAULT 'conditional',  -- furtka na 'points' w przyszłości (D5)
  condition_json TEXT NOT NULL,       -- drzewo warunków (05)
  actions_json TEXT NOT NULL,         -- [{type:'min_level'|'multiplier'|'suggest_module'|'suggest_integration'|'cost_item'|'archetype_warning'|'recommend_archetype', ...}]
  reason_template TEXT NOT NULL,      -- uzasadnienie z placeholderami odpowiedzi
  priority INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1
);

-- Moduły addytywne (Wishlist, Panel B2B...) z granicami includes/excludes
CREATE TABLE IF NOT EXISTS est_modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  includes TEXT,                      -- co moduł zawiera (granica z obszarami!)
  excludes TEXT,                      -- czego jawnie NIE zawiera
  hours_min REAL NOT NULL,
  hours_max REAL NOT NULL,
  risk TEXT DEFAULT 'low',            -- 'low'|'medium'|'high' (zasila Confidence)
  archetypes_json TEXT,               -- null = wszystkie; inaczej lista kodów archetypów
  is_active INTEGER DEFAULT 1
);

-- Integracje z systemami zewnętrznymi (dwie taryfy: platform vs custom)
CREATE TABLE IF NOT EXISTS est_integrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,             -- 'payments'|'shipping'|'erp'|'marketplace'|'feeds'|'marketing'|'other'
  hours_platform_min REAL,            -- taryfa: platforma z gotowym pluginem (Woo/Presta/Sylius z BitBag)
  hours_platform_max REAL,
  hours_custom_min REAL NOT NULL,     -- taryfa: implementacja custom (Laravel/Medusa/headless lub brak pluginu)
  hours_custom_max REAL NOT NULL,
  risk TEXT DEFAULT 'low',
  requirements TEXT,                  -- czego potrzeba od klienta (dostępy, licencje, dokumentacja)
  notes TEXT,
  is_active INTEGER DEFAULT 1
);
-- Wybór taryfy: est_archetypes.integration_mode ('platform'|'custom');
-- brak taryfy platform (NULL) ⇒ zawsze custom. Snapshot par godzin w est_quote_items.

-- Mnożniki ryzyka (wartości STAŁE — D6; addytywne, cap w est_params)
CREATE TABLE IF NOT EXISTS est_multipliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,          -- 'multi_tenant','new_tech','data_migration_risk','hard_deadline'
  name TEXT NOT NULL,
  value REAL NOT NULL,                -- 0.10 = +10%
  description TEXT,
  is_active INTEGER DEFAULT 1
);

-- Typy pozycji kosztowych (poza roboczogodzinami — D14)
CREATE TABLE IF NOT EXISTS est_cost_item_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,          -- 'travel','license','external'
  name TEXT NOT NULL,
  unit TEXT,                          -- 'km','szt','ryczałt'
  unit_price REAL,                    -- np. stawka za km; null = kwota wpisywana ręcznie
  is_active INTEGER DEFAULT 1
);

-- Parametry globalne silnika (klucz-wartość)
CREATE TABLE IF NOT EXISTS est_params (
  key TEXT PRIMARY KEY,               -- 'hourly_rate','multiplier_cap','buffer','offer_low_k','offer_high_k','rounding_pln','confidence_green','confidence_yellow'
  value TEXT NOT NULL,
  description TEXT
);

-- Stawki per kategoria (D8; brak wiersza = fallback do est_params.hourly_rate)
CREATE TABLE IF NOT EXISTS est_category_rates (
  category TEXT PRIMARY KEY,          -- 'A'..'G'
  hourly_rate REAL NOT NULL
);

-- ============================================================================
-- WARSTWA WYCEN (transakcyjna; snapshot-first)
-- Kody zamiast FK do biblioteki — biblioteka się zmienia, wyceny są wieczne (D19).
-- ============================================================================

CREATE TABLE IF NOT EXISTS est_quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT REFERENCES leads(id) ON DELETE SET NULL,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  client_name TEXT,
  archetype_code TEXT NOT NULL,       -- snapshot kodu WYBRANEGO archetypu (nie FK)
  archetype_recommended TEXT,         -- kod z reguł recommend_archetype (null = brak)
  archetype_reason TEXT,              -- obowiązkowy, gdy chosen ≠ recommended (Karta decyzji)
  status TEXT NOT NULL DEFAULT 'draft',  -- 'draft'|'review'|'sent'|'won'|'lost'|'closed'
  lost_reason TEXT,                   -- dane kalibracji handlowej
  hourly_rate REAL NOT NULL,          -- snapshot stawki globalnej
  category_rates_json TEXT,           -- snapshot stawek per kategoria (jeśli używane)
  params_json TEXT NOT NULL,          -- snapshot est_params użytych do obliczeń
  confidence INTEGER,                 -- 0..100
  confidence_breakdown_json TEXT,     -- składniki (audytowalność)
  totals_json TEXT,                   -- wynik agregacji (03): hours/price min-max, oferta, koszty
  engine_version TEXT NOT NULL,       -- wersja algorytmu agregacji (kod), np. '1.0'
  pdf_r2_key TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_est_quotes_status ON est_quotes(status);
CREATE INDEX IF NOT EXISTS idx_est_quotes_lead ON est_quotes(lead_id);
CREATE INDEX IF NOT EXISTS idx_est_quotes_created ON est_quotes(created_at);

CREATE TABLE IF NOT EXISTS est_quote_answers (
  quote_id INTEGER NOT NULL REFERENCES est_quotes(id) ON DELETE CASCADE,
  question_code TEXT NOT NULL,
  answer_json TEXT,                   -- wartość albo {"unknown":true}
  PRIMARY KEY (quote_id, question_code)
);

CREATE TABLE IF NOT EXISTS est_quote_aspects (
  quote_id INTEGER NOT NULL REFERENCES est_quotes(id) ON DELETE CASCADE,
  aspect_code TEXT NOT NULL,
  aspect_name TEXT NOT NULL,          -- snapshot
  category TEXT NOT NULL,
  suggested_level INTEGER NOT NULL,   -- wynik silnika
  chosen_level INTEGER NOT NULL,      -- po walidacji (= suggested jeśli brak zmiany)
  hours_min REAL NOT NULL,            -- snapshot widełek wybranego poziomu
  hours_max REAL NOT NULL,
  override_hours_min REAL,            -- ręczna korekta (wypełnia „dziury" między poziomami)
  override_hours_max REAL,
  override_reason TEXT,               -- obowiązkowy przy zmianie poziomu lub override
  rule_reasons_json TEXT,             -- uzasadnienia reguł, które podniosły poziom
  PRIMARY KEY (quote_id, aspect_code)
);

CREATE TABLE IF NOT EXISTS est_quote_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER NOT NULL REFERENCES est_quotes(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,            -- 'module'|'integration'|'cost'
  ref_code TEXT,                      -- kod z biblioteki (null dla pozycji ad hoc)
  name TEXT NOT NULL,                 -- snapshot
  hours_min REAL,                     -- moduły/integracje
  hours_max REAL,
  amount_pln REAL,                    -- pozycje kosztowe (cost): kwota
  qty REAL, unit TEXT, unit_price REAL,  -- np. dojazd: 2 × 400 km × stawka
  risk TEXT,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_est_quote_items_quote ON est_quote_items(quote_id);

CREATE TABLE IF NOT EXISTS est_quote_multipliers (
  quote_id INTEGER NOT NULL REFERENCES est_quotes(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,                 -- snapshot
  value REAL NOT NULL,                -- snapshot
  source TEXT NOT NULL,               -- 'rule'|'manual'
  PRIMARY KEY (quote_id, code)
);

CREATE TABLE IF NOT EXISTS est_actual_hours (
  quote_id INTEGER NOT NULL REFERENCES est_quotes(id) ON DELETE CASCADE,
  aspect_code TEXT NOT NULL,          -- także kody itemów: 'module:wishlist','integration:baselinker'
  hours REAL NOT NULL,
  note TEXT,
  recorded_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (quote_id, aspect_code)
);
