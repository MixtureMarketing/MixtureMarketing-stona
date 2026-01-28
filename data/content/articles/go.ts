export const GO_ARTICLE_CONTENT = {
  header: {
    badge: 'Baza Wiedzy: Cloud Engineering',
    title: {
      line1: 'Go (Golang): Język Chmury.',
      line2: 'Uber i Twitch już tam są.',
    },
    quote: '"Gdy Python jest za wolny, a Java za ciężka."',
  },
  contextBox: {
    text: 'Ten artykuł jest częścią serii <strong>Backend Architecture</strong>.',
    linkText: 'Zobacz pełne porównanie: Node vs Python vs Go vs Laravel',
    linkUrl: '/baza-wiedzy/backend-bez-tajemnic-przewodnik-cto',
  },
  lead: {
    text1:
      'W świecie Software Developmentu rzadko zdarza się, by język programowania został stworzony z tak konkretnego powodu. Google miało problem. Ich systemy były tak ogromne, że kompilacja kodu trwała godzinami, a serwery pożerały prąd jak małe miasta.',
    text2:
      'Inżynierowie Google (w tym twórcy języka C i systemu Unix) usiedli i stworzyli <strong>Go</strong> (znany też jako Golang). Cel był jeden: <strong>Wydajność bez kompromisów.</strong>',
    text3:
      'Dziś Go to nie ciekawostka. To fundament, na którym stoi nowoczesna chmura (Docker i Kubernetes są napisane w Go!).',
  },
  goroutines: {
    title: 'Goroutines: Tajna broń wydajności',
    subtitle: 'Współbieżność',
    text: 'W tradycyjnych językach (jak Java), każdy użytkownik wchodzący na stronę to tzw. "Wątek systemowy". Wątki są ciężkie. Go wprowadził <strong>Goroutines</strong>.',
  },
  business: {
    title: 'Biznesowy Argument: Taniej, Szybciej, Prościej',
    subtitle: 'Dlaczego migrować?',
    cards: [
      {
        title: 'Niższe Rachunki',
        desc: 'Skoro Go jest wydajniejszy i lżejszy, potrzebujesz mniejszych maszyn w AWS/Azure. Oszczędności rzędu tysięcy dolarów.',
      },
      {
        title: 'Szybki Dev',
        desc: 'Język jest prosty. Brak "magii". Nowy programista wdraża się w projekt w kilka dni, a utrzymanie kodu jest tanie.',
      },
      {
        title: 'Stabilność',
        desc: 'Static Typing. Kompilator wyłapuje błędy, zanim kod trafi na produkcję. Mniej awarii w nocy.',
      },
    ],
  },
  useCases: {
    title: 'Gdzie stosujemy Go?',
    subtitle: 'Use Cases',
    good: {
      title: 'Idealne zastosowania',
      items: [
        '<strong>Mikroserwisy:</strong> Małe, szybkie usługi. Go jest tu królem.',
        '<strong>High-Load Systems:</strong> Miliony zapytań na sekundę (streaming, reklamy).',
        '<strong>Cloud Native:</strong> Aplikacje pisane pod konteneryzację (K8s).',
      ],
    },
    bad: {
      title: 'Gdzie NIE polecamy',
      items: [
        '<strong>Proste wizytówki:</strong> Tu rządzi WordPress/PHP.',
        '<strong>Prototypy z GUI:</strong> Lepiej sprawdzi się JS/Python.',
        '<strong>Data Science:</strong> Tu Python jest bezkonkurencyjny.',
      ],
    },
  },
  comparison: {
    title: 'Pojedynek: Go vs Reszta Świata',
    subtitle: 'Porównanie',
  },
  techCorner: {
    title: 'Tech Corner: Prostota to siła',
    subtitle: 'Dla CTO',
    text: 'Go został zaprojektowany tak, by był czytelny. Spójrz na ten fragment kodu:',
  },
  cta: {
    title: 'Przebij barierę wydajności.',
    text: 'Masz "wąskie gardło" w systemie? Rosnące koszty chmury? Migracja krytycznych usług do Go może być najlepszą decyzją biznesową tego roku.',
    primaryBtn: 'Zamów analizę backendu',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
