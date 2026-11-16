import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ModalProvider } from '../../context/ModalContext';
import PortfolioPage from '../../components/pages/PortfolioPage';
import { CMS_SNAPSHOT_ID, serializeCmsSnapshot } from '../../hooks/useCmsDocument';

// MIX-1467: /portfolio/ — przy błędzie CMS zostaje lista z prerenderu (zrzut w HTML);
// „Brak projektów” tylko po UDANEJ odpowiedzi bez pozycji.

const h = vi.hoisted(() => ({ getCaseStudyList: vi.fn() }));

vi.mock('../../services/cmsService', () => ({
  cmsService: {
    getCaseStudyList: (...a: unknown[]) => h.getCaseStudyList(...a),
    getTestimonials: () => Promise.resolve([]),
  },
  urlFor: () => ({ width: () => ({ height: () => ({ url: () => 'https://example.com/i.jpg' }) }) }),
}));

const projects = [
  { _id: 'a', title: 'Projekt Alfa', slug: 'alfa', category: 'web', client: 'K1', excerpt: 'x' },
  {
    _id: 'b',
    title: 'Projekt Beta',
    slug: 'beta',
    category: 'marketing',
    client: 'K2',
    excerpt: 'y',
  },
];

const putSnapshot = (list: unknown) => {
  const el = document.createElement('script');
  el.setAttribute('type', 'application/json');
  el.id = CMS_SNAPSHOT_ID;
  el.textContent = serializeCmsSnapshot({ 'caseStudyList|list': list });
  document.body.appendChild(el);
};

const renderPage = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/portfolio/']}>
        <ModalProvider>
          <PortfolioPage />
        </ModalProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

afterEach(() => {
  document.getElementById(CMS_SNAPSHOT_ID)?.remove();
  h.getCaseStudyList.mockReset();
  vi.restoreAllMocks();
  cleanup();
});

const failures: Array<[string, () => Promise<never>]> = [
  ['błąd sieci', () => Promise.reject(new TypeError('Failed to fetch'))],
  ['HTTP 403', () => Promise.reject(new Error('Request error: 403'))],
  ['timeout', () => Promise.reject(new Error('timeout 10000 ms'))],
  ['niepoprawny JSON', () => Promise.reject(new SyntaxError('Unexpected token <'))],
];

describe('PortfolioPage — błąd CMS', () => {
  it.each(failures)(
    '%s, zrzut z prerenderu: lista zostaje, brak „Brak projektów”',
    async (_n, f) => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      putSnapshot(projects);
      h.getCaseStudyList.mockImplementation(f);
      renderPage();
      expect(await screen.findByText('Projekt Alfa')).toBeInTheDocument();
      expect(screen.getByText('Projekt Beta')).toBeInTheDocument();
      expect(screen.queryByText('Brak projektów')).toBeNull();
      expect(document.querySelector('[data-cms-error]')).toBeNull();
    },
  );

  it.each(failures)(
    '%s, bez zrzutu: stan błędu z ponowieniem, NIE „Brak projektów”',
    async (_n, f) => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      h.getCaseStudyList.mockImplementation(f);
      renderPage();
      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Nie udało się wczytać realizacji',
      );
      expect(screen.queryByText('Brak projektów')).toBeNull();
      expect(document.querySelector('[data-cms-error]')).not.toBeNull();
    },
  );

  it('ponowienie po błędzie pobiera listę i ją pokazuje', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    h.getCaseStudyList
      .mockRejectedValueOnce(new Error('Request error: 403'))
      .mockResolvedValueOnce(projects);
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Spróbuj ponownie' }));
    expect(await screen.findByText('Projekt Alfa')).toBeInTheDocument();
    expect(screen.queryByText('Brak projektów')).toBeNull();
  });
});

describe('PortfolioPage — udana odpowiedź (bliźniaki)', () => {
  it('udana odpowiedź z pozycjami: lista, bez „Brak projektów”', async () => {
    h.getCaseStudyList.mockResolvedValue(projects);
    renderPage();
    expect(await screen.findByText('Projekt Alfa')).toBeInTheDocument();
    expect(screen.queryByText('Brak projektów')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('udana odpowiedź BEZ pozycji: „Brak projektów” (to jedyny taki przypadek)', async () => {
    h.getCaseStudyList.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('Brak projektów')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('zrzut z prerenderu: lista bez żądania do CMS', async () => {
    putSnapshot(projects);
    renderPage();
    expect(await screen.findByText('Projekt Beta')).toBeInTheDocument();
    await waitFor(() => expect(h.getCaseStudyList).not.toHaveBeenCalled());
  });

  it('filtr kategorii bez pozycji: „Brak projektów” (udana odpowiedź, pusta kategoria)', async () => {
    h.getCaseStudyList.mockResolvedValue(projects);
    renderPage();
    await screen.findByText('Projekt Alfa');
    fireEvent.click(screen.getByRole('button', { name: /Design/ }));
    expect(await screen.findByText('Brak projektów')).toBeInTheDocument();
  });
});

describe('PortfolioPage — odstęp hero → lista', () => {
  it('sekcja listy ma górny odstęp pt-12 (jak /baza-wiedzy/), a nie przylega do hero', async () => {
    h.getCaseStudyList.mockResolvedValue(projects);
    renderPage();
    await screen.findByText('Projekt Alfa');
    const section = screen.getByRole('heading', {
      level: 2,
      name: 'Lista realizacji',
    }).parentElement;
    expect(section?.className).toMatch(/\bpt-12\b/);
  });
});

describe('PortfolioPage — kolejność realizacji (MIX-1829)', () => {
  const cs = (slug: string, title: string, category = 'web') => ({
    _id: slug,
    title,
    slug,
    category,
    excerpt: 'x',
  });
  // Kolejność jak z CMS: po dacie, najnowsze pierwsze.
  const fromCms = [
    cs('nowy-sklep', 'Nowy Sklep'),
    cs('try-dive-szkola-nurkowania', 'Try Dive', 'marketing'),
    cs('impackt-edu', 'Impackt Edu'),
    cs('stara-strona', 'Stara Strona'),
    cs('fundacja-niepodzielni', 'Fundacja Niepodzielni'),
  ];
  const titles = () => screen.getAllByRole('heading', { level: 3 }).map((e) => e.textContent);

  it('wyróżnione na początku (bez PsychON w CMS), reszta po dacie', async () => {
    h.getCaseStudyList.mockResolvedValue(fromCms);
    renderPage();
    await screen.findByText('Nowy Sklep');
    expect(titles()).toEqual([
      'Fundacja Niepodzielni',
      'Impackt Edu',
      'Try Dive',
      'Nowy Sklep',
      'Stara Strona',
    ]);
  });

  it('ta sama kolejność z zrzutu prerenderu', async () => {
    putSnapshot(fromCms);
    renderPage();
    await screen.findByText('Nowy Sklep');
    expect(titles().slice(0, 3)).toEqual(['Fundacja Niepodzielni', 'Impackt Edu', 'Try Dive']);
  });

  it('filtr kategorii zachowuje kolejność wyróżnionych', async () => {
    h.getCaseStudyList.mockResolvedValue(fromCms);
    renderPage();
    await screen.findByText('Nowy Sklep');
    fireEvent.click(screen.getByRole('button', { name: /Web Development/ }));
    await waitFor(() => expect(screen.queryByText('Try Dive')).toBeNull());
    expect(titles()).toEqual(['Fundacja Niepodzielni', 'Impackt Edu', 'Nowy Sklep', 'Stara Strona']);
  });
});

describe('PortfolioPage — ładowanie', () => {
  it('w trakcie pobierania nie ma „Brak projektów” ani stanu błędu (szkielet)', async () => {
    h.getCaseStudyList.mockReturnValue(new Promise(() => {}));
    renderPage();
    await new Promise((r) => setTimeout(r, 30));
    expect(screen.queryByText('Brak projektów')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
