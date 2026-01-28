/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const POSTGRES_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Backend & Data',
    title: {
      line1: 'PostgreSQL: Król',
      line2: 'Baz Danych.',
    },
    subtitle:
      'Twoje dane zasługują na bankowy poziom bezpieczeństwa. Bez bankowych opłat. Dowiedz się, dlaczego NASA i Apple wybierają Open Source.',
  },
  lead: {
    highlight:
      'Dane to "ropa naftowa" XXI wieku. Ale ropa potrzebuje solidnego zbiornika. Jeśli wybierzesz źle, czeka Cię wyciek, niespójność danych lub... bankructwo przez koszty licencji.',
    text: 'Dziś <strong>PostgreSQL</strong> (często nazywany po prostu Postgres) jest standardem dla Apple, Instagrama, Spotify i NASA. W tym artykule wyjaśnimy, dlaczego ta darmowa baza danych jest fundamentem nowoczesnego biznesu.',
  },
  whatIs: {
    title: 'Co to jest PostgreSQL? (Więcej niż SQL)',
    subtitle: 'Definicja',
    text: 'PostgreSQL to obiektowo-relacyjny system zarządzania bazą danych (ORDBMS). Brzmi skomplikowanie? Uprośćmy to do dwóch kluczowych funkcji:',
    relational: {
      title: 'Relacyjny (SQL)',
      text: 'Idealny do tabel, faktur i użytkowników. Porządek jak w Excelu, tylko miliard razy szybszy.',
    },
    object: {
      title: 'Obiektowy / NoSQL',
      text: 'Idealny do elastycznych danych JSON i złożonych struktur. Elastyczność znana z MongoDB.',
    },
  },
  costs: {
    title: 'Argument nr 1: Koszty (Oracle vs Postgres)',
    subtitle: 'Efektywność Finansowa',
    text: 'Wiele korporacyjnych baz danych operuje na modelu licencyjnym "per core" (płacisz za każdy rdzeń procesora). PostgreSQL jest w <strong>100% darmowy (Open Source)</strong>. Koszt licencji wynosi zawsze 0 PLN.',
  },
  reliability: {
    title: 'Argument nr 2: Niezawodność (ACID)',
    subtitle: 'Bezpieczeństwo Transakcji',
    text: 'W świecie baz danych istnieje termin <strong>ACID</strong>. Oznacza on, że każda operacja finansowa lub zmiana danych albo uda się w całości, albo w ogóle nie zostanie zapisana. Nie ma stanów pośrednich (błędnych).',
  },
  killerFeature: {
    title: 'Killer Feature: JSONB',
    subtitle: 'NoSQL wewnątrz SQL',
    text: 'To funkcja, która zmienia zasady gry. Możesz przeszukiwać miliony dokumentów JSON z prędkością bazy SQL, bez utrzymywania osobnej bazy NoSQL.',
    btnShow: 'Zobacz zapytanie JSONB',
    btnHide: 'Ukryj zapytanie',
  },
  lockIn: {
    title: 'Brak Vendor Lock-in',
    subtitle: 'Wolność wyboru',
    text: 'Jeśli pokłócisz się ze swoim dostawcą chmury (AWS/Google), możesz przenieść bazę Postgres na własny serwer bez zmieniania ani jednej linijki kodu aplikacji. W przypadku baz komercyjnych jesteś "uwiązany" do jednego dostawcy.',
  },
  cta: {
    title: 'Przestań płacić za licencje. Zacznij inwestować w produkt.',
    text: 'Pomożemy Ci zmigrować Twoje dane z drogich, komercyjnych rozwiązań do wydajnego PostgreSQL. Zróbmy analizę oszczędności dla Twojego biznesu.',
    primaryBtn: 'Oblicz oszczędności z migracji',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
