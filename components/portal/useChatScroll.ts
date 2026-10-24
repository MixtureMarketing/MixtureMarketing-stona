import { useCallback, useLayoutEffect, useRef } from 'react';

/** Odległość od dołu (px), przy której uznajemy, że użytkownik „jest przy najnowszych”. */
const AT_BOTTOM_PX = 60;

interface ChatItem {
  id: string | number;
}

interface Options<M> {
  /** Zmiana (np. id rozmowy) = nowa rozmowa → znów przyklejamy do dołu. */
  resetKey?: unknown;
  /** Własna, świeżo wysłana wiadomość przewija zawsze — nawet gdy czytamy starsze. */
  isOwn?: (message: M) => boolean;
}

/**
 * Czat przyklejony do najnowszej wiadomości (portal klienta i panel admina).
 *
 * - po załadowaniu / zmianie rozmowy: przewija na dół,
 * - nowa wiadomość: przewija tylko, gdy użytkownik BYŁ przy dole (nie wyrywa go
 *   z czytania starszych) albo gdy to jego własna wiadomość,
 * - polling zwracający tę samą listę nic nie robi (zależność od tablicy — hooki
 *   danych podmieniają ją tylko przy faktycznej zmianie).
 *
 * Zwraca ref kontenera i handler onScroll.
 */
export function useChatScroll<M extends ChatItem>(messages: M[], options: Options<M> = {}) {
  const { resetKey, isOwn } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const lastIdRef = useRef<M['id'] | undefined>(undefined);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < AT_BOTTOM_PX;
  }, []);

  // Nowa rozmowa (albo ponowny montaż po zmianie zakładki) — start od najnowszych.
  useLayoutEffect(() => {
    atBottomRef.current = true;
    lastIdRef.current = undefined;
  }, [resetKey]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    const last = messages[messages.length - 1];
    const isNewOwn =
      !!last && lastIdRef.current !== undefined && last.id !== lastIdRef.current && !!isOwn?.(last);
    lastIdRef.current = last?.id;
    if (!el || !last) return;
    if (atBottomRef.current || isNewOwn) {
      el.scrollTop = el.scrollHeight;
      atBottomRef.current = true;
    }
  }, [messages, resetKey, isOwn]);

  return { containerRef, onScroll };
}
