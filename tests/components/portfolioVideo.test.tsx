/**
 * MIX-1873 (kopia MIX-1839, decyzja Jakuba w MIX-1831): filmy w portfolio.
 * Lista: film tylko z myszą, doczytany w tle po `load` + idle (widoczne kafelki, najwyżej 2 naraz),
 * start na najechanie / `canplay`, pauza na zjechanie. Strona realizacji: film nad zdjęciem hero
 * po `load` + idle, start na `canplay`. Dotyk, reduced-motion, Save-Data, błąd = samo zdjęcie.
 */
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/services/cmsService', () => {
  const chain: Record<string, unknown> = {};
  for (const k of ['width', 'height', 'fit', 'crop', 'auto']) chain[k] = () => chain;
  chain.url = () => 'https://cdn.example/photo.jpg';
  return { urlFor: () => chain };
});

import PortfolioGrid from '@/components/features/portfolio/PortfolioGrid';
import CaseStudyHero from '@/components/templates/case-study/CaseStudyHero';
import type { SanityCaseStudy } from '@/types';
import { portfolioVideoFor, PORTFOLIO_VIDEOS } from '@/data/portfolioVideos';
import { afterLoadIdle, canPreloadVideo } from '@/utils/portfolioVideo';
import { createPreloadQueue, portfolioPreloadQueue } from '@/utils/preloadQueue';

const SLUG = 'try-dive-szkola-nurkowania';
const IMG = { _type: 'image', asset: { _ref: 'image-abc-1600x900-jpg' } };
const project = (id: string, slug = SLUG) =>
  ({
    _id: id,
    title: `Projekt ${id}`,
    slug,
    category: 'web',
    excerpt: 'opis',
    client: 'Klient',
    mainImage: IMG,
  }) as unknown as SanityCaseStudy;

// --- środowisko przeglądarki -------------------------------------------------------------
let media: Record<string, boolean>;
let conn: { saveData?: boolean; effectiveType?: string } | undefined;
let readyState: DocumentReadyState;
let observers: Array<{ cb: IntersectionObserverCallback; targets: Element[] }>;
let play: Mock<() => Promise<void>>;
let pause: Mock<() => void>;
let load: Mock<() => void>;
let mediaReady: number;

const HOVER = '(hover: hover) and (pointer: fine)';
const REDUCED = '(prefers-reduced-motion: reduce)';
const NARROW = '(max-width: 767px)';

beforeEach(() => {
  media = { [HOVER]: true, [REDUCED]: false, [NARROW]: false };
  conn = { effectiveType: '4g' };
  readyState = 'loading';
  observers = [];
  mediaReady = 0;
  vi.stubGlobal(
    'matchMedia',
    vi.fn((q: string) => ({
      matches: Boolean(media[q]),
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  );
  Object.defineProperty(navigator, 'connection', { configurable: true, get: () => conn });
  Object.defineProperty(document, 'readyState', { configurable: true, get: () => readyState });
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      private entry: { cb: IntersectionObserverCallback; targets: Element[] };
      constructor(cb: IntersectionObserverCallback) {
        this.entry = { cb, targets: [] };
        observers.push(this.entry);
      }
      observe(t: Element) {
        this.entry.targets.push(t);
      }
      disconnect() {
        this.entry.targets = [];
      }
      unobserve() {}
      takeRecords() {
        return [];
      }
    },
  );
  (window as unknown as { requestIdleCallback: unknown }).requestIdleCallback = (
    cb: () => void,
  ) => {
    cb();
    return 1;
  };
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  load = vi.fn();
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(pause);
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(load);
  vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockImplementation((t: string) =>
    t.startsWith('video/webm') ? 'probably' : 'maybe',
  );
  Object.defineProperty(HTMLMediaElement.prototype, 'readyState', {
    configurable: true,
    get: () => mediaReady,
  });
  vi.stubEnv('VITE_MM_PORTFOLIO_VIDEO', '1');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete (window as unknown as { requestIdleCallback?: unknown }).requestIdleCallback;
  delete (window as unknown as { isPrerendering?: unknown }).isPrerendering;
});

/** Strona się wczytała (`load`), przeglądarka bezczynna, obserwowane ramki w polu widzenia. */
function loadAndIntersect() {
  act(() => {
    readyState = 'complete';
    window.dispatchEvent(new Event('load'));
  });
  act(() => {
    for (const o of observers)
      if (o.targets.length)
        o.cb(
          o.targets.map((t) => ({ isIntersecting: true, target: t })) as never,
          {} as IntersectionObserver,
        );
  });
}

const renderGrid = (projects = [project('a')]) =>
  render(
    <MemoryRouter>
      <PortfolioGrid projects={projects} loading={false} />
    </MemoryRouter>,
  );

const renderHero = (slug = SLUG) =>
  render(
    <MemoryRouter initialEntries={[`/portfolio/${slug}/`]}>
      <CaseStudyHero project={project('h', slug)} />
    </MemoryRouter>,
  );

const cardVideo = (c: HTMLElement) =>
  c.querySelector<HTMLVideoElement>('video[data-portfolio-video]');
const heroVideo = (c: HTMLElement) =>
  c.querySelector<HTMLVideoElement>('video[data-case-study-video]');
const card = (c: HTMLElement) => c.querySelector('[data-portfolio-card]')!;

// --- mapa i warunki ----------------------------------------------------------------------
describe('mapa realizacja → film', () => {
  it('Try Dive ma film; inne slugi i klucze prototypu nie', () => {
    expect(portfolioVideoFor(SLUG)?.preview.webm).toBe('/portfolio/video/try-dive-960.webm');
    for (const s of ['glamspace', '', undefined, null, '__proto__', 'constructor', 'toString'])
      expect(portfolioVideoFor(s)).toBeNull();
  });
  it('każdy wariant ma proporcje 16:9 (ramka kafelka i hero, CLS 0)', () => {
    for (const v of Object.values(PORTFOLIO_VIDEOS))
      for (const x of [v.preview, v.desktop, v.mobile])
        expect(Math.abs(x.width / x.height - 16 / 9)).toBeLessThan(0.01);
  });
});

describe('canPreloadVideo: kiedy wolno doczytywać', () => {
  it('szybkie łącze, bez reduced-motion = tak', () => expect(canPreloadVideo()).toBe(true));
  it.each(['slow-2g', '2g', '3g'])('effectiveType %s = nie', (t) => {
    conn = { effectiveType: t };
    expect(canPreloadVideo()).toBe(false);
  });
  it('Save-Data = nie', () => {
    conn = { saveData: true, effectiveType: '4g' };
    expect(canPreloadVideo()).toBe(false);
  });
  it('prefers-reduced-motion = nie', () => {
    media[REDUCED] = true;
    expect(canPreloadVideo()).toBe(false);
  });
  it('prerender = nie', () => {
    (window as unknown as { isPrerendering: boolean }).isPrerendering = true;
    expect(canPreloadVideo()).toBe(false);
  });
  it('brak navigator.connection (Safari, Firefox) = tak', () => {
    conn = undefined;
    expect(canPreloadVideo()).toBe(true);
  });
});

describe('afterLoadIdle', () => {
  it('przed load nic; po load i idle raz', () => {
    const cb = vi.fn();
    afterLoadIdle(cb);
    expect(cb).not.toHaveBeenCalled();
    readyState = 'complete';
    window.dispatchEvent(new Event('load'));
    expect(cb).toHaveBeenCalledTimes(1);
  });
  it('anulowanie przed load = nigdy', () => {
    const cb = vi.fn();
    afterLoadIdle(cb)();
    window.dispatchEvent(new Event('load'));
    expect(cb).not.toHaveBeenCalled();
  });
  it('bez requestIdleCallback: setTimeout po load', () => {
    vi.useFakeTimers();
    delete (window as unknown as { requestIdleCallback?: unknown }).requestIdleCallback;
    readyState = 'complete';
    const cb = vi.fn();
    afterLoadIdle(cb);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(250);
    expect(cb).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe('kolejka doczytywania: kolejno, najwyżej 2 naraz', () => {
  it('trzecie zadanie czeka na zwolnienie miejsca', () => {
    const q = createPreloadQueue(2);
    const started: number[] = [];
    const dones: Array<() => void> = [];
    for (const i of [1, 2, 3])
      q.enqueue((done) => {
        started.push(i);
        dones.push(done);
      });
    expect(started).toEqual([1, 2]);
    dones[0]();
    dones[0](); // drugie wywołanie nie zwalnia drugiego miejsca
    expect(started).toEqual([1, 2, 3]);
    expect(q.stats()).toEqual({ running: 2, waiting: 0 });
  });
  it('wycofanie czekającego zadania: nigdy nie startuje', () => {
    const q = createPreloadQueue(1);
    const started: number[] = [];
    let done1 = () => {};
    q.enqueue((d) => {
      started.push(1);
      done1 = d;
    });
    const cancel = q.enqueue(() => started.push(2));
    cancel();
    done1();
    expect(started).toEqual([1]);
    expect(q.stats()).toEqual({ running: 0, waiting: 0 });
  });
});

// --- lista -----------------------------------------------------------------------------
describe('lista: przełącznik i realizacje bez filmu', () => {
  it.each([undefined, '', '0'])('VITE_MM_PORTFOLIO_VIDEO=%s: brak filmu i atrybutu karty', (v) => {
    vi.unstubAllEnvs();
    if (v !== undefined) vi.stubEnv('VITE_MM_PORTFOLIO_VIDEO', v);
    const { container } = renderGrid();
    loadAndIntersect();
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('[data-portfolio-card]')).toBeNull();
  });
  it('realizacja bez filmu: zdjęcie, bez <video>', () => {
    const { container } = renderGrid([project('b', 'glamspace')]);
    loadAndIntersect();
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')).not.toBeNull();
  });
});

describe('lista: komputer z myszą', () => {
  it('przed load: <video muted loop playsinline preload=none poster>, bez src (0 bajtów filmu)', () => {
    const { container } = renderGrid();
    const v = cardVideo(container)!;
    expect(v).not.toBeNull();
    expect(v.muted).toBe(true);
    expect(v.loop).toBe(true);
    expect(v.hasAttribute('playsinline')).toBe(true);
    expect(v.getAttribute('preload')).toBe('none');
    expect(v.getAttribute('poster')).toBe('https://cdn.example/photo.jpg');
    expect(v.getAttribute('src')).toBeNull();
    expect(v.querySelector('source')).toBeNull();
    expect(load).not.toHaveBeenCalled();
    // zdjęcie zostaje w DOM (element LCP listy)
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('po load + idle + widoczności: doczytanie wariantu 960 px (WebM) z preload=auto', () => {
    const { container } = renderGrid();
    loadAndIntersect();
    const v = cardVideo(container)!;
    expect(v.getAttribute('src')).toBe('/portfolio/video/try-dive-960.webm');
    expect(v.getAttribute('preload')).toBe('auto');
    expect(load).toHaveBeenCalled();
    expect(play).not.toHaveBeenCalled(); // samo doczytanie, bez startu
  });

  it('przeglądarka bez WebM bierze MP4', () => {
    vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockImplementation(() => '');
    const { container } = renderGrid();
    loadAndIntersect();
    expect(cardVideo(container)!.getAttribute('src')).toBe('/portfolio/video/try-dive-960.mp4');
  });

  it('najechanie, gdy film gotowy: start od razu; zjechanie: pauza i powrót zdjęcia', () => {
    const { container } = renderGrid();
    loadAndIntersect();
    mediaReady = 4;
    fireEvent.pointerEnter(card(container), { pointerType: 'mouse' });
    expect(play).toHaveBeenCalledTimes(1);
    const v = cardVideo(container)!;
    fireEvent.playing(v);
    expect(v.className).toContain('opacity-100');
    fireEvent.pointerLeave(card(container), { pointerType: 'mouse' });
    expect(pause).toHaveBeenCalled();
    expect(cardVideo(container)!.className).toContain('opacity-0');
  });

  it('najechanie przed doczytaniem: wczytanie i start na canplay, o ile kursor nadal jest', () => {
    const { container } = renderGrid();
    fireEvent.pointerEnter(card(container), { pointerType: 'mouse' });
    const v = cardVideo(container)!;
    expect(v.getAttribute('src')).toBe('/portfolio/video/try-dive-960.webm');
    expect(play).not.toHaveBeenCalled();
    fireEvent.canPlay(v);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('kursor zjechał przed canplay: film nie startuje', () => {
    const { container } = renderGrid();
    fireEvent.pointerEnter(card(container), { pointerType: 'mouse' });
    fireEvent.pointerLeave(card(container), { pointerType: 'mouse' });
    fireEvent.canPlay(cardVideo(container)!);
    expect(play).not.toHaveBeenCalled();
  });

  it('dotyk na urządzeniu hybrydowym: pointerenter typu touch nic nie robi', () => {
    const { container } = renderGrid();
    fireEvent.pointerEnter(card(container), { pointerType: 'touch' });
    expect(cardVideo(container)!.getAttribute('src')).toBeNull();
  });

  it('błąd wczytania: <video> znika bez komunikatu, zdjęcie zostaje', () => {
    const { container } = renderGrid();
    loadAndIntersect();
    fireEvent.error(cardVideo(container)!);
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')).not.toBeNull();
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it('Save-Data: bez doczytywania w tle; najechanie nadal wczytuje film', () => {
    conn = { saveData: true };
    const { container } = renderGrid();
    loadAndIntersect();
    expect(cardVideo(container)!.getAttribute('src')).toBeNull();
    fireEvent.pointerEnter(card(container), { pointerType: 'mouse' });
    expect(cardVideo(container)!.getAttribute('src')).toBe('/portfolio/video/try-dive-960.webm');
  });

  it('kafelek poza polem widzenia: bez doczytywania', () => {
    const { container } = renderGrid();
    act(() => {
      readyState = 'complete';
      window.dispatchEvent(new Event('load'));
    });
    act(() => {
      for (const o of observers)
        o.cb(
          o.targets.map((t) => ({ isIntersecting: false, target: t })) as never,
          {} as IntersectionObserver,
        );
    });
    expect(cardVideo(container)!.getAttribute('src')).toBeNull();
  });

  it('trzy widoczne kafelki: doczytują się najwyżej 2 naraz, trzeci po canplaythrough', () => {
    const { container } = renderGrid([project('a'), project('b'), project('c')]);
    loadAndIntersect();
    const vids = () => [...container.querySelectorAll<HTMLVideoElement>('video')];
    expect(vids().filter((v) => v.getAttribute('src')).length).toBe(2);
    fireEvent.canPlayThrough(vids().find((v) => v.getAttribute('src'))!);
    expect(vids().filter((v) => v.getAttribute('src')).length).toBe(3);
    expect(portfolioPreloadQueue.stats().waiting).toBe(0);
  });
});

describe('lista: dotyk i reduced-motion = samo zdjęcie', () => {
  it('dotyk (bez hover): brak <video> w DOM', () => {
    media[HOVER] = false;
    const { container } = renderGrid();
    loadAndIntersect();
    fireEvent.pointerEnter(card(container), { pointerType: 'mouse' });
    expect(container.querySelector('video')).toBeNull();
  });
  it('prefers-reduced-motion: brak <video> w DOM', () => {
    media[REDUCED] = true;
    const { container } = renderGrid();
    loadAndIntersect();
    expect(container.querySelector('video')).toBeNull();
  });
  it('prerender: brak <video> w HTML', () => {
    (window as unknown as { isPrerendering: boolean }).isPrerendering = true;
    const { container } = renderGrid();
    expect(container.querySelector('video')).toBeNull();
  });
});

// --- strona realizacji -------------------------------------------------------------------
describe('strona realizacji: film w ramce zdjęcia hero', () => {
  it('przed load: zdjęcie (fetchpriority=high) i film bez src', () => {
    const { container } = renderHero();
    const img = container.querySelector('img[fetchpriority="high"]');
    expect(img).not.toBeNull();
    expect(heroVideo(container)!.getAttribute('src')).toBeNull();
    expect(load).not.toHaveBeenCalled();
  });

  it('po load + idle: wariant 1280 px, start na canplay, widoczny po playing', () => {
    const { container } = renderHero();
    loadAndIntersect();
    const v = heroVideo(container)!;
    expect(v.getAttribute('src')).toBe('/portfolio/video/try-dive-1280.webm');
    expect(v.muted).toBe(true);
    expect(v.className).toContain('opacity-0');
    expect(v.className).toContain('absolute inset-0');
    fireEvent.canPlay(v);
    expect(play).toHaveBeenCalledTimes(1);
    fireEvent.playing(v);
    expect(heroVideo(container)!.className).toContain('opacity-100');
    // ramka 16:9 się nie zmienia (film leży nad zdjęciem)
    expect(v.parentElement!.className).toContain('aspect-[16/9]');
    expect(v.parentElement!.className).toContain('relative');
  });

  it('telefon: wariant 720 px', () => {
    media[NARROW] = true;
    const { container } = renderHero();
    loadAndIntersect();
    expect(heroVideo(container)!.getAttribute('src')).toBe('/portfolio/video/try-dive-720.webm');
  });

  it.each([
    ['prefers-reduced-motion', () => (media[REDUCED] = true)],
    ['Save-Data', () => (conn = { saveData: true })],
    ['łącze 3g', () => (conn = { effectiveType: '3g' })],
  ])('%s: samo zdjęcie, brak <video>', (_n, setup) => {
    setup();
    const { container } = renderHero();
    loadAndIntersect();
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('błąd wczytania: zostaje zdjęcie, bez komunikatu', () => {
    const { container } = renderHero();
    loadAndIntersect();
    fireEvent.error(heroVideo(container)!);
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')).not.toBeNull();
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it('przełącznik wyłączony albo realizacja bez filmu: bez <video>, ramka bez „relative”', () => {
    vi.unstubAllEnvs();
    const off = renderHero();
    loadAndIntersect();
    expect(off.container.querySelector('video')).toBeNull();
    expect(off.container.querySelector('img')!.parentElement!.className).not.toMatch(
      /\brelative\b/,
    );
    off.unmount();
    vi.stubEnv('VITE_MM_PORTFOLIO_VIDEO', '1');
    const other = renderHero('glamspace');
    loadAndIntersect();
    expect(other.container.querySelector('video')).toBeNull();
  });
});
