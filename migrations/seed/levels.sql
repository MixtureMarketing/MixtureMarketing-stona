-- Seed: est_levels — poziomy 0..4 z widełkami godzin dla 31 obszarów.
-- Źródła: docs/estimation/SEED-LEVELS-DOCX.md (22 obszary z docx) + docs/estimation/04 (9 nowych/scalonych).
-- Idempotentny: ON CONFLICT(aspect_id, level) DO UPDATE. aspect_id rozwiązywany po code.
-- Zależność: uruchamiać PO aspects.sql.
--
-- KONWENCJA „X+" (górne tiery open-ended w źródle, np. frontend L4 „250+"):
--   reprezentowane jako hours_max = hours_min (nie zmyślamy górnej granicy).
--   Realny nadmiar wypełnia override_hours w wycenie z uzasadnieniem.
--   Jakub może skorygować górne granice L4 przy przeglądzie seedów.
-- Nazwy tierów ujednolicone (0 Brak / 1 Podstawowy / 2 Standardowy / 3 Zaawansowany / 4 Enterprise/Custom);
--   pełna charakterystyka techniczna w kolumnie description (używana w Karcie decyzji, 05).

-- ── Kategoria A: prezentacja ────────────────────────────────────────────────
INSERT INTO est_levels (aspect_id, level, name, description, hours_min, hours_max) VALUES
  ((SELECT id FROM est_aspects WHERE code='frontend'), 0, 'Brak / nie dotyczy', 'Projekt bez własnego frontendu (np. czysty backend/API)', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='frontend'), 1, 'Podstawowy', 'Gotowy szablon/theme, drobne dostosowania kolorystyki i treści, 1 język, brak animacji', 10, 25),
  ((SELECT id FROM est_aspects WHERE code='frontend'), 2, 'Standardowy', 'Custom UI wg projektu graficznego, pełny RWD, 1–2 języki, podstawowe animacje/przejścia', 40, 100),
  ((SELECT id FROM est_aspects WHERE code='frontend'), 3, 'Zaawansowany', 'Rozbudowany design system, komponenty wielokrotnego użytku, i18n 3+ języki, WCAG AA, PWA', 100, 250),
  ((SELECT id FROM est_aspects WHERE code='frontend'), 4, 'Enterprise / Custom', 'Pełny design system, mikrointerakcje, multi-brand, white-label, WCAG AAA', 250, 250),
  ((SELECT id FROM est_aspects WHERE code='apis'), 0, 'Brak / nie dotyczy', 'Brak własnego API', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='apis'), 1, 'Podstawowy', 'Kilka prostych endpointów REST/CRUD', 15, 30),
  ((SELECT id FROM est_aspects WHERE code='apis'), 2, 'Standardowy', 'Pełne REST API z dokumentacją i autoryzacją', 40, 80),
  ((SELECT id FROM est_aspects WHERE code='apis'), 3, 'Zaawansowany', 'GraphQL i/lub WebSockets, wersjonowanie API, rate limiting per endpoint', 80, 160),
  ((SELECT id FROM est_aspects WHERE code='apis'), 4, 'Enterprise / Custom', 'gRPC / architektura mikroserwisowa, event-driven, API gateway, kontrakty SLA', 160, 160),
  ((SELECT id FROM est_aspects WHERE code='emails'), 0, 'Brak / nie dotyczy', 'Nie dotyczy (brak transakcji/kont)', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='emails'), 1, 'Podstawowy', 'Standardowe maile systemu (WooCommerce/Presta default) + SPF/DKIM/DMARC', 2, 6),
  ((SELECT id FROM est_aspects WHERE code='emails'), 2, 'Standardowy', 'Własne szablony maili (branding), API wysyłkowe (Resend/Postmark/SMTP), test deliverability', 6, 16),
  ((SELECT id FROM est_aspects WHERE code='emails'), 3, 'Zaawansowany', 'Rozbudowane szablony per zdarzenie, załączniki (faktury), monitoring dostarczalności', 16, 32),
  ((SELECT id FROM est_aspects WHERE code='emails'), 4, 'Enterprise / Custom', 'Własna infrastruktura wysyłki, wielojęzyczne szablony, compliance', 32, 32)
ON CONFLICT(aspect_id, level) DO UPDATE SET
  name = excluded.name, description = excluded.description,
  hours_min = excluded.hours_min, hours_max = excluded.hours_max;

-- ── Kategoria B: logika / dane ──────────────────────────────────────────────
INSERT INTO est_levels (aspect_id, level, name, description, hours_min, hours_max) VALUES
  ((SELECT id FROM est_aspects WHERE code='backend_logic'), 0, 'Brak / nie dotyczy', 'Logika w całości po stronie platformy/klienta', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='backend_logic'), 1, 'Podstawowy', 'Prosta logika CRUD, brak złożonych procesów biznesowych', 20, 40),
  ((SELECT id FROM est_aspects WHERE code='backend_logic'), 2, 'Standardowy', 'Logika średniej złożoności: rabaty, promocje, prosty workflow zamówień', 60, 120),
  ((SELECT id FROM est_aspects WHERE code='backend_logic'), 3, 'Zaawansowany', 'Złożone reguły biznesowe, maszyny stanów, integracje płatności/logistyki', 120, 250),
  ((SELECT id FROM est_aspects WHERE code='backend_logic'), 4, 'Enterprise / Custom', 'Wielomodułowy system, złożone przepływy, integracje z ERP/WMS/PIM', 250, 250),
  ((SELECT id FROM est_aspects WHERE code='database'), 0, 'Brak / nie dotyczy', 'Baza w całości po stronie platformy/klienta', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='database'), 1, 'Podstawowy', 'Pojedyncza baza SQL, prosty schemat (do ~15 tabel)', 15, 30),
  ((SELECT id FROM est_aspects WHERE code='database'), 2, 'Standardowy', 'Baza SQL z relacjami średniej złożoności, migracje, indeksy, podstawowa optymalizacja', 40, 80),
  ((SELECT id FROM est_aspects WHERE code='database'), 3, 'Zaawansowany', 'Hybryda SQL+NoSQL, sharding/partycjonowanie, replikacja read/write', 80, 160),
  ((SELECT id FROM est_aspects WHERE code='database'), 4, 'Enterprise / Custom', 'Rozproszona architektura danych, multi-region, CQRS / event sourcing', 160, 160),
  ((SELECT id FROM est_aspects WHERE code='storage'), 0, 'Brak / nie dotyczy', 'Brak plików do przechowywania (czyste API/system)', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='storage'), 1, 'Podstawowy', 'Lokalny/bucket storage dla plików (np. zdjęcia produktów)', 4, 8),
  ((SELECT id FROM est_aspects WHERE code='storage'), 2, 'Standardowy', 'Object storage z CDN, wersjonowanie plików, limity i walidacja', 8, 16),
  ((SELECT id FROM est_aspects WHERE code='storage'), 3, 'Zaawansowany', 'Storage wielopoziomowy (hot/cold), automatyczna optymalizacja/kompresja', 16, 32),
  ((SELECT id FROM est_aspects WHERE code='storage'), 4, 'Enterprise / Custom', 'Storage rozproszony, retencja/compliance, replikacja DR', 32, 32),
  ((SELECT id FROM est_aspects WHERE code='caching'), 0, 'Brak / nie dotyczy', 'Cache po stronie platformy wystarczający', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='caching'), 1, 'Podstawowy', 'Cache HTTP/przeglądarki, podstawowy cache stron statycznych', 4, 10),
  ((SELECT id FROM est_aspects WHERE code='caching'), 2, 'Standardowy', 'Cache aplikacyjny (Redis/Memcached) dla zapytań/sesji', 16, 32),
  ((SELECT id FROM est_aspects WHERE code='caching'), 3, 'Zaawansowany', 'Wielowarstwowy cache (CDN + app + DB), strategie inwalidacji', 32, 64),
  ((SELECT id FROM est_aspects WHERE code='caching'), 4, 'Enterprise / Custom', 'Cache rozproszony, cache warming, złożone strategie invalidacji', 64, 64)
ON CONFLICT(aspect_id, level) DO UPDATE SET
  name = excluded.name, description = excluded.description,
  hours_min = excluded.hours_min, hours_max = excluded.hours_max;

-- ── Kategoria C: bezpieczeństwo ─────────────────────────────────────────────
INSERT INTO est_levels (aspect_id, level, name, description, hours_min, hours_max) VALUES
  ((SELECT id FROM est_aspects WHERE code='authentication'), 0, 'Brak / nie dotyczy', 'Brak logowania w projekcie', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='authentication'), 1, 'Podstawowy', 'Email/hasło, proste logowanie, reset hasła', 8, 16),
  ((SELECT id FROM est_aspects WHERE code='authentication'), 2, 'Standardowy', 'Logowanie social/OAuth, weryfikacja email, reset hasła', 24, 48),
  ((SELECT id FROM est_aspects WHERE code='authentication'), 3, 'Zaawansowany', 'MFA/2FA, magic links, zarządzanie sesjami wielourządzeniowe', 48, 96),
  ((SELECT id FROM est_aspects WHERE code='authentication'), 4, 'Enterprise / Custom', 'SSO / SAML enterprise, zaawansowane compliance i audyt logowań', 96, 96),
  ((SELECT id FROM est_aspects WHERE code='permissions'), 0, 'Brak / nie dotyczy', 'Brak zróżnicowanych uprawnień', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='permissions'), 1, 'Podstawowy', 'Role admin/user, brak granularnych uprawnień', 6, 12),
  ((SELECT id FROM est_aspects WHERE code='permissions'), 2, 'Standardowy', 'RBAC z kilkoma rolami i granularnymi uprawnieniami per moduł', 20, 40),
  ((SELECT id FROM est_aspects WHERE code='permissions'), 3, 'Zaawansowany', 'RBAC + ABAC, uprawnienia kontekstowe, multi-tenant', 40, 80),
  ((SELECT id FROM est_aspects WHERE code='permissions'), 4, 'Enterprise / Custom', 'Złożony model uprawnień, delegacja, pełny audyt zmian uprawnień', 80, 80),
  ((SELECT id FROM est_aspects WHERE code='security'), 0, 'Brak / nie dotyczy', 'Zakres bezpieczeństwa po stronie klienta/platformy', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='security'), 1, 'Podstawowy', 'HTTPS, podstawy OWASP Top 10, walidacja danych wejściowych', 10, 20),
  ((SELECT id FROM est_aspects WHERE code='security'), 2, 'Standardowy', 'CSP, sanityzacja, szyfrowanie danych wrażliwych, podstawowy pentest', 24, 48),
  ((SELECT id FROM est_aspects WHERE code='security'), 3, 'Zaawansowany', 'Pełny audyt bezpieczeństwa, WAF, szyfrowanie end-to-end, zgodność RODO', 48, 96),
  ((SELECT id FROM est_aspects WHERE code='security'), 4, 'Enterprise / Custom', 'Certyfikacje (ISO 27001/SOC2/PCI-DSS), regularne pentesty, bug bounty', 96, 96),
  ((SELECT id FROM est_aspects WHERE code='rls'), 0, 'Brak / nie dotyczy', 'Brak danych wrażliwych per-user, jeden zestaw danych dla wszystkich', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='rls'), 1, 'Podstawowy', 'RLS na 1–2 kluczowych tabelach', 6, 12),
  ((SELECT id FROM est_aspects WHERE code='rls'), 2, 'Standardowy', 'RLS na większości tabel z danymi użytkownika', 16, 32),
  ((SELECT id FROM est_aspects WHERE code='rls'), 3, 'Zaawansowany', 'RLS multi-tenant z hierarchią ról/organizacji', 32, 64),
  ((SELECT id FROM est_aspects WHERE code='rls'), 4, 'Enterprise / Custom', 'Złożone polityki dynamiczne, pełny audyt dostępu do danych', 64, 64)
ON CONFLICT(aspect_id, level) DO UPDATE SET
  name = excluded.name, description = excluded.description,
  hours_min = excluded.hours_min, hours_max = excluded.hours_max;

-- ── Kategoria D: infrastruktura ─────────────────────────────────────────────
INSERT INTO est_levels (aspect_id, level, name, description, hours_min, hours_max) VALUES
  ((SELECT id FROM est_aspects WHERE code='infrastructure'), 0, 'Brak / nie dotyczy', 'Infrastrukturę dostarcza i utrzymuje klient', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='infrastructure'), 1, 'Podstawowy', 'Hosting współdzielony / PaaS / pojedynczy VPS z podstawową konfiguracją', 3, 8),
  ((SELECT id FROM est_aspects WHERE code='infrastructure'), 2, 'Standardowy', 'VPS/serwer z pełną konfiguracją, konteneryzacja (Docker), środowisko stage', 12, 32),
  ((SELECT id FROM est_aspects WHERE code='infrastructure'), 3, 'Zaawansowany', 'Środowiska dev/stage/prod, orkiestracja, autoskalowanie, IaC podstawowe', 40, 80),
  ((SELECT id FROM est_aspects WHERE code='infrastructure'), 4, 'Enterprise / Custom', 'Multi-cloud/hybrid, pełne IaC, hosting wieloregionalny', 80, 80),
  ((SELECT id FROM est_aspects WHERE code='cdn'), 0, 'Brak / nie dotyczy', 'Ruch lokalny, minimalna ilość statyków', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='cdn'), 1, 'Podstawowy', 'CDN dla statyków (obrazy/CSS/JS), jeden dostawca', 4, 8),
  ((SELECT id FROM est_aspects WHERE code='cdn'), 2, 'Standardowy', 'CDN + optymalizacja obrazów, reguły cache per typ zasobu', 8, 16),
  ((SELECT id FROM est_aspects WHERE code='cdn'), 3, 'Zaawansowany', 'Multi-region CDN, edge caching, automatyzacja purge', 16, 32),
  ((SELECT id FROM est_aspects WHERE code='cdn'), 4, 'Enterprise / Custom', 'Multi-CDN z failover, edge computing/functions', 32, 32),
  ((SELECT id FROM est_aspects WHERE code='load_balancing'), 0, 'Brak / nie dotyczy', 'Pojedynczy serwer wystarczający', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='load_balancing'), 1, 'Podstawowy', 'Prosty load balancer (usługa chmurowa)', 4, 8),
  ((SELECT id FROM est_aspects WHERE code='load_balancing'), 2, 'Standardowy', 'LB z health checks, podstawowe autoskalowanie', 12, 24),
  ((SELECT id FROM est_aspects WHERE code='load_balancing'), 3, 'Zaawansowany', 'LB wielowarstwowy, sticky sessions, geo-routing', 24, 48),
  ((SELECT id FROM est_aspects WHERE code='load_balancing'), 4, 'Enterprise / Custom', 'Globalny LB, multi-region active-active', 48, 48),
  ((SELECT id FROM est_aspects WHERE code='rate_limiting'), 0, 'Brak / nie dotyczy', 'Brak ryzyka nadużyć, ruch wewnętrzny', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='rate_limiting'), 1, 'Podstawowy', 'Proste limity per IP na poziomie serwera/proxy', 3, 6),
  ((SELECT id FROM est_aspects WHERE code='rate_limiting'), 2, 'Standardowy', 'Limity per użytkownik/klucz API, różne progi per endpoint', 8, 16),
  ((SELECT id FROM est_aspects WHERE code='rate_limiting'), 3, 'Zaawansowany', 'Dynamiczne limity, throttling, quota billing', 16, 32),
  ((SELECT id FROM est_aspects WHERE code='rate_limiting'), 4, 'Enterprise / Custom', 'Distributed rate limiting, polityki per klient/tier', 32, 32),
  ((SELECT id FROM est_aspects WHERE code='high_availability'), 0, 'Brak / nie dotyczy', 'Pojedynczy punkt awarii akceptowalny', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='high_availability'), 1, 'Podstawowy', 'Monitoring uptime + automatyczny restart', 4, 8),
  ((SELECT id FROM est_aspects WHERE code='high_availability'), 2, 'Standardowy', 'Redundancja na poziomie aplikacji (min. 2 instancje)', 16, 32),
  ((SELECT id FROM est_aspects WHERE code='high_availability'), 3, 'Zaawansowany', 'HA na wszystkich warstwach (app/DB/storage), auto-failover', 40, 80),
  ((SELECT id FROM est_aspects WHERE code='high_availability'), 4, 'Enterprise / Custom', 'SLA 99,99%+, multi-region active-active', 80, 80),
  ((SELECT id FROM est_aspects WHERE code='disaster_recovery'), 0, 'Brak / nie dotyczy', 'Tylko podstawowe backupy bez planu DR', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='disaster_recovery'), 1, 'Podstawowy', 'Regularne backupy + spisany plan odtworzenia', 6, 12),
  ((SELECT id FROM est_aspects WHERE code='disaster_recovery'), 2, 'Standardowy', 'Backup + testy odtwarzania, zdefiniowane RPO/RTO', 16, 32),
  ((SELECT id FROM est_aspects WHERE code='disaster_recovery'), 3, 'Zaawansowany', 'Replikacja do drugiej lokalizacji, automatyczny failover', 40, 80),
  ((SELECT id FROM est_aspects WHERE code='disaster_recovery'), 4, 'Enterprise / Custom', 'Pełny DR z regularnym testowaniem, RPO < 1h', 80, 80)
ON CONFLICT(aspect_id, level) DO UPDATE SET
  name = excluded.name, description = excluded.description,
  hours_min = excluded.hours_min, hours_max = excluded.hours_max;

-- ── Kategoria E: operacje ───────────────────────────────────────────────────
INSERT INTO est_levels (aspect_id, level, name, description, hours_min, hours_max) VALUES
  ((SELECT id FROM est_aspects WHERE code='cicd'), 0, 'Brak / nie dotyczy', 'Deploy/infrastruktura po stronie klienta', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='cicd'), 1, 'Podstawowy', 'Prosty pipeline build + deploy', 6, 12),
  ((SELECT id FROM est_aspects WHERE code='cicd'), 2, 'Standardowy', 'Pipeline z testami automatycznymi, środowisko staging', 16, 32),
  ((SELECT id FROM est_aspects WHERE code='cicd'), 3, 'Zaawansowany', 'Pełny CI/CD z testami E2E, canary/blue-green deploy', 32, 64),
  ((SELECT id FROM est_aspects WHERE code='cicd'), 4, 'Enterprise / Custom', 'Multi-środowiskowy pipeline, automatyczne rollbacki, compliance gates', 64, 64),
  ((SELECT id FROM est_aspects WHERE code='observability'), 0, 'Brak / nie dotyczy', 'Nie dotyczy (infra i monitoring po stronie klienta)', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='observability'), 1, 'Podstawowy', 'Logi aplikacyjne + monitoring uptime + logi błędów', 3, 8),
  ((SELECT id FROM est_aspects WHERE code='observability'), 2, 'Standardowy', 'Error tracking (Sentry) z alertami + centralne logi + dashboard infrastruktury', 12, 28),
  ((SELECT id FROM est_aspects WHERE code='observability'), 3, 'Zaawansowany', 'Strukturalne logi z korelacją, APM, alerty proaktywne, SLA reakcji', 28, 56),
  ((SELECT id FROM est_aspects WHERE code='observability'), 4, 'Enterprise / Custom', 'Pełna observability (traces/metrics/logs), retencja compliance, SIEM, on-call', 56, 56)
ON CONFLICT(aspect_id, level) DO UPDATE SET
  name = excluded.name, description = excluded.description,
  hours_min = excluded.hours_min, hours_max = excluded.hours_max;

-- ── Kategoria F: marketing / analityka ──────────────────────────────────────
INSERT INTO est_levels (aspect_id, level, name, description, hours_min, hours_max) VALUES
  ((SELECT id FROM est_aspects WHERE code='analytics'), 0, 'Brak / nie dotyczy', 'Brak wymogu trackingu marketingowego', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='analytics'), 1, 'Podstawowy', 'GA4 + GTM, podstawowa konfiguracja, kilka zdarzeń standardowych', 4, 8),
  ((SELECT id FROM est_aspects WHERE code='analytics'), 2, 'Standardowy', 'GA4 Ecommerce, data layer, 5–10 zdarzeń custom, 1–2 platformy reklamowe', 12, 24),
  ((SELECT id FROM est_aspects WHERE code='analytics'), 3, 'Zaawansowany', 'Rozbudowany data layer, cross-domain tracking, wiele platform (Meta/TikTok/LinkedIn)', 24, 48),
  ((SELECT id FROM est_aspects WHERE code='analytics'), 4, 'Enterprise / Custom', 'CDP (Customer Data Platform), atrybucja multi-touch, integracja z BI', 48, 48),
  ((SELECT id FROM est_aspects WHERE code='sst'), 0, 'Brak / nie dotyczy', 'Tracking wyłącznie client-side', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='sst'), 1, 'Podstawowy', 'sGTM — jeden tag przekierowany server-side', 8, 16),
  ((SELECT id FROM est_aspects WHERE code='sst'), 2, 'Standardowy', 'sGTM + 1–2 CAPI (Meta/Google Ads), deduplikacja zdarzeń', 20, 40),
  ((SELECT id FROM est_aspects WHERE code='sst'), 3, 'Zaawansowany', 'Pełna migracja trackingu server-side, wiele CAPI, first-party domain, monitoring jakości danych', 40, 80),
  ((SELECT id FROM est_aspects WHERE code='sst'), 4, 'Enterprise / Custom', 'Własna infrastruktura server-side, zaawansowana walidacja i wzbogacanie danych', 80, 80),
  ((SELECT id FROM est_aspects WHERE code='seo'), 0, 'Brak / nie dotyczy', 'System wewnętrzny / poza zakresem', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='seo'), 1, 'Podstawowy', 'Meta/tagi, sitemap.xml, robots.txt, podstawowa struktura URL', 6, 12),
  ((SELECT id FROM est_aspects WHERE code='seo'), 2, 'Standardowy', 'schema.org (produkt/organizacja), optymalizacja Core Web Vitals', 16, 32),
  ((SELECT id FROM est_aspects WHERE code='seo'), 3, 'Zaawansowany', 'Pełny audyt, migracja z zachowaniem link equity, rozbudowane dane strukturalne, hreflang', 32, 64),
  ((SELECT id FROM est_aspects WHERE code='seo'), 4, 'Enterprise / Custom', 'Wielorynkowe SEO, programmatic SEO, złożona architektura informacji', 64, 64),
  ((SELECT id FROM est_aspects WHERE code='sem'), 0, 'Brak / nie dotyczy', 'Klient nie prowadzi kampanii płatnych', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='sem'), 1, 'Podstawowy', 'Konto Google Ads, podstawowa konwersja, prosty setup', 4, 8),
  ((SELECT id FROM est_aspects WHERE code='sem'), 2, 'Standardowy', 'Merchant Center + feed produktowy, kampanie Shopping/Performance Max', 12, 24),
  ((SELECT id FROM est_aspects WHERE code='sem'), 3, 'Zaawansowany', 'Zaawansowany feed (custom labels, dynamic remarketing), integracja z CRM/offline conversions', 24, 48),
  ((SELECT id FROM est_aspects WHERE code='sem'), 4, 'Enterprise / Custom', 'Setup multi-market feed management (bez prowadzenia — abonament)', 48, 48),
  ((SELECT id FROM est_aspects WHERE code='geo'), 0, 'Brak / nie dotyczy', 'Poza zakresem projektu', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='geo'), 1, 'Podstawowy', 'Podstawowe dane strukturalne + llms.txt, treści FAQ w formacie przyjaznym AI', 4, 8),
  ((SELECT id FROM est_aspects WHERE code='geo'), 2, 'Standardowy', 'Rozbudowane structured data (FAQ/HowTo/Product), optymalizacja treści pod cytowanie', 12, 24),
  ((SELECT id FROM est_aspects WHERE code='geo'), 3, 'Zaawansowany', 'Setup strategii treści E-E-A-T pod AI Overviews + konfiguracja monitoringu cytowań', 24, 48),
  ((SELECT id FROM est_aspects WHERE code='geo'), 4, 'Enterprise / Custom', 'Setup optymalizacji dla wielu silników AI, framework testów treści (prowadzenie — abonament)', 48, 48),
  ((SELECT id FROM est_aspects WHERE code='consent'), 0, 'Brak / nie dotyczy', 'System wewnętrzny bez trackingu marketingowego', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='consent'), 1, 'Podstawowy', 'Prosty banner cookie, podstawowa blokada skryptów', 4, 8),
  ((SELECT id FROM est_aspects WHERE code='consent'), 2, 'Standardowy', 'CMP z Google Consent Mode v2, kategoryzacja skryptów', 8, 16),
  ((SELECT id FROM est_aspects WHERE code='consent'), 3, 'Zaawansowany', 'Multi-jurysdykcja (RODO+CCPA), geolokalizacja zgód, integracja server-side', 16, 32),
  ((SELECT id FROM est_aspects WHERE code='consent'), 4, 'Enterprise / Custom', 'Consent management dla wielu marek/domen, pełny audyt compliance', 32, 32)
ON CONFLICT(aspect_id, level) DO UPDATE SET
  name = excluded.name, description = excluded.description,
  hours_min = excluded.hours_min, hours_max = excluded.hours_max;

-- ── Kategoria G: realizacja projektu ────────────────────────────────────────
INSERT INTO est_levels (aspect_id, level, name, description, hours_min, hours_max) VALUES
  ((SELECT id FROM est_aspects WHERE code='discovery'), 0, 'Brak / nie dotyczy', 'Zakres w pełni jasny / klient dostarczył specyfikację', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='discovery'), 1, 'Podstawowy', 'Godzinny call (Meet), notatka z ustaleń', 1, 3),
  ((SELECT id FROM est_aspects WHERE code='discovery'), 2, 'Standardowy', '2–3 spotkania online, spisanie wymagań, mapa funkcji', 6, 16),
  ((SELECT id FROM est_aspects WHERE code='discovery'), 3, 'Zaawansowany', 'Warsztat stacjonarny 1 dzień, analiza procesów, specyfikacja', 16, 32),
  ((SELECT id FROM est_aspects WHERE code='discovery'), 4, 'Enterprise / Custom', 'Warsztaty wielodniowe, analiza konkurencji, pełna specyfikacja z architekturą', 40, 40),
  ((SELECT id FROM est_aspects WHERE code='uxui'), 0, 'Brak / nie dotyczy', 'Klient dostarcza gotowy projekt graficzny', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='uxui'), 1, 'Podstawowy', 'Gotowy motyw/szablon; dopasowanie kolorów/typografii do istniejącej identyfikacji', 4, 10),
  ((SELECT id FROM est_aspects WHERE code='uxui'), 2, 'Standardowy', 'Projekt kluczowych widoków na bazie istniejącej identyfikacji', 16, 40),
  ((SELECT id FROM est_aspects WHERE code='uxui'), 3, 'Zaawansowany', 'Pełny projekt UI wszystkich widoków + makiety UX; identyfikacja istnieje', 40, 100),
  ((SELECT id FROM est_aspects WHERE code='uxui'), 4, 'Enterprise / Custom', 'Od zera: identyfikacja wizualna + design system + pełny projekt', 100, 100),
  ((SELECT id FROM est_aspects WHERE code='qa'), 0, 'Brak / nie dotyczy', 'Tylko testy deweloperskie w trakcie prac (wliczone w obszary)', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='qa'), 1, 'Podstawowy', 'Manualny smoke test przed oddaniem + poprawki', 4, 8),
  ((SELECT id FROM est_aspects WHERE code='qa'), 2, 'Standardowy', 'Scenariusze testowe kluczowych ścieżek, testy na urządzeniach, runda UAT z klientem', 12, 32),
  ((SELECT id FROM est_aspects WHERE code='qa'), 3, 'Zaawansowany', 'Testy automatyczne E2E krytycznych ścieżek (Playwright/Cypress), regresja', 32, 64),
  ((SELECT id FROM est_aspects WHERE code='qa'), 4, 'Enterprise / Custom', 'Pełny plan testów, automatyzacja, testy wydajnościowe/obciążeniowe', 64, 64),
  ((SELECT id FROM est_aspects WHERE code='data_migration'), 0, 'Brak / nie dotyczy', 'Brak danych do przeniesienia (nowy projekt)', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='data_migration'), 1, 'Podstawowy', 'Import prostych danych z CSV/XML (produkty bez wariantów, strony)', 4, 12),
  ((SELECT id FROM est_aspects WHERE code='data_migration'), 2, 'Standardowy', 'Migracja katalogu + klientów z istniejącego systemu, mapowanie pól, przekierowania 301', 16, 40),
  ((SELECT id FROM est_aspects WHERE code='data_migration'), 3, 'Zaawansowany', 'Migracja relacyjna (zamówienia, historia, warianty), skrypty, weryfikacja spójności', 40, 100),
  ((SELECT id FROM est_aspects WHERE code='data_migration'), 4, 'Enterprise / Custom', 'Setki tysięcy rekordów, dane wrażliwe/szyfrowane, migracja etapowa z oknem przełączenia', 100, 100),
  ((SELECT id FROM est_aspects WHERE code='content'), 0, 'Brak / nie dotyczy', 'Klient wprowadza treści sam (po szkoleniu → golive)', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='content'), 1, 'Podstawowy', 'Wprowadzenie treści podstawowych stron (do ~10 podstron)', 3, 8),
  ((SELECT id FROM est_aspects WHERE code='content'), 2, 'Standardowy', 'Konfiguracja katalogu: do ~100 produktów/wpisów z materiałów klienta', 8, 24),
  ((SELECT id FROM est_aspects WHERE code='content'), 3, 'Zaawansowany', 'Duży katalog (100–1000 pozycji), import + ręczne uzupełnienia, optymalizacja opisów', 24, 64),
  ((SELECT id FROM est_aspects WHERE code='content'), 4, 'Enterprise / Custom', 'Masowy content: >1000 pozycji, wielojęzyczność, redakcja/adaptacja treści', 64, 64),
  ((SELECT id FROM est_aspects WHERE code='golive'), 0, 'Brak / nie dotyczy', 'Wdraża klient / inny wykonawca', 0, 0),
  ((SELECT id FROM est_aspects WHERE code='golive'), 1, 'Podstawowy', 'Wdrożenie produkcyjne, DNS/SSL, przekazanie dostępów', 2, 6),
  ((SELECT id FROM est_aspects WHERE code='golive'), 2, 'Standardowy', 'Szkolenie klienta (1–2 sesje), instrukcja obsługi, tydzień opieki powdrożeniowej', 6, 16),
  ((SELECT id FROM est_aspects WHERE code='golive'), 3, 'Zaawansowany', 'Wdrożenie z migracją ruchu (301, monitoring pozycji), 2–4 tyg. hypercare, SLA reakcji', 16, 40),
  ((SELECT id FROM est_aspects WHERE code='golive'), 4, 'Enterprise / Custom', 'Wdrożenie etapowe/blue-green, plan rollbacku, dedykowany dyżur', 40, 40)
ON CONFLICT(aspect_id, level) DO UPDATE SET
  name = excluded.name, description = excluded.description,
  hours_min = excluded.hours_min, hours_max = excluded.hours_max;
