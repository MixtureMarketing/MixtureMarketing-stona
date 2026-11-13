import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CaseStudyNavigation from '../../components/templates/case-study/CaseStudyNavigation';
import type { SanityCaseStudy } from '../../types';

// MIX-1378: link „Następny projekt” z prawdziwym kształtem danych (slug = tekst z GROQ).
vi.mock('../../services/cmsService', () => ({
  urlFor: () => ({ width: () => ({ url: () => 'img' }) }),
}));

const cs = (slug: unknown, title = 'Projekt B') =>
  ({ _id: 'b', title, slug, category: 'web' }) as unknown as SanityCaseStudy;

const renderNav = (next: SanityCaseStudy | null) =>
  render(
    <MemoryRouter initialEntries={['/portfolio/alfa/']}>
      <Routes>
        <Route path="/portfolio/:slug/" element={<CaseStudyNavigation nextProject={next} />} />
      </Routes>
    </MemoryRouter>,
  );

describe('CaseStudyNavigation — link do następnego projektu', () => {
  afterEach(cleanup);

  it('slug-tekst → <a href="/portfolio/beta/">', () => {
    renderNav(cs('beta'));
    const link = screen.getByRole('link', { name: /Następny Projekt/i });
    expect(link.getAttribute('href')).toBe('/portfolio/beta/');
    expect(link.textContent).toContain('Projekt B');
  });

  it('nigdy nie renderuje /portfolio/undefined/', () => {
    const { container } = renderNav(cs('beta'));
    expect(container.innerHTML).not.toContain('undefined');
  });

  it.each([[undefined], [null], [''], ['  '], [{ current: 'beta' }]])(
    'slug %p → brak sekcji i linku',
    (bad) => {
      const { container } = renderNav(cs(bad));
      expect(screen.queryByRole('link')).toBeNull();
      expect(container.innerHTML).toBe('');
    },
  );

  it('brak następnego projektu → nic', () => {
    const { container } = renderNav(null);
    expect(container.innerHTML).toBe('');
  });
});
