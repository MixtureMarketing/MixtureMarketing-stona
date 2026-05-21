import React, { useEffect, useState } from 'react';
import { ArrowLeft, BarChart3, CheckCircle2, TrendingUp, Server, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Seo from '../common/Seo';
import LazyHydrate from '../common/LazyHydrate';
import { OFFERS_CONTENT as CONTENT } from '../../data/content';
import OffersBackground from '../visuals/OffersBackground';
import FaqSection from './FaqSection';
import OfferFeatureSection from './OfferFeatureSection';
import { BrowserMockup, SalesFunnelVisual } from '../visuals/offers/OfferVisuals';

const PriceCalculator = React.lazy(() => import('../features/PriceCalculator'));

type BusinessScale = 'startup' | 'enterprise';

const Offers: React.FC = () => {
  const [scale, setScale] = useState<BusinessScale>('startup');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { web, marketing, techStack, faqs } = CONTENT;

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans text-slate-800 relative overflow-hidden">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
      />

      <OffersBackground />

      {/* --- HERO SECTION --- */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-gray-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-tech-grid opacity-30"></div>
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ${scale === 'startup' ? 'opacity-10' : 'opacity-0'}`}
            style={{
              background: 'radial-gradient(circle at 50% 30%, #61B6DE 0%, transparent 60%)',
            }}
          ></div>
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ${scale === 'enterprise' ? 'opacity-10' : 'opacity-0'}`}
            style={{
              background: 'radial-gradient(circle at 50% 30%, #3F3D91 0%, transparent 60%)',
            }}
          ></div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate('/')}
              className="absolute top-0 left-4 lg:left-8 group flex items-center text-sm font-semibold text-gray-700 hover:text-secondary transition-colors uppercase tracking-wide"
              aria-label="Wróć do strony głównej"
            >
              <ArrowLeft
                className="mr-2 group-hover:-translate-x-1 transition-transform"
                size={16}
                aria-hidden="true"
              />
              Wróć
            </button>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-primary/20 shadow-sm mb-8 animate-fade-in-down">
              <div
                className={`w-2 h-2 rounded-full ${scale === 'startup' ? 'bg-accent-dark' : 'bg-secondary'} animate-pulse`}
              ></div>
              <span className="text-xs font-bold text-gray-700 tracking-widest uppercase">
                Tryb: {scale === 'startup' ? 'Agile / MVP' : 'Enterprise / SLA'}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-dark leading-tight">
              <span className="block mb-2">{CONTENT.hero.title.label}</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
                {CONTENT.hero.title.highlight}
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
              {CONTENT.hero.subtitle}
            </p>

            {/* Price floor — redukuje 48% porzucen z "nieznanej ceny" (Baymard).
                Konkretne widelki: landing page od 3 900 zl, sklep od 12 000 zl. */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-emerald-200 text-emerald-700 text-sm font-bold shadow-sm">
                Strony WWW od 3 900 zł netto
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-secondary/20 text-secondary text-sm font-bold shadow-sm">
                Wycena widełkowa w 24h
              </span>
            </div>

            {/* Scale Switcher */}
            <div className="relative inline-flex bg-white p-2 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100">
              <div
                className="absolute top-2 bottom-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-md"
                style={{
                  left: scale === 'startup' ? '8px' : '50%',
                  width: 'calc(50% - 8px)',
                  backgroundColor: scale === 'startup' ? '#3F3D91' : '#213261',
                }}
              ></div>

              <button
                type="button"
                onClick={() => setScale('startup')}
                aria-pressed={scale === 'startup'}
                className={`relative z-10 w-48 py-4 rounded-full text-sm font-bold transition-colors duration-300 flex flex-col items-center gap-1 group ${scale === 'startup' ? 'text-white' : 'text-gray-600 hover:text-secondary'}`}
              >
                <div className="flex items-center gap-2">
                  <Rocket
                    size={18}
                    className={`${scale === 'startup' ? '-translate-y-1' : ''} transition-transform`}
                  />
                  <span className="uppercase tracking-wide text-xs">
                    {CONTENT.hero.buttons.startup.title}
                  </span>
                </div>
                <span
                  className={`text-xs font-medium ${scale === 'startup' ? 'text-white/90' : 'text-gray-500'}`}
                >
                  {CONTENT.hero.buttons.startup.subtitle}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScale('enterprise')}
                aria-pressed={scale === 'enterprise'}
                className={`relative z-10 w-48 py-4 rounded-full text-sm font-bold transition-colors duration-300 flex flex-col items-center gap-1 group ${scale === 'enterprise' ? 'text-white' : 'text-gray-600 hover:text-secondary'}`}
              >
                <div className="flex items-center gap-2">
                  <Server
                    size={18}
                    className={`${scale === 'enterprise' ? '-translate-y-1' : ''} transition-transform`}
                  />
                  <span className="uppercase tracking-wide text-xs">
                    {CONTENT.hero.buttons.enterprise.title}
                  </span>
                </div>
                <span
                  className={`text-xs font-medium ${scale === 'enterprise' ? 'text-white/90' : 'text-gray-500'}`}
                >
                  {CONTENT.hero.buttons.enterprise.subtitle}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTENT SECTIONS --- */}
      <section className="py-24 relative z-10 space-y-32">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <OfferFeatureSection
            badge={web[scale].badge}
            badgeBg="bg-blue-50"
            badgeTextColor="text-secondary"
            title={web[scale].title}
            description={web[scale].desc}
            features={web[scale].features}
            featuresIcon={CheckCircle2}
            buttonText={CONTENT.button}
            onButtonClick={() => navigate('/web-development/')}
            visual={<BrowserMockup scale={scale} />}
          />

          <OfferFeatureSection
            badge={marketing[scale].badge}
            badgeBg="bg-[#FFE4F0]"
            badgeTextColor="text-instagram"
            title={marketing[scale].title}
            description={marketing[scale].desc}
            features={marketing[scale].features}
            featuresIcon={TrendingUp}
            buttonText={CONTENT.button}
            onButtonClick={() => navigate('/marketing/')}
            visual={<SalesFunnelVisual scale={scale} />}
            stat={{
              label: marketing[scale].widgets?.metric || 'Efektywność',
              value: marketing[scale].stat.value,
              icon: BarChart3,
              iconColor: 'text-success',
            }}
            reverse={true}
            className="mt-32"
          />
        </div>
      </section>

      {/* --- TECH STACK STRIP --- */}
      <LazyHydrate minHeight="100px">
        <section className="py-12 bg-gray-50 border-y border-gray-100 overflow-hidden">
          <div className="flex items-center gap-12 whitespace-nowrap animate-infinite-scroll">
            {[...techStack, ...techStack].map((tech, i) => (
              <span
                key={i}
                className="text-2xl font-black text-gray-200 uppercase tracking-tighter hover:text-secondary transition-colors cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      </LazyHydrate>

      {/* --- PRICE CALCULATOR --- */}
      <LazyHydrate minHeight="600px">
        <React.Suspense
          fallback={
            <div className="h-40 flex items-center justify-center">Ładowanie kalkulatora...</div>
          }
        >
          <PriceCalculator />
        </React.Suspense>
      </LazyHydrate>

      {/* --- FAQ SECTION --- */}
      <LazyHydrate minHeight="400px">
        <FaqSection title="Częste pytania" items={faqs} bgClassName="bg-white" />
      </LazyHydrate>
    </div>
  );
};

export default Offers;
