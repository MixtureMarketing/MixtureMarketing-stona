import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CookieBanner from '../../components/features/CookieBanner';
import { ZARAZ_CONSENT_API_READY_EVENT, resetConsentDeliveryForTests } from '../../utils/analytics';

/**
 * MIX-1389 K1: powracający gość z zapisaną zgodą. Baner (bez mocka analytics) ma przekazać
 * cele do Zaraz dokładnie raz, po gotowości Consent API; przy wpisie spoza allowlisty nic.
 */

const KEY = 'cookie-consent-v2';
const BANNER = { name: 'Baner plików cookies' };

const renderBanner = (strict = false) => {
  const tree = (
    <MemoryRouter>
      <CookieBanner />
    </MemoryRouter>
  );
  return render(strict ? <React.StrictMode>{tree}</React.StrictMode> : tree);
};

const flush = () => act(() => new Promise((r) => setTimeout(r, 0)));
const fireApiReady = () => document.dispatchEvent(new Event(ZARAZ_CONSENT_API_READY_EVENT));

const installZaraz = (apiReady: boolean) => {
  const consentSet = vi.fn();
  window.zaraz = { track: vi.fn(), consent: { APIReady: apiReady, set: consentSet } };
  return consentSet;
};

describe('CookieBanner + Zaraz Consent API (powracający gość)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.isPrerendering = undefined;
    resetConsentDeliveryForTests();
  });
  afterEach(() => {
    resetConsentDeliveryForTests();
    window.localStorage.clear();
    delete window.zaraz;
  });

  it('API późne: nic przed gotowością, cele dokładnie raz po zdarzeniu (StrictMode)', async () => {
    window.localStorage.setItem(KEY, JSON.stringify({ analytics: true, marketing: false }));
    const consentSet = installZaraz(false);
    renderBanner(true);
    await flush();
    expect(consentSet).not.toHaveBeenCalled();
    expect(screen.queryByRole('region', BANNER)).toBeNull();

    window.zaraz!.consent.APIReady = true;
    fireApiReady();
    fireApiReady();
    expect(consentSet).toHaveBeenCalledTimes(1);
    expect(consentSet).toHaveBeenCalledWith({ kese: true, Pzjv: false });
  });

  it('API wczesne: cele dokładnie raz po montażu (StrictMode montuje efekt dwa razy)', async () => {
    window.localStorage.setItem(KEY, JSON.stringify({ analytics: false, marketing: true }));
    const consentSet = installZaraz(true);
    renderBanner(true);
    await flush();
    expect(consentSet).toHaveBeenCalledTimes(1);
    expect(consentSet).toHaveBeenCalledWith({ kese: false, Pzjv: true });
  });

  it('API nigdy: zapisana zgoda, ale bez gotowości → nic nie wysłane', async () => {
    window.localStorage.setItem(KEY, JSON.stringify({ analytics: true, marketing: true }));
    const consentSet = installZaraz(false);
    renderBanner();
    await flush();
    await act(() => new Promise((r) => setTimeout(r, 20)));
    expect(consentSet).not.toHaveBeenCalled();
  });

  it.each([
    ['F1 podmieniona wartość', '{"analytics":"yes","marketing":true}'],
    ['F2 śmieci JSON', '{zepsute'],
    ['F3 obiekt niepełny', '{"analytics":true}'],
    ['F4 stara wersja z polem version', '{"analytics":true,"marketing":true,"version":1}'],
  ])('%s: baner pyta ponownie, do Zaraz nic (nawet po gotowości)', async (_n, raw) => {
    window.localStorage.setItem(KEY, raw);
    const consentSet = installZaraz(true);
    renderBanner();
    await flush();
    fireApiReady();
    expect(screen.getByRole('region', BANNER)).toBeInTheDocument();
    expect(consentSet).not.toHaveBeenCalled();
  });

  it('F4 zgoda pod starym kluczem (cookie-consent) → baner, nic do Zaraz; bliźniak pod v2 → wysłane', async () => {
    window.localStorage.setItem(
      'cookie-consent',
      JSON.stringify({ analytics: true, marketing: true }),
    );
    const consentSet = installZaraz(true);
    const first = renderBanner();
    await flush();
    expect(screen.getByRole('region', BANNER)).toBeInTheDocument();
    expect(consentSet).not.toHaveBeenCalled();
    first.unmount();

    window.localStorage.setItem(KEY, JSON.stringify({ analytics: true, marketing: true }));
    renderBanner();
    await flush();
    expect(consentSet).toHaveBeenCalledTimes(1);
    expect(consentSet).toHaveBeenCalledWith({ kese: true, Pzjv: true });
  });

  it('F5 cofnięta zgoda: wpis usunięty → baner, nic; kliknięcie „Odrzuć” wysyła false/false', async () => {
    const consentSet = installZaraz(false);
    renderBanner();
    await flush();
    expect(screen.getByRole('region', BANNER)).toBeInTheDocument();
    window.zaraz!.consent.APIReady = true;
    fireApiReady();
    expect(consentSet).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Odrzuć opcjonalne'));
    expect(consentSet).toHaveBeenCalledTimes(1);
    expect(consentSet).toHaveBeenCalledWith({ kese: false, Pzjv: false });
  });

  it('nowy gość: kliknięcie zgody przed gotowością API → cele raz, po zdarzeniu', async () => {
    const consentSet = installZaraz(false);
    renderBanner();
    await flush();
    fireEvent.click(screen.getByText('Akceptuję wszystkie'));
    expect(consentSet).not.toHaveBeenCalled();
    fireApiReady();
    expect(consentSet).toHaveBeenCalledTimes(1);
    expect(consentSet).toHaveBeenCalledWith({ kese: true, Pzjv: true });
    expect(window.localStorage.getItem(KEY)).toBe('{"analytics":true,"marketing":true}');
  });
});
