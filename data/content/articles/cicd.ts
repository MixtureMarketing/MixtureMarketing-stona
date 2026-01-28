/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const CICD_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Automatyzacja & Jakość',
    title: {
      line1: 'CI/CD: Dlaczego Twoja',
      line2: 'nie powinna być wdrażana ręcznie?',
    },
    subtitle:
      'Automatyczna autostrada dla Twojego kodu. Dowiedz się, jak zamienić stresujące aktualizacje w przewidywalny proces biznesowy.',
  },
  lead: {
    highlight:
      'Pamiętasz czasy, gdy aktualizacja strony wiązała się z modlitwą, by nic się nie zepsuło? Ręczne wgrywanie plików przez FTP to dziś technologiczny odpowiednik wysyłania listu gołębiem pocztowym – romantyczne, ale skrajnie ryzykowne.',
    text1:
      'W nowoczesnym procesie tworzenia <a href="/web-development/custom-app" class="text-secondary font-bold hover:underline">aplikacji biznesowych</a>, błąd ludzki jest największym zagrożeniem. Rozwiązaniem jest <strong>CI/CD</strong>. To zrobotyzowana linia produkcyjna, która bierze na siebie nudne i ryzykowne zadania, pozwalając Twojemu zespołowi skupić się na generowaniu wartości.',
    text2:
      'W Mixture Marketing traktujemy CI/CD jako standard – fundament bezpieczeństwa, który łączymy z technologiami takimi jak <a href="/baza-wiedzy/docker-konteneryzacja-przewodnik" class="text-secondary font-bold hover:underline">Docker</a>, aby zapewnić 100% powtarzalności wdrożeń.',
  },
  definitions: {
    title: 'Czym jest ten tajemniczy rurociąg?',
    subtitle: 'Definicja CI/CD',
    items: [
      {
        title: '1. CI (Ciągła Integracja)',
        label: 'Strażnik Jakości',
        desc: 'Każda zmiana w kodzie jest automatycznie sprawdzana przez boty. Jeśli programista popełni błąd, dowiaduje się o tym w 5 minut, a nie w dniu premiery.',
        guarantee: 'Gwarancja braku konfliktów w kodzie',
      },
      {
        title: '2. CD (Ciągłe Wdrażanie)',
        label: 'Automatyczny Dostawca',
        desc: 'Gotowy, przetestowany kod trafia na serwer bez udziału człowieka. Zero ryzyka, że ktoś zapomni skopiować kluczowy plik lub nadpisze bazę danych.',
        guarantee: 'Publikacja zmian w czasie rzeczywistym',
      },
    ],
  },
  visualization: {
    title: 'Wizualizacja: Jak wygląda Pipeline?',
    subtitle: 'Twój kod na sterydach',
    text: 'Zamiast chaosu, mamy uporządkowany ciąg zdarzeń. Każdy krok musi zakończyć się sukcesem, aby system przeszedł do kolejnego etapu. To jak sita, które przepuszczają tylko najczystsze złoto.',
  },
  reasons: {
    title: '4 Powody Biznesowe, by chcieć CI/CD',
    subtitle: 'Dlaczego to się opłaca?',
    items: [
      {
        title: '1. Skrócenie Time-to-Market',
        desc: 'Twoja konkurencja czeka na okno serwisowe w nocy. Ty wdrażasz nową promocję w środku dnia, popijając kawę. Szybkość to Twoja największa przewaga.',
      },
      {
        title: '2. Eliminacja "Błędu Piątku"',
        desc: 'Dzięki automatycznym testom, wdrożenie w piątek o 16:00 przestaje być rosyjską ruletką. Jeśli automat mówi "OK", system jest bezpieczny.',
      },
      {
        title: '3. Realne Oszczędności',
        desc: 'Godzina pracy Senior Developera jest droga. CI/CD wykonuje pracę, która kiedyś zajmowała ludziom setki godzin miesięcznie. Płacisz za innowacje, nie za kopiowanie plików.',
      },
    ],
  },
  comparison: {
    title: 'Pojedynek: Ręcznie vs Automat',
    subtitle: 'Bezpośrednie starcie',
    headers: ['Cecha', 'Wdrożenie Ręczne', 'CI/CD (Automat)'],
    rows: [
      { label: 'Czas procesu', v1: '30 - 120 minut', v2: '2 - 5 minut' },
      { label: 'Ryzyko awarii', v1: 'Wysokie', v2: 'Znikome' },
      { label: 'Weryfikacja testami', v1: 'Wybiórcza', v2: '100% pokrycia' },
      { label: 'Spokój ducha', v1: 'Brak', v2: 'Pełny' },
    ],
  },
  myth: {
    title: 'Mit: "To rozwiązanie tylko dla gigantów"',
    subtitle: 'Prawda o małym biznesie',
    text: 'Często słyszymy: "Amazon potrzebuje CI/CD, ale we mamy tylko jeden sklep". <strong>Jest dokładnie odwrotnie.</strong> Giganci mają sztaby ludzi do gaszenia pożarów. Mała firma nie może sobie pozwolić na 4 godziny niedostępności strony, bo każda minuta to realna strata, której nikt nie zrekompensuje. Automatyzacja to Twój najtańszy i najwierniejszy pracownik.',
  },
  cta: {
    title: 'Przestań wgrywać, zacznij wdrażać.',
    text: "Chcesz, aby Twój proces technologiczny był tak szybki i niezawodny jak w najlepszych Software House'ach? Skonsultuj swój projekt z naszymi ekspertami od automatyzacji.",
    primaryBtn: 'Zoptymalizuj swoje wdrożenia',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
