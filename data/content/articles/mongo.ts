/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const MONGO_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Big Data & NoSQL',
    title: {
      line1: 'MongoDB: Kiedy tabelki',
      line2: 'to zdecydowanie za mało.',
    },
    subtitle:
      'Zapisz dane tak, jak chcesz. Bez sztywnych tabel i ograniczeń. Poznaj lidera rewolucji NoSQL, który napędza nowoczesny internet.',
  },
  contextBox: {
    text: 'Ten artykuł jest częścią serii <strong>Architektura Danych</strong>.',
    linkText: 'Zobacz pełne porównanie: PostgreSQL vs MongoDB vs Redis vs Elasticsearch',
    linkUrl: '/baza-wiedzy/bazy-danych-kompendium-architekta',
  },
  lead: {
    highlight:
      'Przez 40 lat świat IT rządził się jedną zasadą: "Jeśli chcesz zapisać dane, stwórz tabelę, nazwij kolumny i nie zmieniaj zdania". <strong>To era SQL. Ale świat się zmienił.</strong>',
    text: 'Dziś dane są chaotyczne. Katalogi e-commerce, sensory IoT, media społecznościowe – wpychanie tych danych do sztywnych tabel SQL to koszmar programisty i hamulec dla biznesu. Tutaj wchodzi <strong>MongoDB</strong>.',
  },
  documents: {
    title: 'Dokumenty zamiast Wierszy',
    subtitle: 'Thinking in JSON',
    text: 'MongoDB nie używa tabel i wierszy. Używa Dokumentów (BSON). Dla biznesu oznacza to jedno: <strong>Koniec z rozbijaniem obiektów na kawałki.</strong>',
  },
  code: {
    title: 'Data Structure Sample',
    text: 'Wszystko, co dotyczy użytkownika, znajduje się w jednym "kartonie". Nie musisz przeszukiwać pięciu różnych półek, aby zrealizować zamówienie.',
  },
  reasons: {
    title: '3 Powody Biznesowe, by wybrać MongoDB',
    subtitle: 'Dlaczego liderzy stawiają na NoSQL?',
    items: [
      {
        title: '1. Elastyczność (Schema-less)',
        desc: 'W SQL zmiana struktury bazy to ryzykowne migracje. W MongoDB po prostu zaczynasz zapisywać nowe pola. To skraca Time-to-Market o całe tygodnie.',
      },
      {
        title: '2. Skalowalność Pozioma (Sharding)',
        desc: 'Gdy baza rośnie, SQL wymaga coraz droższych serwerów. MongoDB automatycznie dzieli dane między setki tanich serwerów. Twoja baza rośnie w bok, bez limitu.',
      },
      {
        title: '3. Wydajność dla Big Data',
        desc: 'Stworzone do połykania ogromnych ilości danych w czasie rzeczywistym. Logi, lokalizacja, historia kliknięć – Mongo zapisuje to błyskawicznie.',
      },
    ],
  },
  comparison: {
    title: 'Pojedynek: PostgreSQL vs. MongoDB',
    subtitle: 'Świadomy Wybór',
    headers: ['Cecha', 'PostgreSQL (SQL)', 'MongoDB (NoSQL)'],
    rows: [
      { label: 'Struktura danych', v1: 'Sztywna (Tabele)', v2: 'Elastyczna (Dokumenty)' },
      { label: 'Idealne do', v1: 'Finanse, ERP, Relacje', v2: 'Katalogi, IoT, Mobile Apps' },
      { label: 'Transakcje', v1: 'Absolutny priorytet (ACID)', v2: 'Dostępne, ale wolniejsze' },
      { label: 'Skalowanie', v1: 'Głównie w górę (Drogo)', v2: 'Nieskończone w bok (Taniej)' },
    ],
  },
  caseStudy: {
    title: 'Case Study: Katalog Produktów',
    subtitle: 'Rozwiązywanie Problemów',
    text: 'Wyobraź sobie sklep z elektroniką. Laptop ma: Procesor i RAM. Lodówka ma: Klasę energetyczną i Pojemność. W SQL musiałbyś stworzyć tabelę "Atrybuty" z tysiącami pustych wierszy.',
    verdict:
      '<strong>W MongoDB</strong> każdy produkt ma po prostu inny zestaw pól. Zapytanie: "Znajdź laptopy z 16GB RAM" działa błyskawicznie, mimo że obok leżą dane lodówek. To dlatego Mongo jest sercem systemów <strong>PIM</strong>.',
  },
  mern: {
    title: 'MERN Stack – Język Internetu',
    text1:
      'Dla developerów ważny jest ekosystem. MongoDB to litera "M" w popularnym stacku <strong>MERN</strong> (Mongo, Express, React, Node).',
    text2:
      'Ponieważ MongoDB "mówi" w formacie JSON – dokładnie tym samym, co Twoja strona i serwer – znika konieczność tłumaczenia danych. Cała aplikacja używa jednego języka.',
  },
  cta: {
    title: 'Twoja baza danych nie nadąża za zmianami?',
    text: 'Planujesz projekt Big Data lub dynamiczny startup? Skonsultuj z nami architekturę. Pomożemy Ci wybrać między SQL a NoSQL, by zapewnić maksymalną wydajność.',
    primaryBtn: 'Dobierz bazę do projektu',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
