/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const CWV_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: SEO & Performance',
    title: {
      line1: 'Core Web Vitals 2025:',
      line2: 'Nowy standard jakości.',
    },
    subtitle:
      'Google nie wybacza już powolności. W 2025 roku Core Web Vitals to nie "miły dodatek", ale fundament widoczności Twojego biznesu.',
  },
  lead: {
    highlight:
      'Jeszcze kilka lat temu optymalizacja strony była opcjonalna. W 2025 roku to <strong>być albo nie być w wynikach wyszukiwania.</strong> Strona musi być nie tylko szybka, ale przede wszystkim stabilna i responsywna.',
  },
  metrics: {
    title: 'Wielka Trójka Metryk',
    subtitle: 'O co tak naprawdę mierzy Google?',
    items: [
      {
        title: 'LCP',
        subtitle: 'Largest Contentful Paint',
        desc: 'Szybkość ładowania największego elementu.',
        target: '< 2.5s',
      },
      {
        title: 'CLS',
        subtitle: 'Cumulative Layout Shift',
        desc: 'Stabilność wizualna strony podczas ładowania.',
        target: '< 0.1',
      },
      {
        title: 'INP',
        subtitle: 'Interaction to Next Paint',
        desc: 'Szybkość reakcji na każde kliknięcie.',
        target: '< 200ms',
      },
    ],
  },
  lcp: {
    title: '1. LCP – "Pokaż mi to, po co tu przyszedłem"',
    text: 'LCP mierzy czas, po jakim użytkownik zobaczy najważniejszą treść na ekranie (np. zdjęcie produktu). Jeśli trwa to dłużej niż 2.5 sekundy, użytkownik odnosi wrażenie, że Twoja strona "stoi".',
    solution:
      '<strong>Rozwiązanie:</strong> Formaty WebP/AVIF, szybki serwer (Redis) oraz CDN. Wszystko to, o czym pisaliśmy w poprzednich artykułach.',
  },
  cls: {
    title: '2. CLS – "Nie ruszaj mi przycisku, gdy w niego klikam!"',
    text: 'Każdemu z nas to się zdarzyło: chcesz kliknąć "Anuluj", ale w ostatniej chwili ładuje się reklama i klikasz "Kup teraz". To właśnie mierzy CLS.',
  },
  inp: {
    title: '3. INP – Responsywność bez zacięć',
    text: 'To najważniejsza zmiana ostatnich lat. INP mierzy opóźnienie reakcji strony na <strong>každą interakcję</strong> użytkownika. Jeśli klikasz "Dodaj do koszyka" i przez pół sekundy nic się nie dzieje – tracisz zaufanie klienta.',
  },
  mainThread: {
    title: 'Dlaczego strona "zamarza"?',
    subtitle: 'Main Thread Deep Dive',
    text: 'Głównym zabójcą responsywności jest <strong>Main Thread Blocking</strong>. Przeglądarka ma tylko jeden "wątek" do obsługi wyglądu i logiki. Jeśli wrzucisz tam ciężki czat lub dziesiątki analitycznych skryptów, nie będzie miała czasu na obsługę kliknięć użytkownika.',
  },
  money: {
    title: 'Przeliczmy to na pieniądze',
    subtitle: 'Wartość Biznesowa',
    items: [
      { brand: 'Vodafone', metric: 'LCP -31%', result: '+8% Sprzedaży' },
      { brand: 'Farfetch', metric: 'Speed Up', result: '+1.3% Konwersji' },
      { brand: 'Yahoo! Japan', metric: 'CLS -0.2', result: '+15% Odsłon' },
    ],
  },
  roi: {
    title: 'Ile kosztuje Cię sekunda zwłoki?',
    subtitle: 'ROI Calculator',
  },
  data: {
    title: 'Lab Data vs Field Data',
    subtitle: 'Nie daj się oszukać',
    text: 'To, że na Twoim szybkim komputerze w biurze strona działa płynnie, nie znaczy, że tak samo widzi ją klient na słabym zasięgu w pociągu.',
  },
  checklist: {
    title: 'Jak naprawić wyniki?',
    subtitle: 'Twoja Checklista',
  },
  cta: {
    title: 'Zbadaj kondycję swojej strony.',
    text: 'Nie trać klientów przez sekundy opóźnienia. Zamów profesjonalny audyt Core Web Vitals oparty na danych rzeczywistych (RUM).',
    primaryBtn: 'Zamów Audyt Wydajności',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
