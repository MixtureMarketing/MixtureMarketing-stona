import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
class IntersectionObserverMock implements IntersectionObserver {
  readonly callback: IntersectionObserverCallback;
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {
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
  takeRecords = vi.fn(() => []);
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// Mock Sanity
vi.mock('@sanity/client', () => ({
  createClient: vi.fn(() => ({
    fetch: vi.fn().mockResolvedValue([]),
  })),
}));

vi.mock('@sanity/image-url', () => ({
  default: vi.fn(() => ({
    image: vi.fn(() => ({
      width: vi.fn(() => ({
        height: vi.fn(() => ({
          url: vi.fn(() => 'test-image-url'),
        })),
      })),
    })),
  })),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.scrollTo = vi.fn();

// Mock document.fonts (jsdom go nie ma) — FlipDotHeading czeka na fonts.ready.
if (!('fonts' in document)) {
  Object.defineProperty(document, 'fonts', {
    value: { ready: Promise.resolve(), load: vi.fn().mockResolvedValue([]) },
  });
}

// Mock matchMedia (jsdom go nie ma) — hooki motion-safe (useSectionProgress,
// usePagePulse, FlipDotHeading, useCounter) czytają prefers-reduced-motion.
vi.stubGlobal(
  'matchMedia',
  vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
);
