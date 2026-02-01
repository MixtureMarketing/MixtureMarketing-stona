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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../common/Button';
import { useModal } from '../../../context/ModalContext';
import { SanityLocation } from '../../../services/cmsService';

interface PseoLocationContentProps {
  data: SanityLocation;
}

const PseoLocationContent: React.FC<PseoLocationContentProps> = ({ data }) => {
  const { openModal } = useModal();
  const navigate = useNavigate();

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
