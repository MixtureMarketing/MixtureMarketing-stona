import React from 'react';
import { ArrowRight, CheckCircle2, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import GlassCard from '../common/GlassCard';
import { SERVICES_CONTENT as CONTENT } from '../../data/content';
import { SERVICES_SECTION_DATA } from '../../data/content/services';
import { CodeVisual, ChartVisual, UiVisual } from '../visuals/ServiceVisuals';

const VisualMap = {
  code: <CodeVisual />,
  chart: <ChartVisual />,
  ui: <UiVisual />,
};

const Services: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="services" className="py-32 relative bg-gray-50 overflow-hidden">
      <AmbientBackground />

      {/* --- PARALLAX BACKGROUND TEXT --- */}
      <div className="absolute top-20 left-0 w-full overflow-hidden pointer-events-none z-0 opacity-5 select-none">
        <div
          className="text-[20vw] font-black text-dark whitespace-nowrap leading-none tracking-tighter"
          style={{ transform: 'translateX(-10%)' }}
        >
          SERVICES
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <SectionHeader align="left" title={CONTENT.title} description={CONTENT.description} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {SERVICES_SECTION_DATA.map((service, index) => {
            const Icon = service.icon;
            return (
              <AnimateOnScroll
                key={index}
                delay={index * 100}
                className={`h-full ${index === 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                <GlassCard
                  className={`
                    group p-0 overflow-hidden flex flex-col h-full z-10 transition-all duration-500
                    hover:border-primary hover:shadow-2xl hover:-translate-y-2 cursor-pointer
                `}
                  onClick={() => navigate(service.path)}
                >
                  {/* Card Header with Icon */}
                  <div className="p-6 md:p-8 pb-0">
                    <div className="flex justify-between items-start mb-4 md:mb-6">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-gray-50 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors duration-300">
                        <Icon
                          size={24}
                          className="group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <span className="text-xxs md:text-xs font-black uppercase tracking-widest text-gray-600 bg-gray-50 px-3 py-1 rounded-full group-hover:bg-blue-50 group-hover:text-secondary transition-colors">
                        {service.subtitle}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold mb-3 text-dark">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm mb-6">{service.desc}</p>
                  </div>

                  {/* Features List */}
                  <div className="px-6 md:px-8 pb-6 flex-grow">
                    <ul className="space-y-2 md:space-y-3">
                      {service.features.map((feat, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 text-sm font-medium text-gray-600"
                        >
                          <CheckCircle2 size={14} className="text-primary shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual Footer area */}
                  <div className="mt-auto border-t border-gray-100 bg-gray-50/50 p-6 pt-4 group-hover:bg-white transition-colors">
                    {/* Abstract Mini Visualization */}
                    <div className="mb-4 opacity-50 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0">
                      {VisualMap[service.visualType as keyof typeof VisualMap]}
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full justify-between group-hover:bg-blue-50 group-hover:text-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(service.path);
                      }}
                    >
                      <span>{service.button}</span>
                      <ArrowRight
                        size={18}
                        className="transform group-hover:translate-x-1 transition-transform"
                      />
                    </Button>
                  </div>
                </GlassCard>
              </AnimateOnScroll>
            );
          })}
        </div>

        {/* Lokalny CTA-band — sygnał lokalny + crawl depth do spoke'ow Rzeszow */}
        <AnimateOnScroll delay={400}>
          <div className="mt-16 bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start md:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-secondary flex items-center justify-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-1">
                    Lokalnie · Rzeszów
                  </p>
                  <p className="text-sm md:text-base text-gray-700">
                    Szukasz konkretnej usługi dla firmy z Rzeszowa lub Podkarpacia?
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/web-development/rzeszow/"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-gray-50 hover:bg-blue-50 hover:text-secondary rounded-lg transition-colors"
                >
                  Strony WWW Rzeszów <ArrowRight size={12} />
                </Link>
                <Link
                  to="/marketing/seo/rzeszow/"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-gray-50 hover:bg-blue-50 hover:text-secondary rounded-lg transition-colors"
                >
                  Pozycjonowanie Rzeszów <ArrowRight size={12} />
                </Link>
                <Link
                  to="/agencja-interaktywna-rzeszow/"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-gray-50 hover:bg-blue-50 hover:text-secondary rounded-lg transition-colors"
                >
                  Agencja interaktywna <ArrowRight size={12} />
                </Link>
                <Link
                  to="/miasto/rzeszow/"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-secondary text-white hover:bg-secondary/90 rounded-lg transition-colors"
                >
                  Hub lokalny <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default Services;
