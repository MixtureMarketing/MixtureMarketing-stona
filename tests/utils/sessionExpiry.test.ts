import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  isSessionExpiredResponse,
  onSessionExpired,
  asArray,
  SessionExpiredError,
} from '../../utils/sessionExpiry';
import MixtureApiClient from '../../services/apiClient';

describe('isSessionExpiredResponse', () => {
  it('401 z /api/admin i /api/portal → wygasła sesja', () => {
    expect(isSessionExpiredResponse('/api/admin/get_leads?t=1', 401)).toBe(true);
    expect(isSessionExpiredResponse('/api/portal/dashboard', 401)).toBe(true);
    expect(isSessionExpiredResponse('https://mixturemarketing.pl/api/portal/x', 401)).toBe(true);
  });

  it('403 z /api/admin → wygasła sesja (middleware nie rozróżnia), z /api/portal → nie', () => {
    expect(isSessionExpiredResponse('/api/admin/get_all_data', 403)).toBe(true);
    // portal 403 = brak uprawnień do zasobu (download/update_milestone), sesja ważna
    expect(isSessionExpiredResponse('/api/portal/download?id=1', 403)).toBe(false);
  });

  it('inne ścieżki i statusy → nie', () => {
    expect(isSessionExpiredResponse('/api/auth/verify_token', 401)).toBe(false);
    expect(isSessionExpiredResponse('/api/contact-submit', 403)).toBe(false);
    expect(isSessionExpiredResponse('/api/admin/get_leads', 500)).toBe(false);
  });
});

describe('asArray', () => {
  it('przepuszcza tablice, resztę zamienia na []', () => {
    expect(asArray([1, 2])).toEqual([1, 2]);
    expect(asArray(undefined)).toEqual([]);
    expect(asArray({ error: 'x' })).toEqual([]);
    expect(asArray(null)).toEqual([]);
  });
});

describe('MixtureApiClient — wygasła sesja', () => {
  afterEach(() => vi.unstubAllGlobals());

  const stubStatus = (status: number) =>
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status, json: async () => ({ error: 'x' }) }),
    );

  it('401 z /api/admin → SessionExpiredError i sygnał dla AuthProvidera', async () => {
    stubStatus(401);
    const listener = vi.fn();
    const off = onSessionExpired(listener);
    await expect(MixtureApiClient.post('/api/admin/save_client', {}, 'tok')).rejects.toBeInstanceOf(
      SessionExpiredError,
    );
    expect(listener).toHaveBeenCalledTimes(1);
    off();
  });

  it('403 z /api/portal → zwykły błąd, bez wylogowania', async () => {
    stubStatus(403);
    const listener = vi.fn();
    const off = onSessionExpired(listener);
    await expect(
      MixtureApiClient.post('/api/portal/update_milestone', {}, 'tok'),
    ).rejects.not.toBeInstanceOf(SessionExpiredError);
    expect(listener).not.toHaveBeenCalled();
    off();
  });
});
