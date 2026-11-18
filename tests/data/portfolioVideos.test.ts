/**
 * MIX-1873/MIX-1896: pliki filmów z mapy `data/portfolioVideos.ts` istnieją w public/, mieszczą się w limitach
 * wagi (podgląd ≤ 500 kB, komputer ≤ 1,5 MB, telefon ≤ 0,5 MB), są MP4 (H.264) i WebM, nie mają dźwięku
 * (brak ścieżki audio sprawdzany po znacznikach kontenera), a wymiary w mapie zgadzają się z metadanymi
 * pliku (nagłówek `tkhd` w MP4, elementy PixelWidth/PixelHeight w WebM). Każdy wpis to komplet poziomy
 * `landscape('<base>')`; filmów pionowych (MIX-1884) nie ma ani w mapie, ani w `public/portfolio/video/`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import * as videosModule from '@/data/portfolioVideos';
import {
  PORTFOLIO_VIDEOS,
  VIDEO_BYTE_LIMITS,
  landscape,
  portfolioVideoFor,
  type PortfolioVideoVariant,
} from '@/data/portfolioVideos';

const root = path.resolve(__dirname, '..', '..');
const file = (p: string) => path.join(root, 'public', p);
const VIDEO_DIR = path.join(root, 'public', 'portfolio', 'video');

type Kind = 'preview' | 'desktop' | 'mobile';
const KINDS: Kind[] = ['preview', 'desktop', 'mobile'];

const rows = Object.entries(PORTFOLIO_VIDEOS).flatMap(([slug, v]) =>
  KINDS.flatMap((kind) => {
    const variant: PortfolioVideoVariant = v[kind];
    return (['webm', 'mp4'] as const).map((codec) => ({
      slug,
      kind,
      codec,
      src: variant[codec],
      width: variant.width,
      height: variant.height,
      limit: VIDEO_BYTE_LIMITS[kind],
    }));
  }),
);

/** Wymiary pliku z metadanych: MP4 = `tkhd` (16.16), WebM = PixelWidth (0xB0) i PixelHeight (0xBA). */
function hasDimensions(buf: Buffer, codec: 'webm' | 'mp4', w: number, h: number): boolean {
  const be16 = (n: number) => [(n >> 8) & 255, n & 255];
  const needle =
    codec === 'mp4'
      ? [...be16(w), 0, 0, ...be16(h), 0, 0]
      : [0xb0, 0x82, ...be16(w), 0xba, 0x82, ...be16(h)];
  return buf.includes(Buffer.from(needle));
}

describe('mapa filmów portfolio (MIX-1896: tylko komplety poziome)', () => {
  it('limity z kryterium: podgląd 500 kB, komputer 1,5 MB, telefon 0,5 MB (bez pionowego)', () =>
    expect(VIDEO_BYTE_LIMITS).toEqual({
      preview: 512000,
      desktop: 1572864,
      mobile: 524288,
    }));

  it("landscape('x'): x-{960,1280,720}.{webm,mp4}, wymiary 960×540, 1280×720, 720×406", () =>
    expect(landscape('x')).toEqual({
      preview: {
        webm: '/portfolio/video/x-960.webm',
        mp4: '/portfolio/video/x-960.mp4',
        width: 960,
        height: 540,
      },
      desktop: {
        webm: '/portfolio/video/x-1280.webm',
        mp4: '/portfolio/video/x-1280.mp4',
        width: 1280,
        height: 720,
      },
      mobile: {
        webm: '/portfolio/video/x-720.webm',
        mp4: '/portfolio/video/x-720.mp4',
        width: 720,
        height: 406,
      },
    }));

  it('Try Dive i Glampspace: komplety poziome z mapy', () => {
    expect(Object.keys(PORTFOLIO_VIDEOS).sort()).toEqual(['glamspace', 'try-dive-szkola-nurkowania']);
    expect(PORTFOLIO_VIDEOS['try-dive-szkola-nurkowania']).toEqual(landscape('try-dive'));
    expect(PORTFOLIO_VIDEOS['glamspace']).toEqual(landscape('glamspace'));
  });

  it('każdy wpis = dokładnie preview/desktop/mobile z landscape(<base>), żaden nie ma `portrait` ani plakatu', () => {
    for (const [slug, v] of Object.entries(PORTFOLIO_VIDEOS)) {
      expect(Object.keys(v).sort(), slug).toEqual(['desktop', 'mobile', 'preview']);
      expect(v, slug).not.toHaveProperty('portrait');
      const base = /^\/portfolio\/video\/(.+)-960\.webm$/.exec(v.preview.webm)?.[1];
      expect(base, slug).toBeTruthy();
      expect(v, slug).toEqual(landscape(base!));
      for (const kind of KINDS) expect(v[kind], `${slug} ${kind}`).not.toHaveProperty('poster');
    }
  });

  it('moduł mapy nie ma już pionu: brak portraitVideoFor, landscapeVideoFor, POSTER_BYTE_LIMIT', () => {
    const mod = videosModule as Record<string, unknown>;
    for (const k of ['portraitVideoFor', 'landscapeVideoFor', 'POSTER_BYTE_LIMIT'])
      expect(mod[k], k).toBeUndefined();
  });

  it('Impackt Edu: brak wpisu w mapie (samo zdjęcie)', () => {
    expect(Object.prototype.hasOwnProperty.call(PORTFOLIO_VIDEOS, 'impackt-edu')).toBe(false);
    expect(portfolioVideoFor('impackt-edu')).toBeNull();
  });

  it('inne slugi i klucze prototypu = null; wpis z mapy = ten sam obiekt', () => {
    for (const s of ['inny-projekt', '', undefined, null, '__proto__', 'constructor', 'toString'])
      expect(portfolioVideoFor(s)).toBeNull();
    expect(portfolioVideoFor('glamspace')).toBe(PORTFOLIO_VIDEOS['glamspace']);
  });
});

describe('pliki filmów portfolio', () => {
  it('mapa nie jest pusta (kontrola samego testu)', () => expect(rows.length).toBeGreaterThan(0));

  it('public/portfolio/video/: brak plików pionowych (*-540.*, impackt*)', () => {
    const names = fs.readdirSync(VIDEO_DIR);
    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((n) => /-540\.|impackt/i.test(n))).toEqual([]);
  });

  it('public/portfolio/video/ = dokładnie pliki z mapy (bez sierot)', () => {
    const fromMap = rows.map((r) => path.basename(r.src)).sort();
    expect(fs.readdirSync(VIDEO_DIR).sort()).toEqual(fromMap);
  });

  it.each(rows)('$slug $kind $codec: istnieje i ≤ limit', ({ src, limit }) => {
    expect(src.startsWith('/portfolio/video/')).toBe(true);
    const stat = fs.statSync(file(src));
    expect(stat.size).toBeGreaterThan(10 * 1024);
    expect(stat.size).toBeLessThanOrEqual(limit);
  });

  it.each(rows)(
    '$slug $kind $codec: właściwy kontener, wideo bez ścieżki audio',
    ({ src, codec }) => {
      const buf = fs.readFileSync(file(src));
      if (codec === 'mp4') {
        expect(buf.subarray(4, 8).toString('latin1')).toBe('ftyp');
        expect(buf.includes(Buffer.from('avc1'))).toBe(true); // H.264
        expect(buf.includes(Buffer.from('soun'))).toBe(false); // brak ścieżki dźwięku
      } else {
        expect(buf.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))).toBe(true); // EBML
        expect(buf.includes(Buffer.from('V_VP9'))).toBe(true);
        expect(buf.includes(Buffer.from('A_OPUS'))).toBe(false);
        expect(buf.includes(Buffer.from('A_VORBIS'))).toBe(false);
      }
    },
  );

  it.each(rows)('$slug $kind $codec: wymiary pliku = $width×$height z mapy', (r) => {
    expect(hasDimensions(fs.readFileSync(file(r.src)), r.codec, r.width, r.height)).toBe(true);
  });

  it('kontrola testu wymiarów: zły wymiar nie przechodzi', () => {
    const r = rows[0];
    const buf = fs.readFileSync(file(r.src));
    expect(hasDimensions(buf, r.codec, r.width + 2, r.height)).toBe(false);
  });
});
