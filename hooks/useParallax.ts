import { useState, useEffect, RefObject, useRef } from 'react';

interface ParallaxOffset {
  x: number;
  y: number;
}

export const useParallax = (
  ref: RefObject<HTMLElement | null>,
  intensity: number = 1,
): ParallaxOffset => {
  const [offset, setOffset] = useState<ParallaxOffset>({ x: 0, y: 0 });
  const dimensions = useRef({ left: 0, top: 0, width: 0, height: 0 });

  useEffect(() => {
    // 1. Performance: Check if device supports hover (mouse).
    const isDesktop = window.matchMedia('(pointer: fine)').matches;
    if (!isDesktop || !ref.current) return;

    const element = ref.current;

    // Cache dimensions to avoid layout thrashing in mousemove
    const updateDimensions = () => {
      const rect = element.getBoundingClientRect();
      dimensions.current = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    };

    // Initial measure
    updateDimensions();

    // Update on resize
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(element);
    window.addEventListener('resize', updateDimensions);

    let requestRef: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (requestRef) cancelAnimationFrame(requestRef);

      requestRef = requestAnimationFrame(() => {
        const { left, top, width, height } = dimensions.current;
        if (width === 0 || height === 0) return;

        // Calculate relative position (-0.5 to 0.5)
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;

        setOffset({
          x: x * intensity,
          y: y * intensity,
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
      if (requestRef) cancelAnimationFrame(requestRef);
    };
  }, [ref, intensity]);

  return offset;
};
