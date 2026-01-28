import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Monitor,
  BarChart3,
  Palette,
  ArrowRight,
  CheckCircle2,
  Zap,
  Code2,
  Search,
  TrendingUp,
  Layers,
  HelpCircle,
  ChevronDown,
  Server,
  Globe,
  ShieldCheck,
  Clock,
  Users,
  X,
  Check,
  Rocket,
  Database,
  Cpu,
  Terminal,
  DollarSign,
  PieChart,
  PenTool,
  Image as ImageIcon,
  Type,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../../types';
import AnimateOnScroll from '../common/AnimateOnScroll';
import Button from '../common/Button';
import SectionHeader from '../common/SectionHeader';
import GlassCard from '../common/GlassCard';
import TechSeparator from '../common/TechSeparator';
import { useModal } from '../../context/ModalContext';
import Seo from '../common/Seo';
import LazyHydrate from '../common/LazyHydrate';
import { OFFERS_CONTENT as CONTENT } from '../../data/content';

const PriceCalculator = React.lazy(() => import('../features/PriceCalculator'));

type BusinessScale = 'startup' | 'enterprise';

const Offers: React.FC = () => {
  const [scale, setScale] = useState<BusinessScale>('startup');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const navigate = useNavigate();
  const { openModal } = useModal();

  // Animation states for re-triggering
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Reset animations when scale changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnimKey((prev) => prev + 1);
  }, [scale]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // --- CONTENT DATA ---

  const content = {
    web: {
      startup: {
        badge: 'Szybki Start & MVP',
        title: 'Strony WWW & E-commerce',
        desc: 'Potrzebujesz szybko zaistnieć w sieci? Tworzymy wydajne strony na WordPress i sklepy, które sprzedają od pierwszego dnia. Idealne rozwiązanie na start, z możliwością późniejszej rozbudowy.',
        features: [
          'Strony Wizytówki (WordPress)',
          'Sklepy WooCommerce',
          'Optymalizacja Szybkości',
          'Podstawowe SEO',
        ],
        stat: { label: 'Czas wdrożenia', value: '2-4 Tygodnie' },
        modules: ['Design UX/UI', 'CMS Setup', 'RWD Mobile', 'SEO Basic'],
      },
      enterprise: {
        badge: 'Skalowalność & Bezpieczeństwo',
        title: 'Dedykowane Systemy & SaaS',
        desc: 'Rozwiązania dla liderów rynku. Projektujemy zaawansowane aplikacje webowe (React/Laravel), headless CMS i systemy B2B, które obsługują tysiące użytkowników jednocześnie przy zachowaniu najwyższego bezpieczeństwa.',
        features: [
          'Aplikacje Webowe (React)',
          'Dedykowane Backend (Laravel)',
          'Architektura Mikroserwisów',
          'Audyty Bezpieczeństwa',
        ],
        stat: { label: 'Gwarancja SLA', value: '99.9%' },
        modules: ['Microservices', 'Cloud AWS', 'Load Balancing', 'Security Audit'],
      },
    },
    marketing: {
      startup: {
        badge: 'Wzrost & Trakcja',
        title: 'Kampanie Generujące Sprzedaż',
        desc: 'Każda złotówka się liczy. Skupiamy się na kanałach o najwyższym zwrocie z inwestycji (ROI). Uruchamiamy precyzyjne kampanie Google Ads i Meta Ads, aby sprowadzić pierwszych płacących klientów.',
        features: [
          'Google Ads (Search)',
          'Facebook Lead Ads',
          'Konfiguracja Analityki',
          'Remarketing',
        ],
        stat: { label: 'Średni ROAS', value: '650%' },
        widgets: { budget: '2k - 10k', metric: 'Sales Focused' },
      },
      enterprise: {
        badge: 'Dominacja & Wizerunek',
        title: 'Strategie Omnichannel',
        desc: 'Kompleksowe zarządzanie budżetami reklamowymi w wielu kanałach. Zaawansowana segmentacja, automatyzacja marketingu i budowanie świadomości marki (Brand Awareness) na dużą skalę.',
        features: [
          'Strategia 360°',
          'Marketing Automation',
          'Kampanie Wideo (YouTube)',
          'Raportowanie BI',
        ],
        stat: { label: 'Obsługa Budżetów', value: '1M+ PLN' },
        widgets: { budget: '50k+', metric: 'Brand & LTV' },
      },
    },
  };

  const techStack = [
    'React',
    'TypeScript',
    'Laravel',
    'Node.js',
    'Docker',
    'AWS',
    'Google Cloud',
    'WordPress',
    'WooCommerce',
    'Figma',
    'Google Ads',
    'GA4',
    'Meta Business',
  ];

  const faqs = [
    {
      q: 'Czy po wykonaniu strony będę mógł ją samodzielnie edytować?',
      a: 'Tak. Niezależnie czy wybierzesz WordPress (Startup) czy dedykowany Headless CMS (Enterprise), wdrażamy intuicyjny panel administratora i szkolimy Twój zespół z jego obsługi.',
    },
    {
      q: 'Jak wygląda model rozliczeń w marketingu?',
      a: 'Stawiamy na transparentność. Budżet reklamowy (płatny do Google/Meta) jest oddzielony od naszego wynagrodzenia (prowizja od wydatków lub stała opłata flat fee, zależnie od skali).',
    },
    {
      q: 'Czy podpisujemy umowę o poufności (NDA)?',
      a: 'Oczywiście. Bezpieczeństwo Twoich danych i pomysłów biznesowych to priorytet. Standardowo pracujemy na NDA, szczególnie przy projektach Enterprise.',
    },
    {
      q: 'Co obejmuje darmowa opieka techniczna?',
      a: 'Przez 6 miesięcy po wdrożeniu dbamy o aktualizacje wtyczek, bezpieczeństwo serwera, kopie zapasowe oraz naprawę ewentualnych błędów krytycznych.',
    },
  ];

  return (
    <div className="bg-white pt-20 animate-fade-in font-sans text-slate-800 relative overflow-hidden">
      <Seo
        title={CONTENT.seo.title}
        description={CONTENT.seo.description}
        image={CONTENT.seo.image}
      />

      {/* --- BACKGROUND CABLE INFRASTRUCTURE (Cleaned SVG) --- */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg className="w-full h-full" viewBox="0 0 1000 3000" preserveAspectRatio="none">
          <defs>
            <linearGradient id="cableGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3F3D91" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#61B6DE" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3F3D91" stopOpacity="0.1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Central Bus Line */}
          <line
            x1="500"
            y1="0"
            x2="500"
            y2="3000"
            stroke="url(#cableGradient)"
            strokeWidth="2"
            className="hidden lg:block"
          />

          {/* Animated Energy Packets */}
          <path
            d="M 500 0 V 3000"
            stroke="#61B6DE"
            strokeWidth="3"
            strokeDasharray="100 1000"
            strokeLinecap="round"
            className="hidden lg:block animate-energy-flow"
            filter="url(#glow)"
            opacity="0.8"
          />

          {/* === BRANCH 1 === */}
          <path
            d="M 500 1050 H 850"
            stroke="rgba(63, 61, 145, 0.1)"
            strokeWidth="2"
            fill="none"
            className="hidden lg:block"
          />
          <path
            d="M 500 1050 H 850"
            stroke="#61B6DE"
            strokeWidth="2"
            fill="none"
            strokeDasharray="50 800"
            className="hidden lg:block animate-energy-flow"
            filter="url(#glow)"
          />

          {/* === BRANCH 2 === */}
          <path
            d="M 500 1850 H 150"
            stroke="rgba(63, 61, 145, 0.1)"
            strokeWidth="2"
            fill="none"
            className="hidden lg:block"
          />
          <path
            d="M 500 1850 H 150"
            stroke="#61B6DE"
            strokeWidth="2"
            fill="none"
            strokeDasharray="50 800"
            className="hidden lg:block animate-energy-flow"
            filter="url(#glow)"
          />

          {/* === BRANCH 3 === */}
          <path
            d="M 500 2650 H 850"
            stroke="rgba(63, 61, 145, 0.1)"
            strokeWidth="2"
            fill="none"
            className="hidden lg:block"
          />
          <path
            d="M 500 2650 H 850"
            stroke="#61B6DE"
            strokeWidth="2"
            fill="none"
            strokeDasharray="50 800"
            className="hidden lg:block animate-energy-flow"
            filter="url(#glow)"
          />
        </svg>
      </div>

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

            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-12">
              {CONTENT.hero.subtitle}
            </p>

            <div className="relative inline-flex bg-white p-2 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100">
              <div
                className={`absolute top-2 bottom-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-md`}
                style={{
                  left: scale === 'startup' ? '8px' : '50%',
                  width: 'calc(50% - 8px)',
                  backgroundColor: scale === 'startup' ? '#61B6DE' : '#213261',
                }}
              ></div>

              <button
                onClick={() => setScale('startup')}
                className={`relative z-10 w-48 py-4 rounded-full text-sm font-bold transition-colors duration-300 flex flex-col items-center gap-1 group ${scale === 'startup' ? 'text-white' : 'text-gray-600 hover:text-secondary'}`}
                aria-pressed={scale === 'startup'}
              >
                <div className="flex items-center gap-2">
                  <Rocket
                    size={18}
                    className={`transition-transform duration-300 ${scale === 'startup' ? '-translate-y-1' : ''}`}
                    aria-hidden="true"
                  />
                  <span className="uppercase tracking-wide text-xs">
                    {CONTENT.hero.buttons.startup.title}
                  </span>
                </div>
                <span
                  className={`text-xs font-medium ${scale === 'startup' ? 'text-white' : 'text-gray-600'}`}
                >
                  {CONTENT.hero.buttons.startup.subtitle}
                </span>
              </button>

              <button
                onClick={() => setScale('enterprise')}
                className={`relative z-10 w-48 py-4 rounded-full text-sm font-bold transition-colors duration-300 flex flex-col items-center gap-1 group ${scale === 'enterprise' ? 'text-white' : 'text-gray-600 hover:text-secondary'}`}
                aria-pressed={scale === 'enterprise'}
              >
                <div className="flex items-center gap-2">
                  <Server
                    size={18}
                    className={`transition-transform duration-300 ${scale === 'enterprise' ? '-translate-y-1' : ''}`}
                    aria-hidden="true"
                  />
                  <span className="uppercase tracking-wide text-xs">
                    {CONTENT.hero.buttons.enterprise.title}
                  </span>
                </div>
                <span
                  className={`text-xs font-medium ${scale === 'enterprise' ? 'text-white' : 'text-gray-600'}`}
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
          {/* --- WEB DEVELOPMENT SECTION --- */}
          <LazyHydrate minHeight="600px">
            <AnimateOnScroll>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="order-2 lg:order-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold uppercase tracking-wider mb-6">
                    {content.web[scale].badge}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-dark">
                    {content.web[scale].title}
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    {content.web[scale].desc}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {content.web[scale].features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-secondary shrink-0">
                          <CheckCircle2 size={12} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => navigate('/web-development/')}
                    variant="primary"
                    icon={<ArrowRight size={18} />}
                  >
                    {CONTENT.button}
                  </Button>
                </div>

                <div className="order-1 lg:order-2">
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-[2rem] opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"></div>
                    <GlassCard className="relative p-2 aspect-video overflow-hidden border-white/40 bg-white/40 backdrop-blur-md shadow-2xl">
                      <div className="bg-gray-100/50 rounded-xl w-full h-full flex flex-col overflow-hidden border border-gray-200/50">
                        {/* Browser Mockup Header */}
                        <div className="bg-white/80 h-8 flex items-center px-4 gap-2 border-b border-gray-200">
                          <div className="w-2 h-2 rounded-full bg-red-400"></div>
                          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          <div className="mx-auto bg-gray-100 rounded-full h-4 w-48"></div>
                        </div>
                        {/* Mockup Content */}
                        <div className="p-6 flex-grow">
                          {scale === 'startup' ? (
                            <div className="space-y-4 animate-pulse">
                              <div className="h-8 bg-primary/20 rounded-lg w-3/4"></div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="h-24 bg-white rounded-xl border border-gray-100"></div>
                                <div className="h-24 bg-white rounded-xl border border-gray-100"></div>
                                <div className="h-24 bg-white rounded-xl border border-gray-100"></div>
                              </div>
                              <div className="h-32 bg-white rounded-xl border border-gray-100"></div>
                            </div>
                          ) : (
                            <div className="flex gap-6 h-full">
                              <div className="w-1/4 bg-white rounded-xl border border-gray-100 p-4 space-y-4">
                                <div className="h-2 bg-gray-100 rounded w-full"></div>
                                <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                                <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                              </div>
                              <div className="w-3/4 space-y-4">
                                <div className="h-full bg-slate-900 rounded-xl p-4 font-mono text-xxs text-primary overflow-hidden">
                                  <code className="block">const system = {`{`}</code>
                                  <code className="block ml-4">scale: 'Enterprise',</code>
                                  <code className="block ml-4">security: 'WAF_ENABLED',</code>
                                  <code className="block ml-4">uptime: '99.9%',</code>
                                  <code className="block">{`}`}</code>
                                  <div className="mt-4 flex gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                    <span className="text-green-500">
                                      Infrastructure operational...
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </LazyHydrate>

          {/* --- PERFORMANCE MARKETING SECTION --- */}
          <LazyHydrate minHeight="600px">
            <AnimateOnScroll delay={200}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-32">
                <div className="order-2 lg:order-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE4F0] text-instagram text-xs font-bold uppercase tracking-wider mb-6">
                    {content.marketing[scale].badge}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-dark">
                    {content.marketing[scale].title}
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    {content.marketing[scale].desc}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {content.marketing[scale].features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#FFE4F0] flex items-center justify-center text-instagram shrink-0">
                          <TrendingUp size={12} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="bg-white p-3 rounded-xl shadow-sm text-success">
                      <BarChart3 size={24} />
                    </div>
                    <div>
                      <p className="text-xxs font-bold text-gray-400 uppercase">
                        {content.marketing[scale].widgets?.metric || 'Efektywność'}
                      </p>
                      <p className="text-lg font-black text-dark">
                        {content.marketing[scale].stat.value}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="order-1 lg:order-1">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-[#E1306C] to-secondary rounded-[2rem] opacity-10 blur-2xl"></div>
                    <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 relative overflow-hidden">
                      {scale === 'startup' ? (
                        <div className="space-y-6">
                          <div className="flex justify-between items-end">
                            <h4 className="font-bold text-dark">Lejek Sprzedażowy</h4>
                            <span className="text-xs font-bold text-success">Active Campaign</span>
                          </div>
                          <div className="space-y-2">
                            <div className="h-12 bg-secondary rounded-lg flex items-center px-4 text-white text-xs font-bold">
                              Awareness (Google Ads)
                            </div>
                            <div className="h-12 bg-secondary/80 rounded-lg flex items-center px-4 text-white text-xs font-bold w-[80%] mx-auto">
                              Consideration (Meta Ads)
                            </div>
                            <div className="h-12 bg-instagram rounded-lg flex items-center px-4 text-white text-xs font-bold w-[60%] mx-auto">
                              Conversion (Remarketing)
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <h4 className="font-bold text-dark">Omnichannel BI Dashboard</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                              <div className="text-xxs font-bold text-gray-400 mb-1">
                                REAL-TIME ROAS
                              </div>
                              <div className="text-xl font-black text-secondary">8.4x</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                              <div className="text-xxs font-bold text-gray-400 mb-1">DATA FLOW</div>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4].map((i) => (
                                  <div
                                    key={i}
                                    className="w-1.5 h-4 bg-green-400 rounded-full animate-bounce"
                                    style={{ animationDelay: `${i * 0.1}s` }}
                                  ></div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="h-32 bg-indigo-50/50 rounded-xl flex items-center justify-center border border-dashed border-indigo-200">
                            <PieChart size={48} className="text-secondary/20" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </LazyHydrate>
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

      <LazyHydrate minHeight="600px">
        <React.Suspense fallback={<div className="h-40 flex items-center justify-center">Ładowanie kalkulatora...</div>}>
          <PriceCalculator />
        </React.Suspense>
      </LazyHydrate>

      {/* FAQ SECTION */}
      <LazyHydrate minHeight="400px">
        <section className="py-24 bg-white relative z-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader title="Częste pytania" className="mb-12" />
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded-2xl overflow-hidden bg-[#F9FAFB]"
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full flex justify-between items-center p-6 text-left focus:outline-none hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-bold text-dark text-lg">{faq.q}</span>
                    <ChevronDown
                      size={20}
                      className={`text-primary transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100/50">
                      {faq.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </LazyHydrate>
    </div>
  );
};

export default Offers;
