import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  PRELOAD_MAX_MS,
  VT_ATTR,
  VT_NAMES,
  VT_STILL,
  caseStudyPath,
  findCardParts,
  isPlainPrimaryClick,
  isSameTabAnchor,
  isViewTransitionsEnabled,
  motionAllowed,
  supportsViewTransitions,
} from '../../utils/viewTransitions';
import { isTransitionActive, runCaseStudyTransition } from '../../utils/caseStudyTransition';
import { getArrivalPath, signalTargetReady } from '../../utils/caseStudyArrival';

const ORIGIN = 'http://localhost:3000';
const root = path.resolve(__dirname, '../..');

/** Nazwy przejścia w DOM: nazwa → liczba elementów. */
function namesInDom(): Record<string, number> {
  const out: Record<string, number> = {};
  document.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
    const n = el.style.getPropertyValue('view-transition-name');
    if (n) out[n] = (out[n] ?? 0) + 1;
  });
  return out;
}

afterEach(() => {
  document.body.innerHTML = '';
  delete (document as unknown as Record<string, unknown>).startViewTransition;
  document.documentElement.removeAttribute(VT_ATTR);
  vi.useRealTimers();
});

describe('przełącznik VITE_MM_VIEW_TRANSITIONS (domyślnie wyłączony)', () => {
  it('tylko "1" i "true" włączają', () => {
    expect(isViewTransitionsEnabled('1')).toBe(true);
    expect(isViewTransitionsEnabled('true')).toBe(true);
    for (const v of [undefined, null, '', '0', 'false', 'TRUE', ' 1', 'yes', 1, true]) {
      expect(isViewTransitionsEnabled(v)).toBe(false);
    }
  });

  it('bez zmiennej w środowisku testów = wyłączony', () => {
    expect(isViewTransitionsEnabled()).toBe(false);
  });
});

describe('caseStudyPath: allowlista celu /portfolio/<slug>/', () => {
  it.each([
    ['/portfolio/korepetytor-ai/', '/portfolio/korepetytor-ai/'],
    [`${ORIGIN}/portfolio/glamspace/`, '/portfolio/glamspace/'],
    ['/portfolio/a1/', '/portfolio/a1/'],
  ])('przepuszcza %s', (href, expected) => {
    expect(caseStudyPath(href, ORIGIN)).toBe(expected);
  });

  it.each([
    [null, 'brak href'],
    ['', 'pusty href'],
    ['/portfolio/', 'sama lista'],
    ['/portfolio/korepetytor-ai', 'bez końcowego ukośnika'],
    ['/portfolio/korepetytor-ai/?x=1', 'zapytanie'],
    ['/portfolio/korepetytor-ai/#wyniki', 'kotwica'],
    ['/portfolio/undefined/x/', 'zagnieżdżona ścieżka'],
    ['/portfolio/Korepetytor/', 'wielkie litery'],
    ['/portfolio/-x/', 'myślnik na początku'],
    ['/portfolio/a--b/', 'podwójny myślnik'],
    ['/portfolio/%2e%2e/', 'zakodowane ..'],
    ['https://evil.example/portfolio/korepetytor-ai/', 'obcy origin'],
    ['//evil.example/portfolio/x/', 'origin bez schematu'],
    ['javascript:alert(1)', 'javascript:'],
    ['/baza-wiedzy/react/', 'artykuł (A4, nie ten krok)'],
    ['http://[::1', 'nieparsowalny adres'],
  ])('odmawia %s (%s)', (href, _why) => {
    expect(caseStudyPath(href as string | null, ORIGIN)).toBeNull();
  });
});

describe('klik i link: tylko zwykły klik lewym przyciskiem w tej samej karcie', () => {
  const base = {
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    defaultPrevented: false,
  };
  it('zwykły klik przechodzi', () => expect(isPlainPrimaryClick(base)).toBe(true));
  it.each([
    ['button', 1],
    ['button', 2],
    ['metaKey', true],
    ['ctrlKey', true],
    ['shiftKey', true],
    ['altKey', true],
    ['defaultPrevented', true],
  ])('odmowa przy %s=%s', (k, v) => {
    expect(isPlainPrimaryClick({ ...base, [k]: v })).toBe(false);
  });

  it('target i download', () => {
    const a = document.createElement('a');
    expect(isSameTabAnchor(a)).toBe(true);
    a.setAttribute('target', '_self');
    expect(isSameTabAnchor(a)).toBe(true);
    a.setAttribute('target', '_blank');
    expect(isSameTabAnchor(a)).toBe(false);
    a.removeAttribute('target');
    a.setAttribute('download', '');
    expect(isSameTabAnchor(a)).toBe(false);
  });
});

describe('ruch i API: fail-closed', () => {
  it('ruch tylko przy jawnym no-preference', () => {
    const mm = (matches: boolean) => () => ({ matches }) as MediaQueryList;
    expect(motionAllowed({ matchMedia: mm(true) })).toBe(true);
    expect(motionAllowed({ matchMedia: mm(false) })).toBe(false);
    expect(motionAllowed(undefined)).toBe(false);
    expect(motionAllowed({} as Pick<Window, 'matchMedia'>)).toBe(false);
    expect(
      motionAllowed({
        matchMedia: () => {
          throw new Error('x');
        },
      }),
    ).toBe(false);
    expect(motionAllowed({ matchMedia: () => undefined as unknown as MediaQueryList })).toBe(false);
  });

  it('pyta dokładnie o no-preference (nie o reduce)', () => {
    const q: string[] = [];
    motionAllowed({
      matchMedia: (s: string) => {
        q.push(s);
        return { matches: true } as MediaQueryList;
      },
    });
    expect(q).toEqual(['(prefers-reduced-motion: no-preference)']);
  });

  it('API: tylko funkcja startViewTransition', () => {
    expect(supportsViewTransitions(document)).toBe(false);
    (document as unknown as Record<string, unknown>).startViewTransition = 'x';
    expect(supportsViewTransitions(document)).toBe(false);
    (document as unknown as Record<string, unknown>).startViewTransition = () => undefined;
    expect(supportsViewTransitions(document)).toBe(true);
    expect(supportsViewTransitions(undefined)).toBe(false);
  });
});

describe('findCardParts: zdjęcie i tytuł karty', () => {
  it('A1 (PortfolioGrid): link w h3, zdjęcie w karcie obok', () => {
    document.body.innerHTML = `<div class="grid">
      <div class="card"><div><img id="i1" alt="A"></div><div class="p"><div><h3 id="t1"><a id="l1" href="/portfolio/a/">A</a></h3></div></div></div>
      <div class="card"><div><img id="i2" alt="B"></div><div class="p"><div><h3><a href="/portfolio/b/">B</a></h3></div></div></div>
    </div>`;
    const parts = findCardParts(document.getElementById('l1') as HTMLAnchorElement);
    expect(parts?.image.id).toBe('i1');
    expect(parts?.title?.id).toBe('t1');
  });

  it('A2: link obejmuje kartę, zdjęcie aria-hidden pominięte, tytuł h3 w linku', () => {
    document.body.innerHTML = `<a id="l" href="/portfolio/a/"><img id="h" aria-hidden="true" alt=""><img id="i" alt="A"><div><h3 id="t">A</h3></div></a>`;
    const parts = findCardParts(document.getElementById('l') as HTMLAnchorElement);
    expect(parts?.image.id).toBe('i');
    expect(parts?.title?.id).toBe('t');
  });

  it('A2 bez nagłówka: samo zdjęcie', () => {
    document.body.innerHTML = `<figure><a id="l" href="/portfolio/a/"><img id="i" alt="A"></a><figcaption>x</figcaption></figure>`;
    const parts = findCardParts(document.getElementById('l') as HTMLAnchorElement);
    expect(parts?.image.id).toBe('i');
    expect(parts?.title).toBeNull();
  });

  it('link w tekście bez zdjęcia = null (zwykła nawigacja)', () => {
    document.body.innerHTML = `<p>Zobacz <a id="l" href="/portfolio/a/">realizację</a>.</p>`;
    expect(findCardParts(document.getElementById('l') as HTMLAnchorElement)).toBeNull();
  });

  it('przodek z drugim linkiem przerywa szukanie (zdjęcie innej karty)', () => {
    document.body.innerHTML = `<section><img alt="X"><a href="/kontakt/">k</a><p><a id="l" href="/portfolio/a/">a</a></p></section>`;
    expect(findCardParts(document.getElementById('l') as HTMLAnchorElement)).toBeNull();
  });

  it('zdjęcie dalej niż 4 poziomy = null', () => {
    document.body.innerHTML = `<div><img alt="X"><div><div><div><div><a id="l" href="/portfolio/a/">a</a></div></div></div></div></div>`;
    expect(findCardParts(document.getElementById('l') as HTMLAnchorElement)).toBeNull();
  });
});

type Recorded = { old: Record<string, number>; next: Record<string, number> };

function installFakeVT(opts: { throws?: boolean } = {}) {
  const recorded: Recorded[] = [];
  const skip = vi.fn();
  const spy = vi.fn((cb: () => Promise<void>) => {
    if (opts.throws) throw new Error('InvalidStateError');
    const old = namesInDom();
    let done!: () => void;
    const finished = new Promise<void>((r) => (done = r));
    const updateCallbackDone = Promise.resolve()
      .then(cb)
      .then(() => {
        recorded.push({ old, next: namesInDom() });
        done();
      });
    return { ready: Promise.resolve(), finished, updateCallbackDone, skipTransition: skip };
  });
  (document as unknown as Record<string, unknown>).startViewTransition = spy;
  return { recorded, spy, skip };
}

function sourceCard() {
  document.body.innerHTML = `
    <nav aria-label="Główna nawigacja">menu</nav>
    <main id="m"><div class="card"><img id="src-img" alt="A"><h3 id="src-title"><a id="l" href="/portfolio/a/">A</a></h3></div></main>
    <button class="cookie-floating-btn">c</button>`;
  const a = document.getElementById('l') as HTMLAnchorElement;
  return findCardParts(a)!;
}

/** Atrapa nawigacji: podmienia treść na nagłówek realizacji z nazwami (jak CaseStudyHero). */
function navigateToHero(withReady = true) {
  return vi.fn(() => {
    const main = document.getElementById('m')!;
    main.innerHTML = `<header><h1 id="dst-title" style="view-transition-name: ${VT_NAMES.title}">A</h1><div id="dst-img" style="view-transition-name: ${VT_NAMES.image}"><img alt="A"></div></header>`;
    if (withReady) queueMicrotask(() => signalTargetReady('/portfolio/a/'));
  });
}

describe('runCaseStudyTransition', () => {
  const win = { scrollTo: vi.fn() };

  it('przejście: stara i nowa strona mają każdą nazwę dokładnie raz, po końcu 0 nazw', async () => {
    const { recorded, spy, skip } = installFakeVT();
    const parts = sourceCard();
    const navigate = navigateToHero();
    const res = await runCaseStudyTransition({
      path: '/portfolio/a/',
      parts,
      navigate,
      preload: () => Promise.resolve(),
      doc: document,
      win,
    });
    expect(res).toBe('transition');
    expect(spy).toHaveBeenCalledTimes(1);
    const t = spy.mock.results[0].value as { finished: Promise<void> };
    await t.finished;
    await Promise.resolve();
    expect(recorded).toHaveLength(1);
    expect(recorded[0].old).toEqual({
      [VT_NAMES.image]: 1,
      [VT_NAMES.title]: 1,
      'vt-naglowek': 1,
      'vt-przycisk-zgod': 1,
    });
    // Nowy stan: nazwy celu (atrapa) + nieruchome; źródło już bez nazw.
    expect(recorded[0].next).toEqual({
      [VT_NAMES.image]: 1,
      [VT_NAMES.title]: 1,
      'vt-naglowek': 1,
      'vt-przycisk-zgod': 1,
    });
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(win.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(skip).not.toHaveBeenCalled();
    // Po końcu: nieruchome i <html> bez nazw; cel zdejmuje nazwy sam (stan arrival = null).
    const left = namesInDom();
    expect(left['vt-naglowek']).toBeUndefined();
    expect(left['vt-przycisk-zgod']).toBeUndefined();
    expect(document.documentElement.hasAttribute(VT_ATTR)).toBe(false);
    expect(getArrivalPath()).toBeNull();
    expect(isTransitionActive()).toBe(false);
  });

  it('źródło oddaje nazwy przed nawigacją (w callbacku nie ma duplikatu, gdy karta zostaje w DOM)', async () => {
    const { spy } = installFakeVT();
    const parts = sourceCard();
    let atNavigate: Record<string, number> = {};
    const navigate = vi.fn(() => {
      atNavigate = namesInDom();
      queueMicrotask(() => signalTargetReady('/portfolio/a/'));
    });
    await runCaseStudyTransition({
      path: '/portfolio/a/',
      parts,
      navigate,
      preload: () => Promise.resolve(),
      doc: document,
      win,
    });
    await vi.waitFor(() => expect(navigate).toHaveBeenCalled());
    expect(atNavigate[VT_NAMES.image]).toBeUndefined();
    expect(atNavigate[VT_NAMES.title]).toBeUndefined();
    expect(getArrivalPath()).toBe('/portfolio/a/');
    await (spy.mock.results[0].value as { finished: Promise<void> }).finished;
    await Promise.resolve();
    expect(getArrivalPath()).toBeNull();
  });

  it(`brak danych w ${PRELOAD_MAX_MS} ms = zwykła nawigacja, 0 nazw, bez startViewTransition`, async () => {
    vi.useFakeTimers();
    const { spy } = installFakeVT();
    const parts = sourceCard();
    const navigate = vi.fn();
    const p = runCaseStudyTransition({
      path: '/portfolio/a/',
      parts,
      navigate,
      preload: () => new Promise(() => undefined),
      doc: document,
      win,
    });
    await vi.advanceTimersByTimeAsync(PRELOAD_MAX_MS + 1);
    expect(await p).toBe('plain');
    expect(spy).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(namesInDom()).toEqual({});
  });

  it('błąd preloadu = zwykła nawigacja', async () => {
    const { spy } = installFakeVT();
    const navigate = vi.fn();
    const res = await runCaseStudyTransition({
      path: '/portfolio/a/',
      parts: sourceCard(),
      navigate,
      preload: () => Promise.reject(new Error('chunk')),
      doc: document,
      win,
    });
    expect(res).toBe('plain');
    expect(spy).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('startViewTransition rzuca = zwykła nawigacja i sprzątnięte nazwy', async () => {
    installFakeVT({ throws: true });
    const navigate = vi.fn();
    const res = await runCaseStudyTransition({
      path: '/portfolio/a/',
      parts: sourceCard(),
      navigate,
      preload: () => Promise.resolve(),
      doc: document,
      win,
    });
    expect(res).toBe('plain');
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(namesInDom()).toEqual({});
    expect(document.documentElement.hasAttribute(VT_ATTR)).toBe(false);
  });

  it('cel nie zgłosił gotowości w czasie = skipTransition', async () => {
    const { spy, skip } = installFakeVT();
    await runCaseStudyTransition({
      path: '/portfolio/a/',
      parts: sourceCard(),
      navigate: navigateToHero(false),
      preload: () => Promise.resolve(),
      doc: document,
      win,
      readyMs: 20,
    });
    await (spy.mock.results[0].value as { finished: Promise<void> }).finished;
    expect(skip).toHaveBeenCalledTimes(1);
  });

  it('przeglądarka bez API = zwykła nawigacja', async () => {
    const navigate = vi.fn();
    const res = await runCaseStudyTransition({
      path: '/portfolio/a/',
      parts: sourceCard(),
      navigate,
      preload: () => Promise.resolve(),
      doc: document,
      win,
    });
    expect(res).toBe('plain');
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(namesInDom()).toEqual({});
  });
});

describe('style przejścia (components/common/caseStudyTransitions.css)', () => {
  const css = fs.readFileSync(
    path.join(root, 'components/common/caseStudyTransitions.css'),
    'utf8',
  );
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');

  /** Treść bloków @media (prefers-reduced-motion: no-preference) i reszta pliku. */
  function split(src: string): { inside: string; outside: string } {
    let inside = '';
    let outside = '';
    let i = 0;
    const re = /@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      outside += src.slice(i, m.index);
      let depth = 1;
      let j = re.lastIndex;
      for (; j < src.length && depth > 0; j++) {
        if (src[j] === '{') depth++;
        else if (src[j] === '}') depth--;
      }
      inside += src.slice(re.lastIndex, j - 1);
      i = j;
      re.lastIndex = j;
    }
    outside += src.slice(i);
    return { inside, outside };
  }

  it('wszystkie reguły tylko w @media (prefers-reduced-motion: no-preference)', () => {
    const { inside, outside } = split(noComments);
    expect(inside).toMatch(/::view-transition-group\(realizacja-zdjecie\)/);
    expect(outside.trim()).toBe('');
  });

  it('wzór TRY DIVE: 0,3 s i krzywa cubic-bezier(0.32, 0.72, 0.18, 1)', () => {
    expect(noComments).toMatch(/animation-duration:\s*0\.3s/);
    expect(noComments).toMatch(/cubic-bezier\(0\.32,\s*0\.72,\s*0\.18,\s*1\)/);
  });

  it('każda nazwa z kodu ma regułę, nieruchome mają animation: none', () => {
    for (const n of [VT_NAMES.image, VT_NAMES.title, ...VT_STILL.map((s) => s.name)]) {
      expect(noComments).toContain(`::view-transition-group(${n})`);
    }
    for (const { name } of VT_STILL) {
      expect(noComments).toMatch(
        new RegExp(`::view-transition-new\\(${name}\\)[^{]*\\{\\s*animation:\\s*none`),
      );
    }
  });

  it('nazwy są unikalne', () => {
    const all = [VT_NAMES.image, VT_NAMES.title, ...VT_STILL.map((s) => s.name)];
    expect(new Set(all).size).toBe(all.length);
  });
});
