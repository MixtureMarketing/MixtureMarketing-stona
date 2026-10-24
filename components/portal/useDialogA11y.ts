import { useEffect, useRef } from 'react';

/**
 * Minimum dostępności dla modali portalu i panelu (div fixed, nie <dialog>):
 * - Esc zamyka,
 * - fokus przechodzi do okna (ref na panel z tabIndex=-1) i wraca po zamknięciu
 *   do elementu, który go otworzył.
 * Wcześniej fokus zostawał na BODY, a Esc nic nie robił.
 */
export function useDialogA11y<T extends HTMLElement>(onClose: () => void, active = true) {
  const ref = useRef<T>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [active]);

  return ref;
}
