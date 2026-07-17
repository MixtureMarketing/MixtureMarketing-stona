/**
 * Treść /web-development/landing-page/ — przepisana 2026-07-16 (krytyka 14/40).
 * Usunięte: wymyślone benchmarki KPI („Conversion Rate > 25%", „Viral
 * Coefficient"), obietnica „48h w opcji Turbo" (decyzja właściciela: bez
 * godzinowego SLA), „A/B testy w cenie" (decyzja właściciela: usunąć),
 * martwy blok simulator (hero-atrapa skasowana), badge. Zostaje: „gotowy
 * LP w 7–14 dni" (potwierdzone). Cena wg CMS: od 2 500 zł (hero twierdził
 * 3 900 — niezgodność z tabelą cen na tej samej stronie).
 */
export const LANDING_PAGE_CONTENT = {
  seo: {
    title: 'Landing Page High-Conversion | Strony Sprzedażowe',
    description:
      'Projektujemy strony landing page zoptymalizowane pod kątem maksymalnej konwersji. Idealne do kampanii Google Ads i generowania leadów.',
    image: '/assets/images/frontend.png',
  },
  hero: {
    title: {
      line1: 'Landing page',
      line2: 'pod wynik.',
    },
    description:
      'W kampaniach płatnych liczy się każda milisekunda. Budujemy strony lądowania, które ładują się natychmiast i prowadzą użytkownika prosto do celu.',
  },
  useCases: {
    title: 'Jeden cel, jedna akcja',
    description:
      'Landing page nie może być „o wszystkim". Projektujemy dedykowane strony pod konkretny cel biznesowy i źródło ruchu.',
    items: [
      {
        title: 'Lead magnet',
        subtitle: 'Budowa bazy',
        desc: 'Krótka strona oferująca darmową wartość (e-book, raport, checklistę) w zamian za adres e-mail. Kluczowa dla lejków marketingowych.',
        tags: ['Formularz', 'Autoresponder'],
      },
      {
        title: 'Strona sprzedażowa',
        subtitle: 'Sprzedaż bezpośrednia',
        desc: 'Długa strona sprzedażowa (long form). Szczegółowo omawia problem, rozwiązanie i korzyści produktu. Zbija obiekcje i zamyka sprzedaż.',
        tags: ['Storytelling', 'Dowody społeczne'],
      },
      {
        title: 'Webinar / wydarzenie',
        subtitle: 'Rejestracja',
        desc: 'Strona rejestracyjna z licznikiem odliczającym czas. Maksymalizuje liczbę zapisów na wydarzenie online lub offline.',
        tags: ['Licznik', 'Wideo w hero'],
      },
      {
        title: 'Premiera aplikacji',
        subtitle: 'Lista oczekujących',
        desc: 'Promocja aplikacji mobilnej przed premierą. Zbieranie listy oczekujących i budowanie napięcia wokół produktu.',
        tags: ['Mockupy', 'Waitlista'],
      },
    ],
  },
  psychology: {
    badge: 'Psychologia sprzedaży',
    title: {
      line1: 'Model AIDA.',
      line2: 'Nauka, nie przypadek.',
    },
    description:
      'Nie układamy sekcji „na czuja". Projektujemy landing page zgodnie z procesem decyzyjnym w mózgu klienta. Prowadzimy go za rękę od pierwszego wrażenia do kliknięcia.',
    steps: [
      {
        step: 'A',
        name: 'Uwaga',
        desc: 'Nagłówek (H1), który w 3 sekundy obiecuje konkretną wartość. Decyduje o tym, czy użytkownik zostanie.',
        tech: 'H1 / hero',
      },
      {
        step: 'I',
        name: 'Zainteresowanie',
        desc: 'Unikalna propozycja wartości. Pokazujemy produkt w akcji i wyjaśniamy, dlaczego jest lepszy.',
        tech: 'Cechy / wideo',
      },
      {
        step: 'D',
        name: 'Pożądanie',
        desc: 'Dowody społeczne (opinie, loga), liczby i język korzyści. Zmieniamy „chcę to sprawdzić" w „muszę to mieć".',
        tech: 'Opinie / dane',
      },
      {
        step: 'A',
        name: 'Działanie',
        desc: 'Jeden, wyraźny cel (CTA). Formularz lub przycisk zakupu bez zbędnych rozpraszaczy i linków wychodzących.',
        tech: 'CTA / formularz',
      },
    ],
  },
  integrations: {
    title: 'Twój landing to nie samotna wyspa',
    description:
      'Integrujemy stronę z Twoim ekosystemem marketingowym. Dane z formularzy trafiają automatycznie tam, gdzie ich potrzebujesz.',
  },
  cta: {
    title: 'Masz już kampanię, ale brakuje strony?',
    description:
      'Nie trać budżetu reklamowego na słabą stronę. Zbudujmy landing, zanim wystartują reklamy.',
    button: 'Rozpocznij projekt',
  },
};
