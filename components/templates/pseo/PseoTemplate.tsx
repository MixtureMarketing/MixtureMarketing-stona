import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cmsService, SanityIndustry, SanityLocation, client } from '../../../services/cmsService';
import Seo from '../../common/Seo';
import NotFound from '../../common/NotFound';
import AmbientBackground from '../../common/AmbientBackground';
import {
  Briefcase,
  AlertTriangle,
  CheckCircle,
  Shield,
  MessageCircle,
  Calculator,
  ArrowRight,
  MapPin,
  Building2,
  TrendingUp,
  Layout,
  Smartphone,
  Search,
} from 'lucide-react';
import Button from '../../common/Button';
import { useModal } from '../../../context/ModalContext';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImage } from '../../../types/sanity';
import AuditTeaser from '../../features/audit/AuditTeaser';
import { usePseoData } from '../../../hooks/usePseoData';

const builder = imageUrlBuilder(client);
function urlFor(source: SanityImage) {
  return builder.image(source);
}

interface PseoTemplateProps {
  mode: 'industry' | 'location';
}

const PseoTemplate: React.FC<PseoTemplateProps> = ({ mode }) => {
  const { slug } = useParams<{ slug: string }>();
  const { openModal } = useModal();
  const navigate = useNavigate();

  const fetcher = mode === 'industry' ? cmsService.getIndustryBySlug : cmsService.getLocationBySlug;

  const { data, loading, error } = usePseoData<SanityIndustry | SanityLocation>(slug, fetcher);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="pt-32 pb-20 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-20 space-y-6">
            <div className="w-48 h-10 bg-gray-200 animate-pulse rounded-full mx-auto"></div>
            <div className="w-full h-16 bg-gray-200 animate-pulse rounded-xl"></div>
            <div className="w-2/3 h-10 bg-gray-200 animate-pulse rounded-lg mx-auto"></div>
            <div className="flex justify-center gap-4">
              <div className="w-40 h-12 bg-gray-200 animate-pulse rounded-lg"></div>
              <div className="w-40 h-12 bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
            <div className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
            <div className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <NotFound />;
  }

  // Type Guards
  const isIndustry = (item: unknown): item is SanityIndustry => mode === 'industry';
  const isLocation = (item: unknown): item is SanityLocation => mode === 'location';

  return (
    <div className="min-h-screen bg-gray-50 text-dark">
      {isIndustry(data) ? (
        <Seo
          title={`Marketing i Strony WWW dla ${data.forWho}`}
          description={`Specjalistyczne usługi IT i marketingu dla branży: ${data.name}. Rozwiązujemy problemy: ${data.painPoints?.slice(0, 2).join(', ')}.`}
          lcpImage={
            data.heroImage?.asset?._ref
              ? urlFor(data.heroImage).width(1200).url()
              : '/assets/images/sygnet.png'
          }
          breadcrumbs={[
            { name: 'Strona Główna', item: '/' },
            { name: `Branża: ${data.name}`, item: `/branza/${slug}` },
          ]}
          service={{
            name: `Usługi IT i Marketingowe dla ${data.forWho}`,
            description: `Dedykowane rozwiązania technologiczne i strategie wzrostu skrojone pod specyfikę branży ${data.name}.`,
            serviceType: 'IT & Marketing Consulting',
          }}
        />
      ) : (
        <Seo
          title={data.seoTitle || `Agencja Marketingowa i Software House - ${data.city}`}
          description={
            data.seoDescription ||
            `Profesjonalne usługi IT, strony www i marketing internetowy dla firm z ${data.genitive}. Lokalne wsparcie, globalna jakość.`
          }
          lcpImage="/assets/images/sygnet.png"
          breadcrumbs={[
            { name: 'Strona Główna', item: '/' },
            { name: `Marketing i Strony WWW ${data.city}`, item: `/miasto/${slug}` },
          ]}
          service={{
            name: `Marketing i Software House ${data.city}`,
            description: `Kompleksowa obsługa technologiczna i reklamowa dla firm z lokalizacji: ${data.city} i okolic.`,
            areaServed: data.city,
          }}
        />
      )}

      <AmbientBackground />

      <div className="pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* HERO SECTION */}
          {isIndustry(data) ? (
            <div className="text-center max-w-4xl mx-auto mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-bold uppercase tracking-wider mb-6">
                <Briefcase size={16} />
                <span>Branża: {data.name}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-dark leading-tight">
                Dedykowane rozwiązania IT <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  {data.forWho}
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                Rozumiemy specyfikę Twojego biznesu. Dostarczamy technologie i marketing, które
                odpowiadają na realne wyzwania branży {data.name}.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button onClick={() => openModal('consultation')} icon={<ArrowRight size={18} />}>
                  Darmowa Konsultacja
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/offers#calculator')}
                  icon={<Calculator size={18} />}
                >
                  Wyceń projekt
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-bold uppercase tracking-wider mb-6">
                  <MapPin size={16} />
                  <span>{data.city}</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-dark leading-tight">
                  Partner Technologiczny dla firm z{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    {data.genitive}
                  </span>
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
          )}

          {/* MIDDLE SECTIONS */}
          {isIndustry(data) ? (
            <>
              {/* Pain Points */}
              {data.painPoints && data.painPoints.length > 0 && (
                <div className="mb-20">
                  <h2 className="text-3xl font-bold text-center mb-12">
                    Typowe wyzwania w Twojej branży
                  </h2>
                  <div className="grid md:grid-cols-3 gap-8">
                    {data.painPoints.map((point, index) => (
                      <div
                        key={index}
                        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-red-100 transition-colors"
                      >
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-6">
                          <AlertTriangle size={24} />
                        </div>
                        <p className="text-lg font-medium text-gray-800">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audit Teaser */}
              <div className="mb-20">
                <AuditTeaser
                  variant="glass"
                  colorScheme="indigo"
                  buttonText={`Sprawdź konkurencję w branży: ${data.name}`}
                  placeholder="Wpisz adres strony konkurencji..."
                />
              </div>

              {/* Tech Requirements */}
              {data.techRequirements && data.techRequirements.length > 0 && (
                <div className="mb-20 bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                      <h2 className="text-3xl font-bold mb-6">Wymagania Techniczne</h2>
                      <p className="text-gray-600 mb-8 text-lg">
                        Twoja branża wymaga specjalistycznych narzędzi. Nasze rozwiązania są gotowe
                        na:
                      </p>
                      <ul className="space-y-4">
                        {data.techRequirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="text-green-500 shrink-0 mt-1" size={20} />
                            <span className="text-gray-700 font-medium">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Shield className="text-secondary" />
                        Bezpieczeństwo i Compliance
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {data.compliance ||
                          'Nasze systemy spełniają najwyższe standardy bezpieczeństwa i są zgodne z aktualnymi regulacjami prawnymi.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Jargon */}
              {data.jargon && data.jargon.length > 0 && (
                <div className="mb-20">
                  <h2 className="text-2xl font-bold text-center mb-8 text-gray-500 uppercase tracking-widest text-sm">
                    Mówimy Twoim językiem
                  </h2>
                  <div className="flex flex-wrap justify-center gap-4">
                    {data.jargon.map((term, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-100 flex items-center gap-2"
                      >
                        <MessageCircle size={14} />
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
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
            </>
          )}

          {/* COMMON CTA */}
          <div className="text-center bg-dark rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {isIndustry(data) ? 'Zacznijmy współpracę' : `Jesteś z ${data.genitive}?`}
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                {isIndustry(data)
                  ? `Skontaktuj się z nami, aby omówić projekt dla branży ${data.name}.`
                  : `Umów się na spotkanie online lub kawę w Twoim mieście (po wcześniejszym ustaleniu).`}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button variant="primary" onClick={() => openModal('consultation')}>
                  {isIndustry(data) ? 'Umów Rozmowę' : 'Skontaktuj się'}
                </Button>
                {isLocation(data) && (
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => navigate('/offers#calculator')}
                    icon={<Calculator size={18} />}
                  >
                    Wyceń projekt
                  </Button>
                )}
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-secondary rounded-full opacity-40 blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PseoTemplate;
