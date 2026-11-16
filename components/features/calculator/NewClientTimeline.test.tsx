// MIX-1816 (Z13) K3/K4: semantyka (<ol>, nagłówki po kolei), puste wpisy, długi tekst, kierunek i
// ruch, chowanie przycisku ciasteczek, axe. Układ (390/1024/1366) mierzy .bieg/m1816/probe.mjs.
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, act, cleanup, within } from '@testing-library/react';
import axe from 'axe-core';
import NewClientTimeline, { usableTimeline } from './NewClientTimeline';
import type { TimelinePeriod } from './newClientTimeline.content';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const SRC = fs.readFileSync(path.join(HERE, 'NewClientTimeline.tsx'), 'utf8');

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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.querySelectorAll('.cookie-floating-btn').forEach((e) => e.remove());
});

const DATA: TimelinePeriod[] = [
  { period: 'Tydzień 1', items: ['Rozmowa startowa.', 'Makiety.'] },
  { period: 'Miesiąc 1', items: ['Projekt graficzny.'] },
  { period: '90 dni', items: ['Uruchomienie.', 'Pomiar.', 'Przegląd.'] },
];

describe('K3 semantyka', () => {
  it('<section> z <h2>, lista numerowana <ol> z trzema <li>, w każdym <h3> i <ul> punktów', () => {
    const { container } = render(<NewClientTimeline periods={DATA} />);
    const section = container.querySelector('section')!;
    expect(section).toHaveAttribute('aria-labelledby', 'new-client-timeline-title');
    expect(document.getElementById('new-client-timeline-title')!.tagName).toBe('H2');
    const ol = section.querySelector('ol')!;
    expect(ol).not.toBeNull();
    const items = Array.from(ol.children);
    expect(items.map((li) => li.tagName)).toEqual(['LI', 'LI', 'LI']);
    expect(items.map((li) => li.querySelector('h3')?.textContent)).toEqual([
      'Tydzień 1',
      'Miesiąc 1',
      '90 dni',
    ]);
    expect(items.map((li) => li.querySelectorAll('ul > li').length)).toEqual([2, 1, 3]);
    expect(within(section).getAllByRole('list')).toHaveLength(4); // 1 ol + 3 ul
  });

  it('nagłówki po kolei: h2, potem h3 (żadnego h4+, żadnego h1)', () => {
    const { container } = render(
      <div>
        <h1>Strona</h1>
        <NewClientTimeline periods={DATA} />
      </div>,
    );
    const levels = Array.from(container.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) =>
      Number(h.tagName[1]),
    );
    expect(levels).toEqual([1, 2, 3, 3, 3]);
  });

  it('axe: 0 naruszeń (kolejność nagłówków, listy, nazwa sekcji; kontrast mierzy przeglądarka)', async () => {
    const { container } = render(
      <main>
        <h1>Strona</h1>
        <NewClientTimeline />
      </main>,
    );
    const res = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    });
    expect(res.violations.map((v) => v.id)).toEqual([]);
  });
});

describe('K4 testy negatywne', () => {
  it('pusty wpis: pusty punkt, same spacje i nie-teksty znikają; okres bez punktów znika; reszta zostaje', () => {
    const dirty = [
      { period: 'Tydzień 1', items: ['', '   ', 'Zostaje.'] },
      { period: 'Miesiąc 1', items: ['', ' '] },
      { period: '   ', items: ['Bez nagłówka.'] },
      { period: '90 dni', items: [null, 3, 'Też zostaje.'] },
    ] as unknown as TimelinePeriod[];
    expect(usableTimeline(dirty)).toEqual([
      { period: 'Tydzień 1', items: ['Zostaje.'] },
      { period: '90 dni', items: ['Też zostaje.'] },
    ]);
    const { container } = render(<NewClientTimeline periods={dirty} />);
    expect(container.querySelectorAll('ol > li')).toHaveLength(2);
    expect(Array.from(container.querySelectorAll('li li')).every((l) => l.textContent !== '')).toBe(
      true,
    );
  });

  it('wszystko puste, brak tablicy albo zły typ: nic nie renderuje (bez pustej listy i nagłówka)', () => {
    for (const bad of [[], [{ period: '', items: [] }], [{ period: 'X', items: [] }]]) {
      const { container, unmount } = render(<NewClientTimeline periods={bad} />);
      expect(container).toBeEmptyDOMElement();
      unmount();
    }
    const weird = [{ period: 'X', items: 'nie tablica' }] as unknown as TimelinePeriod[];
    const { container } = render(<NewClientTimeline periods={weird} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('bliźniak: ten sam okres z jednym punktem renderuje się', () => {
    const { container } = render(<NewClientTimeline periods={[{ period: 'X', items: ['a'] }]} />);
    expect(container.querySelectorAll('ol > li')).toHaveLength(1);
  });

  it('więcej niż 3 punkty w okresie: pokazane najwyżej 3', () => {
    const many = [{ period: 'X', items: ['1', '2', '3', '4', '5'] }];
    const { container } = render(<NewClientTimeline periods={many} />);
    expect(container.querySelectorAll('ol > li ul > li')).toHaveLength(3);
  });

  it('bardzo długi tekst bez spacji: sekcja łamie wiersze (break-words), bez sztywnej szerokości', () => {
    const long = 'Z'.repeat(400);
    const { container } = render(<NewClientTimeline periods={[{ period: 'X', items: [long] }]} />);
    const section = container.querySelector('section')!;
    expect(section.className).toMatch(/\bbreak-words\b/);
    expect(section.className).not.toMatch(/\bwhitespace-nowrap\b|\btruncate\b|\boverflow-x/);
    expect(container.innerHTML).not.toMatch(/\bw-\[\d+px\]|\bmin-w-\[\d+/);
    expect(section.textContent).toContain(long); // nie przycinamy treści
  });

  it('bez klas kierunkowych lewo/prawo (układ logiczny, działa też w dir=rtl)', () => {
    const { container } = render(<NewClientTimeline periods={DATA} />);
    const classes = Array.from(container.querySelectorAll('[class]'))
      .map((e) => e.getAttribute('class'))
      .join(' ');
    expect(classes).not.toMatch(
      /(^|\s)(-?m[lr]|-?p[lr]|border-[lr]|text-(left|right)|left-|right-|float-)/,
    );
    expect(classes).toMatch(/\bps-5\b/);
  });

  it('bez ruchu: żadnych animacji, przejść ani transformacji (prefers-reduced-motion nie ma czego wyciszać)', () => {
    const { container } = render(<NewClientTimeline periods={DATA} />);
    const classes = Array.from(container.querySelectorAll('[class]'))
      .map((e) => e.getAttribute('class'))
      .join(' ');
    expect(classes).not.toMatch(
      /animate-|transition|duration-|delay-|motion-|transform|translate|scale-|ease-/,
    );
    expect(container.querySelector('[style]')).toBeNull();
  });
});

describe('K3 przycisk ciasteczek (fixed) nie zasłania sekcji', () => {
  let box = rect(24, 100, 340, 300);
  const cookie = rect(16, 778, 50, 50);
  const mount = () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      if (this.matches('[data-testid="new-client-timeline"]')) return box;
      if (this.matches('.cookie-floating-btn')) return cookie;
      return rect(0, 0, 0, 0);
    });
    const b = document.createElement('button');
    b.className = 'cookie-floating-btn';
    document.body.appendChild(b);
    return render(<NewClientTimeline periods={DATA} />);
  };
  const scrollTo = async (r: DOMRect) => {
    box = r;
    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
      await new Promise((res) => requestAnimationFrame(() => res(null)));
    });
  };
  const flag = () => document.body.dataset.timelineCookie;

  it('nie nachodzi = bez znacznika; nachodzi = znacznik; zjechała = zdjęty; odmontowanie zdejmuje', async () => {
    const view = mount();
    expect(flag()).toBeUndefined();
    await scrollTo(rect(24, 700, 340, 300));
    expect(flag()).toBe('true');
    await scrollTo(rect(24, -100, 340, 300));
    expect(flag()).toBeUndefined();
    await scrollTo(rect(24, 700, 340, 300));
    view.unmount();
    expect(flag()).toBeUndefined();
  });

  it('sekcja bokiem od przycisku (desktop) = bez znacznika; bliźniak: nałożony x = znacznik', async () => {
    mount();
    await scrollTo(rect(300, 700, 340, 300));
    expect(flag()).toBeUndefined();
    await scrollTo(rect(40, 700, 340, 300));
    expect(flag()).toBe('true');
  });

  it('index.css chowa przycisk przy znaczniku osi czasu (visibility, pointer-events)', () => {
    const css = fs.readFileSync(path.join(HERE, '../../../index.css'), 'utf8');
    const m = css.match(
      /body\[data-timeline-cookie='true'\]\s+\.cookie-floating-btn\s*\{([^}]*)\}/,
    );
    expect(m).not.toBeNull();
    expect(m![1]).toMatch(/visibility:\s*hidden/);
    expect(m![1]).toMatch(/pointer-events:\s*none/);
    expect(SRC).toContain("'timelineCookie'");
  });
});
