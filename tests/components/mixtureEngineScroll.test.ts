import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startMixture } from '../../components/visuals/hero/mixtureEngine';

/**
 * Silnik hero (MIX-1470): limit 60 fps także przy rAF 120 Hz, pauza w trakcie
 * przewijania i wznowienie po nim; reduced-motion bez zmian (jedna statyczna klatka).
 * Canvas 2D w jsdom nie istnieje: kontekst to atrapa liczącą clearRect (= jedna klatka).
 */
let rafQueue: Map<number, FrameRequestCallback>;
let rafSeq: number;
let draws: number;

function fakeCanvas() {
  const gradient = { addColorStop: () => undefined };
  const ctx = new Proxy({} as Record<string | symbol, unknown>, {
    get(target, prop) {
      if (prop === 'clearRect') return () => void draws++;
      if (prop in target) return target[prop];
      return () => gradient;
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
  });
  const canvas = document.createElement('canvas');
  canvas.getContext = (() => ctx) as unknown as HTMLCanvasElement['getContext'];
  return canvas;
}

/** Odpala wszystkie czekające callbacki rAF z czasem t. */
function flush(t: number) {
  const pending = [...rafQueue.values()];
  rafQueue.clear();
  for (const cb of pending) cb(t);
}

/** `ms` ms klatek rAF o częstotliwości hz, od chwili t0; zwraca czas po ostatniej. */
function runFrames(t0: number, hz: number, ms: number) {
  let t = t0;
  for (; t < t0 + ms; t += 1000 / hz) flush(t);
  return t;
}

const g = globalThis as unknown as Record<string, unknown>;
const saved: Record<string, unknown> = {};
const STUBBED = ['requestAnimationFrame', 'cancelAnimationFrame', 'ResizeObserver'];

beforeEach(() => {
  rafQueue = new Map();
  rafSeq = 0;
  draws = 0;
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  for (const k of STUBBED) saved[k] = g[k];
  g.requestAnimationFrame = (cb: FrameRequestCallback) => {
    rafQueue.set(++rafSeq, cb);
    return rafSeq;
  };
  g.cancelAnimationFrame = (id: number) => rafQueue.delete(id);
  g.ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
});

afterEach(() => {
  vi.useRealTimers();
  // Bez vi.unstubAllGlobals: zdjęłoby też stuby z tests/setup.ts (IntersectionObserver, matchMedia).
  for (const k of STUBBED) g[k] = saved[k];
});

describe('mixtureEngine: klatki i przewijanie (MIX-1470)', () => {
  it('rAF 120 Hz: najwyżej ~60 narysowanych klatek na sekundę', () => {
    const h = startMixture(fakeCanvas(), { reducedMotion: false });
    const t0 = performance.now();
    runFrames(t0, 120, 1000);
    expect(draws).toBeGreaterThanOrEqual(55);
    expect(draws).toBeLessThanOrEqual(62);
    h.destroy();
  });

  it('rAF 60 Hz: rysuje każdą klatkę (~60 na sekundę)', () => {
    const h = startMixture(fakeCanvas(), { reducedMotion: false });
    runFrames(performance.now(), 60, 1000);
    expect(draws).toBeGreaterThanOrEqual(58);
    h.destroy();
  });

  it('scroll zatrzymuje pętlę; 150 ms po ostatnim scrollu scena rusza dalej', () => {
    const h = startMixture(fakeCanvas(), { reducedMotion: false });
    let t = runFrames(performance.now(), 60, 200);
    const before = draws;
    expect(before).toBeGreaterThan(5);

    window.dispatchEvent(new Event('scroll'));
    t = runFrames(t, 60, 100);
    window.dispatchEvent(new Event('scroll')); // dalsze przewijanie przedłuża pauzę
    vi.advanceTimersByTime(100);
    // wheel w trakcie przewijania nie budzi pętli
    window.dispatchEvent(new Event('wheel'));
    t = runFrames(t, 60, 100);
    expect(draws).toBe(before);
    expect(rafQueue.size).toBe(0);

    vi.advanceTimersByTime(60); // 160 ms od ostatniego scrolla
    expect(rafQueue.size).toBe(1);
    runFrames(t, 60, 200);
    expect(draws).toBeGreaterThan(before + 5);
    h.destroy();
  });

  it('destroy w trakcie pauzy scrolla: timer nie wznawia pętli', () => {
    const h = startMixture(fakeCanvas(), { reducedMotion: false });
    runFrames(performance.now(), 60, 50);
    window.dispatchEvent(new Event('scroll'));
    h.destroy();
    vi.advanceTimersByTime(500);
    expect(rafQueue.size).toBe(0);
  });

  // Tempo bezwzględne przez publiczne API: fala kliknięcia żyje WAVE.life = 1,7 s czasu sceny;
  // przy znaczniku rAF 7 s po ostatniej interakcji pętla staje w pierwszej klatce bez fali.
  // Czas do zatrzymania = 1,7 s rzeczywistego czasu zarówno przy 60, jak i 120 Hz.
  it.each([60, 120])('tempo sceny przy %i Hz = czas rzeczywisty (fala gaśnie po ~1,7 s)', (hz) => {
    const h = startMixture(fakeCanvas(), { reducedMotion: false });
    h.pulse(10, 10);
    const base = performance.now() + 7000;
    let t = base;
    while (rafQueue.size > 0 && t < base + 5000) {
      flush(t);
      t += 1000 / hz;
    }
    const elapsed = t - base;
    expect(elapsed).toBeGreaterThan(1700 - 40);
    expect(elapsed).toBeLessThan(1700 + 60);
    h.destroy();
  });

  it('reduced motion: jedna statyczna klatka, scroll niczego nie uruchamia', () => {
    const h = startMixture(fakeCanvas(), { reducedMotion: true });
    expect(draws).toBe(1);
    expect(rafQueue.size).toBe(0);
    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(500);
    expect(rafQueue.size).toBe(0);
    expect(draws).toBe(1);
    h.destroy();
  });
});
