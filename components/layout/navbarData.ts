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
  LucideIcon,
} from 'lucide-react';
import { NAVBAR_CONTENT as CONTENT } from '@/data/content';

export interface MobileMenuItem {
  label: string;
  desc: string;
  icon: LucideIcon;
  target: string;
}

export interface MobileMenuSection {
  category: string;
  target: string;
  items: MobileMenuItem[];
}

export const MOBILE_MENU_DATA: MobileMenuSection[] = [
  {
    category: CONTENT.megaMenu[0].category,
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
