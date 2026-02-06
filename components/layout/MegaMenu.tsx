import React from 'react';
import { Link } from 'react-router-dom';
import {
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
} from 'lucide-react';
import Button from '@/components/common/Button';
import Container from '@/components/common/Container';
import { NAVBAR_CONTENT as CONTENT } from '@/data/content';
import { SITE_CONFIG } from '@/config/site';
import { ContactType } from '@/types';

// Map icon names to components for "data-driven" rendering if needed,
// though currently CONTENT is hardcoded so we can map directly or keep static.
// For now, we'll follow the existing structure where CONTENT has text,
// and we map icons here or reuse the structure from Navbar.

interface MegaMenuProps {
  activeDropdown: string | null;
  onClose: () => void;
  onOpenModal: (type: ContactType) => void;
}

const MEGA_MENU_DATA = [
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

const MegaMenu: React.FC<MegaMenuProps> = React.memo(({ activeDropdown, onClose, onOpenModal }) => {
  const isVisible = activeDropdown === CONTENT.offer.label;

  return (
    <div
      id="offer-mega-menu"
      className={`fixed left-0 w-full top-20 z-[var(--z-nav)] transform transition-all duration-500 origin-top ${isVisible ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible pointer-events-none'}`}
      style={{ display: isVisible ? 'block' : 'none' }} // Keep inline style for JS control if needed, but classes handle it well
      role="region"
      aria-labelledby="offer-menu-button"
    >
      <Container>
        <div className="bg-white rounded-b-[2.5rem] shadow-[0_40px_100px_-20px_rgba(33,50,97,0.2)] border border-gray-100 border-t-0 overflow-hidden flex flex-row">
          {/* Left Side: Services Grid */}
          <div className="flex-1 grid grid-cols-3 divide-x divide-gray-50 p-10">
            {MEGA_MENU_DATA.map((section, idx) => (
              <div key={idx} className="px-8 group/col first:pl-0 last:pr-0">
                <Link
                  to={section.target}
                  onClick={onClose}
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
                        onClick={onClose}
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
                <Calendar size={12} fill="currentColor" aria-hidden="true" /> {CONTENT.offer.badge}
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
                  <div key={i} className="flex items-center gap-3 text-xs font-bold text-dark">
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
                  onClose();
                  onOpenModal('consultation');
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
      </Container>
    </div>
  );
});

MegaMenu.displayName = 'MegaMenu';

export default MegaMenu;
