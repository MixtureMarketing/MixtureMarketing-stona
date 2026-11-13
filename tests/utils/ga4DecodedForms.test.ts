import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { trackEvent } from '@/utils/analytics';
import { REFUSED, scanText } from '@/utils/ga4Events';
import { cleanPageContext } from '@/utils/ga4Page';

/**
 * MIX-1514: (1) po dekodowaniu %XX tekst jest znowu normalizowany (NFKC, bez \p{Cf}), wiec zakodowany
 * znak pelnej szerokosci albo niewidoczny nie omija detektora; (2) page_* nie do odczytania
 * (np. tytul z gołym "%") jest nadpisywany "(odrzucone)", a nie wysylany bez zmian.
 */
let track: Mock<(event: string, data?: Record<string, unknown>) => void>;
beforeEach(() => {
  track = vi.fn<(event: string, data?: Record<string, unknown>) => void>();
  window.zaraz = { track, consent: { set: vi.fn() } };
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});
afterEach(() => {
  delete window.zaraz;
  window.history.replaceState({}, '', '/');
  document.title = '';
  vi.restoreAllMocks();
});

const sent = (): Record<string, unknown> => {
  expect(track).toHaveBeenCalledTimes(1);
  return track.mock.calls[0][1] as Record<string, unknown>;
};

describe('normalizacja po dekodowaniu %XX', () => {
  it.each([
    ['pelnej szerokosci @ zakodowane %', 'jan%EF%BC%A0firma.pl'],
    ['male @ zakodowane %', 'jan%EF%B9%ABfirma.pl'],
    ['(at) z zakodowana zerowa spacja', 'jan(%E2%80%8Bat%E2%80%8B)firma.pl'],
    ['pelnej szerokosci @ zakodowane podwojnie', 'jan%25EF%25BC%25A0firma.pl'],
  ])('odmowa: %s', (_label, raw) => {
    expect(scanText(raw)).toBe('personal');
  });
  it.each([
    ['zakodowany myslnik', 'oferta%E2%80%93seo'],
    ['zakodowana spacja', 'strona%20www'],
  ])('blizniak: %s przechodzi', (_label, raw) => {
    expect(scanText(raw)).toBeNull();
  });

  it('source z zakodowanym @ pelnej szerokosci -> "(odrzucone)", zdarzenie idzie', () => {
    trackEvent('view_pricing', { source: '/kontakt/jan%EF%BC%A0firma.pl' });
    expect(sent()).toEqual({ source: REFUSED });
  });
  it('blizniak: source z zakodowana spacja idzie bez zmian', () => {
    trackEvent('view_pricing', { source: '/strona%20www/' });
    expect(sent()).toEqual({ source: '/strona%20www/' });
  });
  it('page_location z zakodowanym @ pelnej szerokosci w zapytaniu -> wartosc "(odrzucone)"', () => {
    window.history.replaceState({}, '', '/?ref=jan%EF%BC%A0firma.pl');
    trackEvent('click_phone', { link_location: 'header' });
    expect(sent().page_location).toBe(`http://localhost:3000/?ref=${REFUSED}`);
  });
});

describe('page_* nie do odczytania -> "(odrzucone)"', () => {
  it('tytul z golym "%" -> page_title "(odrzucone)", powod nieczytelny', () => {
    const r = cleanPageContext({ location: '', referrer: '', title: 'Rabat 100% 600 100 200' });
    expect(r.params).toEqual({ page_title: REFUSED });
    expect(r.refused).toEqual([{ param: 'page_title', why: 'unreadable' }]);
  });
  it('blizniak: tytul bez "%" i bez danych zostaje (bez nadpisania)', () => {
    const r = cleanPageContext({ location: '', referrer: '', title: 'Rabat 100 procent' });
    expect(r.params).toEqual({});
    expect(r.refused).toEqual([]);
  });
  it('page_referrer, ktorego nie da sie odczytac jako adres -> "(odrzucone)"', () => {
    const r = cleanPageContext({ location: '', referrer: 'nie adres 600 100 200', title: '' });
    expect(r.params).toEqual({ page_referrer: REFUSED });
  });
  it('wyslane zdarzenie: document.title z "%" -> page_title "(odrzucone)", bez cyfr', () => {
    document.title = 'Promocja -20% | tel 600 100 200';
    trackEvent('click_phone', { link_location: 'header' });
    const p = sent();
    expect(p.page_title).toBe(REFUSED);
    expect(JSON.stringify(p)).not.toMatch(/600|%/);
  });
  it('blizniak: document.title bez "%" -> brak page_title w zdarzeniu', () => {
    document.title = 'Promocja 20 procent | Mixture Marketing';
    trackEvent('click_phone', { link_location: 'header' });
    expect(sent()).toEqual({ link_location: 'header' });
  });
});
