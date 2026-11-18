/**
 * MIX-1873 (kopia MIX-1839, decyzja Jakuba w MIX-1831): filmy w portfolio.
 * Lista: film tylko z myszą, doczytany w tle po `load` + idle (widoczne kafelki, najwyżej 2 naraz),
 * start na najechanie / `canplay`, pauza na zjechanie. Strona realizacji: film nad zdjęciem hero
 * po `load` + idle, start na `canplay`. Dotyk, reduced-motion, Save-Data, błąd = samo zdjęcie.
 * MIX-1884: kolejność load → IntersectionObserver w hero; start po readyState ≥ 3; zwolnienie miejsca
 * w kolejce po 15 s. MIX-1896: bez filmu pionowego i ramki telefonu (Impackt = samo zdjęcie); karta listy
 * z filmem nie ma nakładki najechania, ma za to pierścień fokusu na stretched linku.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, act, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/services/cmsService', () => {
  const chain: Record<string, unknown> = {};
  for (const k of ['width', 'height', 'fit', 'crop', 'auto']) chain[k] = () => chain;
  chain.url = () => 'https://cdn.example/photo.jpg';
  return { urlFor: () => chain };
});

import PortfolioGrid, {
  PORTFOLIO_OVERLAY_ATTR,
  VIDEO_CARD_FOCUS,
} from '@/components/features/portfolio/PortfolioGrid';
import { cardVideoFor } from '@/components/features/portfolio/cardVideo';
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

/** Samo zdarzenie `load` strony (bez zgłoszenia IntersectionObserver). */
function fireLoad() {
  act(() => {
    readyState = 'complete';
    window.dispatchEvent(new Event('load'));
  });
}

/** Zgłoszenie IntersectionObserver dla wszystkich obserwowanych ramek (bez zdarzenia `load`). */
function intersectAll(visible: boolean) {
  act(() => {
    for (const o of observers)
      if (o.targets.length)
        o.cb(
          o.targets.map((t) => ({ isIntersecting: visible, target: t })) as never,
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
    for (const s of ['inny-projekt', '', undefined, null, '__proto__', 'constructor', 'toString'])
      expect(portfolioVideoFor(s)).toBeNull();
  });
  it('każdy wariant ma proporcje 16:9 (ramka kafelka i hero, CLS 0)', () => {
    for (const v of Object.values(PORTFOLIO_VIDEOS))
      for (const x of [v.preview, v.desktop, v.mobile])
        expect(Math.abs(x.width / x.height - 16 / 9)).toBeLessThan(0.01);
  });
  it('MIX-1896: żadna realizacja nie ma wariantu `portrait`; Impackt bez wpisu', () => {
    for (const [slug, v] of Object.entries(PORTFOLIO_VIDEOS))
      expect(Object.keys(v).sort(), slug).toEqual(['desktop', 'mobile', 'preview']);
    expect(portfolioVideoFor('impackt-edu')).toBeNull();
  });
  it('cardVideoFor: przełącznik + zdjęcie + wpis w mapie = wariant 960 px; inaczej null', () => {
    const p = project('a');
    expect(cardVideoFor(p)).toBe(PORTFOLIO_VIDEOS[SLUG].preview);
    expect(cardVideoFor({ ...p, mainImage: undefined })).toBeNull();
    expect(cardVideoFor(project('b', 'inny-projekt'))).toBeNull();
    expect(cardVideoFor(project('i', 'impackt-edu'))).toBeNull();
    vi.stubEnv('VITE_MM_PORTFOLIO_VIDEO', '0');
    expect(cardVideoFor(p)).toBeNull();
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
    const { container } = renderGrid([project('b', 'inny-projekt')]);
    loadAndIntersect();
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')).not.toBeNull();
  });
  it('Glampspace (warianty poziome): film na liście, wariant 960 px', () => {
    const { container } = renderGrid([project('g', 'glamspace')]);
    loadAndIntersect();
    expect(cardVideo(container)!.getAttribute('src')).toBe('/portfolio/video/glamspace-960.webm');
  });
  it('Impackt (bez wpisu w mapie, MIX-1896): brak <video> na liście, zdjęcie i nakładka zostają', () => {
    const { container } = renderGrid([project('i', 'impackt-edu')]);
    loadAndIntersect();
    fireEvent.pointerEnter(card(container), { pointerType: 'mouse' });
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')).not.toBeNull();
    expect(container.querySelectorAll('[data-portfolio-overlay]').length).toBe(1);
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

describe('lista: start po readyState ≥ 3 i zwolnienie miejsca w kolejce po 15 s', () => {
  it.each([0, 1, 2])(
    'najechanie, film z src, ale readyState %i (< HAVE_FUTURE_DATA): bez play',
    (rs) => {
      const { container } = renderGrid();
      loadAndIntersect();
      expect(cardVideo(container)!.getAttribute('src')).not.toBeNull();
      mediaReady = rs;
      fireEvent.pointerEnter(card(container), { pointerType: 'mouse' });
      expect(play).not.toHaveBeenCalled();
      // dopiero zdarzenie canplay startuje film (kursor nadal na kafelku)
      fireEvent.canPlay(cardVideo(container)!);
      expect(play).toHaveBeenCalledTimes(1);
    },
  );

  it('najechanie, readyState 3 (HAVE_FUTURE_DATA): play od razu', () => {
    const { container } = renderGrid();
    loadAndIntersect();
    mediaReady = 3;
    fireEvent.pointerEnter(card(container), { pointerType: 'mouse' });
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('pierwszy film bez canplaythrough zwalnia miejsce po 15 s: trzeci kafelek startuje', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const { container } = renderGrid([project('a'), project('b'), project('c')]);
      loadAndIntersect();
      const withSrc = () =>
        [...container.querySelectorAll<HTMLVideoElement>('video')].filter((v) =>
          v.getAttribute('src'),
        ).length;
      expect(withSrc()).toBe(2); // brak canplaythrough: miejsca zajęte
      act(() => {
        vi.advanceTimersByTime(14999);
      });
      expect(withSrc()).toBe(2);
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(withSrc()).toBe(3); // po 15 s miejsce wraca do kolejki
    } finally {
      vi.useRealTimers();
    }
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
    const other = renderHero('inny-projekt');
    loadAndIntersect();
    expect(other.container.querySelector('video')).toBeNull();
  });

  it('Glampspace: hero z filmem, wariant 1280 px (komputer) i 720 px (telefon)', () => {
    const wide = renderHero('glamspace');
    loadAndIntersect();
    expect(heroVideo(wide.container)!.getAttribute('src')).toBe(
      '/portfolio/video/glamspace-1280.webm',
    );
    wide.unmount();
    media[NARROW] = true;
    const narrow = renderHero('glamspace');
    loadAndIntersect();
    expect(heroVideo(narrow.container)!.getAttribute('src')).toBe(
      '/portfolio/video/glamspace-720.webm',
    );
  });

  it('Impackt (bez wpisu w mapie, MIX-1896): hero bez <video> i bez „relative” na ramce', () => {
    const { container } = renderHero('impackt-edu');
    loadAndIntersect();
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('img')!.parentElement!.className).not.toMatch(/\brelative\b/);
  });

  it('hero: IntersectionObserver obserwuje ramkę zdjęcia, nie body', () => {
    const { container } = renderHero();
    fireLoad();
    const frame = container.querySelector('img')!.parentElement;
    expect(observers.flatMap((o) => o.targets)).toEqual([frame]);
  });

  it('hero: odmontowanie przed load + idle: po load brak obserwatora', () => {
    const { unmount } = renderHero();
    unmount();
    fireLoad();
    expect(observers.length).toBe(0);
  });

  // MIX-1879 (zalecenie weryfikatora): kolejność load → IntersectionObserver.
  it('przed load ramka w polu widzenia: 0 żądań (brak src, brak load())', () => {
    const { container } = renderHero();
    intersectAll(true);
    expect(heroVideo(container)!.getAttribute('src')).toBeNull();
    expect(load).not.toHaveBeenCalled();
    fireLoad(); // dopiero load + idle zakłada obserwatora; ramka jest wtedy poza polem widzenia
    intersectAll(false);
    expect(heroVideo(container)!.getAttribute('src')).toBeNull();
  });

  it('po load, ramka poza polem widzenia: brak src; po wejściu w pole widzenia: src', () => {
    const { container } = renderHero();
    fireLoad();
    intersectAll(false);
    expect(heroVideo(container)!.getAttribute('src')).toBeNull();
    expect(load).not.toHaveBeenCalled();
    intersectAll(true);
    expect(heroVideo(container)!.getAttribute('src')).toBe('/portfolio/video/try-dive-1280.webm');
  });
});

// --- MIX-1896: bez filmu pionowego i ramki telefonu ------------------------------------------
describe('MIX-1896: strona realizacji bez ramki telefonu', () => {
  it('szablon realizacji nie wpina sekcji telefonu; komponentu ramki nie ma', () => {
    const tpl = fs.readFileSync(
      path.resolve(__dirname, '../../components/templates/CaseStudyTemplate.tsx'),
      'utf8',
    );
    expect(tpl).not.toMatch(/CaseStudyPhoneVideo|Wersja na telefon|portrait/);
    expect(
      fs.existsSync(
        path.resolve(__dirname, '../../components/templates/case-study/CaseStudyPhoneVideo.tsx'),
      ),
    ).toBe(false);
  });
});

// --- MIX-1896: karta z filmem bez nakładki najechania ----------------------------------------
const overlays = (c: Element) => c.querySelectorAll(`[${PORTFOLIO_OVERLAY_ATTR}]`);
const seeCase = (c: Element) => within(c as HTMLElement).queryAllByText(/Zobacz case study/);
const cards = (c: HTMLElement) => Array.from(c.querySelectorAll('.group'));
/** Najechanie myszą (zdarzenia, które widzi React; :hover CSS w jsdom nie działa, liczy się DOM). */
const hover = (el: Element) => {
  fireEvent.mouseEnter(el);
  fireEvent.mouseOver(el);
  fireEvent.pointerEnter(el, { pointerType: 'mouse' });
};

describe('lista: karta z filmem bez nakładki najechania (MIX-1896)', () => {
  it.each([SLUG, 'glamspace'])(
    'przełącznik włączony, %s: po najechaniu film, 0 nakładek, 0 „Zobacz case study”',
    (slug) => {
      const { container } = renderGrid([project('a', slug)]);
      loadAndIntersect();
      hover(cards(container)[0]);
      expect(cardVideo(container)).not.toBeNull();
      expect(overlays(container).length).toBe(0);
      expect(seeCase(container).length).toBe(0);
    },
  );

  it('ta sama lista: karta z filmem 0 nakładek, karta bez filmu 1 nakładka i 1 „Zobacz case study”', () => {
    const { container } = renderGrid([project('a'), project('b', 'inny-projekt')]);
    loadAndIntersect();
    const [withVideo, without] = cards(container);
    hover(withVideo);
    hover(without);
    expect(overlays(withVideo).length).toBe(0);
    expect(seeCase(withVideo).length).toBe(0);
    expect(overlays(without).length).toBe(1);
    expect(seeCase(without).length).toBe(1);
    expect(overlays(container).length).toBe(1);
  });

  it('Try Dive bez zdjęcia (bez filmu): nakładka jest', () => {
    const { container } = renderGrid([{ ...project('a'), mainImage: undefined }]);
    hover(cards(container)[0]);
    expect(container.querySelector('video')).toBeNull();
    expect(overlays(container).length).toBe(1);
  });

  it.each([undefined, '', '0'])(
    'przełącznik VITE_MM_PORTFOLIO_VIDEO=%s: karta Try Dive ma 1 nakładkę i 1 „Zobacz case study”',
    (v) => {
      vi.unstubAllEnvs();
      if (v !== undefined) vi.stubEnv('VITE_MM_PORTFOLIO_VIDEO', v);
      const { container } = renderGrid([project('a')]);
      hover(cards(container)[0]);
      expect(container.querySelector('video')).toBeNull();
      expect(overlays(container).length).toBe(1);
      expect(seeCase(container).length).toBe(1);
    },
  );

  it('link karty z filmem: dostępna nazwa = tytuł, adres realizacji, stretched link i pierścień fokusu', () => {
    const { getByRole } = renderGrid([project('a')]);
    const link = getByRole('link', { name: 'Projekt a' });
    expect(link.getAttribute('href')).toBe(`/portfolio/${SLUG}/`);
    for (const c of [
      'after:absolute',
      'after:inset-0',
      'focus-visible:after:ring-4',
      'focus-visible:after:ring-inset',
      'focus-visible:after:ring-primary',
      'focus-visible:after:rounded-2xl',
    ])
      expect(link.classList.contains(c), c).toBe(true);
    for (const c of VIDEO_CARD_FOCUS.split(' ')) expect(link.classList.contains(c), c).toBe(true);
  });

  it('fokus z klawiatury na linku karty z filmem: nakładka się nie pojawia, pierścień zostaje', () => {
    const { getByRole, container } = renderGrid([project('a')]);
    const link = getByRole('link', { name: 'Projekt a' });
    act(() => link.focus());
    expect(document.activeElement).toBe(link);
    expect(overlays(container).length).toBe(0);
    expect(link.classList.contains('focus-visible:after:ring-primary')).toBe(true);
  });

  it('link karty bez filmu: bez pierścienia (fokus pokazuje nakładka, jak dotąd)', () => {
    const { getByRole } = renderGrid([project('b', 'inny-projekt')]);
    const link = getByRole('link', { name: 'Projekt b' });
    expect(link.className).not.toMatch(/after:ring/);
  });

  it('zdjęcie karty z filmem bez powiększenia na najechanie; karta bez filmu z powiększeniem', () => {
    const { container } = renderGrid([project('a'), project('b', 'inny-projekt')]);
    const [withVideo, without] = cards(container);
    expect(withVideo.querySelector('img')!.className).not.toMatch(/scale-110/);
    expect(without.querySelector('img')!.className).toMatch(/group-hover:scale-110/);
  });

  it('kolor i zaokrąglenie pierścienia istnieją w motywie: --color-primary (Tailwind 4) i BaseCard rounded-2xl', () => {
    const css = fs.readFileSync(path.resolve(__dirname, '../../index.css'), 'utf8');
    expect(css).toMatch(/--color-primary:/);
    const base = fs.readFileSync(
      path.resolve(__dirname, '../../components/common/BaseCard.tsx'),
      'utf8',
    );
    expect(base).toMatch(/rounded = '2xl'/);
  });
});

// --- MIX-1896 r2 (werdykt r1, F1): film nie zagra = karta wraca do nakładki -------------------
describe('lista: karta z wpisem w mapie, ale bez grającego filmu, ma nakładkę (MIX-1896 r2)', () => {
  it.each<[string, () => void]>([
    ['prefers-reduced-motion', () => (media[REDUCED] = true)],
    ['dotyk (bez hover)', () => (media[HOVER] = false)],
    ['prerender', () => ((window as unknown as { isPrerendering: boolean }).isPrerendering = true)],
  ])(
    '%s: 0 <video>, 1 nakładka i 1 „Zobacz case study”, link bez pierścienia filmu',
    (_n, ustaw) => {
      ustaw();
      const { container } = renderGrid([project('a')]);
      loadAndIntersect();
      hover(cards(container)[0]);
      expect(container.querySelector('video')).toBeNull();
      expect(overlays(container).length).toBe(1);
      expect(seeCase(container).length).toBe(1);
      expect(container.querySelector('a')!.className).not.toContain('focus-visible:after:ring-4');
    },
  );

  it('błąd pliku filmu: <video> znika, nakładka wraca (tylko na tej karcie)', () => {
    const { container } = renderGrid([project('a'), project('b', 'glamspace')]);
    loadAndIntersect();
    const [pierwsza, druga] = cards(container);
    hover(pierwsza);
    expect(overlays(pierwsza).length).toBe(0);
    fireEvent.error(pierwsza.querySelector('video')!);
    expect(pierwsza.querySelector('video')).toBeNull();
    expect(overlays(pierwsza).length).toBe(1);
    expect(seeCase(pierwsza).length).toBe(1);
    expect(overlays(druga).length).toBe(0);
  });
});
