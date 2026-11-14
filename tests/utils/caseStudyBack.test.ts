import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  backRestoreTarget,
  isCaseStudyRoute,
  isRecordingHeld,
  holdRecording,
  listKey,
  planBack,
  recordScroll,
  resetPositions,
  savedPosition,
} from '@/utils/caseStudyBack';
import { cancelRestore, canReach, startRestore, waitUntil } from '@/utils/caseStudyRestore';

beforeEach(() => {
  vi.useFakeTimers();
  resetPositions();
});
afterEach(() => {
  resetPositions();
  vi.useRealTimers();
});

describe('isCaseStudyRoute / listKey (MIX-1675)', () => {
  it('matches only /portfolio/<slug>/', () => {
    expect(isCaseStudyRoute('/portfolio/alfa/')).toBe(true);
    expect(isCaseStudyRoute('/portfolio/alfa')).toBe(true);
    expect(isCaseStudyRoute('/portfolio/')).toBe(false);
    expect(isCaseStudyRoute('/portfolio/alfa/beta/')).toBe(false);
    expect(isCaseStudyRoute('/uslugi/alfa/')).toBe(false);
    expect(isCaseStudyRoute('')).toBe(false);
    expect(isCaseStudyRoute(null)).toBe(false);
    expect(isCaseStudyRoute(undefined)).toBe(false);
  });
  it('trailing slash does not split a list key', () => {
    expect(listKey('/portfolio/')).toBe(listKey('/portfolio'));
    expect(listKey('/')).toBe('/');
  });
});

describe('recordScroll / savedPosition (keyed by list path)', () => {
  it('stores per path and reads it back with either slash form', () => {
    recordScroll('/portfolio/', 1234.4);
    recordScroll('/uslugi/', 80);
    expect(savedPosition('/portfolio')).toBe(1234);
    expect(savedPosition('/uslugi/')).toBe(80);
    expect(savedPosition('/kontakt/')).toBeNull();
  });
  it('the last value wins', () => {
    recordScroll('/portfolio/', 100);
    recordScroll('/portfolio/', 900);
    expect(savedPosition('/portfolio/')).toBe(900);
  });
  it.each([
    ['case-study path', '/portfolio/alfa/', 500],
    ['NaN', '/portfolio/', NaN],
    ['negative', '/portfolio/', -5],
    ['Infinity', '/portfolio/', Infinity],
    ['empty path', '', 10],
  ])('refuses %s', (_n, path, y) => {
    recordScroll(path, y);
    expect(savedPosition(path || '/portfolio/')).toBeNull();
  });
  it('is held while a back navigation restores (browser scroll events must not overwrite)', () => {
    recordScroll('/portfolio/', 900);
    holdRecording();
    expect(isRecordingHeld()).toBe(true);
    recordScroll('/portfolio/', 0);
    expect(savedPosition('/portfolio/')).toBe(900);
    vi.advanceTimersByTime(3000);
    expect(isRecordingHeld()).toBe(false);
    recordScroll('/portfolio/', 10);
    expect(savedPosition('/portfolio/')).toBe(10);
  });
  it('keeps at most 50 entries, dropping the oldest', () => {
    for (let i = 0; i < 60; i++) recordScroll(`/p${i}/`, i);
    expect(savedPosition('/p0/')).toBeNull();
    expect(savedPosition('/p59/')).toBe(59);
  });
});

describe('backRestoreTarget', () => {
  const base = { from: '/portfolio/alfa/', to: '/portfolio/', navType: 'POP', saved: 1500 };
  it('POP from a case study to a page with a saved position restores it', () => {
    expect(backRestoreTarget(base)).toBe(1500);
    expect(backRestoreTarget({ ...base, saved: 0 })).toBe(0);
  });
  it.each([
    ['PUSH (menu link)', { navType: 'PUSH' }],
    ['REPLACE', { navType: 'REPLACE' }],
    ['not from a case study', { from: '/kontakt/' }],
    ['to another case study', { to: '/portfolio/beta/' }],
    ['no saved position (direct entry)', { saved: null }],
  ])('%s = null (browser default)', (_n, over) => {
    expect(backRestoreTarget({ ...base, ...over })).toBeNull();
  });
});

describe('planBack: allowlist, fail-closed', () => {
  const ok = {
    from: '/portfolio/alfa/',
    to: '/portfolio/',
    saved: 700,
    enabled: true,
    supported: true,
    motion: true,
    active: false,
    hero: true,
  };
  it('every condition met = transition', () => {
    expect(planBack(ok)).toEqual({ kind: 'transition', y: 700 });
  });
  it.each([
    ['no API support', { supported: false }],
    ['reduced motion', { motion: false }],
    ['another transition active', { active: true }],
    ['no hero in the DOM', { hero: false }],
  ])('%s = restore without animation', (_n, over) => {
    expect(planBack({ ...ok, ...over })).toEqual({ kind: 'restore', y: 700 });
  });
  it.each([
    ['switch off (new behaviour hidden, as before MIX-1675)', { enabled: false }],
    ['switch off, nothing else wrong, saved position present', { enabled: false, saved: 0 }],
    ['direct entry (no saved position)', { saved: null }],
    ['not from a case study', { from: '/kontakt/' }],
    ['to a case study', { to: '/portfolio/beta/' }],
  ])('%s = none', (_n, over) => {
    expect(planBack({ ...ok, ...over })).toEqual({ kind: 'none' });
  });
});

describe('startRestore: instant, waits for height', () => {
  const mk = (height: number) => {
    const doc = { documentElement: { scrollHeight: height } } as unknown as Document;
    const win = { innerHeight: 800, scrollTo: vi.fn() };
    let cb: () => void = () => undefined;
    const unwatch = vi.fn();
    const watch = (c: () => void) => {
      cb = c;
      return unwatch;
    };
    return { doc, win, watch, unwatch, tick: () => cb() };
  };

  it('canReach compares the document height with the target', () => {
    const { doc, win } = mk(2000);
    expect(canReach(1200, { doc, win })).toBe(true);
    expect(canReach(1300, { doc, win })).toBe(false);
  });

  it('scrolls at once with behavior instant (never smooth) when the page is tall enough', () => {
    const m = mk(3000);
    startRestore(1500, { doc: m.doc, win: m.win, watch: m.watch, maxMs: 1500 });
    expect(m.win.scrollTo).toHaveBeenCalledTimes(1);
    expect(m.win.scrollTo).toHaveBeenCalledWith({ top: 1500, left: 0, behavior: 'instant' });
    expect(m.unwatch).toHaveBeenCalled();
  });

  it('waits while the page is short and scrolls on the first layout that reaches the target', () => {
    const m = mk(900);
    startRestore(1500, { doc: m.doc, win: m.win, watch: m.watch, maxMs: 1500 });
    expect(m.win.scrollTo).not.toHaveBeenCalled();
    (m.doc.documentElement as unknown as { scrollHeight: number }).scrollHeight = 3000;
    m.tick();
    expect(m.win.scrollTo).toHaveBeenCalledTimes(1);
    m.tick();
    expect(m.win.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('gives up after maxMs: scrolls as far as it can, once, and stops watching', () => {
    const m = mk(900);
    startRestore(1500, { doc: m.doc, win: m.win, watch: m.watch, maxMs: 1500 });
    vi.advanceTimersByTime(1499);
    expect(m.win.scrollTo).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2);
    expect(m.win.scrollTo).toHaveBeenCalledTimes(1);
    expect(m.unwatch).toHaveBeenCalled();
    m.tick();
    expect(m.win.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('a newer restore cancels the previous one', () => {
    const a = mk(900);
    const b = mk(3000);
    startRestore(1500, { doc: a.doc, win: a.win, watch: a.watch, maxMs: 1500 });
    startRestore(400, { doc: b.doc, win: b.win, watch: b.watch, maxMs: 1500 });
    expect(a.unwatch).toHaveBeenCalled();
    vi.advanceTimersByTime(2000);
    expect(a.win.scrollTo).not.toHaveBeenCalled();
  });

  it('F2: cancelRestore stops a pending restore: neither a later layout nor the timeout scrolls', () => {
    const m = mk(900);
    startRestore(1500, { doc: m.doc, win: m.win, watch: m.watch, maxMs: 1500 });
    cancelRestore();
    expect(m.unwatch).toHaveBeenCalled();
    (m.doc.documentElement as unknown as { scrollHeight: number }).scrollHeight = 3000;
    m.tick();
    vi.advanceTimersByTime(2000);
    expect(m.win.scrollTo).not.toHaveBeenCalled();
    expect(() => cancelRestore()).not.toThrow();
  });

  it('F2: a failed guard stops the restore without scrolling (layout and timeout paths)', () => {
    const m = mk(900);
    let on = true;
    startRestore(1500, { doc: m.doc, win: m.win, watch: m.watch, maxMs: 1500, guard: () => on });
    on = false;
    (m.doc.documentElement as unknown as { scrollHeight: number }).scrollHeight = 3000;
    m.tick();
    expect(m.win.scrollTo).not.toHaveBeenCalled();
    expect(m.unwatch).toHaveBeenCalled();
    const t = mk(900);
    startRestore(1500, { doc: t.doc, win: t.win, watch: t.watch, maxMs: 1500, guard: () => false });
    vi.advanceTimersByTime(2000);
    expect(t.win.scrollTo).not.toHaveBeenCalled();
  });

  it('F2: the guard is checked again at the limit: a restore that lost its page does not scroll then', () => {
    const t = mk(900);
    let on = true;
    startRestore(1500, { doc: t.doc, win: t.win, watch: t.watch, maxMs: 1500, guard: () => on });
    vi.advanceTimersByTime(1000);
    on = false; // no layout tick in between: only the timeout can still scroll
    vi.advanceTimersByTime(600);
    expect(t.win.scrollTo).not.toHaveBeenCalled();
  });

  it('a passing guard does not stop the restore', () => {
    const m = mk(3000);
    startRestore(1500, { doc: m.doc, win: m.win, watch: m.watch, maxMs: 1500, guard: () => true });
    expect(m.win.scrollTo).toHaveBeenCalledTimes(1);
    const t = mk(900);
    startRestore(1500, { doc: t.doc, win: t.win, watch: t.watch, maxMs: 1500, guard: () => true });
    vi.advanceTimersByTime(1600);
    expect(t.win.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('lets recording resume after the restore ends', () => {
    const m = mk(3000);
    startRestore(1500, { doc: m.doc, win: m.win, watch: m.watch, maxMs: 1500 });
    expect(isRecordingHeld()).toBe(true);
    vi.advanceTimersByTime(200);
    expect(isRecordingHeld()).toBe(false);
  });
});

describe('waitUntil', () => {
  it('resolves true as soon as the predicate holds', async () => {
    let n = 0;
    const p = waitUntil(() => ++n >= 3, 300);
    await vi.advanceTimersByTimeAsync(100);
    await expect(p).resolves.toBe(true);
  });
  it('resolves false after the time limit, also when the predicate throws', async () => {
    const p = waitUntil(() => {
      throw new Error('x');
    }, 300);
    await vi.advanceTimersByTimeAsync(400);
    await expect(p).resolves.toBe(false);
  });
});
