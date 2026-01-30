import { useCallback } from 'react';

/**
 * A shared hook to handle smooth scrolling to anchors,
 * especially useful for fixed headers and mobile menus.
 */
export const useSmoothScroll = () => {
  const scrollToId = useCallback((id: string, offset = 80) => {
    const element = document.getElementById(id.replace('#', ''));
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }, []);

  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLButtonElement>, id: string) => {
      e.preventDefault();
      scrollToId(id);
    },
    [scrollToId],
  );

  return { scrollToId, handleAnchorClick };
};
