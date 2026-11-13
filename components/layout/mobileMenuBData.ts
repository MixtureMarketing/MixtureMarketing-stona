import { BookOpen, Layers, LayoutGrid, Mail, Users, LucideIcon } from 'lucide-react';
import { NAVBAR_CONTENT as CONTENT } from '@/data/content';
import { MOBILE_MENU_DATA } from './navbarData';

// MIX-1465: teksty i dane menu B („Karta pod kciukiem”, makieta 3daea5a makiety/mix1465/b.html).
// Osobny moduł: importuje go tylko MobileMenuB, więc przy wyłączonym przełączniku te napisy nie
// trafiają do starego menu. Nazwy usług, kategorii i opisów idą ze słownika (NAVBAR_CONTENT).

export const MMB_TEXT = {
  dialog: 'Menu',
  close: 'Zamknij menu',
  kicker: 'Menu',
  mainNav: 'Menu główne',
  offerSub: 'Strony, marketing',
  services: ' usług',
  back: 'Wróć do menu',
  tabs: 'Obszary oferty',
  tabLabels: ['Strony', 'Marketing', 'Design'],
  promoKicker: 'Nowość',
  promoTitle: 'Strona w abonamencie',
  promoSub: 'od 179 zł/mc',
  promoTarget: '/abonament/',
  call: 'Zadzwoń',
} as const;

export interface MmbMainLink {
  label: string;
  target: string;
  icon: LucideIcon;
  /** true = aktywny też dla podstron (np. /portfolio/<projekt>/). */
  prefix: boolean;
}

/** Kolejność z makiety: O Nas, Realizacje, [Oferta], Baza Wiedzy, Kontakt. */
export const MMB_MAIN_BEFORE: MmbMainLink[] = [
  { label: CONTENT.about, target: '/o-nas/', icon: Users, prefix: false },
  { label: CONTENT.portfolio, target: '/portfolio/', icon: LayoutGrid, prefix: true },
];
export const MMB_MAIN_AFTER: MmbMainLink[] = [
  { label: CONTENT.knowledgeBase.label, target: '/baza-wiedzy/', icon: BookOpen, prefix: true },
  { label: CONTENT.contact, target: '/contact/', icon: Mail, prefix: false },
];
export const MMB_OFFER_ICON = Layers;

export const MMB_SECTIONS = MOBILE_MENU_DATA.map((section, i) => ({
  ...section,
  tab: MMB_TEXT.tabLabels[i],
  description: CONTENT.megaMenu[i].description,
}));

export const MMB_SERVICE_COUNT = MOBILE_MENU_DATA.reduce((n, s) => n + s.items.length, 0);

/** Ścieżka zawsze z ukośnikiem na końcu, żeby /o-nas i /o-nas/ znaczyły to samo. */
const norm = (p: string) => (p.endsWith('/') ? p : `${p}/`);

/**
 * Podświetlenie bieżącej strony (decyzja Jakuba MIX-1465, opcja A): `aria-current="page"` tylko
 * dla linku bieżącej strony; strona główna nie podświetla niczego.
 */
export function isCurrentPage(pathname: string, target: string, prefix = false): boolean {
  const path = norm(pathname);
  if (path === '/' || target === '/') return false;
  return prefix ? path.startsWith(target) : path === target;
}
