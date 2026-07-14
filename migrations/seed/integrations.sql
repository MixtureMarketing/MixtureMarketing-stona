-- Seed: est_integrations — biblioteka integracji (docs/estimation/06).
-- Dwie taryfy: platform (plugin gotowy: Woo/Presta/Sylius-BitBag) i custom (od zera).
-- Widełki z tabel doc 06 = taryfa PLATFORM; taryfa CUSTOM = ×2 (DRAFT — Jakub koryguje per integracja).
-- Integracje bez pluginów (Subiekt/Optima/WAPRO/enova/erp_custom) = tylko custom (platform = NULL).
-- Idempotentny: ON CONFLICT(code) DO UPDATE. Zależności: brak.

INSERT INTO est_integrations
  (code, name, category, hours_platform_min, hours_platform_max, hours_custom_min, hours_custom_max, risk, requirements) VALUES
  -- payments
  ('p24', 'Przelewy24', 'payments', 6, 14, 12, 28, 'low', 'konto P24, dane firmy'),
  ('payu', 'PayU', 'payments', 6, 14, 12, 28, 'low', 'umowa PayU'),
  ('stripe', 'Stripe', 'payments', 8, 16, 16, 32, 'low', 'konto Stripe'),
  ('tpay', 'Tpay', 'payments', 6, 12, 12, 24, 'low', 'konto Tpay'),
  ('paypal', 'PayPal', 'payments', 6, 12, 12, 24, 'low', 'konto business'),
  ('paypo', 'PayPo / odroczone płatności', 'payments', 8, 16, 16, 32, 'medium', 'umowa PayPo'),
  ('klarna', 'Klarna', 'payments', 10, 20, 20, 40, 'medium', 'umowa Klarna'),
  -- shipping
  ('inpost', 'InPost Paczkomaty (geowidget+API)', 'shipping', 8, 16, 16, 32, 'low', 'umowa InPost, API key'),
  ('dpd', 'DPD', 'shipping', 8, 14, 16, 28, 'medium', 'umowa, WebAPI'),
  ('dhl', 'DHL', 'shipping', 8, 14, 16, 28, 'medium', 'umowa'),
  ('gls', 'GLS', 'shipping', 8, 14, 16, 28, 'medium', 'umowa'),
  ('pocztapl', 'Poczta Polska / Pocztex', 'shipping', 10, 18, 20, 36, 'high', 'eNadawca, słaba dokumentacja'),
  ('broker', 'Broker kurierski (Furgonetka/Apaczka)', 'shipping', 6, 12, 12, 24, 'low', 'konto brokera'),
  -- erp / księgowość / magazyn (Subiekt-class = custom only)
  ('subiekt_gt', 'Subiekt GT (Sfera/GT Sync)', 'erp', NULL, NULL, 40, 80, 'high', 'licencja Sfera, dostęp do serwera klienta, VPN'),
  ('subiekt_nexo', 'Subiekt nexo', 'erp', NULL, NULL, 40, 80, 'high', 'licencja, dostęp do serwera klienta'),
  ('optima', 'Comarch ERP Optima', 'erp', NULL, NULL, 40, 80, 'high', 'licencja API, środowisko klienta'),
  ('wapro', 'WAPRO Mag', 'erp', NULL, NULL, 30, 60, 'high', 'dostęp do bazy'),
  ('enova', 'enova365', 'erp', NULL, NULL, 40, 80, 'high', 'licencja API'),
  ('wfirma', 'wFirma', 'erp', 8, 16, 16, 32, 'low', 'API key'),
  ('fakturownia', 'Fakturownia', 'erp', 6, 12, 12, 24, 'low', 'API key'),
  ('ifirma', 'iFirma', 'erp', 8, 16, 16, 32, 'low', 'API key'),
  -- marketplace / multichannel
  ('baselinker', 'Baselinker', 'marketplace', 20, 40, 40, 80, 'low', 'konto BL, API token'),
  ('allegro', 'Allegro (bezpośrednio)', 'marketplace', 30, 60, 60, 120, 'medium', 'konto firmowe, aplikacja API'),
  ('amazon', 'Amazon SP-API', 'marketplace', 40, 80, 80, 160, 'high', 'konto seller, proces autoryzacji'),
  ('ceneo', 'Ceneo (feed + API)', 'marketplace', 8, 16, 16, 32, 'low', 'konto Ceneo'),
  -- feeds / hurtownie / dropshipping
  ('feed_standard', 'Feed hurtowni — format znany/standardowy (IOF itp.)', 'feeds', 8, 16, 16, 32, 'medium', 'dokumentacja feedu, dostępy'),
  ('feed_custom', 'Feed hurtowni — format niestandardowy', 'feeds', 16, 40, 32, 80, 'high', 'próbka pliku, kontakt techniczny hurtowni'),
  ('dropshipping', 'Dropshipping (stany+ceny+zamówienia)', 'feeds', 24, 56, 48, 112, 'high', 'umowa z hurtownią, API/feed dwukierunkowy'),
  -- marketing / komunikacja
  ('smsapi', 'SMSAPI', 'marketing', 4, 8, 8, 16, 'low', 'konto, sender ID'),
  ('mailerlite', 'MailerLite', 'marketing', 6, 12, 12, 24, 'low', 'API key'),
  ('mailchimp', 'Mailchimp', 'marketing', 6, 12, 12, 24, 'low', 'API key'),
  ('freshmail', 'FreshMail', 'marketing', 6, 12, 12, 24, 'low', 'API key'),
  -- inne
  ('gus', 'GUS/REGON (dane firm z NIP)', 'other', 4, 8, 8, 16, 'low', 'klucz API BIR'),
  ('vies', 'VIES (walidacja VAT UE)', 'other', 3, 6, 6, 12, 'low', '—'),
  ('booking', 'System rezerwacji (Booksy/Calendly/custom embed)', 'other', 8, 24, 16, 48, 'medium', 'zależnie od systemu'),
  ('crm_generic', 'CRM (Pipedrive/HubSpot/Livespace)', 'other', 12, 32, 24, 64, 'medium', 'konto, zakres synchronizacji'),
  ('erp_custom', 'Integracja custom (nieznane API)', 'other', NULL, NULL, 40, 120, 'high', 'dokumentacja API klienta')
ON CONFLICT(code) DO UPDATE SET
  name = excluded.name, category = excluded.category,
  hours_platform_min = excluded.hours_platform_min, hours_platform_max = excluded.hours_platform_max,
  hours_custom_min = excluded.hours_custom_min, hours_custom_max = excluded.hours_custom_max,
  risk = excluded.risk, requirements = excluded.requirements, is_active = 1;
