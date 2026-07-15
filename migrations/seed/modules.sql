-- Seed: est_modules — biblioteka modułów addytywnych (docs/estimation/06).
-- includes/excludes = granice z obszarami (rozstrzygają spory D4). Idempotentny: ON CONFLICT(code).
-- Ryzyko: doc 06 jawnie oznacza tylko configurator_3d=high; reszta 'low' (do przeglądu Jakuba).
-- configurator_assets: wycena per wariant (0,5–2 h/wariant) — hours 0/0, dodawany jako pozycja ad hoc.

INSERT INTO est_modules (code, name, hours_min, hours_max, includes, excludes, risk) VALUES
  ('wishlist', 'Wishlist / schowek', 8, 16, 'UI + zapis per user', 'konto klienta (obszar authentication)', 'low'),
  ('client_panel_ext', 'Rozszerzony panel klienta', 24, 48, 'historia, zwroty, dane, faktury', 'sam login (authentication)', 'low'),
  ('b2b_pricing', 'Cenniki B2B / grupy cenowe', 24, 56, 'grupy, ceny per grupa, netto/brutto', 'workflow akceptacji zamówień (b2b_approval)', 'low'),
  ('b2b_approval', 'Workflow akceptacji B2B', 24, 48, 'koszyki do akceptacji, limity', 'cenniki (b2b_pricing)', 'low'),
  ('quotes_rfq', 'Zapytania ofertowe (RFQ)', 24, 48, 'formularz, wycena ręczna, konwersja do zamówienia', NULL, 'low'),
  ('subscriptions', 'Produkty subskrypcyjne', 24, 56, 'plany, płatności cykliczne', 'bramka płatności (biblioteka payments)', 'low'),
  ('multicurrency', 'Wielowalutowość', 12, 32, 'przeliczanie, prezentacja', 'wielojęzyczność (frontend/i18n)', 'low'),
  ('loyalty', 'Program lojalnościowy', 32, 64, 'punkty, progi, wymiana', 'integracje zewn. programów', 'low'),
  ('configurator_options', 'Konfigurator opcji (bez wizualizacji)', 32, 80, 'warianty zależne, macierz kombinacji, cena dynamiczna', 'wizualizacja (configurator_2d/3d)', 'low'),
  ('configurator_2d', 'Konfigurator z wizualizacją 2D', 80, 200, 'podgląd warstwowy (PNG/SVG), kolory/tekstury, zarządzanie assetami', 'produkcja grafik wariantów (configurator_assets)', 'low'),
  ('configurator_3d', 'Konfigurator 3D (Three.js/R3F)', 200, 500, 'scena 3D, materiały, oświetlenie, wydajność mobile', 'modele 3D (cost_item:external), AR (osobno)', 'high'),
  ('configurator_assets', 'Produkcja assetów 2D wariantów', 0, 0, 'obróbka/kompozycja grafik — wycena per wariant: 0,5–2 h × (produkty × warianty × ujęcia); dodaj jako pozycję ad hoc', 'fotografia produktowa (external)', 'medium'),
  ('cpq_engine', 'Silnik CPQ (wycena produkcyjna)', 80, 200, 'BOM, reguły produkcji, specyfikacja do ERP', 'sama integracja ERP (biblioteka, taryfa custom)', 'medium'),
  ('marketplace_mv', 'Marketplace multi-vendor', 120, 240, 'konta sprzedawców, prowizje, panel vendora', 'split payments (osobno per bramka)', 'medium'),
  ('blog_kb', 'Blog / baza wiedzy', 8, 24, 'listing, kategorie, szablon wpisu', 'redakcja treści (obszar content)', 'low'),
  ('search_adv', 'Wyszukiwarka zaawansowana', 16, 40, 'filtry, podpowiedzi, synonimy', NULL, 'low'),
  ('pwa_push', 'PWA + web push', 16, 40, 'manifest, offline shell, powiadomienia', 'aplikacja natywna', 'low'),
  ('invoices_auto', 'Automatyczne fakturowanie', 8, 20, 'generowanie po zamówieniu', 'integracja księgowa (biblioteka erp)', 'low'),
  ('gdpr_tools', 'Narzędzia RODO (eksport/anonimizacja)', 8, 20, 'żądania użytkownika', 'consent banner (obszar consent)', 'low'),
  ('omnibus', 'Omnibus — najniższa cena 30 dni (wymóg UE)', 4, 10, 'prezentacja ceny przy promocjach, historia cen', 'silnik promocji (promo_engine)', 'low'),
  ('promo_engine', 'Promocje zaawansowane / kody rabatowe', 8, 24, 'gratisy od kwoty, bundle, progi, kody', 'podstawowe rabaty silnika sklepu (backend_logic)', 'low'),
  ('rma', 'Zwroty i reklamacje (RMA)', 12, 32, 'formularz, statusy, powiadomienia, etykiety zwrotne', 'logistyka zwrotów po stronie klienta', 'low'),
  ('reviews', 'Opinie o produktach', 6, 20, 'natywne opinie + integracja (Opineo/Trustpilot/Google)', 'moderacja treści (proces klienta)', 'low'),
  ('gift_cards', 'Karty podarunkowe', 8, 16, 'sprzedaż, kody, realizacja', NULL, 'low'),
  ('click_collect', 'Click & collect / punkty odbioru własne', 6, 16, 'wybór punktu, statusy odbioru', 'mapy punktów kurierskich (integracje shipping)', 'low'),
  ('size_tables', 'Tabele rozmiarów (fashion)', 4, 10, 'tabele per kategoria/marka', NULL, 'low'),
  ('livechat', 'Live chat / Messenger / callback', 3, 8, 'osadzenie, konfiguracja, zdarzenia analytics', 'obsługa czatu (proces klienta)', 'low'),
  -- (retro-fix, DRAFT) Asystent AI — luka katalogu wykryta w retro Niepodzielnych: czat AI był
  -- w zakresie od startu, a jedynym sposobem wyceny było ręczne windowanie backend_logic/apis.
  -- Dwa tiery, bo rozrzut jest ogromny i mieszanie ich w jednej pozycji psuje widełki:
  --   ai_chatbot_faq — deterministyczny asystent na zamkniętej bazie FAQ: prompt + treści od klienta,
  --     osadzenie w UI, bez pamięci i bez akcji. 24–56 h ≈ integracja + UI czatu + testy treści.
  --     Ryzyko medium: jakość odpowiedzi zależy od jakości FAQ dostarczonego przez klienta.
  --   ai_chatbot_rag — RAG po treściach + narzędzia: pipeline embeddingów, baza wektorowa,
  --     wyszukiwanie, guardrails, ewaluacja odpowiedzi, ewentualne akcje (np. podpowiedź terminu).
  --     80–200 h. Ryzyko high: iteracje jakościowe są nieprzewidywalne, koszt modelu poza godzinami
  --     (osobna pozycja kosztowa). Górna granica open-ended wg D22.
  -- Widełki DRAFT — do kalibracji na pierwszym realnym wdrożeniu (Niepodzielni = kandydat).
  ('ai_chatbot_faq', 'Asystent AI — FAQ (bez RAG)', 24, 56, 'prompt + baza FAQ od klienta, UI czatu, osadzenie, testy odpowiedzi', 'RAG po treściach, pamięć rozmowy, akcje/narzędzia (ai_chatbot_rag); koszt modelu (pozycja kosztowa)', 'medium'),
  -- (retro#2, DRAFT) Kreator doboru — quiz/rekomendacja BEZ cen i macierzy wariantów. Osobno od
  -- „Konfiguratora opcji" (ten ma warianty zależne + cenę dynamiczną). Retro TRY DIVE: dobór kursu
  -- to rekomendacja, nie konfiguracja produktu — mieszanie obu psuje widełki.
  ('product_finder', 'Kreator doboru (quiz/rekomendacja)', 16, 40, 'ścieżka pytań, logika dopasowania, prezentacja wyniku + CTA', 'warianty zależne i cena dynamiczna (configurator_options); wizualizacja (configurator_2d/3d)', 'medium'),
  -- (retro#2, DRAFT) Własny CMS — trzecia dziura katalogowa tego typu (po ai_chatbot). Dwa tiery,
  -- bo rozrzut prosty edytor ↔ pełny CMS blokowy jest kilkukrotny:
  --   custom_cms_basic  — CRUD treści + edytor tekstu w istniejącym panelu, bez budowania stron.
  --   custom_cms_blocks — CMS blokowy + admin SPA: biblioteka bloków, układanie strony, podgląd,
  --     wersjonowanie/publikacja, uprawnienia. Górna granica open-ended wg D22.
  ('custom_cms_basic', 'Własny CMS — prosty edytor treści', 32, 72, 'CRUD wpisów/stron, edytor tekstu, media, publikacja', 'budowanie stron z bloków, admin SPA (custom_cms_blocks)', 'medium'),
  ('custom_cms_blocks', 'Własny CMS blokowy + admin SPA', 80, 200, 'biblioteka bloków, układanie strony, podgląd na żywo, wersjonowanie, publikacja, uprawnienia', 'gotowy CMS (WordPress/Sanity) — wtedy archetyp platformowy', 'high'),
  ('ai_chatbot_rag', 'Asystent AI — RAG + narzędzia', 80, 200, 'pipeline embeddingów, baza wektorowa, wyszukiwanie po treściach, guardrails, ewaluacja jakości, narzędzia/akcje', 'moderacja treści źródłowych, koszt modelu i bazy wektorowej (pozycje kosztowe)', 'high')
ON CONFLICT(code) DO UPDATE SET
  name = excluded.name, hours_min = excluded.hours_min, hours_max = excluded.hours_max,
  includes = excluded.includes, excludes = excluded.excludes, risk = excluded.risk, is_active = 1;

-- (D24) DRAFT: zakres modułu = archetypes_json ∩ goals_json. NULL w kolumnie = bez ograniczenia.
-- Checklista w wizardzie pokazuje PRZECIĘCIE obu zakresów (filtr w buildLibraryData).
-- Poniżej DRAFT do korekty Jakuba przy przeglądzie seedów. Idempotentne (UPDATE).

-- (a) ARCHETYPY: ciężkie moduły „od zera" nie mają sensu na gotowych platformach WP-owych —
--     ograniczamy je do archetypów o integration_mode='custom'.
UPDATE est_modules
  SET archetypes_json = '["woo_headless","medusa","laravel","headless"]'
  WHERE code IN ('marketplace_mv', 'cpq_engine', 'configurator_3d');

-- (b) CELE: moduły czysto sklepowe — tylko sklep/B2B.
UPDATE est_modules
  SET goals_json = '["sklep","b2b"]'
  WHERE code IN (
    'wishlist', 'promo_engine', 'omnibus', 'rma', 'gift_cards', 'click_collect',
    'size_tables', 'reviews', 'subscriptions', 'multicurrency', 'loyalty',
    'invoices_auto', 'marketplace_mv', 'cpq_engine'
  );

-- (retro#2, decyzja architekta) KONFIGURATORY NIE SĄ SKLEPOWE → goals_json = NULL.
-- Retro TRY DIVE: konfigurator doboru kursu w portalu treści (rdzeń briefu) wypadał z checklisty
-- przez mój wcześniejszy DRAFT ["sklep","b2b"] — 32–80 h znikało z wyceny bez śladu.
UPDATE est_modules
  SET goals_json = NULL
  WHERE code IN ('configurator_options', 'configurator_2d', 'configurator_3d', 'configurator_assets');

-- (c) CELE: moduły B2B-owe — tylko portal B2B (i sklep prowadzący sprzedaż B2B).
UPDATE est_modules
  SET goals_json = '["b2b","sklep"]'
  WHERE code IN ('b2b_pricing', 'b2b_approval', 'quotes_rfq');

-- (d) CELE: panel klienta — wszędzie tam, gdzie ktokolwiek się loguje.
UPDATE est_modules
  SET goals_json = '["sklep","b2b","aplikacja"]'
  WHERE code IN ('client_panel_ext');

-- (e) OGÓLNE (blog_kb, search_adv, pwa_push, gdpr_tools, livechat + asystenci AI) zostają
--     z goals_json = NULL → dostępne dla KAŻDEGO celu, w tym „aplikacja z logowaniem" i „wizytówka".
--     Asystent AI jest z definicji poza sklepem (retro: portal treści fundacji).
--     Jawnie zerujemy zakres, gdyby wcześniejszy przebieg coś ustawił (idempotencja).
UPDATE est_modules
  SET goals_json = NULL
  WHERE code IN ('blog_kb', 'search_adv', 'pwa_push', 'gdpr_tools', 'livechat',
                 'ai_chatbot_faq', 'ai_chatbot_rag',
                 'product_finder', 'custom_cms_basic', 'custom_cms_blocks');
