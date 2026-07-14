-- Seed: est_archetypes + est_archetype_defaults (docs/estimation/05, D17).
-- Idempotentny: ON CONFLICT DO UPDATE. Zależność: uruchamiać PO aspects.sql.
-- integration_mode: 'platform' = gotowe pluginy (Woo/Presta/Sylius-BitBag); 'custom' = od zera.
-- Domyślne poziomy: tabela z docs/05. Obszary spoza tabeli = default 0 odblokowany
--   (podnoszą je reguły) — nie wymagają wiersza. rls: LOCK = is_locked=1 (obszar ukryty).

INSERT INTO est_archetypes (code, name, description, integration_mode) VALUES
  ('wordpress', 'WordPress', 'Strona treściowa / wizytówka na WordPress', 'platform'),
  ('woocommerce', 'WooCommerce', 'Sklep WooCommerce (WordPress)', 'platform'),
  ('prestashop', 'PrestaShop', 'Sklep PrestaShop', 'platform'),
  ('woo_headless', 'WooCommerce headless', 'WooCommerce z frontem headless (React/Astro)', 'custom'),
  ('sylius', 'Sylius', 'Sylius (Symfony) z integracjami BitBag', 'platform'),
  ('medusa', 'Medusa', 'Medusa.js — headless commerce (TypeScript)', 'custom'),
  ('laravel', 'Laravel', 'Aplikacja/commerce custom na Laravel', 'custom'),
  ('headless', 'Headless (React/Astro)', 'Custom headless / strona React/Astro', 'custom')
ON CONFLICT(code) DO UPDATE SET
  name = excluded.name, description = excluded.description,
  integration_mode = excluded.integration_mode, is_active = 1;

-- Domyślne poziomy per (archetyp, obszar). Kolejność kolumn źródłowych:
-- wordpress, woocommerce, prestashop, woo_headless, sylius, medusa, laravel, headless
INSERT INTO est_archetype_defaults (archetype_id, aspect_id, default_level, is_locked)
SELECT ar.id, asp.id, v.column3, v.column4
FROM (VALUES
  -- frontend
  ('wordpress','frontend',1,0),('woocommerce','frontend',2,0),('prestashop','frontend',2,0),('woo_headless','frontend',2,0),('sylius','frontend',2,0),('medusa','frontend',2,0),('laravel','frontend',2,0),('headless','frontend',2,0),
  -- apis
  ('wordpress','apis',0,0),('woocommerce','apis',0,0),('prestashop','apis',0,0),('woo_headless','apis',1,0),('sylius','apis',1,0),('medusa','apis',2,0),('laravel','apis',2,0),('headless','apis',2,0),
  -- backend_logic
  ('wordpress','backend_logic',0,0),('woocommerce','backend_logic',1,0),('prestashop','backend_logic',1,0),('woo_headless','backend_logic',1,0),('sylius','backend_logic',2,0),('medusa','backend_logic',2,0),('laravel','backend_logic',2,0),('headless','backend_logic',1,0),
  -- database
  ('wordpress','database',0,0),('woocommerce','database',1,0),('prestashop','database',1,0),('woo_headless','database',1,0),('sylius','database',2,0),('medusa','database',2,0),('laravel','database',2,0),('headless','database',1,0),
  -- authentication
  ('wordpress','authentication',0,0),('woocommerce','authentication',1,0),('prestashop','authentication',1,0),('woo_headless','authentication',1,0),('sylius','authentication',1,0),('medusa','authentication',1,0),('laravel','authentication',2,0),('headless','authentication',1,0),
  -- rls (LOCK dla platform WP-owych)
  ('wordpress','rls',0,1),('woocommerce','rls',0,1),('prestashop','rls',0,1),('woo_headless','rls',0,1),('sylius','rls',0,0),('medusa','rls',0,0),('laravel','rls',0,0),('headless','rls',0,0),
  -- infrastructure
  ('wordpress','infrastructure',1,0),('woocommerce','infrastructure',1,0),('prestashop','infrastructure',1,0),('woo_headless','infrastructure',2,0),('sylius','infrastructure',2,0),('medusa','infrastructure',2,0),('laravel','infrastructure',2,0),('headless','infrastructure',1,0),
  -- cicd
  ('wordpress','cicd',0,0),('woocommerce','cicd',1,0),('prestashop','cicd',1,0),('woo_headless','cicd',2,0),('sylius','cicd',2,0),('medusa','cicd',2,0),('laravel','cicd',2,0),('headless','cicd',2,0),
  -- observability
  ('wordpress','observability',0,0),('woocommerce','observability',1,0),('prestashop','observability',1,0),('woo_headless','observability',1,0),('sylius','observability',2,0),('medusa','observability',2,0),('laravel','observability',2,0),('headless','observability',1,0),
  -- emails
  ('wordpress','emails',0,0),('woocommerce','emails',1,0),('prestashop','emails',1,0),('woo_headless','emails',1,0),('sylius','emails',1,0),('medusa','emails',1,0),('laravel','emails',1,0),('headless','emails',0,0),
  -- seo
  ('wordpress','seo',1,0),('woocommerce','seo',1,0),('prestashop','seo',1,0),('woo_headless','seo',1,0),('sylius','seo',1,0),('medusa','seo',1,0),('laravel','seo',0,0),('headless','seo',1,0),
  -- analytics
  ('wordpress','analytics',1,0),('woocommerce','analytics',1,0),('prestashop','analytics',1,0),('woo_headless','analytics',1,0),('sylius','analytics',1,0),('medusa','analytics',1,0),('laravel','analytics',0,0),('headless','analytics',1,0),
  -- consent
  ('wordpress','consent',1,0),('woocommerce','consent',1,0),('prestashop','consent',1,0),('woo_headless','consent',1,0),('sylius','consent',1,0),('medusa','consent',1,0),('laravel','consent',0,0),('headless','consent',1,0)
) AS v
JOIN est_archetypes ar ON ar.code = v.column1
JOIN est_aspects asp ON asp.code = v.column2
ON CONFLICT(archetype_id, aspect_id) DO UPDATE SET
  default_level = excluded.default_level, is_locked = excluded.is_locked;
