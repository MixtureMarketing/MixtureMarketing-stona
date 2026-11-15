import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it, expect, afterAll } from 'vitest';
import { parse } from 'yaml';
import { evaluate, cropBox, applyPageErrors, exitCode } from '../../scripts/lib/proportions.mjs';

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

// MIX-1736 (W7/W8 of the MIX-1732 verdict): the exit-code mapping and the page-error mapping are pure
// functions with tests, and the script is checked to use them (a wiring regression cannot pass CI).
describe('MIX-1736: exit code of the gate (exitCode)', () => {
  it('pass: no reasons and every viewport measured is rc 0', () => {
    expect(exitCode([], good(), 2)).toBe(0);
  });
  it('criterion fails with everything measured is rc 1 (twin of rc 2)', () => {
    expect(exitCode(['x: card ratio 1.3333 outside'], good(), 2)).toBe(1);
  });
  it('not measured is rc 2, never rc 0 (W7): reasons present and an errored row', () => {
    const rows = [row('375x812', { error: 'not measured: timeout' }), row('1280x800')];
    expect(exitCode(['375x812: not measured: timeout'], rows, 2)).toBe(2);
  });
  it('an errored row is rc 2 even if the reason list were empty', () => {
    expect(exitCode([], [row('375x812', { error: 'page error: x' }), row('1280x800')], 2)).toBe(2);
  });
  it('missing viewport row (count mismatch) is rc 2, also with empty reasons', () => {
    expect(exitCode([], [row('375x812')], 2)).toBe(2);
    expect(exitCode(['1280x800: viewport not measured'], [row('375x812')], 2)).toBe(2);
  });
  it('empty rows or a null row is rc 2', () => {
    expect(exitCode(['no measurement rows (nothing measured)'], [], 2)).toBe(2);
    expect(exitCode([], [null, row('1280x800')] as never, 2)).toBe(2);
  });
  it('non-array input is rc 2', () => {
    expect(exitCode(undefined as never, good(), 2)).toBe(2);
    expect(exitCode([], null as never, 2)).toBe(2);
  });
});

describe('MIX-1736: page errors become a refusal (applyPageErrors)', () => {
  it('a page error sets row.error and evaluate refuses with the text (W8)', () => {
    const r = applyPageErrors(row('375x812'), ['boom']);
    expect(r.error).toBe('page error: boom');
    expect(evaluate([r, row('1280x800')], VPS).join(' | ')).toMatch(/375x812: page error: boom/);
  });
  it('twin: no page errors leaves the row untouched and passing', () => {
    const r = applyPageErrors(row('375x812'), []);
    expect(r.error).toBeNull();
    expect(evaluate([r, row('1280x800')], VPS)).toEqual([]);
  });
  it('non-array page errors do not throw and do not invent an error', () => {
    expect(applyPageErrors(row('375x812'), undefined as never).error).toBeNull();
  });
});

// Behavioural test of the real script: scripts/audit-proportions.mjs runs as a child process with the
// bare import 'puppeteer' redirected to a fake driver (fixtures/fake-puppeteer), against a tiny static dist.
// The server, the viewport loop, evaluate() and the exit code are the script's own code.
describe('MIX-1736: the real script main path (fake browser driver, exit codes)', () => {
  const root = path.resolve(__dirname, '../..');
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'proportions-dist-'));
  fs.writeFileSync(path.join(dist, 'index.html'), '<!doctype html><title>x</title>');
  afterAll(() => fs.rmSync(dist, { recursive: true, force: true }));
  const gate = (scenario: Record<string, unknown>, distDir = dist) =>
    new Promise<{ rc: number | null; out: string }>((resolve) => {
      execFile(
        process.execPath,
        [
          '--import',
          path.join(root, 'tests/scripts/fixtures/fake-puppeteer/register.mjs'),
          path.join(root, 'scripts/audit-proportions.mjs'),
          distDir,
        ],
        {
          env: { ...process.env, FAKE_PUPPETEER: JSON.stringify(scenario) },
          encoding: 'utf8',
          timeout: 60000,
        },
        (err, stdout, stderr) => {
          const code = err ? (err as { code?: unknown }).code : 0;
          resolve({ rc: typeof code === 'number' ? code : null, out: `${stdout}${stderr}` });
        },
      );
    });
  const T = 40000;

  it.concurrent('all viewports measured and 16:9: rc 0', { timeout: T }, async () => {
    const r = await gate({});
    expect(r.out).toContain('PROPORTIONS OK');
    expect(r.rc).toBe(0);
  });
  it.concurrent(
    'card ratio wrong on every viewport: rc 1 with the value',
    { timeout: T },
    async () => {
      const r = await gate({ cardRatio: 1.3333 });
      expect(r.out).toMatch(/FAIL: 375x812: card ratio 1\.3333 outside/);
      expect(r.out).toContain('PROPORTIONS NIE');
      expect(r.rc).toBe(1);
    },
  );
  it.concurrent('hero ratio wrong: rc 1', { timeout: T }, async () => {
    const r = await gate({ heroRatio: 1.5 });
    expect(r.out).toMatch(/FAIL: 1280x800: hero ratio 1\.5000 outside/);
    expect(r.rc).toBe(1);
  });
  it.concurrent('page error on the first viewport only: rc 2 (W8)', { timeout: T }, async () => {
    const r = await gate({ errorOn: ['375x812'] });
    expect(r.out).toMatch(/FAIL: 375x812: page error: boom 375x812/);
    expect(r.rc).toBe(2);
  });
  it.concurrent('page error on the second viewport only: rc 2 (W8)', { timeout: T }, async () => {
    const r = await gate({ errorOn: ['1280x800'] });
    expect(r.out).toMatch(/FAIL: 1280x800: page error: boom 1280x800/);
    expect(r.rc).toBe(2);
  });
  it.concurrent('page errors on both viewports: rc 2', { timeout: T }, async () => {
    expect((await gate({ errorOn: ['375x812', '1280x800'] })).rc).toBe(2);
  });
  it.concurrent(
    'page error together with a wrong ratio is still rc 2 (not 1)',
    { timeout: T },
    async () => {
      expect((await gate({ errorOn: ['375x812'], cardRatio: 1.3333 })).rc).toBe(2);
    },
  );
  it.concurrent(
    'the second viewport cannot be opened (missing row): rc 2',
    { timeout: T },
    async () => {
      const r = await gate({ newPageFailsAt: 2 });
      expect(r.out).toMatch(/FAIL: 1280x800: viewport not measured/);
      expect(r.rc).toBe(2);
    },
  );
  it.concurrent('no viewport can be opened (no rows): rc 2', { timeout: T }, async () => {
    const r = await gate({ newPageFailsAt: 1 });
    expect(r.out).toMatch(/FAIL: no measurement rows/);
    expect(r.rc).toBe(2);
  });
  it.concurrent('dist without index.html: rc 2 with the reason line', { timeout: T }, async () => {
    const r = await gate({}, path.join(dist, 'missing'));
    expect(r.out).toMatch(/FAIL: dist not found or has no index\.html/);
    expect(r.rc).toBe(2);
  });
});
