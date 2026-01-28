import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cmsService, SanityLocation } from '../../services/cmsService';
import Seo from '../common/Seo';
import NotFound from '../common/NotFound';
import AmbientBackground from '../common/AmbientBackground';
import {
  MapPin,
  Building2,
  TrendingUp,
  Layout,
  Smartphone,
  Search,
  ArrowRight,
  Calculator,
} from 'lucide-react';
import Button from '../common/Button';
import { useModal } from '../../context/ModalContext';

const LocationTemplate = () => {
  const { slug } = useParams<{ slug: string }>();
  const [location, setLocation] = useState<SanityLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { openModal } = useModal();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocation = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await cmsService.getLocationBySlug(slug);
        if (data) {
          setLocation(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch location:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="pt-32 pb-20 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <div className="w-32 h-8 bg-gray-200 animate-pulse rounded-full"></div>
              <div className="w-full h-16 bg-gray-200 animate-pulse rounded-xl"></div>
              <div className="w-3/4 h-16 bg-gray-200 animate-pulse rounded-xl"></div>
              <div className="w-1/2 h-8 bg-gray-200 animate-pulse rounded-lg"></div>
              <div className="flex gap-4">
                <div className="w-48 h-12 bg-gray-200 animate-pulse rounded-lg"></div>
                <div className="w-32 h-12 bg-gray-200 animate-pulse rounded-lg"></div>
              </div>
            </div>
            <div className="aspect-square bg-gray-200 animate-pulse rounded-3xl"></div>
          </div>
          <div className="h-64 bg-gray-200 animate-pulse rounded-3xl mb-20"></div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
            <div className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
            <div className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-dark">
      <Seo
        title={location.seoTitle || `Agencja Marketingowa i Software House - ${location.city}`}
        description={
          location.seoDescription ||
          `Profesjonalne usługi IT, strony www i marketing internetowy dla firm z ${location.genitive}. Lokalne wsparcie, globalna jakość.`
        }
        lcpImage="/assets/images/sygnet.png"
      />

      <AmbientBackground />

      <div className="pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-bold uppercase tracking-wider mb-6">
                <MapPin size={16} />
                <span>{location.city}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-dark leading-tight">
                Partner Technologiczny dla firm z{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  {location.genitive}
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Lokalne zrozumienie rynku połączone z doświadczeniem w realizacji projektów
                międzynarodowych.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => openModal('consultation')}>
                  Darmowa Konsultacja w {location.city}
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
              {/* Abstract visual representation of city/location */}
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
                      <p className="text-lg font-bold text-dark">Skalowanie w {location.city}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Context Section */}
          <div
            id="details"
            className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 mb-20"
          >
            <h2 className="text-3xl font-bold mb-6">Dlaczego warto wybrać nas?</h2>
            <div className="prose prose-lg text-gray-600 max-w-none">
              <p className="text-xl font-medium mb-4">{location.businessContext}</p>
              <p>
                Działając na rynku {location.genitive}, wiemy jak ważne jest połączenie nowoczesnych
                technologii z lokalną specyfiką biznesową. Oferujemy kompleksowe podejście - od
                strategii, przez design, aż po wdrożenie i utrzymanie systemów.
              </p>
            </div>
          </div>

          {/* Services in Location */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-10 text-center">
              Kompleksowe wsparcie dla firm z {location.genitive}
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
                  desc: `Bądź widoczny w Google, gdy klienci szukają usług w ${location.city}.`,
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

          {/* Local CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Jesteś z {location.genitive}?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Umów się na spotkanie online lub kawę w Twoim mieście (po wcześniejszym ustaleniu).
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="primary" onClick={() => openModal('consultation')}>
                Skontaktuj się
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/offers#calculator')}
                icon={<Calculator size={18} />}
              >
                Wyceń projekt
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationTemplate;
