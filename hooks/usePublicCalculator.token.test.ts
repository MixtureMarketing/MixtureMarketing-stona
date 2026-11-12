// MIX-1412: token Turnstile przy wysyłce i podglądzie — pusty, brak widżetu, nieaktualny (fail-closed).
// Wyścig (kolejka, podwójna wysyłka) jest w usePublicCalculator.race.test.ts.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePublicCalculator, TURNSTILE_EMPTY_TOKEN } from './usePublicCalculator';
import * as svc from '../services/calculatorService';
import { humanError } from '../components/features/calculator/formLogic';
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
const OK = {
  ok: true as const,
  result: { priceRange: { min: 1000, max: 2000 }, currency: 'PLN', status: 'ok' },
};

async function ready(ref: Parameters<typeof usePublicCalculator>[0]) {
  const h = renderHook(() => usePublicCalculator(ref));
  await waitFor(() => expect(h.result.current.phase).toBe('ready'));
  act(() => {
    h.result.current.setAnswer('project_goal', 'sklep');
    h.result.current.setEmail('a@b.pl');
  });
  return h;
}

beforeEach(() => {
  vi.spyOn(svc, 'fetchPublicQuestions').mockResolvedValue(QS);
});
afterEach(() => vi.restoreAllMocks());

describe('token Turnstile — odmowy i bliźniaki (fail-closed)', () => {
  it.each(['', undefined, null, 42])(
    'pusty albo nie-tekstowy token %j: bez POST, komunikat antybotowy',
    async (bad) => {
      const post = vi.spyOn(svc, 'submitPublicQuote').mockResolvedValue(OK);
      const ref = {
        current: { getToken: () => Promise.resolve(bad as unknown as string), reset: vi.fn() },
      };
      const { result } = await ready(ref);
      await act(async () => {
        await result.current.submit();
      });
      expect(post).not.toHaveBeenCalled();
      expect(result.current.submitError).toBe(humanError(403));
      expect(result.current.phase).toBe('ready');
    },
  );

  it('bliźniak: niepusty token idzie w POST', async () => {
    const post = vi.spyOn(svc, 'submitPublicQuote').mockResolvedValue(OK);
    const ref = { current: { getToken: () => Promise.resolve('t'), reset: vi.fn() } };
    const { result } = await ready(ref);
    await act(async () => {
      await result.current.submit();
    });
    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0][0].captcha_token).toBe('t');
  });

  it('pusty token dla podglądu: odmowa z powodem', async () => {
    const ref = { current: { getToken: () => Promise.resolve(''), reset: vi.fn() } };
    const { result } = await ready(ref);
    await expect(result.current.getPreviewToken()).rejects.toThrow(TURNSTILE_EMPTY_TOKEN);
  });

  it('brak widżetu: wysyłka bez POST, podgląd odmowa TURNSTILE_NOT_READY', async () => {
    const post = vi.spyOn(svc, 'submitPublicQuote').mockResolvedValue(OK);
    const ref = { current: null };
    const { result } = await ready(ref);
    await expect(result.current.getPreviewToken()).rejects.toThrow('TURNSTILE_NOT_READY');
    await act(async () => {
      await result.current.submit();
    });
    expect(post).not.toHaveBeenCalled();
    expect(result.current.submitError).toBe(humanError(403));
  });

  it('nieaktualny token (403): reset widżetu, następna wysyłka pobiera NOWY token', async () => {
    const post = vi
      .spyOn(svc, 'submitPublicQuote')
      .mockResolvedValueOnce({ ok: false, status: 403 })
      .mockResolvedValueOnce(OK);
    let n = 0;
    const reset = vi.fn();
    const ref = { current: { getToken: () => Promise.resolve(`tok-${++n}`), reset } };
    const { result } = await ready(ref);
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.submitError).toBe(humanError(403));
    expect(reset).toHaveBeenCalledTimes(1);
    await act(async () => {
      await result.current.submit();
    });
    expect(post.mock.calls.map((c) => c[0].captcha_token)).toEqual(['tok-1', 'tok-2']);
    expect(result.current.phase).toBe('done');
  });

  it('błąd Turnstile w kolejce nie blokuje następnych pobrań', async () => {
    let fail = true;
    const ref = {
      current: {
        getToken: () =>
          fail ? Promise.reject(new Error('TURNSTILE_TIMEOUT')) : Promise.resolve('ok'),
        reset: vi.fn(),
      },
    };
    const { result } = await ready(ref);
    await expect(result.current.getPreviewToken()).rejects.toThrow('TURNSTILE_TIMEOUT');
    fail = false;
    await expect(result.current.getPreviewToken()).resolves.toBe('ok');
  });
});
