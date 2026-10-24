import React from 'react';

/**
 * Przewijany poziomo obszar (tabela porównawcza, blok kodu) osiągalny z klawiatury.
 *
 * axe `scrollable-region-focusable` (WCAG 2.1.1): kontener z overflow, w którym nie ma
 * nic fokusowalnego, jest dla użytkownika klawiatury martwy — nie da się przewinąć
 * strzałkami do ukrytych kolumn / końca linii. `tabIndex=0` daje fokus (pierścień z
 * globalnego `:focus-visible` w index.css), `role="region"` + `aria-label` nazywa
 * przystanek, żeby czytnik nie ogłaszał anonimowej „grupy".
 */
interface ScrollRegionProps extends React.HTMLAttributes<HTMLElement> {
  /** Nazwa obszaru ogłaszana przez czytnik ekranu (np. „Tabela porównawcza: …"). */
  label: string;
  /** Element kontenera — `pre` dla bloków kodu (zachowuje semantykę i białe znaki). */
  as?: 'div' | 'pre';
  children: React.ReactNode;
}

const ScrollRegion: React.FC<ScrollRegionProps> = ({
  label,
  as = 'div',
  className = 'overflow-x-auto',
  children,
  ...rest
}) => {
  return React.createElement(
    as,
    { ...rest, className, tabIndex: 0, role: 'region', 'aria-label': label },
    children,
  );
};

export default ScrollRegion;
