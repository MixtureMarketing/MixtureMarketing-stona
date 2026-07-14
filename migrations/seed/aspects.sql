-- Seed: est_aspects — 31 obszarów wyceny (docs/estimation/04).
-- Idempotentny: ON CONFLICT(code) DO UPDATE (id stabilne dla FK z est_levels / est_archetype_defaults).
-- Kategorie: A prezentacja, B logika/dane, C bezpieczeństwo, D infrastruktura,
--            E operacje, F marketing/analityka, G realizacja projektu.
-- Zależności: brak (uruchamiać PRZED levels.sql i archetypes.sql).

INSERT INTO est_aspects (code, name, category, description, sort_order) VALUES
  ('frontend', 'Frontend', 'A', 'Implementacja UI (theme/custom, RWD, i18n, animacje, WCAG). Nie wchodzi tu: projektowanie graficzne (obszar uxui).', 10),
  ('apis', 'APIs (własne API)', 'A', 'Własne API projektu (REST/GraphQL/WS, dokumentacja, wersjonowanie). Nie wchodzi tu: integracje z systemami zewnętrznymi (biblioteka integracji) — obszar nie rośnie od ich liczby (D4).', 20),
  ('emails', 'E-maile transakcyjne', 'A', 'Maile systemowe/transakcyjne, szablony, SPF/DKIM/DMARC, deliverability. Nie wchodzi tu: kampanie marketingowe (obszar analytics/sem).', 30),
  ('backend_logic', 'Backend Logic', 'B', 'Logika biznesowa, workflow, maszyny stanów. Funkcje pokryte modułem z biblioteki NIE podnoszą poziomu (granice includes/excludes).', 40),
  ('database', 'Database', 'B', 'Schemat, relacje, migracje, indeksy, optymalizacja, sharding/replikacja.', 50),
  ('storage', 'Storage', 'B', 'Przechowywanie plików (object storage, CDN, wersjonowanie, retencja).', 60),
  ('caching', 'Caching', 'B', 'Warstwa cache aplikacyjna i niżej (HTTP, Redis/Memcached, invalidacja). Nie wchodzi tu: edge/statyki (obszar cdn).', 70),
  ('authentication', 'Authentication', 'C', 'Logowanie, reset hasła, OAuth/social, MFA, SSO/SAML. Audyty logowań tutaj.', 80),
  ('permissions', 'Permissions / Authorization', 'C', 'Role, RBAC/ABAC, uprawnienia kontekstowe, delegacja.', 90),
  ('security', 'Security', 'C', 'HTTPS, OWASP, CSP, szyfrowanie, pentesty, certyfikacje. Audyty bezpieczeństwa tutaj.', 100),
  ('rls', 'RLS (Row-Level Security)', 'C', 'Izolacja danych per użytkownik/organizacja. Audyty dostępu do danych tutaj.', 110),
  ('infrastructure', 'Infrastruktura (Cloud + Hosting)', 'D', 'Hosting, VPS/PaaS, konteneryzacja, środowiska, IaC, autoskalowanie (scalenie Cloud+Hosting, D11).', 120),
  ('cdn', 'CDN', 'D', 'Edge caching statyków, optymalizacja obrazów, multi-region/multi-CDN.', 130),
  ('load_balancing', 'Load Balancing', 'D', 'Rozkład ruchu, health checks, geo-routing. Nie wchodzi tu: multi-region active-active (obszar high_availability).', 140),
  ('rate_limiting', 'Rate Limiting', 'D', 'Limity per IP/użytkownik/klucz API, throttling, quota.', 150),
  ('high_availability', 'High Availability', 'D', 'Redundancja, auto-failover, multi-region active-active (TYLKO tutaj).', 160),
  ('disaster_recovery', 'Disaster Recovery', 'D', 'Backupy, plan DR, RPO/RTO, replikacja, testy odtwarzania.', 170),
  ('cicd', 'CI/CD', 'E', 'Pipeline build/deploy, testy, staging, canary/blue-green, rollbacki.', 180),
  ('observability', 'Observability', 'E', 'Error tracking + logi + monitoring + APM + traces (scalenie, D11).', 190),
  ('analytics', 'Analityka i śledzenie konwersji', 'F', 'GA4/GTM, data layer, zdarzenia, ecommerce, cross-domain, CDP.', 200),
  ('sst', 'Server-side tracking', 'F', 'sGTM, CAPI (Meta/Google), deduplikacja, first-party domain.', 210),
  ('seo', 'SEO (techniczne i on-page)', 'F', 'Meta/sitemap/robots, schema.org, CWV, hreflang, programmatic. Poziom 0 = system wewnętrzny.', 220),
  ('sem', 'SEM / Google Ads (setup)', 'F', 'Setup kont/feedów/kampanii (Shopping/PMax), multi-market. Bez prowadzenia (abonament).', 230),
  ('geo', 'GEO (widoczność AI)', 'F', 'Setup structured data/llms.txt/E-E-A-T + monitoring cytowań. Prowadzenie = abonament.', 240),
  ('consent', 'Consent Management', 'F', 'Banner cookie, CMP, Google Consent Mode v2, multi-jurysdykcja. Poziom 0 = brak trackingu.', 250),
  ('discovery', 'Discovery / analiza', 'G', 'Analiza przedwdrożeniowa: call → warsztaty → specyfikacja. Dojazd = pozycja kosztowa, nie godziny.', 260),
  ('uxui', 'UX/UI Design', 'G', 'Projekt graficzny: szablon → widoki → design system → identyfikacja od zera. Poziom 0 = klient dostarcza projekt.', 270),
  ('qa', 'QA / testy', 'G', 'Smoke/UAT → scenariusze → E2E (Playwright/Cypress) → testy wydajnościowe. Poziom 0 = tylko testy deweloperskie.', 280),
  ('data_migration', 'Migracja danych', 'G', 'Import/migracja danych z istniejącego systemu. Poziom 0 = nowy projekt. Mnożnik data_migration_risk tylko przy nieznanej jakości źródła.', 290),
  ('content', 'Content / wprowadzenie treści', 'G', 'Wprowadzanie treści/katalogu z materiałów klienta. Poziom 0 = klient wprowadza sam.', 300),
  ('golive', 'Go-live / hypercare', 'G', 'Wdrożenie produkcyjne, szkolenie, hypercare, blue-green/rollback. Poziom 0 = wdraża klient.', 310)
ON CONFLICT(code) DO UPDATE SET
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = 1;
