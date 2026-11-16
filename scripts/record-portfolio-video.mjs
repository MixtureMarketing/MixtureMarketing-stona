#!/usr/bin/env node
/**
 * Nagranie filmu realizacji do portfolio (MIX-1831/MIX-1873).
 *
 * Puppeteer nagrywa (page.screencast, 1280×720) przewijanie publicznej strony realizacji:
 * hero, potem sekcje. ffmpeg robi z surowego nagrania trzy warianty × dwa kodeki, bez dźwięku:
 *   preview 960 px ≤ 500 kB (kafelek listy), desktop 1280 px ≤ 1,5 MB, mobile 720 px ≤ 0,5 MB.
 * Gdy plik przekracza limit, CRF rośnie aż do zmieszczenia (najwyżej kilka prób).
 *
 * Zasady sieci (MIX-894, CLAUDE.md P-MIX-7): adres tylko z sitemap.xml, UA z dopiskiem MixtureE2E/1,
 * analityka zablokowana przez scripts/lib/prod-safe.mjs, żądania do hosta strony ≤ 1 na sekundę.
 * Zgoda na ciasteczka zapisana jako odmowa (bez banera na filmie i bez analityki).
 *
 * Użycie (poza serwerem, przez bieg na stacji/chmurze):
 *   npm i --no-save ffmpeg-static@5 && node scripts/record-portfolio-video.mjs
 * Zmienne: BASE (domyślnie https://mixturemarketing.pl), SLUG (try-dive-szkola-nurkowania),
 *   NAME (try-dive), OUT (public/portfolio/video), SECONDS (12), FFMPEG (ścieżka; bez niej ffmpeg-static).
 *
 * Tryb z gotowego pliku (MIX-1884, filmy dostarczone przez klienta/zespół, np. z karty MIX-1831):
 *   SRC=<plik.mp4> START=<s> NAME=<nazwa> [ORIENT=portrait] node scripts/record-portfolio-video.mjs
 *   Bez przeglądarki i bez żadnego żądania sieciowego: ffmpeg tnie SECONDS sekund od START i koduje warianty.
 *   ORIENT=portrait: jeden wariant pionowy 540 px ≤ 0,5 MB (ramka telefonu na stronie realizacji).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import puppeteer from 'puppeteer';
import { createProdSafe } from './lib/prod-safe.mjs';

const BASE = (process.env.BASE || 'https://mixturemarketing.pl').replace(/\/$/, '');
const SLUG = process.env.SLUG || 'try-dive-szkola-nurkowania';
const NAME = process.env.NAME || 'try-dive';
const OUT = process.env.OUT || 'public/portfolio/video';
const SECONDS = Number(process.env.SECONDS || 12);
const SRC = process.env.SRC || '';
const START = Number(process.env.START || 0);
const ORIENT = process.env.ORIENT === 'portrait' ? 'portrait' : 'landscape';
const MIN_GAP_MS = 1000; // ≤ 1 żądanie/s do hosta strony

/** Warianty poziome: szerokość, limit bajtów, startowe CRF (VP9, x264). */
export const VARIANTS = [
  { width: 960, limit: 500 * 1024, crf: { webm: 40, mp4: 30 } },
  { width: 1280, limit: 1.5 * 1024 * 1024, crf: { webm: 36, mp4: 27 } },
  { width: 720, limit: 512 * 1024, crf: { webm: 40, mp4: 30 } },
];

/** Wariant pionowy (ramka telefonu): 540 px szerokości, ≤ 0,5 MB. */
export const PORTRAIT_VARIANTS = [{ width: 540, limit: 512 * 1024, crf: { webm: 40, mp4: 30 } }];

async function ffmpegPath() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  const mod = await import('ffmpeg-static');
  return mod.default;
}

/** Sitemap: nagrywamy tylko adres, który w niej jest. */
async function assertInSitemap(url) {
  const res = await fetch(`${BASE}/sitemap.xml`, {
    headers: { 'user-agent': 'Mozilla/5.0 MixtureE2E/1' },
  });
  const xml = await res.text();
  if (!xml.includes(`<loc>${url}</loc>`)) throw new Error(`adres spoza sitemap.xml: ${url}`);
}

function encode(ffmpeg, raw, out, codec, width, crf) {
  const seek = SRC && START > 0 ? ['-ss', String(START)] : [];
  const common = ['-y', '-loglevel', 'error', ...seek, '-i', raw, '-t', String(SECONDS), '-an'];
  const vf = ['-vf', `scale=${width}:-2:flags=lanczos,setsar=1,fps=25`, '-pix_fmt', 'yuv420p'];
  const args =
    codec === 'webm'
      ? [
          ...common,
          ...vf,
          '-c:v',
          'libvpx-vp9',
          '-b:v',
          '0',
          '-crf',
          String(crf),
          '-row-mt',
          '1',
          '-deadline',
          'good',
          '-cpu-used',
          '2',
          out,
        ]
      : [
          ...common,
          ...vf,
          '-c:v',
          'libx264',
          '-preset',
          'slow',
          '-crf',
          String(crf),
          '-profile:v',
          'high',
          '-movflags',
          '+faststart',
          out,
        ];
  execFileSync(ffmpeg, args, { stdio: 'inherit' });
  return fs.statSync(out).size;
}

/** Nagranie przewijania publicznej strony realizacji do pliku `raw` (tryb bez SRC). */
async function recordRaw(ffmpeg, raw) {
  const url = `${BASE}/portfolio/${SLUG}/`;
  const safe = createProdSafe(BASE);
  if (safe.isProd) await assertInSitemap(url);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--hide-scrollbars'],
  });
  safe.watchBrowser(browser);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    const host = new URL(BASE).host;
    let nextSlot = 0;
    await safe.protect(page, {
      handler: (req) => {
        let h = '';
        try {
          h = new URL(req.url()).host;
        } catch {
          h = '';
        }
        if (!safe.isProd || h !== host) {
          req.continue().catch(() => {});
          return;
        }
        const now = Date.now();
        const at = Math.max(now, nextSlot);
        nextSlot = at + MIN_GAP_MS;
        setTimeout(() => req.continue().catch(() => {}), at - now);
      },
    });
    // Odmowa zgody zapisana przed wejściem: bez banera na filmie i bez analityki.
    await page.evaluateOnNewDocument(() => {
      try {
        localStorage.setItem(
          'cookie-consent-v2',
          JSON.stringify({ analytics: false, marketing: false }),
        );
      } catch {
        /* brak localStorage = baner zostaje, nagranie i tak trwa */
      }
    });

    await page.goto(url, { waitUntil: 'load', timeout: 180000 });
    // Pływający przycisk ustawień cookies nie należy do realizacji: chowamy go na nagraniu.
    await page.addStyleTag({
      content: '[aria-label="Ustawienia plików cookies"]{display:none!important}',
    });
    // Rozgrzewka: przewinięcie całej strony (leniwe sekcje i obrazy), powrót na górę.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 600) {
      await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y);
      await new Promise((r) => setTimeout(r, 400));
    }
    await page.waitForNetworkIdle({ idleTime: 1500, timeout: 180000 }).catch(() => {});
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 1500));

    const recorder = await page.screencast({ path: raw, ffmpegPath: ffmpeg });
    // Scenariusz: 1,5 s hero, płynne przewijanie przez sekcje, 1 s na końcu.
    await page.evaluate(async (seconds) => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      await wait(1500);
      const target = Math.min(
        document.documentElement.scrollHeight - window.innerHeight,
        window.innerHeight * 6,
      );
      const dur = (seconds - 2.5) * 1000;
      const t0 = performance.now();
      await new Promise((resolve) => {
        const step = (t) => {
          const p = Math.min(1, (t - t0) / dur);
          const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          // instant: html ma scroll-behavior: smooth, a płynne przewinięcie co klatkę stoi w miejscu
          window.scrollTo({ top: target * ease, behavior: 'instant' });
          if (p < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
      await wait(1000);
    }, SECONDS);
    await recorder.stop();
  } finally {
    await browser.close();
  }
  safe.finish();
  if (process.exitCode) throw new Error('prod-safe: naruszenie, pliki nie powstają');
}

async function main() {
  const ffmpeg = await ffmpegPath();
  fs.mkdirSync(OUT, { recursive: true });
  if (SRC && !fs.existsSync(SRC)) throw new Error(`brak pliku SRC: ${SRC}`);
  const raw = SRC || path.join(os.tmpdir(), `${NAME}-raw-${process.pid}.webm`);
  if (!SRC) await recordRaw(ffmpeg, raw);

  const variants = ORIENT === 'portrait' ? PORTRAIT_VARIANTS : VARIANTS;
  for (const v of variants) {
    for (const codec of ['webm', 'mp4']) {
      const out = path.join(OUT, `${NAME}-${v.width}.${codec}`);
      let crf = v.crf[codec];
      let size = encode(ffmpeg, raw, out, codec, v.width, crf);
      for (let i = 0; i < 6 && size > v.limit; i++) {
        crf += 3;
        size = encode(ffmpeg, raw, out, codec, v.width, crf);
      }
      console.log(
        `${out}: ${size} B (crf ${crf}, limit ${v.limit})${size > v.limit ? ' PRZEKROCZONY' : ''}`,
      );
      if (size > v.limit) process.exitCode = 1;
    }
  }
  // plik źródłowy (SRC) zostaje; kasujemy tylko własne surowe nagranie
  if (!SRC) fs.rmSync(raw, { force: true });
}

main().catch((e) => {
  console.error(`record-portfolio-video: ${e && e.message ? e.message : e}`);
  process.exit(1);
});
