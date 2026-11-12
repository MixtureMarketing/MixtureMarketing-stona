// MIX-1412 (uwaga 5 weryfikatora MIX-1385): wyścig Turnstile przy wysyłce. Jeden widżet obsługuje
// wysyłkę i podgląd widełek; każde getToken() robi reset + execute. Fail-closed: wysyłka nie idzie
// dwa razy ani bez tokenu, a podgląd nie bierze tokenu w trakcie wysyłki. Każda odmowa ma bliźniaka.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePublicCalculator, PREVIEW_BLOCKED_BY_SUBMIT } from './usePublicCalculator';
import * as svc from '../services/calculatorService';
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

/** Ręcznie sterowany Turnstile: każde getToken() czeka, aż test je rozwiąże; liczy równoległość. */
function manualTurnstile() {
  const pending: Array<(t: string) => void> = [];
  let active = 0;
  let maxActive = 0;
  const getToken = vi.fn(
    () =>
      new Promise<string>((resolve) => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        pending.push((t) => {
          active -= 1;
          resolve(t);
        });
      }),
  );
  const reset = vi.fn();
  return {
    ref: { current: { getToken, reset } },
    getToken,
    reset,
    resolveNext: (t: string) => pending.shift()?.(t),
    pendingCount: () => pending.length,
    maxActive: () => maxActive,
  };
}

const flush = () => act(async () => {});

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

describe('wysyłka i Turnstile — wyścig (fail-closed)', () => {
  it('podwójne kliknięcie: jedno pobranie tokenu i jedno POST', async () => {
    const post = vi.spyOn(svc, 'submitPublicQuote').mockResolvedValue(OK);
    const ts = manualTurnstile();
    const { result } = await ready(ts.ref);
    let first!: Promise<unknown>;
    let second!: Promise<unknown>;
    act(() => {
      first = result.current.submit();
      second = result.current.submit();
    });
    expect(await second).toBeNull();
    await flush();
    expect(ts.getToken).toHaveBeenCalledTimes(1);
    ts.resolveNext('tok-1');
    await act(async () => {
      await first;
    });
    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0][0].captcha_token).toBe('tok-1');
    expect(result.current.phase).toBe('done');
  });

  it('bliźniak: druga wysyłka PO zakończeniu pierwszej przechodzi (blokada się zwalnia)', async () => {
    const post = vi
      .spyOn(svc, 'submitPublicQuote')
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce(OK);
    const ts = manualTurnstile();
    const { result } = await ready(ts.ref);
    let p!: Promise<unknown>;
    act(() => {
      p = result.current.submit();
    });
    await flush();
    ts.resolveNext('tok-1');
    await act(async () => {
      await p;
    });
    act(() => {
      p = result.current.submit();
    });
    await flush();
    ts.resolveNext('tok-2');
    await act(async () => {
      await p;
    });
    expect(post).toHaveBeenCalledTimes(2);
    expect(post.mock.calls.map((c) => c[0].captcha_token)).toEqual(['tok-1', 'tok-2']);
  });

  it('wysyłka w trakcie odświeżania tokenu podglądu: czeka, tokeny nigdy równolegle, różne', async () => {
    const post = vi.spyOn(svc, 'submitPublicQuote').mockResolvedValue(OK);
    const ts = manualTurnstile();
    const { result } = await ready(ts.ref);
    let preview!: Promise<string>;
    act(() => {
      preview = result.current.getPreviewToken();
    });
    await flush();
    expect(ts.getToken).toHaveBeenCalledTimes(1);
    let sub!: Promise<unknown>;
    act(() => {
      sub = result.current.submit();
    });
    await flush();
    // Wysyłka nie woła getToken (reset + execute), dopóki podgląd nie skończy.
    expect(ts.getToken).toHaveBeenCalledTimes(1);
    expect(post).not.toHaveBeenCalled();
    ts.resolveNext('tok-preview');
    await expect(preview).resolves.toBe('tok-preview');
    await flush();
    expect(ts.getToken).toHaveBeenCalledTimes(2);
    ts.resolveNext('tok-submit');
    await act(async () => {
      await sub;
    });
    expect(ts.maxActive()).toBe(1);
    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0][0].captcha_token).toBe('tok-submit');
  });

  it('podgląd w trakcie wysyłki: odmowa z powodem, bez getToken; po wysyłce dozwolony', async () => {
    vi.spyOn(svc, 'submitPublicQuote').mockResolvedValue({ ok: false, status: 500 });
    const ts = manualTurnstile();
    const { result } = await ready(ts.ref);
    let sub!: Promise<unknown>;
    act(() => {
      sub = result.current.submit();
    });
    await expect(result.current.getPreviewToken()).rejects.toThrow(PREVIEW_BLOCKED_BY_SUBMIT);
    await flush();
    expect(ts.getToken).toHaveBeenCalledTimes(1);
    ts.resolveNext('tok-submit');
    await act(async () => {
      await sub;
    });
    // Bliźniak: po wysyłce podgląd znowu dostaje token.
    let preview!: Promise<string>;
    act(() => {
      preview = result.current.getPreviewToken();
    });
    await flush();
    ts.resolveNext('tok-preview-2');
    await expect(preview).resolves.toBe('tok-preview-2');
  });

  it('podgląd czekający w kolejce, gdy zaczęła się wysyłka: odmowa w swojej kolejce', async () => {
    vi.spyOn(svc, 'submitPublicQuote').mockResolvedValue(OK);
    const ts = manualTurnstile();
    const { result } = await ready(ts.ref);
    let p1!: Promise<string>;
    let p2!: Promise<string>;
    act(() => {
      p1 = result.current.getPreviewToken();
      p2 = result.current.getPreviewToken();
    });
    await flush();
    expect(ts.getToken).toHaveBeenCalledTimes(1);
    let sub!: Promise<unknown>;
    act(() => {
      sub = result.current.submit();
    });
    await flush();
    ts.resolveNext('tok-p1');
    await expect(p1).resolves.toBe('tok-p1');
    await expect(p2).rejects.toThrow(PREVIEW_BLOCKED_BY_SUBMIT);
    await flush();
    ts.resolveNext('tok-submit');
    await act(async () => {
      await sub;
    });
    expect(ts.getToken).toHaveBeenCalledTimes(2);
  });
});
