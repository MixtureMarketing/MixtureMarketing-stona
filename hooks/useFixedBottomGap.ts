import { useEffect, useState, type RefObject } from 'react';
import { fixedBottomGap } from '@/utils/fixedBottomGap';

/**
 * MIX-2079: Safari iOS potrafi liczyć warstwę `fixed` od starej (krótszej) wysokości widoku —
 * pasek „Darmowy audyt” stał wtedy w połowie ekranu. Sonda `fixed bottom-0 h-0` (probeRef)
 * mierzy, gdzie przeglądarka stawia dół warstwy; gdy wisi nad dołem visualViewport, hook zwraca
 * lukę w px (> 0 = pasek ma zjechać o tyle w dół). Mierzy tylko gdy `active` (pasek widoczny),
 * po każdym resize/scroll visualViewport i okna (raz na klatkę).
 */
export function useFixedBottomGap(probeRef: RefObject<HTMLElement | null>, active: boolean) {
  const [gap, setGap] = useState(0);

  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!active || !vv) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const probe = probeRef.current;
      // md:hidden (desktop) = sonda bez pudełka → bez korekty.
      if (!probe || probe.getClientRects().length === 0) {
        setGap(0);
        return;
      }
      setGap(
        fixedBottomGap({
          layerBottom: probe.getBoundingClientRect().top,
          viewportHeight: vv.height,
          viewportOffsetTop: vv.offsetTop,
          scale: vv.scale,
        }),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule();
    vv.addEventListener('resize', schedule);
    vv.addEventListener('scroll', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      vv.removeEventListener('resize', schedule);
      vv.removeEventListener('scroll', schedule);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [probeRef, active]);

  return active ? gap : 0;
}
