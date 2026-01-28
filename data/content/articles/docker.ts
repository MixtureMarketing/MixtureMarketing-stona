export const DOCKER_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Infrastruktura & Konteneryzacja',
    title: {
      line1: 'Docker: Koniec z wymówką',
      line2: '"U mnie działa"',
    },
    subtitle:
      'Oszczędzaj czas, budżet i nerwy zespołu deweloperskiego. Poznaj standard DevOps, który napędza nowoczesny biznes w 2025 roku.',
  },
  lead: {
    highlight:
      'Wyobraź sobie, że programista kończy pracę, prezentuje idealnie działającą aplikację na swoim laptopie, ale po wrzuceniu na serwer... wszystko się sypie. <strong>"Dziwne, u mnie działa"</strong> – to zdanie kosztowało firmy miliardy dolarów w opóźnieniach.',
    text: '<strong>Docker</strong> powstał, aby zakończyć tę erę niepewności. Zamiast wysyłać sam kod, wysyłamy całe "cyfrowe pudełko" (kontener), w którym znajduje się wszystko: od systemu operacyjnego, przez biblioteki, aż po konfigurację. To fundament, na którym budujemy skalowalne aplikacje dedykowane w Mixture Marketing.',
  },
  whatIs: {
    title: 'Czym jest Docker? (Standard Kontenerowy)',
    subtitle: 'Rewolucja w logistyce kodu',
    text: 'Zanim wprowadzono standardowy kontener morski, załadunek towarów był chaotyczny i powolny. Docker zrobił z oprogramowaniem to samo – ustandaryzował sposób, w jaki pakujemy i uruchamiamy aplikacje, niezależnie od tego, czy korzystają z Node.js, Pythona czy Go.',
    items: ['Kod źródłowy', 'Zależności systemowe', 'Zasoby danych', 'Konfiguracja runtime'],
    guarantee:
      '<strong>Gwarancja spójności:</strong> Jeśli kontener uruchomi się na MacBooku dewelopera, masz 100% pewności, że zadziała identycznie na serwerze produkcyjnym w chmurze AWS. To eliminuje "niespodzianki" podczas wdrożeń niemal do zera.',
  },
  vsVm: {
    title: 'Docker vs. Maszyny Wirtualne (VM)',
    subtitle: 'Lekkość przekłada się na zysk',
    text: 'Maszyny wirtualne to "Domy Jednorodzinne" – każda potrzebuje własnej instalacji systemu operacyjnego. Docker to "Mieszkania w Bloku" – wszystkie korzystają ze wspólnej infrastruktury serwera, ale pozostają w pełni odizolowane. To pozwala na uruchomienie <strong>10x więcej aplikacji</strong> na tym samym sprzęcie.',
  },
  benefits: {
    title: '4 Powody, dla których Twój biznes potrzebuje Dockera',
    subtitle: 'Zalety Ekonomiczne',
    items: [
      {
        title: '1. Błyskawiczny Start',
        text: 'Wdrożenie nowego programisty do projektu trwa minuty, a nie dni. Kod uruchamia się jedną komendą, bez żmudnej konfiguracji środowiska.',
      },
      {
        title: '2. Bezpieczeństwo Izolacji',
        text: 'Awarie wewnątrz jednego kontenera nie wpływają na pozostałe części systemu. To kluczowe w architekturze mikroserwisów.',
      },
      {
        title: '3. Łatwe Skalowanie',
        text: 'Obsługa nagłych skoków ruchu (np. Black Friday) staje się prosta – system automatycznie dokłada kopie kontenerów tam, gdzie są potrzebne.',
      },
      {
        title: '4. Niezależność od Chmury',
        text: 'Docker chroni Cię przed tzw. "Vendor Lock-in". Przeniesienie kontenerów z AWS do Google Cloud lub na własny serwer jest szybkie i bezbolesne.',
      },
    ],
  },
  kubernetes: {
    title: 'Kubernetes (K8s) – Kapitan Twojej Floty',
    subtitle: 'Orkiestracja w skali Enterprise',
    text: 'Docker dostarcza "pudełka", ale <strong>Kubernetes</strong> jest kapitanem, który decyduje, gdzie je postawić, jak je rozmieścić na statku i co zrobić, gdy jedno z nich zacznie przeciekać. To mózg nowoczesnej infrastruktury IT.',
  },
  cta: {
    title: 'Uporządkujmy Twoją infrastrukturę raz na zawsze.',
    text: 'Twoje wdrożenia trwają zbyt długo? Masz dość błędów konfiguracyjnych na produkcji? Przenieśmy Twoją aplikację do nowoczesnych kontenerów Docker.',
    primaryBtn: 'Zamów Audyt Infrastruktury',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
