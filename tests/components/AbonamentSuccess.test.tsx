import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AbonamentSuccess from '../../components/pages/abonament/AbonamentSuccess';
import { trackEvent } from '../../utils/analytics';

vi.mock('../../utils/analytics', () => ({
  trackEvent: vi.fn(),
}));

const renderAt = (url: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[url]}>
        <AbonamentSuccess />
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('AbonamentSuccess', () => {
  beforeEach(() => {
    vi.mocked(trackEvent).mockClear();
    window.isPrerendering = undefined;
  });

  afterEach(() => {
    window.isPrerendering = undefined;
  });

  it('wysyła purchase raz, gdy jest sid (powrót ze Stripe)', () => {
    renderAt('/abonament/dziekujemy/?sid=cs_test_123&utm_source=google');
    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith(
      'purchase',
      expect.objectContaining({ transaction_id: 'cs_test_123', utm_source: 'google' }),
    );
  });

  it('podczas prerenderu NIE wysyła purchase', () => {
    window.isPrerendering = true;
    renderAt('/abonament/dziekujemy/?sid=cs_test_123');
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it('bez sid (prerender / wejście bezpośrednie) NIE wysyła purchase', () => {
    renderAt('/abonament/dziekujemy/');
    expect(trackEvent).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Płatność');
  });

  it('z sid (płatność potwierdzona) czyści draft formularza abonamentu', () => {
    sessionStorage.setItem('mm_preonboard_draft', JSON.stringify({ businessName: 'Firma' }));
    renderAt('/abonament/dziekujemy/?sid=cs_test_123');
    expect(sessionStorage.getItem('mm_preonboard_draft')).toBeNull();
  });

  it('bez sid / podczas prerenderu draft zostaje', () => {
    sessionStorage.setItem('mm_preonboard_draft', JSON.stringify({ businessName: 'Firma' }));
    renderAt('/abonament/dziekujemy/');
    window.isPrerendering = true;
    renderAt('/abonament/dziekujemy/?sid=cs_test_123');
    expect(sessionStorage.getItem('mm_preonboard_draft')).not.toBeNull();
    sessionStorage.clear();
  });

  it('jest noindex', async () => {
    renderAt('/abonament/dziekujemy/');
    await waitFor(() => {
      const robots = document.head.querySelector('meta[name="robots"]');
      expect(robots?.getAttribute('content')).toContain('noindex');
    });
  });

  // --- Testy charakteryzacyjne (raport 9 §5.2) ---

  it('kształt eventu purchase: transaction_id = sid, PLN, UTM z URL (success_path)', () => {
    renderAt(
      '/abonament/dziekujemy/?sid=cs_test_9&utm_source=google&utm_medium=cpc&utm_campaign=wiosna%202026',
    );
    // BUG? purchase bez `value` (ani `items`) — GA4 nie policzy przychodu z subskrypcji.
    expect(vi.mocked(trackEvent).mock.calls).toEqual([
      [
        'purchase',
        {
          transaction_id: 'cs_test_9',
          currency: 'PLN',
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'wiosna 2026',
        },
      ],
    ]);
  });

  it('bez UTM w URL pola utm_* są undefined', () => {
    renderAt('/abonament/dziekujemy/?sid=cs_test_1');
    expect(trackEvent).toHaveBeenCalledWith('purchase', {
      transaction_id: 'cs_test_1',
      currency: 'PLN',
      utm_source: undefined,
      utm_medium: undefined,
      utm_campaign: undefined,
    });
  });

  it('pusty ?sid= traktowany jak brak sid: bez purchase, draft zostaje, bez linii „Stripe session"', () => {
    sessionStorage.setItem('mm_preonboard_draft', JSON.stringify({ businessName: 'Firma' }));
    renderAt('/abonament/dziekujemy/?sid=');
    expect(trackEvent).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('mm_preonboard_draft')).not.toBeNull();
    expect(screen.queryByText(/Stripe session:/)).not.toBeInTheDocument();
    sessionStorage.clear();
  });

  it('sid jest pokazany użytkownikowi (do zgłoszeń supportu)', () => {
    renderAt('/abonament/dziekujemy/?sid=cs_test_123');
    expect(screen.getByText('Stripe session: cs_test_123')).toBeInTheDocument();
  });

  it('re-render tej samej strony nie wysyła drugiego purchase; ponowne wejście (reload) — tak', () => {
    const url = '/abonament/dziekujemy/?sid=cs_test_123';
    const { rerender, unmount } = renderAt(url);
    rerender(
      <HelmetProvider>
        <MemoryRouter initialEntries={[url]}>
          <AbonamentSuccess />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(trackEvent).toHaveBeenCalledTimes(1);
    unmount();
    // Dedupe tylko w useRef — odświeżenie strony wysyła purchase ponownie
    // (GA4 deduplikuje purchase po transaction_id, więc to raczej szum niż błąd).
    renderAt(url);
    expect(trackEvent).toHaveBeenCalledTimes(2);
  });

  it('bez sid strona i tak mówi „Płatność zaakceptowana" (treść statyczna pod prerender)', () => {
    // BUG? (niski) wejście bezpośrednie bez `sid` widzi komunikat o zaakceptowanej płatności;
    // strona jest noindex i musi się prerenderować, więc to świadomy kompromis lub do decyzji.
    renderAt('/abonament/dziekujemy/');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Płatność zaakceptowana');
    expect(screen.getByRole('link', { name: /Otwórz panel klienta/ })).toHaveAttribute(
      'href',
      'https://panel.mixturemarketing.pl/login',
    );
    expect(screen.getByRole('link', { name: 'Wróć do oferty' })).toHaveAttribute(
      'href',
      '/abonament/',
    );
  });

  it('canonical /abonament/dziekujemy/ (ze slashem), noindex', async () => {
    renderAt('/abonament/dziekujemy?sid=cs_test_123');
    await waitFor(() => {
      expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
        'href',
        'https://mixturemarketing.pl/abonament/dziekujemy/',
      );
      expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
        'content',
        'noindex, follow',
      );
    });
  });
});
