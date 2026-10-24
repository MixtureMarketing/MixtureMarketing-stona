import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import MixtureApiClient from '../../services/apiClient';

const okResponse = () => ({ ok: true, status: 200, json: async () => ({ ok: true }) });

describe('MixtureApiClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse()));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const lastInit = () => (fetch as Mock).mock.calls[0][1] as RequestInit;
  const lastHeaders = () => lastInit().headers as Record<string, string>;

  it('wysyła JSON z Content-Type application/json', async () => {
    await MixtureApiClient.post('/api/x', { a: 1 }, 'tok');

    expect((fetch as Mock).mock.calls[0][0]).toBe('/api/x');
    expect(lastInit().method).toBe('POST');
    expect(lastInit().body).toBe(JSON.stringify({ a: 1 }));
    expect(lastHeaders()['Content-Type']).toBe('application/json');
    expect(lastHeaders()['Authorization']).toBe('Bearer tok');
  });

  it('przy FormData nie ustawia Content-Type (przeglądarka dopisze boundary)', async () => {
    const fd = new FormData();
    fd.append('file', new Blob(['abc'], { type: 'text/plain' }), 'a.txt');

    await MixtureApiClient.post('/api/admin/upload_document', fd, 'tok');

    expect(lastInit().body).toBe(fd);
    expect(lastHeaders()).not.toHaveProperty('Content-Type');
    // Autoryzacja nadal dołączona
    expect(lastHeaders()['Authorization']).toBe('Bearer tok');
    expect(lastHeaders()['X-Auth-Token']).toBe('tok');
  });

  it('GET bez tokena nie dodaje nagłówków autoryzacji', async () => {
    await MixtureApiClient.get('/api/y');

    expect(lastHeaders()).not.toHaveProperty('Authorization');
    expect(lastHeaders()['Content-Type']).toBe('application/json');
  });
});
