#!/usr/bin/env bash
# MIX-1657: mutanty strażnika llms.txt. Każdy: jedna linia w jednym pliku, node --check, vitest
# tests/seo/llmsTxt.test.ts, przywrócenie tego pliku (git checkout -- <plik>). Z korzenia repo.
set -u
OUT=.bieg/r/mix1657; mkdir -p "$OUT"; : > "$OUT/mutants.txt"
L=scripts/lib/llms.js; C=scripts/check-llms.mjs
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
mut M01-cli-hidden-empty "$C" 'hiddenPaths: prerenderOnlyRoutes,' 'hiddenPaths: [],'
mut M02-nfkc-off "$L" "String(s).normalize('NFKC')" 'String(s)'
mut M03-any-host "$L" 'if (auth !== HOST) return' 'if (false) return'
mut M04-sitemap-skip "$L" '} else if (!sitemapPaths.has(v.path) && !machine.includes(v.path)) {' '} else if (false) {'
mut M05-blank-as-empty "$L" "if (line === '') return { why: null };" "if (line.trim() === '') return { why: null };"
mut M06-cli-exit0 "$C" 'process.exit(report.ok ? 0 : 1);' 'process.exit(0);'
mut M07-flat-scan-off "$L" 'if (!hitPaths.has(p) && flat.includes(needle)) {' 'if (false) {'
mut M08-decode-off "$L" '[low, decodePct(low), low.replace' '[low, low, low.replace'
mut M09-noslash-variant-off "$L" 'out.push([p, `${t}/`], [p, t]);' 'out.push([p, `${t}/`]);'
mut M10-slug-off "$L" "if (slug.includes('-')) out.push([p, slug]);" 'if (false) out.push([p, slug]);'
mut M11-maxline-off "$L" 'if ([...raw].length > MAX_LINE) return' 'if (false) return'
mut M12-dotted-any "$L" 'if (!DOTTED_ALLOW.includes(m[0])) return' 'if (false) return'
mut M13-path-token-off "$L" '[/\/[^\s/]+\/|(?:^|[^\p{L}\p{N}])\/[^\s/]/u, ' '[/(?!)/u, '
mut M14-empty-hidden-ok "$L" 'hiddenPaths.length > 0 &&' 'true &&'
mut M15-nfkc-url-off "$L" 'if (!raw.includes(m[2])) return' 'if (false) return'
mut M16-entity-off "$L" '[/&[#\p{L}\p{N}]/u, ' '[/(?!)/u, '
mut M17-cc-off "$L" '[\p{Cc}\p{Cf}' '[\p{Cf}'
mut M18-userinfo-off "$L" "if (auth.includes('@')) return" 'if (false) return'
mut M19-hidden-link-off "$L" 'if (hidden.some((h) => sameRoute(norm(h).toLowerCase(), v.path))) {' 'if (false) {'
mut M20-dotseg-off "$L" "if (rest.includes('..') || rest.split('/').includes('.'))" 'if (false)'
git status --porcelain -- "$L" "$C"
echo "mutanty: $(grep -c zabity "$OUT/mutants.txt") zabite, $(grep -c PRZEZYL "$OUT/mutants.txt") przezylo, $(grep -cE 'BLAD|NIEWAZNY' "$OUT/mutants.txt") bledne"
