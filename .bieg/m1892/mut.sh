#!/usr/bin/env bash
# MIX-1892 mutants (wzór .bieg/m1816/mut.sh): green baseline first; one mutant at a time on the merge
# points (CalculatorResult / PublicCalculator / ci.yml), confirm the text was present (NOMATCH counted),
# run the affected tests, restore THAT file. Killed = a named test failed.
set -u
NM=0
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1892/mut
mkdir -p "$OUT"
[ -d node_modules ] || npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1
D=components/features/calculator
T="$D/NewClientTimeline.newUi.test.tsx $D/NewClientTimeline.off.test.tsx $D/NewClientTimeline.test.tsx $D/CalculatorNewUi.test.tsx $D/PublicCalculator.test.tsx tests/scripts/ciWorkflow.test.ts"
echo "MUT HEAD $(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
clean() { sed 's/\x1b\[[0-9;]*m//g' "$1"; }
# shellcheck disable=SC2086
npx vitest run $T --maxWorkers=2 > "$OUT/baseline.log" 2>&1; brc=$?
echo "MUT baseline rc=$brc $(clean "$OUT/baseline.log" | grep -aE "^\s+Tests " | tr -s " ")"
if [ "$brc" -ne 0 ]; then echo "MUT ABORT: baseline red, mutants not run"; exit 1; fi
K=0; S=0
run() { # name file from to
  local name="$1" f="$2" from="$3" to="$4"
  FROM="$from" TO="$to" node -e 'const fs=require("fs");const f=process.argv[1];const s=fs.readFileSync(f,"utf8");const a=process.env.FROM,b=process.env.TO;if(!s.includes(a)){process.exit(3)}fs.writeFileSync(f,s.replace(a,b))' "$f" || { echo "$name NOMATCH"; NM=$((NM+1)); return; }
  local changed; changed=$(git diff --numstat -- "$f" | awk '{print $1"+/"$2"-"}')
  # shellcheck disable=SC2086
  npx vitest run $T --maxWorkers=2 > "$OUT/$name.log" 2>&1; local rc=$?
  local nf; nf=$(clean "$OUT/$name.log" | grep -aE '^\s+Tests ' | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+' || echo 0)
  local first; first=$(clean "$OUT/$name.log" | grep -aE '^\s*(×|FAIL) ' | head -1 | cut -c1-110)
  if [ "$rc" -ne 0 ] && [ "${nf:-0}" -gt 0 ]; then echo "$name rc=$rc zabity ($nf failed: $first) diff=$changed"; K=$((K+1))
  elif [ "$rc" -ne 0 ]; then echo "$name rc=$rc NIEJASNY (0 named failures: $first) diff=$changed"; S=$((S+1))
  else echo "$name rc=0 PRZEZYL diff=$changed"; S=$((S+1)); fi
  git checkout -- "$f"
  git diff --quiet -- "$f" || echo "WARN $f dirty after $name"
}
R=$D/CalculatorResult.tsx
P=$D/PublicCalculator.tsx
NL=$'\n'
run M1-new-ui-bez-osi "$R" "      </div>${NL}      {timeline}${NL}    </div>${NL}  );${NL}};${NL}${NL}const CalculatorResult" "      </div>${NL}    </div>${NL}  );${NL}};${NL}${NL}const CalculatorResult"
run M2-new-ui-nie-dostaje-osi "$R" "onReset={onReset} timeline={timeline} />" "onReset={onReset} />"
run M3-stary-bez-osi "$R" "      </div>${NL}      {timeline}${NL}    </div>${NL}  );${NL}};${NL}${NL}export default" "      </div>${NL}    </div>${NL}  );${NL}};${NL}${NL}export default"
run M4-os-przed-karta "$R" "<div data-testid=\"calc-result\" className=\"space-y-6 md:space-y-8\">" "<div data-testid=\"calc-result\" className=\"space-y-6 md:space-y-8\">{timeline}<span />"
run M5-bez-newUi "$P" "          newUi={newUi}${NL}          timeline=" "          timeline="
run M6-os-bez-przelacznika "$P" "isNewClientTimelineEnabled() ? <NewClientTimeline /> : null" "<NewClientTimeline />"
run M7-os-zawsze-wylaczona "$P" "isNewClientTimelineEnabled() ? <NewClientTimeline /> : null" "null"
run M8-ci-bez-calc-new-ui .github/workflows/ci.yml "          VITE_MM_CALC_NEW_UI: \${{ steps.target.outputs.target == 'preview' && '1' || '' }}" "          VITE_MM_CALC_NEW_UI: ''"
run M9-ci-bez-osi .github/workflows/ci.yml "          VITE_MM_NEW_CLIENT_TIMELINE: \${{ steps.target.outputs.target == 'preview' && '1' || '' }}" "          VITE_MM_NEW_CLIENT_TIMELINE: ''"
echo "MUT SUMA zabite=$K przezyle_lub_niejasne=$S NOMATCH=$NM git_dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
