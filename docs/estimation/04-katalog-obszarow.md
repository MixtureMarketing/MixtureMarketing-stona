# 04 — Katalog obszarów (finalny)

Zmiany względem oryginalnego frameworka (docx): scalenia D11, poziom 0 wszędzie D12,
redefinicja APIs i Frontendu (D4/D10), nowa kategoria G. Widełki obszarów niezmienionych
przenoszone 1:1 z docx do seedów. **31 obszarów.**

## Lista finalna

| Kod | Obszar | Kat. | Status względem docx |
|---|---|---|---|
| frontend | Frontend | A | ZMIENIONY: bez projektowania graficznego (→ uxui); wycenia implementację |
| apis | APIs (własne API) | A | ZMIENIONY: bez integracji zewnętrznych (→ biblioteka); poziomy wg złożoności własnego API (REST/GraphQL/WS, dokumentacja, wersjonowanie) |
| emails | E-maile transakcyjne | A | NOWY (tabela niżej) |
| backend_logic | Backend Logic | B | bez zmian (uwaga w opisie: funkcje pokryte modułami z biblioteki nie podnoszą poziomu) |
| database | Database | B | bez zmian |
| storage | Storage | B | + poziom 0 |
| caching | Caching | B | doprecyzowana granica z CDN (opis: caching = warstwa aplikacyjna i niżej; edge/statyki → cdn) |
| authentication | Authentication | C | bez zmian |
| permissions | Permissions / Authorization | C | bez zmian |
| security | Security | C | bez zmian (opis rozgranicza audyty: logowań → authentication, dostępu do danych → rls, bezpieczeństwa → security) |
| rls | RLS | C | bez zmian |
| infrastructure | Infrastruktura (Cloud + Hosting) | D | SCALONY — tabela niżej |
| cdn | CDN | D | bez zmian |
| load_balancing | Load Balancing | D | bez zmian |
| rate_limiting | Rate Limiting | D | bez zmian |
| high_availability | High Availability | D | bez zmian (multi-region active-active TYLKO tu; usunięte z opisów LB i infrastruktury) |
| disaster_recovery | Disaster Recovery | D | bez zmian |
| cicd | CI/CD | E | + poziom 0 (infra klienta) |
| observability | Observability (Error Tracking + Logging + Monitoring) | E | SCALONY — tabela niżej |
| analytics | Analityka i śledzenie konwersji | F | bez zmian |
| sst | Server-side tracking | F | bez zmian |
| seo | SEO (techniczne i on-page) | F | + poziom 0 (systemy wewnętrzne) |
| sem | SEM / Google Ads (setup) | F | ZMIENIONY: poziom 4 bez „automatyzacji ciągłych" — tylko setup wielorynkowy |
| geo | GEO (widoczność AI) | F | ZMIENIONY: poziomy 3–4 przeredagowane na SETUP monitoringu/optymalizacji (prowadzenie = abonament, poza frameworkiem) |
| consent | Consent Management | F | + poziom 0 |
| discovery | Discovery / analiza | G | NOWY |
| uxui | UX/UI Design | G | NOWY |
| qa | QA / testy | G | NOWY |
| data_migration | Migracja danych | G | NOWY |
| content | Content / wprowadzenie treści | G | NOWY |
| golive | Go-live / hypercare | G | NOWY |

Zasada globalna: **każdy obszar ma poziom 0** („nie dotyczy / klient robi sam / poza zakresem",
0 h). Opis każdego obszaru w seedzie zawiera zdanie „Nie wchodzi tu: … (jest w obszarze …)".

## Nowe i scalone obszary — poziomy (propozycja widełek do korekty Jakuba)

### discovery — Discovery / analiza przedwdrożeniowa
| Poz. | Charakterystyka | h |
|---|---|---|
| 0 | Zakres w pełni jasny / klient dostarczył specyfikację | 0 |
| 1 | Godzinny call (Meet), notatka z ustaleń | 1–3 |
| 2 | 2–3 spotkania online, spisanie wymagań, mapa funkcji | 6–16 |
| 3 | Warsztat stacjonarny 1 dzień, analiza procesów, specyfikacja | 16–32 |
| 4 | Warsztaty wielodniowe, analiza konkurencji, pełna specyfikacja z architekturą | 40+ |

Dojazd na warsztaty = pozycja kosztowa (03, krok 7), nie godziny tego obszaru.

### uxui — UX/UI Design
| Poz. | Charakterystyka | h |
|---|---|---|
| 0 | Klient dostarcza gotowy projekt graficzny | 0 |
| 1 | Gotowy motyw/szablon; dopasowanie kolorów/typografii do istniejącej identyfikacji | 4–10 |
| 2 | Projekt kluczowych widoków na bazie istniejącej identyfikacji | 16–40 |
| 3 | Pełny projekt UI wszystkich widoków + makiety UX; identyfikacja istnieje | 40–100 |
| 4 | Od zera: identyfikacja wizualna + design system + pełny projekt | 100+ |

### qa — QA / testy
| Poz. | Charakterystyka | h |
|---|---|---|
| 0 | Tylko testy deweloperskie w trakcie prac (wliczone w obszary) | 0 |
| 1 | Manualny smoke test przed oddaniem + poprawki | 4–8 |
| 2 | Scenariusze testowe kluczowych ścieżek, testy na urządzeniach, runda UAT z klientem | 12–32 |
| 3 | Testy automatyczne E2E krytycznych ścieżek (Playwright/Cypress), regresja | 32–64 |
| 4 | Pełny plan testów, automatyzacja, testy wydajnościowe/obciążeniowe | 64+ |

### data_migration — Migracja danych
| Poz. | Charakterystyka | h |
|---|---|---|
| 0 | Brak danych do przeniesienia (nowy projekt) | 0 |
| 1 | Import prostych danych z CSV/XML (produkty bez wariantów, strony) | 4–12 |
| 2 | Migracja katalogu + klientów z istniejącego systemu, mapowanie pól, przekierowania 301 | 16–40 |
| 3 | Migracja relacyjna (zamówienia, historia, warianty), skrypty, weryfikacja spójności | 40–100 |
| 4 | Setki tysięcy rekordów, dane wrażliwe/szyfrowane, migracja etapowa z oknem przełączenia | 100+ |

Mnożnik `data_migration_risk` (+10%) dokłada się TYLKO gdy jakość źródła nieznana (brak próbki).

### content — Content / wprowadzenie treści
| Poz. | Charakterystyka | h |
|---|---|---|
| 0 | Klient wprowadza treści sam (po szkoleniu → golive) | 0 |
| 1 | Wprowadzenie treści podstawowych stron (do ~10 podstron) | 3–8 |
| 2 | Konfiguracja katalogu: do ~100 produktów/wpisów z materiałów klienta | 8–24 |
| 3 | Duży katalog (100–1000 pozycji), import + ręczne uzupełnienia, optymalizacja opisów | 24–64 |
| 4 | Masowy content: >1000 pozycji, wielojęzyczność, redakcja/adaptacja treści | 64+ |

### emails — E-maile transakcyjne
| Poz. | Charakterystyka | h |
|---|---|---|
| 0 | Nie dotyczy (brak transakcji/kont) | 0 |
| 1 | Standardowe maile systemu (WooCommerce/Presta default) + SPF/DKIM/DMARC | 2–6 |
| 2 | Własne szablony maili (branding), API wysyłkowe (Resend/Postmark/SMTP), test deliverability | 6–16 |
| 3 | Rozbudowane szablony per zdarzenie, załączniki (faktury), monitoring dostarczalności | 16–32 |
| 4 | Własna infrastruktura wysyłki, wielojęzyczne szablony, compliance | 32+ |

### golive — Go-live / hypercare
| Poz. | Charakterystyka | h |
|---|---|---|
| 0 | Wdraża klient / inny wykonawca | 0 |
| 1 | Wdrożenie produkcyjne, DNS/SSL, przekazanie dostępów | 2–6 |
| 2 | + szkolenie klienta (1–2 sesje), instrukcja obsługi, tydzień opieki powdrożeniowej | 6–16 |
| 3 | Wdrożenie z migracją ruchu (301, monitoring pozycji), 2–4 tyg. hypercare, SLA reakcji | 16–40 |
| 4 | Wdrożenie etapowe/blue-green, plan rollbacku, dedykowany dyżur | 40+ |

### infrastructure — Infrastruktura (scalenie Cloud Computing + Hosting)
| Poz. | Charakterystyka | h |
|---|---|---|
| 0 | Infrastrukturę dostarcza i utrzymuje klient | 0 |
| 1 | Hosting współdzielony / PaaS / pojedynczy VPS z podstawową konfiguracją | 3–8 |
| 2 | VPS/serwer z pełną konfiguracją, konteneryzacja (Docker), środowisko stage | 12–32 |
| 3 | Środowiska dev/stage/prod, orkiestracja, autoskalowanie, IaC podstawowe | 40–80 |
| 4 | Multi-cloud/hybrid, pełne IaC, hosting wieloregionalny | 80+ |

### observability — Observability (scalenie Error Tracking + Logging + Monitoring)
| Poz. | Charakterystyka | h |
|---|---|---|
| 0 | Nie dotyczy (infra i monitoring po stronie klienta) | 0 |
| 1 | Logi aplikacyjne + monitoring uptime + logi błędów | 3–8 |
| 2 | Narzędzie error trackingu (Sentry) z alertami + centralne logi + dashboard infrastruktury | 12–28 |
| 3 | Strukturalne logi z korelacją, APM, alerty proaktywne, SLA reakcji | 28–56 |
| 4 | Pełna observability (traces/metrics/logs), retencja compliance, SIEM, on-call | 56+ |

## Obszary przenoszone z docx bez zmian widełek

frontend (poziomy wg docx, opis minus design), apis (nowe opisy poziomów: 1 = kilka endpointów
CRUD; 2 = pełne REST z dokumentacją i autoryzacją; 3 = GraphQL/WebSockets, wersjonowanie;
4 = mikroserwisy/gateway/kontrakty SLA — widełki jak w docx), backend_logic, database, storage,
caching, authentication, permissions, security, rls, cdn, load_balancing, rate_limiting,
high_availability, disaster_recovery, cicd, analytics, sst, seo, sem, geo (poziomy 3–4:
przeredagowane opisy — „setup monitoringu cytowań i procesu optymalizacji", widełki bez zmian),
consent. Wszystkie dostają wiersz poziomu 0.

Seed `levels.sql` powstaje w fazie 0 przez przepisanie tabel z docx + tabel powyżej;
plik przechodzi korektę Jakuba przed pierwszym użyciem produkcyjnym (kryterium akceptacji F0).
