import { useState, useEffect, RefObject, useRef } from 'react';
import { useMousePosition } from './useMousePosition';

interface ParallaxOffset {
  x: number;
  y: number;
}

/**
 * Advanced Parallax hook with Linear Interpolation (LERP) for buttery smooth motion.
 */
export const useParallax = (
  ref: RefObject<HTMLElement | null>,
  intensity: number = 1,
  lerpFactor: number = 0.1, // Adjust for more/less "laziness" (0.01 to 1)
): ParallaxOffset => {
  const mousePos = useMousePosition();
  const [offset, setOffset] = useState<ParallaxOffset>({ x: 0, y: 0 });
  const dimensions = useRef({ left: 0, top: 0, width: 0, height: 0 });

  // Refs for LERP calculation to avoid state lag
  const targetOffset = useRef({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const element = ref.current;

    const updateDimensions = () => {
      const rect = element.getBoundingClientRect();
      dimensions.current = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [ref]);

  // Update targets when mouse moves
  useEffect(() => {
    const { left, top, width, height } = dimensions.current;
    if (width === 0 || height === 0) return;

    const x = (mousePos.x - (left + window.scrollX)) / width - 0.5;
    const y = (mousePos.y - (top + window.scrollY)) / height - 0.5;

    const clamp = (val: number) => Math.max(-1, Math.min(1, val));

    targetOffset.current = {
      x: clamp(x) * intensity,
      y: clamp(y) * intensity,
    };
  }, [mousePos, intensity]);

  // Animation Loop for LERP
  useEffect(() => {
    let rafId: number;

    const animate = () => {
      // LERP: current = current + (target - current) * factor
      const nextX =
        currentOffset.current.x + (targetOffset.current.x - currentOffset.current.x) * lerpFactor;
      const nextY =
        currentOffset.current.y + (targetOffset.current.y - currentOffset.current.y) * lerpFactor;

      // Only update state if there's a visible change
      if (
        Math.abs(nextX - currentOffset.current.x) > 0.0001 ||
        Math.abs(nextY - currentOffset.current.y) > 0.0001
      ) {
        currentOffset.current = { x: nextX, y: nextY };
        setOffset({ x: nextX, y: nextY });
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [lerpFactor]);

  return offset;
};
