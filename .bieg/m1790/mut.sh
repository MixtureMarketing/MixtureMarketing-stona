#!/usr/bin/env bash
# MIX-1790 mutants (wzór .bieg/m1412/mut.sh): green baseline first; then apply one mutant, confirm the
# text was present, run the affected tests, restore THAT file. Killed = at least one named test
# failed (rc != 0 alone is not enough).
set -u
NM=0 # MIX-1938: NOMATCH (nieaktualna kotwica) = błąd skryptu, exit 3
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1790/mut
mkdir -p "$OUT"
T="lib/estimation/publicScope.test.ts lib/estimation/publicQuote.test.ts functions/api/estimation/public-preview.scope.test.ts functions/api/estimation/public-preview.test.ts services/pricePreviewService.scope.test.ts services/pricePreviewService.test.ts components/features/calculator/ConfigPreview.test.tsx components/features/calculator/ConfigPreview.switch.test.tsx components/features/calculator/LivePriceBar.test.tsx"
echo "MUT HEAD $(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
clean() { sed 's/\x1b\[[0-9;]*m//g' "$1"; }
# shellcheck disable=SC2086
npx vitest run $T --maxWorkers=2 > "$OUT/baseline.log" 2>&1; brc=$?
echo "MUT baseline rc=$brc $(clean "$OUT/baseline.log" | grep -aE '^\s+Tests ' | tr -s ' ')"
if [ "$brc" -ne 0 ]; then echo "MUT ABORT: baseline red, mutants not run"; exit 1; fi
run() { # name file from to
  local name="$1" f="$2" from="$3" to="$4"
  FROM="$from" TO="$to" node -e 'const fs=require("fs");const f=process.argv[1];const s=fs.readFileSync(f,"utf8");const a=process.env.FROM,b=process.env.TO;if(!s.includes(a)){process.exit(3)}fs.writeFileSync(f,s.replace(a,b))' "$f" || { echo "$name NOMATCH"; NM=$((NM+1)); return; }
  local changed; changed=$(git diff --numstat -- "$f" | awk '{print $1"+/"$2"-"}')
  # shellcheck disable=SC2086
  npx vitest run $T --maxWorkers=2 > "$OUT/$name.log" 2>&1; local rc=$?
  local nf; nf=$(clean "$OUT/$name.log" | grep -aE '^\s+Tests ' | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+' || echo 0)
  local first; first=$(clean "$OUT/$name.log" | grep -aE '^\s*(×|FAIL) ' | head -1 | cut -c1-90)
  if [ "$rc" -ne 0 ] && [ "${nf:-0}" -gt 0 ]; then echo "$name rc=$rc zabity ($nf failed: $first) diff=$changed"
  elif [ "$rc" -ne 0 ]; then echo "$name rc=$rc NIEJASNY (0 named failures: $first) diff=$changed"
  else echo "$name rc=0 PRZEZYL diff=$changed"; fi
  git checkout -- "$f"
  git diff --quiet -- "$f" || echo "WARN $f dirty after $name"
}
S=lib/estimation/publicScope.ts
P=services/pricePreviewService.ts
C=components/features/calculator/ConfigPreview.tsx
# K1 lista dozwolona na serwerze i w kliencie
run M1-server-allowlist-dropped $S "    out.push({
      client_name: name," "    out.push({
      ...(a as object),
      client_name: name,"
run M2-internal-name-fallback $S "cleanClientText(a.clientName, SCOPE_NAME_MAX)" "cleanClientText(a.clientName ?? a.name, SCOPE_NAME_MAX)"
run M3-internal-desc-fallback $S "cleanClientText(a.levelClientDescription, SCOPE_DESCRIPTION_MAX)" "cleanClientText(a.levelClientDescription ?? a.levelDescription, SCOPE_DESCRIPTION_MAX)"
run M4-unchosen-areas-included $S "    if (!(a.hoursMax > 0)) continue;" "    void 0;"
# MIX-1938: kotwice M5, M6 po MIX-1810 (VISIBLE w warunku, stripInvisible wieloliniowe).
run M5-no-length-cap $S "if (t === '' || t.length > max || !VISIBLE.test(t)) return null;" "if (t === '' || !VISIBLE.test(t)) return null;"
run M6-no-invisible-strip $S "    .replace(INVISIBLE, '')
" ""
run M7-no-item-cap-server $S "    if (out.length >= SCOPE_MAX_ITEMS) break;" "    void 0;"
run M8-endpoint-scope-always functions/api/estimation/public-preview.ts "const out = scope.length > 0 ? { priceRange, scope } : { priceRange };" "const out = { priceRange, scope };"
run M9-client-allowlist-dropped $P "    out.push({
      client_name: name," "    out.push({
      ...(rec as object),
      client_name: name,"
run M10-client-non-array $P "  if (!Array.isArray(raw)) return [];" "  if (!raw || typeof raw !== 'object') return [];"
run M11-client-no-item-cap $P "    if (out.length >= SCOPE_MAX_ITEMS) break;" "    void 0;"
# K4 render jako tekst
run M12-desc-as-html $C '<p className="text-xs text-gray-400">{s.client_description}</p>' '<p className="text-xs text-gray-400" dangerouslySetInnerHTML={{ __html: s.client_description }} />'
run M13-name-as-html $C '<p className="text-sm font-semibold text-white">{s.client_name}</p>' '<p className="text-sm font-semibold text-white" dangerouslySetInnerHTML={{ __html: s.client_name }} />'
# K5 typ i pusty zakres
run M14-sketch-proto-lookup components/features/calculator/configSketches.tsx "return SKETCHES.get(goal) ?? null;" "return (DEFS as Record<string, SketchDef>)[goal] ?? null;"
# MIX-1938: kotwica M15 po przeniesieniu warunku do `shown` (przycisk ciasteczek, Z6/Z7).
run M15-no-sketch-hides-list $C "const shown = !(!sketch && items.length === 0);" "const shown = !!sketch;"
run M16-empty-list-shown $C "{items.length > 0 && (" "{items.length >= 0 && ("
# K2 przełącznik
# MIX-1938: kotwica w isConfigPreviewEnabled (po MIX-1898 nie woła już isLivePriceBarEnabled);
# komentarz „MIX-1791" niżej czyni ją jednoznaczną.
run M17-switch-loose components/features/calculator/livePrice.ts "  return raw === '1';
}

/**
 * MIX-1791:" "  return ['1', 'true', 'yes', 'on'].includes(String(raw).trim().toLowerCase());
}

/**
 * MIX-1791:"
run M18-switch-ignored components/features/calculator/PublicCalculator.tsx "const configEnabled = isConfigPreviewEnabled() && filling;" "const configEnabled = filling;"
run M19-config-no-requests components/features/calculator/PublicCalculator.tsx "    enabled: liveEnabled || configEnabled," "    enabled: liveEnabled,"
run M20-stale-scope-after-error hooks/useLivePriceRange.ts "          setState({ status, priceRange: null });" "          setState((s) => ({ status, priceRange: null, scope: s.scope }));"
echo "git status after: $(git status --porcelain | grep -v '^??' | wc -l) modified"
echo "NOMATCH count: $NM"
[ "$NM" -eq 0 ] || { echo "MUT FAIL: $NM mutant(s) did not apply"; exit 3; }
