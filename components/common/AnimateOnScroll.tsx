import React, { useEffect, useRef, useState } from 'react';

interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  once?: boolean;
}

const AnimateOnScroll: React.FC<AnimateOnScrollProps> = ({
  children,
  className = '',
  delay = 0,
  threshold = 0.1,
  once = true,
}) => {
  const [isVisible, setIsVisible] = useState(true); // Default to true for SSG match
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if we are in a prerendering environment
    const isPrerendering =
      typeof window !== 'undefined' &&
      (navigator.userAgent.includes('Headless') || window.isPrerendering);

    if (isPrerendering) return;

    // Use requestAnimationFrame to ensure we don't flicker on initial mount
    // We want to hide it only if it's NOT in viewport AFTER mounting
    requestAnimationFrame(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        },
        {
          threshold,
          rootMargin: '0px 0px -50px 0px',
        },
      );
      const currentRef = ref.current;
      if (currentRef) {
        observer.observe(currentRef);
      }

      return () => {
        if (currentRef) {
          observer.disconnect();
        }
      };
    });
  }, [once, threshold]);

  // For the first render (hydration), we MUST match the server HTML
  // The server (prerender.js) renders this with isVisible=true (implicitly or explicitly)
  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        willChange: 'opacity, transform',
      }}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none ${className}`}
    >
      {children}
    </div>
  );
};

export default AnimateOnScroll;
