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

  it('jest noindex', async () => {
    renderAt('/abonament/dziekujemy/');
    await waitFor(() => {
      const robots = document.head.querySelector('meta[name="robots"]');
      expect(robots?.getAttribute('content')).toContain('noindex');
    });
  });
});
