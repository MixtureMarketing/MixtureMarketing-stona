-- Seed: est_params — parametry globalne silnika (docs/estimation/03).
-- Wartości przechowywane jako TEXT. Idempotentny: ON CONFLICT(key) DO UPDATE.
-- D8: stawka globalna 50 zł/h (edytowalna); stawki per kategoria w est_category_rates
--     (brak wierszy = fallback do hourly_rate — v1 nie seeduje kategorii).

INSERT INTO est_params (key, value, description) VALUES
  ('hourly_rate', '50', 'Globalna stawka godzinowa [zł] (D8).'),
  ('multiplier_cap', '0.40', 'Górny limit sumy mnożników ryzyka (D6): +40% ponad bazę.'),
  ('buffer', '0.10', 'Bufor kontyngencyjny doliczany na końcu (krok 4): +10%.'),
  ('offer_low_k', '0.20', 'Współczynnik zawężenia dolnej granicy oferty (krok 6).'),
  ('offer_high_k', '0.30', 'Współczynnik zawężenia górnej granicy oferty (krok 6).'),
  ('rounding_pln', '100', 'Zaokrąglenie widełek ofertowych w górę [zł].'),
  ('confidence_green', '80', 'Próg Confidence: ≥ zielony („możesz podać widełki").'),
  ('confidence_yellow', '60', 'Próg Confidence: ≥ żółty („widełki z zastrzeżeniami"); poniżej czerwony.'),
  ('confidence_completeness', '0.60', 'D23: próg kompletności (udział odpowiedzianych widocznych pytań); poniżej = „szacunek wstępny" (DRAFT).'),
  ('offer_validity_days', '30', 'f2a: termin ważności oferty w dniach, liczony od daty wystawienia. 30 — zatwierdzone przez Jakuba. Oferta bez daty ważności zaprasza do negocjacji po pół roku.'),
  -- f2a: warunki oferty („co w cenie") — TREŚĆ, więc dane, nie kod (inwariant 2). Jedna pozycja
  -- na wiersz (znak `|` rozdziela). Treść ZATWIERDZONA przez Jakuba jako właściciela — to
  -- zobowiązanie umowne na każdą wystawioną ofertę, nie tekst marketingowy. Nie zmieniaj bez niego.
  -- Uwaga na SLA: świadomie odsyła do pakietu utrzymaniowego i umowy, zamiast obiecywać
  -- konkretny okres w cenie każdego projektu (draft f2a obiecywał 6 miesięcy — odrzucone).
  ('offer_terms',
   'Wycena obejmuje projekt, wdrożenie i uruchomienie zakresu opisanego powyżej.|Kod semantyczny zoptymalizowany pod SEO i wydajność (Core Web Vitals).|Zarządzanie treścią przez panel — edycja bez ryzyka uszkodzenia układu.|Okres wsparcia technicznego po wdrożeniu oraz warunki opieki (SLA) — zgodnie z wybranym pakietem utrzymaniowym, doprecyzowanym w umowie.|Widełki wynikają z zakresu ustalonego na dzień wystawienia; zmiana zakresu wymaga aneksu.|Ceny netto; nie zawierają licencji ani usług zewnętrznych wskazanych w „Kosztach dodatkowych".',
   'f2a: warunki oferty, pozycje rozdzielone znakiem |. Treść zatwierdzona przez Jakuba (właściciel) — zobowiązanie umowne, spójne z S6 na stronie.')
ON CONFLICT(key) DO UPDATE SET
  value = excluded.value, description = excluded.description;
