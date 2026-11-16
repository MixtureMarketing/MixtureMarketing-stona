// MIX-1799 (uwaga Z6, K2): przycisk ciasteczek (`fixed`) chowa się, gdy przewijany podgląd
// konfiguracji nachodzi na niego, i wraca, gdy podgląd zjedzie. Prostokąty są atrapami (jsdom nie
// ma układu); ten sam pomiar w prawdziwej przeglądarce: .bieg/m1799/probe.mjs (390/1024/1366 px).
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import ConfigPreview from './ConfigPreview';
import ConfigLinkButtons from './ConfigLinkButtons';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const rect = (x: number, y: number, w: number, h: number) =>
  ({
    x,
    y,
    left: x,
    top: y,
    right: x + w,
    bottom: y + h,
    width: w,
    height: h,
    toJSON: () => ({}),
  }) as DOMRect;

let previewRect = rect(24, 100, 340, 300);
let linkRect = rect(24, 100, 340, 120);
let cookieRect = rect(16, 778, 50, 50); // 390×844: bottom 1rem, 50 px

function mount(cookies = 1) {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    if (this.matches('[data-testid="config-preview"]')) return previewRect;
    if (this.matches('[data-testid="config-link"]')) return linkRect;
    if (this.matches('.cookie-floating-btn')) return cookieRect;
    return rect(0, 0, 0, 0);
  });
  const btns = Array.from({ length: cookies }, () => {
    const b = document.createElement('button');
    b.className = 'cookie-floating-btn';
    document.body.appendChild(b);
    return b;
  });
  const view = render(
    <ConfigPreview goal="sklep" scope={[{ client_name: 'SEO', client_description: 'Opis' }]} />,
  );
  return { btns, view };
}
const scrollTo = async (r: DOMRect) => {
  previewRect = r;
  await act(async () => {
    window.dispatchEvent(new Event('scroll'));
    await new Promise((res) => requestAnimationFrame(() => res(null)));
  });
};
const flag = () => document.body.dataset.configPreviewCookie;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.querySelectorAll('.cookie-floating-btn').forEach((e) => e.remove());
  previewRect = rect(24, 100, 340, 300);
  cookieRect = rect(16, 778, 50, 50);
  linkRect = rect(24, 100, 340, 120);
});

describe('podgląd a przycisk ciasteczek', () => {
  it('nie nachodzi = brak znacznika; nachodzi (dół podglądu pod przyciskiem) = znacznik; zjechał = zdjęty', async () => {
    mount();
    expect(flag()).toBeUndefined(); // podgląd 100–400, przycisk 778–828
    await scrollTo(rect(24, 600, 340, 300)); // podgląd 600–900 przykrywa przycisk 778–828
    expect(flag()).toBe('true');
    await scrollTo(rect(24, -100, 340, 300)); // podgląd -100–200, nad przyciskiem
    expect(flag()).toBeUndefined();
  });

  it('podgląd bokiem od przycisku (inna kolumna, desktop) = bez znacznika; bliźniak: ten sam y, nałożony x = znacznik', async () => {
    mount();
    await scrollTo(rect(300, 700, 340, 300)); // x 300–640, przycisk x 16–66
    expect(flag()).toBeUndefined();
    await scrollTo(rect(40, 700, 340, 300));
    expect(flag()).toBe('true');
  });

  it('przycisk bez prostokąta (display:none, wersja prerenderowana) nie wyzwala znacznika; bliźniak: widoczny wyzwala', async () => {
    mount();
    cookieRect = rect(30, 790, 0, 0); // punkt w środku podglądu, ale bez pola
    await scrollTo(rect(24, 700, 340, 300));
    expect(flag()).toBeUndefined();
    cookieRect = rect(16, 778, 50, 50);
    await scrollTo(rect(24, 701, 340, 300));
    expect(flag()).toBe('true');
  });

  it('odmontowanie podglądu zdejmuje znacznik (przycisk wraca)', async () => {
    const { view } = mount();
    await scrollTo(rect(24, 700, 340, 300));
    expect(flag()).toBe('true');
    view.unmount();
    expect(flag()).toBeUndefined();
  });
});

describe('reguła CSS chowania przycisku ciasteczek', () => {
  it('index.css chowa .cookie-floating-btn przy znaczniku z podglądu (visibility, pointer-events)', () => {
    const css = fs.readFileSync(path.join(HERE, '../../../index.css'), 'utf8');
    const m = css.match(
      /body\[data-config-preview-cookie='true'\]\s+\.cookie-floating-btn,\s*body\[data-config-link-cookie='true'\]\s+\.cookie-floating-btn\s*\{([^}]*)\}/,
    );
    expect(m).not.toBeNull();
    expect(m![1]).toMatch(/visibility:\s*hidden/);
    expect(m![1]).toMatch(/pointer-events:\s*none/);
  });
});

describe('przyciski linku a przycisk ciasteczek (700 px² na 390 px)', () => {
  it('przyciski linku pod przyciskiem = znacznik linku; nad nim = zdjęty; bliźniak: podgląd ma własny znacznik', async () => {
    mount();
    render(<ConfigLinkButtons link="https://x.pl/wycena/?k=abc" />);
    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
      await new Promise((res) => requestAnimationFrame(() => res(null)));
    });
    expect(document.body.dataset.configLinkCookie).toBeUndefined(); // 100–220 nad przyciskiem 778
    linkRect = rect(24, 760, 340, 120);
    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
      await new Promise((res) => requestAnimationFrame(() => res(null)));
    });
    expect(document.body.dataset.configLinkCookie).toBe('true');
    expect(document.body.dataset.configPreviewCookie).toBeUndefined(); // podgląd 100–400
  });
});
