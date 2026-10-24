import React from 'react';
import { Wallet } from 'lucide-react';
import Container from '../../common/Container';
import ComparisonPage from './comparison/ComparisonPage';
import type { ComparisonConfig } from './comparison/types';

/** WARTOŚĆ DODANA 140 zł — sekcja tylko dla KlikAI (między tabelą a „Kiedy KlikAI…”). */
const ValueAddSection: React.FC = () => (
  <section className="py-20 md:py-28">
    <Container>
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-dark leading-tight mb-4">
          Co dostajesz za dodatkowe 140 zł/mc?
        </h2>
        <p className="text-lg text-gray-600">
          Mixture 179 zł − Orange KlikAI 39 zł = 140 zł różnicy. Oto co Mixture dodaje:
        </p>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 text-xs font-black uppercase tracking-[0.15em] text-gray-500">
                Wartość
              </th>
              <th className="text-right py-3 text-xs font-black uppercase tracking-[0.15em] text-gray-500">
                Cena u dewelopera/agencji (szacunkowo)
              </th>
              <th className="text-right py-3 text-xs font-black uppercase tracking-[0.15em] text-emerald-700">
                W Mixture
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              ['Setup Local SEO (Mapy + meta + schema)', '~ 1 500 zł one-time', 'W cenie'],
              ['Google Business Profile management', '~ 300 zł / mc', 'W cenie'],
              ['Lead automation (form → SMS w 30s)', '~ 200 zł / mc', 'W cenie'],
              ['Panel klienta (leady, raporty, faktury)', '~ 150 zł / mc', 'W cenie'],
              ['Backup szyfrowany R2 + monitoring', '~ 50 zł / mc', 'W cenie'],
            ].map(([feat, market, mm]) => (
              <tr key={feat}>
                <td className="py-3 font-semibold text-dark">{feat}</td>
                <td className="py-3 text-right text-gray-600">{market}</td>
                <td className="py-3 text-right font-bold text-emerald-700">{mm}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-emerald-200">
              <td className="pt-4 font-black text-dark">RAZEM (szacunek rynkowy)</td>
              <td className="pt-4 text-right font-extrabold text-dark">~ 700 zł / mc</td>
              <td className="pt-4 text-right font-extrabold text-emerald-700 text-base">
                + 140 zł
              </td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-6 italic text-center">
          ROI: dopłacasz 140 zł/mc i dostajesz ~700 zł rynkowej wartości miesięcznie. 5× return na
          samą wartość bez liczenia oszczędzonych godzin Twojej pracy.
        </p>
      </div>
    </Container>
  </section>
);

const VS_ORANGE = {
  seo: {
    title: 'Mixture vs Orange KlikAI — strona w abonamencie dla firmy',
    description:
      'Strona w abonamencie: Mixture 179 zł/mc (Local SEO + GBP + leady SMS) vs Orange KlikAI 39 zł/mc (DIY AI builder). Porównanie 12 cech.',
    canonical: '/abonament/vs-orange-klikai/',
    breadcrumb: 'Mixture vs Orange KlikAI',
  },
  hero: {
    badge: 'Porównanie · Mixture vs Orange KlikAI',
    title: 'Mixture vs Orange KlikAI',
    highlight: 'kiedy warto dopłacić',
    lead: (
      <>
        Orange KlikAI to <strong>najtańsza</strong> oferta w PL (39 zł/mc). I to bardzo dobry
        produkt dla osób które chcą tylko mieć "wizytówkę online". Mixture za 179 zł/mc dodaje to,
        czego KlikAI nie ma:{' '}
        <strong className="text-dark">
          managed Local SEO + Google Business Profile + leady SMS + panel klienta
        </strong>
        .
      </>
    ),
  },
  plans: {
    mixtureNote: '+ Local SEO + GBP + leady SMS',
    competitor: {
      label: 'Orange KlikAI',
      labelColor: 'text-orange-700',
      price: '39 zł / mc',
      note: 'DIY · AI generuje treści',
    },
  },
  table: {
    scrollLabel: 'Tabela porównawcza: Mixture vs Orange KlikAI',
    caption:
      'Porównanie 12 cech: Mixture (abonament managed, od 179 zł/mc) vs Orange KlikAI (DIY, 39 zł/mc).',
    competitorHeader: 'Orange KlikAI',
    rows: [
      {
        label: 'Cena podstawowa',
        mixture: { status: 'mid', text: '179 zł / mc' },
        competitor: { status: 'ok', text: '39 zł / mc (najtańszy)' },
      },
      {
        label: 'Konfiguracja strony',
        mixture: { status: 'ok', text: 'My za Ciebie (managed)' },
        competitor: { status: 'no', text: 'AI generuje, sam korygujesz' },
      },
      {
        label: 'Local SEO + GBP synced',
        mixture: { status: 'ok', text: 'W cenie, Mapy Google managed' },
        competitor: { status: 'no', text: 'Tylko podstawowe meta tags' },
      },
      {
        label: 'Google Business Profile management',
        mixture: { status: 'ok', text: 'Posty, opinie, godziny — automat' },
        competitor: { status: 'no', text: 'Brak' },
      },
      {
        label: 'AI generuje treści blogowe',
        mixture: { status: 'ok', text: 'Premium+ (Claude, klient akceptuje)' },
        competitor: { status: 'mid', text: 'Tylko one-time treści przy setupie' },
      },
      {
        label: 'Lead form → SMS w 30 sekund',
        mixture: { status: 'ok', text: 'W cenie wszystkich pakietów' },
        competitor: { status: 'no', text: 'Brak' },
      },
      {
        label: 'Panel klienta (leady, raporty, faktury)',
        mixture: { status: 'ok', text: 'Pełny dashboard' },
        competitor: { status: 'mid', text: 'Tylko edycja strony' },
      },
      {
        label: 'Backup szyfrowany',
        mixture: { status: 'ok', text: 'AES-GCM 256, dobowy R2' },
        competitor: { status: 'mid', text: 'Platforma (bez transparentności)' },
      },
      {
        // Bez wymyślonej liczby LCP konkurenta (reklama porównawcza bez pomiaru)
        label: 'Czas ładowania (LCP)',
        mixture: { status: 'ok', text: '<1s Cloudflare edge' },
        competitor: { status: 'mid', text: 'Zależny od platformy' },
      },
      {
        label: 'Pakiet RODO+ (DPA jako procesor)',
        mixture: { status: 'ok', text: 'Premium+ ma DPA do podpisu' },
        competitor: { status: 'no', text: 'Standard ToS Orange' },
      },
      {
        label: 'Polska spółka',
        mixture: { status: 'ok', text: 'Mixture Marketing Sp. z o.o. (KRS)' },
        competitor: { status: 'ok', text: 'Orange Polska SA' },
      },
      {
        label: 'Support — telefon',
        mixture: { status: 'ok', text: 'Bezpośrednio Jakub: +48 794 443 551' },
        competitor: { status: 'mid', text: 'Infolinia Orange (kolejka)' },
      },
    ],
    footnote:
      'KlikAI to przyzwoita oferta startowa. Mixture pozycjonuje się jako "managed service" — nie konkurujemy ceną, konkurujemy poziomem obsługi.',
  },
  extraSection: <ValueAddSection />,
  decisions: {
    heading: 'Kiedy KlikAI, kiedy Mixture?',
    muted: true,
    competitor: {
      heading: 'Wybierz Orange KlikAI jeśli…',
      icon: Wallet,
      iconTone: 'bg-orange-100 text-orange-700',
      checkColor: 'text-orange-600',
      items: [
        'Potrzebujesz tylko "wizytówki online" (kontakt + 1-2 strony)',
        'Budżet 39 zł/mc to maksimum',
        'Klienci nie szukają Cię w Google (działasz tylko z polecenia)',
        'Nie potrzebujesz aktywnego pozyskiwania leadów',
      ],
    },
    mixtureItems: [
      'Chcesz aby klienci znajdowali Cię w Mapach Google',
      'Aktywnie pozyskujesz klientów (telefon dzwoni codziennie)',
      'Cenisz że ktoś robi za Ciebie SEO i GBP',
      'Chcesz mierzyć skąd dzwonią klienci (call tracking)',
    ],
  },
  /**
   * FAQ widoczne na stronie i w JSON-LD z jednej tablicy (wcześniej tylko w schemie —
   * naruszenie wytycznych Google). Usunięte pytanie „5× droższy" (zmyślone „wartości
   * rynkowe" 1500/300/200 zł/mc, „≈ 2000 zł różnicy") oraz niepotwierdzone „OVH
   * (rekomendowane)" i „5-7 dni roboczych".
   */
  faq: {
    items: [
      {
        q: 'Czy Mixture jest lepszy od Orange KlikAI?',
        a: 'KlikAI jest tańszy (39 zł/mc) ale to AI-generated DIY platforma — sam korzystasz. Mixture (179 zł/mc) to managed service z Local SEO, Google Business Profile management, leadami SMS, panelem klienta. Wybór zależy od skali — KlikAI dla wizytówki, Mixture dla aktywnego pozyskiwania klientów.',
      },
      {
        q: 'Czy mogę przenieść stronę z Orange KlikAI na Mixture?',
        a: 'Tak — migracja treści jest w cenie pakietu.',
      },
    ],
  },
  cta: {
    muted: true,
    heading: 'Mam więcej pytań przed zakupem',
    text: 'Konsultacja przed podjęciem decyzji jest bezpłatna. Powiem Ci szczerze czy Mixture ma sens w Twoim przypadku, czy lepiej zostać przy KlikAI.',
    phoneFirst: true,
    link: { to: '/abonament/', label: 'Wszystkie pakiety' },
  },
} satisfies ComparisonConfig;

const VsOrange: React.FC = () => <ComparisonPage config={VS_ORANGE} />;

export default VsOrange;
