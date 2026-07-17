import { describe, it, expect, vi } from 'vitest';
import { withRetry } from './retry';

describe('withRetry — backoff dla przejściowych błędów D1', () => {
  it('sukces za pierwszym razem → jedno wywołanie, brak opóźnień', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const delay = vi.fn().mockResolvedValue(undefined);
    await expect(withRetry(fn, { delay })).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(delay).not.toHaveBeenCalled();
  });

  it('dwa błędy, potem sukces → 3 wywołania, backoff 50→100', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('7500'))
      .mockRejectedValueOnce(new Error('7500'))
      .mockResolvedValue('ok');
    const delay = vi.fn().mockResolvedValue(undefined);
    await expect(withRetry(fn, { attempts: 3, baseDelayMs: 50, delay })).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
    expect(delay).toHaveBeenNthCalledWith(1, 50);
    expect(delay).toHaveBeenNthCalledWith(2, 100);
  });

  it('wyczerpanie prób → rzuca ostatni błąd, N wywołań', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('trwały'));
    const delay = vi.fn().mockResolvedValue(undefined);
    await expect(withRetry(fn, { attempts: 3, delay })).rejects.toThrow('trwały');
    expect(fn).toHaveBeenCalledTimes(3);
    expect(delay).toHaveBeenCalledTimes(2); // opóźnienie tylko między próbami
  });
});
