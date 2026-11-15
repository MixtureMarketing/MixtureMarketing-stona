import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { parse } from 'yaml';
import { evaluate, cropBox } from '../../scripts/lib/proportions.mjs';

// MIX-1732: the decision logic of the 16:9 gate (scripts/audit-proportions.mjs) is fail-closed: only an
// empty reason list is a pass. Every refusal below has a legitimate twin that passes.
type Row = {
  vp: string;
  error?: string | null;
  cardRatios: number[];
  cardSrc: string | null;
  hero: { ratio: number; src: string } | null;
};
const CARD = 'https://cdn.sanity.io/images/p/d/abc-2000x3000.jpg?w=800&h=450&fit=crop';
const HERO = 'https://cdn.sanity.io/images/p/d/abc-2000x3000.jpg?w=1600&h=900&fit=crop';
const R = 16 / 9;
const VPS = ['375x812', '1280x800'];
const row = (vp: string, over: Partial<Row> = {}): Row => ({
  vp,
  error: null,
  cardRatios: [R, R, R],
  cardSrc: CARD,
  hero: { ratio: R, src: HERO },
  ...over,
});
const good = () => VPS.map((v) => row(v));
const run = (rows: unknown) => (evaluate(rows, VPS) as string[]).join(' | ');

describe('MIX-1732: proportion gate decision (evaluate)', () => {
  it('the clean measurement passes (empty reason list)', () => {
    expect(evaluate(good(), VPS)).toEqual([]);
  });
  it('a ratio inside the tolerance passes, just outside is refused with the value', () => {
    expect(
      evaluate([row('375x812', { cardRatios: [1.7778 + 0.009] }), row('1280x800')], VPS),
    ).toEqual([]);
    expect(run([row('375x812', { cardRatios: [1.7778 + 0.0125] }), row('1280x800')])).toMatch(
      /375x812: card ratio 1\.790\d outside 1\.7778/,
    );
  });

  it.each<[string, () => unknown, RegExp]>([
    [
      '0 cards',
      () => [row('375x812', { cardRatios: [] }), row('1280x800')],
      /375x812: 0 cards found/,
    ],
    [
      'hero not found',
      () => [row('375x812'), row('1280x800', { hero: null })],
      /1280x800: hero not found/,
    ],
    [
      'SVG (logo) hero',
      () => [row('375x812', { hero: { ratio: R, src: '/assets/logo.svg' } }), row('1280x800')],
      /375x812: hero is an SVG/,
    ],
    [
      'SVG hero with a query',
      () => [row('375x812', { hero: { ratio: R, src: '/logo.SVG?v=1' } }), row('1280x800')],
      /hero is an SVG/,
    ],
    [
      'hero without src',
      () => [row('375x812', { hero: { ratio: R, src: '' } }), row('1280x800')],
      /hero is an SVG or has no src/,
    ],
    [
      'SVG card image',
      () => [row('375x812', { cardSrc: '/x.svg' }), row('1280x800')],
      /card image is an SVG/,
    ],
    [
      'missing card image',
      () => [row('375x812', { cardSrc: null }), row('1280x800')],
      /card image is an SVG or has no src/,
    ],
    [
      'page error row',
      () => [row('375x812', { error: 'page error: boom' }), row('1280x800')],
      /375x812: page error: boom/,
    ],
    ['viewport not measured', () => [row('375x812')], /1280x800: viewport not measured/],
    [
      '4:3 hero',
      () => [row('375x812'), row('1280x800', { hero: { ratio: 4 / 3, src: HERO } })],
      /1280x800: hero ratio 1\.3333 outside/,
    ],
    [
      '4:3 card',
      () => [row('375x812', { cardRatios: [R, 4 / 3] }), row('1280x800')],
      /card ratio 1\.3333 outside/,
    ],
    [
      'NaN card ratio',
      () => [row('375x812', { cardRatios: [NaN] }), row('1280x800')],
      /card ratio is not a positive number/,
    ],
    [
      'zero hero ratio',
      () => [row('375x812'), row('1280x800', { hero: { ratio: 0, src: HERO } })],
      /hero ratio is not a positive number/,
    ],
    [
      'hero crop=top (U1/U6)',
      () => [row('375x812', { hero: { ratio: R, src: HERO + '&crop=top' } }), row('1280x800')],
      /card and hero crop box differ/,
    ],
    [
      'hero without fit=crop',
      () => [
        row('375x812', { hero: { ratio: R, src: HERO.replace('&fit=crop', '') } }),
        row('1280x800'),
      ],
      /crop box differ/,
    ],
    [
      'hero other rect',
      () => [
        row('375x812', { hero: { ratio: R, src: HERO + '&rect=0,0,10,10' } }),
        row('1280x800'),
      ],
      /crop box differ/,
    ],
    [
      'hero URL 4:3 crop size',
      () => [
        row('375x812', { hero: { ratio: R, src: HERO.replace('h=900', 'h=1200') } }),
        row('1280x800'),
      ],
      /hero image URL crop 1\.3333/,
    ],
    [
      'card URL without h',
      () => [row('375x812', { cardSrc: CARD.replace('&h=450', '') }), row('1280x800')],
      /card image URL has no w\/h crop size/,
    ],
    [
      'crop box differs between widths',
      () => [
        row('375x812'),
        row('1280x800', {
          cardSrc: CARD + '&crop=top',
          hero: { ratio: R, src: HERO + '&crop=top' },
        }),
      ],
      /1280x800: crop box differs from 375x812/,
    ],
    ['no rows', () => [], /nothing measured/],
    [
      'null row',
      () => [null, row('1280x800')],
      /empty measurement row|375x812: viewport not measured/,
    ],
  ])('refuses: %s (twin: the clean rows pass)', (_n, make, text) => {
    expect(run(make())).toMatch(text);
    expect(evaluate(good(), VPS)).toEqual([]);
  });

  it('non-array input is refused, not thrown', () => {
    expect(run(undefined)).toMatch(/nothing measured/);
    expect(run('x')).toMatch(/nothing measured/);
  });
  it('the width in the URL does not matter, only the crop box (twin: different w, same box)', () => {
    const rows = [
      row('375x812', { cardSrc: CARD.replace('w=800&h=450', 'w=400&h=225') }),
      row('1280x800'),
    ];
    expect(evaluate(rows, VPS)).toEqual([]);
  });
  it('cropBox: unusable input is null', () => {
    expect(cropBox('')).toBeNull();
    expect(cropBox(null)).toBeNull();
    expect(cropBox(CARD)).toMatchObject({ fit: 'crop', crop: null, urlRatio: 800 / 450 });
  });
});

describe('MIX-1732: the gate is wired as a blocking CI step after the build', () => {
  const root = path.resolve(__dirname, '../..');
  const wf = parse(fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8')) as {
    jobs: {
      ci: {
        steps: Array<{
          name?: string;
          run?: string;
          uses?: string;
          if?: string;
          'continue-on-error'?: boolean;
        }>;
      };
    };
  };
  const steps = wf.jobs.ci.steps;
  const gate = steps.findIndex((k) => k.run === 'npm run audit:proportions');
  it('exists after npm run build and before the first deploy, blocking and unconditional', () => {
    expect(gate).toBeGreaterThan(-1);
    expect(gate).toBeGreaterThan(steps.findIndex((k) => k.run === 'npm run build'));
    expect(gate).toBeLessThan(
      steps.findIndex((k) => (k.uses ?? '').startsWith('cloudflare/wrangler-action')),
    );
    expect(steps[gate]['continue-on-error']).toBeUndefined();
    expect(steps[gate].if).toBeUndefined();
  });
  it('the npm script runs the audit on dist', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts['audit:proportions']).toBe('node scripts/audit-proportions.mjs dist');
    expect(fs.existsSync(path.join(root, 'scripts/audit-proportions.mjs'))).toBe(true);
  });
});
