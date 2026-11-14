#!/usr/bin/env bash
# MIX-1665: mutanty skanu po szkielecie. Każdy: jedna zmiana w jednym pliku, node --check, vitest
# tests/seo/llmsTxt.test.ts, przywrócenie tego pliku (git checkout -- <plik>). Z korzenia repo.
set -u
OUT=.bieg/r/mix1665; mkdir -p "$OUT"; : > "$OUT/mutants.txt"
L=scripts/lib/llms.js
mut() {
  local name=$1 f=$2 from=$3 to=$4
  node .bieg/mix1657/mutate.mjs "$f" "$from" "$to" || { echo "mutant $name: BLAD WZORCA" | tee -a "$OUT/mutants.txt"; return; }
  if ! node --check "$f" > /dev/null 2>&1; then git checkout -- "$f"; echo "mutant $name: NIEWAZNY (skladnia)" | tee -a "$OUT/mutants.txt"; return; fi
  npx vitest run tests/seo/llmsTxt.test.ts --maxWorkers=2 > "$OUT/mut-$name.log" 2>&1
  local rc=$?
  git checkout -- "$f"
  local t; t=$(sed 's/\x1b\[[0-9;]*m//g' "$OUT/mut-$name.log" | grep -aE '^ +Tests ' | tail -n 1 | tr -s ' ')
  if [ $rc -ne 0 ]; then echo "mutant $name: zabity (rc=$rc;$t)" | tee -a "$OUT/mutants.txt"; else echo "mutant $name: PRZEZYL ($t)" | tee -a "$OUT/mutants.txt"; fi
}
mut M1-confusables-off "$L" 'const m = SKELETON_MAP.get(c) ?? c;' 'const m = c;'
mut M2-strip-off "$L" "\${[...k].join('[^a-z0-9]*')}" '${k}'
mut M3-join-off "$L" 'if (!hitPaths.has(p) && re.test(joined))' 'if (false)'
mut M4-boundary-off "$L" "new RegExp(\`(?<![a-z0-9])\${[...k]" "new RegExp(\`\${[...k]"
mut M5-marks-kept "$L" ".toLowerCase().replace(/\\p{M}/gu, '');" '.toLowerCase();'
mut M6-soft-sep-off "$L" "out += SOFT_SEP_RE.test(c) ? ' ' : '/';" "out += '/';"
mut M7-decode-off "$L" 'skeletonText(decodePct(norm(raw).toLowerCase()))' 'skeletonText(raw)'
mut M8-mark-once "$L" '/^(?:\s*(?:#{1,6}|>|[-*+]|\d+[.)]))*\s*/u' '/^\s*(?:#{1,6}|>|[-*+]|\d+[.)])?\s*/u'
mut M9-min-zero "$L" 'export const MIN_SKELETON = 8;' 'export const MIN_SKELETON = 0;'
mut M10-slug-off "$L" 'out.push([p, plain(slugRaw), longRe(slug)]);' '{}'
mut M11-nfkc-off "$L" 'for (const ch of norm(s)) {' 'for (const ch of String(s)) {'
mut M12-empty-skeleton-ok "$L" " && skeletonOf(p) !== ''" ''
echo "after: porcelain=$(git status --porcelain -- scripts tests | wc -l)"
