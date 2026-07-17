-- Seed: est_questions — warstwa pytań biznesowych (docs/estimation/05, tabela pytań startowych).
-- DRAFT v1 do finalizacji przez Jakuba (język, opcje, unknown_weight). Idempotentny: ON CONFLICT(code).
-- Kanoniczne wartości opcji (kolumna value w options_json) są WSPÓLNE z rules.sql — nie zmieniać w oderwaniu.
-- answer_type: bool|select|multiselect|number|text. visibility='internal' (F0; public/portal w F4).
-- unknown_weight: waga niewiadomej w Confidence (03); wyższa = większy wpływ na godziny (draft).
--
-- ── POLITYKA WIDOCZNOŚCI (f1c-fix2, przegląd całego katalogu; DRAFT do korekty Jakuba) ──
-- Każde pytanie ma JAWNY status: albo `visible_if_json`, albo NULL = ZAWSZE WIDOCZNE (świadomie).
-- Skrót SHOP = {"q":"project_goal","op":"in","val":["sklep","b2b"]}.
--
--  ZAWSZE WIDOCZNE (dotyczą każdego celu — także „aplikacja z logowaniem"):
--    project_goal, views_count, languages (podstrony/języki dotyczą też aplikacji), design_source,
--    workshops, users_type, users_concurrent, traffic_monthly, downtime_tolerance, sensitive_data,
--    other_integrations (SMSAPI/CRM/GUS/rezerwacje — nie tylko sklep), existing_data (dane startowe),
--    ads_planned, tracking_scope, seo_migration, content_source, training, deadline_hard,
--    team_new_tech, custom_logic, frontend_headless (krok Platforma).
--  SHOP (blok e-commerce — ukryty poza sklep/B2B):
--    product_variants, stock_source, sales_model, promos_planned, returns_handling,
--    shipping, erp, marketplace.
--  KATALOG (sklep/B2B + portal treści): products_count — katalog bez commerce też waży (retro#2).
--    UWAGA (retro-fix): `payments` PRZENIESIONE do zawsze-widocznych — płatności są uniwersalne
--    ekonomicznie (darowizny/subskrypcje/opłaty), a nietrafność zamyka „nie dotyczy" (D26).
--    Kandydat do podobnego przeniesienia przy przeglądzie seedów: `erp` — część „księgowość/faktury"
--    dotyczy każdej organizacji, część „ERP/magazyn" tylko sklepu → rozważyć rozbicie na dwa pytania.
--  CHECKLISTA MODUŁÓW (`modules`) — ZAWSZE WIDOCZNA, ale opcje = przecięcie archetyp ∩ cel
--    (est_modules.archetypes_json ∩ goals_json, D24). Moduły ogólne (goals=NULL) dostępne
--    dla każdego celu — także dla „aplikacja z logowaniem".
--  WARUNKOWE OD INNEJ ODPOWIEDZI (kaskada, niezależnie od celu):
--    workshops_travel_km ← workshops=stacjonarne; sla_formal ← downtime≠nic lub users_type=b2b;
--    sla_value ← sla_formal=konkretny; data_sample ← existing_data=przenosimy;
--    configurator_* ← modules zawiera konfigurator (a więc pośrednio SHOP).

INSERT INTO est_questions
  (code, text, help_text, answer_type, options_json, allow_unknown, unknown_weight, visible_if_json, question_group, sort_order) VALUES
  -- ── projekt ──
  -- (D21/fix1) „archetype" NIE jest pytaniem — to atrybut/wynik kroku Platforma. Usunięte z katalogu
  --   (DELETE na końcu pliku dla baz już zaseedowanych). Wybór archetypu żyje w PlatformStep.
  ('project_goal', 'Co ma robić projekt?', NULL, 'select',
   '[{"value":"sklep","label":"Sklep internetowy"},{"value":"wizytowka","label":"Wizytówka / landing"},{"value":"portal_tresci","label":"Portal treści"},{"value":"aplikacja","label":"Aplikacja z logowaniem"},{"value":"b2b","label":"Portal B2B"}]',
   0, 1.5, NULL, 'projekt', 20),
  ('views_count', 'Ile unikalnych podstron/widoków?', NULL, 'number', NULL, 1, 1.0, NULL, 'projekt', 30),
  ('languages', 'Ile wersji językowych?', NULL, 'number', NULL, 1, 1.0, NULL, 'projekt', 40),
  ('design_source', 'Skąd projekt graficzny?', NULL, 'select',
   '[{"value":"klient","label":"Klient dostarcza"},{"value":"identyfikacja","label":"Mamy identyfikację"},{"value":"od_zera","label":"Wszystko od zera"}]',
   1, 1.5, NULL, 'projekt', 50),
  ('workshops', 'Jak ustalamy zakres?', NULL, 'select',
   '[{"value":"mail","label":"Mail / telefon"},{"value":"online","label":"Spotkania online"},{"value":"stacjonarne","label":"Warsztaty u klienta"}]',
   1, 1.0, NULL, 'projekt', 60),
  ('workshops_travel_km', 'Ile km w jedną stronę?', 'Widoczne przy warsztatach stacjonarnych.', 'number', NULL, 1, 0.5,
   '{"q":"workshops","op":"eq","val":"stacjonarne"}', 'projekt', 70),
  -- ── uzytkownicy ──
  ('users_type', 'Kto się loguje?', NULL, 'select',
   '[{"value":"nikt","label":"Nikt"},{"value":"klienci","label":"Klienci sklepu"},{"value":"pracownicy","label":"Pracownicy"},{"value":"b2b","label":"Firmy B2B"},{"value":"wiele_organizacji","label":"Wiele organizacji"}]',
   1, 1.0, NULL, 'uzytkownicy', 80),
  ('users_concurrent', 'Ilu użytkowników jednocześnie w szczycie?', 'Wyprowadź z faktów: zamówień dziennie, liczby pracowników, szczytu sezonowego.', 'number', NULL, 1, 1.5, NULL, 'uzytkownicy', 90),
  -- (S1) unknown_weight 1.0 → 0.5: przy małych projektach ruch jest nieznany Z DEFINICJI
  -- (nowa firma), a realnie rusza infrastrukturę dopiero przy wysokich progach.
  ('traffic_monthly', 'Szacowany ruch miesięczny?', NULL, 'select',
   '[{"value":"do_10k","label":"do 10 tys."},{"value":"10k_50k","label":"10–50 tys."},{"value":"50k_300k","label":"50–300 tys."},{"value":"300k_1m","label":"300 tys.–1 mln"},{"value":"ponad_1m","label":"ponad 1 mln"}]',
   1, 0.5, NULL, 'uzytkownicy', 100),
  ('downtime_tolerance', 'Co się dzieje, gdy system stoi godzinę?', NULL, 'select',
   '[{"value":"nic","label":"Nic"},{"value":"sprzedaz","label":"Tracimy sprzedaż"},{"value":"critical_247","label":"Krytyczne 24/7"}]',
   1, 1.5, NULL, 'uzytkownicy', 110),
  ('sla_formal', 'Czy w umowie będzie formalna gwarancja dostępności?', NULL, 'select',
   '[{"value":"brak","label":"Brak"},{"value":"ogolny","label":"Zapis ogólny"},{"value":"konkretny","label":"Konkretny %"}]',
   1, 1.0, '{"any":[{"q":"downtime_tolerance","op":"neq","val":"nic"},{"q":"users_type","op":"eq","val":"b2b"}]}', 'uzytkownicy', 120),
  ('sla_value', 'Jaki % dostępności?', 'Np. 99.5, 99.8, 99.9.', 'number', NULL, 1, 1.0,
   '{"q":"sla_formal","op":"eq","val":"konkretny"}', 'uzytkownicy', 130),
  ('sensitive_data', 'Czy przetwarzamy dane wrażliwe/płatnicze poza bramką?', NULL, 'bool', NULL, 1, 1.0, NULL, 'uzytkownicy', 140),
  -- ── funkcje ──
  -- (retro#2) Katalog ≠ sklep: portal treści też ma katalog (kursy, wyjazdy, oferty) i jego rozmiar
  -- realnie waży (listing, karty, filtry). Retro TRY DIVE: 26 kursów/wyjazdów ważyło tyle co zero,
  -- bo pytanie było SHOP-only. Etykieta rozszerzona, widoczność +portal_tresci.
  ('products_count', 'Ile pozycji katalogu (produkty/kursy/oferty)?', 'Liczba pozycji (możesz wpisać np. 300k, 1m). Także katalog bez sprzedaży online.', 'number', NULL, 1, 1.5, '{"q":"project_goal","op":"in","val":["sklep","b2b","portal_tresci"]}', 'funkcje', 150),
  ('product_variants', 'Czy produkty mają warianty lub konfigurację?', NULL, 'select',
   '[{"value":"brak","label":"Brak"},{"value":"proste","label":"Proste warianty"},{"value":"masowe","label":"Masowe warianty"},{"value":"konfigurowalne","label":"Konfigurowalne"}]',
   1, 1.5, '{"q":"project_goal","op":"in","val":["sklep","b2b"]}', 'funkcje', 160),
  ('stock_source', 'Skąd produkty i stany magazynowe?', NULL, 'multiselect',
   '[{"value":"recznie","label":"Ręcznie"},{"value":"feedy","label":"Feedy hurtowni"},{"value":"erp","label":"ERP"},{"value":"dropshipping","label":"Dropshipping"}]',
   1, 1.0, '{"q":"project_goal","op":"in","val":["sklep","b2b"]}', 'funkcje', 170),
  ('sales_model', 'Sprzedaż B2C, B2B czy mieszana?', NULL, 'select',
   '[{"value":"b2c","label":"B2C"},{"value":"b2b","label":"B2B"},{"value":"mieszana","label":"Mieszana"}]',
   1, 1.0, '{"q":"project_goal","op":"in","val":["sklep","b2b"]}', 'funkcje', 180),
  ('promos_planned', 'Czy będą promocje/wyprzedaże?', NULL, 'bool', NULL, 1, 0.5,
   '{"q":"project_goal","op":"in","val":["sklep","b2b"]}', 'funkcje', 190),
  ('returns_handling', 'Zwroty przez system czy poza systemem?', NULL, 'select',
   '[{"value":"system","label":"Przez system"},{"value":"poza","label":"Mailowo / poza systemem"}]',
   1, 0.5, '{"q":"project_goal","op":"in","val":["sklep","b2b"]}', 'funkcje', 200),
  -- (retro-fix) Płatności są UNIWERSALNE EKONOMICZNIE — darowizny (fundacja), subskrypcje, opłaty
  -- za wydarzenia zdarzają się poza sklepem. Retro Niepodzielnych: portal treści z darowiznami
  -- przez Stripe nie miał JAK zadeklarować bramki. Nietrafność obsługuje „nie dotyczy" (D26) bez kary.
  ('payments', 'Płatności online? (jakie bramki)', 'Także darowizny, subskrypcje, opłaty za wydarzenia — nie tylko sklep.', 'multiselect',
   '[{"value":"p24","label":"Przelewy24"},{"value":"payu","label":"PayU"},{"value":"stripe","label":"Stripe"},{"value":"tpay","label":"Tpay"},{"value":"paypal","label":"PayPal"},{"value":"paypo","label":"PayPo"},{"value":"klarna","label":"Klarna"}]',
   1, 1.0, NULL, 'funkcje', 210),
  ('shipping', 'Wysyłka? (przewoźnicy/broker)', NULL, 'multiselect',
   '[{"value":"inpost","label":"InPost"},{"value":"dpd","label":"DPD"},{"value":"dhl","label":"DHL"},{"value":"gls","label":"GLS"},{"value":"pocztapl","label":"Poczta Polska"},{"value":"broker","label":"Broker (Furgonetka/Apaczka)"}]',
   1, 1.0, '{"q":"project_goal","op":"in","val":["sklep","b2b"]}', 'funkcje', 220),
  ('erp', 'Integracja z ERP/magazynem/księgowością?', NULL, 'multiselect',
   '[{"value":"subiekt_gt","label":"Subiekt GT"},{"value":"subiekt_nexo","label":"Subiekt nexo"},{"value":"optima","label":"Comarch Optima"},{"value":"wapro","label":"WAPRO Mag"},{"value":"enova","label":"enova365"},{"value":"wfirma","label":"wFirma"},{"value":"fakturownia","label":"Fakturownia"},{"value":"ifirma","label":"iFirma"}]',
   1, 1.5, '{"q":"project_goal","op":"in","val":["sklep","b2b"]}', 'funkcje', 230),
  ('marketplace', 'Sprzedaż na marketplace''ach?', NULL, 'multiselect',
   '[{"value":"baselinker","label":"Baselinker"},{"value":"allegro","label":"Allegro"},{"value":"amazon","label":"Amazon"},{"value":"ceneo","label":"Ceneo"}]',
   1, 1.0, '{"q":"project_goal","op":"in","val":["sklep","b2b"]}', 'funkcje', 240),
  ('other_integrations', 'Inne systemy do połączenia?', NULL, 'multiselect',
   '[{"value":"smsapi","label":"SMSAPI"},{"value":"mailerlite","label":"MailerLite"},{"value":"mailchimp","label":"Mailchimp"},{"value":"freshmail","label":"FreshMail"},{"value":"gus","label":"GUS/REGON"},{"value":"vies","label":"VIES"},{"value":"booking","label":"System rezerwacji"},{"value":"crm_generic","label":"CRM"},{"value":"erp_custom","label":"Custom (nieznane API)"}]',
   1, 1.0, NULL, 'funkcje', 250),
  -- (D24) Checklista jest ZAWSZE widoczna, ale jej OPCJE to przecięcie archetyp ∩ cel:
  -- filtrujemy moduły po est_modules.archetypes_json ∩ goals_json (buildLibraryData), a UI bierze
  -- opcje z przefiltrowanej biblioteki — NIE z options_json poniżej (ten zostaje jako fallback/dok.).
  -- Dzięki temu moduły ogólne (blog_kb, gdpr_tools, livechat…) są dostępne też poza sklepem.
  ('modules', 'Funkcje dodatkowe (checklista z biblioteki)', NULL, 'multiselect',
   '[{"value":"wishlist","label":"Wishlist"},{"value":"client_panel_ext","label":"Rozszerzony panel klienta"},{"value":"b2b_pricing","label":"Cenniki B2B"},{"value":"b2b_approval","label":"Workflow akceptacji B2B"},{"value":"quotes_rfq","label":"RFQ"},{"value":"subscriptions","label":"Subskrypcje"},{"value":"multicurrency","label":"Wielowalutowość"},{"value":"loyalty","label":"Program lojalnościowy"},{"value":"configurator_options","label":"Konfigurator opcji"},{"value":"configurator_2d","label":"Konfigurator 2D"},{"value":"configurator_3d","label":"Konfigurator 3D"},{"value":"cpq_engine","label":"CPQ"},{"value":"marketplace_mv","label":"Marketplace multi-vendor"},{"value":"blog_kb","label":"Blog / baza wiedzy"},{"value":"search_adv","label":"Wyszukiwarka zaawansowana"},{"value":"pwa_push","label":"PWA + push"},{"value":"invoices_auto","label":"Auto-faktury"},{"value":"gdpr_tools","label":"Narzędzia RODO"},{"value":"omnibus","label":"Omnibus"},{"value":"promo_engine","label":"Promocje zaawansowane"},{"value":"rma","label":"RMA"},{"value":"reviews","label":"Opinie"},{"value":"gift_cards","label":"Karty podarunkowe"},{"value":"click_collect","label":"Click & collect"},{"value":"size_tables","label":"Tabele rozmiarów"},{"value":"livechat","label":"Live chat"}]',
   1, 1.0, NULL, 'funkcje', 260),
  ('existing_data', 'Skąd dane startowe?', NULL, 'select',
   '[{"value":"nowy","label":"Nowy projekt"},{"value":"przenosimy","label":"Przenosimy z istniejącego systemu"},{"value":"csv","label":"Plik CSV"}]',
   1, 1.5, NULL, 'funkcje', 270),
  ('data_sample', 'Czy mamy dostęp/próbkę danych źródłowych?', NULL, 'bool', NULL, 1, 1.0,
   '{"q":"existing_data","op":"eq","val":"przenosimy"}', 'funkcje', 280),
  -- ── configurator (widoczne gdy wybrano konfigurator) ──
  ('configurator_type', 'Czy kupujący ma widzieć produkt podczas konfigurowania?', NULL, 'select',
   '[{"value":"lista","label":"Nie — tylko lista opcji"},{"value":"plaski","label":"Płaski podgląd 2D"},{"value":"przestrzenny","label":"Obracany model 3D"}]',
   1, 1.0,
   '{"any":[{"q":"modules","op":"contains","val":"configurator_options"},{"q":"modules","op":"contains","val":"configurator_2d"},{"q":"modules","op":"contains","val":"configurator_3d"}]}', 'funkcje', 290),
  ('configurator_products', 'Ile bazowych produktów konfigurowalnych?', 'Oraz liczba wymiarów opcji (kolor/rozmiar/materiał).', 'number', NULL, 1, 1.0,
   '{"any":[{"q":"modules","op":"contains","val":"configurator_options"},{"q":"modules","op":"contains","val":"configurator_2d"},{"q":"modules","op":"contains","val":"configurator_3d"}]}', 'funkcje', 300),
  ('config_assets_source', 'Skąd wizualizacje wariantów?', NULL, 'select',
   '[{"value":"gotowe","label":"Klient dostarcza gotowe"},{"value":"surowce","label":"Klient ma surowce"},{"value":"od_zera","label":"Produkcja od zera"}]',
   1, 1.0,
   '{"any":[{"q":"modules","op":"contains","val":"configurator_2d"},{"q":"modules","op":"contains","val":"configurator_3d"}]}', 'funkcje', 310),
  ('config_matrix', 'Czy klient ma spisaną macierz zależności opcji?', NULL, 'bool', NULL, 1, 1.5,
   '{"any":[{"q":"modules","op":"contains","val":"configurator_options"},{"q":"modules","op":"contains","val":"configurator_2d"},{"q":"modules","op":"contains","val":"configurator_3d"}]}', 'funkcje', 320),
  ('config_output', 'Co dzieje się z konfiguracją?', NULL, 'multiselect',
   '[{"value":"koszyk","label":"Koszyk"},{"value":"zapis","label":"Zapis + link"},{"value":"pdf","label":"PDF specyfikacji"},{"value":"erp","label":"Do ERP/produkcji"}]',
   1, 1.0,
   '{"any":[{"q":"modules","op":"contains","val":"configurator_options"},{"q":"modules","op":"contains","val":"configurator_2d"},{"q":"modules","op":"contains","val":"configurator_3d"}]}', 'funkcje', 330),
  -- ── marketing ──
  -- (S1) unknown_weight 1.0 → 0.5: „nie wiem, czy będą kampanie" rusza wycenę o kilka godzin
  -- (SEM/analytics), a zabierało tyle co niewiadoma skali. Zasada: waga ∝ wpływ na godziny/ryzyko.
  ('ads_planned', 'Kampanie płatne po starcie?', NULL, 'multiselect',
   '[{"value":"google","label":"Google Ads"},{"value":"meta","label":"Meta"},{"value":"inne","label":"Inne"}]',
   1, 0.5, NULL, 'marketing', 340),
  ('tracking_scope', 'Jak ważna jest dokładność pomiaru kampanii?', 'Maksymalna = odporna na blokady reklam i ograniczenia Apple; istotna przy większych budżetach.', 'select',
   '[{"value":"podstawowa","label":"Podstawowa"},{"value":"pelny","label":"Pełny pomiar sprzedaży i remarketing"},{"value":"maksymalna","label":"Maksymalna"}]',
   1, 1.0, NULL, 'marketing', 350),
  ('seo_migration', 'Czy istnieje strona z pozycjami do zachowania?', NULL, 'bool', NULL, 1, 1.0, NULL, 'marketing', 360),
  -- ── realizacja ──
  ('content_source', 'Kto wprowadza treści/produkty?', NULL, 'select',
   '[{"value":"klient","label":"Klient"},{"value":"my_materialy","label":"My z materiałów"},{"value":"my_redakcja","label":"My z redakcją"}]',
   1, 1.0, NULL, 'realizacja', 370),
  ('training', 'Szkolenie i opieka po starcie?', NULL, 'select',
   '[{"value":"przekazanie","label":"Przekazanie"},{"value":"szkolenie","label":"Szkolenie + tydzień"},{"value":"hypercare","label":"Pełny hypercare"}]',
   1, 1.0, NULL, 'realizacja', 380),
  ('deadline_hard', 'Sztywny deadline wymuszający pracę równoległą?', NULL, 'bool', NULL, 1, 1.0, NULL, 'realizacja', 390),
  ('team_new_tech', 'Czy stack jest poza rutyną zespołu?', 'Pytanie wewnętrzne (nie dla klienta).', 'bool', NULL, 1, 1.0, NULL, 'realizacja', 400)
ON CONFLICT(code) DO UPDATE SET
  text = excluded.text, help_text = excluded.help_text, answer_type = excluded.answer_type,
  options_json = excluded.options_json, allow_unknown = excluded.allow_unknown,
  unknown_weight = excluded.unknown_weight, visible_if_json = excluded.visible_if_json,
  question_group = excluded.question_group, sort_order = excluded.sort_order, is_active = 1;

-- (fix1) Usuń „archetype" z katalogu pytań w bazach zaseedowanych przed D21 — archetyp jest
-- atrybutem wyceny (wynik kroku Platforma), nie pytaniem. Idempotentne.
DELETE FROM est_questions WHERE code = 'archetype';

-- f1a: pytania neutralne kroku „Platforma" (D21) — dodane dla reguł recommend_archetype.
INSERT INTO est_questions
  (code, text, help_text, answer_type, options_json, allow_unknown, unknown_weight, visible_if_json, question_group, sort_order) VALUES
  ('custom_logic', 'Czy projekt wymaga nietypowej logiki biznesowej poza standardem platformy?', 'Np. własne procesy zamówień, wyceny produkcyjne, nietypowe rabaty/przepływy.', 'bool', NULL, 1, 1.5, NULL, 'platforma', 230),
  ('frontend_headless', 'Czy zależy Wam na nowoczesnym, dopracowanym wrażeniu i bardzo płynnym działaniu strony?', 'Np. efektowne animacje, błyskawiczne ładowanie, wyróżnienie się jakością doświadczenia — zwykle wyższy budżet.', 'bool', NULL, 1, 1.0, NULL, 'platforma', 240)
ON CONFLICT(code) DO UPDATE SET
  text = excluded.text, help_text = excluded.help_text, answer_type = excluded.answer_type,
  options_json = excluded.options_json, allow_unknown = excluded.allow_unknown,
  unknown_weight = excluded.unknown_weight, visible_if_json = excluded.visible_if_json,
  question_group = excluded.question_group, sort_order = excluded.sort_order, is_active = 1;

-- f4a: podzbiór PUBLICZNY kalkulatora (visibility='public'). Kuratela treści = Level 2 (Jakub,
-- zatwierdzone dla kontraktu v1). Kolumna visibility nie jest w INSERT-ach powyżej (default 'internal'),
-- więc ustawiamy ją tu — UPDATE jest idempotentny i niezależny od ON CONFLICT wyżej.
-- Zestaw: pytania, na które właściciel firmy bez IT odpowie samodzielnie (kontrakt §8).
UPDATE est_questions SET visibility = 'public'
 WHERE code IN ('project_goal', 'languages', 'views_count', 'users_type',
                'sensitive_data', 'downtime_tolerance', 'custom_logic', 'frontend_headless');
