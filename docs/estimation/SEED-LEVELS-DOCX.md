# SEED-LEVELS-DOCX — widełki 22 obszarów przenoszonych ze źródłowego docx

Źródło: „Framework wyceny i planowania projektów" (docx, wersja robocza) — przeniesienie 1:1
zgodnie z docs/estimation/04. Uzupełnienia względem docx oznaczone: **[D12]** = dodany poziom 0
(0 h, „Nie dotyczy / infrastruktura i zakres po stronie klienta"); **[04]** = zmieniony opis
przy zachowanych widełkach. Poziom 0 istnieje w KAŻDYM obszarze (inwariant 7) — wiersze 0
niewymienione poniżej dodać z opisem generycznym. Status: wartości źródłowe Jakuba (nie DRAFT),
podlegają tylko jego zwykłej korekcie seedów.

Format: poziom | nazwa | charakterystyka | h_min–h_max

## frontend  *(opis obszaru wg 04: bez projektowania graficznego — implementacja)*
0 | Brak / nie dotyczy | Projekt bez własnego frontendu (np. czysty backend/API) | 0
1 | Podstawowy | Gotowy szablon/theme, drobne dostosowania kolorystyki i treści, 1 język, brak animacji | 10–25
2 | Standardowy | Custom UI wg projektu graficznego, pełny RWD, 1–2 języki, podstawowe animacje/przejścia | 40–100
3 | Zaawansowany | Rozbudowany design system, komponenty wielokrotnego użytku, i18n 3+ języki, WCAG AA, PWA | 100–250
4 | Enterprise / Custom | Pełny design system, mikrointerakcje, multi-brand, white-label, WCAG AAA | 250+

## apis  *(opisy wg 04 — wyłącznie własne API; widełki z docx bez zmian)* **[04]**
0 | Brak / nie dotyczy | Brak własnego API | 0
1 | Podstawowy | Kilka prostych endpointów REST/CRUD | 15–30
2 | Standardowy | Pełne REST API z dokumentacją i autoryzacją | 40–80
3 | Zaawansowany | GraphQL i/lub WebSockets, wersjonowanie API, rate limiting per endpoint | 80–160
4 | Enterprise / Custom | gRPC / architektura mikroserwisowa, event-driven, API gateway, kontrakty SLA | 160+

## backend_logic
0 | Brak / nie dotyczy | Logika w całości po stronie platformy/klienta | 0 **[D12]**
1 | Podstawowy | Prosta logika CRUD, brak złożonych procesów biznesowych | 20–40
2 | Standardowy | Logika średniej złożoności: rabaty, promocje, prosty workflow zamówień | 60–120
3 | Zaawansowany | Złożone reguły biznesowe, maszyny stanów, integracje płatności/logistyki | 120–250
4 | Enterprise / Custom | Wielomodułowy system, złożone przepływy, integracje z ERP/WMS/PIM | 250+

## database
0 | Brak / nie dotyczy | Baza w całości po stronie platformy/klienta | 0 **[D12]**
1 | Podstawowy | Pojedyncza baza SQL, prosty schemat (do ~15 tabel) | 15–30
2 | Standardowy | Baza SQL z relacjami średniej złożoności, migracje, indeksy, podstawowa optymalizacja | 40–80
3 | Zaawansowany | Hybryda SQL+NoSQL, sharding/partycjonowanie, replikacja read/write | 80–160
4 | Enterprise / Custom | Rozproszona architektura danych, multi-region, CQRS / event sourcing | 160+

## storage
0 | Brak / nie dotyczy | Brak plików do przechowywania (czyste API/system) | 0 **[D12]**
1 | Podstawowy | Lokalny/bucket storage dla plików (np. zdjęcia produktów) | 4–8
2 | Standardowy | Object storage z CDN, wersjonowanie plików, limity i walidacja | 8–16
3 | Zaawansowany | Storage wielopoziomowy (hot/cold), automatyczna optymalizacja/kompresja | 16–32
4 | Enterprise / Custom | Storage rozproszony, retencja/compliance, replikacja DR | 32+

## caching  *(opis obszaru wg 04: warstwa aplikacyjna i niżej; edge/statyki → cdn)*
0 | Brak / nie dotyczy | Cache po stronie platformy wystarczający | 0 **[D12]**
1 | Podstawowy | Cache HTTP/przeglądarki, podstawowy cache stron statycznych | 4–10
2 | Standardowy | Cache aplikacyjny (Redis/Memcached) dla zapytań/sesji | 16–32
3 | Zaawansowany | Wielowarstwowy cache (CDN + app + DB), strategie inwalidacji | 32–64
4 | Enterprise / Custom | Cache rozproszony, cache warming, złożone strategie invalidacji | 64+

## authentication
0 | Brak / nie dotyczy | Brak logowania w projekcie | 0 **[D12]**
1 | Podstawowy | Email/hasło, proste logowanie, reset hasła | 8–16
2 | Standardowy | + logowanie social/OAuth, weryfikacja email, reset hasła | 24–48
3 | Zaawansowany | MFA/2FA, magic links, zarządzanie sesjami wielourządzeniowe | 48–96
4 | Enterprise / Custom | SSO / SAML enterprise, zaawansowane compliance i audyt logowań | 96+

## permissions
0 | Brak / nie dotyczy | Brak zróżnicowanych uprawnień | 0 **[D12]**
1 | Podstawowy | Role admin/user, brak granularnych uprawnień | 6–12
2 | Standardowy | RBAC z kilkoma rolami i granularnymi uprawnieniami per moduł | 20–40
3 | Zaawansowany | RBAC + ABAC, uprawnienia kontekstowe, multi-tenant | 40–80
4 | Enterprise / Custom | Złożony model uprawnień, delegacja, pełny audyt zmian uprawnień | 80+

## security
0 | Brak / nie dotyczy | Zakres bezpieczeństwa po stronie klienta/platformy | 0 **[D12]**
1 | Podstawowy | HTTPS, podstawy OWASP Top 10, walidacja danych wejściowych | 10–20
2 | Standardowy | + CSP, sanityzacja, szyfrowanie danych wrażliwych, podstawowy pentest | 24–48
3 | Zaawansowany | Pełny audyt bezpieczeństwa, WAF, szyfrowanie end-to-end, zgodność RODO | 48–96
4 | Enterprise / Custom | Certyfikacje (ISO 27001/SOC2/PCI-DSS), regularne pentesty, bug bounty | 96+

## rls
0 | Brak / nie dotyczy | Brak danych wrażliwych per-user, jeden zestaw danych dla wszystkich | 0
1 | Podstawowy | RLS na 1–2 kluczowych tabelach | 6–12
2 | Standardowy | RLS na większości tabel z danymi użytkownika | 16–32
3 | Zaawansowany | RLS multi-tenant z hierarchią ról/organizacji | 32–64
4 | Enterprise / Custom | Złożone polityki dynamiczne, pełny audyt dostępu do danych | 64+

## cdn
0 | Brak / nie dotyczy | Ruch lokalny, minimalna ilość statyków | 0
1 | Podstawowy | CDN dla statyków (obrazy/CSS/JS), jeden dostawca | 4–8
2 | Standardowy | CDN + optymalizacja obrazów, reguły cache per typ zasobu | 8–16
3 | Zaawansowany | Multi-region CDN, edge caching, automatyzacja purge | 16–32
4 | Enterprise / Custom | Multi-CDN z failover, edge computing/functions | 32+

## load_balancing
0 | Brak / nie dotyczy | Pojedynczy serwer wystarczający | 0
1 | Podstawowy | Prosty load balancer (usługa chmurowa) | 4–8
2 | Standardowy | LB z health checks, podstawowe autoskalowanie | 12–24
3 | Zaawansowany | LB wielowarstwowy, sticky sessions, geo-routing | 24–48
4 | Enterprise / Custom | Globalny LB, multi-region active-active | 48+

## rate_limiting
0 | Brak / nie dotyczy | Brak ryzyka nadużyć, ruch wewnętrzny | 0
1 | Podstawowy | Proste limity per IP na poziomie serwera/proxy | 3–6
2 | Standardowy | Limity per użytkownik/klucz API, różne progi per endpoint | 8–16
3 | Zaawansowany | Dynamiczne limity, throttling, quota billing | 16–32
4 | Enterprise / Custom | Distributed rate limiting, polityki per klient/tier | 32+

## high_availability  *(opis wg 04: multi-region active-active TYLKO tutaj)*
0 | Brak / nie dotyczy | Pojedynczy punkt awarii akceptowalny | 0
1 | Podstawowy | Monitoring uptime + automatyczny restart | 4–8
2 | Standardowy | Redundancja na poziomie aplikacji (min. 2 instancje) | 16–32
3 | Zaawansowany | HA na wszystkich warstwach (app/DB/storage), auto-failover | 40–80
4 | Enterprise / Custom | SLA 99,99%+, multi-region active-active | 80+

## disaster_recovery
0 | Brak / nie dotyczy | Tylko podstawowe backupy bez planu DR | 0
1 | Podstawowy | Regularne backupy + spisany plan odtworzenia | 6–12
2 | Standardowy | Backup + testy odtwarzania, zdefiniowane RPO/RTO | 16–32
3 | Zaawansowany | Replikacja do drugiej lokalizacji, automatyczny failover | 40–80
4 | Enterprise / Custom | Pełny DR z regularnym testowaniem, RPO < 1h | 80+

## cicd
0 | Brak / nie dotyczy | Deploy/infrastruktura po stronie klienta | 0 **[D12]**
1 | Podstawowy | Prosty pipeline build + deploy | 6–12
2 | Standardowy | Pipeline z testami automatycznymi, środowisko staging | 16–32
3 | Zaawansowany | Pełny CI/CD z testami E2E, canary/blue-green deploy | 32–64
4 | Enterprise / Custom | Multi-środowiskowy pipeline, automatyczne rollbacki, compliance gates | 64+

## analytics
0 | Brak / nie dotyczy | Brak wymogu trackingu marketingowego | 0
1 | Podstawowy | GA4 + GTM, podstawowa konfiguracja, kilka zdarzeń standardowych | 4–8
2 | Standardowy | GA4 Ecommerce, data layer, 5–10 zdarzeń custom, 1–2 platformy reklamowe | 12–24
3 | Zaawansowany | Rozbudowany data layer, cross-domain tracking, wiele platform (Meta/TikTok/LinkedIn) | 24–48
4 | Enterprise / Custom | CDP (Customer Data Platform), atrybucja multi-touch, integracja z BI | 48+

## sst  (server-side tracking)
0 | Brak / nie dotyczy | Tracking wyłącznie client-side | 0
1 | Podstawowy | sGTM — jeden tag przekierowany server-side | 8–16
2 | Standardowy | sGTM + 1–2 CAPI (Meta/Google Ads), deduplikacja zdarzeń | 20–40
3 | Zaawansowany | Pełna migracja trackingu server-side, wiele CAPI, first-party domain, monitoring jakości danych | 40–80
4 | Enterprise / Custom | Własna infrastruktura server-side, zaawansowana walidacja i wzbogacanie danych | 80+

## seo
0 | Brak / nie dotyczy | System wewnętrzny / poza zakresem | 0 **[D12]**
1 | Podstawowy | Meta/tagi, sitemap.xml, robots.txt, podstawowa struktura URL | 6–12
2 | Standardowy | + schema.org (produkt/organizacja), optymalizacja Core Web Vitals | 16–32
3 | Zaawansowany | Pełny audyt, migracja z zachowaniem link equity, rozbudowane dane strukturalne, hreflang | 32–64
4 | Enterprise / Custom | Wielorynkowe SEO, programmatic SEO, złożona architektura informacji | 64+

## sem  *(poziom 4: opis wg 04 — setup wielorynkowy, bez automatyzacji ciągłych)* **[04]**
0 | Brak / nie dotyczy | Klient nie prowadzi kampanii płatnych | 0
1 | Podstawowy | Konto Google Ads, podstawowa konwersja, prosty setup | 4–8
2 | Standardowy | Merchant Center + feed produktowy, kampanie Shopping/Performance Max | 12–24
3 | Zaawansowany | Zaawansowany feed (custom labels, dynamic remarketing), integracja z CRM/offline conversions | 24–48
4 | Enterprise / Custom | Setup multi-market feed management (bez prowadzenia — abonament) | 48+

## geo  *(poziomy 3–4: opisy wg 04 — SETUP monitoringu/optymalizacji; widełki z docx)* **[04]**
0 | Brak / nie dotyczy | Poza zakresem projektu | 0
1 | Podstawowy | Podstawowe dane strukturalne + llms.txt, treści FAQ w formacie przyjaznym AI | 4–8
2 | Standardowy | Rozbudowane structured data (FAQ/HowTo/Product), optymalizacja treści pod cytowanie | 12–24
3 | Zaawansowany | Setup strategii treści E-E-A-T pod AI Overviews + konfiguracja monitoringu cytowań | 24–48
4 | Enterprise / Custom | Setup optymalizacji dla wielu silników AI, framework testów treści (prowadzenie — abonament) | 48+

## consent
0 | Brak / nie dotyczy | System wewnętrzny bez trackingu marketingowego | 0 **[D12]**
1 | Podstawowy | Prosty banner cookie, podstawowa blokada skryptów | 4–8
2 | Standardowy | CMP z Google Consent Mode v2, kategoryzacja skryptów | 8–16
3 | Zaawansowany | Multi-jurysdykcja (RODO+CCPA), geolokalizacja zgód, integracja server-side | 16–32
4 | Enterprise / Custom | Consent management dla wielu marek/domen, pełny audyt compliance | 32+
