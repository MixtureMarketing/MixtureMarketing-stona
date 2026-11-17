#!/usr/bin/env bash
# MIX-1816 mutants (wzór .bieg/m1810/mut.sh): green baseline first; one mutant at a time, confirm the
# text was present (NOMATCH = script failure, exit 3), run the affected tests, restore THAT file.
# Killed = a named test failed. ALL=1 replaces every occurrence (paired tags).
set -u
NM=0
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1816/mut
mkdir -p "$OUT"
[ -n "${DRY:-}" ] || [ -d node_modules ] || npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1
D=components/features/calculator
T="$D/NewClientTimeline.test.tsx $D/NewClientTimeline.off.test.tsx $D/NewClientTimeline.newUi.test.tsx $D/newClientTimeline.content.test.ts $D/ConfigPreview.cookie.test.tsx tests/scripts/ciWorkflow.test.ts"
echo "MUT HEAD $(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
clean() { sed 's/\x1b\[[0-9;]*m//g' "$1"; }
# shellcheck disable=SC2086
if [ -n "${DRY:-}" ]; then brc=0; else npx vitest run $T --maxWorkers=2 > "$OUT/baseline.log" 2>&1; brc=$?; fi
[ -n "${DRY:-}" ] || echo "MUT baseline rc=$brc $(clean "$OUT/baseline.log" | grep -aE "^\s+Tests " | tr -s " ")"
if [ "$brc" -ne 0 ]; then echo "MUT ABORT: baseline red, mutants not run"; exit 1; fi
run() { # name file from to [ALL=1 in env]
  local name="$1" f="$2" from="$3" to="$4"
  FROM="$from" TO="$to" node -e 'const fs=require("fs");const f=process.argv[1];const s=fs.readFileSync(f,"utf8");const a=process.env.FROM,b=process.env.TO;if(!s.includes(a)){process.exit(3)}let o=process.env.ALL?s.split(a).join(b):s.replace(a,b);const a2=process.env.FROM2,b2=process.env.TO2;if(a2){if(!o.includes(a2)){process.exit(3)}o=o.split(a2).join(b2)}if(process.env.DRY){process.exit(0)}fs.writeFileSync(f,o)' "$f" || { echo "$name NOMATCH"; NM=$((NM+1)); return; }
  if [ -n "${DRY:-}" ]; then echo "$name present"; return; fi
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
G=$D/newClientTimeline.guard.ts
C=$D/NewClientTimeline.tsx
P=$D/PublicCalculator.tsx
L=$D/livePrice.ts
R=$D/CalculatorResult.tsx
# guard (forbidden words, prices)
run G1-gwarant-dropped $G "['gwarant', /gwaran[tc]/i]," ""
run G2-gwarant-prefix-narrowed $G '/gwaran[tc]/i' '/gwarant/i'
run G3-pewn-dropped $G "['pewn', /pewn/i]," ""
run G4-procent-dropped $G "['procent', /%/]," ""
run G5-wzrost-dropped $G "['wzrost o', /wzrost\\s+o\\b/i]," ""
run G6-zwrot-dropped $G "['zwrot z inwestycji', /zwrot\\s+z\\s+inwestycji/i]," ""
run G7-waluta-zl-dropped $G '(?:zł|zl|pln|eur)' '(?:zl|pln|eur)'
run G8-kwota-dropped $G "['kwota', /\\d{3,}/]," ""
run G9-case-sensitive $G '/pewn/i' '/pewn/'
# flag
run F1-flag-ignored $P 'timeline={isNewClientTimelineEnabled() ? <NewClientTimeline /> : null}' 'timeline={<NewClientTimeline />}'
# MIX-1938: kotwica w isNewClientTimelineEnabled (po MIX-1898 nie woła już isLivePriceBarEnabled).
run F2-parser-truthy $L '(mutant V4 z werdyktu MIX-1816).
  return raw === '"'"'1'"'"';' '(mutant V4 z werdyktu MIX-1816).
  return !!raw;'
run F3-flag-inverted $P 'isNewClientTimelineEnabled() ?' '!isNewClientTimelineEnabled() ?'
# MIX-1938: po MIX-1894 slot {timeline} jest dwa razy (NewResult i stary wygląd); kotwice jednoznaczne,
# test nowego wyglądu (NewClientTimeline.newUi.test.tsx) dopisany do T.
run F4-timeline-slot-dropped $R '      {timeline}
    </div>
  );
};

export default CalculatorResult;' '    </div>
  );
};

export default CalculatorResult;'
run F4b-timeline-slot-dropped-newui $R '      {timeline}
    </div>
  );
};

const CalculatorResult' '    </div>
  );
};

const CalculatorResult'
run F5-flag-name-wrong $L 'import.meta.env.VITE_MM_NEW_CLIENT_TIMELINE' 'import.meta.env.VITE_MM_NEW_CLIENT_TIMELINES'
# semantics and layout
FROM2='</ol>' TO2='</div>' run S1-ol-to-div $C '<ol className=' '<div className='
ALL=1 run S2-h3-to-h4 $C 'h3' 'h4'
FROM2='</h2>' TO2='</h4>' run S3-h2-to-h4 $C '<h2 id=' '<h4 id='
run S4-aria-labelledby-broken $C 'aria-labelledby="new-client-timeline-title"' 'aria-labelledby="x"'
FROM2='</ul>' TO2='</div>' run S5-inner-ul-to-div $C '<ul className="mt-2' '<div className="mt-2'
run S6-break-words-dropped $C ' break-words' ''
run S7-direction-class $C 'text-start' 'text-left'
run S8-motion-class $C 'max-w-xl pt-8' 'max-w-xl pt-8 transition-all'
run S9-limit-3-dropped $C '.slice(0, 3)' ''
run S10-empty-item-kept $C ".filter((i) => i !== '')" ''
run S11-empty-period-kept $C ".filter((p) => p.period !== '' && p.items.length > 0)" '.filter(() => true)'
run S12-null-render-dropped $C 'if (rows.length === 0) return null;' ''
run S13-trim-dropped $C '.map((i) => i.trim())' ''
# cookie
run K1-hook-dropped $C "  useHideCookieOver(boxRef, rows.length > 0, 'timelineCookie');" ''
run K2-css-rule-broken index.css "body[data-timeline-cookie='true'] .cookie-floating-btn {" "body[data-timeline-cookie='x'] .cookie-floating-btn {"
run K3-flag-key-wrong $C "'timelineCookie');" "'configLinkCookie');"
# CI and env switches
run E1-ci-preview-switch-dropped .github/workflows/ci.yml "          VITE_MM_NEW_CLIENT_TIMELINE: \${{ steps.target.outputs.target == 'preview' && '1' || '' }}
" ''
run E2-ci-switch-on-for-prod .github/workflows/ci.yml "VITE_MM_NEW_CLIENT_TIMELINE: \${{ steps.target.outputs.target == 'preview' && '1' || '' }}" "VITE_MM_NEW_CLIENT_TIMELINE: '1'"
echo "git status after: $(git status --porcelain | grep -v '^??' | wc -l) modified"
echo "NOMATCH count: $NM"
[ "$NM" -eq 0 ] || { echo "MUT FAIL: $NM mutant(s) did not apply"; exit 3; }
