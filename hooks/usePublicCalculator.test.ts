import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
