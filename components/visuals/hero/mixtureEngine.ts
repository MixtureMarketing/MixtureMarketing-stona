/* eslint-disable max-lines -- spójna pętla silnika canvas (paleta/choreografia już wydzielone do mixtureConfig) */
import {
  BASE,
  FORM,
  POINTER,
  STREAMS,
  WAVE,
  easeOutCubic,
  hash,
  type Dot,
  type FormDot,
  type MixtureHandle,
  type MixtureOptions,
} from './mixtureConfig';

/**
 * Silnik sceny „Mixture" (canvas 2D, zero zależności): siatka kropek + barwne
 * prądy marki, które się w nią mieszają (konfiguracja w mixtureConfig; elipsa
 * strefy tekstu chroni kontrast H1). Reduced-motion: jedna statyczna klatka.
 * Auto-pauzy: poza viewportem, karta w tle, pełne zakrycie arkuszem (covered),
 * pauza użytkownika (setPaused, WCAG 2.2.2); degradacja gęstości > ~24 ms.
 * Wejścia z MixtureField: setPointer (4. prąd), setFront (fala dziobowa),
 * pulse (fala uderzeniowa kliknięcia ze śladem precyzji za frontem).
 * Okresowo, gdy po prawej od kolumny tekstu jest miejsce, z pola wyłania się
 * konstelacja sygnetu (podsiatka ×2 gęstsza, próbkowana z SVG logo).
 */

export function startMixture(canvas: HTMLCanvasElement, opts: MixtureOptions): MixtureHandle {
  const noop = () => undefined;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { destroy: noop, setFront: noop, setPointer: noop, pulse: noop, setPaused: noop };
  }

  let w = 0;
  let h = 0;
  let dots: Dot[] = [];
  let spacing = 30;
  let degraded = false;

  // Strefa tekstu — elipsa w centrum, w której prądy są wygaszane.
  const tz = { x: 0, y: 0, rx: 1, ry: 1 };

  let rafId = 0;
  let running = false;
  let visible = true;
  let firstFrameDone = false;
  let paused = false; // pauza użytkownika (WCAG 2.2.2)
  let covered = false; // arkusz w pełni zakrył scenę → klatki niewidoczne
  let ampStart = -1; // start rozbłysku pola (rampa 0→1)
  let frontY = Number.POSITIVE_INFINITY; // krawędź arkusza (px canvasu)

  // EMA czasu klatki — jednorazowa degradacja gęstości na słabym sprzęcie.
  let emaDt = 16;
  let frames = 0;
  let lastT = 0;

  const pointer = { x: 0, y: 0, dx: 0, dy: 0, active: false };

  // Fale uderzeniowe kliknięć (max 4 naraz; stary wpis wypada pierwszy).
  let waves: { x: number; y: number; t0: number }[] = [];

  // Konstelacja sygnetu — budowana po załadowaniu SVG i po każdym rebuild.
  let formDots: FormDot[] = [];
  let formImg: HTMLImageElement | null = null;
  // Pudełko formy (środek + półosie) — na czas wyłonienia prądy w nim gasną,
  // żeby glif stał na spokojnej siatce, a nie na turbulencji.
  const fb = { x: 0, y: 0, rx: 1, ry: 1 };

  const buildForm = () => {
    formDots = [];
    if (!formImg) return;
    // Wolna strefa na prawo od kolumny treści hero (max-w-4xl = 896 px,
    // wyśrodkowana) — sygnet nigdy nie wchodzi pod H1. Próg 390 px ≈ 24 kolumny
    // podsiatki: poniżej tego glif przestaje się czytać (pomiar na matrycy).
    const x0 = w / 2 + 460;
    const zoneW = w - x0 - 20;
    if (zoneW < 390 || h < 620) return;
    const step = spacing / 2;
    let boxH = Math.min(h * 0.6, 620);
    let boxW = boxH * FORM.aspect;
    if (boxW > zoneW) {
      boxW = zoneW;
      boxH = boxW / FORM.aspect;
    }
    const cols = Math.max(2, Math.round(boxW / step));
    const rows = Math.max(2, Math.round(boxH / step));
    // Glif zrzucony do matrycy kropek: 1 komórka podsiatki = 1 piksel offscreenu;
    // antyaliasing daje wagę pokrycia, więc cienkie kreski logo nie znikają.
    const oc = document.createElement('canvas');
    oc.width = cols;
    oc.height = rows;
    const octx = oc.getContext('2d', { willReadFrequently: true });
    if (!octx) return;
    octx.drawImage(formImg, 0, 0, cols, rows);
    const data = octx.getImageData(0, 0, cols, rows).data;
    const bx = x0 + (zoneW - boxW) / 2;
    const by = h * 0.46 - boxH / 2;
    fb.x = bx + boxW / 2;
    fb.y = by + boxH / 2;
    fb.rx = boxW * 0.62;
    fb.ry = boxH * 0.62;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wgt = data[(r * cols + c) * 4 + 3] / 255;
        if (wgt < 0.14) continue;
        const tx = bx + (c + 0.5) * (boxW / cols);
        const ty = by + (r + 0.5) * (boxH / rows);
        // Rozsypka startowa deterministyczna (hash) — kropki ZBIEGAJĄ SIĘ
        // w formę, zamiast pojawić się znikąd.
        const ang = hash(c * 3 + 1, r * 5 + 2) * Math.PI * 2;
        const dist = 70 + hash(c + 11, r + 29) * 130;
        formDots.push({
          tx,
          ty,
          ox: tx + Math.cos(ang) * dist,
          oy: ty + Math.sin(ang) * dist,
          w: wgt,
          ph: hash(c, r) * Math.PI * 2,
        });
      }
    }
  };

  const rebuild = () => {
    const rect = canvas.getBoundingClientRect();
    w = Math.round(rect.width);
    h = Math.round(rect.height);
    if (w === 0 || h === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    spacing = Math.max(26, Math.min(38, w / 56)) * (degraded ? 1.35 : 1);
    dots = [];
    // Siatka wyśrodkowana — równe marginesy z obu stron.
    const cols = Math.floor(w / spacing);
    const rows = Math.floor(h / spacing);
    const ox = (w - (cols - 1) * spacing) / 2;
    const oy = (h - (rows - 1) * spacing) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          x: ox + c * spacing,
          y: oy + r * spacing,
          phase: hash(c, r) * Math.PI * 2,
          jitter: 0.75 + hash(c + 57, r + 13) * 0.5,
        });
      }
    }

    tz.x = w / 2;
    tz.y = h * 0.44;
    tz.rx = Math.min(w * 0.32, 560);
    tz.ry = h * 0.3;

    buildForm();
  };

  const draw = (tMs: number) => {
    const t = tMs / 1000;
    ctx.clearRect(0, 0, w, h);

    // Rampa „przebudzenia" pola po pierwszej klatce (1.4 s, ease-out).
    if (ampStart < 0) ampStart = t;
    const amp = opts.reducedMotion ? 1 : easeOutCubic(Math.min(1, (t - ampStart) / 1.4));

    const minWH = Math.min(w, 1500);
    // Pozycje + znormalizowane kierunki (pochodna orbity) prądów w tej klatce.
    const S = STREAMS.map((s) => {
      const aX = s.fx * t + s.ph;
      const aY = s.fy * t + s.ph * 1.7;
      const dx = -Math.sin(aX) * s.ax * w * s.fx;
      const dy = Math.cos(aY) * s.ay * h * s.fy;
      const len = Math.hypot(dx, dy) || 1;
      const r = s.radius * minWH;
      return {
        x: s.cx * w + Math.cos(aX) * s.ax * w,
        y: s.cy * h + Math.sin(aY) * s.ay * h,
        vx: dx / len,
        vy: dy / len,
        strength: s.strength,
        color: s.color,
        r2: 2 * r * r,
        cut: (r * 2.6) ** 2, // early-out poza ~2.6σ
      };
    });

    const pr = 170;
    const pr2 = 2 * pr * pr;
    const pcut = (pr * 2.6) ** 2;
    const frontOn = frontY < h + 260;

    // Parametry żywych fal uderzeniowych — raz na klatkę, nie per kropka.
    if (waves.length) waves = waves.filter((wv) => t - wv.t0 <= WAVE.life);
    const WV = waves.map((wv) => {
      const age = Math.max(0, t - wv.t0);
      const decay = (1 - age / WAVE.life) ** 1.5;
      const R = WAVE.r0 + WAVE.speed * age;
      const sig = 46 + 60 * age;
      const outer = R + 3 * sig;
      return {
        x: wv.x,
        y: wv.y,
        decay,
        R,
        sig2: 2 * sig * sig,
        wake: R - 1.6 * sig,
        cut: outer * outer,
      };
    });

    // Obwiednia wyłonienia sygnetu (0..1). Reduced-motion: stała, deterministyczna.
    let formE = 0;
    if (formDots.length) {
      if (opts.reducedMotion) {
        formE = 0.65;
      } else {
        const tc = t - ampStart - FORM.first;
        if (tc > 0) {
          const cyc = tc % FORM.period;
          const { rise, hold, fall } = FORM;
          formE =
            cyc < rise
              ? easeOutCubic(cyc / rise)
              : cyc < rise + hold
                ? 1
                : cyc < rise + hold + fall
                  ? 1 - easeOutCubic((cyc - rise - hold) / fall)
                  : 0;
        }
      }
    }

    for (let d = 0; d < dots.length; d++) {
      const dot = dots[d];

      // Fala dziobowa arkusza: pas wokół krawędzi rozpycha kropki na boki
      // i lekko w górę; kropki pod arkuszem gasną (i tak są zakryte).
      let fpx = 0;
      let fpy = 0;
      let fFade = 1;
      let fG = 0;
      if (frontOn) {
        const dyF = dot.y - frontY;
        fG = Math.exp(-((dyF + 76) * (dyF + 76)) / 20000);
        fpx = (dot.x < w * 0.5 ? -1 : 1) * fG * 34;
        fpy = -fG * 22;
        if (dyF > -12) fFade = Math.max(0, 1 - (dyF + 12) / 90);
        if (fFade < 0.02) continue;
      }

      // Wygaszenie wpływu prądów w strefie tekstu (gaussowska elipsa).
      const nx = (dot.x - tz.x) / tz.rx;
      const ny = (dot.y - tz.y) / tz.ry;
      let mask = 1 - Math.exp(-(nx * nx + ny * ny) * 1.15) * 0.93;
      if (formE > 0.02) {
        const fx = (dot.x - fb.x) / fb.rx;
        const fy = (dot.y - fb.y) / fb.ry;
        mask *= 1 - Math.exp(-(fx * fx + fy * fy) * 1.6) * 0.85 * formE;
      }

      let total = 0;
      let cr = 0;
      let cg = 0;
      let cb = 0;
      let ox = 0;
      let oy = 0;

      for (let i = 0; i < S.length; i++) {
        const st = S[i];
        const ddx = dot.x - st.x;
        const ddy = dot.y - st.y;
        const d2 = ddx * ddx + ddy * ddy;
        if (d2 > st.cut) continue;
        const inf = Math.exp(-d2 / st.r2) * st.strength;
        if (inf < 0.01) continue;
        total += inf;
        cr += st.color[0] * inf;
        cg += st.color[1] * inf;
        cb += st.color[2] * inf;
        // Wir wokół prądu (styczna) + popchnięcie w kierunku jego ruchu.
        const dist = Math.sqrt(d2) || 1;
        ox += (-ddy / dist) * inf * 11 + st.vx * inf * 8;
        oy += (ddx / dist) * inf * 11 + st.vy * inf * 8;
      }

      if (pointer.active) {
        const ddx = dot.x - pointer.x;
        const ddy = dot.y - pointer.y;
        const d2 = ddx * ddx + ddy * ddy;
        if (d2 < pcut) {
          const inf = Math.exp(-d2 / pr2);
          if (inf >= 0.01) {
            total += inf;
            cr += POINTER[0] * inf;
            cg += POINTER[1] * inf;
            cb += POINTER[2] * inf;
            ox += pointer.dx * inf * 10;
            oy += pointer.dy * inf * 10;
          }
        }
      }

      // Fale uderzeniowe: front rozpycha i barwi; ZA frontem ślad precyzji —
      // turbulencje gasną (wSup) i goła siatka na moment rozbłyska (wGlow),
      // idealnie równa. Chaos przechodzi w formę — dosłownie.
      let wGlow = 0;
      let wSup = 1;
      for (let i = 0; i < WV.length; i++) {
        const wv = WV[i];
        const ddx = dot.x - wv.x;
        const ddy = dot.y - wv.y;
        const d2 = ddx * ddx + ddy * ddy;
        if (d2 > wv.cut) continue;
        const dist = Math.sqrt(d2) || 1;
        const g = Math.exp(-((dist - wv.R) ** 2) / wv.sig2) * wv.decay;
        if (g > 0.01) {
          const gi = g * 0.9;
          total += gi;
          cr += WAVE.color[0] * gi;
          cg += WAVE.color[1] * gi;
          cb += WAVE.color[2] * gi;
          ox += (ddx / dist) * g * 30;
          oy += (ddy / dist) * g * 30;
        }
        const behind = wv.wake - dist;
        if (behind > 0) {
          const q = Math.min(1, behind / 240) * wv.decay;
          if (q * 0.3 > wGlow) wGlow = q * 0.3;
          const sup = 1 - q * 0.75;
          if (sup < wSup) wSup = sup;
        }
      }
      if (wSup < 1) {
        ox *= wSup;
        oy *= wSup;
      }
      wGlow *= mask; // strefa tekstu: rozbłysk śladu nie podbija tła pod H1

      const k = Math.min(1, total * mask * amp * 1.2);
      const a0 = 0.14 * dot.jitter;

      if (k < 0.01) {
        // Czysta siatka — subtelne, precyzyjne tło (fillRect: tanio przy tysiącach).
        const a = (a0 + fG * 0.18 + wGlow * 0.55) * fFade;
        const s = 2.1 + fG * 1.4 + wGlow * 1.6;
        ctx.fillStyle = `rgba(${BASE[0]},${BASE[1]},${BASE[2]},${a.toFixed(3)})`;
        ctx.fillRect(dot.x + fpx - 1, dot.y + fpy - 1, s, s);
      } else {
        const rr = Math.round(BASE[0] + (cr / total - BASE[0]) * k);
        const rg = Math.round(BASE[1] + (cg / total - BASE[1]) * k);
        const rb = Math.round(BASE[2] + (cb / total - BASE[2]) * k);
        const a = Math.min(0.95, a0 + 0.7 * k + fG * 0.15) * fFade;
        const r = 1.05 + 2.5 * k + fG * 0.8;
        const kk = k * mask * amp;
        const x = dot.x + fpx + ox * kk + Math.sin(t * 1.3 + dot.phase) * 2.2 * kk * wSup;
        const y = dot.y + fpy + oy * kk + Math.cos(t * 1.1 + dot.phase) * 2.2 * kk * wSup;
        if (k > 0.55) {
          // Bloom — poświata najmocniej zmieszanych kropek.
          ctx.beginPath();
          ctx.arc(x, y, r * 2.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rr},${rg},${rb},${(k * 0.09 * fFade).toFixed(3)})`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rr},${rg},${rb},${a.toFixed(3)})`;
        ctx.fill();
      }
    }

    // Konstelacja sygnetu — kropki zbiegają się z rozsypki do formy (lerp po
    // obwiedni), trzymają ją chwilę i rozpływają się z powrotem w pole.
    if (formE > 0.005) {
      // Reduced-motion: forma stoi ZŁOŻONA (p=1) — rozsypka w statycznej
      // klatce wyglądałaby jak uszkodzony render, nie jak zamysł.
      const p = opts.reducedMotion ? 1 : easeOutCubic(formE);
      const drift = opts.reducedMotion ? 0 : 1.6 * (1 - formE * 0.7);
      const [fr, fg2, fb] = FORM.color;
      for (let i = 0; i < formDots.length; i++) {
        const f = formDots[i];
        const x = f.ox + (f.tx - f.ox) * p + Math.sin(t * 1.4 + f.ph) * drift;
        const y = f.oy + (f.ty - f.oy) * p + Math.cos(t * 1.2 + f.ph) * drift;
        // Waga podbita ~2×: komórki konturu mają pokrycie 0.2–0.5 i bez tego
        // toną poniżej jasności bazowej siatki (zmierzone na zrzutach).
        const wEff = Math.min(1, f.w * 1.9);
        const a = (0.22 + 0.62 * wEff) * formE;
        const r = (1.2 + 2 * wEff) * (0.55 + 0.45 * formE);
        if (wEff > 0.55 && formE > 0.5) {
          ctx.beginPath();
          ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${fr},${fg2},${fb},${(formE * 0.08).toFixed(3)})`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${fr},${fg2},${fb},${a.toFixed(3)})`;
        ctx.fill();
      }
    }

    if (!firstFrameDone) {
      firstFrameDone = true;
      opts.onFirstFrame?.();
    }
  };

  const frame = (tMs: number) => {
    if (!running) return;
    if (lastT > 0) {
      emaDt = emaDt * 0.9 + (tMs - lastT) * 0.1;
      frames++;
      if (frames === 90 && emaDt > 24 && !degraded) {
        degraded = true;
        rebuild();
      }
    }
    lastT = tMs;
    draw(tMs);
    rafId = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running || paused || covered || opts.reducedMotion || !visible || document.hidden) return;
    running = true;
    lastT = 0;
    rafId = requestAnimationFrame(frame);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(rafId);
  };

  const onVisibility = () => (document.hidden ? stop() : start());

  // Jedna statyczna, deterministyczna klatka (t dobrane estetycznie).
  const drawStatic = () => {
    ampStart = 0;
    draw(17000);
  };

  rebuild();

  // SVG sygnetu ładowany leniwie; po dojściu przebudowa konstelacji (a przy
  // reduced-motion — dorysowanie jej do statycznej klatki).
  {
    const img = new Image();
    img.onload = () => {
      formImg = img;
      buildForm();
      if (opts.reducedMotion) drawStatic();
    };
    img.src = FORM.src;
  }

  if (opts.reducedMotion) {
    drawStatic();
  } else {
    start();
    document.addEventListener('visibilitychange', onVisibility);
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (opts.reducedMotion) return;
    if (visible) start();
    else stop();
  });
  io.observe(canvas);

  const ro = new ResizeObserver(() => {
    const rect = canvas.getBoundingClientRect();
    if (Math.round(rect.width) === w && Math.round(rect.height) === h) return;
    rebuild();
    if (opts.reducedMotion) drawStatic();
  });
  ro.observe(canvas);

  return {
    setPaused(v) {
      paused = v;
      (v ? stop : start)();
    },
    setFront(y) {
      frontY = y ?? Number.POSITIVE_INFINITY;
      // Krawędź przy górnej kratownicy = scena niewidoczna (IO tego nie widzi,
      // bo canvas wciąż przecina viewport POD nieprzezroczystym arkuszem).
      const nowCovered = frontY <= 8;
      if (nowCovered !== covered) {
        covered = nowCovered;
        if (covered) stop();
        else start();
      }
    },
    setPointer(x, y, dx, dy, active) {
      pointer.x = x;
      pointer.y = y;
      pointer.dx = dx;
      pointer.dy = dy;
      pointer.active = active;
    },
    pulse(x, y) {
      if (opts.reducedMotion || paused) return;
      waves.push({ x, y, t0: performance.now() / 1000 });
      if (waves.length > 4) waves.shift();
    },
    destroy() {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
