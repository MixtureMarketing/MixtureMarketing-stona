import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { usePagePulse, PAGE_PULSE_ATTR } from '../../hooks/useSectionProgress';
import AmbientBackground from '../../components/common/AmbientBackground';
import WhyUs from '../../components/sections/WhyUs';
import LeadMagnet from '../../components/sections/LeadMagnet';

/**
 * Konsumenci pulsu strony (MIX-1470): każdy element, którego inline style czyta
 * var(--page-p), musi mieć atrybut konsumenta, bo usePagePulse pisze zmienną tylko
 * na [data-page-pulse]. Bez atrybutu warstwa przestaje dryfować bez żadnego błędu.
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

function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
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
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: 5000,
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
  for (const k of ['requestAnimationFrame', 'cancelAnimationFrame']) g[k] = saved[k];
});

function Page({ children }: { children: React.ReactNode }) {
  usePagePulse();
  return <MemoryRouter>{children}</MemoryRouter>;
}

/** Elementy, których inline style używa --page-p (atrybut style, nie klasa). */
function pulseUsers(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>('[style]')].filter((el) =>
    (el.getAttribute('style') ?? '').includes('var(--page-p'),
  );
}

const CONSUMERS: [string, React.FC][] = [
  ['AmbientBackground', AmbientBackground],
  ['WhyUs', WhyUs],
  ['LeadMagnet', LeadMagnet],
];

describe('konsumenci --page-p mają atrybut i dostają wartość (MIX-1470)', () => {
  it.each(CONSUMERS)('%s: warstwa z var(--page-p) jest konsumentem pulsu', (_name, C) => {
    const { container } = render(
      <Page>
        <C />
      </Page>,
    );
    const users = pulseUsers(container);
    expect(users.length).toBeGreaterThanOrEqual(1);
    for (const el of users) expect(el.matches(`[${PAGE_PULSE_ATTR}]`)).toBe(true);
    // Atrybut ma tylko warstwa, która zmiennej używa (bez zbędnych zapisów co klatkę).
    expect(container.querySelectorAll(`[${PAGE_PULSE_ATTR}]`).length).toBe(users.length);
  });

  it.each(CONSUMERS)('%s: po scrollu warstwa dostaje --page-p, :root nie', (_name, C) => {
    const { container } = render(
      <Page>
        <C />
      </Page>,
    );
    scrollTo(2000); // max = 5000 - 1000 → p = 0.5
    const users = pulseUsers(container);
    expect(users.length).toBeGreaterThanOrEqual(1);
    for (const el of users) expect(el.style.getPropertyValue('--page-p')).toBe('0.500');
    expect(document.documentElement.style.getPropertyValue('--page-p')).toBe('');
  });

  it('bliźniak negatywny: warstwa z var(--page-p) bez atrybutu nie dostaje wartości', () => {
    const { getByTestId } = render(
      <Page>
        <div data-testid="bez" style={{ transform: 'translateY(calc(var(--page-p, 0) * 1px))' }} />
      </Page>,
    );
    scrollTo(2000);
    expect(getByTestId('bez').style.getPropertyValue('--page-p')).toBe('');
  });
});
