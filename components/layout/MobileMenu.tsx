import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Layout, Zap, ChevronDown, ArrowRight, Layers, Phone } from 'lucide-react';
import { NAVBAR_CONTENT as CONTENT } from '@/data/content';
import { SITE_CONFIG } from '@/config/site';
import Button from '@/components/common/Button';
import { MOBILE_MENU_DATA } from './navbarData';
import { ContactType } from '@/types';

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeDropdown: string | null;
  toggleDropdownMobile: (name: string) => void;
  handleAnchorLink: (anchorId: string, e: React.MouseEvent) => void;
  location: { pathname: string };
  openModal: (type: ContactType, data?: Record<string, unknown>) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  setIsOpen,
  activeDropdown,
  toggleDropdownMobile,
  handleAnchorLink: _handleAnchorLink,
  location,
  openModal,
}) => {
  return (
    <div
      id="mobile-menu"
      className={`lg:hidden fixed inset-0 z-[var(--z-header)] bg-white/98 backdrop-blur-2xl transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0 visible' : 'translate-x-full invisible'} flex flex-col`}
      aria-hidden={!isOpen}
      role="navigation"
      aria-label="Menu mobilne"
    >
      <div className="flex-1 px-6 pt-24 pb-8 overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          <Link
            to="/o-nas/"
            className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-2xl font-black transition-all ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'} ${location.pathname === '/o-nas' || location.pathname === '/o-nas/' ? 'text-accent-dark' : 'text-dark'}`}
            style={{ transitionDelay: '100ms' }}
            aria-label="Przejdz do strony O nas"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-blue-50">
              <Users size={20} />
            </div>
            {CONTENT.about}
          </Link>

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
                {MOBILE_MENU_DATA.map((section, idx) => (
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
                            toggleDropdownMobile(CONTENT.offer.label); // Use toggle instead of direct state if needed
                          }}
                          className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm active:scale-95 transition-transform"
                        >
                          <div className="w-10 h-10 rounded-xl bg-F9FAFB flex items-center justify-center text-secondary shrink-0 shadow-inner">
                            <item.icon size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-dark">{item.label}</span>
                            <span className="text-xxs text-gray-700 font-medium">{item.desc}</span>
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
  );
};

export default MobileMenu;
