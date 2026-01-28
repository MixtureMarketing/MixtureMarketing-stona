/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react';

const CursorGlow: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null);
  const isMobileRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      isMobileRef.current = window.innerWidth < 768;
      if (glowRef.current) {
        glowRef.current.style.display = isMobileRef.current ? 'none' : 'block';
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobileRef.current || !glowRef.current) return;

      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        if (!glowRef.current) return;

        // Update CSS variables for high performance
        glowRef.current.style.setProperty('--cursor-x', `${e.clientX}px`);
        glowRef.current.style.setProperty('--cursor-y', `${e.clientY}px`);

        // Check if mouse is over an element that should disable the glow
        const target = e.target as HTMLElement;
        if (target && target.closest('.no-cursor-glow')) {
          glowRef.current.style.opacity = '0';
        } else {
          glowRef.current.style.opacity = '1';
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkMobile);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed inset-0 z-[100] transition-opacity duration-500 cursor-glow"
      style={{
        background: `radial-gradient(600px at var(--cursor-x, -1000px) var(--cursor-y, -1000px), rgba(97, 182, 222, 0.08), transparent 80%)`,
      }}
    />
  );
};

export default CursorGlow;
