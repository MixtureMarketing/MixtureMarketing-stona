import { useEffect, useRef } from 'react';

/**
 * A hook that executes a callback function on every animation frame,
 * but only if a specified amount of time has passed (emulating an interval).
 * This is more performant than setInterval for fast updates.
 *
 * @param callback The function to execute.
 * @param interval The delay between executions in milliseconds.
 * @param isActive Whether the animation is currently active.
 */
export const useAnimationFrameInterval = (
  callback: () => void,
  interval: number,
  isActive: boolean,
) => {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | undefined>(undefined);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;

        if (deltaTime >= interval) {
          callbackRef.current();
          previousTimeRef.current = time;
        }
      } else {
        previousTimeRef.current = time;
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    if (isActive) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = undefined;
    }

    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, interval]);
};
