/* eslint-disable max-lines -- TODO: split Rzeszów-only sections into sub-components */
import React from 'react';
import {
  MapPin,
  Building2,
  TrendingUp,
  Layout,
  Smartphone,
  Search,
  ArrowRight,
  Calculator,
  Users,
  Network,
  GraduationCap,
  Car,
  Award,
  Factory,
  ShoppingBag,
  Code2,
  Train,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../common/Button';
import LazyMap from '../../common/LazyMap';
import HeroBadge from '../../common/HeroBadge';
import { useModal } from '../../../context/ModalContext';
import { SanityLocation } from '../../../services/cmsService';

interface PseoLocationContentProps {
  data: SanityLocation;
}

const PseoLocationContent: React.FC<PseoLocationContentProps> = ({ data }) => {
  const { openModal } = useModal();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const isHeadquartersCity = slug === 'rzeszow';

  return (
    <>
      {/* HERO SECTION */}
      <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <HeroBadge accent="secondary" className="mb-6">
            {data.city}
          </HeroBadge>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-dark leading-tight">
            {isHeadquartersCity ? (
              <>
                Agencja Marketingowa{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Rzeszów
                </span>{' '}
                — Mixture Marketing
              </>
            ) : (
              <>
                Partner Technologiczny dla firm z{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  {data.genitive}
                </span>
              </>
            )}
          </h1>
          {isHeadquartersCity ? (
            <p className="text-xl text-gray-600 mb-8">
              Mixture Marketing to agencja marketingowa i software house z siedzibą w Rzeszowie (Al.
              Piłsudskiego 17/4), działająca w Podkarpaciu. Realizujemy projekty web development
              (strony WWW, sklepy e-commerce, aplikacje Next.js), kampanie Google Ads i Meta Ads,
              pozycjonowanie SEO oraz branding dla firm z Rzeszowa, Mielca, Stalowej Woli, Krosna i
              Przemyśla. W 2025 roku agencja obsłużyła klientów m.in. z branży produkcyjnej (SSE
              Mielec), e-commerce i usług B2B, osiągając +127% wzrostu ruchu organicznego dla
              producenta z Mielca i −47% redukcji CPA dla e-commerce z Rzeszowa.
            </p>
          ) : (
            <p className="text-xl text-gray-600 mb-8">
              Lokalne zrozumienie rynku połączone z doświadczeniem w realizacji projektów
              międzynarodowych.
            </p>
          )}
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => openModal('consultation')}>
              Darmowa Konsultacja w {data.city}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Dowiedz się więcej
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-white rounded-3xl border border-gray-200 shadow-2xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/assets/images/grid.svg')] opacity-10"></div>
            <Building2 size={120} className="text-primary/20" />
            <div className="absolute bottom-8 left-8 right-8 bg-white/80 backdrop-blur-md p-6 rounded-xl border border-white/50 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Rozwój Biznesu</p>
                  <p className="text-lg font-bold text-dark">Skalowanie w {data.city}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Context */}
      <div
        id="details"
        className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 mb-20"
      >
        <h2 className="text-3xl font-bold mb-6">Dlaczego warto wybrać nas?</h2>
        <div className="prose prose-lg text-gray-600 max-w-none">
          <p className="text-xl font-medium mb-4">{data.businessContext}</p>
          <p>
            Działając na rynku {data.genitive}, wiemy jak ważne jest połączenie nowoczesnych
            technologii z lokalną specyfiką biznesową. Oferujemy kompleksowe podejście - od
            strategii, przez design, aż po wdrożenie i utrzymanie systemów.
          </p>
        </div>
      </div>

      {/* Rzeszów-only proof section — unikalna tresc dla siedziby */}
      {isHeadquartersCity && (
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            Jesteśmy z Rzeszowa. Stąd zaczynaliśmy.
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Mixture Marketing to agencja założona w sercu Podkarpacia. Codziennie pracujemy z
            lokalnym biznesem i społecznością technologiczną Rzeszowa — i to nas wyróżnia.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center mb-4">
                <Network size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Ekosystem IT Podkarpacia</h3>
              <p className="text-gray-600">
                Działamy w środowisku rzeszowskich firm technologicznych. Wspólnie z lokalną
                społecznością tworzymy klimat sprzyjający cyfryzacji MŚP z całego regionu — od
                Mielca i Stalowej Woli, przez Krosno, po Przemyśl.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Politechnika Rzeszowska</h3>
              <p className="text-gray-600">
                Rzeszów jako centrum techniczno-inżynierskie Podkarpacia daje dostęp do high-skill
                developerów i projektantów kształconych m.in. na Wydziale Elektrotechniki i
                Informatyki PRz. Bliska współpraca z uczelnią to dla nas stały dopływ świeżych
                kompetencji.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-xl flex items-center justify-center mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Lokalna społeczność tech</h3>
              <p className="text-gray-600">
                Spotykamy się z lokalnym środowiskiem na meetupach takich jak RzeszowJS, Tech
                Tuesdays Rzeszów i Podkarpackim Forum Technologii. Jeśli chcesz porozmawiać o
                projekcie twarzą w twarz — znajdziesz nas tam.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center mb-4">
                <Car size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Mobilnie po Rzeszowie i Podkarpaciu</h3>
              <p className="text-gray-600">
                Adres rejestrowy: Al. Józefa Piłsudskiego 17/4, centrum Rzeszowa. Pracujemy mobilnie
                — preferujemy spotkania u klienta z dojazdem na terenie Rzeszowa i Podkarpacia,
                alternatywnie kawiarnia / coworking w centrum miasta lub online.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 md:p-12 border border-indigo-100">
            <h3 className="text-2xl font-bold mb-6">Najczęściej zadawane pytania (Rzeszów)</h3>
            <div className="space-y-4">
              {[
                {
                  q: 'Czy oferujecie spotkania na żywo w Rzeszowie?',
                  a: (
                    <>
                      Tak. Preferujemy spotkania u klienta — dojeżdżamy na terenie Rzeszowa i całego
                      Podkarpacia bez dodatkowych opłat. Alternatywnie ustalamy spotkanie w kawiarni
                      lub przestrzeni coworkingowej w centrum miasta, albo online.
                    </>
                  ),
                },
                {
                  q: 'Czy obsługujecie firmy spoza Rzeszowa, z całego Podkarpacia?',
                  a: (
                    <>
                      Tak. Współpracujemy z klientami z Mielca, Krosna, Stalowej Woli, Przemyśla,
                      Dębicy i Jasła — zarówno zdalnie, jak i z dojazdem do siedziby klienta przy
                      większych projektach.
                    </>
                  ),
                },
                {
                  q: 'Jak wygląda pierwsza konsultacja?',
                  a: (
                    <>
                      Bezpłatna rozmowa 45–60 minut — online (Google Meet / Zoom), u Ciebie w
                      siedzibie albo w neutralnej lokalizacji w centrum Rzeszowa. Omawiamy cele
                      biznesowe, sytuację rynkową i wybieramy najwłaściwszy zakres współpracy — bez
                      zobowiązań i bez sztywnej oferty na siłę.
                    </>
                  ),
                },
                {
                  q: 'Czy macie portfolio z lokalnymi klientami z Rzeszowa i okolic?',
                  a: (
                    <>
                      Tak. Realizowaliśmy projekty dla firm produkcyjnych z Mielca i Stalowej Woli,
                      e-commerce z Rzeszowa oraz software house&apos;ów z Podkarpacia. Część
                      realizacji jest objęta NDA — szczegóły omawiamy podczas spotkania.
                    </>
                  ),
                },
                {
                  q: 'Czy świadczycie usługi pozycjonowania SEO w Rzeszowie?',
                  a: (
                    <>
                      Tak. Pełna oferta lokalnego SEO — od audytu technicznego, przez optymalizację
                      on-page, po link building i Local Pack. Szczegóły na stronie{' '}
                      <Link
                        to="/marketing/seo/rzeszow/"
                        className="text-primary hover:underline font-medium"
                      >
                        pozycjonowanie stron w Rzeszowie
                      </Link>
                      .
                    </>
                  ),
                },
                {
                  q: 'Tworzycie strony internetowe dla firm z Rzeszowa?',
                  a: (
                    <>
                      Tak — landing page&apos;e, strony korporacyjne, sklepy e-commerce i dedykowane
                      aplikacje webowe. Wycena widełkowa i harmonogram na stronie{' '}
                      <Link
                        to="/web-development/rzeszow/"
                        className="text-primary hover:underline font-medium"
                      >
                        tworzenie stron internetowych Rzeszów
                      </Link>
                      .
                    </>
                  ),
                },
                {
                  q: 'Jak wybrać agencję marketingową w Rzeszowie?',
                  a: (
                    <>
                      Wybierając agencję marketingową w Rzeszowie, sprawdź: (1) czy oferuje
                      spotkania na żywo na terenie miasta (u klienta lub w neutralnej lokalizacji),
                      (2) czy posiada portfolio z lokalnymi klientami z Podkarpacia, (3) czy łączy
                      kompetencje web development i performance marketing (Google Ads + SEO) pod
                      jednym dachem, (4) czy podaje widełkowy cennik bez ukrytych kosztów, (5) czy
                      oferuje bezpłatną konsultację. Mixture Marketing spełnia wszystkie kryteria —
                      model pracy oparty na dojeździe do klienta na terenie Rzeszowa i Podkarpacia,
                      portfolio m.in. z Mielca i Stalowej Woli, wycena widełkowa od pierwszego
                      maila.
                    </>
                  ),
                },
                {
                  q: 'Ile kosztuje strona internetowa w Rzeszowie?',
                  a: (
                    <>
                      Widełki cenowe Mixture: landing page od 3 900 zł, strona korporacyjna z CMS od
                      7 500 zł, sklep internetowy od 12 000 zł, dedykowana aplikacja webowa od 25
                      000 zł. Pełen cennik 2026 na stronie{' '}
                      <Link
                        to="/web-development/rzeszow/"
                        className="text-primary hover:underline font-medium"
                      >
                        strony internetowe Rzeszów
                      </Link>
                      .
                    </>
                  ),
                },
              ].map((item, i) => (
                <details
                  key={i}
                  className="group bg-white p-5 md:p-6 rounded-2xl border border-indigo-100 open:shadow-sm open:border-primary/30 transition-shadow"
                >
                  <summary className="font-semibold text-dark cursor-pointer list-none flex items-start justify-between gap-4 marker:hidden">
                    <span>{item.q}</span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 mt-1 w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-open:rotate-45 group-open:bg-primary/10 group-open:text-primary transition-transform"
                    >
                      +
                    </span>
                  </summary>
                  <p className="text-gray-600 mt-3">{item.a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* Agencja Marketingowa Rzeszów — sekcja H2 z target keyword */}
          <div className="mb-20 mt-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Agencja Marketingowa Rzeszów — co dla Ciebie zrobimy
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Mixture Marketing to lokalna agencja marketingowa Rzeszów z adresem rejestrowym przy
              Al. Piłsudskiego 17/4 (biuro wirtualne) — pracujemy mobilnie, dojeżdżamy do klienta.
              Łączymy kompetencje software house&apos;u (programowanie stron i aplikacji) z
              performance marketingiem (Google Ads, Meta Ads, SEO) i kreacją (branding, UI/UX).
              Pracujemy z firmami z Rzeszowa, Mielca, Stalowej Woli, Krosna, Przemyśla i Dębicy — a
              także zdalnie z klientami z całej Polski.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <Link
                to="/web-development/rzeszow/"
                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/40 hover:shadow-lg motion-safe:focus-visible:-translate-y-0.5 transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-4">
                  <Layout size={24} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  Strony internetowe{' '}
                  <ArrowRight
                    size={14}
                    aria-hidden="true"
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary"
                  />
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Strony WWW, sklepy e-commerce, landing page&apos;y, dedykowane aplikacje.
                  WordPress, Next.js, React.
                </p>
                <span className="text-xs text-primary font-semibold">Web dev Rzeszów →</span>
              </Link>

              <Link
                to="/marketing/seo/rzeszow/"
                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/40 hover:shadow-lg motion-safe:focus-visible:-translate-y-0.5 transition-all"
              >
                <div className="w-12 h-12 bg-violet-100 text-violet-700 rounded-xl flex items-center justify-center mb-4">
                  <Search size={24} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  Pozycjonowanie SEO{' '}
                  <ArrowRight
                    size={14}
                    aria-hidden="true"
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary"
                  />
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Lokalne SEO + Local Pack, audyty techniczne, link building, content SEO. Cennik
                  widełkowy.
                </p>
                <span className="text-xs text-primary font-semibold">SEO Rzeszów →</span>
              </Link>

              <Link
                to="/agencja-interaktywna-rzeszow/"
                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/40 hover:shadow-lg motion-safe:focus-visible:-translate-y-0.5 transition-all"
              >
                <div className="w-12 h-12 bg-pink-100 text-pink-700 rounded-xl flex items-center justify-center mb-4">
                  <Smartphone size={24} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  Agencja interaktywna{' '}
                  <ArrowRight
                    size={14}
                    aria-hidden="true"
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary"
                  />
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Pełna oferta 360°: strategia, branding, design, web, performance marketing,
                  narzędzia interaktywne.
                </p>
                <span className="text-xs text-primary font-semibold">Agencja interaktywna →</span>
              </Link>
            </div>
          </div>

          {/* Realizacje w Rzeszowie — anonimowe case studies (do nadpisania w Sanity) */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Nasze realizacje w Rzeszowie i na Podkarpaciu
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Wybrane wyniki — anonimowe ze względu na NDA. Pełne case studies prezentujemy podczas
              spotkania.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <article className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-xl flex items-center justify-center mb-4">
                  <Factory size={24} />
                </div>
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-2">
                  Producent z SSE Mielec
                </p>
                <h3 className="text-lg font-bold mb-2">
                  Strona korporacyjna B2B + kampania rekrutacyjna
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Branża: przemysł motoryzacyjny, 80 pracowników. Redesign strony korporacyjnej +
                  landing page rekrutacyjny.
                </p>
                <p className="text-2xl font-extrabold text-orange-700">+127%</p>
                <p className="text-xs text-gray-500">wzrost ruchu organicznego w 6 miesięcy</p>
              </article>

              <article className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
                  <ShoppingBag size={24} />
                </div>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
                  E-commerce z Rzeszowa
                </p>
                <h3 className="text-lg font-bold mb-2">Sklep internetowy + kampanie Google Ads</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Branża: wyposażenie biurowe B2B. Nowy sklep na Shoper + kampania Performance Max.
                </p>
                <p className="text-2xl font-extrabold text-emerald-700">−47%</p>
                <p className="text-xs text-gray-500">redukcja kosztu pozyskania klienta (CPA)</p>
              </article>

              <article className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center mb-4">
                  <Code2 size={24} />
                </div>
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
                  Software House z Podkarpacia
                </p>
                <h3 className="text-lg font-bold mb-2">Rebranding + nowa strona firmowa</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Branża: usługi IT, 25 pracowników. Pełny redesign identyfikacji + strona Next.js.
                </p>
                <p className="text-2xl font-extrabold text-indigo-700">3.2×</p>
                <p className="text-xs text-gray-500">wzrost liczby leadów z formularza WWW</p>
              </article>
            </div>
          </div>

          {/* Obszar działania — model pracy mobilnej + neutralne lokalizacje spotkań */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Gdzie się spotkamy — Rzeszów i całe Podkarpacie
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Pracujemy w modelu mobilnym: dojeżdżamy do klienta na terenie Rzeszowa i całego
              Podkarpacia (Mielec, Stalowa Wola, Krosno, Przemyśl, Dębica, Jasło). Adres rejestrowy:
              Al. Józefa Piłsudskiego 17/4 — używamy go również jako punkt orientacyjny przy
              spotkaniach w centrum miasta.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="rounded-2xl overflow-hidden border border-gray-200 aspect-video">
                <LazyMap
                  src="https://www.google.com/maps?q=Al.+J%C3%B3zefa+Pi%C5%82sudskiego+17,+35-074+Rzesz%C3%B3w&output=embed"
                  title="Mapa — Mixture Marketing Rzeszów (adres rejestrowy)"
                />
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Car size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Spotkanie u Ciebie</h3>
                    <p className="text-sm text-gray-600">
                      Standardowo dojeżdżamy do siedziby klienta — Rzeszów, Mielec, Stalowa Wola,
                      Krosno, Przemyśl, Dębica, Jasło i cały region. Bez dodatkowych opłat za dojazd
                      w obrębie Podkarpacia.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Train size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Neutralna lokalizacja w Rzeszowie</h3>
                    <p className="text-sm text-gray-600">
                      Możemy spotkać się w wybranej kawiarni lub przestrzeni coworkingowej w centrum
                      Rzeszowa (5 min od Dworca PKP). Wskazujemy konkretne miejsce po ustaleniu
                      terminu.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Godziny pracy zespołu</h3>
                    <p className="text-sm text-gray-600">
                      Poniedziałek–Piątek 9:00–17:00. Spotkania (na żywo lub online — Google Meet /
                      Zoom) ustalamy wcześniej mailem lub telefonicznie.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dla kogo pracujemy — branze (Rzeszow only) */}
      {isHeadquartersCity && (
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-4 text-center">
            Dla kogo pracujemy w Rzeszowie i na Podkarpaciu
          </h2>
          <p className="text-center text-gray-600 mb-10 max-w-3xl mx-auto">
            Specjalizujemy się w branżach, które dominują w gospodarce Podkarpacia — od produkcji i
            lotnictwa, przez handel internetowy, po lokalne firmy usługowe i software house'y.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Produkcja i przemysł',
                icon: <Factory size={24} />,
                desc: 'Firmy produkcyjne z Mielca, Stalowej Woli, Rzeszowa, Dębicy — strony B2B z konfiguratorami, katalogami produktów, generowanie leadów eksportowych.',
              },
              {
                title: 'E-commerce',
                icon: <ShoppingBag size={24} />,
                desc: 'Sklepy internetowe (WooCommerce, Shopify, dedykowane) — integracje z kurierami, płatnościami, hurtowniami. Pozycjonowanie i Google Ads dla e-commerce.',
              },
              {
                title: 'Lotnictwo i Aviation Valley',
                icon: <Award size={24} />,
                desc: 'Klaster Lotnictwa Polskiego, poddostawcy MRO, firmy szkoleniowe — strony korporacyjne EN/PL, materiały marketingowe na targi (Paris Air Show, ILA).',
              },
              {
                title: 'Software house i SaaS',
                icon: <Code2 size={24} />,
                desc: "Lokalne software house'y i startupy z Podkarpacia — landing page dla produktów SaaS, employer branding, kampanie rekrutacyjne IT.",
              },
              {
                title: 'Usługi lokalne',
                icon: <MapPin size={24} />,
                desc: 'Kancelarie prawne, gabinety medyczne, fizjoterapia, salony beauty, restauracje, hotele, agroturystyka — strony konwertujące + Google Ads z geo-targetingiem.',
              },
              {
                title: 'Edukacja i kursy',
                icon: <GraduationCap size={24} />,
                desc: 'Szkoły językowe, kursy zawodowe, studia podyplomowe, akademie biznesu — landing page rekrutacyjne, lead magnety, automatyzacja zapisów.',
              },
            ].map((industry, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 bg-[#F0F7FF] rounded-xl flex items-center justify-center text-secondary mb-4">
                  {industry.icon}
                </div>
                <h3 className="font-bold text-lg mb-2 text-dark">{industry.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{industry.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services in Location */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold mb-10 text-center">
          Kompleksowe wsparcie dla firm z {data.genitive}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Strony WWW',
              icon: <Layout size={24} />,
              desc: `Nowoczesne strony internetowe dla lokalnych biznesów.`,
              link: '/web-development/',
            },
            {
              title: 'Sklepy Online',
              icon: <Smartphone size={24} />,
              desc: `E-commerce zintegrowany z płatnościami i kurierami.`,
              link: '/web-development/ecommerce/',
            },
            {
              title: 'Pozycjonowanie',
              icon: <Search size={24} />,
              desc: `Bądź widoczny w Google, gdy klienci szukają usług w ${data.city}.`,
              link: '/marketing/seo/',
            },
          ].map((service, i) => (
            <Link
              key={i}
              to={service.link}
              className="block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/30 motion-safe:focus-visible:-translate-y-0.5 transition-all group"
            >
              <div className="w-12 h-12 bg-[#F0F7FF] rounded-xl flex items-center justify-center text-secondary mb-4 group-hover:bg-secondary group-hover:text-white transition-colors">
                {service.icon}
              </div>
              <h3 className="font-bold text-lg mb-2 text-dark flex items-center gap-2">
                {service.title}{' '}
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary"
                />
              </h3>
              <p className="text-sm text-gray-600">{service.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* SaaS abonament callout (Rzeszow only) — promuje nowy produkt subskrypcyjny */}
      {isHeadquartersCity && (
        <div className="mb-20">
          <Link
            to="/abonament/"
            className="group block bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-3xl p-8 md:p-10 text-white shadow-xl hover:shadow-emerald-500/40 motion-safe:hover:-translate-y-1 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-400 rounded-full opacity-20 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-black uppercase tracking-[0.2em] text-emerald-50 mb-3 border border-white/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  Nowość · od 179 zł/mc
                </span>
                <h3 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">
                  Strona w abonamencie dla firm z Rzeszowa
                </h3>
                <p className="text-emerald-50 mb-1">
                  Robimy stronę za Ciebie — strona WWW, Local SEO, Google Business Profile i leady
                  na telefon w stałej miesięcznej cenie.
                </p>
                <p className="text-emerald-100 text-sm">
                  Bez setupu. Bez umowy na rok. Setup w 24h.
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 font-bold rounded-full shadow-lg group-hover:scale-105 transition-transform">
                  Zobacz pakiety
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* CTA */}
      <div className="text-center bg-dark rounded-3xl p-12 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Jesteś z {data.genitive}?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Umów się na spotkanie online lub kawę w Twoim mieście (po wcześniejszym ustaleniu).
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="primary" onClick={() => openModal('consultation')}>
              Skontaktuj się
            </Button>
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => navigate('/offers#calculator')}
              icon={<Calculator size={18} />}
            >
              Wyceń projekt
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-secondary rounded-full opacity-40 blur-3xl"></div>
      </div>
    </>
  );
};

export default PseoLocationContent;
