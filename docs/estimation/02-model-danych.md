# 02 — Model danych (D1 / SQLite)

Konwencje: prefiks `est_`, klucze INTEGER PK AUTOINCREMENT, daty TEXT ISO (`datetime('now')`),
bool jako INTEGER 0/1, struktury elastyczne jako TEXT JSON. Dialekt przenośny (przyszła migracja
do Postgresa przy komercjalizacji — jak w istniejących migracjach repo).

## Warstwa biblioteki (wiedza; edytowalna w panelu)

```sql
-- Kategorie obszarów: A..G (słownik w kodzie: A prezentacja, B logika/dane, C bezpieczeństwo,
-- D infrastruktura, E operacje, F marketing/analityka, G realizacja projektu)

CREATE TABLE est_aspects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,          -- 'frontend', 'observability', 'discovery'...
  name TEXT NOT NULL,                 -- nazwa WEWNĘTRZNA (Karta decyzji)
  category TEXT NOT NULL,             -- 'A'..'G'
  description TEXT,                   -- co wchodzi / co NIE wchodzi (granice, 04)
  client_name TEXT,                   -- 0007: polska nazwa KLIENCKA do oferty; null = fallback na name
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE est_levels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aspect_id INTEGER NOT NULL REFERENCES est_aspects(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,             -- 0..4; poziom 0 zawsze istnieje (h=0)
  name TEXT NOT NULL,
  description TEXT,                   -- opis techniczny WEWNĘTRZNY (Karta decyzji)
  client_description TEXT,            -- 0007: opis KLIENCKI promise-safe do oferty; null = fallback na description
  hours_min REAL NOT NULL DEFAULT 0,
  hours_max REAL NOT NULL DEFAULT 0,
  UNIQUE(aspect_id, level)
  -- Monotoniczność (walidacja edytora f2c): hours_min ściśle rosnące po poziomach ORAZ hours_max
  -- ściśle rosnące; NAKŁADANIE pasm (min[L+1] < max[L]) legalne.
);

CREATE TABLE est_archetypes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,          -- 'wordpress','woocommerce','prestashop','woo_headless','sylius','medusa','laravel','headless'
  name TEXT NOT NULL,
  description TEXT,
  integration_mode TEXT NOT NULL DEFAULT 'custom',  -- 'platform'|'custom' → wybór taryfy godzin integracji
  is_active INTEGER DEFAULT 1
);

CREATE TABLE est_archetype_defaults (
  archetype_id INTEGER NOT NULL REFERENCES est_archetypes(id) ON DELETE CASCADE,
  aspect_id INTEGER NOT NULL REFERENCES est_aspects(id) ON DELETE CASCADE,
  default_level INTEGER NOT NULL DEFAULT 0,
  is_locked INTEGER DEFAULT 0,        -- 1 = obszar zablokowany dla archetypu (np. RLS w WordPress)
  PRIMARY KEY (archetype_id, aspect_id)
);

CREATE TABLE est_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,          -- 'users_concurrent', 'sla', 'has_erp', 'design_source'...
  text TEXT NOT NULL,                 -- treść w języku klienta
  help_text TEXT,                     -- podpowiedź dla prowadzącego spotkanie
  answer_type TEXT NOT NULL,          -- 'bool' | 'select' | 'multiselect' | 'number' | 'text'
  options_json TEXT,                  -- dla select/multiselect: [{value,label}]
  allow_unknown INTEGER DEFAULT 1,    -- odpowiedź „nie wiem" dozwolona (zasila Confidence)
  visibility TEXT NOT NULL DEFAULT 'internal',  -- 'internal' (spotkanie/PM) | 'public' (kalkulator na stronie, F4) | 'portal' (uzupełnia klient po zalogowaniu, F4)
  unknown_weight REAL DEFAULT 1.0,    -- waga niewiadomej w Confidence (03)
  visible_if_json TEXT,               -- warunek widoczności (ten sam format co reguły, 05)
  question_group TEXT,                -- sekcja formularza: 'projekt','uzytkownicy','integracje','marketing','realizacja'
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE est_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL DEFAULT 'conditional',  -- furtka na 'points' w przyszłości (D5)
  condition_json TEXT NOT NULL,       -- format w 05
  actions_json TEXT NOT NULL,         -- [{type:'min_level',aspect:'x',level:n} | {type:'multiplier',code:'x'} | {type:'suggest_module',code:'x'} | {type:'suggest_integration',code:'x'} | {type:'cost_item',code:'x'} | {type:'archetype_warning',message:'...'} | {type:'recommend_archetype',code:'x',reason:'...'}]
  reason_template TEXT NOT NULL,      -- „SLA {sla}% wymaga redundancji" — uzasadnienie dla walidacji
  priority INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE est_modules (
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

CREATE TABLE est_integrations (
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
-- Wybór taryfy: archetyp deklaruje tryb integracji ('platform'|'custom') w est_archetypes.integration_mode;
-- brak taryfy platform (NULL) ⇒ zawsze custom. Snapshot w est_quote_items zapisuje wybraną parę godzin.

CREATE TABLE est_multipliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,          -- 'multi_tenant','new_tech','data_migration_risk','hard_deadline'
  name TEXT NOT NULL,
  value REAL NOT NULL,                -- 0.10 = +10%; wartości STAŁE (D6)
  description TEXT,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE est_cost_item_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,          -- 'travel','license','external'
  name TEXT NOT NULL,
  unit TEXT,                          -- 'km','szt','ryczałt'
  unit_price REAL,                    -- np. stawka za km; null = kwota wpisywana ręcznie
  is_active INTEGER DEFAULT 1
);

CREATE TABLE est_params (
  key TEXT PRIMARY KEY,               -- 'hourly_rate','multiplier_cap','buffer','offer_low_k','offer_high_k','rounding_pln','confidence_green','confidence_yellow'
  value TEXT NOT NULL,
  description TEXT
);

-- Stawki per kategoria (D8; nullable-by-absence, fallback do est_params.hourly_rate)
CREATE TABLE est_category_rates (
  category TEXT PRIMARY KEY,          -- 'A'..'G'
  hourly_rate REAL NOT NULL
);
```

## Warstwa wycen (transakcyjna; snapshot-first)

```sql
CREATE TABLE est_quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT REFERENCES leads(id) ON DELETE SET NULL,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  client_name TEXT,
  archetype_code TEXT NOT NULL,       -- snapshot kodu WYBRANEGO archetypu (nie FK)
  archetype_recommended TEXT,         -- kod z reguł recommend_archetype (null = brak dopasowanej reguły)
  archetype_reason TEXT,              -- obowiązkowy, gdy chosen ≠ recommended (Karta decyzji)
  status TEXT NOT NULL DEFAULT 'draft',  -- 'draft'|'review'|'sent'|'won'|'lost'|'closed'
  lost_reason TEXT,                   -- dane kalibracji handlowej
  hourly_rate REAL NOT NULL,          -- snapshot stawki globalnej
  category_rates_json TEXT,           -- snapshot stawek per kategoria (jeśli używane)
  params_json TEXT NOT NULL,          -- snapshot est_params użytych do obliczeń
  confidence INTEGER,                 -- 0..100
  confidence_breakdown_json TEXT,     -- składniki (audytowalność)
  totals_json TEXT,                   -- wynik agregacji (03): hours/price min-max, oferta min-max, koszty
  engine_version TEXT NOT NULL,       -- wersja algorytmu agregacji (kod), np. '1.0'
  pdf_r2_key TEXT,                    -- oferta PDF w R2 (quotes/{id}/oferta.pdf)
  card_r2_key TEXT,                   -- Karta decyzji PDF w R2 (dokumenty są DWA — D28)
  sent_at TEXT,                       -- daty przejść: bez nich F3 nie ma z czego liczyć
  won_at TEXT,                        -- skuteczności; updated_at mówi tylko o OSTATNIEJ zmianie
  lost_at TEXT,
  closed_at TEXT,                     -- 0008 (f3a): data zamknięcia projektu (won → closed)
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE est_quote_answers (
  quote_id INTEGER NOT NULL REFERENCES est_quotes(id) ON DELETE CASCADE,
  question_code TEXT NOT NULL,
  answer_json TEXT,                   -- wartość albo {"unknown":true}
  PRIMARY KEY (quote_id, question_code)
);

CREATE TABLE est_quote_aspects (
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
  override_reason TEXT,               -- obowiązkowy przy zmianie poziomu lub override (baza wiedzy decyzji)
  rule_reasons_json TEXT,             -- uzasadnienia reguł, które podniosły poziom
  level_name TEXT,                    -- 0005: snapshot nazwy wybranego poziomu (treść do dokumentów)
  level_description TEXT,             -- 0005: snapshot opisu WEWNĘTRZNEGO poziomu
  aspect_client_name TEXT,            -- 0007: snapshot client_name obszaru (buildOffer, fallback na aspect_name)
  level_client_description TEXT,      -- 0007: snapshot client_description poziomu (buildOffer, fallback na level_description)
  PRIMARY KEY (quote_id, aspect_code)
);
-- Treść snapshotu (level_*, *_client_*) zamraża się przy finalize — inwariant 3 dotyczy też
-- tekstów: edycja biblioteki nie zmienia dokumentów JUŻ WYSŁANEJ wyceny (D19; 0005/0007).

CREATE TABLE est_quote_items (
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

CREATE TABLE est_quote_multipliers (
  quote_id INTEGER NOT NULL REFERENCES est_quotes(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,                 -- snapshot
  value REAL NOT NULL,                -- snapshot
  source TEXT NOT NULL,               -- 'rule'|'manual'
  PRIMARY KEY (quote_id, code)
);

CREATE TABLE est_actual_hours (
  quote_id INTEGER NOT NULL REFERENCES est_quotes(id) ON DELETE CASCADE,
  aspect_code TEXT NOT NULL,          -- także kody itemów: 'module:wishlist','integration:baselinker'
  hours REAL NOT NULL,
  note TEXT,
  recorded_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (quote_id, aspect_code)
);
```

## Zasady spójności

1. **Snapshot kompletny:** po `quote_finalize` rekord wyceny jest samowystarczalny — da się odtworzyć ofertę bez tabel biblioteki. Edycje biblioteki nie dotykają wycen (D19).
2. **Wynik autorytatywny liczy serwer.** UI liczy podgląd tym samym kodem silnika, ale `totals_json` zapisuje wyłącznie Pages Function przy finalize (spójność, `engine_version`).
3. **Statusy:** `draft → review → sent → won|lost`; `won → closed` po wpisaniu godzin rzeczywistych. `lost` wymaga `lost_reason`. Edycja merytoryczna tylko w `draft`/`review`; `sent+` → zmiany przez duplikację wyceny (rewizja, `name` + „(rev 2)"). Każde przejście stempluje datę (`sent_at`/`won_at`/`lost_at`/`closed_at`) — to jedyne źródło dla kalibracji handlowej F3. **Godziny rzeczywiste (f3a) idą do `est_actual_hours`** (obszary po `aspect_code`, moduły/integracje po `ref_code`), NIE do snapshotu — endpoint `quote-close`, edytowalne też po `closed` (status bez zmian). **Legalność przejść pilnuje API** (`quote-status`), nie UI: `sent` wyłącznie z `review`, `won`/`lost` wyłącznie z `sent`, wszystko inne → 409. **`sent` wymaga obu dokumentów w R2** (`pdf_r2_key` i `card_r2_key` non-null) — patrz D30.
4. **Kody zamiast FK do biblioteki** w warstwie wycen — biblioteka może się zmieniać/znikać, wyceny są wieczne.
5. **Kalibracja (faza 3)** czyta `est_quote_aspects` (plan) × `est_actual_hours` (fakt) po `aspect_code` i wybranym poziomie; propozycje korekt widełek liczone per (aspect, level) przy n ≥ 3.

## Seed

Pliki `migrations/seed/`: `aspects.sql`, `levels.sql`, `questions.sql`, `rules.sql`, `archetypes.sql`, `modules.sql`, `integrations.sql`, `multipliers.sql`, `params.sql`. Treść: 04 (obszary/poziomy), 05 (pytania/reguły — v1 do uzupełnienia przez Jakuba wg szablonu), 06 (biblioteka — do korekty przez Jakuba). Seedy w git = wersjonowana baza wiedzy.
