// MIX-1855: przycisk „Chcesz podobny projekt?” w realizacji (CaseStudyTemplate), za VITE_MM_CENNIK.
// Otwiera istniejący formularz kontaktu (useModal().openModal) z nazwą realizacji w danych modala.
// Wyłączony = HTML realizacji bez przycisku i bez wymagania ModalProvidera.
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import CaseStudyTemplate from '../../components/templates/CaseStudyTemplate';
import CaseStudySimilarCta from '../../components/templates/case-study/CaseStudySimilarCta';
import { ModalProvider, useModal } from '../../context/ModalContext';
import { cmsService } from '../../services/cmsService';
import {
  CASE_STUDY_SIMILAR,
  caseStudyModalData,
  isCaseStudyLead,
  similarProjectOf,
} from '../../utils/caseStudyLead';

vi.mock('../../services/cmsService', () => ({
  cmsService: { getCaseStudyPage: vi.fn() },
  client: { fetch: vi.fn() },
  urlFor: () => ({ width: () => ({ url: () => 'img' }) }),
  CmsUnavailableError: class CmsUnavailableError extends Error {},
}));
vi.mock('../../components/articles/RelatedArticles', () => ({ default: () => null }));
vi.mock('../../components/common/Powiazane', () => ({ default: () => null }));
vi.mock('../../components/templates/case-study/CaseStudyHero', () => ({ default: () => null }));
vi.mock('../../components/templates/case-study/CaseStudyContent', () => ({ default: () => null }));
vi.mock('../../components/templates/case-study/CaseStudySidebar', () => ({ default: () => null }));
vi.mock('../../components/templates/case-study/CaseStudyNavigation', () => ({
  default: () => null,
}));
const trackEvent = vi.hoisted(() => vi.fn());
vi.mock('../../utils/analytics', () => ({ trackEvent }));

const TITLE = 'GlamSpace: rezerwacje salonów';

/** Odczyt stanu modala z prawdziwego ModalProvidera (tekst, nie atrapa). */
const Probe: React.FC = () => {
  const { isModalOpen, modalType, additionalData } = useModal();
  return (
    <output data-testid="modal">
      {JSON.stringify({ isModalOpen, modalType, additionalData: additionalData ?? null })}
    </output>
  );
};
const modalState = () =>
  JSON.parse(screen.getByTestId('modal').textContent || '{}') as {
    isModalOpen: boolean;
    modalType: string;
    additionalData: Record<string, unknown> | null;
  };

const renderTemplate = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/portfolio/real-1']}>
        <ModalProvider>
          <Probe />
          <Routes>
            <Route path="/portfolio/:slug" element={<CaseStudyTemplate />} />
          </Routes>
        </ModalProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

beforeEach(() => {
  document.head.innerHTML = '';
  document.title = '';
  trackEvent.mockClear();
  vi.mocked(cmsService.getCaseStudyPage).mockResolvedValue({
    project: { _id: 'c1', title: TITLE, slug: 'real-1', category: 'web' },
    nextProject: null,
  } as never);
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('VITE_MM_CENNIK=1: przycisk w realizacji', () => {
  beforeEach(() => vi.stubEnv('VITE_MM_CENNIK', '1'));

  it('jest jeden przycisk „Chcesz podobny projekt?”', async () => {
    renderTemplate();
    const btn = await screen.findByRole('button', { name: 'Chcesz podobny projekt?' });
    expect(btn).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Chcesz podobny projekt?' })).toHaveLength(1);
  });

  it('klik otwiera formularz kontaktu z nazwą realizacji, źródłem i typem „general”', async () => {
    renderTemplate();
    expect(modalState().isModalOpen).toBe(false);
    fireEvent.click(await screen.findByRole('button', { name: 'Chcesz podobny projekt?' }));
    await waitFor(() => expect(modalState().isModalOpen).toBe(true));
    const s = modalState();
    expect(s.modalType).toBe('general');
    expect(s.additionalData).toEqual({
      specificType: CASE_STUDY_SIMILAR,
      leadSource: CASE_STUDY_SIMILAR,
      similarProject: TITLE,
    });
  });

  it('klik wysyła tylko consultation_click (bez nazwy realizacji w GA4); generate_lead dopiero po sukcesie', async () => {
    renderTemplate();
    fireEvent.click(await screen.findByRole('button', { name: 'Chcesz podobny projekt?' }));
    await waitFor(() => expect(trackEvent).toHaveBeenCalled());
    expect(trackEvent.mock.calls.map((c) => c[0])).toEqual(['consultation_click']);
    expect(JSON.stringify(trackEvent.mock.calls)).not.toContain('GlamSpace');
  });
});

describe('przełącznik wyłączony: realizacja bez zmian', () => {
  it.each([[''], ['0'], ['true'], [' 1']])('VITE_MM_CENNIK=%p: brak przycisku', async (v) => {
    vi.stubEnv('VITE_MM_CENNIK', v);
    const { container } = renderTemplate();
    await waitFor(() => expect(cmsService.getCaseStudyPage).toHaveBeenCalled());
    // szablon załadował realizację (tytuł strony z danych CMS), więc brak przycisku to nie „jeszcze ładuje”
    await waitFor(() => expect(document.title).toContain('GlamSpace'));
    expect(screen.queryByRole('button', { name: /podobny projekt/i })).toBeNull();
    expect(container.innerHTML).not.toContain('podobny projekt');
  });

  it('szablon bez przełącznika nie wymaga ModalProvidera (useModal rzuca bez niego)', async () => {
    vi.stubEnv('VITE_MM_CENNIK', '');
    const { container } = render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/portfolio/real-1']}>
          <Routes>
            <Route path="/portfolio/:slug" element={<CaseStudyTemplate />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );
    await waitFor(() => expect(document.title).toContain('GlamSpace'));
    expect(container.innerHTML).not.toContain('podobny projekt');
  });
});

describe('CaseStudySimilarCta (komponent)', () => {
  it('przekazuje dokładnie dane z caseStudyModalData', async () => {
    render(
      <ModalProvider>
        <Probe />
        <CaseStudySimilarCta title="Projekt X" />
      </ModalProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Chcesz podobny projekt?' }));
    await waitFor(() => expect(modalState().isModalOpen).toBe(true));
    expect(modalState().additionalData).toEqual(caseStudyModalData('Projekt X'));
    expect(modalState().additionalData).not.toHaveProperty('package');
  });
});

describe('utils/caseStudyLead', () => {
  it('similarProjectOf: tekst ze ściśniętymi spacjami, ≤ 100 znaków; reszta = undefined', () => {
    expect(similarProjectOf({ similarProject: '  Glam   Space \n ' })).toBe('Glam Space');
    expect(similarProjectOf({ similarProject: 'a'.repeat(300) })).toBe('a'.repeat(100));
    for (const v of [undefined, null, '', '   ', 5, {}, ['x'], true])
      expect(similarProjectOf({ similarProject: v })).toBeUndefined();
    expect(similarProjectOf(undefined)).toBeUndefined();
    expect(similarProjectOf(null)).toBeUndefined();
  });
  it('isCaseStudyLead: tylko dokładne źródło case_study_similar', () => {
    expect(isCaseStudyLead({ leadSource: CASE_STUDY_SIMILAR })).toBe(true);
    for (const v of [undefined, '', 'case_study', 'CASE_STUDY_SIMILAR', 'case_study_similar ', 1])
      expect(isCaseStudyLead({ leadSource: v })).toBe(false);
    expect(isCaseStudyLead(null)).toBe(false);
    expect(isCaseStudyLead(undefined)).toBe(false);
  });
});
