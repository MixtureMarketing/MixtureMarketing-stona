# 06 — Biblioteka startowa (DO KOREKTY PRZEZ JAKUBA)

Propozycje widełek na bazie typowego polskiego stacku e-commerce (WooCommerce/Presta/Laravel).
Instrukcja korekty: skreśl, czego nie robicie; popraw godziny tam, gdzie masz lepsze wyczucie;
dopisz brakujące. Ryzyko: low = znane API i dobra dokumentacja; medium = zdarzają się
niespodzianki; high = słaba dokumentacja / środowisko klienta / historia opóźnień.
**Dwie taryfy godzin (mechanizm systemowy):** każda integracja ma parę `platform` (wdrożenie
na platformie z gotowym pluginem — Woo/Presta/Sylius-BitBag) i `custom` (implementacja od zera —
Medusa/Laravel/headless lub brak pluginu). Archetyp wybiera taryfę automatycznie
(`integration_mode`). Widełki w tabelach poniżej = taryfa PLATFORM; taryfę CUSTOM przyjmij
wstępnie ×2 (Jakub koryguje per integracja w seedzie; integracje bez pluginów, np. Subiekt,
mają tylko custom).

## Integracje — payments

| code | nazwa | h | ryzyko | wymagania |
|---|---|---|---|---|
| p24 | Przelewy24 | 6–14 | low | konto P24, dane firmy |
| payu | PayU | 6–14 | low | umowa PayU |
| stripe | Stripe | 8–16 | low | konto Stripe |
| tpay | Tpay | 6–12 | low | konto Tpay |
| paypal | PayPal | 6–12 | low | konto business |
| paypo | PayPo / odroczone płatności | 8–16 | medium | umowa PayPo |
| klarna | Klarna | 10–20 | medium | umowa Klarna |

## Integracje — shipping

| code | nazwa | h | ryzyko | wymagania |
|---|---|---|---|---|
| inpost | InPost Paczkomaty (geowidget+API) | 8–16 | low | umowa InPost, API key |
| dpd | DPD | 8–14 | medium | umowa, WebAPI |
| dhl | DHL | 8–14 | medium | umowa |
| gls | GLS | 8–14 | medium | umowa |
| pocztapl | Poczta Polska / Pocztex | 10–18 | high | eNadawca, słaba dokumentacja |
| broker | Broker kurierski (Furgonetka/Apaczka) | 6–12 | low | konto brokera |

## Integracje — erp / księgowość / magazyn

| code | nazwa | h | ryzyko | wymagania |
|---|---|---|---|---|
| subiekt_gt | Subiekt GT (Sfera/GT Sync) | 40–80 | high | licencja Sfera, dostęp do serwera klienta, VPN |
| subiekt_nexo | Subiekt nexo | 40–80 | high | jw. |
| optima | Comarch ERP Optima | 40–80 | high | licencja API, środowisko klienta |
| wapro | WAPRO Mag | 30–60 | high | dostęp do bazy |
| enova | enova365 | 40–80 | high | licencja API |
| wfirma | wFirma | 8–16 | low | API key |
| fakturownia | Fakturownia | 6–12 | low | API key |
| ifirma | iFirma | 8–16 | low | API key |

Uwaga (rozbieżność z etapu 2): Subiekt GT ujednolicony do **40–80 h, ryzyko high** — wartość z
dokumentu deterministycznego; skoryguj, jeśli Wasze doświadczenie mówi inaczej.

## Integracje — marketplace / multichannel

| code | nazwa | h | ryzyko | wymagania |
|---|---|---|---|---|
| baselinker | Baselinker | 20–40 | low | konto BL, API token |
| allegro | Allegro (bezpośrednio) | 30–60 | medium | konto firmowe, aplikacja API |
| amazon | Amazon SP-API | 40–80 | high | konto seller, proces autoryzacji |
| ceneo | Ceneo (feed + API) | 8–16 | low | konto Ceneo |

## Integracje — feeds / hurtownie / dropshipping

| code | nazwa | h | ryzyko | wymagania |
|---|---|---|---|---|
| feed_standard | Feed hurtowni — format znany/standardowy (IOF itp.) | 8–16 | medium | dokumentacja feedu, dostępy |
| feed_custom | Feed hurtowni — format niestandardowy | 16–40 | high | próbka pliku, kontakt techniczny hurtowni |
| dropshipping | Dropshipping (stany+ceny+przekazywanie zamówień) | 24–56 | high | umowa z hurtownią, API/feed dwukierunkowy |

Każda hurtownia = osobna pozycja na wycenie (formaty się różnią). Powtarzające się hurtownie
dopisywać imiennie z realnymi godzinami po pierwszym wdrożeniu (kalibracja per integracja).

## Integracje — marketing / komunikacja / inne

| code | nazwa | h | ryzyko | wymagania |
|---|---|---|---|---|
| smsapi | SMSAPI | 4–8 | low | konto, sender ID |
| mailerlite | MailerLite | 6–12 | low | API key |
| mailchimp | Mailchimp | 6–12 | low | API key |
| freshmail | FreshMail | 6–12 | low | API key |
| gus | GUS/REGON (dane firm z NIP) | 4–8 | low | klucz API BIR |
| vies | VIES (walidacja VAT UE) | 3–6 | low | — |
| booking | System rezerwacji (Booksy/Calendly/custom embed) | 8–24 | medium | zależnie od systemu |
| crm_generic | CRM (Pipedrive/HubSpot/Livespace) | 12–32 | medium | konto, zakres synchronizacji |
| erp_custom | Integracja custom (nieznane API) | 40–120 | high | dokumentacja API klienta |

## Moduły (funkcjonalności addytywne)

| code | nazwa | h | zawiera | NIE zawiera |
|---|---|---|---|---|
| wishlist | Wishlist / schowek | 8–16 | UI+zapis per user | konto klienta (moduł/obszar auth) |
| client_panel_ext | Rozszerzony panel klienta | 24–48 | historia, zwroty, dane, faktury | sam login (authentication) |
| b2b_pricing | Cenniki B2B / grupy cenowe | 24–56 | grupy, ceny per grupa, netto/brutto | workflow akceptacji zamówień |
| b2b_approval | Workflow akceptacji B2B | 24–48 | koszyki do akceptacji, limity | cenniki (b2b_pricing) |
| quotes_rfq | Zapytania ofertowe (RFQ) | 24–48 | formularz, wycena ręczna, konwersja do zamówienia | — |
| subscriptions | Produkty subskrypcyjne | 24–56 | plany, płatności cykliczne (bramka musi wspierać) | bramka płatności |
| multicurrency | Wielowalutowość | 12–32 | przeliczanie, prezentacja | wielojęzyczność (frontend/i18n) |
| loyalty | Program lojalnościowy | 32–64 | punkty, progi, wymiana | integracje zewn. programów |
| configurator_options | Konfigurator opcji (bez wizualizacji) | 32–80 | warianty zależne, macierz kombinacji, cena dynamiczna | wizualizacja (tiery niżej) |
| configurator_2d | Konfigurator z wizualizacją 2D | 80–200 | podgląd warstwowy (PNG/SVG), kolory/tekstury, zarządzanie assetami | produkcja grafik wariantów (configurator_assets) |
| configurator_3d | Konfigurator 3D (Three.js/R3F) | 200–500+ | scena 3D, materiały, oświetlenie, wydajność mobile; ryzyko HIGH | modele 3D (cost_item:external), AR (osobno) |
| configurator_assets | Produkcja assetów 2D wariantów | wycena od liczby: produkty × warianty × ujęcia (szablon: 0,5–2 h/wariant) | obróbka/kompozycja grafik | fotografia produktowa (external) |
| cpq_engine | Silnik CPQ (wycena produkcyjna) | 80–200 | BOM, reguły produkcji, specyfikacja do ERP | sama integracja ERP (biblioteka, taryfa custom) |
| marketplace_mv | Marketplace multi-vendor | 120–240 | konta sprzedawców, prowizje, panel vendora | split payments (osobno per bramka) |
| blog_kb | Blog / baza wiedzy | 8–24 | listing, kategorie, szablon wpisu | redakcja treści (content) |
| search_adv | Wyszukiwarka zaawansowana | 16–40 | filtry, podpowiedzi, synonimy | — |
| pwa_push | PWA + web push | 16–40 | manifest, offline shell, powiadomienia | aplikacja natywna |
| invoices_auto | Automatyczne fakturowanie | 8–20 | generowanie po zamówieniu | integracja księgowa (erp) |
| gdpr_tools | Narzędzia RODO (eksport/anonimizacja) | 8–20 | żądania użytkownika | consent banner (obszar consent) |
| omnibus | Omnibus — najniższa cena 30 dni (wymóg prawny UE) | 4–10 | prezentacja ceny przy promocjach, historia cen | silnik promocji (promo_engine) |
| promo_engine | Promocje zaawansowane / kody rabatowe | 8–24 | gratisy od kwoty, bundle, progi, kody | podstawowe rabaty silnika sklepu (backend_logic) |
| rma | Zwroty i reklamacje (RMA) | 12–32 | formularz, statusy, powiadomienia, etykiety zwrotne | logistyka zwrotów po stronie klienta |
| reviews | Opinie o produktach | 6–20 | natywne opinie + integracja (Opineo/Trustpilot/Google) | moderacja treści (proces klienta) |
| gift_cards | Karty podarunkowe | 8–16 | sprzedaż, kody, realizacja | — |
| click_collect | Click & collect / punkty odbioru własne | 6–16 | wybór punktu, statusy odbioru | mapy punktów kurierskich (integracje shipping) |
| size_tables | Tabele rozmiarów (fashion) | 4–10 | tabele per kategoria/marka | — |
| livechat | Live chat / Messenger / callback | 3–8 | osadzenie, konfiguracja, zdarzenia analytics | obsługa czatu (proces klienta) |

## Pozycje kosztowe (typy)

| code | nazwa | jednostka | cena jedn. |
|---|---|---|---|
| travel | Dojazd na spotkanie/warsztat | km | `stawka_km` z parametrów (ustal: np. 1,15 zł/km) |
| lodging | Nocleg przy wyjeździe | doba | `stawka_nocleg` (ustal) |
| license | Licencja/wtyczka premium pod projekt | szt | ręcznie |
| license_sylius_plus | Licencja Sylius Plus (moduły wg potrzeb, cena zależna od GMV) | ryczałt/rok | ręcznie (oferta Sylius) |
| models_3d | Modele 3D produktów (podwykonawca) | szt | ręcznie |
| stock | Zdjęcia stock / assety | ryczałt | ręcznie |
| external | Usługa zewnętrzna (pentest, tłumaczenia, certyfikat) | ryczałt | ręcznie |
