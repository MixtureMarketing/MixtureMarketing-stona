import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, X, Plus, ArrowRight, Phone, Sparkles, Settings } from 'lucide-react';
import Seo from '../../common/Seo';
import Container from '../../common/Container';
import AmbientBackground from '../../common/AmbientBackground';

const COMPARE_ROWS = [
  {
    label: 'Cena podstawowa',
    mixture: { status: 'mid', text: '179 zł / mc (managed)' },
    wix: { status: 'mid', text: '60-165 zł / mc (DIY)' },
  },
  {
    label: 'Konfiguracja strony',
    mixture: { status: 'ok', text: 'My robimy za Ciebie' },
    wix: { status: 'no', text: 'Sam ją robisz (10+ h)' },
  },
  {
    label: 'Lokalne SEO (Mapy Google + dzielnice)',
    mixture: { status: 'ok', text: 'W cenie, auto-podstrony' },
    wix: { status: 'no', text: 'Brak (samemu schema)' },
  },
  {
    label: 'Google Business Profile (synced)',
    mixture: { status: 'ok', text: 'W cenie · auto sync godzin/postów' },
    wix: { status: 'no', text: 'Brak (samemu manage)' },
  },
  {
    label: 'AI Blog (treści automatyczne)',
    mixture: { status: 'ok', text: 'Premium+ (Claude, klient akceptuje)' },
    wix: { status: 'no', text: 'Brak' },
  },
  {
    label: 'Czas ładowania (LCP)',
    mixture: { status: 'ok', text: '<1s (Cloudflare edge)' },
    wix: { status: 'mid', text: '3-4s (Wix server)' },
  },
  {
    label: 'Hosting + SSL',
    mixture: { status: 'ok', text: 'W cenie (Cloudflare Workers)' },
    wix: { status: 'ok', text: 'W cenie (Wix infra)' },
  },
  {
    label: 'Edycja treści przez klienta',
    mixture: { status: 'ok', text: 'CMS Sveltia (proste)' },
    wix: { status: 'ok', text: 'Wix Editor (drag&drop)' },
  },
  {
    label: 'Galeria szablonów',
    mixture: { status: 'mid', text: '~4 branże, każda kustomizowana' },
    wix: { status: 'ok', text: '900+ szablonów' },
  },
  {
    label: 'Aplikacja mobilna do edycji',
    mixture: { status: 'no', text: 'Tylko web panel' },
    wix: { status: 'ok', text: 'iOS + Android app' },
  },
  {
    label: 'E-commerce (sklep)',
    mixture: { status: 'no', text: 'Nie oferujemy — tylko strony usługowe' },
    wix: { status: 'ok', text: 'Wix Stores (sklep online)' },
  },
  {
    label: 'Polski support',
    mixture: { status: 'ok', text: 'Email + telefon (PL, Pn-Pt 9-17)' },
    wix: { status: 'mid', text: 'Chat EN, polski forum' },
  },
  {
    label: 'Lokalna spółka PL',
    mixture: { status: 'ok', text: 'Sp. z o.o. PL (KRS 0001034514)' },
    wix: { status: 'no', text: 'Wix.com Ltd (Izrael, IE billing)' },
  },
  {
    label: 'Faktura VAT PL',
    mixture: { status: 'ok', text: 'Tak (Fakturownia.pl)' },
    wix: { status: 'mid', text: 'Tak, ale wystawiana z IE' },
  },
];

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
        <span className={`text-sm ${featured ? 'font-semibold text-dark' : 'text-gray-700'}`}>
          {text}
        </span>
      </div>
    </td>
  );
};

const VsWix: React.FC = () => {
  const compareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Czy Mixture jest lepszy od Wix?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Wix jest lepszy dla DIY (sam robisz, 60-165 zł/mc, dużo szablonów, app mobilna). Mixture jest lepszy dla managed (my robimy za Ciebie, Local SEO + GBP w cenie, polski support, Cloudflare edge). Wybór zależy od tego, czy chcesz prowadzić firmę czy stronę.',
        },
      },
      {
        '@type': 'Question',
        name: 'Dlaczego Mixture jest 3× droższy od Wix?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mixture to managed service — robimy stronę za Ciebie, prowadzimy Google Business Profile, generujemy treści przez AI (Premium+). Wix to DIY platform — sam wszystko klikasz. Realna różnica: 10 godzin pracy klienta z Wix wycenione na koszt = 500-1000 zł/mc straconego czasu vs 119 zł różnicy z Mixture.',
        },
      },
      {
        '@type': 'Question',
        name: 'Czy mogę przenieść stronę z Wix na Mixture?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tak. Migracja jest częścią procesu setup w cenie pakietu. Przenosimy treści, zdjęcia, przekierowujemy domenę. Wymaga ~5 dni roboczych z Wix na Mixture.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-dark">
      <Seo
        title="Mixture vs Wix — porównanie strony w abonamencie dla firmy"
        description="Strona w abonamencie: Mixture 179 zł/mc (managed) vs Wix 60-165 zł/mc (DIY). Porównanie 14 cech: Local SEO, GBP, czas ładowania, support PL, faktury VAT. Decyzja w 3 minuty."
        canonical="/abonament/vs-wix/"
        lcpImage="/assets/images/sygnet.png"
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Strona w abonamencie', item: '/abonament/' },
          { name: 'Mixture vs Wix', item: '/abonament/vs-wix/' },
        ]}
        jsonLd={compareJsonLd}
      />

      <AmbientBackground />

      <section className="relative pt-32 pb-16">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
              <Sparkles size={14} aria-hidden="true" />
              <span>Porównanie · Mixture vs Wix</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-dark leading-[1.05] tracking-tight mb-6">
              Mixture vs Wix
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-emerald-700">
                managed vs DIY
              </span>
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed mb-8 max-w-3xl mx-auto">
              Wix jest popularny w PL — i to dobry produkt dla osób które chcą same robić stronę.
              Mixture to <strong className="text-dark">managed service</strong> — robimy stronę za
              Ciebie + Local SEO + Google Business Profile. Porównanie 14 cech poniżej.
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
            <div className="grid sm:grid-cols-2 gap-4 mb-2">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-t-2xl p-5 shadow-lg relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-emerald-700 text-xxs font-black uppercase tracking-[0.2em] shadow">
                  <Sparkles size={10} aria-hidden="true" />
                  Managed
                </div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-100 mb-2 mt-3">
                  Mixture (abonament)
                </p>
                <p className="text-2xl font-extrabold mb-1">od 179 zł / mc</p>
                <p className="text-xs text-emerald-50">Robimy za Ciebie</p>
              </div>
              <div className="bg-white border-2 border-gray-100 rounded-t-2xl p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-gray-500 mb-2 mt-3">
                  Wix (DIY)
                </p>
                <p className="text-2xl font-extrabold text-dark mb-1">60–165 zł / mc</p>
                <p className="text-xs text-gray-600">Sam robisz, Wix daje narzędzia</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-b-2xl shadow-sm border border-t-0 border-gray-100">
                <tbody className="divide-y divide-gray-50 text-sm">
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row.label} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-4 py-4 font-semibold text-dark text-xs uppercase tracking-wide w-1/3">
                        {row.label}
                      </td>
                      <StatusCell {...row.mixture} featured />
                      <StatusCell {...row.wix} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </section>

      {/* ============ DECYZJE — kiedy Wix, kiedy Mixture ============ */}
      <section className="py-16">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark leading-tight mb-4">
              Kiedy Wix, kiedy Mixture?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Settings size={18} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-dark">Wybierz Wix jeśli…</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-gray-700">
                {[
                  'Lubisz sam projektować stronę (drag&drop)',
                  'Masz 10+ h tygodniowo na samodzielne ulepszenia',
                  'Chcesz sklep online (Mixture nie oferuje e-commerce)',
                  'Wystarczy Ci podstawowe SEO (bez Local + GBP managed)',
                  'Cena podstawowa 60 zł/mc to jedyny budżet',
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle2
                      size={14}
                      className="text-blue-600 shrink-0 mt-1"
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
                  'Chcesz aby ktoś zrobił stronę za Ciebie (managed)',
                  'Potrzebujesz lokalnych leadów z Google Maps',
                  'Cenisz polski support (PL telefon + email)',
                  'Wolisz polską spółkę i fakturę VAT z PL',
                  'Cloudflare edge (LCP <1s) ma dla Ciebie znaczenie',
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
      <section className="py-16 bg-gray-50/60">
        <Container>
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-10 shadow-sm border border-emerald-100 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
              Zdecydowany na Mixture?
            </h2>
            <p className="text-gray-600 mb-6">
              Mamy 4 pakiety od 179 zł/mc. Konsultacja przed kupnem bezpłatna.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/abonament/#pricing"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Zobacz pakiety <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a
                href="tel:+48794443551"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-dark hover:text-emerald-700 font-bold rounded-full border border-gray-200 hover:border-emerald-300 transition-all"
              >
                <Phone size={18} aria-hidden="true" />
                +48 794 443 551
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default VsWix;
