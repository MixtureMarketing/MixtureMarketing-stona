import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const loadClient = async (projectId: string | undefined) => {
  vi.resetModules();
  vi.stubEnv('VITE_SANITY_PROJECT_ID', projectId as string);
  return import('../../services/cms/client');
};

describe('klient CMS bez VITE_SANITY_PROJECT_ID (MIX-1408)', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it.each([[''], ['   '], [undefined]])(
    'projectId=%j: import nie rzuca, jeden jawny błąd z powodem w konsoli',
    async (id) => {
      const mod = await loadClient(id);

      const sanity = await import('@sanity/client');
      expect(mod.isCmsConfigured).toBe(false);
      expect(sanity.createClient).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(String(errorSpy.mock.calls[0][0])).toContain('VITE_SANITY_PROJECT_ID');
    },
  );

  it('pobranie kończy się CmsUnavailableError (sekcje pokażą stan błędu)', async () => {
    const mod = await loadClient('');

    await expect(mod.fetchWithCache('*[_type=="x"]')).rejects.toBeInstanceOf(
      mod.CmsUnavailableError,
    );
    await expect(mod.fetchWithCache('*[_type=="x"]')).rejects.toThrow(/VITE_SANITY_PROJECT_ID/);
  });

  it('bliźniak: z projectId klient jest skonfigurowany i bez błędu w konsoli', async () => {
    const mod = await loadClient('abc12345');

    expect(mod.isCmsConfigured).toBe(true);
    expect(errorSpy).not.toHaveBeenCalled();
    const sanity = await import('@sanity/client');
    expect(sanity.createClient).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: 'abc12345' }),
    );
  });
});
