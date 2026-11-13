import { describe, expect, it, vi } from 'vitest';

/**
 * MIX-1300 (mutant V8 z MIX-1253): index.tsx musi rejestrowac raportowanie Core Web Vitals,
 * w tym onCLS (poprawka CLS x1000 jest bez sensu, gdy CLS nie jest w ogole rejestrowany).
 * Import calego index.tsx z podmienionymi zaleznosciami ciezkimi (render, App, narzedzia DEV).
 */
const h = vi.hoisted(() => ({
  onCLS: vi.fn(),
  onINP: vi.fn(),
  onLCP: vi.fn(),
  onFCP: vi.fn(),
  onTTFB: vi.fn(),
  render: vi.fn(),
}));

vi.mock('web-vitals', () => ({
  onCLS: h.onCLS,
  onINP: h.onINP,
  onLCP: h.onLCP,
  onFCP: h.onFCP,
  onTTFB: h.onTTFB,
}));
vi.mock('react-dom/client', () => {
  const createRoot = () => ({ render: h.render });
  return { default: { createRoot }, createRoot };
});
vi.mock('@/App', () => ({ default: () => null }));
vi.mock('@/utils/chunkReload', () => ({ installChunkReloadHandler: vi.fn() }));
vi.mock('@/utils/errorReporter', () => ({ installGlobalErrorHandlers: vi.fn() }));
vi.mock('@/config/routes', () => ({ preloadRoute: vi.fn(() => Promise.resolve()) }));
vi.mock('react-scan', () => ({ scan: vi.fn() }));
vi.mock('@axe-core/react', () => ({ default: vi.fn() }));

describe('index.tsx — rejestracja web-vitals', () => {
  it('rejestruje reportWebVitals dla CLS, LCP, INP, FCP i TTFB', async () => {
    document.body.innerHTML = '<div id="root"></div>';
    const { reportWebVitals } = await import('@/utils/webVitals');
    await import('@/index');
    for (const on of [h.onCLS, h.onLCP, h.onINP, h.onFCP, h.onTTFB]) {
      expect(on).toHaveBeenCalledTimes(1);
      expect(on).toHaveBeenCalledWith(reportWebVitals);
    }
    await vi.waitFor(() => expect(h.render).toHaveBeenCalledTimes(1));
  });
});
