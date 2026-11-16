#!/usr/bin/env bash
# MIX-1791 mutants (wzór .bieg/m1790/mut.sh): green baseline first; then apply one mutant, confirm the
# text was present, run the affected tests, restore THAT file. Killed = at least one named test
# failed (rc != 0 alone is not enough).
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1791/mut
mkdir -p "$OUT"
T="components/features/calculator/configLink.test.ts components/features/calculator/ConfigLink.switch.test.tsx components/features/calculator/livePrice.test.ts lib/estimation/publicQuote.test.ts tests/utils/calculatorTracking.test.ts"
echo "MUT HEAD $(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
clean() { sed 's/\x1b\[[0-9;]*m//g' "$1"; }
# shellcheck disable=SC2086
npx vitest run $T --maxWorkers=2 > "$OUT/baseline.log" 2>&1; brc=$?
echo "MUT baseline rc=$brc $(clean "$OUT/baseline.log" | grep -aE '^\s+Tests ' | tr -s ' ')"
if [ "$brc" -ne 0 ]; then echo "MUT ABORT: baseline red, mutants not run"; exit 1; fi
run() { # name file from to
  local name="$1" f="$2" from="$3" to="$4"
  FROM="$from" TO="$to" node -e 'const fs=require("fs");const f=process.argv[1];const s=fs.readFileSync(f,"utf8");const a=process.env.FROM,b=process.env.TO;if(!s.includes(a)){process.exit(3)}fs.writeFileSync(f,s.replace(a,b))' "$f" || { echo "$name NOMATCH"; return; }
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
L=components/features/calculator/configLink.ts
B=components/features/calculator/ConfigLinkButtons.tsx
P=components/features/calculator/PublicCalculator.tsx
# K2 bramki całego linku
run M1-no-length-cap $L "  if (raw.length > CONFIG_LINK_MAX) return { ok: false, reason: LINK_REFUSAL.tooLong };" "  void 0;"
run M2-cap-off-by-one $L "if (raw.length > CONFIG_LINK_MAX)" "if (raw.length >= CONFIG_LINK_MAX)"
run M3-accept-unknown-codes $L "const v = q ? cleanLinkAnswer(q, val) : undefined;" "const v = q ? cleanLinkAnswer(q, val) : (val as AnswerValue);"
run M4-prototype-keys-allowed $L "  if (entries.some(([key]) => FORBIDDEN_KEYS.has(key)))
    return { ok: false, reason: LINK_REFUSAL.forbiddenKey };" "  void 0;"
run M5-no-charset-gate $L "  if (!B64URL.test(raw)) return { ok: false, reason: LINK_REFUSAL.charset };" "  void 0;"
run M6-duplicate-k-allowed $L "  if (all.length > 1) return { ok: false, reason: LINK_REFUSAL.duplicated };" "  void 0;"
run M7-empty-link-ok $L "  if (Object.keys(answers).length === 0) return { ok: false, reason: LINK_REFUSAL.empty };" "  void 0;"
# K2 allowlista pojedynczej odpowiedzi
run M8-select-any-option $L "return typeof val === 'string' && options.has(val) ? val : undefined;" "return typeof val === 'string' ? val : undefined;"
run M9-number-not-integer $L "if (!range || typeof val !== 'number' || !Number.isInteger(val)) return undefined;" "if (!range || typeof val !== 'number') return undefined;"
run M10-number-no-range $L "return val >= range[0] && val <= range[1] ? val : undefined;" "return val;"
run M11-text-no-allowlist $L "val.length <= PUBLIC_TEXT_MAX &&
        PUBLIC_TEXT_ALLOWED.test(val)" "val.length <= PUBLIC_TEXT_MAX"
run M12-multiselect-duplicates $L "      if (new Set(val).size !== val.length) return undefined;" "      void 0;"
run M13-bool-truthy $L "return typeof val === 'boolean' ? val : undefined;" "return val ? true : undefined;"
# K3 GA4
run M14-double-ga4-copy $B "      setStatus('copied');" "      setStatus('copied');
      trackCalculatorShare({ method: 'copy' });"
run M15-share-method-wrong $B "trackCalculatorShare({ method: 'native' });" "trackCalculatorShare({ method: 'copy' });"
# K4 przełącznik
run M16-switch-ignored $P "const linkOn = isConfigLinkEnabled();" "const linkOn = true;"
run M17-switch-loose components/features/calculator/livePrice.ts "VITE_MM_CONFIG_LINK): boolean {
  return isLivePriceBarEnabled(raw);" "VITE_MM_CONFIG_LINK): boolean {
  return Boolean(raw);"
run M18-restore-skipped $P "    for (const [code, value] of Object.entries(r.answers)) setAnswer(code, value);" "    void setAnswer;"
echo "git status after: $(git status --porcelain | grep -v '^??' | wc -l) modified"
