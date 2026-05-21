import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

type ButtonAttrs = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  | 'ref'
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
  | 'onTransitionEnd'
>;

interface MagneticButtonProps extends ButtonAttrs {
  /** Damping: 0 = brak ruchu, 1 = pełen 1:1 z kursorem. Default 0.3 dla subtelnego efektu. */
  strength?: number;
  /** Promień aktywacji wokół przycisku (px). Default = bounds przycisku (brak rozszerzenia). */
  range?: number;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({
  strength = 0.3,
  range,
  children,
  className,
  ...rest
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.6 });

  const handleMove: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (prefersReducedMotion) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    if (range != null) {
      const dist = Math.hypot(dx, dy);
      if (dist > range) {
        x.set(0);
        y.set(0);
        return;
      }
    }
    x.set(dx * strength);
    y.set(dy * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      {...rest}
    >
      {children}
    </motion.button>
  );
};

export default MagneticButton;
