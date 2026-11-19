// MIX-1934: strażnik klucza Turnstile (build i wgranie), ci.yml, test Cloudflare Access i skrypt
// lidera. Formy ataku z karty (≥ 11), każda z dozwolonym bliźniakiem. Sieć: atrapa `curl` w PATH.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { parse } from 'yaml';
import {
  TURNSTILE_PROD_SITE_KEY as PROD,
  TURNSTILE_TEST_SITE_KEY as TEST,
  checkBuildKey as checkBuildKeyJs,
  checkDeploy as checkDeployJs,
} from '../../scripts/lib/turnstileKeyGuard.mjs';
import { TURNSTILE_PROD_SITE_KEY as PROD_FRONT, resolveTurnstileSiteKey } from '../../config/turnstileKey';

const root = path.resolve(__dirname, '../..');
type Wynik = { ok: boolean; reason?: string; key?: string; cfEnv?: string };
const checkBuildKey = checkBuildKeyJs as unknown as (a: { target: unknown; key: unknown }) => Wynik;
type DeployIn = { target?: unknown; branch?: unknown; productionBranch?: unknown; distTexts?: string[] };
const checkDeploy = checkDeployJs as unknown as (a: DeployIn) => Wynik;
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'mix1934-'));

// ---------- 1. build ----------
describe('checkBuildKey: formy ataku i bliźniacy', () => {
  const ok = (target: string, key: string | undefined) => checkBuildKey({ target, key }).ok;
  it('A1 klucz testowy w buildzie main (prod) = odmowa; bliźniak: prod z kluczem produkcyjnym', () => {
    expect(ok('prod', TEST)).toBe(false);
    expect(ok('prod', PROD)).toBe(true);
  });
  it('A1b klucz testowy w PR (none) i lokalnie = odmowa; bliźniak: preview z kluczem testowym', () => {
    expect(ok('none', TEST)).toBe(false);
    expect(ok('local', TEST)).toBe(false);
    expect(ok('preview', TEST)).toBe(true);
  });
  it('A2 pusta zmienna / brak zmiennej w CI = odmowa; bliźniak: brak zmiennej lokalnie = klucz produkcyjny', () => {
    for (const t of ['prod', 'preview', 'none']) {
      expect(ok(t, '')).toBe(false);
      expect(ok(t, undefined)).toBe(false);
    }
    expect(checkBuildKey({ target: 'local', key: undefined })).toEqual({ ok: true, key: PROD });
    expect(ok('local', '')).toBe(false);
  });
  it('A3 spacja / nowa linia / tabulator w kluczu = odmowa; bliźniak: ten sam klucz bez białych znaków', () => {
    for (const k of [` ${TEST}`, `${TEST} `, `${TEST}\n`, `${PROD}\n`, `\t${PROD}`]) {
      expect(ok('preview', k)).toBe(false);
      expect(checkBuildKey({ target: 'preview', key: k }).reason).toMatch(/biały znak/);
    }
    expect(ok('preview', TEST)).toBe(true);
  });
  it('A4 klucz testowy wielkimi literami = odmowa; bliźniak: dokładna wielkość liter', () => {
    expect(ok('preview', TEST.toUpperCase())).toBe(false);
    expect(ok('preview', TEST.toLowerCase())).toBe(false);
    expect(ok('prod', PROD.toLowerCase())).toBe(false);
    expect(ok('preview', TEST)).toBe(true);
  });
  it('A5 trzeci klucz spoza listy (inne klucze testowe Cloudflare, obcy) = odmowa; bliźniak: dwa z listy', () => {
    for (const k of ['1x00000000000000000000BB', '2x00000000000000000000AB', '3x00000000000000000000FF', '0x4AAAAAAobcy']) {
      expect(ok('preview', k)).toBe(false);
      expect(checkBuildKey({ target: 'preview', key: k }).reason).not.toContain(k);
    }
    expect(ok('preview', PROD)).toBe(true);
    expect(ok('preview', TEST)).toBe(true);
  });
  it('A6 nieznany cel budowy (Prod, production, pusty, dev) = odmowa; bliźniak: znane cele', () => {
    for (const t of ['Prod', 'production', '', 'dev', 'PREVIEW'])
      expect(checkBuildKey({ target: t, key: PROD }).reason).toMatch(/nieznany cel budowy/);
    for (const t of ['prod', 'preview', 'none', 'local']) expect(ok(t, PROD)).toBe(true);
  });
});

describe('vite.config.ts: strażnik działa przy budowie (process.env i pliki .env*)', () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env = { ...saved };
    vi.restoreAllMocks();
  });
  async function build(dir: string, env: Record<string, string | undefined>) {
    vi.spyOn(process, 'cwd').mockReturnValue(dir);
    for (const [k, v] of Object.entries(env)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    const mod = (await import('../../vite.config')).default as unknown as (
      c: { mode: string; command: string },
    ) => unknown;
    return () => mod({ mode: 'production', command: 'build' });
  }
  it('A7 zmienna w pliku .env.production z kluczem testowym przy celu prod = build przerwany; bliźniak: plik z kluczem produkcyjnym', async () => {
    const d = tmp();
    fs.writeFileSync(path.join(d, '.env.production'), `VITE_TURNSTILE_SITE_KEY=${TEST}\n`);
    const run = await build(d, { MM_DEPLOY_TARGET: 'prod', VITE_TURNSTILE_SITE_KEY: undefined });
    expect(run).toThrow(/klucz testowy Turnstile dla celu 'prod'/);
    fs.writeFileSync(path.join(d, '.env.production'), `VITE_TURNSTILE_SITE_KEY=${PROD}\n`);
    const run2 = await build(d, { MM_DEPLOY_TARGET: 'prod', VITE_TURNSTILE_SITE_KEY: undefined });
    expect(run2).not.toThrow();
  });
  it('A7b plik .env.production z kluczem testowym bez celu (build lokalny) = przerwany; bliźniak: bez pliku', async () => {
    const d = tmp();
    fs.writeFileSync(path.join(d, '.env.production'), `VITE_TURNSTILE_SITE_KEY=${TEST}\n`);
    expect(await build(d, { MM_DEPLOY_TARGET: undefined, VITE_TURNSTILE_SITE_KEY: undefined })).toThrow(/ODMOWA/);
    const d2 = tmp();
    expect(await build(d2, { MM_DEPLOY_TARGET: undefined, VITE_TURNSTILE_SITE_KEY: undefined })).not.toThrow();
  });
  it('cel z env: nieznany cel = przerwany; bliźniak preview + klucz testowy = przechodzi', async () => {
    const d = tmp();
    expect(await build(d, { MM_DEPLOY_TARGET: 'production', VITE_TURNSTILE_SITE_KEY: PROD })).toThrow(/nieznany cel/);
    expect(await build(d, { MM_DEPLOY_TARGET: 'preview', VITE_TURNSTILE_SITE_KEY: TEST })).not.toThrow();
  });
});

describe('front: klucz z budowy', () => {
  it('klucz produkcyjny frontu = klucz produkcyjny strażnika; brak/pusta zmienna = produkcyjny', () => {
    expect(PROD_FRONT).toBe(PROD);
    expect(resolveTurnstileSiteKey(undefined)).toBe(PROD);
    expect(resolveTurnstileSiteKey('')).toBe(PROD);
    expect(resolveTurnstileSiteKey(TEST)).toBe(TEST);
  });
  it('kod frontu nie zawiera literału klucza testowego (bundle produkcji bez niego); site.ts czyta zmienną budowy', () => {
    const src = fs.readFileSync(path.join(root, 'config/turnstileKey.ts'), 'utf8');
    const site = fs.readFileSync(path.join(root, 'config/site.ts'), 'utf8');
    expect(src).not.toMatch(/[1-3]x0{20}/i);
    expect(site).not.toMatch(/[1-3]x0{20}/i);
    expect(site).toContain('resolveTurnstileSiteKey(import.meta.env.VITE_TURNSTILE_SITE_KEY)');
  });
});

// ---------- 2. wgranie ----------
const distProd = [`<html>${PROD}</html>`, 'var a=1;'];
const distTest = [`<html>${TEST}</html>`];
describe('checkDeploy: środowisko Cloudflare z production_branch, nie z nazwy gałęzi', () => {
  const d = (o: DeployIn) =>
    checkDeploy({ target: 'prod', branch: 'main', productionBranch: 'main', distTexts: distProd, ...o });
  it('bliźniaki: prod/main/Production z kluczem produkcyjnym; preview/dev/Preview z kluczem testowym', () => {
    expect(d({})).toEqual({ ok: true, cfEnv: 'Production' });
    expect(d({ target: 'preview', branch: 'dev', distTexts: distTest })).toEqual({ ok: true, cfEnv: 'Preview' });
    expect(d({ target: 'preview', branch: 'dev' }).ok).toBe(true);
  });
  it('A8 dist z kluczem testowym (dowolnym 1x/2x/3x) do Production = odmowa', () => {
    expect(d({ distTexts: [...distProd, `x="${TEST}"`] }).reason).toMatch(/zawiera klucz testowy/);
    expect(d({ distTexts: [...distProd, 'k="2x00000000000000000000AB"'] }).ok).toBe(false);
    expect(d({ distTexts: [...distProd, 'k="1X00000000000000000000aa"'] }).ok).toBe(false);
    expect(d({ distTexts: ['nic'] }).reason).toMatch(/nie zawiera klucza produkcyjnego/);
  });
  it('A9 gałąź inna niż main wgrywana do Production (production_branch=dev w Cloudflare) = odmowa', () => {
    expect(d({ target: 'preview', branch: 'dev', productionBranch: 'dev', distTexts: distTest }).reason).toMatch(
      /trafiłaby do środowiska Production/,
    );
    expect(d({ branch: 'dev', productionBranch: 'dev' }).reason).toMatch(/dozwolona tylko main/);
    expect(d({ branch: 'main', productionBranch: 'master' }).reason).toMatch(/środowisko Cloudflare = Preview/);
  });
  it('A10 nieznany cel / brak production_branch / pusty dist = odmowa', () => {
    expect(d({ target: 'production' }).ok).toBe(false);
    expect(d({ target: 'none' }).ok).toBe(false);
    expect(d({ productionBranch: '' }).ok).toBe(false);
    expect(d({ productionBranch: undefined }).ok).toBe(false);
    expect(d({ distTexts: [] }).ok).toBe(false);
    expect(d({ target: 'preview', branch: 'feature', productionBranch: 'main' }).ok).toBe(false);
  });
  it('fałszywy alarm: 0x + 20 zer (liczba w kodzie) nie jest kluczem testowym', () => {
    expect(d({ distTexts: [...distProd, 'n=0x0000000000000000000000AA'] }).ok).toBe(true);
  });
});

// ---------- 3. skrypty z atrapą curl ----------
function fakeCurl(dir: string, script: string): string {
  const bin = path.join(dir, 'bin');
  fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'curl'), `#!/usr/bin/env bash\necho "$@" >> "${dir}/curl.log"\n${script}\n`, { mode: 0o755 });
  return `${bin}:${process.env.PATH}`;
}
const run = (cmd: string, args: string[], env: Record<string, string>) =>
  spawnSync(cmd, args, { cwd: root, encoding: 'utf8', env: { ...process.env, ...env } });
const project = (pb: string) => JSON.stringify({ success: true, result: { production_branch: pb } });
const ACC = 'a'.repeat(32);

describe('scripts/ci-turnstile-deploy.sh (API Cloudflare + dist)', () => {
  function setup(pb: string, dist: string[]) {
    const d = tmp();
    fs.writeFileSync(path.join(d, 'project.json'), project(pb));
    const dd = path.join(d, 'dist');
    fs.mkdirSync(path.join(dd, 'assets'), { recursive: true });
    dist.forEach((t, i) => fs.writeFileSync(path.join(dd, 'assets', `f${i}.js`), t));
    fs.writeFileSync(path.join(dd, 'index.html'), '<html></html>');
    const PATH = fakeCurl(d, `out=""; while [ $# -gt 0 ]; do [ "$1" = "-o" ] && out="$2"; shift; done; cp "${d}/project.json" "$out"`);
    return { d, env: { PATH, DIST_DIR: dd, RUNNER_TEMP: d, CF_API_TOKEN: 'tok', CF_ACCOUNT_ID: ACC } };
  }
  it('bliźniak: prod/main, production_branch=main, dist z kluczem produkcyjnym = rc 0', () => {
    const { env } = setup('main', distProd);
    const r = run('bash', ['scripts/ci-turnstile-deploy.sh', 'prod', 'main'], env);
    expect(r.stderr).toBe('');
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('środowisko Production');
  });
  it('A9: preview/dev, gdy Cloudflare ma production_branch=dev = rc 1 z linią powodu', () => {
    const { env } = setup('dev', distTest);
    const r = run('bash', ['scripts/ci-turnstile-deploy.sh', 'preview', 'dev'], env);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/ODMOWA: .*Production/);
  });
  it('A8: dist z kluczem testowym do Production = rc 1', () => {
    const { env } = setup('main', [...distProd, TEST]);
    expect(run('bash', ['scripts/ci-turnstile-deploy.sh', 'prod', 'main'], env).status).toBe(1);
  });
  it('fail-closed: brak tokenu, złe konto, błąd API = rc 1', () => {
    const { env, d } = setup('main', distProd);
    expect(run('bash', ['scripts/ci-turnstile-deploy.sh', 'prod', 'main'], { ...env, CF_API_TOKEN: '' }).status).toBe(1);
    expect(run('bash', ['scripts/ci-turnstile-deploy.sh', 'prod', 'main'], { ...env, CF_ACCOUNT_ID: 'x' }).status).toBe(1);
    const PATH = fakeCurl(fs.mkdtempSync(path.join(d, 'y')), 'exit 22');
    expect(run('bash', ['scripts/ci-turnstile-deploy.sh', 'prod', 'main'], { ...env, PATH }).status).toBe(1);
    fs.writeFileSync(path.join(d, 'project.json'), '{"success":false}');
    expect(run('bash', ['scripts/ci-turnstile-deploy.sh', 'prod', 'main'], env).status).toBe(1);
  });
});

describe('scripts/preview-access-check.sh (Preview za Cloudflare Access)', () => {
  const check = (out: string) => {
    const d = tmp();
    return run('bash', ['scripts/preview-access-check.sh'], { PATH: fakeCurl(d, `printf '%s' '${out}'`) });
  };
  it('bliźniaki: 302 do *.cloudflareaccess.com i 403 = rc 0', () => {
    expect(check('302 https://mixturemarketing.cloudflareaccess.com/cdn-cgi/access/login/x').status).toBe(0);
    expect(check('403 ').status).toBe(0);
  });
  it('A11 Preview bez CF Access (200), przekierowanie gdzie indziej, 404, 5xx = rc 1', () => {
    for (const o of [
      '200 ',
      '302 https://evil.example.com/cloudflareaccess.com',
      '302 https://cloudflareaccess.com.evil.pl/',
      '302 http://x.cloudflareaccess.com/',
      '301 https://mixturemarketing.cloudflareaccess.com/',
      '404 ',
      '502 ',
    ]) {
      const r = check(o);
      expect(r.status, o).toBe(1);
      expect(r.stderr).toMatch(/ODMOWA/);
    }
  });
});

describe('scripts/preview-turnstile-test-secret.sh (lider, po TAK)', () => {
  function setup(access: string, pb: string) {
    const d = tmp();
    const PATH = fakeCurl(
      d,
      `case "$*" in *-w*) printf '%s' '${access}';; *PATCH*) echo '{"success":true}';; *) echo '${project(pb)}';; esac`,
    );
    return { d, env: { PATH, CLOUDFLARE_API_TOKEN: 'tok', CLOUDFLARE_ACCOUNT_ID: ACC } };
  }
  const log = (d: string) => (fs.existsSync(`${d}/curl.log`) ? fs.readFileSync(`${d}/curl.log`, 'utf8') : '');
  it('domyślnie próba: rc 0, bez PATCH; --wykonaj: PATCH tylko preview', () => {
    const a = setup('302 https://mixturemarketing.cloudflareaccess.com/x', 'main');
    const r = run('bash', ['scripts/preview-turnstile-test-secret.sh'], a.env);
    expect(r.status).toBe(0);
    expect(log(a.d)).not.toContain('PATCH');
    const b = setup('302 https://mixturemarketing.cloudflareaccess.com/x', 'main');
    const r2 = run('bash', ['scripts/preview-turnstile-test-secret.sh', '--wykonaj'], b.env);
    expect(r2.status).toBe(0);
    const patch = log(b.d).split('\n').find((l) => l.includes('PATCH')) ?? '';
    expect(patch).toContain('"preview"');
    expect(patch).not.toContain('"production"');
  });
  it('A11: Preview bez Access = odmowa przed jakimkolwiek wywołaniem API', () => {
    const a = setup('200 ', 'main');
    const r = run('bash', ['scripts/preview-turnstile-test-secret.sh', '--wykonaj'], a.env);
    expect(r.status).toBe(1);
    expect(log(a.d)).not.toContain('api.cloudflare.com');
  });
  it('A9: production_branch ≠ main = odmowa bez PATCH', () => {
    const a = setup('403 ', 'dev');
    const r = run('bash', ['scripts/preview-turnstile-test-secret.sh', '--wykonaj'], a.env);
    expect(r.status).toBe(1);
    expect(log(a.d)).not.toContain('PATCH');
  });
});

// ---------- 4. ci.yml ----------
type Krok = { name?: string; id?: string; if?: string; run?: string; env?: Record<string, string>; with?: Record<string, string>; 'continue-on-error'?: boolean };
const kroki = (): Krok[] =>
  (parse(fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8')) as { jobs: { ci: { steps: Krok[] } } }).jobs.ci.steps;

/** Wylicza wyrażenie `${{ steps.target.outputs.target == 'preview' && 'A' || 'B' }}` dla celu. */
function evalKey(expr: string, target: string): string {
  const m = /^\$\{\{ steps\.target\.outputs\.target == '(\w+)' && '([^']*)' \|\| '([^']*)' \}\}$/.exec(expr);
  if (!m) throw new Error(`nieobsługiwane wyrażenie: ${expr}`);
  return target === m[1] && m[2] !== '' ? m[2] : m[3];
}

describe('ci.yml: main nigdy nie dostaje klucza testowego', () => {
  const build = () => kroki().find((k) => k.run === 'npm run build')!;
  it('klucz: prod i none = produkcyjny, preview = testowy; cel przekazany do builda', () => {
    const e = build().env!;
    expect(evalKey(e.VITE_TURNSTILE_SITE_KEY, 'prod')).toBe(PROD);
    expect(evalKey(e.VITE_TURNSTILE_SITE_KEY, 'none')).toBe(PROD);
    expect(evalKey(e.VITE_TURNSTILE_SITE_KEY, 'preview')).toBe(TEST);
    expect(e.MM_DEPLOY_TARGET).toBe('${{ steps.target.outputs.target }}');
  });
  it('klucz testowy występuje w ci.yml tylko w wyrażeniu warunkowym preview (nigdzie indziej)', () => {
    const txt = fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8');
    const lines = txt.split('\n').filter((l) => /[1-3]x0{20}/i.test(l));
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("steps.target.outputs.target == 'preview' && '1x00000000000000000000AA'");
  });
  it('strażnik Turnstile przed każdym wdrożeniem, ta sama gałąź co --branch wdrożenia, blokujący', () => {
    const k = kroki();
    for (const [target, branch] of [['prod', 'main'], ['preview', 'dev']]) {
      const g = k.findIndex((s) => s.run === `bash scripts/ci-turnstile-deploy.sh ${target} ${branch}`);
      const dep = k.findIndex((s) => (s.with?.command ?? '').includes(`--branch=${branch} `));
      expect(g, target).toBeGreaterThan(-1);
      expect(dep).toBeGreaterThan(g);
      expect(k[g].if).toBe(`steps.target.outputs.target == '${target}'`);
      expect(k[dep].if).toBe(k[g].if);
      expect(k[g]['continue-on-error']).toBeFalsy();
      expect(k[g].env).toEqual({
        CF_API_TOKEN: '${{ secrets.CLOUDFLARE_API_TOKEN }}',
        CF_ACCOUNT_ID: '${{ secrets.CLOUDFLARE_ACCOUNT_ID }}',
      });
    }
  });
  it('negatywna noga: wyrażenie z odwróconym warunkiem dałoby main klucz testowy (test to wykrywa)', () => {
    const zle = "${{ steps.target.outputs.target == 'prod' && '1x00000000000000000000AA' || '0x4AAAAAACYHLgkgk3FJUj06' }}";
    expect(evalKey(zle, 'prod')).toBe(TEST);
    expect(evalKey(zle, 'prod')).not.toBe(PROD);
  });
});
