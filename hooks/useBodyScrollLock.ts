import { useCallback } from 'react';

/**
 * A shared hook to manage body scroll locking,
 * essential for Modals and Mobile Menus to prevent background scrolling.
 */
export const useBodyScrollLock = () => {
  const lockScroll = useCallback(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = 'var(--scrollbar-width, 0px)'; // Prevent layout shift if possible
  }, []);

  const unlockScroll = useCallback(() => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }, []);

  const toggleScroll = useCallback(
    (isLocked: boolean) => {
      if (isLocked) lockScroll();
      else unlockScroll();
    },
    [lockScroll, unlockScroll],
  );

  return { lockScroll, unlockScroll, toggleScroll };
};
