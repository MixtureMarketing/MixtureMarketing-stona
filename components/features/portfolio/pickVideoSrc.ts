import type { PortfolioVideoVariant } from '@/data/portfolioVideos';

/**
 * Jedno źródło zamiast `<source>`: błąd wczytania trafia wtedy na `<video>` (zdarzenie `error`),
 * więc zdjęcie zostaje bez komunikatu. WebM (VP9), gdy przeglądarka go odtworzy, inaczej MP4 (H.264).
 */
export function pickVideoSrc(el: HTMLVideoElement, v: PortfolioVideoVariant): string {
  let webm = '';
  try {
    webm = el.canPlayType('video/webm; codecs="vp9"');
  } catch {
    webm = '';
  }
  return webm ? v.webm : v.mp4;
}
