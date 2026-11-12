import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isChunkLoadError,
  CHUNK_RELOAD_KEY,
  RELOAD_GUARD_MS,
  installChunkReloadHandler,
} from '../../utils/chunkReload';
import { blockStorage } from './storageBlock';

const CHUNK_ERROR = () =>
  new TypeError('Failed to fetch dynamically imported module: https://x.test/assets/Home-abc.js');

// Vite dokleja do zdarzenia `payload` = błąd z importu (handlePreloadError).
const firePreloadError = (payload: unknown = CHUNK_ERROR()) => {
  const event = new Event('vite:preloadError', { cancelable: true });
  (event as Event & { payload?: unknown }).payload = payload;
  window.dispatchEvent(event);
  return event;
};

describe('installChunkReloadHandler', () => {
  let uninstall: (() => void) | null = null;
  let restoreStorage: (() => void) | null = null;
  let clock = 1_000_000;
  const reload = vi.fn();

  const install = () => {
    uninstall = installChunkReloadHandler({ reload, now: () => clock });
  };

  beforeEach(() => {
    window.sessionStorage.clear();
    window.isPrerendering = undefined;
    reload.mockClear();
    clock = 1_000_000;
  });

  afterEach(() => {
    uninstall?.();
    uninstall = null;
    restoreStorage?.();
    restoreStorage = null;
    window.isPrerendering = undefined;
  });

  it('przeładowuje stronę raz i tłumi błąd', () => {
    install();
    const event = firePreloadError();

    expect(reload).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
    expect(window.sessionStorage.getItem(CHUNK_RELOAD_KEY)).toBe(String(clock));
  });

  it('kolejne błędy w tej samej sesji strony nie zlecają drugiego reloadu', () => {
    install();
    firePreloadError();
    const second = firePreloadError();

    expect(reload).toHaveBeenCalledTimes(1);
    expect(second.defaultPrevented).toBe(true);
  });

  it('nie przeładowuje ponownie w ciągu 10 s po poprzednim reloadzie (ochrona przed pętlą)', () => {
    window.sessionStorage.setItem(CHUNK_RELOAD_KEY, String(clock - 2_000));
    install();
    const event = firePreloadError();

    expect(reload).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false); // błąd idzie do ErrorBoundary
  });

  it('po upływie okna ochronnego znów przeładowuje', () => {
    window.sessionStorage.setItem(CHUNK_RELOAD_KEY, String(clock - RELOAD_GUARD_MS - 1));
    install();
    firePreloadError();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('podczas prerenderu nie przeładowuje', () => {
    window.isPrerendering = true;
    install();
    const event = firePreloadError();

    expect(reload).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it('przy zablokowanym sessionStorage nie przeładowuje (brak gwarancji braku pętli)', () => {
    restoreStorage = blockStorage('sessionStorage');
    install();
    const event = firePreloadError();

    expect(reload).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  describe('błędy inne niż pobranie chunka (MIX-1408)', () => {
    const configError = () => new Error('Configuration must contain `projectId`');

    it('błąd konfiguracji (brak projectId) → 0 reloadów, błąd nie jest tłumiony', () => {
      install();
      const event = firePreloadError(configError());

      expect(reload).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
      expect(window.sessionStorage.getItem(CHUNK_RELOAD_KEY)).toBeNull();
    });

    it('brak payloadu (nieznane zdarzenie) → 0 reloadów (fail-closed)', () => {
      install();
      const event = new Event('vite:preloadError', { cancelable: true });
      window.dispatchEvent(event);

      expect(reload).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it.each([
      ['Chrome', new TypeError('Failed to fetch dynamically imported module: https://x/a.js')],
      ['Firefox', new TypeError('error loading dynamically imported module: https://x/a.js')],
      ['Safari', new TypeError('Importing a module script failed.')],
      ['CSS Vite', new Error('Unable to preload CSS for /assets/a.css')],
      ['webpack', new Error('Loading chunk 12 failed.')],
    ])('prawdziwy błąd pobrania chunka (%s) → dokładnie 1 reload', (_name, payload) => {
      install();
      const event = firePreloadError(payload);

      expect(reload).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(true);
    });

    it('prawdziwy błąd chunka w oknie ochronnym → 0 reloadów', () => {
      window.sessionStorage.setItem(CHUNK_RELOAD_KEY, String(clock - 1_000));
      install();
      firePreloadError(CHUNK_ERROR());

      expect(reload).not.toHaveBeenCalled();
    });

    it('isChunkLoadError: odrzuca nie-błędy i puste wejścia', () => {
      for (const v of [undefined, null, '', 42, {}, { message: 7 }, configError()]) {
        expect(isChunkLoadError(v)).toBe(false);
      }
      expect(isChunkLoadError({ message: 'Failed to fetch dynamically imported module: x' })).toBe(
        true,
      );
    });

    it('moduł CMS bez projectId nie rzuca przy imporcie → żaden preloadError → 0 reloadów', async () => {
      vi.resetModules();
      vi.stubEnv('VITE_SANITY_PROJECT_ID', '');
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      install();
      try {
        await import('../../services/cms/client');
      } catch (e) {
        firePreloadError(e); // tak robi Vite: import rzuca → zdarzenie z payloadem
      }
      expect(reload).not.toHaveBeenCalled();
      errorSpy.mockRestore();
      vi.unstubAllEnvs();
    });
  });
});
