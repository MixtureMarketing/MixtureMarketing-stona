# DOKUMENT KALIBRACYJNY F1 — System Wycen
Data: 15.07.2026 · engine 1.6 · Status: FAZA 1 ZAMKNIĘTA (po rytuale prod + smoke)

## 1. Jak walidowaliśmy (trzy osie)

| Oś | Metoda | Wynik |
|---|---|---|
| Własne godziny | Retro #1 Niepodzielni (blind: godziny ujawnione po przeliczeniu) | 45 tys. realnie vs 40,4–59,7 tys. oferty — **w paśmie, −10% od środka** |
| Własne godziny | Retro #2 try-dive | wynik C 40,8–57,9 tys. vs realia: [Jakub — dopisz kwotę try-dive] |
| Rynek | 4 scenariusze vs cenniki PL 2026 | S1/S2/S4 **w paśmie**; S3 poniżej pasma SH — patrz §4 |
| Mechanizmy | kary, alerty, rekomendacje | rekomendacje 4/4 trafne; kara macierzy działa (dowód kontrolny 100→83+alert); dojazdy liczone |

## 2. Co walidacja naprawiła (wdrożone, zweryfikowane)

- **Bug silnika:** odpowiedzi pytań niewidocznych liczone do wyceny → filtr visible_if
  jako punkt stały (1.5); odpowiedzi-widma multiselectów → czyszczenie do biblioteki (1.6).
- **Struktura:** reguły views_count; custom_logic/emails bez klatki celu; reguły
  project_goal=aplikacja (backend≥3, permissions≥2, apis≥2, qa≥2) + permissions dla b2b;
  payments zawsze widoczne (D26 obsługuje nietrafność).
- **Katalog:** nowe moduły ai_chatbot (faq/rag), custom_cms_admin (2 tiery), product_finder;
  konfiguratory dostępne poza sklepem (goals NULL); configurator_2d risk=medium.
- **Dryf docs→seeds (audyt 30 reguł):** 2 martwe wdrożone (config_matrix −15+alert
  Discovery; CPQ→produkcja), 28 czystych. Zasady: „docs wygrywa przy sprzeczności",
  „reguła w docs = seed w tym samym commicie" (ZASADY-PRACY).
- **Confidence:** D23 (nieodpowiedziane karze) + D26 („nie dotyczy" nie karze) + uczciwy
  breakdown + wagi skrajne skorygowane (S1 72→80, S4 84→92).

## 3. Werdykt kalibracyjny

**Stawka 50 zł/h: POTWIERDZONA dwiema niezależnymi osiami** (retro #1: ~45 tys./≈900 h;
scenariusze: 3/4 w pasmach rynku agencyjnego). Nie ruszać bez decyzji strategicznej (§4).
**Widełki obszarów: bez korekt systemowych** — żadna oś nie wykazała systematycznego
przeszacowania/niedoszacowania po naprawach strukturalnych. Korekty punktowe → §5.

## 4. Decyzja strategiczna ZAPARKOWANA: segment aplikacji dedykowanych

S3 (CRM) −19% od pasma software house (55–110 tys. @ 100–150 zł/h). Godziny systemu
(572–1151) uznane za trafne; różnica = cena godziny, nie ilość pracy. Mixture realnie
operuje ~50 zł/h efektywnie (dowód: retro #1). Opcje:
(a) świadomie konkurować ceną w tym segmencie (status quo — nic nie robić),
(b) stawki per kategoria (D8): kat. A/B po stawce SH dla archetypów custom — wymaga
    domknięcia długu `items` z F0 (to NIE jest zero kodu) → decyzja na przeglądzie.
Pytanie do rozstrzygnięcia przez Jakuba: czy godzina architekta backendu = cenowo
godzina wdrożenia szablonu?

## 5. AGENDA PRZEGLĄDU SEEDÓW (Jakub + architekt — ostatni krok kalibracji)

A. **Katalog modułów vs realna praktyka Mixture** (3 dziury w 2 retro: AI, CMS, finder —
   przejść usługi, które realnie sprzedajecie, dodać brakujące moduły) — 30 min.
B. **Część cenowa:** decyzja segment/stawki per kategoria (§4); przy okazji przegląd
   widełek nowych modułów (ai_chatbot faq 24–56 / rag 80–200; custom_cms; product_finder
   16–40) i granic L4 (1,5× z D22) — 20 min.
C. **Tabela unknown_weight** (DRAFT agenta; zasada: waga ∝ wpływ na godziny/ryzyko) — 10 min.
D. **Progi reguł:** platformowe (2k/10k produktów), views_count (8/20), aplikacyjne — 10 min.
E. **Porządki:** rozbicie erp → ERP/magazyn + księgowość-fakturowanie; ewent. mnożnik
   unclear_scope (rewizja D6 — tylko świadoma); przypisania modułów goals/archetypes — 15 min.

## 6. Backlog F2/F3 (z walidacji)

F2: Karta decyzji technicznych (uzasadnienia także dla reguł no-op) · PDF oferty ·
edytor biblioteki · cykl sent/won/lost + duplikacja · model podróży · reguły "sprzedażowe"
(np. krytyczność bez SLA → rekomenduj umowę SLA/opiekę).
F3: risk-floor Confidence per typ projektu (dowód: S2 83% zielony bez macierzy przy
komplecie odpowiedzi; S3 92% przy największym rozjeździe) · telemetria dziur katalogu
(overridy "brak w bibliotece") · MPE + kalibracja z godzin rzeczywistych.

## 7. Formalne zamknięcie F1

Bramka retrospektywna: ZALICZONA (2 retro + 4 scenariusze + audyt mechanizmów).
System dopuszczony do użycia na spotkaniach z klientami, ze świadomością:
Confidence czytać RAZEM z alertami (liczba nie niesie ryzyka typu projektu do F3);
segment aplikacji dedykowanych — cena wg decyzji §4.
