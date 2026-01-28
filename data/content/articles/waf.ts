/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const WAF_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Cyber Security',
    title: {
      line1: 'WAF: Cyfrowy ochroniarz',
      line2: 'Twojego biznesu.',
    },
    subtitle:
      'Twój sklep jest otwarty 24/7. Czy jego ochrona również? Dowiedz się, dlaczego zwykły firewall to w dzisiejszych czasach za mało.',
  },
  lead: {
    quote: '"Obrońca musi mieć rację za każdym razem. Haker musi mieć rację tylko raz."',
    text: 'Jeśli prowadzisz sklep internetowy, portal B2B lub SaaS, Twoja strona jest nieustannie "ostrzeliwana". Boty skanują luki, skrypty próbują złamać hasła, a konkurencja może chcieć wywołać sztuczny tłok. Tradycyjny firewall to tylko portier przy bramie. <strong>WAF to uzbrojony ochroniarz, który sprawdza, co goście mają w kieszeniach.</strong>',
  },
  howItWorks: {
    title: 'Jak to działa? Analogia Lotniska',
    subtitle: 'Zrozumieć Bezpieczeństwo',
    text: 'Wyobraź sobie, że Twoja aplikacja to samolot, a użytkownicy to pasażerowie. Zobacz jak WAF odróżnia klienta od intruza:',
  },
  technical: {
    title: 'Technicznie: WAF vs Zwykły Firewall',
    text: 'Zwykły firewall widzi, że "przesyłana jest koperta". WAF otwiera kopertę i czyta list, sprawdzając, czy nie ma w nim gróźb. To różnica między warstwą sieciową a aplikacyjną.',
    headers: ['Cecha', 'Tradycyjny Firewall', 'WAF (Web Application)'],
    rows: [
      { label: 'Gdzie działa?', v1: 'Warstwa 3 i 4 (Sieć)', v2: 'Warstwa 7 (Aplikacja)' },
      { label: 'Co widzi?', v1: 'Adresy IP, Porty', v2: 'Treść zapytań, Cookies' },
      { label: 'Co blokuje?', v1: 'Nieautoryzowane IP', v2: 'SQLi, XSS, Boty' },
    ],
  },
  blocks: {
    title: 'Co dokładnie blokuje WAF?',
    subtitle: 'Zagrożenia OWASP Top 10',
    items: [
      {
        title: 'SQL Injection',
        desc: 'Próba kradzieży bazy danych poprzez wstrzyknięcie kodu do pól wyszukiwania lub logowania.',
        impact: 'Wyciek haseł i danych klientów.',
      },
      {
        title: 'Cross-Site Scripting (XSS)',
        desc: 'Wstrzykiwanie złośliwych skryptów JS, które kradną sesje użytkowników w przeglądarce.',
        impact: 'Przejęcie kont administratorów.',
      },
    ],
  },
  patching: {
    title: 'Virtual Patching: Wyścig z czasem',
    subtitle: 'Kupowanie bezpieczeństwa',
    text: 'Gdy w popularnym systemie (np. WordPress czy Magento) zostaje odkryta luka, hakerzy zaczynają ją wykorzystywać w ciągu kilku godzin. Twój zespół może potrzebować dni na poprawienie kodu. <strong>WAF zamyka tę lukę natychmiast</strong>, zanim Twój programista w ogóle otworzy laptopa.',
  },
  value: {
    title: 'Wartość Biznesowa',
    subtitle: 'Dlaczego warto zainwestować?',
    items: [
      {
        title: 'Zgodność z RODO',
        desc: 'WAF to jeden z fundamentów technicznej ochrony danych osobowych wymaganych przez prawo.',
      },
      {
        title: 'Ciągłość (Uptime)',
        desc: 'Zablokowanie ataku oznacza, że Twoi klienci mogą nadal kupować, gdy hakerzy próbują go zepsuć.',
      },
      {
        title: 'Virtual Patching',
        desc: 'WAF chroni przed nowymi lukami w Twoim CMS (np. WP) zanim Twój zespół zdąży go zaktualizować.',
      },
    ],
  },
  implementation: {
    title: 'Jak wdrożyć WAF?',
    cloud: {
      title: 'Cloud WAF',
      desc: 'Rozwiązania typu Cloudflare czy AWS WAF.',
      items: [
        'Wdrożenie w 5 minut (DNS)',
        'Brak sprzętu do utrzymania',
        'Zawsze aktualna baza zagrożeń',
      ],
      label: 'Dla 90% firm i E-commerce',
    },
    onPremise: {
      title: 'On-Premise',
      desc: 'ModSecurity lub dedykowane urządzenia.',
      items: [
        'Pełna kontrola nad danymi',
        'Brak zależności od chmury',
        'Trudna konfiguracja i koszty',
      ],
      label: 'Dla Banków i Rządu',
    },
  },
  cta: {
    title: 'Bezpieczeństwo zaczyna się tutaj.',
    text: 'Obawiasz się, że Twój sklep może być podatny na ataki? Zleć nam audyt bezpieczeństwa. Wdrożymy skuteczną ochronę WAF i zabezpieczymy Twój biznes.',
    primaryBtn: 'Zabezpiecz swoją aplikację',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
