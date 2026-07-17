/**
 * Konfiguracja sceny „Mixture" — paleta i choreografia prądów oddzielone od
 * pętli silnika (mixtureEngine). Tu mieszka „głos" wizualu: kolory marki,
 * siła, promienie i orbity prądów.
 */

export type RGB = readonly [number, number, number];

export const BASE: RGB = [148, 163, 184]; // slate — spokojna inżynierska siatka
export const POINTER: RGB = [166, 214, 240];
/** Świetlisty szew wzdłuż krawędzi najeżdżającego arkusza (Błękit Mixture). */
export const FRONT: RGB = [97, 182, 222];

export interface StreamDef {
  color: RGB;
  strength: number; // mnożnik wpływu (0..1)
  radius: number; // promień względem min(w, 1500)
  cx: number; // środek orbity (frakcja szerokości)
  cy: number; // środek orbity (frakcja wysokości)
  ax: number; // amplituda orbity X (frakcja w)
  ay: number; // amplituda orbity Y (frakcja h)
  fx: number; // częstotliwość X [rad/s] — okresy ~40–90 s (spokój premium)
  fy: number;
  ph: number; // przesunięcie fazy
}

const stream = (
  color: RGB,
  strength: number,
  radius: number,
  cx: number,
  cy: number,
  ax: number,
  ay: number,
  fx: number,
  fy: number,
  ph: number,
): StreamDef => ({ color, strength, radius, cx, cy, ax, ay, fx, fy, ph });

// Paleta marki: błękit dominuje, indygo wspiera, róż jako rzadki akcent.
// Orbity celowo omijają środek (strefę tekstu) — energia żyje na obrzeżach.
export const STREAMS: StreamDef[] = [
  stream([97, 182, 222], 1, 0.22, 0.5, 0.3, 0.4, 0.3, 0.131, 0.097, 0), // --color-primary
  stream([124, 122, 224], 0.9, 0.17, 0.24, 0.68, 0.26, 0.26, 0.083, 0.129, 2.1), // jasne indygo
  stream([225, 48, 108], 0.6, 0.13, 0.78, 0.62, 0.22, 0.26, 0.103, 0.073, 4.4), // brand-pink
];

/**
 * Fala uderzeniowa po kliknięciu/tapnięciu: front rozpycha i barwi kropki,
 * a za frontem zostaje „ślad precyzji" — turbulencje gasną i siatka na moment
 * staje w idealnym porządku (chaos → forma, teza marki w jednym geście).
 */
export const WAVE = {
  color: [186, 224, 246] as RGB,
  life: 1.7, // s
  speed: 640, // px/s frontu
  r0: 60, // promień startowy
} as const;

/**
 * Sygnet „Mixture" wyłaniający się z pola — okresowa konstelacja kropek
 * (podsiatka o połowie odstępu, próbkowana z SVG logo). Rysowana wyłącznie,
 * gdy na prawo od kolumny tekstu (max-w-4xl) jest na nią miejsce — nigdy
 * pod H1. Reduced-motion dostaje ją statycznie, w połowie jasności.
 */
export const FORM = {
  color: [190, 224, 246] as RGB,
  src: '/assets/images/sygnet-mixture-marketing-fioletowe.svg',
  aspect: 659.5 / 779.22, // viewBox SVG
  period: 21, // s pełnego cyklu
  first: 5, // s do pierwszego wyłonienia
  rise: 1.5,
  hold: 3.2,
  fall: 1.7,
} as const;

/** Kropka siatki — pozycja + deterministyczny szum (faza, wariancja alfy). */
export interface Dot {
  x: number;
  y: number;
  phase: number;
  jitter: number;
}

/** Kropka konstelacji sygnetu: cel, rozsypka startowa, waga (pokrycie glifu). */
export interface FormDot {
  tx: number;
  ty: number;
  ox: number;
  oy: number;
  w: number;
  ph: number;
}

export interface MixtureOptions {
  reducedMotion: boolean;
  /** Wywołane po pierwszej narysowanej klatce (fade-in canvasu). */
  onFirstFrame?: () => void;
}

export interface MixtureHandle {
  destroy(): void;
  /** Krawędź arkusza najeżdżającej sekcji (px w układzie canvasu); null = brak. */
  setFront(y: number | null): void;
  /** Pozycja + wygładzony kierunek wskaźnika (MixtureField liczy smoothing). */
  setPointer(x: number, y: number, dx: number, dy: number, active: boolean): void;
  /** Fala uderzeniowa z punktu kliknięcia/tapnięcia (px w układzie canvasu). */
  pulse(x: number, y: number): void;
  /** Pauza użytkownika (WCAG 2.2.2) — zatrzymuje pętlę rAF do odwołania. */
  setPaused(paused: boolean): void;
}

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// Deterministyczny hash → [0,1) — stabilne „losowe" fazy bez Math.random,
// żeby statyczna klatka reduced-motion była zawsze identyczna.
export const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
