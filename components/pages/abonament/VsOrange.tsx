import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, X, Plus, ArrowRight, Phone, Sparkles, Wallet } from 'lucide-react';
import Seo from '../../common/Seo';
import Container from '../../common/Container';
import AmbientBackground from '../../common/AmbientBackground';

const COMPARE_ROWS = [
  {
    label: 'Cena podstawowa',
    mixture: { status: 'mid', text: '179 zł / mc' },
    orange: { status: 'ok', text: '39 zł / mc (najtańszy)' },
  },
  {
    label: 'Konfiguracja strony',
    mixture: { status: 'ok', text: 'My za Ciebie (managed)' },
    orange: { status: 'no', text: 'AI generuje, sam korygujesz' },
  },
  {
    label: 'Local SEO + GBP synced',
    mixture: { status: 'ok', text: 'W cenie, Mapy Google managed' },
    orange: { status: 'no', text: 'Tylko podstawowe meta tags' },
  },
  {
    label: 'Google Business Profile management',
    mixture: { status: 'ok', text: 'Posty, opinie, godziny — automat' },
    orange: { status: 'no', text: 'Brak' },
  },
  {
    label: 'AI generuje treści blogowe',
    mixture: { status: 'ok', text: 'Premium+ (Claude, klient akceptuje)' },
    orange: { status: 'mid', text: 'Tylko one-time treści przy setupie' },
  },
  {
    label: 'Lead form → SMS w 30 sekund',
    mixture: { status: 'ok', text: 'W cenie wszystkich pakietów' },
    orange: { status: 'no', text: 'Brak' },
  },
  {
    label: 'Panel klienta (leady, raporty, faktury)',
    mixture: { status: 'ok', text: 'Pełny dashboard' },
    orange: { status: 'mid', text: 'Tylko edycja strony' },
  },
  {
    label: 'Backup szyfrowany',
    mixture: { status: 'ok', text: 'AES-GCM 256, dobowy R2' },
    orange: { status: 'mid', text: 'Platforma (bez transparentności)' },
  },
  {
    label: 'Czas ładowania (LCP)',
    mixture: { status: 'ok', text: '<1s Cloudflare edge' },
    orange: { status: 'mid', text: '~2s (Orange infra)' },
  },
  {
    label: 'Pakiet RODO+ (DPA jako procesor)',
    mixture: { status: 'ok', text: 'Premium+ ma DPA do podpisu' },
    orange: { status: 'no', text: 'Standard ToS Orange' },
  },
  {
    label: 'Polska spółka',
    mixture: { status: 'ok', text: 'Mixture Marketing Sp. z o.o. (KRS)' },
    orange: { status: 'ok', text: 'Orange Polska SA' },
  },
  {
    label: 'Support — telefon',
    mixture: { status: 'ok', text: 'Bezpośrednio Jakub: +48 794 443 551' },
    orange: { status: 'mid', text: 'Infolinia Orange (kolejka)' },
  },
];

const STATUS_LABEL: Record<'ok' | 'mid' | 'no', string> = {
  ok: 'Tak',
  mid: 'Częściowo',
  no: 'Nie',
};

const StatusCell: React.FC<{ status: 'ok' | 'mid' | 'no'; text: string; featured?: boolean }> = ({
  status,
  text,
  featured,
}) => {
  const Icon = status === 'ok' ? CheckCircle2 : status === 'no' ? X : Plus;
  const color =
    status === 'ok' ? 'text-emerald-600' : status === 'no' ? 'text-rose-400' : 'text-amber-500';
  return (
    <td className={`px-4 py-4 ${featured ? 'bg-emerald-50/30' : ''}`}>
      <div className="flex items-start gap-2">
        <Icon
          size={16}
          className={`${color} shrink-0 mt-0.5 ${status === 'mid' ? 'rotate-45' : ''}`}
          aria-hidden="true"
        />
        <span className="sr-only">{STATUS_LABEL[status]}:</span>
        <span className={`text-sm ${featured ? 'font-semibold text-dark' : 'text-gray-700'}`}>
          {text}
        </span>
      </div>
    </td>
  );
};

const VsOrange: React.FC = () => {
  const compareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Czy Mixture jest lepszy od Orange KlikAI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'KlikAI jest tańszy (39 zł/mc) ale to AI-generated DIY platforma — sam korzystasz. Mixture (179 zł/mc) to managed service z Local SEO, Google Business Profile management, leadami SMS, panelem klienta. Wybór zależy od skali — KlikAI dla wizytówki, Mixture dla aktywnego pozyskiwania klientów.',
        },
      },
      {
        '@type': 'Question',
        name: 'Czemu Mixture jest prawie 5× droższy od KlikAI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bo KlikAI to tylko hosting + AI-generated treści. Mixture dodaje: managed Local SEO (1500 zł/mc u agencji), Google Business Profile management (300 zł/mc u agencji), automatyzacja generowania leadów (200 zł/mc u dewelopera), backup szyfrowany. Łączna wartość Mixture vs KlikAI ≈ 2000 zł różnicy w usługach.',
        },
      },
      {
        '@type': 'Question',
        name: 'Czy mogę przenieść stronę z Orange KlikAI na Mixture?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tak — migracja treści jest w cenie pakietu. Domena może zostać u Orange lub przenieść do OVH (rekomendowane). Trwa 5-7 dni roboczych.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-dark">
      <Seo
        title="Mixture vs Orange KlikAI — strona w abonamencie dla firmy"
        description="Strona w abonamencie: Mixture 179 zł/mc (managed Local SEO + GBP + leady SMS) vs Orange KlikAI 39 zł/mc (DIY AI builder). Porównanie 12 cech. Decyzja w 3 minuty."
        canonical="/abonament/vs-orange-klikai/"
        lcpImage="/assets/images/sygnet.png"
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Strona w abonamencie', item: '/abonament/' },
          { name: 'Mixture vs Orange KlikAI', item: '/abonament/vs-orange-klikai/' },
        ]}
        jsonLd={compareJsonLd}
      />

      <AmbientBackground />

      <section className="relative pt-32 pb-16">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
              <Sparkles size={14} aria-hidden="true" />
              <span>Porównanie · Mixture vs Orange KlikAI</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-dark leading-[1.05] tracking-tight mb-6">
              Mixture vs Orange KlikAI
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-emerald-700">
                kiedy warto dopłacić
              </span>
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed mb-8 max-w-3xl mx-auto">
              Orange KlikAI to <strong>najtańsza</strong> oferta w PL (39 zł/mc). I to bardzo dobry
              produkt dla osób które chcą tylko mieć "wizytówkę online". Mixture za 179 zł/mc dodaje
              to, czego KlikAI nie ma:{' '}
              <strong className="text-dark">
                managed Local SEO + Google Business Profile + leady SMS + panel klienta
              </strong>
              .
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
              <Link
                to="/abonament/#pricing"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Zobacz pakiety Mixture <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a
                href="tel:+48794443551"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-dark hover:text-emerald-700 font-bold rounded-full border border-gray-200 hover:border-emerald-300 transition-all"
              >
                <Phone size={18} aria-hidden="true" />
                Konsultacja
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* ============ COMPARISON TABLE ============ */}
      <section className="py-16 bg-gray-50/60">
        <Container>
          <div className="max-w-5xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-4 mb-2" aria-hidden="true">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-t-2xl p-5 shadow-lg relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-emerald-700 text-xxs font-black uppercase tracking-[0.2em] shadow">
                  <Sparkles size={10} aria-hidden="true" />
                  Managed
                </div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-100 mb-2 mt-3">
                  Mixture (abonament)
                </p>
                <p className="text-2xl font-extrabold mb-1">od 179 zł / mc</p>
                <p className="text-xs text-emerald-50">+ Local SEO + GBP + leady SMS</p>
              </div>
              <div className="bg-white border-2 border-gray-100 rounded-t-2xl p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-orange-600 mb-2 mt-3">
                  Orange KlikAI
                </p>
                <p className="text-2xl font-extrabold text-dark mb-1">39 zł / mc</p>
                <p className="text-xs text-gray-600">DIY · AI generuje treści</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-b-2xl shadow-sm border border-t-0 border-gray-100">
                <caption className="sr-only">
                  Porównanie 12 cech: Mixture (abonament managed, od 179 zł/mc) vs Orange KlikAI
                  (DIY, 39 zł/mc).
                </caption>
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Cecha</th>
                    <th scope="col">Mixture (abonament)</th>
                    <th scope="col">Orange KlikAI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row.label} className="hover:bg-blue-50/20 transition-colors">
                      <th
                        scope="row"
                        className="text-left px-4 py-4 font-semibold text-dark text-xs uppercase tracking-wide w-1/3"
                      >
                        {row.label}
                      </th>
                      <StatusCell {...row.mixture} featured />
                      <StatusCell {...row.orange} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4 italic">
              KlikAI to przyzwoita oferta startowa. Mixture pozycjonuje się jako "managed service" —
              nie konkurujemy ceną, konkurujemy poziomem obsługi.
            </p>
          </div>
        </Container>
      </section>

      {/* ============ WARTOŚĆ DODANA 140 zł ============ */}
      <section className="py-16">
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
                    Cena u dewelopera/agencji
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
                  <td className="pt-4 font-black text-dark">RAZEM (rynkowa wartość)</td>
                  <td className="pt-4 text-right font-extrabold text-dark">~ 700 zł / mc</td>
                  <td className="pt-4 text-right font-extrabold text-emerald-700 text-base">
                    + 140 zł
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-6 italic text-center">
              ROI: dopłacasz 140 zł/mc i dostajesz ~700 zł rynkowej wartości miesięcznie. 5× return
              na samą wartość bez liczenia oszczędzonych godzin Twojej pracy.
            </p>
          </div>
        </Container>
      </section>

      {/* ============ DECYZJE ============ */}
      <section className="py-16 bg-gray-50/60">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark leading-tight mb-4">
              Kiedy KlikAI, kiedy Mixture?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                  <Wallet size={18} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-dark">Wybierz Orange KlikAI jeśli…</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-700">
                {[
                  'Potrzebujesz tylko "wizytówki online" (kontakt + 1-2 strony)',
                  'Budżet 39 zł/mc to maksimum',
                  'Klienci nie szukają Cię w Google (działasz tylko z polecenia)',
                  'Nie potrzebujesz aktywnego pozyskiwania leadów',
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle2
                      size={14}
                      className="text-orange-600 shrink-0 mt-1"
                      aria-hidden="true"
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 border-2 border-emerald-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Sparkles size={18} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-dark">Wybierz Mixture jeśli…</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-700">
                {[
                  'Chcesz aby klienci znajdowali Cię w Mapach Google',
                  'Aktywnie pozyskujesz klientów (telefon dzwoni codziennie)',
                  'Cenisz że ktoś robi za Ciebie SEO i GBP',
                  'Chcesz mierzyć skąd dzwonią klienci (call tracking)',
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle2
                      size={14}
                      className="text-emerald-600 shrink-0 mt-1"
                      aria-hidden="true"
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-16">
        <Container>
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-10 shadow-sm border border-emerald-100 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
              Mam więcej pytań przed zakupem
            </h2>
            <p className="text-gray-600 mb-6">
              Konsultacja przed podjęciem decyzji jest bezpłatna. Powiem Ci szczerze czy Mixture ma
              sens w Twoim przypadku, czy lepiej zostać przy KlikAI.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:+48794443551"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <Phone size={18} aria-hidden="true" />
                +48 794 443 551
              </a>
              <Link
                to="/abonament/"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-dark hover:text-emerald-700 font-bold rounded-full border border-gray-200 hover:border-emerald-300 transition-all"
              >
                Wszystkie pakiety <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default VsOrange;
