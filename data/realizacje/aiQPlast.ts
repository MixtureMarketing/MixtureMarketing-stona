/**
 * MIX-1275 (plan SEO A19): realizacja AI Q-PLAST, wpis z repo (nie z Sanity) za przełącznikiem
 * VITE_MM_REALIZACJA_AIQP. Tekst = szkic docs/tresci/MIX-1275.md (sekcja „Treść”) bez znaczników
 * źródeł [S1]–[S5]; test pilnuje, że każde zdanie stąd jest w szkicu. Fakty tylko ze źródeł
 * wymienionych w szkicu; miejsca bez źródła mają „[do uzupełnienia przez Jakuba]”.
 */
import type { PortableTextBlock } from '@portabletext/types';
import type { SanityCaseStudy } from '@/types/sanity';
import { localImage } from '@/services/cms/client';

export const AIQP_SLUG = 'ai-q-plast';
export const AIQP_PATH = `/portfolio/${AIQP_SLUG}/`;
export const AI_SERVICE_PATH = '/web-development/systemy-ai-aplikacje/';
export const WYCENA_PATH = '/wycena/';
export const AIQP_IMAGE_SRC = '/portfolio/ai-q-plast/terminal-928.webp';

type Span = string | { text: string; href: string } | { text: string; strong: true };

let keySeq = 0;
const key = () => `aiqp${(keySeq++).toString(36)}`;

const block = (
  spans: Span[],
  extra: { style?: 'normal' | 'h3'; listItem?: 'bullet' } = {},
): PortableTextBlock => {
  const markDefs: { _key: string; _type: 'link'; href: string }[] = [];
  const children = spans.map((s) => {
    if (typeof s === 'string') return { _type: 'span', _key: key(), text: s, marks: [] };
    if ('href' in s) {
      const k = key();
      markDefs.push({ _key: k, _type: 'link', href: s.href });
      return { _type: 'span', _key: key(), text: s.text, marks: [k] };
    }
    return { _type: 'span', _key: key(), text: s.text, marks: ['strong'] };
  });
  return {
    _type: 'block',
    _key: key(),
    style: extra.style ?? 'normal',
    ...(extra.listItem ? { listItem: extra.listItem, level: 1 } : {}),
    markDefs,
    children,
  } as PortableTextBlock;
};
const p = (...spans: Span[]) => block(spans);
const h3 = (text: string) => block([text], { style: 'h3' });
const li = (...spans: Span[]) => block(spans, { listItem: 'bullet' });
const b = (text: string) => ({ text, strong: true as const });

const challenge: PortableTextBlock[] = [
  p(
    b('Klient:'),
    ' AI Proto-Plast P.S.A. z Rzeszowa, firma, która rozwija system AI Q-PLAST dla zakładów z wtryskarkami. ',
    b('Zakres:'),
    ' aplikacja przy maszynie, serwer w zakładzie, panel kierownika, chmura licencji i strona produktu.',
  ),
  p(
    'Gdy na wtryskarce pojawia się wada wypraski, ustawiacz poprawia nastawy maszyny z pamięci i metodą prób. Zmienia jedną nastawę, czeka kilka cykli i ogląda detale. Każda próba to detale, które mogą pójść na braki.',
  ),
  p(
    'Druga strona problemu to wiedza. Co zadziałało przy tej formie i tym materiale, wie ten, kto wtedy stał przy maszynie. Po zmianie albo odejściu tej osoby tej wiedzy brakuje. Do tego dochodzi ryzyko: nastawa zbyt blisko granicy grozi maszynie, formie i materiałowi.',
  ),
  p('Klient miał silnik rekomendacji, ale był to program z okienkami, bez połączenia sieciowego.'),
];

const solution: PortableTextBlock[] = [
  p(
    'Zbudowaliśmy system, który prowadzi ustawiacza od zgłoszenia wady do zmiany nastaw. Działa w czterech krokach:',
  ),
  li(
    b('Zgłoszenie wady.'),
    ' Ustawiacz wybiera na terminalu wadę i gniazdo, na przykład „Niedolew”, „Gniazdo 1”.',
  ),
  li(
    b('Rekomendacja.'),
    ' Terminal podpowiada jedną zmianę z korekt tej samej formy i wady. Ustawiacz akceptuje albo odrzuca.',
  ),
  li(
    b('Ocena.'),
    ' Ustawiacz sam zmienia nastawę na maszynie, a po kilkunastu cyklach odpowiada, czy to pomogło.',
  ),
  li(
    b('Historia.'),
    ' Każda zmiana i ocena trafia do historii maszyny i formy. Następna zmiana widzi, co już próbowano.',
  ),
  p(
    'System nie steruje maszyną. Podpowiada, którą nastawę zmienić i o ile, a decyzję i wpis zostawia człowiekowi. Wartość poza limitem fizycznym maszyny lub materiału jest blokowana. Wyjście poza okno procesowe daje ostrzeżenie z powodem i zapis w historii.',
  ),
  p(
    'Gdy danych jest za mało, system mówi to wprost, na przykład „Za mało danych: 0 z 10 korekt dla tej formy i wady”, zamiast zgadywać. Tak samo panel kierownika: przy małej próbie pokazuje to otwarcie.',
  ),
  p(
    'Silnik klienta odtworzyliśmy jako usługę na serwerze. W trybie domyślnym liczy tak samo jak oryginał w wersji 25.6, liczba w liczbę.',
  ),
  p(
    'Jeśli szukasz podobnego rozwiązania dla swojej firmy, zobacz, jak pracujemy przy ',
    { text: 'systemach AI i aplikacjach', href: AI_SERVICE_PATH },
    '.',
  ),
  h3('Zakres prac'),
  li(
    b('Terminal przy maszynie:'),
    ' aplikacja desktopowa na Windows z ekranem dotykowym, do obsługi w rękawicach i na jedno spojrzenie.',
  ),
  li(b('Serwer w zakładzie:'), ' silnik rekomendacji i lokalna baza w sieci zakładu.'),
  li(
    b('Panel kierownika i administratora'),
    ' w przeglądarce: wady, które wracają, co pomogło, użytkownicy i licencje. Kierownik widzi tylko swój dział, a statystyki dotyczą zmian i form, nie ludzi.',
  ),
  li(
    b('Chmura:'),
    ' licencje, aktualizacje i zbieranie zdarzeń, bez danych osobowych pracowników.',
  ),
  li(b('Instalatory'), ' z podpisem i skanem bezpieczeństwa.'),
  li(b('Strona produktu'), ' AI Q-PLAST: statyczna strona bez cookies i bez analityki.'),
  h3('Technologia'),
  p(
    'System działa w zakładzie, nie w chmurze. Rekomendacje liczy serwer w sieci zakładu, a terminal i panel pracują bez internetu. Gdy brakuje łączności, terminal zapisuje zgłoszenie lokalnie i dosyła je po jej powrocie. Klucz licencji i podpisaną paczkę aktualizacji wgrywa się z pliku.',
  ),
  p(
    'Nazwy kont i kody PIN zostają na miejscu. Do chmury trafiają tylko licencje, aktualizacje i zdarzenia ze zgłoszeń, bez danych osobowych pracowników.',
  ),
  p(
    'Ustawiacz wpisuje nastawy sam, więc system pasuje do dowolnej wtryskarki. Odczyt wprost ze sterownika przez Euromap 77 (OPC UA) jest przygotowany w mapowaniu nastaw, ale jeszcze nie wdrożony.',
  ),
  p(
    'Ogólnie: aplikacja desktopowa na Windows, serwer z lokalną bazą, silnik rekomendacji w Pythonie, chmura w kontenerach. Czas odpowiedzi usługi silnika sprawdziliśmy na stacji testowej na 100 zapytaniach: wszystkie 100 bez błędu i każde poniżej progu 2 sekund. Każda wersja przechodzi niezależną weryfikację z testami na prawdziwych instalatorach Windows.',
  ),
];

const result: PortableTextBlock[] = [
  p(
    'Terminal, serwer zakładu i chmura testowa działają na danych testowych. Trwają odbiory częściowe u klienta. Pierwszy pilotaż jest zaplanowany w zakładzie produkcyjnym z wtryskarkami, na kilku maszynach. Wyniki pokażemy po jego zakończeniu.',
  ),
  li('Termin i miejsce pilotażu: ', b('[do uzupełnienia przez Jakuba]')),
  li(
    'Wynik pilotażu (np. mniej prób przy wadzie, czas do dobrej nastawy): ',
    b('[do uzupełnienia przez Jakuba]'),
  ),
  li('Zdanie klienta o współpracy (cytat za zgodą): ', b('[do uzupełnienia przez Jakuba]')),
  p(
    'Chcesz policzyć koszt podobnego systemu? ',
    { text: 'Sprawdź wycenę', href: WYCENA_PATH },
    ' albo przeczytaj więcej o tym, jak budujemy ',
    { text: 'systemy z elementami AI', href: AI_SERVICE_PATH },
    '.',
  ),
];

/** Wpis w kształcie dokumentu `caseStudy` z Sanity (ten sam szablon co inne realizacje). */
export const AIQP_CASE_STUDY: SanityCaseStudy = {
  _id: 'repo-mix1275-ai-q-plast',
  title: 'AI Q-PLAST: system AI dla wtryskarek',
  slug: AIQP_SLUG,
  client: 'AI Proto-Plast P.S.A.',
  category: 'web',
  subcategory: ['System AI', 'Aplikacja desktopowa'],
  excerpt:
    'Realizacja AI Q-PLAST: terminal przy wtryskarce podpowiada ustawiaczowi, którą nastawę zmienić i o ile. Serwer w zakładzie, praca bez internetu.',
  mainImage: localImage(AIQP_IMAGE_SRC),
  challenge,
  solution,
  result,
  techStack: [
    'Aplikacja desktopowa (Windows)',
    'Serwer w zakładzie z lokalną bazą',
    'Silnik rekomendacji w Pythonie',
    'Chmura w kontenerach',
  ],
};
