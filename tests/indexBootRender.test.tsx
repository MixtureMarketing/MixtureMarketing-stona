import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * MIX-1565 (TBT): index.tsx oddaje pierwszy render do renderBoot z flagą „start z prerenderu”:
 * prawda tylko dla niepustego #root poza prerenderem (Puppeteer) — wtedy render idzie
 * w kawałkach (startTransition). Pusty #root (dev) i prerender: zwykły render.
 */
const h = vi.hoisted(() => ({ renderBoot: vi.fn(), render: vi.fn() }));

vi.mock('@/utils/bootRender', () => ({ renderBoot: h.renderBoot }));
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

afterEach(() => {
  vi.resetModules();
  h.renderBoot.mockClear();
  delete (window as { isPrerendering?: boolean }).isPrerendering;
  document.body.innerHTML = '';
});

const boot = async (html: string, prerendering = false) => {
  document.body.innerHTML = html;
  if (prerendering) (window as { isPrerendering?: boolean }).isPrerendering = true;
  await import('@/index');
  await vi.waitFor(() => expect(h.renderBoot).toHaveBeenCalledTimes(1));
  return h.renderBoot.mock.calls[0];
};

describe('index.tsx — pierwszy render przez renderBoot', () => {
  it('niepusty #root (zrzut prerenderu) → renderBoot(..., true)', async () => {
    const [root, node, fromPrerender] = await boot('<div id="root"><main>zrzut</main></div>');
    expect(root).toHaveProperty('render');
    expect(node).toBeTruthy();
    expect(fromPrerender).toBe(true);
    expect(h.render).not.toHaveBeenCalled();
  });

  it('pusty #root (dev) → renderBoot(..., false)', async () => {
    const [, , fromPrerender] = await boot('<div id="root"></div>');
    expect(fromPrerender).toBe(false);
  });

  it('prerender (window.isPrerendering) mimo treści w #root → renderBoot(..., false)', async () => {
    const [, , fromPrerender] = await boot('<div id="root"><main>zrzut</main></div>', true);
    expect(fromPrerender).toBe(false);
  });
});
