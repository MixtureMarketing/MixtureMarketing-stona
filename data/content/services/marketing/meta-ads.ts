/**
 * Treść /marketing/meta-ads/ — przepisana 2026-07-16 (krytyka 11/40).
 * Decyzje właściciela: TikTok Ads NIE świadczymy (karta + FAQ wypadły),
 * „Meta Business Partner" NIE mamy (badge wypadł), LinkedIn Ads NIE
 * (decyzja z huba); liczby branżowe bez procentów (mechanika CAPI zamiast
 * „odzyskujemy 30%"); cena hero = pakiet Start z CMS (1 500 zł/mc).
 * Usunięte atrapy: panel „META_ADS_MANAGER_V2.0" (ROAS 8.4x z powietrza),
 * „Flow Efficiency 98.2%", surowe tagi <strong> w hero.
 */
export const META_ADS_CONTENT = {
  seo: {
    title: 'Kampanie Meta Ads — reklama na Facebooku i Instagramie | Mixture',
    description:
      'Kampanie sprzedażowe i leadowe na Facebooku i Instagramie: lejek, remarketing, Conversions API. Dashboard z wynikami 24/7, budżety od 1 500 zł/mc.',
    image: '/assets/images/meta-ads.png',
  },
  hero: {
    title: {
      line1: 'Facebook i Instagram,',
      line2: 'które sprzedają.',
    },
    description:
      'Google łapie tych, którzy już szukają. Meta dociera do tych, którzy jeszcze nie wiedzą, że szukają — precyzyjnymi grupami odbiorców, testami kreacji i remarketingiem, który domyka sprzedaż.',
    cta: 'Umów bezpłatną konsultację',
  },
  /** Lejek — treść edukacyjna (bez „command center" z fejkową telemetrią). */
  funnel: {
    title: 'Reklama to lejek, nie pojedynczy post',
    description:
      'Pojedyncza reklama „na sprzedaż" do zimnej publiczności to najdroższy sposób wydawania budżetu. Budujemy sekwencję, w której każdy etap ma swoje zadanie.',
    stages: [
      {
        step: 'Zasięg',
        label: 'TOF — nowi odbiorcy',
        desc: 'Docieramy do osób, które nie znają Twojej marki. Zadanie: zatrzymać kciuk i zostawić ślad — nie sprzedawać na siłę.',
      },
      {
        step: 'Zaufanie',
        label: 'MOF — edukacja i ruch',
        desc: 'Pokazujemy produkt w użyciu, opinie klientów, materiał ekspercki. Zadanie: sprawić, żeby marka była znajoma, zanim padnie cena.',
      },
      {
        step: 'Sprzedaż',
        label: 'BOF — domknięcie',
        desc: 'Remarketing do osób, które oglądały ofertę albo porzuciły koszyk. Zadanie: usunąć ostatnią wątpliwość.',
      },
      {
        step: 'Powroty',
        label: 'Lojalność',
        desc: 'Oferty dla obecnych klientów — dosprzedaż i powracalność. Najtańsza sprzedaż to ta do kogoś, kto już Ci zaufał.',
      },
    ],
  },
  capi: {
    title: {
      line1: 'Blokady cookies zaniżają pomiar.',
      line2: 'CAPI go uzupełnia.',
    },
    description:
      'AdBlocki i polityka Apple sprawiają, że klasyczny Pixel nie widzi części konwersji. Conversions API przesyła zdarzenia bezpośrednio z Twojego serwera do Meta — bez pośrednictwa przeglądarki.',
    features: [
      {
        title: 'Pełniejszy pomiar',
        desc: 'Algorytm uczy się na zdarzeniach, których Pixel nie zarejestrował — decyzje o budżecie zapadają na lepszych danych.',
      },
      {
        title: 'Skuteczniejszy remarketing',
        desc: 'Grupy odbiorców budowane z danych serwerowych obejmują także osoby, które blokują skrypty w przeglądarce.',
      },
    ],
  },
  /** Dwa modele setupu — uczciwy przełącznik (bez fejkowego panelu metryk). */
  strategySelector: {
    title: 'Strategia dopasowana do celu',
    description:
      'Algorytmy Mety działają inaczej dla sklepu, a inaczej dla usług. Wybierz swój model, żeby zobaczyć, jak wygląda setup.',
    ecommerce: {
      label: 'E-commerce',
      desc: 'Sprzedaż z katalogu produktów.',
      items: [
        {
          title: 'Advantage+ Shopping',
          desc: 'Automatyzacja Mety pod naszą kontrolą budżetową: system dobiera produkty z katalogu pod konkretnego odbiorcę, my pilnujemy kosztu i wykluczeń.',
        },
        {
          title: 'Remarketing dynamiczny',
          desc: 'Osoba, która oglądała konkretny produkt, widzi w reklamie dokładnie ten produkt — nie ogólny baner.',
        },
      ],
    },
    b2b: {
      label: 'Usługi i B2B',
      desc: 'Zapytania, formularze, spotkania.',
      items: [
        {
          title: 'Formularze Lead Ads',
          desc: 'Formularz otwiera się wewnątrz Facebooka i sam uzupełnia dane — mniej tarcia, więcej wypełnień niż przy przekierowaniu na stronę.',
        },
        {
          title: 'Click-to-Messenger',
          desc: 'Reklama zaczyna rozmowę zamiast zbierać kliknięcia — dobre tam, gdzie klient przed zakupem musi zapytać.',
        },
      ],
    },
  },
  faqs: [
    {
      q: 'Czy muszę mieć konto na Instagramie?',
      a: 'Zalecamy, ale nie jest to technicznie wymagane do reklam na Facebooku. Do reklam na Instagramie (zwłaszcza Reels) profil firmowy jest jednak kluczowy dla wiarygodności.',
    },
    {
      q: 'Ile kosztuje dotarcie do 1000 osób?',
      a: 'To zależy od branży i grupy odbiorców (stawka CPM). W Polsce to zwykle kilkanaście–dwadzieścia kilka złotych za tysiąc wyświetleń — realną stawkę dla Twojej branży poznasz po pierwszych tygodniach kampanii.',
    },
    {
      q: 'Co to jest CAPI (Conversions API)?',
      a: 'To metoda przesyłania zdarzeń (zakupów, formularzy) bezpośrednio z Twojego serwera do Meta, z pominięciem przeglądarki. Dzięki temu pomiar nie znika razem z blokadą cookies, a algorytm uczy się na pełniejszych danych.',
    },
    {
      q: 'Jak wygląda raportowanie?',
      a: 'Dostajesz dostęp do dashboardu z wynikami 24/7 — patrzysz na te same liczby co my. Raz w miesiącu spotykamy się i omawiamy wyniki oraz plan na kolejny okres.',
    },
  ],
  cta: {
    title: 'Twoi klienci scrollują. Pytanie, co zobaczą.',
    description:
      'Umów się na bezpłatną konsultację — powiemy wprost, czy Meta Ads ma sens w Twojej sytuacji i od jakiego budżetu zaczyna się sensowna kampania.',
    button: 'Umów konsultację',
  },
};
