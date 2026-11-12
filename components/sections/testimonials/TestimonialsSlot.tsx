import React, { Suspense, lazy } from 'react';
import { isTestimonialsEnabled } from './testimonialsFlag';

// Jedyny punkt wejścia sekcji opinii (Home, Portfolio). Przy wyłączonym przełączniku
// (VITE_MM_TESTIMONIALS) zwraca null: sekcji nie ma w DOM, a chunk `Testimonials` nie jest
// pobierany (import() wykonuje się dopiero przy pierwszym renderze lazy).
const Testimonials = lazy(() => import('./Testimonials'));

const TestimonialsSlot: React.FC = () => {
  if (!isTestimonialsEnabled()) return null;
  return (
    <Suspense fallback={null}>
      <Testimonials />
    </Suspense>
  );
};

export default TestimonialsSlot;
