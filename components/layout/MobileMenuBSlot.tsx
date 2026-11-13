import React, { Suspense, lazy } from 'react';
import type MobileMenuBType from './MobileMenuB';

// MIX-1465 kryt. 2: menu B (JS, mobileMenuB.css, krój „Manrope MMB”) to osobny fragment,
// ładowany tylko w budowie z przełącznikiem. Warunek czyta import.meta.env wprost: Vite wstawia
// wartość przy budowie, Rollup składa warunek w stałą i wycina resztę funkcji razem z dynamicznym
// importem, więc budowa bez przełącznika nie ma ani kodu, ani CSS menu B (pomiar:
// scripts/size-mobile-menu-b.mjs --dist <budowa> --expect off). Ta sama allowlista co
// mobileMenuFlag.ts: tylko `1` albo `true`.
const LazyMobileMenuB = /* @__PURE__ */ lazy(() => import('./MobileMenuB'));

const MobileMenuBSlot: React.FC<React.ComponentProps<typeof MobileMenuBType>> = (props) => {
  if (
    import.meta.env.VITE_MM_MOBILE_MENU_B !== '1' &&
    import.meta.env.VITE_MM_MOBILE_MENU_B !== 'true'
  ) {
    return null;
  }
  return (
    <Suspense fallback={null}>
      <LazyMobileMenuB {...props} />
    </Suspense>
  );
};

export default MobileMenuBSlot;
