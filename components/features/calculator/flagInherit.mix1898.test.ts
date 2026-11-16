// MIX-1898: przełączniki budowy kalkulatora nie dziedziczą VITE_MM_LIVE_PRICE_BAR, gdy ich własna
// zmienna nie jest ustawiona (uwaga weryfikatora MIX-1892). Wzór: isNewClientTimelineEnabled.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { isCalcNewUiEnabled } from './calcUi';
import { isConfigLinkEnabled, isConfigPreviewEnabled, isLivePriceBarEnabled } from './livePrice';

afterEach(() => vi.unstubAllEnvs());

const PRZELACZNIKI: [string, string, (raw?: unknown) => boolean][] = [
  ['isCalcNewUiEnabled', 'VITE_MM_CALC_NEW_UI', isCalcNewUiEnabled],
  ['isConfigPreviewEnabled', 'VITE_MM_CONFIG_PREVIEW', isConfigPreviewEnabled],
  ['isConfigLinkEnabled', 'VITE_MM_CONFIG_LINK', isConfigLinkEnabled],
];

// Formy ataku Z3 (fail-closed): każda = wyłączony; dozwolony bliźniak: dokładnie '1'.
const ATAKI: unknown[] = [
  undefined,
  null,
  '',
  ' 1',
  '1 ',
  'true',
  'TRUE',
  'yes',
  1,
  '01',
  true,
  '0',
];

describe.each(PRZELACZNIKI)('MIX-1898 %s (%s)', (_nazwa, zmienna, fn) => {
  it('własna zmienna undefined, LIVE_PRICE_BAR="1" → false (bez dziedziczenia)', () => {
    vi.stubEnv(zmienna, undefined);
    vi.stubEnv('VITE_MM_LIVE_PRICE_BAR', '1');
    expect(import.meta.env[zmienna]).toBeUndefined();
    expect(isLivePriceBarEnabled()).toBe(true); // świadek: podstawienie zadziałało
    expect(fn(undefined)).toBe(false);
    expect(fn()).toBe(false);
  });

  it('dokładnie "1" → true (argument i zmienna środowiska), także przy LIVE_PRICE_BAR pustym', () => {
    vi.stubEnv('VITE_MM_LIVE_PRICE_BAR', '');
    expect(fn('1')).toBe(true);
    vi.stubEnv(zmienna, '1');
    expect(fn()).toBe(true);
  });

  it.each(ATAKI.map((v) => [String(v) + ':' + typeof v, v]))(
    'forma ataku %s → false (także przy LIVE_PRICE_BAR="1")',
    (_opis, v) => {
      vi.stubEnv('VITE_MM_LIVE_PRICE_BAR', '1');
      expect(fn(v)).toBe(false);
    },
  );

  // MIX-1902 (uwaga 1 werdyktu MIX-1898): formy obiektowe. Luźne `raw == '1'` i `valueOf()`
  // przyjęłyby je jako '1'; świadek pokazuje, że luźne porównanie naprawdę je przepuszcza.
  it.each([
    ["new String('1')", new String('1')],
    ["['1']", ['1']],
  ] as [string, unknown][])(
    'forma obiektowa %s → false (także przy LIVE_PRICE_BAR="1")',
    (_opis, v) => {
      expect(v == '1').toBe(true); // świadek: luźne porównanie uznałoby tę formę za '1'
      vi.stubEnv('VITE_MM_LIVE_PRICE_BAR', '1');
      expect(fn(v)).toBe(false);
    },
  );

  it('zmienna środowiska "true" / "" → false', () => {
    vi.stubEnv('VITE_MM_LIVE_PRICE_BAR', '1');
    for (const v of ['true', '']) {
      vi.stubEnv(zmienna, v);
      expect(fn(), v).toBe(false);
    }
  });
});
