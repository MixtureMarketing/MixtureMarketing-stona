/* eslint-disable @typescript-eslint/no-unused-vars */
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
class IntersectionObserverMock {
  readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
  }

  observe = vi.fn((element: Element) => {
    // Trigger the callback immediately with a fake entry
    const entry = {
      isIntersecting: true,
      target: element,
      boundingClientRect: element.getBoundingClientRect(),
      intersectionRatio: 1,
      intersectionRect: element.getBoundingClientRect(),
      rootBounds: null,
      time: Date.now(),
    } as unknown as IntersectionObserverEntry;

    this.callback([entry], this);
  });
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn();
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.scrollTo = vi.fn();
