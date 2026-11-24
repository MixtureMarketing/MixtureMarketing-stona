import { describe, expect, it } from 'vitest';
import { fixedBottomGap } from '../../utils/fixedBottomGap';

// MIX-2079: luka między dołem warstwy fixed a dołem visualViewport (iPhone 390×844).
const base = { layerBottom: 844, viewportHeight: 844, viewportOffsetTop: 0, scale: 1 };

describe('fixedBottomGap (MIX-2079)', () => {
  it('zwykły widok: warstwa przy dole = 0 (bez korekty)', () => {
    expect(fixedBottomGap(base)).toBe(0);
  });

  it('błąd Safari: dół warstwy w 63 % ekranu → luka 312 px w dół', () => {
    expect(fixedBottomGap({ ...base, layerBottom: 532 })).toBe(312);
  });

  it('offsetTop visualViewport dolicza się do dołu widoku', () => {
    expect(fixedBottomGap({ ...base, layerBottom: 700, viewportHeight: 800, viewportOffsetTop: 44 })).toBe(144);
  });

  it('tolerancja 2 px: drobne zaokrąglenia nie ruszają paska, 3 px już tak', () => {
    expect(fixedBottomGap({ ...base, layerBottom: 842 })).toBe(0);
    expect(fixedBottomGap({ ...base, layerBottom: 841 })).toBe(3);
  });

  it('nigdy w górę: warstwa poniżej widoku (klawiatura otwarta) = 0', () => {
    expect(fixedBottomGap({ ...base, viewportHeight: 500 })).toBe(0);
  });

  it('powiększenie palcami (scale ≠ 1) = 0, scale 1.005 nadal korekta', () => {
    expect(fixedBottomGap({ ...base, layerBottom: 532, scale: 1.5 })).toBe(0);
    expect(fixedBottomGap({ ...base, layerBottom: 532, scale: 0.98 })).toBe(0);
    expect(fixedBottomGap({ ...base, layerBottom: 532, scale: 1.005 })).toBe(312);
  });

  it('pomiar niewiarygodny = 0: sonda poza widokiem, luka ≥ widok, NaN, zerowy widok', () => {
    expect(fixedBottomGap({ ...base, layerBottom: 0 })).toBe(0);
    expect(fixedBottomGap({ ...base, layerBottom: -10 })).toBe(0);
    expect(fixedBottomGap({ ...base, layerBottom: 10, viewportOffsetTop: 900 })).toBe(0);
    expect(fixedBottomGap({ ...base, layerBottom: Number.NaN })).toBe(0);
    expect(fixedBottomGap({ ...base, viewportHeight: 0, layerBottom: -5 })).toBe(0);
  });
});
