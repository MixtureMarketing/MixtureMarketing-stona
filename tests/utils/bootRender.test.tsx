import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderBoot } from '@/utils/bootRender';

/**
 * MIX-1565 (TBT): start z prerenderu renderuje aplikację w kawałkach (startTransition), więc
 * zadanie zaplanowane w trakcie renderu (timer) wykonuje się PRZED jego końcem; zwykły render
 * (prerender, dev) idzie jednym zadaniem. Do commitu kontener trzyma statyczny HTML.
 */
const COMPONENTS = 40;
const BUSY_MS = 2;

const busy = (ms: number) => {
  const end = performance.now() + ms;
  while (performance.now() < end) {
    // praca głównego wątku (symulacja kosztownego komponentu)
  }
};

function run(fromPrerender: boolean) {
  const log: string[] = [];
  let timerSet = false;
  const Leaf = ({ i }: { i: number }) => {
    // Timer zaplanowany w trakcie renderu: przy renderze w kawałkach wejdzie między nie,
    // przy renderze jednym zadaniem dopiero po nim.
    if (!timerSet) {
      timerSet = true;
      setTimeout(() => log.push('timer'), 0);
    }
    busy(BUSY_MS);
    log.push(`r${i}`);
    return <span>{i}</span>;
  };
  const Tree = () => {
    React.useEffect(() => {
      log.push('commit');
    }, []);
    return (
      <div data-testid="app">
        {Array.from({ length: COMPONENTS }, (_, i) => (
          <Leaf key={i} i={i} />
        ))}
      </div>
    );
  };
  const container = document.createElement('div');
  container.innerHTML = '<p data-prerender="1">statyczny HTML</p>';
  document.body.appendChild(container);
  const root = createRoot(container);
  renderBoot(root, <Tree />, fromPrerender);
  const staticRightAfter = container.querySelector('[data-prerender]') !== null;
  return { log, container, root, staticRightAfter };
}

const until = async (cond: () => boolean, ms = 5000) => {
  const end = Date.now() + ms;
  while (!cond()) {
    if (Date.now() > end) throw new Error('timeout');
    await new Promise((r) => setTimeout(r, 5));
  }
};

let roots: Root[] = [];
const g = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
let prevAct: boolean | undefined;

beforeEach(() => {
  prevAct = g.IS_REACT_ACT_ENVIRONMENT;
  g.IS_REACT_ACT_ENVIRONMENT = false; // prawdziwy scheduler, bez act()
});

afterEach(() => {
  for (const r of roots) r.unmount();
  roots = [];
  document.body.innerHTML = '';
  g.IS_REACT_ACT_ENVIRONMENT = prevAct;
});

describe('renderBoot (MIX-1565)', () => {
  it('start z prerenderu: render w kawałkach, timer wchodzi przed końcem renderu', async () => {
    const { log, container, root, staticRightAfter } = run(true);
    roots.push(root);
    expect(staticRightAfter).toBe(true);
    await until(() => log.includes('commit') && log.includes('timer'));
    const lastRender = log.lastIndexOf(`r${COMPONENTS - 1}`);
    expect(log.indexOf('timer')).toBeGreaterThan(-1);
    expect(log.indexOf('timer')).toBeLessThan(lastRender);
    expect(container.querySelector('[data-prerender]')).toBeNull();
    expect(container.querySelectorAll('[data-testid="app"] span')).toHaveLength(COMPONENTS);
  });

  it('prerender/dev: zwykły render jednym zadaniem, timer dopiero po całym renderze', async () => {
    const { log, container, root } = run(false);
    roots.push(root);
    await until(() => log.includes('commit') && log.includes('timer'));
    const lastRender = log.lastIndexOf(`r${COMPONENTS - 1}`);
    expect(log.indexOf('timer')).toBeGreaterThan(lastRender);
    expect(container.querySelectorAll('[data-testid="app"] span')).toHaveLength(COMPONENTS);
  });
});
