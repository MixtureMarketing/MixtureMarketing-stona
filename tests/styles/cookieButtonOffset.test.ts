import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

// MIX-1400: regula przesuwajaca przycisk ciasteczek nad StickyMobileBar musi byc w warstwie
// `utilities`, bo klasa bottom-4 na przycisku (utilities) przegrywa z regula z warstwy `base`.
const css = fs.readFileSync(path.resolve(__dirname, '../../index.css'), 'utf8');

const layerBody = (name: string): string => {
  const start = css.indexOf(`@layer ${name} {`);
  if (start < 0) return '';
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) return css.slice(start, i + 1);
  }
  return '';
};

const SEL = "body[data-sticky-mobile-bar='true'] .cookie-floating-btn";
const esc = SEL.replace(/[[\]'.]/g, '\\$&');
const mobileRule = new RegExp(`${esc}\\s*\\{\\s*bottom:\\s*6\\.5rem;`);
const desktopRule = new RegExp(
  `@media \\(min-width: 768px\\)\\s*\\{\\s*${esc}\\s*\\{\\s*bottom:\\s*1rem;`,
);

describe('index.css: przycisk ciasteczek nad paskiem (MIX-1400)', () => {
  it('regula telefonu (6.5rem) jest w warstwie utilities', () => {
    expect(layerBody('utilities')).toMatch(mobileRule);
  });
  it('od 768 px przycisk wraca na bottom 1rem (warstwa utilities)', () => {
    expect(layerBody('utilities')).toMatch(desktopRule);
  });
  it('reguly nie ma w warstwie base (tam przegrywa z bottom-4)', () => {
    expect(layerBody('base')).not.toContain(SEL);
  });
  it('przycisk ma klase cookie-floating-btn i bottom-4', () => {
    const tsx = fs.readFileSync(
      path.resolve(__dirname, '../../components/features/CookieFloatingButton.tsx'),
      'utf8',
    );
    expect(tsx).toContain('cookie-floating-btn');
    expect(tsx).toContain('bottom-4');
  });
});
