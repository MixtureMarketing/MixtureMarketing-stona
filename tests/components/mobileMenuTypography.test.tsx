import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ModalProvider } from '../../context/ModalContext';
import Navbar from '../../components/layout/Navbar';
import { MOBILE_MENU_DATA } from '../../components/layout/navbarData';

// MIX-1381 (opcja A): etykiety kategorii w starym menu mobilnym mają 16 px (text-base),
// opisy usług zostają 10 px (text-xxs).
describe('MobileMenu — typografia kategorii i opisów', () => {
  const openMenu = () => {
    render(
      <MemoryRouter>
        <ModalProvider>
          <Navbar />
        </ModalProvider>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Menu nawigacyjne' }));
    const offers = document.querySelector('button[aria-controls="mobile-offers-submenu"]');
    expect(offers).not.toBeNull();
    fireEvent.click(offers as Element);
  };

  it('etykieta każdej kategorii: kontener ma text-base, bez text-xxs', () => {
    openMenu();
    expect(MOBILE_MENU_DATA.length).toBeGreaterThanOrEqual(3);
    for (const section of MOBILE_MENU_DATA) {
      const links = Array.from(
        document.querySelectorAll('#mobile-offers-submenu a[aria-label]'),
      ).filter((el) => el.getAttribute('aria-label') === `Zobacz kategorię: ${section.category}`);
      expect(links).toHaveLength(1);
      const link = links[0];
      const container = link.parentElement as HTMLElement;
      expect(container.classList.contains('text-base')).toBe(true);
      expect(container.classList.contains('text-xxs')).toBe(false);
      expect(link.classList.contains('text-xxs')).toBe(false);
    }
  });

  it('opis każdej usługi zostaje text-xxs (10 px)', () => {
    openMenu();
    for (const section of MOBILE_MENU_DATA) {
      for (const item of section.items) {
        const descs = Array.from(document.querySelectorAll('#mobile-offers-submenu span')).filter(
          (el) => el.textContent === item.desc,
        );
        expect(descs.length).toBeGreaterThan(0);
        for (const d of descs) {
          expect(d.classList.contains('text-xxs')).toBe(true);
          expect(d.classList.contains('text-base')).toBe(false);
        }
      }
    }
  });
});
