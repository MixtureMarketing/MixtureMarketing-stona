import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CHUNK_RELOAD_KEY,
  RELOAD_GUARD_MS,
  installChunkReloadHandler,
} from '../../utils/chunkReload';
import { blockStorage } from './storageBlock';

const firePreloadError = () => {
  const event = new Event('vite:preloadError', { cancelable: true });
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
});
