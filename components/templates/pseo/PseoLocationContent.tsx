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
  ParkingCircle,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../common/Button';
import LazyMap from '../../common/LazyMap';
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-bold uppercase tracking-wider mb-6">
            <MapPin size={16} />
            <span>{data.city}</span>
          </div>
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
          <p className="text-xl text-gray-600 mb-8">
            Lokalne zrozumienie rynku połączone z doświadczeniem w realizacji projektów
            międzynarodowych.
          </p>
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
              <h3 className="text-xl font-bold mb-3">Biuro w centrum miasta</h3>
              <p className="text-gray-600">
                Mieścimy się przy Al. Józefa Piłsudskiego 17/4, w samym centrum Rzeszowa — 5 minut
                spacerem od Dworca PKP i Rynku. Spotykamy się na żywo w biurze albo na kawie w
                wybranym miejscu — wystarczy dać znać.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 md:p-12 border border-indigo-100">
            <h3 className="text-2xl font-bold mb-6">Najczęściej zadawane pytania (Rzeszów)</h3>
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-dark mb-1">
                  Czy oferujecie spotkania na żywo w Rzeszowie?
                </p>
                <p className="text-gray-600">
                  Tak. Po wcześniejszym umówieniu zapraszamy do biura przy Al. Piłsudskiego 17/4
                  albo spotykamy się w kawiarni w centrum miasta.
                </p>
              </div>
              <div>
                <p className="font-semibold text-dark mb-1">
                  Czy obsługujecie firmy spoza Rzeszowa, z całego Podkarpacia?
                </p>
                <p className="text-gray-600">
                  Tak. Współpracujemy z klientami z Mielca, Krosna, Stalowej Woli, Przemyśla, Dębicy
                  i Jasła — zarówno zdalnie, jak i z dojazdem do siedziby klienta przy większych
                  projektach.
                </p>
              </div>
              <div>
                <p className="font-semibold text-dark mb-1">Jak wygląda pierwsza konsultacja?</p>
                <p className="text-gray-600">
                  Bezpłatna rozmowa (45–60 minut) online lub w naszym biurze. Omawiamy cele
                  biznesowe, sytuację rynkową i wybieramy najwłaściwszy zakres współpracy — bez
                  zobowiązań i bez sztywnej oferty na siłę.
                </p>
              </div>
              <div>
                <p className="font-semibold text-dark mb-1">
                  Czy macie portfolio z lokalnymi klientami z Rzeszowa i okolic?
                </p>
                <p className="text-gray-600">
                  Tak. Realizowaliśmy projekty dla firm produkcyjnych z Mielca i Stalowej Woli,
                  e-commerce z Rzeszowa oraz software house&apos;ów z Podkarpacia. Część realizacji
                  jest objęta NDA — szczegóły omawiamy podczas spotkania.
                </p>
              </div>
              <div>
                <p className="font-semibold text-dark mb-1">
                  Czy świadczycie usługi pozycjonowania SEO w Rzeszowie?
                </p>
                <p className="text-gray-600">
                  Tak. Pełna oferta lokalnego SEO — od audytu technicznego, przez optymalizację
                  on-page, po link building i Local Pack. Szczegóły na stronie{' '}
                  <Link
                    to="/marketing/seo/rzeszow/"
                    className="text-primary hover:underline font-medium"
                  >
                    pozycjonowanie stron w Rzeszowie
                  </Link>
                  .
                </p>
              </div>
              <div>
                <p className="font-semibold text-dark mb-1">
                  Tworzycie strony internetowe dla firm z Rzeszowa?
                </p>
                <p className="text-gray-600">
                  Tak — landing page&apos;e, strony korporacyjne, sklepy e-commerce i dedykowane
                  aplikacje webowe. Wycena widełkowa i harmonogram na stronie{' '}
                  <Link
                    to="/web-development/rzeszow/"
                    className="text-primary hover:underline font-medium"
                  >
                    tworzenie stron internetowych Rzeszów
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Agencja Marketingowa Rzeszów — sekcja H2 z target keyword */}
          <div className="mb-20 mt-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Agencja Marketingowa Rzeszów — co dla Ciebie zrobimy
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Mixture Marketing to lokalna agencja marketingowa Rzeszów z biurem przy Al.
              Piłsudskiego 17/4. Łączymy kompetencje software house&apos;u (programowanie stron i
              aplikacji) z performance marketingiem (Google Ads, Meta Ads, SEO) i kreacją (branding,
              UI/UX). Pracujemy z firmami z Rzeszowa, Mielca, Stalowej Woli, Krosna, Przemyśla i
              Dębicy — a także zdalnie z klientami z całej Polski.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <Link
                to="/web-development/rzeszow/"
                className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/40 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-4">
                  <Layout size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  Strony internetowe Rzeszów{' '}
                  <ArrowRight
                    size={16}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary"
                  />
                </h3>
                <p className="text-gray-600 mb-3">
                  Tworzenie stron WWW, sklepów e-commerce, landing page&apos;y i dedykowanych
                  aplikacji webowych dla firm z Rzeszowa i Podkarpacia. Stack: WordPress, Next.js,
                  React, custom CMS.
                </p>
                <span className="text-sm text-primary font-semibold">
                  Zobacz ofertę web dev w Rzeszowie →
                </span>
              </Link>

              <Link
                to="/marketing/seo/rzeszow/"
                className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/40 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-violet-100 text-violet-700 rounded-xl flex items-center justify-center mb-4">
                  <Search size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  Pozycjonowanie SEO Rzeszów{' '}
                  <ArrowRight
                    size={16}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary"
                  />
                </h3>
                <p className="text-gray-600 mb-3">
                  Lokalne pozycjonowanie stron, audyty techniczne, Google Maps / Local Pack, link
                  building w mediach podkarpackich, content SEO. Cennik widełkowy w ofercie.
                </p>
                <span className="text-sm text-primary font-semibold">
                  Zobacz ofertę SEO w Rzeszowie →
                </span>
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

          {/* Mapa + kierunki dojazdu — sygnał geo + UX */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Jak do nas trafić — biuro w centrum Rzeszowa
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Mieścimy się przy Al. Józefa Piłsudskiego 17/4, na III piętrze, w samym centrum miasta
              — 5 minut spacerem od Dworca PKP, 10 minut od Rynku Starego Miasta.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="rounded-2xl overflow-hidden border border-gray-200 aspect-video">
                <LazyMap
                  src="https://www.google.com/maps?q=Al.+J%C3%B3zefa+Pi%C5%82sudskiego+17,+35-074+Rzesz%C3%B3w&output=embed"
                  title="Mapa — biuro Mixture Marketing w Rzeszowie"
                />
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Train size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Komunikacją miejską</h3>
                    <p className="text-sm text-gray-600">
                      Od Dworca PKP Rzeszów Główny — 5 minut spacerem alejami Piłsudskiego.
                      Najbliższy przystanek MPK: &quot;Słowackiego&quot; (linie 1, 6, 9).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ParkingCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Samochodem</h3>
                    <p className="text-sm text-gray-600">
                      Parking publiczny przy ul. Słowackiego, podziemny w Galerii Rzeszów (5 min
                      spacerem) lub miejsca SPP wzdłuż Al. Piłsudskiego.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Godziny otwarcia</h3>
                    <p className="text-sm text-gray-600">
                      Poniedziałek–Piątek 9:00–17:00. Spotkania na żywo zawsze po wcześniejszym
                      umówieniu (mailem lub telefonicznie).
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
            <div
              key={i}
              onClick={() => navigate(service.link)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-[#F0F7FF] rounded-xl flex items-center justify-center text-secondary mb-4 group-hover:bg-secondary group-hover:text-white transition-colors">
                {service.icon}
              </div>
              <h3 className="font-bold text-lg mb-2 text-dark flex items-center gap-2">
                {service.title}{' '}
                <ArrowRight
                  size={16}
                  className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary"
                />
              </h3>
              <p className="text-sm text-gray-600">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>

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
