import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  LayoutTemplate,
  Zap,
  Search,
  Smartphone,
  Rocket,
  Building2,
  ShoppingCart,
  Database,
  ChevronDown,
  ArrowRight,
  Gauge,
  Lock,
  Settings,
  Server,
  XCircle,
  FileCode,
  Terminal,
  ShieldCheck,
  Activity,
  MoreHorizontal,
  TrendingUp,
  CreditCard,
  Plug,
  Calculator,
  Megaphone,
  Edit3,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimateOnScroll from '../common/AnimateOnScroll';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';
import GlassCard from '../common/GlassCard';
import AmbientBackground from '../common/AmbientBackground';
import IntegrationGrid, { IntegrationCategory } from '../common/IntegrationGrid';
import { useModal } from '../../context/ModalContext';
import TechStack from '../sections/TechStack';
import Seo from '../common/Seo';
import LazyHydrate from '../common/LazyHydrate';
import { WEB_DEV_CONTENT } from '../../data/content';
import ServiceRelatedArticles from '../features/services/ServiceRelatedArticles';
import StandardHero from '../common/StandardHero';
import StandardCta from '../common/StandardCta';
import { WebDevHeroVisual } from '../visuals/HeroVisuals';

const WebDevelopment: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [securityScanAngle, setSecurityScanAngle] = useState(0);
  const [blockedCount, setBlockedCount] = useState(1420);

  const navigate = useNavigate();
  const { openModal } = useModal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Security Radar Animation - Optimized
  useEffect(() => {
    const interval = setInterval(() => {
      setSecurityScanAngle((prev) => (prev + 5) % 360);
      // Randomly increment blocked threats
      if (Math.random() > 0.95) {
        setBlockedCount((prev) => prev + 1);
      }
    }, 100); // Slower updates
    return () => clearInterval(interval);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // --- MEMOIZED DATA MAPPING ---

  const projectTypes = React.useMemo(() => {
    const icons = [
      <Rocket key="landing" size={24} />,
      <Building2 key="corporate" size={24} />,
      <ShoppingCart key="ecommerce" size={24} />,
      <Database key="custom" size={24} />,
    ];
    return WEB_DEV_CONTENT.projectTypes.map((type, index) => ({
      ...type,
      icon: icons[index],
      action: () => navigate(type.path),
    }));
  }, [navigate]);

  const integrationCategories: IntegrationCategory[] = React.useMemo(() => {
    const icons = [
      <CreditCard key="payments" size={20} />,
      <Megaphone key="marketing" size={20} />,
      <Database key="erp" size={20} />,
      <TruckIcon key="logistics" size={20} />,
    ];
    return WEB_DEV_CONTENT.integrations.categories.map((cat, index) => ({
      ...cat,
      icon: icons[index],
    }));
  }, []);

  const comparisonData = React.useMemo(() => {
    const icons = [
      <Zap key="speed" size={18} />,
      <Search key="seo" size={18} />,
      <Lock key="security" size={18} />,
      <Edit3 key="content" size={18} />,
      <CheckCircle2 key="support" size={18} />,
    ];
    return WEB_DEV_CONTENT.comparison.data.map((row, index) => ({
      ...row,
      icon: icons[index],
    }));
  }, []);

  const faqs = WEB_DEV_CONTENT.faqs;

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans selection:bg-primary/30">
      <Seo
        title={WEB_DEV_CONTENT.seo.title}
        description={WEB_DEV_CONTENT.seo.description}
        image={WEB_DEV_CONTENT.seo.image}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            serviceType: 'Web Development',
            provider: {
              '@type': 'Organization',
              name: 'Mixture Marketing',
              url: 'https://mixturemarketing.pl',
              logo: 'https://mixturemarketing.pl/assets/images/sygnet.png',
            },
            areaServed: 'PL',
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Usługi Programistyczne',
              itemListElement: WEB_DEV_CONTENT.projectTypes.map((type) => ({
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: type.title,
                  url: `https://mixturemarketing.pl${type.path}`,
                  description: type.desc,
                },
              })),
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: WEB_DEV_CONTENT.faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a,
              },
            })),
          },
        ]}
      />

      {/* --- HERO SECTION --- */}
      <StandardHero
        badge={WEB_DEV_CONTENT.hero.badge}
        badgeIcon={Terminal}
        title={{ line1: WEB_DEV_CONTENT.hero.title, line2: WEB_DEV_CONTENT.hero.titleAccent }}
        description={WEB_DEV_CONTENT.hero.description}
        ctaPrimaryText="Umów się na konsultację"
        ctaPrimaryOnClick={() => openModal('web')}
        ctaSecondaryText="Wyceń projekt"
        ctaSecondaryOnClick={() => navigate('/offers#calculator?type=webApp')}
        ctaSecondaryIcon={Calculator}
        backLinkPath="/"
        backLinkLabel="System.Return_To_Home()"
        visual={<WebDevHeroVisual />}
      />

      <section className="bg-[#F9FAFB] pb-24">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="pt-10 border-t border-gray-200/60 flex flex-wrap gap-x-8 gap-y-4 justify-center lg:justify-start">
            {['Next.js', 'React', 'TypeScript', 'WordPress Headless', 'Laravel', 'AWS Cloud'].map(
              (tech, i) => (
                <span
                  key={i}
                  className="text-xs font-bold font-mono tracking-wider text-gray-600 hover:text-dark transition-colors flex items-center gap-2 cursor-default"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> {tech}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* --- OFFER GRID (SEO SILO) --- */}
      <section id="offer-grid" className="py-24 bg-gray-50 relative">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-3xl">
              <SectionHeader
                align="left"
                title={WEB_DEV_CONTENT.offerGrid.title}
                subtitle={WEB_DEV_CONTENT.offerGrid.subtitle}
                description={WEB_DEV_CONTENT.offerGrid.description}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {projectTypes.map((type, index) => (
              <AnimateOnScroll key={index} delay={index * 100} className="h-full">
                <GlassCard
                  onClick={type.action}
                  className={`p-8 h-full flex flex-col cursor-pointer transition-all duration-500 group relative overflow-hidden border-t-4 border-l-0 border-r-0 border-b-0 ${type.highlight ? 'border-t-[#3F3D91] shadow-[0_20px_50px_-12px_rgba(63,61,145,0.15)] bg-white' : 'border-t-transparent hover:border-t-[#61B6DE] bg-white/60'}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#F9FAFB] border border-gray-100 shadow-sm flex items-center justify-center text-dark mb-8 group-hover:bg-dark group-hover:text-white transition-all duration-500">
                    {type.icon}
                  </div>

                  <h3 className="font-bold text-xl text-dark mb-2 group-hover:text-secondary transition-colors">
                    {type.title}
                  </h3>
                  <p className="text-xxs font-black text-[#0284C7] uppercase tracking-[0.2em] mb-6">
                    {type.subtitle}
                  </p>

                  <p className="text-sm text-gray-700 leading-relaxed mb-8 flex-grow font-medium">
                    {type.desc}
                  </p>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-8">
                    {type.techs.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-50 text-xxs font-bold text-gray-600 rounded uppercase border border-gray-100 group-hover:border-primary/30 group-hover:text-dark transition-colors"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xxs font-bold text-gray-600 uppercase tracking-widest">
                        Main KPI
                      </span>
                      <span className="text-xs font-black text-dark">{type.kpi}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-secondary transition-all">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </GlassCard>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* --- TECH STACK EDUCATIONAL SECTION --- */}
      <TechStack />

      {/* --- NEW SECTION: WORDPRESS CUSTOM PLUGINS --- */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <AnimateOnScroll>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-6">
                  <Plug size={14} /> {WEB_DEV_CONTENT.wpCustom.badge}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-dark">
                  {WEB_DEV_CONTENT.wpCustom.title} <br />
                  <span className="text-primary">{WEB_DEV_CONTENT.wpCustom.titleAccent}</span>
                </h2>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  {WEB_DEV_CONTENT.wpCustom.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {WEB_DEV_CONTENT.wpCustom.features.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 bg-[#F9FAFB] rounded-xl border border-gray-100 hover:border-secondary/30 transition-colors"
                    >
                      <CheckCircle2 size={20} className="text-secondary shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-dark text-sm">{item.title}</h3>
                        <p className="text-xs text-gray-700 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>
            </div>

            {/* Right Side Visual: Code Plugin Simulation */}
            <div className="lg:w-1/2 w-full relative flex justify-center lg:justify-end">
              <LazyHydrate whenVisible>
                <AnimateOnScroll delay={200} className="w-full max-w-lg">
                  <div className="relative group">
                    {/* Decorative blobs */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-all duration-500"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>

                    {/* Main Code Window */}
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-500 hover:-translate-y-2">
                      <div className="bg-[#1E293B] p-4 flex items-center justify-between border-b border-[#334155]">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                          <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                        </div>
                        <div className="text-xxs font-mono text-gray-500 flex items-center gap-2">
                          <FileCode size={12} /> custom-logic.php
                        </div>
                      </div>
                      <div className="p-6 bg-[#0F172A] overflow-x-auto">
                        <pre className="font-mono text-xs md:text-sm leading-relaxed">
                          <div className="flex">
                            <span className="text-gray-500 select-none mr-4">1</span>
                            <span className="text-[#C792EA]">add_filter</span>
                            <span className="text-[#89DDFF]">(</span>
                            <span className="text-[#C3E88D]">'woocommerce_get_price'</span>
                            <span className="text-[#89DDFF]">,</span>{' '}
                            <span className="text-[#C792EA]">function</span>
                            <span className="text-[#89DDFF]">(</span>
                            <span className="text-[#FFCB6B]">$price</span>
                            <span className="text-[#89DDFF]">)</span>{' '}
                            <span className="text-[#89DDFF]">{'{'}</span>
                          </div>
                          <div className="flex">
                            <span className="text-gray-500 select-none mr-4">2</span>{' '}
                            <span className="text-gray-500">{'// Connect to External ERP'}</span>
                          </div>{' '}
                          <div className="flex">
                            <span className="text-gray-500 select-none mr-4">3</span>{' '}
                            <span className="text-[#C792EA]">if</span>{' '}
                            <span className="text-[#89DDFF]">(</span>
                            <span className="text-[#82AAFF]">App</span>
                            <span className="text-[#89DDFF]">\</span>
                            <span className="text-[#FFCB6B]">User</span>
                            <span className="text-[#89DDFF]">-&gt;</span>
                            <span className="text-[#82AAFF]">isB2B</span>
                            <span className="text-[#89DDFF]">())</span>{' '}
                            <span className="text-[#89DDFF]">{'{'}</span>
                          </div>
                          <div className="flex">
                            <span className="text-gray-500 select-none mr-4">4</span>{' '}
                            <span className="text-[#FFCB6B]">$discount</span>{' '}
                            <span className="text-[#89DDFF]">=</span>{' '}
                            <span className="text-[#82AAFF]">API</span>
                            <span className="text-[#89DDFF]">::</span>
                            <span className="text-[#82AAFF]">getDiscountLevel</span>
                            <span className="text-[#89DDFF]">();</span>
                          </div>
                          <div className="flex">
                            <span className="text-gray-500 select-none mr-4">5</span>{' '}
                            <span className="text-[#C792EA]">return</span>{' '}
                            <span className="text-[#FFCB6B]">$price</span>{' '}
                            <span className="text-[#89DDFF]">/</span>{' '}
                            <span className="text-[#FFCB6B]">$discount</span>
                            <span className="text-[#89DDFF]">;</span>
                          </div>
                          <div className="flex">
                            <span className="text-gray-500 select-none mr-4">6</span>{' '}
                            <span className="text-[#89DDFF]">{'}'}</span>
                          </div>
                          <div className="flex">
                            <span className="text-gray-500 select-none mr-4">7</span>{' '}
                            <span className="text-[#C792EA]">return</span>{' '}
                            <span className="text-[#FFCB6B]">$price</span>
                            <span className="text-[#89DDFF]">;</span>
                          </div>
                          <div className="flex">
                            <span className="text-gray-500 select-none mr-4">8</span>
                            <span className="text-[#89DDFF]">{'}'});</span>
                          </div>
                        </pre>
                      </div>
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 animate-float z-20">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-secondary">
                        <Zap size={20} />
                      </div>
                      <div>
                        <div className="text-xxs font-bold text-gray-500 uppercase tracking-wider">
                          Performance
                        </div>
                        <div className="text-sm font-black text-dark">0.02s Query Time</div>
                      </div>
                    </div>

                    <div className="absolute top-1/2 -right-8 bg-dark text-white p-3 rounded-lg shadow-lg flex items-center gap-2 transform rotate-90 origin-bottom-right z-10">
                      <Plug size={14} />
                      <span className="text-xs font-bold uppercase tracking-widest">Connected</span>
                    </div>
                  </div>
                </AnimateOnScroll>
              </LazyHydrate>
            </div>
          </div>
        </div>
      </section>

      {/* --- ADMIN PANEL & MANAGEMENT --- */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <AnimateOnScroll>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-6">
                  <Settings size={14} /> {WEB_DEV_CONTENT.adminPanel.badge}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-dark">
                  {WEB_DEV_CONTENT.adminPanel.title}
                  <br />
                  <span className="text-primary">{WEB_DEV_CONTENT.adminPanel.titleAccent}</span>
                </h2>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  {WEB_DEV_CONTENT.adminPanel.description}
                </p>
                <div className="space-y-6">
                  {WEB_DEV_CONTENT.adminPanel.sections.map((section, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-1 w-10 h-10 rounded-full bg-[#F9FAFB] flex items-center justify-center text-secondary shrink-0 border border-gray-100 shadow-sm">
                        {i === 0 ? <FileCode size={20} /> : <Database size={20} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-dark text-lg">{section.title}</h3>
                        <p className="text-sm text-gray-700 mt-1">{section.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>
            </div>

            <div className="lg:w-1/2 w-full order-1 lg:order-2">
              <LazyHydrate whenVisible>
                <AnimateOnScroll delay={200}>
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden relative transform rotate-1 hover:rotate-0 transition-transform duration-500">
                    <div className="flex h-[450px]">
                      {/* Sidebar */}
                      <div className="w-64 bg-[#F8FAFC] border-r border-gray-200 flex flex-col hidden sm:flex">
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-dark flex items-center justify-center text-white font-bold text-xs">
                              M
                            </div>
                            <span className="font-bold text-dark text-sm">Mixture Admin</span>
                          </div>
                        </div>
                        <div className="p-4 space-y-1">
                          <div className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-dark">
                            <LayoutTemplate size={16} className="text-primary" /> Dashboard
                          </div>
                          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                            <Users size={16} /> Użytkownicy
                          </div>
                          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                            <ShoppingCart size={16} /> Zamówienia
                          </div>
                          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                            <Settings size={16} /> Ustawienia
                          </div>
                        </div>
                        <div className="mt-auto p-4 border-t border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-secondary text-xs font-bold">
                              JD
                            </div>
                            <div className="text-xs">
                              <div className="font-bold text-dark">Jan D.</div>
                              <div className="text-gray-600">Administrator</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 bg-white p-6 sm:p-8 flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                          <div>
                            <div className="text-2xl font-bold text-dark mb-1">
                              Przegląd Systemu
                            </div>
                            <div className="text-xs text-gray-600 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>{' '}
                              System Operational
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="px-3 py-1.5 border border-gray-200 rounded-md text-xs font-bold text-gray-700 bg-white shadow-sm cursor-pointer hover:border-primary">
                              Export CSV
                            </div>
                            <div className="px-3 py-1.5 bg-dark text-white rounded-md text-xs font-bold shadow-md cursor-pointer hover:bg-secondary">
                              + Add New
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                          <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white">
                            <div className="text-xs text-gray-600 uppercase font-bold tracking-wider mb-2">
                              Total Users
                            </div>
                            <div className="text-2xl font-black text-dark">12,450</div>
                            <div className="text-xxs text-success mt-1 font-medium flex items-center gap-1">
                              <TrendingUp size={10} /> +12% this week
                            </div>
                          </div>
                          <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white">
                            <div className="text-xs text-gray-600 uppercase font-bold tracking-wider mb-2">
                              Revenue
                            </div>
                            <div className="text-2xl font-black text-dark">$45.2k</div>
                            <div className="text-xxs text-success mt-1 font-medium flex items-center gap-1">
                              <TrendingUp size={10} /> +5% this week
                            </div>
                          </div>
                          <div className="p-4 rounded-xl border border-gray-100 shadow-sm bg-white hidden md:block">
                            <div className="text-xs text-gray-600 uppercase font-bold tracking-wider mb-2">
                              Active Sessions
                            </div>
                            <div className="text-2xl font-black text-dark">342</div>
                            <div className="text-xxs text-gray-600 mt-1 font-medium">
                              Currently online
                            </div>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-xl overflow-hidden flex-1 shadow-sm">
                          <div className="bg-[#F9FAFB] px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Ostatnie Transakcje
                            </span>
                            <MoreHorizontal size={16} className="text-gray-600" />
                          </div>
                          <div className="divide-y divide-gray-100">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="px-4 py-3 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors group cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-secondary font-bold text-xs">
                                    #{i}02
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-dark">
                                      Zamówienie #{i}245
                                    </div>
                                    <div className="text-xxs text-gray-600">2 min temu</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs font-bold text-dark">250.00 PLN</div>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xxs font-medium bg-green-100 text-green-800">
                                    Completed
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              </LazyHydrate>
            </div>
          </div>
        </div>
      </section>

      {/* --- ECOSYSTEM & INTEGRATIONS --- */}
      <section className="py-24 bg-[#F9FAFB] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none"></div>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <SectionHeader
            title={WEB_DEV_CONTENT.integrations.title}
            description={WEB_DEV_CONTENT.integrations.description}
            className="mb-16"
          />
          <LazyHydrate whenVisible>
            <IntegrationGrid categories={integrationCategories} />
          </LazyHydrate>
        </div>
      </section>

      {/* --- INFRASTRUCTURE & SECURITY --- */}
      <section className="py-24 bg-[#0B1120] relative overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid opacity-10"></div>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xxs font-black uppercase tracking-widest mb-6 backdrop-blur-sm">
                <ShieldCheck size={12} /> {WEB_DEV_CONTENT.infrastructure.badge}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {WEB_DEV_CONTENT.infrastructure.title} <br />
                <span className="text-primary">{WEB_DEV_CONTENT.infrastructure.titleAccent}</span>
              </h2>
              <p className="text-gray-200 text-lg mb-8 leading-relaxed">
                {WEB_DEV_CONTENT.infrastructure.description}
              </p>
              <div className="grid grid-cols-2 gap-6">
                {WEB_DEV_CONTENT.infrastructure.stats.map((stat, i) => (
                  <div key={i} className="border-l-2 border-primary pl-4">
                    <div className="text-2xl font-bold text-white">{stat.val}</div>
                    <div className="text-xs text-gray-300 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <LazyHydrate whenVisible>
                <AnimateOnScroll delay={200}>
                  <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-6 shadow-[0_0_50px_rgba(0,200,83,0.1)] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-grid-white/[0.02]"></div>
                    <div className="flex justify-between items-center mb-8 border-b border-[#334155] pb-4 relative z-10">
                      <div className="flex items-center gap-2 text-white font-mono text-sm">
                        <Server size={16} className="text-primary" /> SECURITY_CENTER
                      </div>
                      <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        <span className="text-xxs text-emerald-400 font-bold uppercase tracking-wide">
                          System Secure
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-6 relative z-10">
                      <div className="w-1/3 flex flex-col items-center justify-center border-r border-[#334155] pr-6">
                        <div className="relative w-24 h-24 mb-4">
                          <div className="absolute inset-0 border-2 border-[#1E293B] rounded-full"></div>
                          <div
                            className="absolute inset-0 rounded-full border-t-2 border-success opacity-50"
                            style={{
                              transform: `rotate(${securityScanAngle}deg)`,
                              transition: 'transform 0.05s linear',
                            }}
                          ></div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-success">
                            <ShieldCheck size={32} />
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xxs text-gray-300 uppercase font-bold">Blocked</div>
                          <div className="text-xl font-mono text-white">{blockedCount}</div>
                        </div>
                      </div>
                      <div className="w-2/3 space-y-3 font-mono text-xs">
                        <div className="flex justify-between text-gray-300 text-xxs uppercase font-bold border-b border-[#334155] pb-1">
                          <span>Event</span>
                          <span>Status</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">SQL Injection</span>
                          <span className="text-red-400 font-bold">BLOCKED</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Bot crawler</span>
                          <span className="text-orange-400 font-bold">DENIED</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">SSL Handshake</span>
                          <span className="text-success font-bold">SUCCESS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              </LazyHydrate>
            </div>
          </div>
        </div>
      </section>

      {/* --- TECHNICAL COMPARISON --- */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            title={WEB_DEV_CONTENT.comparison.title}
            subtitle={WEB_DEV_CONTENT.comparison.subtitle}
            description={WEB_DEV_CONTENT.comparison.description}
            className="mb-16"
          />
          <LazyHydrate whenVisible>
            <div className="bg-[#0F172A] text-gray-200 rounded-3xl overflow-hidden shadow-2xl border border-[#1E293B]">
              <div className="divide-y divide-gray-800">
                {comparisonData.map((row, i) => (
                  <div key={i} className="px-6 py-6 hover:bg-white/5 transition-colors group">
                    <div className="grid grid-cols-12 items-center">
                      <div className="col-span-12 md:col-span-4 flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-[#1E293B] text-primary">{row.icon}</div>
                        <span className="font-bold text-white">{row.label}</span>
                      </div>
                      <div className="col-span-6 md:col-span-4 text-center">
                        <span className="line-through text-red-400">{row.bad}</span>
                      </div>
                      <div className="col-span-6 md:col-span-4 text-center">
                        <span className="text-emerald-400 font-bold">{row.good}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </LazyHydrate>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title={WEB_DEV_CONTENT.faq.title}
            subtitle={WEB_DEV_CONTENT.faq.subtitle}
            className="mb-12"
          />
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-2xl bg-white overflow-hidden hover:border-primary/50 transition-all group"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center"
                >
                  <span className="font-bold text-dark text-lg group-hover:text-secondary">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition-all ${openFaq === index ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-gray-600 animate-fade-in">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- RELATED ARTICLES --- */}
      <LazyHydrate minHeight="600px">
        <ServiceRelatedArticles category="tech" />
      </LazyHydrate>

      {/* --- FINAL CTA --- */}
      <StandardCta
        title={WEB_DEV_CONTENT.ctaSection.title}
        description={WEB_DEV_CONTENT.ctaSection.description}
        buttonText={WEB_DEV_CONTENT.ctaSection.buttonText}
        icon={Activity}
        onClick={() => openModal('consultation')}
        variant="white"
        bgClassName="bg-gradient-to-br from-dark to-secondary text-white"
        className="text-white"
      />
    </div>
  );
};

// Simple Truck Icon Helper
const TruckIcon = ({ size }: { size: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 17h4V5H2v12h3" />
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
    <path d="M14 17h1" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

export default WebDevelopment;