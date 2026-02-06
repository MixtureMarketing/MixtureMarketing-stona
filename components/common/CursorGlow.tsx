import React, { useEffect, useRef } from 'react';

const CursorGlow: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return;

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
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed inset-0 z-[100] transition-opacity duration-500 cursor-glow hidden md:block"
      style={{
        background: `radial-gradient(600px at var(--cursor-x, -1000px) var(--cursor-y, -1000px), rgba(97, 182, 222, 0.08), transparent 80%)`,
      }}
    />
  );
};

export default CursorGlow;
