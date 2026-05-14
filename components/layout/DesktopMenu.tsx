import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Database, Megaphone, Palette, BarChart3, ArrowRight } from 'lucide-react';
import { NAVBAR_CONTENT as CONTENT } from '@/data/content';
import { LEGACY_ARTICLES } from '@/services/cms/legacyArticles';
import Image from '@/components/common/Image';
import Button from '@/components/common/Button';
import Container from '@/components/common/Container';
import MegaMenu from './MegaMenu';
import { ContactType } from '@/types';

interface DesktopMenuProps {
  activeDropdown: string | null;
  handleMouseEnter: (name: string) => void;
  handleMouseLeave: () => void;
  setActiveDropdown: (name: string | null) => void;
  handleAnchorLink: (anchorId: string, e: React.MouseEvent) => void;
  openModal: (type?: ContactType, data?: Record<string, unknown>) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

const DesktopMenu: React.FC<DesktopMenuProps> = ({
  activeDropdown,
  handleMouseEnter,
  handleMouseLeave,
  setActiveDropdown,
  handleAnchorLink: _handleAnchorLink,
  openModal,
  dropdownRef,
}) => {
  return (
    <div className="hidden lg:flex space-x-1 items-center h-full" ref={dropdownRef}>
      <Link
        to="/o-nas/"
        className="group relative px-4 py-2 text-sm font-bold text-dark hover:text-secondary transition-colors overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
      >
        <span className="relative z-10">{CONTENT.about}</span>
        <span className="absolute bottom-0 left-4 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-[calc(100%-2rem)]"></span>
      </Link>

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
            setActiveDropdown(activeDropdown === CONTENT.offer.label ? null : CONTENT.offer.label)
          }
        >
          {CONTENT.offer.label}
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${activeDropdown === CONTENT.offer.label ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
        <MegaMenu
          activeDropdown={activeDropdown}
          onClose={() => setActiveDropdown(null)}
          onOpenModal={openModal}
        />
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
          <Container>
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
                  {LEGACY_ARTICLES.filter((a) => a.isFeatured)
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
          </Container>
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
  );
};

export default DesktopMenu;
