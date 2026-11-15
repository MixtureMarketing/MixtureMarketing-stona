import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  UA_HOLD_MS,
  VT_UA_VALUE,
  browserPlayedBack,
  holdListRendered,
} from '@/utils/caseStudyBackUa';
import { RESTORE_MAX_MS } from '@/utils/caseStudyBack';
import { VT_ATTR } from '@/utils/viewTransitions';

const root = () => document.documentElement;

beforeEach(() => {
  vi.useFakeTimers();
  root().removeAttribute(VT_ATTR);
});
afterEach(() => {
  vi.useRealTimers();
  root().removeAttribute(VT_ATTR);
});

describe('browserPlayedBack (MIX-1759): only an explicit true', () => {
  it.each([
    [true, true],
    [false, false],
    [undefined, false],
    [null, false],
    [1, false],
    ['true', false],
    [{}, false],
  ])('hasUAVisualTransition %s = %s', (value, expected) => {
    const e = new PopStateEvent('popstate', { state: null });
    Object.defineProperty(e, 'hasUAVisualTransition', { value });
    expect(browserPlayedBack(e)).toBe(expected);
  });

  it('an event without the field (older browser) = false', () => {
    expect(browserPlayedBack(new Event('popstate'))).toBe(false);
  });
});

describe('holdListRendered (MIX-1759)', () => {
  it('sets our value for the hold window and removes exactly it at the end', () => {
    holdListRendered(window, document);
    expect(root().getAttribute(VT_ATTR)).toBe(VT_UA_VALUE);
    vi.advanceTimersByTime(UA_HOLD_MS - 1);
    expect(root().getAttribute(VT_ATTR)).toBe(VT_UA_VALUE);
    vi.advanceTimersByTime(1);
    expect(root().hasAttribute(VT_ATTR)).toBe(false);
  });

  it('the hold outlasts the longest restore wait (startRestore maxMs)', () => {
    expect(UA_HOLD_MS).toBeGreaterThan(RESTORE_MAX_MS);
  });

  it('attribute already taken (our transition in progress): untouched and never removed by us', () => {
    root().setAttribute(VT_ATTR, 'realizacja-powrot');
    holdListRendered(window, document);
    expect(root().getAttribute(VT_ATTR)).toBe('realizacja-powrot');
    vi.advanceTimersByTime(UA_HOLD_MS + 10);
    expect(root().getAttribute(VT_ATTR)).toBe('realizacja-powrot');
  });

  it('a transition that took the attribute during the hold keeps it (only our value is removed)', () => {
    holdListRendered(window, document, 100);
    root().setAttribute(VT_ATTR, 'realizacja');
    vi.advanceTimersByTime(150);
    expect(root().getAttribute(VT_ATTR)).toBe('realizacja');
  });

  it('custom window length is honoured', () => {
    holdListRendered(window, document, 50);
    vi.advanceTimersByTime(49);
    expect(root().getAttribute(VT_ATTR)).toBe(VT_UA_VALUE);
    vi.advanceTimersByTime(1);
    expect(root().hasAttribute(VT_ATTR)).toBe(false);
  });
});
