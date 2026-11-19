// MIX-1934: strażnik klucza strony Turnstile (allowlista, fail-closed). Czyste funkcje bez I/O:
// woła je vite.config.ts (build) i scripts/ci-turnstile-guard.mjs (przed wgraniem do Cloudflare).
//
// Dozwolone są DOKŁADNIE dwie wartości VITE_TURNSTILE_SITE_KEY (bez trim, bez zmiany wielkości liter):
//   - klucz produkcyjny (ten sam co dotąd w config/site.ts),
//   - publiczny klucz testowy Cloudflare „zawsze przechodzi” (dokumentacja Turnstile, „Testing”),
//     dozwolony WYŁĄCZNIE dla celu `preview`.
// Każda odmowa ma jedną linię powodu (bez wartości klucza spoza listy).

export const TURNSTILE_PROD_SITE_KEY = '0x4AAAAAACYHLgkgk3FJUj06';
export const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';

/** Wzorzec wszystkich publicznych kluczy testowych Cloudflare (1x/2x/3x + zera + 2 znaki). */
export const TURNSTILE_ANY_TEST_SITE_KEY_RE = /(?<![0-9A-Za-z])[1-3]x0{20}[0-9A-Za-z]{2}/i;

/** Cele budowy z kroku „Resolve deploy target” (scripts/ci-deploy-guard.sh) + `local`. */
export const BUILD_TARGETS = ['prod', 'preview', 'none', 'local'];

const fail = (reason) => ({ ok: false, reason: `turnstile-guard: ODMOWA: ${reason}` });

/** Opis wartości do linii powodu, bez wypisywania samej wartości. */
function describe(key) {
  if (key === undefined) return 'brak zmiennej';
  if (typeof key !== 'string') return 'nie tekst';
  if (key === '') return 'pusta wartość';
  if (key !== key.trim()) return 'biały znak na brzegu';
  if (key.toLowerCase() === TURNSTILE_TEST_SITE_KEY.toLowerCase()) return 'klucz testowy w innej wielkości liter';
  if (key.toLowerCase() === TURNSTILE_PROD_SITE_KEY.toLowerCase()) return 'klucz produkcyjny w innej wielkości liter';
  return `wartość spoza allowlisty (${key.length} zn.)`;
}

/**
 * Build: `target` z MM_DEPLOY_TARGET (brak = `local`, budowa poza CI), `key` = wartość
 * VITE_TURNSTILE_SITE_KEY widziana przez Vite (process.env + pliki .env*).
 *   prod | none -> wymagany klucz produkcyjny (pusty, testowy, inny = odmowa)
 *   preview     -> klucz produkcyjny albo testowy
 *   local       -> brak zmiennej (aplikacja bierze klucz produkcyjny) albo klucz produkcyjny
 *   inny cel    -> odmowa
 */
export function checkBuildKey({ target, key }) {
  if (typeof target !== 'string' || !BUILD_TARGETS.includes(target))
    return fail(`nieznany cel budowy (MM_DEPLOY_TARGET=${JSON.stringify(String(target)).slice(0, 40)})`);
  if (target === 'local' && key === undefined) return { ok: true, key: TURNSTILE_PROD_SITE_KEY };
  if (key === TURNSTILE_PROD_SITE_KEY) return { ok: true, key };
  if (key === TURNSTILE_TEST_SITE_KEY) {
    if (target === 'preview') return { ok: true, key };
    return fail(`klucz testowy Turnstile dla celu '${target}' (dozwolony tylko preview)`);
  }
  return fail(`VITE_TURNSTILE_SITE_KEY: ${describe(key)} (cel '${target}')`);
}

/**
 * Wgranie: środowisko Cloudflare wyznacza `--branch` wgrania porównany z `production_branch`
 * projektu Pages (z API Cloudflare), nie sama nazwa gałęzi w git.
 *   target prod    -> branch 'main' ORAZ środowisko Production
 *   target preview -> branch 'dev'  ORAZ środowisko Preview
 * Production: w żadnym pliku dist nie ma klucza testowego (żadnego z 1x/2x/3x…), jest klucz
 * produkcyjny. Preview: jest klucz produkcyjny albo testowy.
 * `distTexts`: treści plików tekstowych dist (html/js/json/txt).
 */
export function checkDeploy({ target, branch, productionBranch, distTexts }) {
  if (target !== 'prod' && target !== 'preview') return fail(`nieznany cel wgrania '${String(target)}'`);
  if (typeof productionBranch !== 'string' || productionBranch === '')
    return fail('brak production_branch projektu Cloudflare Pages (API)');
  if (typeof branch !== 'string' || branch === '') return fail('brak gałęzi wgrania (--branch)');
  const cfEnv = branch === productionBranch ? 'Production' : 'Preview';
  if (target === 'prod') {
    if (branch !== 'main') return fail(`cel prod, a gałąź wgrania '${branch}' (dozwolona tylko main)`);
    if (cfEnv !== 'Production')
      return fail(`cel prod, a środowisko Cloudflare = ${cfEnv} (production_branch='${productionBranch}')`);
  } else {
    if (branch !== 'dev') return fail(`cel preview, a gałąź wgrania '${branch}' (dozwolona tylko dev)`);
    if (cfEnv !== 'Preview')
      return fail(`gałąź '${branch}' trafiłaby do środowiska Production (production_branch='${productionBranch}')`);
  }
  if (!Array.isArray(distTexts) || distTexts.length === 0) return fail('pusty dist');
  const hasProd = distTexts.some((t) => t.includes(TURNSTILE_PROD_SITE_KEY));
  const hasTest = distTexts.some((t) => TURNSTILE_ANY_TEST_SITE_KEY_RE.test(t));
  if (cfEnv === 'Production') {
    if (hasTest) return fail('dist dla Production zawiera klucz testowy Turnstile');
    if (!hasProd) return fail('dist dla Production nie zawiera klucza produkcyjnego Turnstile');
  } else if (!hasProd && !distTexts.some((t) => t.includes(TURNSTILE_TEST_SITE_KEY))) {
    return fail('dist dla Preview bez klucza Turnstile z allowlisty');
  }
  return { ok: true, cfEnv };
}
