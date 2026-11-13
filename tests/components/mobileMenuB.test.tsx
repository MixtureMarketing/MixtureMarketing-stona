// MIX-1411: wariant B menu mobilnego za przełącznikiem VITE_MM_MOBILE_MENU_B.
// MIX-1465: wariant B = zatwierdzona makieta B (karta od dołu, „Oferta” z zakładkami); decyzje
// Jakuba: Escape cofa o poziom (opcja A), podświetlona tylko bieżąca strona (opcja A).
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ModalProvider } from '../../context/ModalContext';
import Navbar from '../../components/layout/Navbar';
import MobileMenuBSlot from '../../components/layout/MobileMenuBSlot';
import { isMobileMenuBEnabled } from '../../components/layout/mobileMenuFlag';
import { RESET_AFTER_CLOSE_MS } from '../../components/layout/MobileMenuB';
import { isCurrentPage } from '../../components/layout/mobileMenuBData';

function renderNavbar(route = '/') {
  const utils = render(
    <MemoryRouter initialEntries={[route]}>
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
  const mainScreen = () => menu.querySelector('nav') as HTMLElement;
  const mainList = () => mainScreen().querySelector('ul') as HTMLElement;
  const offerButton = () =>
    menu.querySelector('button[aria-controls="mobile-menu-offer"]') as HTMLButtonElement;
  const current = () => [...menu.querySelectorAll('[aria-current="page"]')] as HTMLElement[];
  const esc = () => fireEvent.keyDown(document, { key: 'Escape' });
  return { ...utils, toggle, menu, offerScreen, mainScreen, mainList, offerButton, current, esc };
}

const isOn = (el: HTMLElement) => !el.hasAttribute('inert');

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

// MIX-1465 kryt. 2: menu B to osobny fragment (React.lazy), wycinany z budowy bez przełącznika.
// Pierwsze wyświetlenie czeka na import fragmentu; potem fragment jest w pamięci modułu, więc
// testy niżej (także uruchomione pojedynczo przez -t) renderują menu B synchronicznie.
const slotProps = {
  isOpen: false,
  setIsOpen: () => {},
  location: { pathname: '/', search: '', hash: '', state: null, key: 'k' },
  openModal: () => {},
};
const renderSlot = () =>
  render(
    <MemoryRouter>
      <MobileMenuBSlot {...slotProps} />
    </MemoryRouter>,
  );

beforeAll(async () => {
  vi.stubEnv('VITE_MM_MOBILE_MENU_B', '1');
  const r = renderSlot();
  await waitFor(() => expect(r.container.querySelector('#mobile-menu')).not.toBeNull());
  r.unmount();
  vi.unstubAllEnvs();
});

describe('MobileMenuBSlot — fragment menu B tylko przy przełączniku (allowlista budowy)', () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each([undefined, '', '0', 'false', 'TRUE', ' 1', 'yes'])(
    'VITE_MM_MOBILE_MENU_B=%j: pusty, bez menu B',
    (raw) => {
      if (raw !== undefined) vi.stubEnv('VITE_MM_MOBILE_MENU_B', raw);
      else vi.stubEnv('VITE_MM_MOBILE_MENU_B', undefined as unknown as string);
      expect(renderSlot().container.innerHTML).toBe('');
    },
  );

  it.each(['1', 'true'])('VITE_MM_MOBILE_MENU_B=%j: menu B (karta #mobile-menu)', async (raw) => {
    vi.stubEnv('VITE_MM_MOBILE_MENU_B', raw);
    const r = renderSlot();
    await waitFor(() => expect(r.container.querySelector('.mmb #mobile-menu')).not.toBeNull());
  });
});

describe('Menu mobilne B (przełącznik włączony)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_MM_MOBILE_MENU_B', '1');
    document.body.style.overflow = '';
    document.body.style.position = '';
  });
  afterEach(() => vi.unstubAllEnvs());

  it('przełącznik wyłączony: brak drugiego ekranu (stare menu)', () => {
    vi.stubEnv('VITE_MM_MOBILE_MENU_B', '0');
    const { container } = renderNavbar();
    expect(container.querySelector('#mobile-menu-offer')).toBeNull();
    expect(container.querySelector('#mobile-offers-submenu')).not.toBeNull();
  });

  it('karta jak w makiecie: okno „Menu”, kolejność i nazwy pozycji, fokus na X po otwarciu', () => {
    const r = renderNavbar();
    expect(screen.getByRole('button', { name: 'Menu nawigacyjne' })).toBe(r.toggle);
    expect(r.menu.getAttribute('role')).toBe('dialog');
    expect(r.menu.getAttribute('aria-modal')).toBe('true');
    expect(r.menu.getAttribute('aria-label')).toBe('Menu');
    expect(r.menu.hasAttribute('inert')).toBe(true);
    fireEvent.click(r.toggle);
    expect(r.menu.hasAttribute('inert')).toBe(false);
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Zamknij menu');
    const rows = [...r.mainList().querySelectorAll('li > a, li > button')].map(
      (el) => el.querySelector('strong')?.textContent,
    );
    expect(rows).toEqual(['O Nas', 'Realizacje', 'Oferta', 'Baza Wiedzy', 'Kontakt']);
    expect(r.offerButton().querySelector('small')?.textContent).toBe('Strony, marketing');
    expect(r.offerButton().querySelector('.mmb-chip')?.textContent).toBe('12 usług');
    const promo = r.mainScreen().querySelector('a.mmb-promo') as HTMLAnchorElement;
    expect(promo.getAttribute('href')).toBe('/abonament/');
    expect(promo.textContent).toBe('NowośćStrona w abonamencieod 179 zł/mc');
    expect(within(r.menu).getByText('Zadzwoń').closest('a')?.getAttribute('href')).toMatch(/^tel:/);
  });

  it('„Oferta” otwiera drugi ekran, fokus na nagłówku, czytnik słyszy nazwę ekranu', () => {
    const r = renderNavbar();
    fireEvent.click(r.toggle);
    expect(isOn(r.offerScreen())).toBe(false);
    expect(isOn(r.mainScreen())).toBe(true);
    expect(within(r.menu).getByRole('button', { name: /^Oferta/ })).toBe(r.offerButton());
    expect(r.offerButton().getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(r.offerButton());

    expect(isOn(r.offerScreen())).toBe(true);
    expect(isOn(r.mainScreen())).toBe(false);
    expect(r.offerButton().getAttribute('aria-expanded')).toBe('true');
    expect(within(r.menu).getByRole('region', { name: 'Oferta' })).toBe(r.offerScreen());
    expect(document.activeElement?.id).toBe('mobile-menu-offer-title');
    expect(document.activeElement?.textContent).toBe('Oferta');
  });

  it('zakładki: klik i strzałki/Home/End zmieniają panel; każdy panel ma swoją zakładkę', () => {
    const r = renderNavbar();
    fireEvent.click(r.toggle);
    fireEvent.click(r.offerButton());
    const tabs = within(r.offerScreen()).getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual(['Strony', 'Marketing', 'Design']);
    const panels = () =>
      [...r.offerScreen().querySelectorAll('[role="tabpanel"]')] as HTMLElement[];
    const shown = () => panels().findIndex((p) => !p.hidden);
    expect(shown()).toBe(0);
    fireEvent.click(tabs[1]);
    expect(shown()).toBe(1);
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('tabindex')).toBe('-1');
    expect(panels()[1].getAttribute('aria-labelledby')).toBe(tabs[1].id);
    fireEvent.keyDown(tabs[1], { key: 'End' });
    expect(shown()).toBe(2);
    expect(document.activeElement).toBe(tabs[2]);
    fireEvent.keyDown(tabs[2], { key: 'ArrowRight' });
    expect(shown()).toBe(0);
    fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' });
    expect(shown()).toBe(2);
    fireEvent.keyDown(tabs[2], { key: 'Home' });
    expect(shown()).toBe(0);
    expect(within(panels()[1]).getByText('Marketing Cyfrowy')).toBeTruthy();
  });

  it('strzałka „wstecz” wraca do ekranu głównego, fokus na przycisku „Oferta”', () => {
    const r = renderNavbar();
    fireEvent.click(r.toggle);
    fireEvent.click(r.offerButton());
    fireEvent.click(within(r.menu).getByRole('button', { name: 'Wróć do menu' }));

    expect(isOn(r.offerScreen())).toBe(false);
    expect(isOn(r.mainScreen())).toBe(true);
    expect(document.activeElement).toBe(r.offerButton());
  });

  it('Escape (opcja A) na ekranie „Oferta” cofa do menu i NIE zamyka; drugi Escape zamyka', () => {
    const r = renderNavbar();
    fireEvent.click(r.toggle);
    fireEvent.click(r.offerButton());
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Enter' });
    expect(r.toggle.getAttribute('aria-expanded')).toBe('true');

    r.esc();
    expect(r.toggle.getAttribute('aria-expanded')).toBe('true');
    expect(r.menu.getAttribute('aria-hidden')).toBe('false');
    expect(isOn(r.mainScreen())).toBe(true);
    expect(isOn(r.offerScreen())).toBe(false);
    expect(document.activeElement).toBe(r.offerButton());

    r.esc();
    expect(r.toggle.getAttribute('aria-expanded')).toBe('false');
    expect(r.menu.getAttribute('aria-hidden')).toBe('true');
    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.position).toBe('');
    expect(document.activeElement).toBe(r.toggle);
  });

  it('Escape (opcja A) na ekranie głównym zamyka od razu i oddaje fokus przyciskowi menu', () => {
    const r = renderNavbar();
    fireEvent.click(r.toggle);
    expect(document.body.style.position).toBe('fixed');
    r.esc();
    expect(r.toggle.getAttribute('aria-expanded')).toBe('false');
    expect(r.menu.hasAttribute('inert')).toBe(true);
    expect(document.body.style.position).toBe('');
    expect(document.activeElement).toBe(r.toggle);
  });

  it('pułapka fokusu: Tab z ostatniego wraca na X, Shift+Tab z X idzie na ostatni', () => {
    const r = renderNavbar();
    fireEvent.click(r.toggle);
    const x = within(r.menu).getByRole('button', { name: 'Zamknij menu' });
    const cta = within(r.menu).getByRole('button', { name: 'Darmowa Konsultacja' });
    expect(document.activeElement).toBe(x);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(cta);
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(x);
    // Strona pod kartą jest wyłączona (inert), przycisk menu też.
    expect(r.toggle.closest('[inert]')).not.toBeNull();
    r.esc();
    expect(r.toggle.closest('[inert]')).toBeNull();
  });

  it('kliknięcie w tło zamyka menu', () => {
    const r = renderNavbar();
    fireEvent.click(r.toggle);
    fireEvent.click(r.container.querySelector('.mmb-scrim') as HTMLElement);
    expect(r.toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('po zamknięciu z ekranu „Oferta” kolejne otwarcie zaczyna od ekranu głównego', async () => {
    const r = renderNavbar();
    fireEvent.click(r.toggle);
    fireEvent.click(r.offerButton());
    fireEvent.click(within(r.offerScreen()).getAllByRole('tab')[2]);
    fireEvent.click(within(r.menu).getByRole('button', { name: 'Zamknij menu' }));
    expect(r.toggle.getAttribute('aria-expanded')).toBe('false');
    // Reset po zjechaniu karty (jak w makiecie), nie w trakcie animacji zamknięcia.
    expect(isOn(r.offerScreen())).toBe(true);
    await act(() => new Promise((res) => setTimeout(res, RESET_AFTER_CLOSE_MS + 50)));
    expect(isOn(r.mainScreen())).toBe(true);
    expect(isOn(r.offerScreen())).toBe(false);
    fireEvent.click(r.toggle);
    expect(isOn(r.mainScreen())).toBe(true);
    expect(within(r.offerScreen()).getAllByRole('tab')[0].getAttribute('aria-selected')).toBe(
      'true',
    );
  });

  it('każdy link obu ekranów i przycisk konsultacji zamyka menu i odblokowuje przewijanie', () => {
    const probe = renderNavbar();
    const mainCount = probe.mainScreen().querySelectorAll('a').length;
    const offerCount = probe.offerScreen().querySelectorAll('a').length;
    probe.unmount();
    expect(mainCount).toBe(5);
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
      const host = where === 'main' ? r.mainScreen() : r.offerScreen();
      const link = host.querySelectorAll('a')[i];
      const panel = link.closest('[role="tabpanel"]');
      if (panel)
        fireEvent.click(r.container.querySelector(`#${panel.getAttribute('aria-labelledby')}`)!);
      fireEvent.click(link);
      // Sprawdzenie od razu po kliknięciu: zamyka sam link, nie zamknięcie po zmianie trasy.
      expect(r.toggle.getAttribute('aria-expanded'), `${where}#${i}`).toBe('false');
      expect(document.body.style.overflow, `${where}#${i}`).toBe('');
      expect(document.body.style.position, `${where}#${i}`).toBe('');
      r.unmount();
    }

    const r = renderNavbar();
    fireEvent.click(r.toggle);
    fireEvent.click(within(r.menu).getByRole('button', { name: 'Darmowa Konsultacja' }));
    expect(r.toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.body.style.overflow).toBe('');
  }, 30_000);

  it('nazwy ze słownika i jedyny nowy link względem starego menu to „Strona w abonamencie”', () => {
    const r = renderNavbar();
    fireEvent.click(r.toggle);
    expect(within(r.offerScreen()).getAllByText(/^Zobacz całą ofertę: /)).toHaveLength(3);
    expect(within(r.offerScreen()).getByText('Zobacz całą ofertę: Grafika & Design')).toBeTruthy();
    expect(within(r.menu).getByRole('button', { name: 'Darmowa Konsultacja' })).toBeTruthy();

    const fixture = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../fixtures/mobile-menu-off.json'), 'utf8'),
    ) as Record<string, string>;
    const oldHrefs = new Set([...fixture.offer.matchAll(/href="([^"]+)"/g)].map((m) => m[1]));
    const newHrefs = [...r.menu.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(newHrefs.length).toBe(21);
    expect(newHrefs.filter((h) => !oldHrefs.has(h as string))).toEqual(['/abonament/']);
  });

  it('menu B nie wnosi nagłówków h1–h6 (menu leży w DOM przed <h1> strony)', () => {
    const r = renderNavbar();
    expect(r.menu.querySelectorAll('h1,h2,h3,h4,h5,h6')).toHaveLength(0);
  });
});

describe('Podświetlenie bieżącej strony (opcja A): aria-current="page"', () => {
  beforeEach(() => vi.stubEnv('VITE_MM_MOBILE_MENU_B', '1'));
  afterEach(() => vi.unstubAllEnvs());

  it('strona główna: 0 pozycji z aria-current', () => {
    const r = renderNavbar('/');
    expect(r.current()).toHaveLength(0);
  });

  it.each([
    ['/portfolio/', 'Realizacje'],
    ['/portfolio/jakis-projekt/', 'Realizacje'],
    ['/o-nas', 'O Nas'],
    ['/contact/', 'Kontakt'],
    ['/baza-wiedzy/artykul/', 'Baza Wiedzy'],
    ['/marketing/google-ads/', 'Google Ads'],
    ['/design/', 'Zobacz całą ofertę: Grafika & Design'],
    ['/abonament/professional/', 'NowośćStrona w abonamencieod 179 zł/mc'],
  ])('%s → dokładnie jedna pozycja: %s', (route, label) => {
    const r = renderNavbar(route);
    const cur = r.current();
    expect(cur).toHaveLength(1);
    expect(cur[0].tagName).toBe('A');
    const name = cur[0].querySelector('strong')?.closest('.mmb-promo')
      ? cur[0].textContent
      : (cur[0].querySelector('strong')?.textContent ?? cur[0].textContent);
    expect(name).toBe(label);
  });

  it.each(['/o-nas-x/', '/contact/dziekujemy/', '/marketing/', '/web-development/landing'])(
    '%s → podświetlenie tylko tam, gdzie adres się zgadza',
    (route) => {
      const r = renderNavbar(route);
      const hrefs = r.current().map((a) => a.getAttribute('href'));
      for (const h of hrefs) expect(route.startsWith(h as string)).toBe(true);
      expect(r.current().filter((a) => a.getAttribute('href') === '/o-nas/')).toHaveLength(0);
      expect(r.current().filter((a) => a.getAttribute('href') === '/contact/')).toHaveLength(0);
    },
  );

  it('isCurrentPage: strona główna nigdy, przedrostek tylko dla sekcji', () => {
    expect(isCurrentPage('/', '/portfolio/', true)).toBe(false);
    expect(isCurrentPage('', '/o-nas/')).toBe(false);
    expect(isCurrentPage('/o-nas', '/o-nas/')).toBe(true);
    expect(isCurrentPage('/o-nas/zespol/', '/o-nas/')).toBe(false);
    expect(isCurrentPage('/portfolio', '/portfolio/', true)).toBe(true);
    expect(isCurrentPage('/portfoliox/', '/portfolio/', true)).toBe(false);
  });
});
