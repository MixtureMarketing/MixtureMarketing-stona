import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePublicCalculator } from './usePublicCalculator';
import * as svc from '../services/calculatorService';
import type { TurnstileWidgetHandle } from '../utils/turnstile';
import type { PublicQuestion } from '../services/calculatorService';

const QS: PublicQuestion[] = [
  {
    code: 'project_goal',
    text: 'Cel?',
    help_text: null,
    answer_type: 'select',
    options: [{ value: 'sklep', label: 'Sklep' }],
    visible_if: null,
    group: 'projekt',
    sort_order: 10,
  },
];

function turnstile(token = 'tok'): { current: TurnstileWidgetHandle } {
  return { current: { getToken: () => Promise.resolve(token), reset: () => undefined } };
}

beforeEach(() => {
  vi.spyOn(svc, 'fetchPublicQuestions').mockResolvedValue(QS);
});
afterEach(() => vi.restoreAllMocks());

describe('usePublicCalculator', () => {
  it('ładuje pytania → phase ready', async () => {
    const ref = turnstile();
    const { result } = renderHook(() => usePublicCalculator(ref));
    expect(result.current.phase).toBe('loading');
    await waitFor(() => expect(result.current.phase).toBe('ready'));
    expect(result.current.questions).toHaveLength(1);
  });

  it('submit bez project_goal → błąd walidacji, bez POST', async () => {
    const post = vi.spyOn(svc, 'submitPublicQuote');
    const ref = turnstile();
    const { result } = renderHook(() => usePublicCalculator(ref));
    await waitFor(() => expect(result.current.phase).toBe('ready'));
    act(() => {
      result.current.setEmail('a@b.pl');
    });
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.errors.project_goal).toBeTruthy();
    expect(post).not.toHaveBeenCalled();
  });

  it('happy path: token → POST 200 → phase done + result', async () => {
    vi.spyOn(svc, 'submitPublicQuote').mockResolvedValue({
      ok: true,
      result: { priceRange: { min: 26000, max: 50500 }, currency: 'PLN', status: 'ok' },
    });
    const ref = turnstile();
    const { result } = renderHook(() => usePublicCalculator(ref));
    await waitFor(() => expect(result.current.phase).toBe('ready'));
    act(() => {
      result.current.setAnswer('project_goal', 'sklep');
      result.current.setEmail('a@b.pl');
    });
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.phase).toBe('done');
    expect(result.current.result?.priceRange).toEqual({ min: 26000, max: 50500 });
  });

  it('POST 429 → submitError po ludzku, phase wraca do ready (retry)', async () => {
    vi.spyOn(svc, 'submitPublicQuote').mockResolvedValue({ ok: false, status: 429 });
    const ref = turnstile();
    const { result } = renderHook(() => usePublicCalculator(ref));
    await waitFor(() => expect(result.current.phase).toBe('ready'));
    act(() => {
      result.current.setAnswer('project_goal', 'sklep');
      result.current.setEmail('a@b.pl');
    });
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.phase).toBe('ready');
    expect(result.current.submitError).toMatch(/Zbyt wiele/);
  });

  it('Turnstile rzuca → submitError, bez POST', async () => {
    const post = vi.spyOn(svc, 'submitPublicQuote');
    const ref = {
      current: { getToken: () => Promise.reject(new Error('x')), reset: () => undefined },
    };
    const { result } = renderHook(() => usePublicCalculator(ref));
    await waitFor(() => expect(result.current.phase).toBe('ready'));
    act(() => {
      result.current.setAnswer('project_goal', 'sklep');
      result.current.setEmail('a@b.pl');
    });
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.submitError).toBeTruthy();
    expect(post).not.toHaveBeenCalled();
  });
});

// MIX-1300: calculator_submit (GA4 key event) idzie z prawdziwego przepływu /wycena/,
// gdy formularz przeszedł walidację i captchę, a wycena idzie do API. Wcześniej wysyłała go
// tylko martwa gałąź ModalContext.
describe('usePublicCalculator — calculator_submit', () => {
  let track: Mock<(event: string, data?: Record<string, unknown>) => void>;
  const sent = () => track.mock.calls.filter((c) => c[0] === 'calculator_submit');
  beforeEach(() => {
    track = vi.fn<(event: string, data?: Record<string, unknown>) => void>();
    window.zaraz = { track, consent: { set: vi.fn() } };
  });
  afterEach(() => {
    delete window.zaraz;
  });

  async function fillAndSubmit(ref: { current: TurnstileWidgetHandle }, goal?: string) {
    const { result } = renderHook(() => usePublicCalculator(ref));
    await waitFor(() => expect(result.current.phase).toBe('ready'));
    act(() => {
      if (goal) result.current.setAnswer('project_goal', goal);
      result.current.setEmail('jan@firma.pl');
    });
    await act(async () => {
      await result.current.submit();
    });
    return result;
  }

  it('wysłanie wyceny → jedno calculator_submit ze ścieżką, przed POST, bez e-maila', async () => {
    const order: string[] = [];
    track.mockImplementation((e: string) => order.push(e));
    vi.spyOn(svc, 'submitPublicQuote').mockImplementation(async () => {
      order.push('POST');
      return {
        ok: true,
        result: { priceRange: { min: 1, max: 2 }, currency: 'PLN', status: 'ok' },
      };
    });
    await fillAndSubmit(turnstile(), 'sklep');
    expect(sent()).toHaveLength(1);
    expect(sent()[0][1]).toEqual({ source: window.location.pathname });
    expect(JSON.stringify(sent()[0][1])).not.toContain('jan@firma.pl');
    expect(order).toEqual(['calculator_submit', 'POST']);
  });

  it('POST odrzucony (np. przerwany) → calculator_submit i tak poszedł', async () => {
    vi.spyOn(svc, 'submitPublicQuote').mockResolvedValue({ ok: false, status: 0 });
    await fillAndSubmit(turnstile(), 'sklep');
    expect(sent()).toHaveLength(1);
  });

  it('negatyw: błąd walidacji → brak calculator_submit', async () => {
    const post = vi.spyOn(svc, 'submitPublicQuote');
    await fillAndSubmit(turnstile());
    expect(post).not.toHaveBeenCalled();
    expect(sent()).toHaveLength(0);
  });

  it('negatyw: captcha rzuca → brak calculator_submit', async () => {
    const ref = {
      current: { getToken: () => Promise.reject(new Error('x')), reset: () => undefined },
    };
    await fillAndSubmit(ref, 'sklep');
    expect(sent()).toHaveLength(0);
  });
});
