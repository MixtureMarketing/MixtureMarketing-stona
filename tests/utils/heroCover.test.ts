import { afterEach, describe, expect, it, vi } from 'vitest';
import { HERO_TAKEOVER_MEDIA, heroCoverAt } from '@/utils/heroCover';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Regresja (audyt renderowania 2026-10-24): `--cover` liczono także wtedy, gdy hero NIE jest
 * przypięty (telefon, tablet, niskie okno). Na 390 px pas „Wybrane realizacje" na
 * /web-development/ gasł do opacity 0 po ~250 px przewinięcia — zanim w całości wjechał w kadr.
 */
const mockMedia = (matches: boolean) => {
  const spy = vi.fn((query: string) => ({ matches, media: query }) as unknown as MediaQueryList);
  vi.stubGlobal('matchMedia', spy);
  return spy;
};

describe('heroCoverAt', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('hero przypięty (desktop): pokrycie rośnie z krawędzią arkusza', () => {
    const spy = mockMedia(true);
    expect(heroCoverAt(900, 900)).toBe(0);
    expect(heroCoverAt(450, 900)).toBe(0.5);
    expect(heroCoverAt(-50, 900)).toBe(1);
    expect(spy).toHaveBeenCalledWith(HERO_TAKEOVER_MEDIA);
  });

  it('hero nieprzypięty (mobile / niskie okno): zawsze 0 — treść hero nie gaśnie', () => {
    mockMedia(false);
    expect(heroCoverAt(200, 844)).toBe(0);
    expect(heroCoverAt(-100, 844)).toBe(0);
  });

  it('warunek JS jest identyczny z @media przypięcia .hero-pin w index.css', () => {
    const css = fs.readFileSync(path.resolve(__dirname, '../../index.css'), 'utf8');
    const block = css.match(/@media ([^{]+)\{\s*\.hero-runway/);
    expect(block?.[1].trim()).toBe(HERO_TAKEOVER_MEDIA);
  });
});
