// MIX-1411: wariant B menu mobilnego (drugi ekran „Oferta”) za przełącznikiem VITE_MM_MOBILE_MENU_B.
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ModalProvider } from '../../context/ModalContext';
import Navbar from '../../components/layout/Navbar';
import { isMobileMenuBEnabled } from '../../components/layout/mobileMenuFlag';

function renderNavbar() {
  const utils = render(
    <MemoryRouter initialEntries={['/']}>
      <ModalProvider>
        <Navbar />
      </ModalProvider>
    </MemoryRouter>,
  );
  const toggle = utils.container.querySelector(
    'button[aria-controls="mobile-menu"]',
  ) as HTMLElement;
  const menu = utils.container.querySelector('#mobile-menu') as HTMLElement;
  const offerScreen = () => utils.container.querySelector('#mobile-menu-offer') as HTMLElement;
  const mainList = () => menu.querySelector('ul') as HTMLElement;
  const offerButton = () =>
    menu.querySelector('button[aria-controls="mobile-menu-offer"]') as HTMLButtonElement;
  return { ...utils, toggle, menu, offerScreen, mainList, offerButton };
}

describe('isMobileMenuBEnabled — domyślnie wyłączony, allowlista wartości', () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each([
    [undefined, false],
    ['', false],
    ['0', false],
    ['false', false],
    ['TRUE', false],
    [' 1', false],
    ['yes', false],
    [1, false],
    [true, false],
    [null, false],
    ['1', true],
    ['true', true],
  ])('surowa wartość %j → %s', (raw, expected) => {
    expect(isMobileMenuBEnabled(raw)).toBe(expected);
  });

  it('bez zmiennej w środowisku budowy = wyłączony; VITE_MM_MOBILE_MENU_B=1 = włączony', () => {
    vi.stubEnv('VITE_MM_MOBILE_MENU_B', undefined as unknown as string);
    expect(isMobileMenuBEnabled()).toBe(false);
    vi.stubEnv('VITE_MM_MOBILE_MENU_B', '1');
    expect(isMobileMenuBEnabled()).toBe(true);
  });
});

describe('Menu mobilne B (przełącznik włączony)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_MM_MOBILE_MENU_B', '1');
    document.body.style.overflow = '';
  });
  afterEach(() => vi.unstubAllEnvs());

  it('przełącznik wyłączony: brak drugiego ekranu (stare menu)', () => {
    vi.stubEnv('VITE_MM_MOBILE_MENU_B', '0');
    const { container } = renderNavbar();
    expect(container.querySelector('#mobile-menu-offer')).toBeNull();
    expect(container.querySelector('#mobile-offers-submenu')).not.toBeNull();
  });

  it('„Oferta” otwiera drugi ekran, fokus na nagłówku, czytnik słyszy nazwę ekranu', () => {
    const r = renderNavbar();
    expect(screen.getByRole('button', { name: 'Menu nawigacyjne' })).toBe(r.toggle);
    fireEvent.click(r.toggle);
    expect(r.offerScreen().hidden).toBe(true);
    expect(r.mainList().hidden).toBe(false);
    expect(within(r.menu).getByRole('button', { name: 'Oferta' })).toBe(r.offerButton());

    fireEvent.click(r.offerButton());

    expect(r.offerScreen().hidden).toBe(false);
    expect(r.mainList().hidden).toBe(true);
    const group = within(r.menu).getByRole('group', { name: 'Oferta' });
    expect(group).toBe(r.offerScreen());
    expect(document.activeElement?.id).toBe('mobile-menu-offer-title');
    expect(document.activeElement?.textContent).toBe('Oferta');
  });

  it('strzałka „wstecz” wraca do ekranu głównego, fokus na przycisku „Oferta”', () => {
    const r = renderNavbar();
    fireEvent.click(r.toggle);
    fireEvent.click(r.offerButton());
    fireEvent.click(within(r.menu).getByRole('button', { name: 'Wróć do menu' }));

    expect(r.offerScreen().hidden).toBe(true);
    expect(r.mainList().hidden).toBe(false);
    expect(document.activeElement).toBe(r.offerButton());
  });

  it('Escape zamyka menu, odblokowuje przewijanie i oddaje fokus przełącznikowi', () => {
    const r = renderNavbar();
    fireEvent.click(r.toggle);
    fireEvent.click(r.offerButton());
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Enter' });
    expect(r.toggle.getAttribute('aria-expanded')).toBe('true');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(r.toggle.getAttribute('aria-expanded')).toBe('false');
    expect(r.menu.getAttribute('aria-hidden')).toBe('true');
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(r.toggle);
  });

  it('po zamknięciu z ekranu „Oferta” kolejne otwarcie zaczyna od ekranu głównego', () => {
    const r = renderNavbar();
    fireEvent.click(r.toggle);
    fireEvent.click(r.offerButton());
    fireEvent.click(within(r.menu).getByRole('button', { name: 'Zamknij menu nawigacyjne' }));
    // Reset już przy zamknięciu (zamknięte menu w DOM zawsze pokazuje ekran główny).
    expect(r.toggle.getAttribute('aria-expanded')).toBe('false');
    expect(r.mainList().hidden).toBe(false);
    expect(r.offerScreen().hidden).toBe(true);
    fireEvent.click(r.toggle);
    expect(r.mainList().hidden).toBe(false);
    expect(r.offerScreen().hidden).toBe(true);
  });

  it('każdy link obu ekranów i przycisk konsultacji zamyka menu i odblokowuje przewijanie', () => {
    const probe = renderNavbar();
    const mainCount = probe.mainList().querySelectorAll('a').length;
    const offerCount = probe.offerScreen().querySelectorAll('a').length;
    probe.unmount();
    expect(mainCount).toBe(4);
    expect(offerCount).toBe(15);

    const targets: Array<['main' | 'offer', number]> = [
      ...Array.from({ length: mainCount }, (_, i) => ['main', i] as ['main', number]),
      ...Array.from({ length: offerCount }, (_, i) => ['offer', i] as ['offer', number]),
    ];
    for (const [where, i] of targets) {
      const r = renderNavbar();
      fireEvent.click(r.toggle);
      if (where === 'offer') fireEvent.click(r.offerButton());
      expect(document.body.style.overflow).toBe('hidden');
      const host = where === 'main' ? r.mainList() : r.offerScreen();
      const link = host.querySelectorAll('a')[i];
      fireEvent.click(link);
      // Sprawdzenie od razu po kliknięciu: zamyka sam link, nie zamknięcie po zmianie trasy.
      expect(r.toggle.getAttribute('aria-expanded'), `${where}#${i}`).toBe('false');
      expect(document.body.style.overflow, `${where}#${i}`).toBe('');
      r.unmount();
    }

    const r = renderNavbar();
    fireEvent.click(r.toggle);
    fireEvent.click(within(r.menu).getByRole('button', { name: 'Darmowa Konsultacja' }));
    expect(r.toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.body.style.overflow).toBe('');
  }, 30_000);

  it('nazwy ze słownika i brak nowych linków względem starego menu', () => {
    const r = renderNavbar();
    fireEvent.click(r.toggle);
    expect(r.offerButton().textContent).toBe('Oferta');
    expect(within(r.offerScreen()).getAllByText('Zobacz całą ofertę')).toHaveLength(3);
    expect(within(r.menu).getByRole('button', { name: 'Darmowa Konsultacja' })).toBeTruthy();

    const fixture = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../fixtures/mobile-menu-off.json'), 'utf8'),
    ) as Record<string, string>;
    const oldHrefs = new Set([...fixture.offer.matchAll(/href="([^"]+)"/g)].map((m) => m[1]));
    const newHrefs = [...r.menu.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(newHrefs.length).toBeGreaterThan(0);
    expect(newHrefs.filter((h) => !oldHrefs.has(h as string))).toEqual([]);
  });

  it('menu B nie wnosi nagłówków h1–h6 (menu leży w DOM przed <h1> strony)', () => {
    const r = renderNavbar();
    expect(r.menu.querySelectorAll('h1,h2,h3,h4,h5,h6')).toHaveLength(0);
  });
});
