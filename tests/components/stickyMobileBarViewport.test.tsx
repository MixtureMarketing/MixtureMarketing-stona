import React, { useRef } from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import StickyMobileBar from '../../components/common/StickyMobileBar';

/**
 * MIX-2079: pasek „Darmowy audyt” stał w połowie ekranu iPhone'a (warstwa fixed liczona od
 * starej wysokości widoku). Pasek mierzy sondą `fixed bottom-0`, gdzie jest dół warstwy, i gdy
 * wisi nad dołem visualViewport, zjeżdża o lukę (style.bottom ujemny).
 */

let aboveIntersecting = false;
class IO {
  constructor(private cb: IntersectionObserverCallback) {}
  observe = (el: Element) =>
    this.cb([{ isIntersecting: aboveIntersecting, target: el } as IntersectionObserverEntry], this as never);
  disconnect = () => {};
  unobserve = () => {};
  takeRecords = () => [];
}

class FakeVV extends EventTarget {
  height = 844;
  offsetTop = 0;
  scale = 1;
}

let vv: FakeVV;
let probeTop = 844;
let probeBoxes = 1;
const rafs: FrameRequestCallback[] = [];
const flush = () =>
  act(() => {
    while (rafs.length) rafs.shift()!(0);
  });

beforeEach(() => {
  aboveIntersecting = false;
  probeTop = 844;
  probeBoxes = 1;
  rafs.length = 0;
  vv = new FakeVV();
  vi.stubGlobal('IntersectionObserver', IO);
  vi.stubGlobal('visualViewport', vv);
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: vv });
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => rafs.push(cb));
  vi.stubGlobal('cancelAnimationFrame', () => {});
  const origRect = HTMLElement.prototype.getBoundingClientRect;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.hasAttribute('data-sticky-bar-probe')) return { top: probeTop, bottom: probeTop } as DOMRect;
    return origRect.call(this);
  });
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(function (this: HTMLElement) {
    return { length: this.hasAttribute('data-sticky-bar-probe') ? probeBoxes : 1 } as DOMRectList;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const Harness = () => {
  const above = useRef<HTMLDivElement>(null);
  return (
    <>
      <div ref={above} />
      <StickyMobileBar
        aboveRef={above}
        label="Darmowy audyt w 60 sekund"
        telephone="+48000000000"
        primaryLabel="Sprawdź"
        onPrimary={() => {}}
      />
    </>
  );
};

const bar = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-sticky-mobile-bar]')!;

describe('StickyMobileBar: pasek przy dole widoku (MIX-2079)', () => {
  it('zwykły widok: bez stylu bottom (zostaje klasa bottom-0)', () => {
    const { container } = render(<Harness />);
    flush();
    expect(bar(container).className).toContain('bottom-0');
    expect(bar(container).style.bottom).toBe('');
  });

  it('warstwa fixed kończy się w 63 % ekranu → pasek zjeżdża o 312 px', () => {
    probeTop = 532;
    const { container } = render(<Harness />);
    flush();
    expect(bar(container).style.bottom).toBe('-312px');
  });

  it('po resize visualViewport (klawiatura schowana) korekta się przelicza i znika', () => {
    probeTop = 532;
    const { container } = render(<Harness />);
    flush();
    expect(bar(container).style.bottom).toBe('-312px');
    probeTop = 844;
    act(() => {
      vv.dispatchEvent(new Event('resize'));
    });
    flush();
    expect(bar(container).style.bottom).toBe('');
  });

  it('przewinięcie okna też przelicza (warstwa psuje się w trakcie)', () => {
    const { container } = render(<Harness />);
    flush();
    probeTop = 600;
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    flush();
    expect(bar(container).style.bottom).toBe('-244px');
  });

  it('pasek schowany (hero widoczny): bez korekty i body bez znacznika', () => {
    aboveIntersecting = true;
    probeTop = 532;
    const { container } = render(<Harness />);
    flush();
    expect(bar(container).style.bottom).toBe('');
    expect(document.body.dataset.stickyMobileBar).toBeUndefined();
  });

  it('desktop (sonda md:hidden bez pudełka): bez korekty', () => {
    probeBoxes = 0;
    probeTop = 0;
    const { container } = render(<Harness />);
    flush();
    expect(bar(container).style.bottom).toBe('');
  });

  it('pasek widoczny ustawia body[data-sticky-mobile-bar] (CSS chowa przycisk zgód)', () => {
    render(<Harness />);
    expect(document.body.dataset.stickyMobileBar).toBe('true');
  });

  it('sprzątanie: odmontowanie zdejmuje nasłuch visualViewport', () => {
    const spy = vi.spyOn(vv, 'removeEventListener');
    const { unmount } = render(<Harness />);
    flush();
    unmount();
    expect(spy.mock.calls.map((c) => c[0]).sort()).toEqual(['resize', 'scroll']);
  });
});
