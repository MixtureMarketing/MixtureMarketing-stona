/**
 * MIX-1873: pliki filmów z mapy `data/portfolioVideos.ts` istnieją w public/, mieszczą się w limitach
 * wagi (podgląd ≤ 500 kB, komputer ≤ 1,5 MB, telefon ≤ 0,5 MB), są MP4 (H.264) i WebM i nie mają dźwięku
 * (brak ścieżki audio sprawdzany po znacznikach kontenera).
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { PORTFOLIO_VIDEOS, VIDEO_BYTE_LIMITS } from '@/data/portfolioVideos';

const root = path.resolve(__dirname, '..', '..');
const file = (p: string) => path.join(root, 'public', p);

const rows = Object.entries(PORTFOLIO_VIDEOS).flatMap(([slug, v]) =>
  (['preview', 'desktop', 'mobile'] as const).flatMap((kind) =>
    (['webm', 'mp4'] as const).map((codec) => ({
      slug,
      kind,
      codec,
      src: v[kind][codec],
      limit: VIDEO_BYTE_LIMITS[kind],
    })),
  ),
);

describe('pliki filmów portfolio', () => {
  it('mapa nie jest pusta (kontrola samego testu)', () => expect(rows.length).toBeGreaterThan(0));

  it('limity z kryterium: podgląd 500 kB, komputer 1,5 MB, telefon 0,5 MB', () =>
    expect(VIDEO_BYTE_LIMITS).toEqual({ preview: 512000, desktop: 1572864, mobile: 524288 }));

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
});
