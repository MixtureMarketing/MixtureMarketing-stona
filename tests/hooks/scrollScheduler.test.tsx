import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import { addScrollTask, usePagePulse, PAGE_PULSE_ATTR } from '../../hooks/useSectionProgress';
import { useScroll } from '../../hooks/useScroll';

/**
 * Wspólny scheduler scrolla (MIX-1470): jedna klatka rAF, najpierw wszystkie
 * odczyty, potem wszystkie zapisy; --page-p tylko na konsumentach (nie :root);
 * nawigacja (useScroll) w tym samym schedulerze, setState tylko przy zmianie.
 */
let rafQueue: Map<number, FrameRequestCallback>;
let rafSeq: number;
const g = globalThis as unknown as Record<string, unknown>;
const saved: Record<string, unknown> = {};

function flush() {
  const pending = [...rafQueue.values()];
  rafQueue.clear();
  for (const cb of pending) cb(performance.now());
}

function setScroll(y: number, scrollHeight = 5000) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: scrollHeight,
    configurable: true,
  });
}

function scrollTo(y: number) {
  setScroll(y);
  act(() => {
    window.dispatchEvent(new Event('scroll'));
    flush();
  });
}

beforeEach(() => {
  rafQueue = new Map();
  rafSeq = 0;
  for (const k of ['requestAnimationFrame', 'cancelAnimationFrame']) saved[k] = g[k];
  g.requestAnimationFrame = (cb: FrameRequestCallback) => {
    rafQueue.set(++rafSeq, cb);
    return rafSeq;
  };
  g.cancelAnimationFrame = (id: number) => rafQueue.delete(id);
  Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
  setScroll(0);
});

afterEach(() => {
  cleanup();
  for (const k of ['requestAnimationFrame', 'cancelAnimationFrame']) g[k] = saved[k];
});

describe('addScrollTask: READ → WRITE w jednej klatce', () => {
  it('wszystkie odczyty przed pierwszym zapisem, jeden rAF na wiele zadań', () => {
    const log: string[] = [];
    const offs = ['a', 'b', 'c'].map((id) =>
      addScrollTask(() => {
        log.push(`read-${id}`);
        return () => log.push(`write-${id}`);
      }),
    );
    expect(rafQueue.size).toBe(1); // trzy rejestracje = jedna klatka
    flush();
    expect(log).toEqual(['read-a', 'read-b', 'read-c', 'write-a', 'write-b', 'write-c']);

    log.length = 0;
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    expect(rafQueue.size).toBe(1); // seria scrolli w klatce = jeden rAF
    flush();
    expect(log.filter((l) => l.startsWith('read'))).toHaveLength(3);
    offs.forEach((off) => off());

    // Po wyrejestrowaniu wszystkich: listener zdjęty, scroll nie planuje klatek.
    window.dispatchEvent(new Event('scroll'));
    expect(rafQueue.size).toBe(0);
  });
});

function PulsePage() {
  usePagePulse();
  return (
    <div>
      <div data-testid="consumer" {...{ [PAGE_PULSE_ATTR]: '' }} />
      <div data-testid="other" />
    </div>
  );
}

describe('usePagePulse: --page-p tylko na konsumentach', () => {
  it('zapisuje zmienną na [data-page-pulse], nigdy na :root ani innych elementach', () => {
    const { getByTestId, unmount } = render(<PulsePage />);
    act(() => flush());
    scrollTo(2000); // max = 5000 - 1000 → p = 0.5
    const consumer = getByTestId('consumer');
    expect(consumer.style.getPropertyValue('--page-p')).toBe('0.500');
    expect(document.documentElement.style.getPropertyValue('--page-p')).toBe('');
    expect(getByTestId('other').style.getPropertyValue('--page-p')).toBe('');

    unmount();
    expect(consumer.style.getPropertyValue('--page-p')).toBe('');
  });

  it('leniwie dodany konsument dostaje bieżącą wartość w następnej klatce', () => {
    const { container } = render(<PulsePage />);
    scrollTo(4000); // p = 1
    const late = document.createElement('div');
    late.setAttribute(PAGE_PULSE_ATTR, '');
    container.appendChild(late);
    scrollTo(4000); // ta sama pozycja, ale nowy konsument
    expect(late.style.getPropertyValue('--page-p')).toBe('1.000');
  });
});

function NavProbe({ onRender }: { onRender: (s: ReturnType<typeof useScroll>) => void }) {
  const s = useScroll(20);
  onRender(s);
  return null;
}

describe('useScroll w schedulerze', () => {
  it('scrolled/kierunek zmieniają się na progu, bez renderu przy każdym pikselu', () => {
    const states: ReturnType<typeof useScroll>[] = [];
    render(<NavProbe onRender={(s) => states.push(s)} />);
    act(() => flush());
    const rendersAtTop = states.length;
    expect(states.at(-1)).toEqual({ scrolled: false, scrollDirection: 'up' });

    scrollTo(100);
    expect(states.at(-1)).toEqual({ scrolled: true, scrollDirection: 'down' });
    const afterFirst = states.length;
    expect(afterFirst).toBeGreaterThan(rendersAtTop);

    // Dalsze przewijanie w dół: stan bez zmian → zero nowych renderów.
    scrollTo(300);
    scrollTo(600);
    expect(states.length).toBe(afterFirst);

    scrollTo(500);
    expect(states.at(-1)).toEqual({ scrolled: true, scrollDirection: 'up' });
    scrollTo(10);
    expect(states.at(-1)).toEqual({ scrolled: false, scrollDirection: 'up' });
  });

  it('ruch poniżej 5 px nie przełącza kierunku', () => {
    const states: ReturnType<typeof useScroll>[] = [];
    render(<NavProbe onRender={(s) => states.push(s)} />);
    scrollTo(200);
    expect(states.at(-1)?.scrollDirection).toBe('down');
    scrollTo(197);
    expect(states.at(-1)?.scrollDirection).toBe('down');
  });
});
