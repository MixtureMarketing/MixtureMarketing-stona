/**
 * Limit klatek pętli canvas niezależny od odświeżania ekranu (MIX-1470).
 *
 * Chrome na ekranach 120 Hz (ProMotion) woła rAF 120 razy na sekundę, Safari 60:
 * bez limitu scena rysowała się dwa razy częściej w Chrome. Pacer przepuszcza
 * najwyżej `fps` klatek na sekundę na KAŻDEJ częstotliwości (60/90/120/144 Hz),
 * a krok zegara to rzeczywisty czas od poprzedniej narysowanej klatki, więc tempo
 * animacji jest takie samo przy 60 i 120 Hz.
 *
 * Akumulator: klatka jest rysowana, gdy od ostatniej uzbierało się co najmniej
 * `1000/fps - slackMs` ms; reszta przechodzi dalej, ale nigdy na plus (bez serii
 * klatek po przycięciu karty), więc średnio ≤ fps. Margines `slackMs` sprawia,
 * że jitter vsync 60 Hz nie spycha sceny do 30 fps.
 */
export interface FramePacer {
  /**
   * Wołane w każdym callbacku rAF. Zwraca krok zegara w ms (0 dla pierwszej
   * klatki po starcie), gdy klatkę należy narysować, albo null, gdy ją pominąć.
   */
  tick(tMs: number): number | null;
  /** Po pauzie/wznowieniu: następna klatka rysuje się od razu, bez skoku zegara. */
  reset(): void;
}

export function createFramePacer(fps: number, slackMs = 4): FramePacer {
  const interval = 1000 / fps;
  const threshold = interval - slackMs;
  let started = false;
  let lastT = 0;
  let acc = 0;
  let sinceDraw = 0;

  return {
    tick(tMs) {
      if (!started) {
        started = true;
        lastT = tMs;
        acc = 0;
        sinceDraw = 0;
        return 0;
      }
      const dt = Math.max(0, tMs - lastT);
      lastT = tMs;
      acc += dt;
      sinceDraw += dt;
      if (acc < threshold) return null;
      acc = Math.min(acc - interval, 0);
      const step = sinceDraw;
      sinceDraw = 0;
      return step;
    },
    reset() {
      started = false;
    },
  };
}
