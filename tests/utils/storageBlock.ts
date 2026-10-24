/**
 * Symulacja przeglądarki z zablokowanym storage: samo odwołanie do
 * `window.localStorage` / `window.sessionStorage` rzuca SecurityError
 * (tak zachowuje się m.in. Chrome z blokadą danych witryn).
 */
type StorageProp = 'localStorage' | 'sessionStorage';

export const blockStorage = (prop: StorageProp = 'localStorage') => {
  const original =
    Object.getOwnPropertyDescriptor(window, prop) ??
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(window), prop);

  Object.defineProperty(window, prop, {
    configurable: true,
    get() {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    },
  });

  return () => {
    if (original) {
      Object.defineProperty(window, prop, { ...original, configurable: true });
    } else {
      // Właściwość pochodziła z prototypu — usunięcie własnej przywraca dziedziczoną.
      delete (window as unknown as Record<string, unknown>)[prop];
    }
  };
};
