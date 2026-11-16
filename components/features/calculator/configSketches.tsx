// Szkice typu strony do podglądu konfiguracji (MIX-1790, spec MIX-1320 U4). Małe SVG w kodzie
// (bez plików i bez żądań): rama okna przeglądarki + prostokąty [x, y, szer., wys., krycie].
// Rozmiar sprawdza test (≤ 6 kB razem). Lista dozwolona typów: Map, więc `__proto__`,
// `constructor` i inne nazwy spoza listy dają brak szkicu.
import React from 'react';

type Box = readonly [number, number, number, number, number];

interface SketchDef {
  label: string;
  boxes: readonly Box[];
}

const DEFS: Record<string, SketchDef> = {
  sklep: {
    label: 'Sklep internetowy',
    boxes: [
      [8, 16, 104, 8, 0.35],
      [8, 30, 30, 22, 0.25],
      [45, 30, 30, 22, 0.25],
      [82, 30, 30, 22, 0.25],
      [8, 55, 18, 3, 0.6],
      [45, 55, 18, 3, 0.6],
      [82, 55, 18, 3, 0.6],
      [8, 64, 104, 12, 0.15],
    ],
  },
  wizytowka: {
    label: 'Wizytówka / landing',
    boxes: [
      [8, 16, 104, 30, 0.3],
      [40, 36, 40, 6, 0.7],
      [8, 52, 32, 24, 0.2],
      [44, 52, 32, 24, 0.2],
      [80, 52, 32, 24, 0.2],
    ],
  },
  portal_tresci: {
    label: 'Portal treści',
    boxes: [
      [8, 16, 104, 8, 0.35],
      [8, 30, 72, 20, 0.25],
      [8, 54, 72, 3, 0.4],
      [8, 60, 60, 3, 0.4],
      [8, 66, 66, 3, 0.4],
      [8, 72, 50, 3, 0.4],
      [86, 30, 26, 46, 0.15],
    ],
  },
  aplikacja: {
    label: 'Aplikacja z logowaniem',
    boxes: [
      [8, 16, 22, 60, 0.3],
      [36, 16, 76, 8, 0.2],
      [36, 30, 22, 14, 0.25],
      [63, 30, 22, 14, 0.25],
      [90, 30, 22, 14, 0.25],
      [36, 50, 76, 26, 0.15],
    ],
  },
  b2b: {
    label: 'Portal B2B',
    boxes: [
      [8, 16, 104, 8, 0.35],
      [8, 28, 104, 6, 0.5],
      [8, 37, 104, 6, 0.2],
      [8, 46, 104, 6, 0.2],
      [8, 55, 104, 6, 0.2],
      [8, 64, 104, 6, 0.2],
      [84, 73, 28, 6, 0.7],
    ],
  },
};

const SKETCHES: ReadonlyMap<string, SketchDef> = new Map(Object.entries(DEFS));

/** Typy ze szkicem (wartości odpowiedzi `project_goal`). */
export const SKETCH_TYPES: readonly string[] = [...SKETCHES.keys()];

/** Szkic dla odpowiedzi `project_goal` albo null (nie-tekst, pusty, spoza listy). */
export function sketchFor(goal: unknown): SketchDef | null {
  if (typeof goal !== 'string') return null;
  return SKETCHES.get(goal) ?? null;
}

export const SiteSketch: React.FC<{ def: SketchDef }> = ({ def }) => (
  <svg
    viewBox="0 0 120 84"
    role="img"
    aria-label={`Szkic: ${def.label}`}
    className="h-auto w-full"
    fill="currentColor"
  >
    <rect x=".5" y=".5" width="119" height="83" rx="6" fill="none" stroke="currentColor" />
    <path d="M1 10h118" stroke="currentColor" strokeOpacity=".4" />
    {def.boxes.map(([x, y, w, h, o], i) => (
      <rect key={i} x={x} y={y} width={w} height={h} rx="2" fillOpacity={o} />
    ))}
  </svg>
);
