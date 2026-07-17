import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadTurnstile,
  renderInvisibleTurnstile,
  getTurnstileToken,
  __resetTurnstileLoaderForTests,
  type TurnstileAPI,
} from './turnstile';

function fakeTurnstile(): TurnstileAPI {
  return {
    render: vi.fn(() => 'widget-1'),
    execute: vi.fn(),
    reset: vi.fn(),
    getResponse: vi.fn(() => 'tok-123'),
    remove: vi.fn(),
  };
}

describe('utils/turnstile — loader z jawnym renderem', () => {
  beforeEach(() => {
    __resetTurnstileLoaderForTests();
    document.head.querySelectorAll('#cf-turnstile-script').forEach((n) => n.remove());
    delete (window as { turnstile?: TurnstileAPI }).turnstile;
  });
  afterEach(() => vi.restoreAllMocks());

  it('wstrzykuje api.js RAZ (idempotentnie) — dwa wywołania = jeden <script>, ta sama obietnica', async () => {
    const p1 = loadTurnstile();
    const p2 = loadTurnstile();
    expect(p1).toBe(p2); // ta sama obietnica

    const scripts = document.head.querySelectorAll('#cf-turnstile-script');
    expect(scripts).toHaveLength(1);
    const script = scripts[0] as HTMLScriptElement;
    expect(script.src).toContain('render=explicit');
    expect(script.src).not.toContain('onload='); // klucz fixa: bez onload-callbacku

    // symuluj załadowanie skryptu + gotowość API
    (window as { turnstile?: TurnstileAPI }).turnstile = fakeTurnstile();
    script.onload?.(new Event('load'));

    await expect(p1).resolves.toBeDefined();
  });

  it('gdy window.turnstile już istnieje → resolve natychmiast, bez wstrzykiwania skryptu', async () => {
    (window as { turnstile?: TurnstileAPI }).turnstile = fakeTurnstile();
    await expect(loadTurnstile()).resolves.toBeDefined();
    expect(document.head.querySelectorAll('#cf-turnstile-script')).toHaveLength(0);
  });

  it('renderInvisibleTurnstile → turnstile.render z opcjami invisible + zwraca widgetId', async () => {
    const ts = fakeTurnstile();
    (window as { turnstile?: TurnstileAPI }).turnstile = ts;
    const container = document.createElement('div');
    const id = await renderInvisibleTurnstile(container, 'SITEKEY');
    expect(id).toBe('widget-1');
    expect(ts.render).toHaveBeenCalledWith(container, {
      sitekey: 'SITEKEY',
      size: 'invisible',
      execution: 'execute',
      appearance: 'interaction-only',
      language: 'pl',
    });
  });

  it('getTurnstileToken → reset+execute po widgetId, zwraca token', async () => {
    const ts = fakeTurnstile();
    (window as { turnstile?: TurnstileAPI }).turnstile = ts;
    await expect(getTurnstileToken('widget-1')).resolves.toBe('tok-123');
    expect(ts.reset).toHaveBeenCalledWith('widget-1');
    expect(ts.execute).toHaveBeenCalledWith('widget-1');
  });

  it('getTurnstileToken → TURNSTILE_TIMEOUT gdy brak tokenu', async () => {
    const ts = fakeTurnstile();
    ts.getResponse = vi.fn(() => undefined);
    (window as { turnstile?: TurnstileAPI }).turnstile = ts;
    await expect(getTurnstileToken('widget-1', 300)).rejects.toThrow('TURNSTILE_TIMEOUT');
  });
});
