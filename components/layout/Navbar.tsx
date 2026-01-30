import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Zap,
  ChevronDown,
  Rocket,
  Building2,
  ShoppingCart,
  Database,
  Search,
  Megaphone,
  TrendingUp,
  BarChart3,
  Palette,
  Layout,
  Layers,
  Eye,
  ArrowRight,
  Calendar,
  Phone,
  Check,
  Users,
} from 'lucide-react';
import Button from '../common/Button';
import { useModal } from '../../context/ModalContext';
import { SITE_CONFIG } from '../../config/site';
import { NAVBAR_CONTENT as CONTENT } from '../../data/content';
import Image from '../common/Image';
import { ARTICLES } from '../../data/articles';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { openModal } = useModal();
  const { toggleScroll } = useBodyScrollLock();
  const { scrollToId } = useSmoothScroll();

  const toggleMenu = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    toggleScroll(nextState);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) return;
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleLogoClick = () => {
    navigate('/');
    window.scrollTo(0, 0);
    setIsOpen(false);
    toggleScroll(false);
  };

  const handleAnchorLink = (anchorId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: anchorId } });
    } else {
      scrollToId(anchorId);
    }
    setIsOpen(false);
    toggleScroll(false);
  };

  useEffect(() => {
    if (location.state && (location.state as { scrollTo?: string }).scrollTo) {
      const anchorId = (location.state as { scrollTo?: string }).scrollTo as string;
      setTimeout(() => {
        scrollToId(anchorId);
        window.history.replaceState({}, document.title);
      }, 100);
    }
  }, [location, scrollToId]);

  const handleMouseEnter = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const toggleDropdownMobile = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const megaMenuData = [
    {
      category: CONTENT.megaMenu[0].category,
      description: CONTENT.megaMenu[0].description,
      target: '/web-development/',
      items: [
        {
          label: CONTENT.megaMenu[0].items[0].label,
          desc: CONTENT.megaMenu[0].items[0].desc,
          icon: Rocket,
          target: '/web-development/landing-page/',
        },
        {
          label: CONTENT.megaMenu[0].items[1].label,
          desc: CONTENT.megaMenu[0].items[1].desc,
          icon: Building2,
          target: '/web-development/corporate/',
        },
        {
          label: CONTENT.megaMenu[0].items[2].label,
          desc: CONTENT.megaMenu[0].items[2].desc,
          icon: ShoppingCart,
          target: '/web-development/ecommerce/',
        },
        {
          label: CONTENT.megaMenu[0].items[3].label,
          desc: CONTENT.megaMenu[0].items[3].desc,
          icon: Database,
          target: '/web-development/custom-app/',
        },
      ],
    },
    {
      category: CONTENT.megaMenu[1].category,
      description: CONTENT.megaMenu[1].description,
      target: '/marketing/',
      items: [
        {
          label: CONTENT.megaMenu[1].items[0].label,
          desc: CONTENT.megaMenu[1].items[0].desc,
          icon: Search,
          target: '/marketing/google-ads/',
        },
        {
          label: CONTENT.megaMenu[1].items[1].label,
          desc: CONTENT.megaMenu[1].items[1].desc,
          icon: Megaphone,
          target: '/marketing/meta-ads/',
        },
        {
          label: CONTENT.megaMenu[1].items[2].label,
          desc: CONTENT.megaMenu[1].items[2].desc,
          icon: TrendingUp,
          target: '/marketing/seo/',
        },
        {
          label: CONTENT.megaMenu[1].items[3].label,
          desc: CONTENT.megaMenu[1].items[3].desc,
          icon: BarChart3,
          target: '/marketing/analytics/',
        },
      ],
    },
    {
      category: CONTENT.megaMenu[2].category,
      description: CONTENT.megaMenu[2].description,
      target: '/design/',
      items: [
        {
          label: CONTENT.megaMenu[2].items[0].label,
          desc: CONTENT.megaMenu[2].items[0].desc,
          icon: Palette,
          target: '/design/branding/',
        },
        {
          label: CONTENT.megaMenu[2].items[1].label,
          desc: CONTENT.megaMenu[2].items[1].desc,
          icon: Layout,
          target: '/design/ui-ux/',
        },
        {
          label: CONTENT.megaMenu[2].items[2].label,
          desc: CONTENT.megaMenu[2].items[2].desc,
          icon: Layers,
          target: '/design/print/',
        },
        {
          label: CONTENT.megaMenu[2].items[3].label,
          desc: CONTENT.megaMenu[2].items[3].desc,
          icon: Eye,
          target: '/design/visual-audit/',
        },
      ],
    },
  ];

  const isAnyDropdownOpen = activeDropdown !== null;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
    setActiveDropdown(null);
    toggleScroll(false);
  }, [location.pathname, location.search, toggleScroll]);

  return (
    <header>
      <nav
        aria-label="Główna nawigacja"
        className={`fixed w-full z-[var(--z-nav)] transition-all duration-300 h-20 flex items-center ${isAnyDropdownOpen ? 'bg-white shadow-lg' : scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100' : 'bg-white/80 backdrop-blur-md border-b border-transparent'}`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-full">
            <div
              className="flex-shrink-0 flex items-center cursor-pointer group"
              onClick={handleLogoClick}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
              aria-label="Mixture Marketing - Strona Główna"
            >
              <img
                src="/assets/images/logo.svg"
                alt="Logo Mixture Marketing"
                className="h-10 w-auto transition-transform group-hover:scale-105 duration-300"
                width="102"
                height="40"
                fetchPriority="high"
                loading="eager"
              />
            </div>

            <div className="hidden lg:flex space-x-1 items-center h-full" ref={dropdownRef}>
              <a
                href="#about"
                onClick={(e) => handleAnchorLink('about', e)}
                className="group relative px-4 py-2 text-sm font-bold text-dark hover:text-secondary transition-colors overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
              >
                <span className="relative z-10">{CONTENT.about}</span>
                <span className="absolute bottom-0 left-4 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-[calc(100%-2rem)]"></span>
              </a>

              <Link
                to="/portfolio/"
                className="group relative px-4 py-2 text-sm font-bold text-dark hover:text-secondary transition-colors overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
              >
                <span className="relative z-10">{CONTENT.portfolio}</span>
                <span className="absolute bottom-0 left-4 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-[calc(100%-2rem)]"></span>
              </Link>

              <div
                className="h-full flex items-center"
                onMouseEnter={() => handleMouseEnter(CONTENT.offer.label)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  id="offer-menu-button"
                  className={`px-4 py-2 flex items-center gap-1.5 text-sm font-bold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${activeDropdown === CONTENT.offer.label ? 'text-secondary bg-blue-50' : 'text-dark hover:bg-gray-50'}`}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === CONTENT.offer.label}
                  aria-controls="offer-mega-menu"
                  aria-label={`Menu ${CONTENT.offer.label}`}
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === CONTENT.offer.label ? null : CONTENT.offer.label,
                    )
                  }
                >
                  {CONTENT.offer.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${activeDropdown === CONTENT.offer.label ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>

                <div
                  id="offer-mega-menu"
                  className={`fixed left-0 w-full top-20 z-[var(--z-nav)] transform transition-all duration-500 origin-top ${activeDropdown === CONTENT.offer.label ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible pointer-events-none'}`}
                  style={{ display: activeDropdown === CONTENT.offer.label ? 'block' : 'none' }}
                  role="region"
                  aria-labelledby="offer-menu-button"
                >
                  <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-b-[2.5rem] shadow-[0_40px_100px_-20px_rgba(33,50,97,0.2)] border border-gray-100 border-t-0 overflow-hidden flex flex-row">
                      {/* Left Side: Services Grid */}
                      <div className="flex-1 grid grid-cols-3 divide-x divide-gray-50 p-10">
                        {megaMenuData.map((section, idx) => (
                          <div key={idx} className="px-8 group/col first:pl-0 last:pr-0">
                            <Link
                              to={section.target}
                              onClick={() => setActiveDropdown(null)}
                              className="block mb-8 group/head focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-1"
                              aria-label={`Zobacz kategorię: ${section.category}`}
                            >
                              <h3 className="text-dark font-black text-xl mb-2 group-hover/head:text-accent-dark transition-colors flex items-center gap-2">
                                {section.category}
                                <ArrowRight
                                  size={18}
                                  className="opacity-0 -translate-x-2 group-hover/head:opacity-100 group-hover/head:translate-x-0 transition-all text-accent-dark"
                                />
                              </h3>
                              <p className="text-xs text-gray-700 font-bold uppercase tracking-widest leading-relaxed">
                                {section.description}
                              </p>
                            </Link>
                            <ul className="space-y-3">
                              {section.items.map((item, itemIdx) => (
                                <li key={itemIdx}>
                                  <Link
                                    to={item.target}
                                    onClick={() => setActiveDropdown(null)}
                                    className="group/item flex items-center gap-4 p-3 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border border-transparent hover:border-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
                                    aria-label={`${item.label} - ${item.desc}`}
                                  >
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 group-hover/item:text-secondary group-hover/item:bg-blue-50 group-hover/item:scale-110 transition-all duration-300">
                                      <item.icon size={20} aria-hidden="true" />
                                    </div>
                                    <div>
                                      <div className="text-base font-black text-dark group-hover/item:text-secondary transition-colors">
                                        {item.label}
                                      </div>
                                      <div className="text-xxs text-gray-500 font-medium opacity-0 group-hover/item:opacity-100 transition-all">
                                        {item.desc}
                                      </div>
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Right Side: Featured/Contact Panel */}
                      <div className="w-96 bg-gray-50/50 border-l border-gray-100 p-10 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50"></div>
                        <div className="relative z-10">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 text-secondary text-xxs font-black uppercase tracking-wider mb-8 shadow-sm">
                            <Calendar size={12} fill="currentColor" aria-hidden="true" />{' '}
                            {CONTENT.offer.badge}
                          </div>
                          <h3 className="font-black text-dark text-2xl mb-4 leading-tight">
                            {CONTENT.offer.title} <br />
                            <span className="text-accent-dark">{CONTENT.offer.accent}</span>
                          </h3>
                          <p className="text-sm text-gray-700 leading-relaxed mb-8 font-medium">
                            {CONTENT.offer.desc}
                          </p>
                          <div className="space-y-4 mb-10">
                            {CONTENT.offer.features.map((text, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 text-xs font-bold text-dark"
                              >
                                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100">
                                  <Check size={12} aria-hidden="true" />
                                </div>
                                {text}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-auto">
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => {
                              setActiveDropdown(null);
                              openModal('consultation');
                            }}
                            className="w-full justify-center shadow-xl shadow-secondary/20 rounded-2xl h-12"
                            aria-label={CONTENT.offer.button}
                          >
                            {CONTENT.offer.button}
                          </Button>
                          <div className="flex items-center gap-2 text-xs font-black text-dark tracking-widest bg-white/50 px-3 py-1.5 rounded-full border border-gray-100 mt-4">
                            <Phone size={10} aria-hidden="true" /> {SITE_CONFIG.contact.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="h-full flex items-center"
                onMouseEnter={() => handleMouseEnter(CONTENT.knowledgeBase.label)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to="/baza-wiedzy/"
                  id="kb-menu-button"
                  className={`px-4 py-2 flex items-center gap-1.5 text-sm font-bold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${activeDropdown === CONTENT.knowledgeBase.label ? 'text-secondary bg-blue-50' : 'text-dark hover:bg-gray-50'}`}
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === CONTENT.knowledgeBase.label}
                  aria-controls="kb-mega-menu"
                  aria-label={`Menu ${CONTENT.knowledgeBase.label}`}
                >
                  {CONTENT.knowledgeBase.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${activeDropdown === CONTENT.knowledgeBase.label ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </Link>

                <div
                  id="kb-mega-menu"
                  className={`fixed left-0 w-full top-20 z-[var(--z-nav)] transform transition-all duration-500 origin-top ${activeDropdown === CONTENT.knowledgeBase.label ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible pointer-events-none'}`}
                  style={{
                    display: activeDropdown === CONTENT.knowledgeBase.label ? 'block' : 'none',
                  }}
                  role="region"
                  aria-labelledby="kb-menu-button"
                >
                  <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-b-[2.5rem] shadow-[0_40px_100px_-20px_rgba(33,50,97,0.2)] border border-gray-100 border-t-0 overflow-hidden flex flex-row">
                      {/* Categories */}
                      <div className="flex-1 p-10 grid grid-cols-2 gap-4">
                        {[
                          {
                            label: 'Technologia & Dev',
                            icon: Database,
                            desc: 'Redis, CDN, Edge Computing',
                          },
                          {
                            label: 'Marketing Cyfrowy',
                            icon: Megaphone,
                            desc: 'Google Ads, Meta, SEO',
                          },
                          {
                            label: 'Design & UX',
                            icon: Palette,
                            desc: 'Audyty, WebP, Core Web Vitals',
                          },
                          { label: 'Analityka & Dane', icon: BarChart3, desc: 'CAPI, SST, GA4' },
                        ].map((cat, i) => (
                          <Link
                            key={i}
                            to="/baza-wiedzy"
                            onClick={() => setActiveDropdown(null)}
                            className="group/kb flex items-center gap-4 p-4 rounded-2xl hover:bg-[#F9FAFB] transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label={`Artykuły z kategorii: ${cat.label}`}
                          >
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 group-hover/kb:bg-blue-50 group-hover/kb:text-secondary transition-all">
                              <cat.icon size={24} aria-hidden="true" />
                            </div>
                            <div>
                              <div className="text-sm font-black text-dark">{cat.label}</div>
                              <div className="text-xxs text-gray-700 font-bold uppercase tracking-tighter">
                                {cat.desc}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Featured Articles */}
                      <div className="w-[450px] bg-[#F9FAFB] border-l border-gray-100 p-10">
                        <div className="text-xxs font-black text-accent-dark uppercase tracking-[0.2em] mb-6">
                          {CONTENT.knowledgeBase.badge}
                        </div>
                        <div className="space-y-4">
                          {ARTICLES.filter((a) => a.isFeatured)
                            .slice(0, 2)
                            .map((art, i) => (
                              <Link
                                key={i}
                                to={art.slug}
                                onClick={() => setActiveDropdown(null)}
                                className="group/art flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 hover:border-primary/30 transition-all shadow-sm hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary"
                                aria-label={`Czytaj artykuł: ${art.title}`}
                              >
                                <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0">
                                  <Image
                                    src={art.image}
                                    alt={art.title}
                                    className="w-full h-full object-cover group-hover/art:scale-110 transition-transform duration-500"
                                    width={80}
                                    height={64}
                                  />
                                </div>
                                <div className="flex-grow">
                                  <div className="text-xs font-black text-dark leading-snug group-hover/art:text-accent-dark transition-colors">
                                    {art.title}
                                  </div>
                                  <div className="text-xxs text-gray-700 font-bold mt-1 uppercase tracking-widest flex items-center gap-1">
                                    {CONTENT.knowledgeBase.readMore}{' '}
                                    <ArrowRight size={10} aria-hidden="true" />
                                  </div>
                                </div>
                              </Link>
                            ))}
                        </div>
                        <Link
                          to="/baza-wiedzy"
                          onClick={() => setActiveDropdown(null)}
                          className="inline-flex items-center gap-2 mt-8 text-xs font-black text-secondary uppercase tracking-widest hover:text-accent-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-1"
                          aria-label={CONTENT.knowledgeBase.all}
                        >
                          {CONTENT.knowledgeBase.all} <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to="/contact/"
                className="group relative px-4 py-2 text-sm font-bold text-dark hover:text-secondary transition-colors overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
              >
                <span className="relative z-10">{CONTENT.contact}</span>
                <span className="absolute bottom-0 left-4 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-[calc(100%-2rem)]"></span>
              </Link>

              <div className="pl-6 ml-4 border-l border-gray-100 h-8 flex items-center">
                <Link to="/offers#calculator">
                  <Button
                    variant="primary"
                    size="sm"
                    className="shadow-lg shadow-secondary/10 hover:shadow-xl hover:shadow-secondary/20 rounded-xl"
                  >
                    {CONTENT.pricing}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="relative z-[var(--z-nav)] text-dark focus:outline-none p-2 w-12 h-12 flex flex-col justify-center items-center gap-1.5 group"
                aria-label={isOpen ? 'Zamknij menu nawigacyjne' : 'Otwórz menu nawigacyjne'}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
              >
                <span
                  className={`w-6 h-0.5 bg-dark rounded-full transition-all duration-300 origin-center ${isOpen ? 'rotate-45 translate-y-2 bg-secondary' : ''}`}
                ></span>
                <span
                  className={`w-6 h-0.5 bg-dark rounded-full transition-all duration-300 ${isOpen ? 'opacity-0 -translate-x-2' : ''}`}
                ></span>
                <span
                  className={`w-6 h-0.5 bg-dark rounded-full transition-all duration-300 origin-center ${isOpen ? '-rotate-45 -translate-y-2 bg-secondary' : ''}`}
                ></span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div
        id="mobile-menu"
        className={`lg:hidden fixed inset-0 z-[var(--z-header)] bg-white/98 backdrop-blur-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
        aria-hidden={!isOpen}
        role="navigation"
        aria-label="Menu mobilne"
      >
        <div className="flex-1 px-6 pt-24 pb-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <a
              href="#about"
              onClick={(e) => handleAnchorLink('about', e)}
              className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-2xl font-black transition-all ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'} ${location.pathname === '/' ? 'text-accent-dark' : 'text-dark'}`}
              style={{ transitionDelay: '100ms' }}
              aria-label={`Przejdź do sekcji ${CONTENT.about.toLowerCase()}`}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-blue-50">
                <Users size={20} />
              </div>
              {CONTENT.about}
            </a>

            <Link
              to="/portfolio/"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-2xl font-black transition-all ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'} ${location.pathname.startsWith('/portfolio') ? 'text-accent-dark' : 'text-dark'}`}
              style={{ transitionDelay: '125ms' }}
              aria-label="Przejdź do strony realizacje"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
                <Layout size={20} />
              </div>
              {CONTENT.portfolio}
            </Link>

            <div
              className={`rounded-3xl overflow-hidden bg-gray-50/50 border border-gray-100 shadow-sm transition-all duration-500 ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
              style={{ transitionDelay: '150ms' }}
            >
              <button
                onClick={() => toggleDropdownMobile(CONTENT.offer.label)}
                className={`w-full flex items-center justify-between px-4 py-5 text-2xl font-black text-dark transition-colors ${activeDropdown === CONTENT.offer.label ? 'bg-white' : ''}`}
                aria-expanded={activeDropdown === CONTENT.offer.label}
                aria-controls="mobile-offers-submenu"
              >
                <div className="flex items-center gap-4 text-dark">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-secondary">
                    <Zap size={20} fill="currentColor" />
                  </div>
                  {CONTENT.offer.label}
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeDropdown === CONTENT.offer.label ? 'bg-secondary text-white rotate-180' : 'bg-white text-gray-600 shadow-sm'}`}
                >
                  <ChevronDown size={18} />
                </div>
              </button>

              <div
                id="mobile-offers-submenu"
                className={`grid transition-all duration-500 ease-in-out ${activeDropdown === CONTENT.offer.label ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="overflow-hidden px-4 space-y-8">
                  {megaMenuData.map((section, idx) => (
                    <div key={idx} className="mt-4 first:mt-6">
                      <h5 className="text-xxs font-black text-accent-dark uppercase tracking-[0.2em] mb-4 pl-2 flex items-center justify-between group/cat">
                        <Link
                          to={section.target}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 hover:text-secondary transition-colors"
                          aria-label={`Zobacz kategorię: ${section.category}`}
                        >
                          <span className="w-4 h-[1px] bg-accent-dark"></span>
                          {section.category}
                          <ArrowRight
                            size={12}
                            className="opacity-0 -translate-x-2 group-hover/cat:opacity-100 group-hover/cat:translate-x-0 transition-all"
                          />
                        </Link>
                      </h5>
                      <div className="grid grid-cols-1 gap-2">
                        {/* "See all" link for the category */}
                        <Link
                          to={section.target}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-4 p-3 rounded-xl bg-blue-50/20 border border-primary/10 active:scale-95 transition-transform mb-1"
                          aria-label={`Pełna oferta: ${section.category}`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-accent-dark shrink-0">
                            <Layout size={16} />
                          </div>
                          <span className="text-xs font-black text-secondary uppercase tracking-wider">
                            {CONTENT.mobileMenu.seeAll}
                          </span>
                        </Link>

                        {section.items.map((item, itemIdx) => (
                          <Link
                            key={itemIdx}
                            to={item.target}
                            onClick={() => {
                              setIsOpen(false);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm active:scale-95 transition-transform"
                          >
                            <div className="w-10 h-10 rounded-xl bg-[#F9FAFB] flex items-center justify-center text-secondary shrink-0 shadow-inner">
                              <item.icon size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-dark">{item.label}</span>
                              <span className="text-xxs text-gray-700 font-medium">
                                {item.desc}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Link
              to="/baza-wiedzy/"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-2xl font-black transition-all ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'} ${location.pathname.startsWith('/baza-wiedzy') ? 'text-accent-dark' : 'text-dark'}`}
              style={{ transitionDelay: '200ms' }}
              aria-label={`Przejdź do ${CONTENT.knowledgeBase.label.toLowerCase()}`}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
                <Layers size={20} />
              </div>
              {CONTENT.knowledgeBase.label}
            </Link>

            <Link
              to="/contact/"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-2xl font-black transition-all ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'} ${location.pathname === '/contact' ? 'text-accent-dark' : 'text-dark'}`}
              style={{ transitionDelay: '250ms' }}
              aria-label={`Przejdź do sekcji ${CONTENT.contact.toLowerCase()}`}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
                <Phone size={20} />
              </div>
              {CONTENT.contact}
            </Link>
          </div>
        </div>

        {/* Mobile Menu Footer */}
        <div
          className={`p-6 bg-dark text-white rounded-t-[3rem] shadow-[0_-10px_40px_rgba(33,50,97,0.2)] transition-all duration-700 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
        >
          <div className="flex items-center justify-between mb-6 px-2">
            <div>
              <p className="text-xxs font-bold text-accent-dark uppercase tracking-[0.2em] mb-1">
                {CONTENT.mobileMenu.question}
              </p>
              <p className="text-xl font-black tracking-tight">{SITE_CONFIG.contact.phone}</p>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${SITE_CONFIG.contact.phoneFull}`}
                className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10 active:scale-90"
                aria-label="Zadzwoń do nas"
              >
                <Phone size={20} />
              </a>
            </div>
          </div>
          <Button
            variant="primary"
            className="w-full justify-center py-5 text-lg shadow-xl shadow-secondary/20 group rounded-2xl"
            onClick={() => {
              openModal('consultation');
              setIsOpen(false);
            }}
            aria-label={CONTENT.mobileMenu.cta}
          >
            {CONTENT.mobileMenu.cta}{' '}
            <ArrowRight
              size={20}
              className="ml-2 group-hover:translate-x-1 transition-transform"
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
