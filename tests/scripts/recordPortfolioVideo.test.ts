/**
 * MIX-1884: tryb SRC skryptu `scripts/record-portfolio-video.mjs` (film z gotowego pliku, bez przeglądarki
 * i bez sieci): argumenty ffmpeg (`-ss` PRZED `-i` tylko w trybie SRC i START > 0, `-t`, `-an`), wybór
 * wariantów (pion = jeden wariant 540 px ≤ 512 kB, poziom = 960/1280/720), plik SRC nigdy nie jest
 * kasowany, brak pliku SRC = błąd. Skrypt uruchamiany jest naprawdę (podstawiony ffmpeg zapisuje argumenty).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  PORTRAIT_VARIANTS,
  VARIANTS,
  encodeArgs,
  shouldRecord,
  shouldRemoveRaw,
  variantsFor,
} from '../../scripts/record-portfolio-video.mjs';

const ROOT = path.resolve(__dirname, '../..');
const SCRIPT = path.join(ROOT, 'scripts', 'record-portfolio-video.mjs');

const base = {
  raw: 'in.mp4',
  out: 'out.webm',
  codec: 'webm',
  width: 960,
  crf: 40,
  seconds: 12,
} as const;
const idx = (a: string[], v: string) => a.indexOf(v);

describe('encodeArgs: argumenty ffmpeg', () => {
  it('tryb SRC, START > 0: -ss START stoi przed -i, potem -t SECONDS i -an', () => {
    const a = encodeArgs({ ...base, src: 'in.mp4', start: 3 });
    expect(idx(a, '-ss')).toBeGreaterThanOrEqual(0);
    expect(a[idx(a, '-ss') + 1]).toBe('3');
    expect(idx(a, '-ss')).toBeLessThan(idx(a, '-i'));
    expect(a[idx(a, '-i') + 1]).toBe('in.mp4');
    expect(a[idx(a, '-t') + 1]).toBe('12');
    expect(idx(a, '-t')).toBeGreaterThan(idx(a, '-i'));
    expect(a).toContain('-an');
  });

  it.each([
    ['SRC, START = 0', { src: 'in.mp4', start: 0 }],
    ['SRC, bez START', { src: 'in.mp4' }],
    ['bez SRC (nagranie strony), START ustawiony', { src: '', start: 5 }],
  ])('%s: bez -ss', (_n, o) => {
    const a = encodeArgs({ ...base, ...o });
    expect(a).not.toContain('-ss');
    expect(a[idx(a, '-t') + 1]).toBe('12');
    expect(a).toContain('-an');
  });

  it('SECONDS trafia do -t (nie stała 12)', () => {
    const a = encodeArgs({ ...base, seconds: 7 });
    expect(a[idx(a, '-t') + 1]).toBe('7');
  });

  it.each(['webm', 'mp4'] as const)(
    '%s: szerokość w scale, CRF, plik wyjściowy ostatni, bez audio',
    (codec) => {
      const out = `o.${codec}`;
      const a = encodeArgs({ ...base, codec, out, width: 540, crf: 33 });
      expect(a.find((x) => x.startsWith('scale='))).toBe(
        'scale=540:-2:flags=lanczos,setsar=1,fps=25',
      );
      expect(a[idx(a, '-crf') + 1]).toBe('33');
      expect(a[a.length - 1]).toBe(out);
      expect(a).toContain(codec === 'webm' ? 'libvpx-vp9' : 'libx264');
      expect(a).toContain('-an');
      expect(a).toContain('yuv420p');
    },
  );
});

describe('wybór wariantów i decyzje trybu SRC', () => {
  it('pion = jeden wariant 540 px z limitem 512 kB', () => {
    const v = variantsFor('portrait');
    expect(v).toBe(PORTRAIT_VARIANTS);
    expect(v.map((x: { width: number }) => x.width)).toEqual([540]);
    expect(v[0].limit).toBe(512 * 1024);
  });
  it('poziom (i brak orientacji) = 960/1280/720 z limitami 500 kB / 1,5 MB / 512 kB', () => {
    for (const o of ['landscape', undefined, '', 'inne']) {
      const v = variantsFor(o);
      expect(v).toBe(VARIANTS);
      expect(v.map((x: { width: number }) => x.width)).toEqual([960, 1280, 720]);
      expect(v.map((x: { limit: number }) => x.limit)).toEqual([512000, 1572864, 524288]);
    }
  });
  it('plik SRC nie jest kasowany; własne surowe nagranie tak', () => {
    expect(shouldRemoveRaw('film.mp4')).toBe(false);
    expect(shouldRemoveRaw('')).toBe(true);
  });
  it('z SRC nie ma nagrywania przeglądarką; bez SRC jest', () => {
    expect(shouldRecord('film.mp4')).toBe(false);
    expect(shouldRecord('')).toBe(true);
  });
});

// --- skrypt uruchomiony naprawdę, ffmpeg podstawiony (zapisuje argumenty, tworzy plik 20 kB) -------
let work: string;
let stub: string;
const STUB = `#!/usr/bin/env node
const fs = require('node:fs');
const a = process.argv.slice(2);
fs.appendFileSync(process.env.STUB_LOG, JSON.stringify(a) + '\\n');
fs.writeFileSync(a[a.length - 1], Buffer.alloc(SIZE));
`;
const stubWith = (size: number) => STUB.replace('SIZE', String(size));

beforeAll(() => {
  const cache = path.join(ROOT, 'node_modules', '.cache');
  fs.mkdirSync(cache, { recursive: true });
  work = fs.mkdtempSync(path.join(cache, 'rpv-'));
  stub = path.join(work, 'ffmpeg-stub.cjs');
  fs.writeFileSync(stub, stubWith(20000), { mode: 0o755 });
});

function run(extra: Record<string, string>) {
  const out = fs.mkdtempSync(path.join(work, 'out-'));
  const log = path.join(out, 'ffmpeg.log');
  const res = spawnSync(process.execPath, [SCRIPT], {
    encoding: 'utf8',
    timeout: 60000,
    env: {
      PATH: process.env['PATH'] ?? '',
      HOME: work,
      // adres nieistniejący: gdyby skrypt mimo SRC próbował nagrywać stronę, nie dotknie produkcji
      BASE: 'http://127.0.0.1:1',
      FFMPEG: stub,
      STUB_LOG: log,
      OUT: path.join(out, 'video'),
      NAME: 't',
      SECONDS: '12',
      ...extra,
    },
  });
  const calls: string[][] = fs.existsSync(log)
    ? fs
        .readFileSync(log, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((l) => JSON.parse(l) as string[])
    : [];
  const dir = path.join(out, 'video');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).sort() : [];
  return { res, calls, files };
}

function srcFile() {
  const f = path.join(fs.mkdtempSync(path.join(work, 'src-')), 'film.mp4');
  fs.writeFileSync(f, Buffer.alloc(5000));
  return f;
}

describe('record-portfolio-video.mjs w trybie SRC (uruchomiony skrypt)', () => {
  it('poziomo, START=3: 6 wywołań ffmpeg (3 szerokości × 2 kodeki), -ss 3 przed -i, SRC zostaje', () => {
    const src = srcFile();
    const { res, calls, files } = run({ SRC: src, START: '3' });
    expect(res.status, res.stderr).toBe(0);
    expect(calls.length).toBe(6);
    for (const a of calls) {
      expect(a[a.indexOf('-ss') + 1]).toBe('3');
      expect(a.indexOf('-ss')).toBeLessThan(a.indexOf('-i'));
      expect(a[a.indexOf('-i') + 1]).toBe(src);
      expect(a[a.indexOf('-t') + 1]).toBe('12');
      expect(a).toContain('-an');
    }
    expect(files).toEqual([
      't-1280.mp4',
      't-1280.webm',
      't-720.mp4',
      't-720.webm',
      't-960.mp4',
      't-960.webm',
    ]);
    expect(fs.existsSync(src)).toBe(true);
    expect(fs.statSync(src).size).toBe(5000);
  });

  it('START=0: bez -ss, SRC zostaje', () => {
    const src = srcFile();
    const { res, calls } = run({ SRC: src, START: '0' });
    expect(res.status, res.stderr).toBe(0);
    expect(calls.length).toBe(6);
    for (const a of calls) expect(a).not.toContain('-ss');
    expect(fs.existsSync(src)).toBe(true);
  });

  it('ORIENT=portrait: jeden wariant 540 px (webm + mp4), bez wariantów poziomych', () => {
    const src = srcFile();
    const { res, calls, files } = run({ SRC: src, START: '2', ORIENT: 'portrait' });
    expect(res.status, res.stderr).toBe(0);
    expect(calls.length).toBe(2);
    for (const a of calls) {
      expect(a.find((x) => x.startsWith('scale='))).toMatch(/^scale=540:/);
      expect(a[a.indexOf('-ss') + 1]).toBe('2');
    }
    expect(files).toEqual(['t-540.mp4', 't-540.webm']);
    expect(fs.existsSync(src)).toBe(true);
  });

  it('brak pliku SRC: błąd z komunikatem, ffmpeg nie jest wołany', () => {
    const { res, calls, files } = run({ SRC: path.join(work, 'nie-ma-takiego.mp4'), START: '1' });
    expect(res.status).toBe(1);
    expect(res.stderr).toContain('brak pliku SRC');
    expect(calls.length).toBe(0);
    expect(files).toEqual([]);
  });

  it('plik powyżej limitu pionu 512 kB: CRF rośnie, PRZEKROCZONY i kod 1, SRC zostaje', () => {
    const src = srcFile();
    const big = path.join(work, 'ffmpeg-big.cjs');
    fs.writeFileSync(big, stubWith(600000), { mode: 0o755 });
    const { res, calls } = run({ SRC: src, ORIENT: 'portrait', FFMPEG: big });
    expect(res.status).toBe(1);
    expect(res.stdout).toContain('PRZEKROCZONY');
    expect(calls.length).toBe(14); // 2 kodeki × (1 próba + 6 z wyższym CRF)
    expect(fs.existsSync(src)).toBe(true);
  });
});
