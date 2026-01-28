export const IMAGE_FORMATS_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Web Performance',
    title: {
      line1: 'Next-Gen Image Formats:',
      line2: 'WebP i AVIF.',
    },
    subtitle:
      'Czy wiesz, że grafiki stanowią średnio 50% wagi Twojej strony? Czas zrzucić zbędne kilogramy i przejść na standardy 2025 roku.',
  },
  lead: {
    highlight:
      'W świecie, w którym uwaga użytkownika trwa krócej niż mrugnięcie okiem, waga strony ma kluczowe znaczenie. <strong>Tradycyjne formaty jak JPG czy PNG są jak walizki bez kółek</strong> – działają, ale ciężko się z nimi poruszać w internecie mobilnym.',
  },
  definitions: {
    title: 'Czym są WebP i AVIF?',
    subtitle: 'Technologia Kompresji',
    webp: {
      title: 'WebP – Następca tronu',
      desc: 'Stworzony przez Google. Łączy najlepsze cechy JPG (zdjęcia) i PNG (przezroczystość).',
      badge: 'Średnio 30% lżejszy od JPG',
    },
    avif: {
      title: 'AVIF – Nowy Król',
      desc: 'Oparty na kodeku wideo AV1. Oferuje niesamowitą kompresję przy zachowaniu mikro-detali.',
      badge: 'Nawet 50-80% lżejszy od JPG',
    },
  },
  duel: {
    title: 'Wielki Pojedynek Formatów',
    subtitle: 'JPG vs WebP vs AVIF',
    text: 'Nie wierzysz na słowo? Spójrz na liczby. Wzięliśmy standardowe zdjęcie produktowe w wysokiej rozdzielczości i poddaliśmy je testom.',
  },
  simulator: {
    title: 'Poczuj różnicę (Symulacja 3G)',
    subtitle: 'User Experience',
    text: 'Waga pliku to nie tylko liczba w folderze. To realny czas, który Twój klient spędza patrząc na pusty ekran. Zobacz jak wygląda ładowanie Twojej strony na telefonie przy słabym zasięgu.',
  },
  value: {
    title: 'Dlaczego to się opłaca?',
    subtitle: 'Business Value',
    items: [
      {
        title: 'Lepsze SEO',
        desc: 'Google promuje szybkie strony. AVIF to bilet do zielonych wyników w Core Web Vitals (LCP).',
      },
      {
        title: 'Mobile-First',
        desc: 'Strona o wadze 1MB zamiast 5MB załaduje się nawet przy słabym zasięgu w pociągu.',
      },
      {
        title: 'Szybszy Render',
        desc: 'Mniej danych do pobrania to mniejsze zużycie procesora i baterii w telefonie klienta.',
      },
    ],
  },
  checklist: {
    title: 'Twoja Lista Kontrolna SEO',
    subtitle: 'Zrób to dobrze',
  },
  support: {
    title: 'Czy są jakieś haczyki?',
    subtitle: 'Wsparcie Przeglądarek',
    text: 'Jeszcze niedawno AVIF był nowinką. Dziś sytuacja wygląda znacznie lepiej. Stosujemy strategię <strong>Graceful Degradation</strong> – serwujemy AVIF tym, którzy mogą go odczytać, a reszcie podajemy WebP lub klasyczny JPG.',
  },
  implementation: {
    title: 'Implementacja "Smart"',
    subtitle: 'Dla Developerów',
    text: 'Dzięki znacznikowi <code>&lt;picture&gt;</code> przeglądarka sama wybiera najlepszy format. Jeśli wspiera AVIF – pobierze najlżejszy plik. Jeśli nie – przejdzie do WebP, a na końcu do JPG.',
  },
  cta: {
    title: 'Sprawdźmy, ile waży Twoja strona!',
    text: 'Masz wrażenie, że Twój sklep działa ociężale? Wykonamy darmowy mini-audyt i powiemy Ci, ile MB możemy "zrzucić" dzięki nowym formatom.',
    primaryBtn: 'Zamów Audyt Wydajności',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
