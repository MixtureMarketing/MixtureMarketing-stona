export const TYPESCRIPT_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Code Quality',
    title: {
      line1: 'TypeScript: Polisa',
      line2: 'ubezpieczeniowa Twojego kodu.',
    },
    subtitle:
      'JavaScript jest elastyczny, ale niebezpieczny dla biznesu. Poznaj technologię, która znajduje błędy, zanim zrobi to Twój klient.',
  },
  lead: {
    highlight:
      'Wyobraź sobie inżyniera budowlanego, który dowiaduje się, że belka jest za słaba dopiero w momencie, gdy zawalił się dach. Właśnie tak działa czysty JavaScript.',
    text: 'W profesjonalnym Software Housie nie możemy sobie pozwolić na takie ryzyko. Dlatego naszym standardem jest TypeScript – technologia stworzona przez Microsoft, która stała się fundamentem stabilnego, skalowalnego biznesu.',
  },
  definition: {
    title: 'Czym jest TypeScript? (JavaScript na sterydach)',
    subtitle: 'Definicja',
    text: 'Najprościej mówiąc: to JavaScript z wbudowanym <strong>systemem ostrzegania</strong>. Technicznie jest to "nadzbiór" (superset), co oznacza, że każdy kod JS jest poprawnym kodem TS, ale TS dodaje do niego kluczową funkcję: Statyczne Typowanie.',
    cards: [
      {
        title: 'Analogia: Kartka vs Formularz',
        text: 'JavaScript to <strong>pusta kartka</strong>. W rubryce "Wiek" możesz wpisać "30", ale możesz też narysować kwiatek. System spróbuje to przetworzyć i... zawiesi się u klienta.',
        badge: 'Chaos: Błędy Runtime',
      },
      {
        title: 'Rozwiązanie: Walidacja',
        text: 'TypeScript to <strong>formularz cyfrowy</strong>. Jeśli w rubryce "Wiek" wpiszesz tekst, pole natychmiast zaświeci się na czerwono i nie pozwoli Ci wysłać wadliwego wniosku.',
        badge: 'Porządek: Typowanie statyczne',
      },
    ],
  },
  math: {
    title: 'Matematyka Błędów: Dlaczego to się opłaca?',
    subtitle: 'Analiza Kosztów',
    text: 'Badania (m.in. analiza post-mortem błędów na GitHubie) pokazują, że TypeScript potrafi wyeliminować nawet <strong>15% bugów produkcyjnych</strong> jeszcze przed uruchomieniem kodu.',
  },
  duel: {
    title: 'Pojedynek na Kod: Zobacz różnicę',
    subtitle: 'Praktyczny Przykład',
    text: 'Dla osób nietechnicznych różnica może wydawać się subtelna. Zobaczmy to na przykładzie prostego modułu do obliczania cen na fakturze.',
  },
  reasons: {
    title: '3 Powody, by wymagać TypeScript',
    subtitle: 'Zalety Biznesowe',
    cards: [
      {
        title: '1. Łatwiejsze skalowanie i refactoring',
        desc: "Gdy projekt rośnie do 50,000 linii kodu, zmiana nazwy jednej funkcji w czystym JS to 'rosyjska ruletka'. W TS kompilator natychmiast wskazuje wszystkie miejsca wymagające aktualizacji.",
      },
      {
        title: '2. Szybszy Onboarding',
        desc: 'TS działa jak żywa dokumentacja. Nowy programista nie musi zgadywać, co zwraca funkcja. Najeżdża myszką i widzi pełną strukturę danych. To oszczędza setki roboczogodzin.',
      },
      {
        title: '3. Standard nowoczesnych technologii',
        desc: 'Next.js, Angular, NestJS - wszystkie wiodące technologie webowe są tworzone w TS. Używając TypeScriptu, korzystasz z pełni możliwości najszybszych rozwiązań na rynku.',
      },
    ],
  },
  myth: {
    title: 'Mit: "TypeScript spowalnia prace"',
    text: 'To prawda, pisanie kodu zajmuje około 10-20% więcej czasu na starcie. Ale utrzymanie i naprawianie go zajmuje <strong>50% mniej czasu</strong>.',
    conclusion: 'Projekt w TS dowożony jest szybciej w skali całego cyklu życia produktu.',
  },
  cta: {
    title: 'Twoja aplikacja zasługuje na stabilność.',
    text: 'Masz dość błędów typu "Something went wrong"? Planujesz projekt, który ma działać latami? Zbudujmy go w oparciu o solidne fundamenty TypeScript.',
    primaryBtn: 'Rozpocznij bezpieczny projekt',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
