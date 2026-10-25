import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * Po zamknięciu okna fokus wraca na element, który je otworzył (WCAG 2.4.3).
 *
 * Natywny <dialog> robi to sam tylko przy zamknięciu przez close()/Esc. Nasze okna znikają
 * zwykle przez ODMONTOWANIE (X, kliknięcie w tło, sukces): dialog modalny wypadał z DOM
 * otwarty i fokus spadał na <body> — klawiatura i czytnik zaczynały od początku strony.
 */
export function useDialogFocusReturn(
  open: boolean,
  dialogRef: RefObject<HTMLDialogElement | null>,
): void {
  const openerRef = useRef<HTMLElement | null>(null);

  // Layout effect biegnie przed showModal() (useEffect) — aktywny jest jeszcze element otwierający.
  // Fokus już wewnątrz okna (ponowny przebieg efektu w StrictMode) nie nadpisuje zapamiętanego.
  useLayoutEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    if (
      active instanceof HTMLElement &&
      active !== document.body &&
      !dialogRef.current?.contains(active)
    ) {
      openerRef.current = active;
    }
  }, [open, dialogRef]);

  // Cleanup pasywny biegnie PO usunięciu <dialog> z DOM — strona nie jest już `inert`, więc
  // focus() działa. Dialog wciąż w DOM i otwarty (symulowany unmount w StrictMode) — nic nie
  // robimy. Element bierzemy z domknięcia: ref React zeruje już przy odpinaniu.
  useEffect(() => {
    if (!open) return;
    const dlg = dialogRef.current;
    return () => {
      const opener = openerRef.current;
      if ((dlg?.isConnected && dlg.open) || !opener?.isConnected) return;
      openerRef.current = null;
      opener.focus({ preventScroll: true });
    };
  }, [open, dialogRef]);
}
