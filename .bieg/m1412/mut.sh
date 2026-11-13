#!/usr/bin/env bash
# MIX-1412 mutants: apply one, confirm the line is present, run affected tests, restore THAT file.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1412/mut
mkdir -p "$OUT"
T="services/pricePreviewService.test.ts tests/services/pricePreviewService.test.ts hooks/usePublicCalculator.race.test.ts hooks/usePublicCalculator.token.test.ts hooks/usePublicCalculator.test.ts components/features/calculator"
echo "HEAD $(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
run() { # name file from to
  local name="$1" f="$2" from="$3" to="$4"
  FROM="$from" TO="$to" node -e 'const fs=require("fs");const f=process.argv[1];const s=fs.readFileSync(f,"utf8");const a=process.env.FROM,b=process.env.TO;if(!s.includes(a)){process.exit(3)}fs.writeFileSync(f,s.replace(a,b))' "$f" || { echo "$name NOMATCH"; return; }
  local changed; changed=$(git diff --numstat -- "$f" | awk '{print $1"+/"$2"-"}')
  npx vitest run $T --maxWorkers=2 > "$OUT/$name.log" 2>&1; local rc=$?
  local failed; failed=$(grep -E '^\s+Tests ' "$OUT/$name.log" | grep -oE '[0-9]+ failed' || echo '0 failed')
  if [ "$rc" -ne 0 ]; then echo "$name rc=$rc zabity ($failed) diff=$changed"; else echo "$name rc=0 PRZEZYL diff=$changed"; fi
  git checkout -- "$f"
  git diff --quiet -- "$f" || echo "WARN $f dirty after $name"
}
S=services/pricePreviewService.ts
H=hooks/usePublicCalculator.ts
B=components/features/calculator/LivePriceBar.tsx
run V4-swap-minmax $S "  return { min, max };" "  return { min: max, max: min };"
run V7-no-number-check $S "if (!isPln(min) || !isPln(max) || min > max) return null;" "if (min === undefined || max === undefined) return null;"
run M1-no-min-gt-max $S "|| min > max) return null;" ") return null;"
run M2-negative-ok $S "Number.isFinite(v) && v >= 0 &&" "Number.isFinite(v) &&"
run M3-no-cap $S " && v <= MAX_PREVIEW_PLN;" ";"
run M4-token-unchecked $S "typeof token === 'string' && token !== '' ? token : undefined" "(token as string | undefined)"
run V6-bar-on-result-screen components/features/calculator/PublicCalculator.tsx "const liveEnabled = isLivePriceBarEnabled() && (c.phase === 'ready' || c.phase === 'submitting');" "const liveEnabled = isLivePriceBarEnabled();"
run G1-no-double-submit-guard $H "    if (submittingRef.current) return null;" "    // guard removed"
run G2-queued-preview-not-refused $H "if (forPreview && submittingRef.current) throw new Error(PREVIEW_BLOCKED_BY_SUBMIT);" "void forPreview;"
run G3-no-serialization $H "const p = tokenChain.current.then(run, run);" "const p = run();"
run G4-empty-token-ok $H "if (typeof token !== 'string' || token === '') throw new Error(TURNSTILE_EMPTY_TOKEN);" "void TURNSTILE_EMPTY_TOKEN;"
run G5-guard-never-released $H "      submittingRef.current = false;" "      void 0;"
run G6-preview-not-refused-upfront $H "    if (submittingRef.current) return Promise.reject(new Error(PREVIEW_BLOCKED_BY_SUBMIT));" "    // upfront refusal removed"
run S1-switch-trim components/features/calculator/livePrice.ts "return raw === '1' || raw === 'true';" "return String(raw).trim() === 'true' || raw === '1';"
run B1-cookie-always-raised $B "bottom > vh - COOKIE_BAND_PX" "bottom > -Infinity"
run B2-lift-bar-height $B '`${Math.round(vh - r.top)}px`' '`${Math.round(r.height)}px`'
run B3-bar-fixed-again $B 'className="sticky bottom-0' 'className="fixed inset-x-0 bottom-0'
run B4-desktop-not-skipped $B "if (window.matchMedia?.(DESKTOP_MQ).matches) return clear();" "void DESKTOP_MQ;"
run H1-option-42px components/features/calculator/QuestionField.tsx "'min-h-11 px-4" "'px-4"
# r2 (after merging integracja e9d24c8): MIX-1466 timeout and MIX-1300 GA4 submit kept in the merged code
run X1-timeout-signal-dropped $S "      signal: own.signal," "      signal,"
run X2-ga4-submit-dropped $H "      trackEvent('calculator_submit', { source: window.location.pathname });" "      void trackEvent;"
echo "git status after: $(git status --porcelain | grep -v '^??' | wc -l) modified"
