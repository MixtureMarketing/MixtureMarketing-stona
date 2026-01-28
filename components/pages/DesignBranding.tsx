import React, { useEffect } from 'react';
import {
  ArrowLeft,
  Palette,
  Fingerprint,
  ArrowRight,
  Wand2,
  Monitor,
  Layout,
  ScanEye,
  Package,
  Box,
  Repeat,
  ShoppingBag,
  Cpu,
  PenTool,
  Scale,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import AmbientBackground from '../common/AmbientBackground';
import LazyHydrate from '../common/LazyHydrate';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import { DESIGN_BRANDING_CONTENT as CONTENT } from '../../data/content';
import ServiceRelatedArticles from '../features/services/ServiceRelatedArticles';

const DesignBranding: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const serviceBlocks = CONTENT.pillars.items.map((block, index) => {
    const icons = [
      <Fingerprint size={32} key="fingerprint" />,
      <Layout size={32} key="layout" />,
      <Package size={32} key="package" />,
      <ScanEye size={32} key="scaneye" />,
    ];
    const colors = ['#3F3D91', '#61B6DE', '#F4B400', '#E1306C'];
    return {
      ...block,
      icon: icons[index],
      color: colors[index],
      action: () => navigate(block.path),
    };
  });

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-secondary/20">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          serviceType: 'Design & Branding',
          provider: {
            '@type': 'Organization',
            name: 'Mixture Marketing',
            url: 'https://mixturemarketing.pl',
            logo: 'https://mixturemarketing.pl/assets/images/sygnet.png',
          },
          areaServed: 'PL',
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Usługi Projektowe',
            itemListElement: CONTENT.pillars.items.map((item) => ({
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: item.title,
                url: `https://mixturemarketing.pl${item.path}`,
                description: item.desc,
              },
            })),
          },
        }}
      />
      {/* --- HERO SECTION --- */}
      <section className="relative py-20 lg:py-24 bg-[#F9FAFB] overflow-hidden">
        <AmbientBackground />

        {/* Construction Grid Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(#213261 1px, transparent 1px), linear-gradient(90deg, #213261 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center text-sm font-semibold text-gray-600 hover:text-secondary mb-8 transition-colors"
            aria-label="Wróć do strony głównej"
          >
            <ArrowLeft
              className="mr-2 group-hover:-translate-x-1 transition-transform"
              size={16}
              aria-hidden="true"
            />
            Wróć do strony głównej
          </button>

          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in border border-secondary/20">
                <Palette size={14} aria-hidden="true" /> {CONTENT.hero.badge}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-dark mb-6 leading-tight animate-fade-in-up">
                {CONTENT.hero.title.line1} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-[#3A8FB7]">
                  {CONTENT.hero.title.line2}
                </span>
              </h1>

              <p
                className="text-xl text-gray-600 mb-8 leading-relaxed animate-fade-in-up"
                style={{ animationDelay: '0.1s' }}
                dangerouslySetInnerHTML={{ __html: CONTENT.hero.description }}
              />

              <div
                className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                <Button onClick={() => openModal('design')} icon={<ArrowRight size={18} />}>
                  {CONTENT.hero.cta}
                </Button>
              </div>
            </div>

            {/* Visual: Abstract Design Composition */}
            <div
              className="lg:w-1/2 w-full flex justify-center animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <LazyHydrate whenVisible>
                <div className="relative w-80 h-80 md:w-96 md:h-96">
                  {/* Floating Layers */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-secondary to-primary rounded-2xl shadow-2xl transform rotate-6 z-10 opacity-90 animate-float"></div>
                  <div className="absolute bottom-0 left-10 w-40 h-40 bg-white border border-gray-200 rounded-2xl shadow-xl transform -rotate-3 z-20 flex items-center justify-center animate-float-delayed">
                    <div className="text-dark font-black text-4xl tracking-tighter">Aa</div>
                  </div>
                  <div className="absolute top-20 left-0 w-32 h-32 bg-dark rounded-full z-0 opacity-10"></div>

                  {/* Grid Lines */}
                  <div className="absolute inset-0 border-2 border-primary/20 rounded-full border-dashed animate-spin-slow"></div>
                </div>
              </LazyHydrate>
            </div>
          </div>
        </div>
      </section>

      {/* --- DESIGN TECH STACK (TOOLKIT) --- */}
      <section className="py-20 bg-white border-b border-gray-100 overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="text-left">
              <h3 className="text-lg font-bold text-dark">{CONTENT.toolkit.title}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest">
                {CONTENT.toolkit.subtitle}
              </p>
            </div>
            <div className="h-px bg-gray-100 flex-1 mx-8 hidden md:block"></div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary"></div>
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <div className="w-2 h-2 rounded-full bg-[#F4B400]"></div>
            </div>
          </div>

          <LazyHydrate whenVisible>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {CONTENT.toolkit.tools.map((tool, i) => {
                const icons = [
                  <Layout size={20} key="layout" />,
                  <PenTool size={20} key="pentool" />,
                  <Box size={20} key="box" />,
                  <Repeat size={20} key="repeat" />,
                  <Wand2 size={20} key="wand2" />,
                ];
                const hoverColors = [
                  'hover:border-[#0ACF83] hover:text-[#0ACF83]',
                  'hover:border-[#FF0000] hover:text-[#FF0000]',
                  'hover:border-[#E87D0D] hover:text-[#E87D0D]',
                  'hover:border-[#475569] hover:text-[#475569]',
                  'hover:border-dark hover:text-dark',
                ];
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 transition-all duration-300 group cursor-default hover:bg-white hover:shadow-md ${hoverColors[i]}`}
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400 group-hover:text-current transition-colors">
                      {icons[i]}
                    </div>
                    <div>
                      <div className="font-bold text-dark text-sm leading-tight">{tool.name}</div>
                      <div className="text-xxs text-gray-500 uppercase tracking-tight">
                        {tool.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </LazyHydrate>
        </div>
      </section>

      {/* --- DESIGN ECOSYSTEM (NEW) --- */}
      <section className="py-28 bg-[#F9FAFB] relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none"></div>

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            title={CONTENT.ecosystem.title}
            description={CONTENT.ecosystem.description}
            className="mb-20 pb-4"
          />

          <LazyHydrate whenVisible>
            <div className="relative">
              {/* Central Flow Line - Desktop */}
              <div className="hidden md:block absolute top-[80px] left-0 w-full h-[2px] bg-gradient-to-r from-secondary/20 via-primary/40 to-[#F4B400]/20 -z-10 rounded-full"></div>

              {/* Vertical Flow Line - Mobile */}
              <div className="md:hidden absolute top-0 bottom-0 left-[2.25rem] w-[2px] bg-gradient-to-b from-secondary/20 via-primary/40 to-[#F4B400]/20 -z-10 rounded-full"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
                {CONTENT.ecosystem.items.map((item, i) => {
                  const icons = [
                    <Fingerprint size={28} key="fingerprint" />,
                    <Monitor size={28} key="monitor" />,
                    <Package size={28} key="package" />,
                  ];
                  const colors = ['#3F3D91', '#61B6DE', '#F4B400'];
                  const gradients = [
                    'from-secondary/10 to-transparent',
                    'from-primary/10 to-transparent',
                    'from-[#F4B400]/10 to-transparent',
                  ];
                  return (
                    <AnimateOnScroll key={i} delay={i * 200}>
                      <div className="group relative flex flex-col h-full pl-20 md:pl-0 md:pt-20">
                        {/* Step Connector Node */}
                        <div
                          className="absolute left-6 md:left-1/2 top-8 md:top-0 w-6 h-6 md:w-8 md:h-8 -ml-3 md:-ml-4 rounded-full bg-white border-4 shadow-lg z-20 transition-transform duration-500 group-hover:scale-125"
                          style={{ borderColor: colors[i] }}
                        >
                          <div
                            className="absolute inset-0 m-auto w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"
                            style={{ backgroundColor: colors[i] }}
                          ></div>
                        </div>

                        {/* Card */}
                        <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 flex-grow group-hover:-translate-y-1 overflow-hidden">
                          {/* Top Gradient */}
                          <div
                            className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[i].replace('/10', '')}`}
                          ></div>
                          <div
                            className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${gradients[i]} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                          ></div>

                          <div className="mb-6 flex justify-between items-start">
                            <div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                              style={{ backgroundColor: colors[i] }}
                            >
                              {icons[i]}
                            </div>
                            <span className="text-4xl font-black text-gray-100 select-none absolute top-6 right-8 pointer-events-none group-hover:text-gray-50 transition-colors">
                              {item.step}
                            </span>
                          </div>

                          <h3 className="font-bold text-xl text-dark mb-3 group-hover:text-secondary transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed mb-6 font-medium">
                            {item.desc}
                          </p>

                          <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-gray-50">
                            {item.tags.map((tag, t) => (
                              <span
                                key={t}
                                className="text-xxs font-bold uppercase tracking-wider text-gray-500 bg-gray-50 px-2 py-1 rounded group-hover:bg-blue-50 group-hover:text-secondary transition-colors"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AnimateOnScroll>
                  );
                })}
              </div>
            </div>
          </LazyHydrate>
        </div>
      </section>

      {/* --- SECTORS (SEGMENTATION) --- */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={CONTENT.sectors.title}
            description={CONTENT.sectors.description}
            className="mb-16 pb-4"
          />

          <LazyHydrate whenVisible>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CONTENT.sectors.items.map((sector, i) => {
                const icons = [
                  <Cpu size={24} key="cpu" />,
                  <ShoppingBag size={24} key="shoppingbag" />,
                  <Scale size={24} key="scale" />,
                  <Sparkles size={24} key="sparkles" />,
                ];
                const colors = [
                  'from-blue-500 to-indigo-600',
                  'from-emerald-400 to-teal-600',
                  'from-slate-700 to-slate-900',
                  'from-rose-400 to-pink-600',
                ];
                const bgs = ['bg-blue-50', 'bg-emerald-50', 'bg-slate-50', 'bg-rose-50'];
                return (
                  <AnimateOnScroll key={i} delay={i * 100}>
                    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 p-6 h-full hover:shadow-xl transition-all duration-300 cursor-pointer">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${colors[i]} opacity-0 group-hover:opacity-5 transition-opacity`}
                      ></div>

                      <div className="relative z-10 flex flex-col h-full">
                        <div
                          className={`w-12 h-12 rounded-xl ${bgs[i]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                        >
                          <div className="text-gray-700 group-hover:text-black transition-colors">
                            {icons[i]}
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-dark mb-2 group-hover:translate-x-1 transition-transform">
                          {sector.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-grow">
                          {sector.desc}
                        </p>

                        <div className="flex justify-end mt-auto">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover:text-dark group-hover:bg-white group-hover:shadow-md transition-all">
                            <ArrowRight
                              size={14}
                              className="group-hover:-rotate-45 transition-transform duration-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </LazyHydrate>
        </div>
      </section>

      {/* --- SERVICE BLOCKS (4 PILLARS) --- */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={CONTENT.pillars.title}
            description={CONTENT.pillars.description}
            className="mb-16"
          />

          <LazyHydrate whenVisible>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {serviceBlocks.map((block, index) => (
                <AnimateOnScroll key={index} delay={index * 100} className="h-full">
                  <div
                    onClick={block.action}
                    className="group relative h-full bg-white rounded-2xl border border-gray-200 hover:border-transparent transition-all duration-300 cursor-pointer flex flex-col overflow-hidden hover:shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none"></div>
                    <div
                      className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-current opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
                      style={{ color: block.color }}
                    ></div>

                    <div className="p-8 flex-grow relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                          style={{ backgroundColor: block.color }}
                        >
                          {block.icon}
                        </div>
                        <span className="text-4xl font-black text-gray-100 group-hover:text-gray-100 transition-colors select-none">
                          {block.id}
                        </span>
                      </div>

                      <div className="mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-600 block mb-1">
                          {block.role}
                        </span>
                        <h3 className="text-2xl font-bold text-dark group-hover:text-primary transition-colors">
                          {block.title}
                        </h3>
                      </div>

                      <p className="text-gray-600 leading-relaxed mb-8 text-sm">{block.desc}</p>

                      <div className="flex flex-wrap gap-2 mt-auto">
                        {block.features.map((feat, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-3 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 group-hover:bg-white group-hover:border-gray-200 transition-colors"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center group-hover:bg-white transition-colors relative z-10">
                      <span
                        className="text-sm font-bold flex items-center gap-2"
                        style={{ color: block.color }}
                      >
                        Zobacz proces{' '}
                        <ArrowRight
                          size={16}
                          className="transform group-hover:translate-x-1 transition-transform"
                        />
                      </span>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </LazyHydrate>
        </div>
      </section>

      {/* --- ROI OF DESIGN --- */}
      <section className="py-24 bg-[#F9FAFB] relative overflow-hidden">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
            {CONTENT.roi.items.map((item, i) => {
              const colors = ['text-secondary', 'text-primary', 'text-success'];
              return (
                <AnimateOnScroll
                  key={i}
                  delay={i * 100}
                  className={i === 2 ? 'md:col-span-2 lg:col-span-1' : ''}
                >
                  <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 h-full">
                    <div className={`text-5xl font-black mb-2 ${colors[i]}`}>{item.val}</div>
                    <p className="text-gray-600 font-medium">{item.label}</p>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- RELATED ARTICLES --- */}
      <LazyHydrate minHeight="600px">
        <ServiceRelatedArticles category="design" />
      </LazyHydrate>

      {/* --- CTA --- */}
      <section className="py-24 bg-dark relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-tech-grid opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="inline-block p-4 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm animate-pulse">
            <Wand2 size={32} className="text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">{CONTENT.cta.title}</h2>
          <p className="text-xl text-gray-300 mb-10">{CONTENT.cta.text}</p>
          <Button onClick={() => openModal('design')} variant="white" size="lg">
            {CONTENT.cta.button}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default DesignBranding;
