import { useState, useEffect } from 'react';

interface UseCounterOptions {
  duration?: number; // ms
  delay?: number; // ms
  increment?: number; // for ticking counters
  tickInterval?: number; // ms
}

export const useCounter = (endValue: number, options: UseCounterOptions = {}) => {
  const [count, setCount] = useState(0);
  const { duration = 1000, delay = 0, increment, tickInterval } = options;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let interval: NodeJS.Timeout;

    const startAnimation = () => {
      const startTime = Date.now();
      const startValue = 0;

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

        const currentValue = Math.floor(startValue + (endValue - startValue) * easedProgress);
        setCount(currentValue);

        if (progress < 1) {
          window.requestAnimationFrame(animate);
        } else if (increment && tickInterval) {
          // Switch to ticking mode after initial animation
          interval = setInterval(() => {
            setCount((prev) => prev + Math.floor(Math.random() * increment));
          }, tickInterval);
        }
      };

      window.requestAnimationFrame(animate);
    };

    const timeout = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [endValue, duration, delay, increment, tickInterval]);

  return count;
};
