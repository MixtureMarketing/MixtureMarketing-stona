import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

// MIX-1470: zamienniki rozmyć (pasek nawigacji, baner cookies, kule tła) działają tylko
// w silniku bez -webkit-hyphens (Chromium); Safari/WebKit zostaje przy obecnym wyglądzie.
const root = path.resolve(__dirname, '../..');
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const css = read('index.css');

/** Treść bloku zaczynającego się od `head {` (z zagnieżdżeniami). */
const blockBody = (head: string): string => {
  const start = css.indexOf(`${head} {`);
  if (start < 0) return '';
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) return css.slice(start, i + 1);
  }
  return '';
};

/** Wszystko poza blokami @supports not (-webkit-hyphens: none). */
const outsideGate = (): string => {
  const gate = blockBody('@supports not (-webkit-hyphens: none)');
  return gate ? css.replace(gate, '') : css;
};

describe('zamienniki rozmyć tylko w Chrome (MIX-1470)', () => {
  const gate = blockBody('@supports not (-webkit-hyphens: none)');

  it('blok @supports istnieje, poza warstwami (wygrywa z utilities)', () => {
    expect(gate).toContain('.chrome-no-backdrop');
    expect(gate).toContain('.ambient-orb');
    const at = css.indexOf('@supports not (-webkit-hyphens: none)');
    for (const layer of ['@layer base {', '@layer utilities {', '@layer components {']) {
      const ls = css.indexOf(layer);
      if (ls < 0) continue;
      const body = (() => {
        let depth = 0;
        for (let i = css.indexOf('{', ls); i < css.length; i++) {
          if (css[i] === '{') depth++;
          if (css[i] === '}' && --depth === 0) return [ls, i];
        }
        return [ls, ls];
      })();
      expect(at > body[0] && at < body[1]).toBe(false);
    }
  });

  it('w bloku: backdrop-filter none, kule bez filtra, blendu i animacji', () => {
    expect(gate).toMatch(/\.chrome-no-backdrop\s*{[^}]*backdrop-filter:\s*none/);
    expect(gate).toMatch(/\.chrome-no-backdrop\s*{[^}]*-webkit-backdrop-filter:\s*none/);
    expect(gate).toMatch(/\.ambient-orb\s*{[^}]*filter:\s*none/);
    expect(gate).toMatch(/\.ambient-orb\s*{[^}]*mix-blend-mode:\s*normal/);
    expect(gate).toMatch(/\.ambient-orb\s*{[^}]*animation:\s*none/);
    expect(gate).toMatch(/\.ambient-orb-800::before\s*{[^}]*radial-gradient/);
    expect(gate).toMatch(/\.ambient-orb-600::before\s*{[^}]*radial-gradient/);
  });

  it('poza blokiem nic nie wyłącza rozmyć (Safari bez zmian)', () => {
    const rest = outsideGate();
    expect(rest).not.toContain('.chrome-no-backdrop');
    expect(rest).not.toMatch(/\.ambient-orb/);
  });

  it('pasek nawigacji: bez rozmycia tylko po przewinięciu, przejścia tylko kolorów', () => {
    const nav = read('components/layout/Navbar.tsx');
    const navLine = nav.split('\n').find((l) => l.includes('z-[var(--z-nav)]')) ?? '';
    expect(navLine).toContain('transition-colors');
    expect(navLine).not.toContain('transition-all');
    expect(navLine).toMatch(/scrolled \? 'bg-white\/95 backdrop-blur-xl chrome-no-backdrop/);
    // Na górze strony (nie przewinięte) rozmycie zostaje.
    expect(navLine).toMatch(/: 'bg-white\/80 backdrop-blur-md border-b border-transparent'/);
  });

  it('baner cookies i kule tła mają klasy zamienników', () => {
    expect(read('components/features/CookieBanner.tsx')).toMatch(
      /bg-white\/95 backdrop-blur-md chrome-no-backdrop/,
    );
    const amb = read('components/common/AmbientBackground.tsx');
    expect(amb.match(/ambient-orb ambient-orb-(800|600) text-/g)).toHaveLength(3);
  });
});
