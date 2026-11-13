import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { ModalProvider, useModal } from '@/context/ModalContext';
import { REFUSED, sanitizeGa4Event } from '@/utils/ga4Events';
import { KNOWN_PACKAGE_SLUGS, packageSlug } from '@/utils/ga4Package';

/**
 * MIX-1514: `package` w consultation_click to staly slug z listy tytulow pakietow z CMS. Slug przed
 * straznikiem; straznik (allowlista ASCII + detektor) sprawdza go dalej bez zmian.
 */
let track: Mock<(event: string, data?: Record<string, unknown>) => void>;
beforeEach(() => {
  track = vi.fn<(event: string, data?: Record<string, unknown>) => void>();
  window.zaraz = { track, consent: { set: vi.fn() } };
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});
afterEach(() => {
  delete window.zaraz;
  vi.restoreAllMocks();
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ModalProvider>{children}</ModalProvider>
);

/** Wartosc `package` wyslana po otwarciu modala z tytulem pakietu. */
const sentPackage = (title: unknown): unknown => {
  track.mockClear();
  const { result } = renderHook(() => useModal(), { wrapper });
  act(() => result.current.openModal('web', { specificType: 'landing', package: title }));
  expect(track).toHaveBeenCalledTimes(1);
  expect(track.mock.calls[0][0]).toBe('consultation_click');
  return (track.mock.calls[0][1] as Record<string, unknown>).package;
};

// Tytuly pakietow z publicznego CMS (8 sekcji cennika, 24 miejsca), stan 12.11.2026.
const CMS_TITLES: [string, string][] = [
  ['Campaign Ready', 'campaign-ready'],
  ['High Performance', 'high-performance'],
  ['Multi-Landing System', 'multi-landing-system'],
  ['Fixed Price', 'fixed-price'],
  ['Time & Material', 'time-material'],
  ['Team Extension', 'team-extension'],
  ['Business Card', 'business-card'],
  ['Corporate Pro', 'corporate-pro'],
  ['Enterprise Portal', 'enterprise-portal'],
  ['Start', 'start'],
  ['Scale', 'scale'],
  ['Enterprise', 'enterprise'],
  ['Start', 'start'],
  ['Growth', 'growth'],
  ['Enterprise', 'enterprise'],
  ['WooCommerce Start', 'woocommerce-start'],
  ['E-commerce Pro', 'e-commerce-pro'],
  ['B2B / Headless', 'b2b-headless'],
  ['Lokalne SEO', 'lokalne-seo'],
  ['National SEO', 'national-seo'],
  ['Authority', 'authority'],
  ['Business Card', 'business-card'],
  ['Corporate Pro', 'corporate-pro'],
  ['Enterprise Portal', 'enterprise-portal'],
];

describe('tytuly pakietow z CMS -> slug, wymiar pakietu zostaje', () => {
  it('24 z 24 miejsc idzie jako slug, 0 jako "(odrzucone)"', () => {
    expect(CMS_TITLES).toHaveLength(24);
    const got = CMS_TITLES.map(([title]) => sentPackage(title));
    expect(got.filter((v) => v === REFUSED)).toEqual([]);
    expect(got).toEqual(CMS_TITLES.map(([, slug]) => slug));
  });

  it('straznik bez zmian: surowy tytul ze spacja nadal "(odrzucone)", slug przechodzi', () => {
    const raw = sanitizeGa4Event('consultation_click', { package: 'Lokalne SEO' });
    const slug = sanitizeGa4Event('consultation_click', { package: 'lokalne-seo' });
    expect(raw).toEqual({
      ok: true,
      params: { package: REFUSED },
      refused: [{ param: 'package', why: 'format' }],
    });
    expect(slug).toEqual({ ok: true, params: { package: 'lokalne-seo' }, refused: [] });
  });

  it('brak pakietu (undefined, null) = parametru brak', () => {
    expect(sentPackage(undefined)).toBeUndefined();
    expect(sentPackage(null)).toBeUndefined();
  });
});

describe('kazdy slug z listy przechodzi straznika bez zmian', () => {
  it.each(KNOWN_PACKAGE_SLUGS)('%s', (slug) => {
    expect(sanitizeGa4Event('consultation_click', { package: slug })).toEqual({
      ok: true,
      params: { package: slug },
      refused: [],
    });
  });
});

// Formy ataku: wartosc spoza listy -> packageSlug daje "(odrzucone)" przed straznikiem.
// Kazda forma ma dozwolonego blizniaka (tytul z listy -> jego slug).
const FORMS: [string, unknown, string, string][] = [
  ['L1 imie i nazwisko', 'Jan Kowalski', 'Start', 'start'],
  ['L2 e-mail slowem "at" bez kropki', 'jan at firma pl', 'Scale', 'scale'],
  ['L3 nowy tytul spoza listy', 'Nowy Pakiet 2027', 'Growth', 'growth'],
  ['L4 inna wielkosc liter znanego tytulu', 'lokalne seo', 'Lokalne SEO', 'lokalne-seo'],
  ['L5 spacja przed znanym tytulem', ' Start', 'Start', 'start'],
  ['L6 tytul spoza listy z dwoch znanych slow', 'Start Pro', 'Corporate Pro', 'corporate-pro'],
  ['L7 e-mail w tytule', 'Pakiet jan@firma.pl', 'Business Card', 'business-card'],
  ['L8 telefon w tytule', 'Start 600 100 200', 'Start', 'start'],
  ['L9 zakodowane @ pelnej szerokosci', 'jan%EF%BC%A0firma.pl', 'Authority', 'authority'],
  ['L10 cyfry innego pisma', 'Pakiet ٦', 'Enterprise', 'enterprise'],
  ['L11 goly "%"', 'Rabat 20%', 'Fixed Price', 'fixed-price'],
  ['L12 HTML', '<b>Start</b>', 'Start', 'start'],
  ['L13 emoji', 'Start 🚀', 'Start', 'start'],
  ['L14 znak RTL', 'Start\u200F', 'Start', 'start'],
  ['L15 pusty', '', 'Team Extension', 'team-extension'],
  ['L16 klucz prototypu', 'constructor', 'Time & Material', 'time-material'],
  ['L17 __proto__', '__proto__', 'B2B / Headless', 'b2b-headless'],
  ['L18 tytul > 100 znakow', `Start${' '.repeat(100)}Pro`, 'E-commerce Pro', 'e-commerce-pro'],
  ['L19 nie-tekst (liczba)', 12345678901, 'National SEO', 'national-seo'],
  ['L20 jedno slowo ASCII (nazwisko)', 'Kowalski', 'High Performance', 'high-performance'],
  ['L21 token ASCII spoza listy', 'Start-Pro', 'Campaign Ready', 'campaign-ready'],
  ['L22 slug zamiast tytulu', 'lokalne-seo', 'Multi-Landing System', 'multi-landing-system'],
  ['L23 obiekt', { title: 'Start' }, 'WooCommerce Start', 'woocommerce-start'],
];

describe('formy ataku: tytul spoza listy -> "(odrzucone)", blizniak z listy -> slug', () => {
  it.each(FORMS)('%s', (_label, attack, twin, twinSlug) => {
    expect(packageSlug(attack)).toBe(REFUSED);
    expect(sentPackage(attack)).toBe(REFUSED);
    expect(sentPackage(twin)).toBe(twinSlug);
  });
});
