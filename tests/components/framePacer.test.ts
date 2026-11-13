import { describe, it, expect } from 'vitest';
import { createFramePacer } from '../../components/visuals/hero/framePacer';

/** Symuluje rAF o danej częstotliwości (z opcjonalnym jitterem) przez `ms` ms. */
function simulate(fps: number, hz: number, ms: number, jitter: (i: number) => number = () => 0) {
  const pacer = createFramePacer(fps);
  const frame = 1000 / hz;
  let draws = 0;
  let clock = 0;
  const t0 = 1000;
  let t = t0;
  for (let i = 0; t - t0 <= ms; i++) {
    const step = pacer.tick(t);
    if (step !== null) {
      draws++;
      clock += step;
    }
    t += frame + jitter(i);
  }
  return { draws, clock, elapsed: t - frame - t0 };
}

describe('framePacer: limit 60 fps na każdym odświeżaniu ekranu (MIX-1470)', () => {
  it('60 Hz: rysuje każdą klatkę rAF (bez spadku do 30 fps)', () => {
    const { draws } = simulate(60, 60, 1000);
    expect(draws).toBeGreaterThanOrEqual(60);
    expect(draws).toBeLessThanOrEqual(61);
  });

  it('120 Hz (Chrome, ProMotion): najwyżej 60 klatek na sekundę, nie 120', () => {
    const { draws } = simulate(60, 120, 1000);
    expect(draws).toBeGreaterThanOrEqual(59);
    expect(draws).toBeLessThanOrEqual(61);
  });

  it('144 Hz: średnio nie więcej niż 60 fps', () => {
    const { draws } = simulate(60, 144, 2000);
    expect(draws).toBeLessThanOrEqual(121);
    expect(draws).toBeGreaterThanOrEqual(100);
  });

  it('tempo animacji przy 60 i 120 Hz jest takie samo (zegar = czas rzeczywisty)', () => {
    const a = simulate(60, 60, 3000);
    const b = simulate(60, 120, 3000);
    // Zegar po 3 s różni się najwyżej o jedną klatkę 60 Hz, i każdy jest bliski 3000 ms.
    expect(Math.abs(a.clock - b.clock)).toBeLessThanOrEqual(1000 / 60 + 0.01);
    expect(a.clock).toBeGreaterThan(3000 - 1000 / 60 - 0.01);
    expect(b.clock).toBeGreaterThan(3000 - 1000 / 60 - 0.01);
    expect(b.clock).toBeLessThanOrEqual(b.elapsed + 0.01);
  });

  it('jitter vsync 60 Hz (16,2/17,1 ms) nie gubi klatek', () => {
    const { draws } = simulate(60, 60, 1000, (i) => (i % 2 ? 0.45 : -0.45));
    expect(draws).toBeGreaterThanOrEqual(59);
  });

  it('lowPower 30 fps: przy 60 Hz co druga klatka, przy 120 Hz też 30 fps', () => {
    expect(simulate(30, 60, 1000).draws).toBeLessThanOrEqual(31);
    expect(simulate(30, 60, 1000).draws).toBeGreaterThanOrEqual(29);
    expect(simulate(30, 120, 1000).draws).toBeLessThanOrEqual(31);
  });

  it('wolny ekran (30 Hz) nie jest dodatkowo przycinany: każda klatka się rysuje', () => {
    const { draws, clock } = simulate(60, 30, 1000);
    expect(draws).toBeGreaterThanOrEqual(30);
    expect(clock).toBeGreaterThan(960);
  });

  it('pierwsza klatka po starcie i po reset() rysuje się od razu z krokiem 0', () => {
    const pacer = createFramePacer(60);
    expect(pacer.tick(500)).toBe(0);
    expect(pacer.tick(508.3)).toBeNull(); // 8,3 ms przy 120 Hz: pominięta
    expect(pacer.tick(516.7)).toBeCloseTo(16.7, 5);
    pacer.reset();
    // Po pauzie (np. 5 s scrolla) brak skoku zegara: krok 0, nie 5000 ms.
    expect(pacer.tick(5516.7)).toBe(0);
  });

  it('po długiej klatce (przycięta karta) nie ma serii klatek nadrabiających', () => {
    const pacer = createFramePacer(60);
    pacer.tick(0);
    expect(pacer.tick(200)).toBeCloseTo(200, 5); // jedna długa klatka
    // Następne klatki 120 Hz: znów najwyżej co druga, bez nadrabiania zaległości.
    const next = [208.33, 216.67, 225, 233.33].map((t) => pacer.tick(t));
    expect(next.filter((s) => s !== null).length).toBeLessThanOrEqual(2);
  });
});
