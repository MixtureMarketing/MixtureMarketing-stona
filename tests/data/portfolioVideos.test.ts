/**
 * MIX-1873/MIX-1884: pliki filmów z mapy `data/portfolioVideos.ts` istnieją w public/, mieszczą się w limitach
 * wagi (podgląd ≤ 500 kB, komputer ≤ 1,5 MB, telefon ≤ 0,5 MB, pionowy ≤ 0,5 MB), są MP4 (H.264) i WebM,
 * nie mają dźwięku (brak ścieżki audio sprawdzany po znacznikach kontenera), a wymiary w mapie zgadzają
 * się z metadanymi pliku (nagłówek `tkhd` w MP4, elementy PixelWidth/PixelHeight w WebM).
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  PORTFOLIO_VIDEOS,
  VIDEO_BYTE_LIMITS,
  landscapeVideoFor,
  portraitVideoFor,
  portfolioVideoFor,
  type PortfolioVideo,
  type PortfolioVideoVariant,
} from '@/data/portfolioVideos';

const root = path.resolve(__dirname, '..', '..');
const file = (p: string) => path.join(root, 'public', p);

type Kind = 'preview' | 'desktop' | 'mobile' | 'portrait';
const KINDS: Kind[] = ['preview', 'desktop', 'mobile', 'portrait'];

const rows = Object.entries(PORTFOLIO_VIDEOS).flatMap(([slug, v]) =>
  KINDS.flatMap((kind) => {
    const variant: PortfolioVideoVariant | undefined = v[kind];
    if (!variant) return [];
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

describe('pliki filmów portfolio', () => {
  it('mapa nie jest pusta (kontrola samego testu)', () => expect(rows.length).toBeGreaterThan(0));

  it('limity z kryterium: podgląd 500 kB, komputer 1,5 MB, telefon 0,5 MB, pionowy 0,5 MB', () =>
    expect(VIDEO_BYTE_LIMITS).toEqual({
      preview: 512000,
      desktop: 1572864,
      mobile: 524288,
      portrait: 524288,
    }));

  it('Glampspace: komplet wariantów poziomych 960×540, 1280×720, 720×406 (jak Try Dive)', () => {
    const g = PORTFOLIO_VIDEOS['glamspace'];
    expect(g.portrait).toBeUndefined();
    expect([g.preview, g.desktop, g.mobile].map((v) => `${v?.width}×${v?.height}`)).toEqual([
      '960×540',
      '1280×720',
      '720×406',
    ]);
    expect(g.preview?.webm).toBe('/portfolio/video/glamspace-960.webm');
    expect(g.desktop?.mp4).toBe('/portfolio/video/glamspace-1280.mp4');
    expect(g.mobile?.webm).toBe('/portfolio/video/glamspace-720.webm');
    expect(landscapeVideoFor('glamspace')).not.toBeNull();
    expect(portraitVideoFor('glamspace')).toBeNull();
  });

  it('Impackt: tylko wariant pionowy 540×960, bez wariantów poziomych', () => {
    const i = PORTFOLIO_VIDEOS['impackt-edu'];
    expect(Object.keys(i)).toEqual(['portrait']);
    expect(`${i.portrait?.width}×${i.portrait?.height}`).toBe('540×960');
    expect(i.portrait?.webm).toBe('/portfolio/video/impackt-edu-540.webm');
    expect(i.portrait?.mp4).toBe('/portfolio/video/impackt-edu-540.mp4');
    expect(portraitVideoFor('impackt-edu')).toBe(i.portrait);
    expect(landscapeVideoFor('impackt-edu')).toBeNull();
  });

  it('każdy wpis ma komplet poziomy albo żaden; inne slugi i klucze prototypu = null', () => {
    for (const [slug, v] of Object.entries(PORTFOLIO_VIDEOS)) {
      const n = [v.preview, v.desktop, v.mobile].filter(Boolean).length;
      expect([0, 3], slug).toContain(n);
      expect(n === 3 || v.portrait, slug).toBeTruthy();
    }
    for (const s of ['inny-projekt', '', undefined, null, '__proto__', 'constructor']) {
      expect(portfolioVideoFor(s)).toBeNull();
      expect(landscapeVideoFor(s)).toBeNull();
      expect(portraitVideoFor(s)).toBeNull();
    }
  });

  it('wpis z niepełnym kompletem poziomym nie daje wariantów poziomych (lista i hero bez filmu)', () => {
    const map = PORTFOLIO_VIDEOS as Record<string, PortfolioVideo>;
    const real = PORTFOLIO_VIDEOS['glamspace'];
    map['tmp-niepelny'] = { preview: real.preview, portrait: real.preview };
    try {
      expect(landscapeVideoFor('tmp-niepelny')).toBeNull();
      expect(portraitVideoFor('tmp-niepelny')).toBe(real.preview);
      map['tmp-niepelny'] = { preview: real.preview, desktop: real.desktop };
      expect(landscapeVideoFor('tmp-niepelny')).toBeNull();
      map['tmp-niepelny'] = { ...real };
      expect(landscapeVideoFor('tmp-niepelny')).toEqual(real);
    } finally {
      delete map['tmp-niepelny'];
    }
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
