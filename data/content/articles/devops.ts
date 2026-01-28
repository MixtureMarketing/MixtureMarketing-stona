/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const DEVOPS_ARTICLE_CONTENT = {
  header: {
    badge: 'Przewodnik Strategiczny',
    title: {
      line1: 'DevOps: Fundament',
      line2: 'Nowoczesnego Biznesu',
    },
    subtitle:
      'Jak Docker, Kubernetes, AWS i CI/CD współpracują, by Twój system był bezpieczny, szybki i zawsze dostępny dla klienta.',
  },
  lead: {
    highlight:
      'W świecie IT istnieje stary konflikt. Programiści (Dev) chcą wdrażać nowości jak najszybciej. Administratorzy (Ops) dbają o stabilność, unikając zmian. Ten rozdźwięk to największy hamulec Twojego wzrostu.',
    text1:
      '<strong>DevOps</strong> to nie tylko "modny termin". To filozofia, która burzy mury między tworzeniem a utrzymaniem oprogramowania. Dzięki automatyzacji, błędy są wyłapywane zanim trafią do klienta, a nowe funkcje pojawiają się na stronie w minuty, a nie tygodnie.',
    text2:
      'W tym przewodniku przeanalizujemy 4 filary nowoczesnej infrastruktury, które wdrażamy w Mixture Marketing, budując skalowalne aplikacje dedykowane.',
  },
  pillars: {
    title: '4 Filary Niezawodnej Infrastruktury',
    subtitle: 'Fundamenty DevOps',
    items: [
      {
        title: '1. Docker (Izolacja)',
        text: 'Eliminuje problem "u mnie działa". Pakujemy aplikację w szczelny kontener z kompletem zależności. To fundament pod nowoczesny backend.',
        role: 'Rola: Standaryzacja środowiska pracy.',
        linkText: 'Czytaj więcej o Dockerze',
        linkUrl: '/baza-wiedzy/docker-konteneryzacja-przewodnik',
      },
      {
        title: '2. Kubernetes (Orkiestracja)',
        text: 'Zarządza armią kontenerów. Jeśli jeden serwer padnie, K8s automatycznie przenosi ruch na inny w milisekundach. To klucz do obsługi ruchu w dużych sklepach internetowych.',
        role: 'Rola: Inteligentny zarządca floty serwerów.',
      },
      {
        title: '3. AWS & Cloud (Elastyczność)',
        text: 'Nie kupujesz serwerów na własność. Wynajmujesz dokładnie tyle mocy, ile potrzebujesz w danej sekundzie. To gigantyczna optymalizacja kosztów operacyjnych.',
        role: 'Rola: Nielimitowane paliwo dla Twojej technologii.',
      },
      {
        title: '4. CI/CD (Automatyzacja)',
        text: 'Automatyczna taśma produkcyjna. Każda zmiana jest testowana przez boty przed publikacją.',
        role: 'Rola: Gwarancja jakości i szybkości.',
        linkText: 'Dlaczego nie wdrażać ręcznie?',
        linkUrl: '/baza-wiedzy/ci-cd-automatyzacja-wdrozen',
      },
    ],
  },
  process: {
    title: 'Wielka Synteza: Od Kodu do Klienta',
    subtitle: 'Proces DevOps',
    text: 'Zobacz, jak wygląda bezpieczna droga jednej linijki kodu w nowoczesnym ekosystemie. Bez stresu, bez przestojów, pełna przejrzystość.',
  },
  maturity: {
    title: 'Model Dojrzałości Infrastruktury',
    subtitle: 'Na jakim etapie jesteś?',
    text: 'Nie każdy projekt wymaga Kubernetes od pierwszego dnia. Dobieramy technologię do etapu rozwoju Twojego biznesu, dbając o budżet.',
    levels: [
      {
        lvl: 'Poziom 1',
        title: 'Startup / MVP',
        desc: 'Szybkie wejście na rynek przy minimalnych kosztach utrzymania.',
        features: ['Docker', 'CI/CD (GitHub Actions)', 'AWS Lightsail'],
      },
      {
        lvl: 'Poziom 2',
        title: 'Scale-up',
        desc: 'Stabilność dla rosnącego ruchu i ochrona przed przestojami.',
        features: ['Docker + ECS', 'Pełny Monitoring', 'Auto-scaling'],
      },
      {
        lvl: 'Poziom 3',
        title: 'Enterprise',
        desc: 'Niezawodność 99.99% i architektura mikroserwisowa.',
        features: ['Kubernetes (EKS)', 'Multi-region Cloud', 'Zero-downtime Deploy'],
      },
    ],
  },
  roi: {
    title: 'ROI: Dlaczego to się opłaca?',
    subtitle: 'Biznesowy Zwrot z Inwestycji',
    items: [
      {
        title: 'Szybkość (Time-to-Market)',
        text: 'Zmiany wdrażane 200x częściej. Twoja firma reaguje na ruchy konkurencji w godziny.',
      },
      {
        title: 'Oszczędność Chmury',
        text: 'Optymalizacja zasobów obniża rachunki z AWS nawet o 40% dzięki eliminacji "pustych przebiegów".',
      },
    ],
  },
  cta: {
    title: 'Twoja infrastruktura to fundament Twojej wolności.',
    text: 'Przestań bać się piątkowych wdrożeń i nagłych skoków ruchu. Pozwól nam zaprojektować system, który sam o siebie zadba. Skonsultuj swoją architekturę z naszymi inżynierami DevOps.',
    primaryBtn: 'Umów Bezpłatną Konsultację',
    secondaryBtn: 'Wróć do Bazy Wiedzy',
  },
};
