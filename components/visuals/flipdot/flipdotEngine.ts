import { hash } from '../hero/mixtureConfig';
import { LINE_ROWS, rasterWord } from './flipdotFont';

/**
 * Silnik nagłówka flip-dot (canvas 2D, zero zależności) — tekst składa się
 * kaskadą obracających się krążków jak na elektromechanicznych tablicach
 * AlfaZeta (Łódź). Architektura: KAŻDE SŁOWO to osobny moduł tablicy
 * (inline-block span + canvas), więc łamanie wierszy zostaje natywne dla
 * HTML, a zgaszone tarcze tworzą zwarte prostokąty modułów — jak na
 * prawdziwej tablicy. Glify z matrycy znaków 5×7 (flipdotFont) — jak
 * sprzętowe ROM-y prawdziwych wyświetlaczy — nie z rastrowania fontu,
 * które na ~8 tarczach wysokości mieli litery. Kaskada gra RAZ (Motion Has
 * A Job: ruch podaje treść i gaśnie; zero wiecznego rAF), front biegnie
 * ukosem przez wszystkie moduły w globalnym układzie nagłówka.
 * Reduced-motion i prerender: silnika w ogóle się nie montuje.
 */

/** Krążek zgaszony — matowa strona tarczy, tło modułu tablicy. */
const OFF: readonly [number, number, number] = [148, 163, 184];
const OFF_ALPHA = 0.15;
/** Krążek zapalony — jasny błękit rodziny WAVE ze sceny hero. */
const ON: readonly [number, number, number] = [186, 224, 246];
/** Błysk krawędzi tarczy w połowie obrotu — „łapie światło" jak metal. */
const RIM: readonly [number, number, number] = [232, 244, 252];

const FLIP_MS = 220; // czas obrotu jednej tarczy
const GHOST_MS = 260; // życie „zbłąkanego" krążka za frontem fali
const COL_MS = 13; // kaskada: opóźnienie na globalną kolumnę…
const ROW_MS = 5; // …i na globalny wiersz (front biegnie ukosem)
const JITTER_MS = 110; // mechaniczny rozrzut pojedynczych tarcz
const SWEEP_CAP_MS = 1200; // sufit przebiegu frontu — długie nagłówki nie ciągną się
const MIN_CELL = 4; // px — poniżej tego tarcze przestają być tarczami

interface Disc {
  x: number;
  y: number;
  on: boolean; // stan docelowy (matryca słowa)
  ghost: boolean; // tarcza poza glifem, która „przeskoczy" i wróci
  delay: number; // ms od startu kaskady
}

interface Module {
  ctx: CanvasRenderingContext2D;
  bg: HTMLCanvasElement; // statyczna warstwa zgaszonych tarcz modułu
  discs: Disc[];
  w: number;
  h: number;
}

export interface WordTarget {
  canvas: HTMLCanvasElement;
  word: string;
}

export interface FlipDotOptions {
  onSettled?: () => void;
}

export interface FlipDotHandle {
  /**
   * Start kaskady (idempotentny). Zwraca false, gdy tablica nie powstała
   * (moduły za małe / brak contextu) — nagłówek HTML musi zostać widoczny.
   */
  play(): boolean;
  /** Reset i ponowna kaskada (tryb demo/lab). */
  replay(): void;
  destroy(): void;
}

export function startFlipDot(
  head: HTMLElement,
  targets: WordTarget[],
  opts: FlipDotOptions = {},
): FlipDotHandle {
  let modules: Module[] = [];
  let cascadeEnd = 0;
  let cellRef = 8;
  let rafId = 0;
  let t0 = -1; // performance.now() startu kaskady; -1 = jeszcze nie grano
  let settled = false;

  const rebuild = () => {
    modules = [];
    const headRect = head.getBoundingClientRect();
    const fontPx = parseFloat(getComputedStyle(head).fontSize) || 48;
    const grids = targets.map((t) => rasterWord(t.word));

    // Jedna wspólna komórka dla całej tablicy (tarcze identyczne jak na
    // prawdziwym wyświetlaczu): z wysokości pisma (7 tarcz na wersalik),
    // przycięta tak, żeby najciaśniejszy moduł zmieścił swoją matrycę.
    let cell = (fontPx * 0.72) / 7;
    targets.forEach((t, i) => {
      const fit = t.canvas.getBoundingClientRect().width / grids[i][0].length;
      if (fit < cell) cell = fit;
    });
    if (cell < MIN_CELL) return; // za mało miejsca — nagłówek zostaje HTML-em
    cellRef = cell;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let maxDelay = 0;

    targets.forEach((t, i) => {
      const ctx = t.canvas.getContext('2d');
      if (!ctx) return;
      const rect = t.canvas.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w === 0 || h === 0) return;
      t.canvas.width = Math.round(w * dpr);
      t.canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const grid = grids[i];
      const cols = Math.floor(w / cell);
      const rows = Math.floor(h / cell);
      // Matryca słowa wycentrowana w module; wokół — zgaszone tarcze.
      const gx = Math.max(0, Math.floor((cols - grid[0].length) / 2));
      const gy = Math.max(0, Math.floor((rows - LINE_ROWS) / 2));

      const mod: Module = { ctx, bg: document.createElement('canvas'), discs: [], w, h };
      // Statyczna warstwa zgaszonych tarcz — raz do bufora, żeby pętla
      // animacji nie mieliła nieruchomych krążków.
      mod.bg.width = t.canvas.width;
      mod.bg.height = t.canvas.height;
      const bctx = mod.bg.getContext('2d');
      if (bctx) {
        bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        bctx.fillStyle = `rgba(${OFF[0]},${OFF[1]},${OFF[2]},${OFF_ALPHA})`;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            bctx.beginPath();
            bctx.arc((c + 0.5) * cell, (r + 0.5) * cell, cell * 0.3, 0, Math.PI * 2);
            bctx.fill();
          }
        }
      }

      // Pozycja modułu w globalnej siatce nagłówka — front kaskady biegnie
      // przez wszystkie moduły jak przez jedną tablicę.
      const gc0 = (rect.left - headRect.left) / cell;
      const gr0 = (rect.top - headRect.top) / cell;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const on = (grid[r - gy]?.[c - gx] ?? false) === true;
          // Zbłąkane tarcze: ~3% zgaszonych w module przeskakuje za frontem
          // i wraca — mechaniczne niedoskonałości uwiarygadniają maszynę
          // (indeks modułu w hashu: każdy moduł ma własny wzór usterek).
          const ghost = !on && hash(c * 7 + 3 + i * 31, r * 13 + 1) < 0.03;
          if (!on && !ghost) continue;
          const delay =
            (gc0 + c) * COL_MS + (gr0 + r) * ROW_MS + hash(gc0 + c, gr0 + r) * JITTER_MS;
          if (delay > maxDelay) maxDelay = delay;
          mod.discs.push({ x: (c + 0.5) * cell, y: (r + 0.5) * cell, on, ghost, delay });
        }
      }
      modules.push(mod);
    });

    // Normalizacja przebiegu: długi nagłówek nie może ciągnąć kaskady
    // w nieskończoność — front zawsze przechodzi w ≤ SWEEP_CAP_MS.
    if (maxDelay > SWEEP_CAP_MS) {
      const scale = SWEEP_CAP_MS / maxDelay;
      for (const m of modules) for (const d of m.discs) d.delay *= scale;
      maxDelay = SWEEP_CAP_MS;
    }
    cascadeEnd = maxDelay + FLIP_MS + GHOST_MS + 60;
  };

  /** Tarcza w danym momencie kaskady: obrót = elipsa ściskana w pionie. */
  const drawDisc = (ctx: CanvasRenderingContext2D, d: Disc, t: number, cell: number) => {
    const p = Math.min(1, Math.max(0, (t - d.delay) / FLIP_MS));
    let showOn = p >= 0.5;
    let q = p;
    if (d.ghost) {
      const back = Math.min(1, Math.max(0, (t - d.delay - FLIP_MS - GHOST_MS) / FLIP_MS));
      if (back > 0) {
        q = back;
        showOn = back < 0.5;
      }
      if (back >= 1) return; // wrócił do tła — rysuje go bufor zgaszonych
    }
    if (q <= 0) return;
    const squash = Math.abs(Math.cos(q * Math.PI));
    const rr = showOn ? cell * 0.38 : cell * 0.3;
    const [cr, cg, cb] = showOn ? ON : OFF;
    const alpha = showOn ? 0.95 : OFF_ALPHA + 0.1;
    ctx.beginPath();
    ctx.ellipse(d.x, d.y, rr, Math.max(0.5, rr * squash), 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
    ctx.fill();
    const edge = 1 - Math.abs(q - 0.5) / 0.16;
    if (edge > 0) {
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, rr, Math.max(0.5, rr * 0.22), 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${RIM[0]},${RIM[1]},${RIM[2]},${(edge * 0.7).toFixed(3)})`;
      ctx.fill();
    }
  };

  const drawFrame = (t: number) => {
    for (const m of modules) {
      m.ctx.clearRect(0, 0, m.w, m.h);
      m.ctx.drawImage(m.bg, 0, 0, m.w, m.h);
      for (let i = 0; i < m.discs.length; i++) drawDisc(m.ctx, m.discs[i], t, cellRef);
    }
  };

  const frame = (now: number) => {
    const t = now - t0;
    drawFrame(t);
    if (t >= cascadeEnd) {
      settled = true;
      opts.onSettled?.();
      return;
    }
    rafId = requestAnimationFrame(frame);
  };

  const play = () => {
    if (modules.length === 0) return false;
    if (t0 < 0) {
      t0 = performance.now();
      rafId = requestAnimationFrame(frame);
    }
    return true;
  };

  rebuild();

  const ro = new ResizeObserver(() => {
    rebuild();
    if (settled) drawFrame(cascadeEnd);
    else if (t0 >= 0) drawFrame(performance.now() - t0);
  });
  ro.observe(head);

  return {
    play,
    replay() {
      cancelAnimationFrame(rafId);
      settled = false;
      t0 = -1;
      play();
    },
    destroy() {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    },
  };
}
