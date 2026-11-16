// MIX-1790 (Z6 z MIX-1377): podgląd konfiguracji. K2 rozmiar szkiców, K4 tekst z API jako tekst,
// K5 nieznany typ / pusty zakres, K6 formy ataku z dozwolonym bliźniakiem.
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import ConfigPreview from './ConfigPreview';
import { SiteSketch, SKETCH_TYPES, sketchFor } from './configSketches';

const SCOPE = [
  { client_name: 'Strona na telefon', client_description: 'Układ dopasowany do ekranu.' },
  { client_name: 'Logowanie klientów', client_description: null },
];
const HERE = path.dirname(new URL(import.meta.url).pathname);

describe('szkice SVG (K2)', () => {
  it('5 typów ze spec (sklep, wizytówka, portal, aplikacja, B2B)', () => {
    expect([...SKETCH_TYPES].sort()).toEqual(
      ['aplikacja', 'b2b', 'portal_tresci', 'sklep', 'wizytowka'].sort(),
    );
  });

  it('razem ≤ 6 kB: znaczniki SVG wszystkich typów i plik źródłowy szkiców', () => {
    const markup = SKETCH_TYPES.map((t) =>
      renderToStaticMarkup(<SiteSketch def={sketchFor(t)!} />),
    ).join('');
    expect(markup.length).toBeLessThanOrEqual(6 * 1024);
    const src = fs.statSync(path.join(HERE, 'configSketches.tsx')).size;
    expect(src).toBeLessThanOrEqual(6 * 1024);
  });

  it('szkic w kodzie: SVG bez zewnętrznych odwołań (0 żądań)', () => {
    for (const t of SKETCH_TYPES) {
      const m = renderToStaticMarkup(<SiteSketch def={sketchFor(t)!} />);
      expect(m).not.toMatch(/href|url\(|<image|<use/i);
    }
  });
});

describe('ConfigPreview: render', () => {
  it('typ + zakres: szkic z podpisem i lista „Twój zakres"', () => {
    render(<ConfigPreview goal="sklep" scope={SCOPE} />);
    expect(screen.getByRole('img', { name: 'Szkic: Sklep internetowy' })).toBeInTheDocument();
    expect(screen.getByText('Twój zakres')).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Strona na telefonUkład dopasowany do ekranu.');
    expect(items[1].querySelectorAll('p')).toHaveLength(1);
  });

  it('każdy z 5 typów ma szkic', () => {
    for (const t of SKETCH_TYPES) {
      const { unmount } = render(<ConfigPreview goal={t} />);
      expect(screen.getByTestId('config-sketch')).toBeInTheDocument();
      unmount();
    }
  });
});

describe('ConfigPreview: K5 nieznany typ i pusty zakres', () => {
  it('nieznany albo pusty typ = brak szkicu, lista działa; znany typ = szkic', () => {
    for (const goal of [undefined, '', 'portal', 'SKLEP', ' sklep']) {
      const { unmount } = render(<ConfigPreview goal={goal} scope={SCOPE} />);
      expect(screen.queryByTestId('config-sketch')).not.toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
      unmount();
    }
    render(<ConfigPreview goal="sklep" scope={SCOPE} />);
    expect(screen.getByTestId('config-sketch')).toBeInTheDocument();
  });

  it('pusty albo brak zakresu = lista ukryta, szkic zostaje', () => {
    for (const scope of [[], undefined]) {
      const { unmount } = render(<ConfigPreview goal="b2b" scope={scope} />);
      expect(screen.queryByTestId('config-scope')).not.toBeInTheDocument();
      expect(screen.queryByText('Twój zakres')).not.toBeInTheDocument();
      expect(screen.getByTestId('config-sketch')).toBeInTheDocument();
      unmount();
    }
  });

  it('nic do pokazania = 0 elementów DOM', () => {
    const { container } = render(<ConfigPreview goal="nieznany" scope={[]} />);
    expect(container.innerHTML).toBe('');
  });
});

describe('ConfigPreview: formy ataku (odmowa + dozwolony bliźniak)', () => {
  it('U1 nazwy z prototypu (__proto__, constructor, toString, hasOwnProperty) = brak szkicu; b2b = szkic', () => {
    for (const goal of ['__proto__', 'constructor', 'toString', 'hasOwnProperty', 'valueOf'])
      expect(sketchFor(goal)).toBeNull();
    expect(sketchFor('b2b')?.label).toBe('Portal B2B');
  });

  it('U2 typ nie-tekst (tablica, obiekt, liczba, null) = brak szkicu; tekst = szkic', () => {
    for (const goal of [['sklep'], { toString: () => 'sklep' }, 1, null, true])
      expect(sketchFor(goal)).toBeNull();
    expect(sketchFor('sklep')).not.toBeNull();
  });

  it('U3 (K4) <script> i <img onerror> w opisie i nazwie = tekst dosłownie, 0 elementów img/script', () => {
    const evil = [
      {
        client_name: '<img src=x onerror="window.__xss=1">',
        client_description: '<script>window.__xss=2</script><b>gruby</b>',
      },
    ];
    const { container } = render(<ConfigPreview goal="nieznany" scope={evil} />);
    expect(container.querySelector('img, script, b')).toBeNull();
    expect(screen.getByText('<img src=x onerror="window.__xss=1">')).toBeInTheDocument();
    expect(screen.getByText('<script>window.__xss=2</script><b>gruby</b>')).toBeInTheDocument();
    expect((window as unknown as { __xss?: number }).__xss).toBeUndefined();
    // bliźniak: zwykły tekst renderuje się tak samo (jako tekst)
    render(<ConfigPreview goal="nieznany" scope={SCOPE} />);
    expect(screen.getByText('Strona na telefon')).toBeInTheDocument();
  });

  it('U4 kod podglądu nie używa wstawiania HTML', () => {
    for (const f of ['ConfigPreview.tsx', 'configSketches.tsx']) {
      const src = fs.readFileSync(path.join(HERE, f), 'utf8');
      expect(src).not.toMatch(/dangerouslySetInnerHTML|innerHTML|insertAdjacentHTML/);
    }
  });
});
