/**
 * MIX-1732: decision logic of the 16:9 proportion gate (scripts/audit-proportions.mjs).
 * Pure functions, no browser: fail-closed (Z3). Anything not measured, missing, non-finite or outside
 * the tolerance is a refusal with a reason line; "pass" is only an empty reason list.
 */
export const TARGET = 16 / 9;
export const TOL = 0.01;

const num = (v) => typeof v === 'number' && Number.isFinite(v) && v > 0;
const isSvg = (src) => typeof src !== 'string' || !src || /\.svg(\?|$)/i.test(src);

/** Crop box of an image URL: file name, rect, crop, fit and the w:h ratio of the request. null = unusable. */
export function cropBox(src) {
  if (typeof src !== 'string' || !src) return null;
  let u;
  try {
    u = new URL(src, 'http://x');
  } catch {
    return null;
  }
  const p = u.searchParams;
  const w = Number(p.get('w'));
  const h = Number(p.get('h'));
  return {
    file: u.pathname.split('/').pop(),
    rect: p.get('rect'),
    crop: p.get('crop'),
    fit: p.get('fit'),
    urlRatio: num(w) && num(h) ? w / h : null,
  };
}

const sameBox = (a, b) =>
  !!a && !!b && a.file === b.file && a.rect === b.rect && a.crop === b.crop && a.fit === b.fit;

/**
 * rows: one per viewport { vp, error, cardRatios[], cardSrc, hero: {ratio, src} | null }.
 * expectedVps: the viewport names that must all be present. Returns an array of reason lines ([] = pass).
 */
export function evaluate(rows, expectedVps) {
  const bad = [];
  if (!Array.isArray(rows) || !rows.length) return ['no measurement rows (nothing measured)'];
  for (const vp of expectedVps) {
    if (!rows.some((r) => r && r.vp === vp)) bad.push(`${vp}: viewport not measured`);
  }
  let first = null;
  for (const r of rows) {
    if (!r) {
      bad.push('empty measurement row');
      continue;
    }
    const at = `${r.vp}:`;
    if (r.error) {
      bad.push(`${at} ${r.error}`);
      continue;
    }
    const ratios = Array.isArray(r.cardRatios) ? r.cardRatios : [];
    if (!ratios.length) bad.push(`${at} 0 cards found`);
    for (const x of ratios) {
      if (!num(x)) bad.push(`${at} card ratio is not a positive number: ${x}`);
      else if (Math.abs(x - TARGET) > TOL)
        bad.push(`${at} card ratio ${x.toFixed(4)} outside 1.7778 +-${TOL}`);
    }
    const hero = r.hero;
    if (!hero) bad.push(`${at} hero not found`);
    else if (isSvg(hero.src))
      bad.push(`${at} hero is an SVG or has no src (logo, not the photo): ${hero.src}`);
    else if (!num(hero.ratio)) bad.push(`${at} hero ratio is not a positive number: ${hero.ratio}`);
    else if (Math.abs(hero.ratio - TARGET) > TOL)
      bad.push(`${at} hero ratio ${hero.ratio.toFixed(4)} outside 1.7778 +-${TOL}`);
    if (isSvg(r.cardSrc)) bad.push(`${at} card image is an SVG or has no src: ${r.cardSrc}`);
    const card = cropBox(r.cardSrc);
    const hb = hero ? cropBox(hero.src) : null;
    for (const [name, b] of [
      ['card', card],
      ['hero', hb],
    ]) {
      if (!b) continue;
      if (b.urlRatio === null) bad.push(`${at} ${name} image URL has no w/h crop size`);
      else if (Math.abs(b.urlRatio - TARGET) > TOL)
        bad.push(`${at} ${name} image URL crop ${b.urlRatio.toFixed(4)} outside 1.7778 +-${TOL}`);
    }
    if (card && hb && !sameBox(card, hb))
      bad.push(
        `${at} card and hero crop box differ: ${JSON.stringify({ ...card, urlRatio: 0 })} vs ${JSON.stringify({ ...hb, urlRatio: 0 })}`,
      );
    if (card && hb) {
      if (!first) first = { vp: r.vp, card, hb };
      else if (!sameBox(first.card, card) || !sameBox(first.hb, hb))
        bad.push(`${at} crop box differs from ${first.vp}`);
    }
  }
  return bad;
}

/**
 * Page errors seen while measuring a viewport turn the row into "not measured" (a refusal, never a pass).
 * Returns the row (mutated) so the caller can push it. Twin: no page errors leaves the row untouched.
 */
export function applyPageErrors(row, pageErrors) {
  if (Array.isArray(pageErrors) && pageErrors.length) row.error = `page error: ${pageErrors[0]}`;
  return row;
}

/**
 * Exit code of the gate: 0 = pass (empty reasons AND every viewport measured), 1 = criterion fails,
 * 2 = could not measure. Fail-closed: a row with an error, a wrong row count or a non-array input is never 0.
 */
export function exitCode(reasons, rows, expectedCount) {
  if (!Array.isArray(reasons) || !Array.isArray(rows)) return 2;
  const unmeasured = rows.some((r) => !r || r.error) || rows.length !== expectedCount;
  if (reasons.length) return unmeasured ? 2 : 1;
  return unmeasured ? 2 : 0;
}
