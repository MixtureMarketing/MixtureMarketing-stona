// MIX-1855: generate_lead (słownik zdarzeń P4) w allowliście GA4 (fail-closed, utils/ga4Events.ts):
// tylko stałe form_id/page_type (enum), bez nazwy klienta i bez danych osobowych.
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { trackEvent } from '@/utils/analytics';
import { GA4_EVENTS, REFUSED, sanitizeGa4Event } from '@/utils/ga4Events';

let track: Mock<(event: string, data?: Record<string, unknown>) => void>;

beforeEach(() => {
  track = vi.fn<(event: string, data?: Record<string, unknown>) => void>();
  window.zaraz = { track, consent: { set: vi.fn() } };
  window.dataLayer = [];
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});
afterEach(() => {
  delete window.zaraz;
  delete window.dataLayer;
  vi.restoreAllMocks();
});

const OK = { form_id: 'case_study_similar', page_type: 'case_study' };

describe('generate_lead w allowliście', () => {
  it('jest znane, ma dokładnie form_id i page_type jako enum z jedną wartością', () => {
    expect(Object.keys(GA4_EVENTS)).toContain('generate_lead');
    expect(GA4_EVENTS.generate_lead).toEqual({
      form_id: { kind: 'enum', values: ['case_study_similar'] },
      page_type: { kind: 'enum', values: ['case_study'] },
    });
  });

  it('bliźniak: poprawne parametry przechodzą bez zmian', () => {
    expect(sanitizeGa4Event('generate_lead', OK)).toEqual({ ok: true, params: OK, refused: [] });
  });

  it('trackEvent wysyła zdarzenie do Zaraz z tymi parametrami', () => {
    trackEvent('generate_lead', OK);
    expect(track).toHaveBeenCalledTimes(1);
    expect(track.mock.calls[0][0]).toBe('generate_lead');
    expect(track.mock.calls[0][1]).toMatchObject(OK);
  });

  it.each([
    ['nazwa klienta jako form_id', { ...OK, form_id: 'GlamSpace' }, 'form_id'],
    ['nazwa realizacji z dwukropkiem', { ...OK, form_id: 'GlamSpace: rezerwacje' }, 'form_id'],
    ['inny slug jako form_id', { ...OK, form_id: 'case_study_other' }, 'form_id'],
    ['wielkie litery', { ...OK, form_id: 'CASE_STUDY_SIMILAR' }, 'form_id'],
    ['spacja na końcu', { ...OK, form_id: 'case_study_similar ' }, 'form_id'],
    ['e-mail w form_id', { ...OK, form_id: 'jan@firma.pl' }, 'form_id'],
    ['telefon w form_id', { ...OK, form_id: '600100200' }, 'form_id'],
    ['liczba zamiast tekstu', { ...OK, form_id: 5 }, 'form_id'],
    ['page_type spoza listy', { ...OK, page_type: 'article' }, 'page_type'],
    ['page_type z danymi osobowymi', { ...OK, page_type: 'jan@firma.pl' }, 'page_type'],
  ])('(−) %s → wartość „(odrzucone)”, zdarzenie idzie dalej', (_n, params, klucz) => {
    const r = sanitizeGa4Event('generate_lead', params);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.params[klucz]).toBe(REFUSED);
      expect(r.refused.map((x) => x.param)).toEqual([klucz]);
    }
  });

  it('(−) parametry spoza allowlisty (nazwa klienta, e-mail, department) odpadają bez czytania', () => {
    const r = sanitizeGa4Event('generate_lead', {
      ...OK,
      client_name: 'GlamSpace',
      email: 'jan@firma.pl',
      department: 'web',
      similarProject: 'GlamSpace',
    });
    expect(r).toEqual({ ok: true, params: OK, refused: [] });
  });

  it('(−) nieznane zdarzenie o podobnej nazwie nadal jest odrzucane w całości', () => {
    for (const name of ['generate_leads', 'Generate_Lead', 'generate-lead', 'generate_lead '])
      expect(sanitizeGa4Event(name, OK).ok).toBe(false);
  });
});
