#!/usr/bin/env bash
# MIX-1689: mutants of the separator allowlist. Baseline first, then each mutant: one change in one file,
# node --check, plain-node checks (probe1689, attack harness on 5 form files, check-llms on the repo file
# and on a missing file) and, with VITEST=1, vitest of tests/seo/llmsTxt.test.ts. A mutant is killed when
# any number differs from the baseline. Restores exactly that file (git checkout -- <file>). From repo root.
set -u
OUT=.bieg/r/mix1689${R:-}; mkdir -p "$OUT"; : > "$OUT/mutants.txt"
L=scripts/lib/llms.js; C=scripts/check-llms.mjs
S() { echo "$*" | tee -a "$OUT/mutants.txt"; }
T() { sed 's/\x1b\[[0-9;]*m//g' "$1" | grep -aE '^ +Tests ' | tail -n 1 | tr -s ' '; }
A() { # $1 log; got-through and false-refused counts
  grep -oE 'got-through=[0-9]+|false-refused=[0-9]+' "$1" | cut -d= -f2 | paste -sd/; }
checks() {
  local n=$1 v=-
  node .bieg/mix1689/probe.mjs . > "$OUT/m-$n-probe.log" 2>&1
  local p; p=$(grep -oE 'failed=[0-9]+' "$OUT/m-$n-probe.log" || echo failed=ERR)
  local r=""
  for F in .bieg/mix1689/formy-s.txt .bieg/mix1670/formy-v1662.txt .bieg/mix1689/formy-v1670.txt .bieg/mix1689/formy-v1670-c.txt; do
    node .bieg/mix1684/attack.mjs . "$F" > "$OUT/m-$n-a.log" 2>&1; r="$r $(basename "$F" .txt)=$(A "$OUT/m-$n-a.log")"
  done
  EXTRA_HIDDEN=/modern-cloud-platform/,/offline-profile-flow/ node .bieg/mix1684/attack.mjs . .bieg/mix1689/formy-v1670-b.txt > "$OUT/m-$n-a.log" 2>&1
  r="$r formy-v1670-b=$(A "$OUT/m-$n-a.log")"
  node $C > /dev/null 2>&1; local c1=$?
  node $C --llms=.bieg/mix1689/brak-pliku.txt > /dev/null 2>&1; local c2=$?
  if [ "${VITEST:-0}" = 1 ]; then
    npx vitest run tests/seo/llmsTxt.test.ts --maxWorkers=2 > "$OUT/m-$n-vitest.log" 2>&1; v="rc=$?;$(T "$OUT/m-$n-vitest.log")"
  fi
  echo "probe-$p$r real=$c1 missing=$c2 vitest=$v"
}
b=$(checks baseline); S "baseline: $b"
case "$b" in *"probe-failed=0 formy-s=0/5 "*"real=0 missing=1"*) ;; *) S "baseline not green: mutants skipped"; exit 1;; esac
if [ "${VITEST:-0}" = 1 ]; then case "$b" in *"vitest=rc=0"*) ;; *) S "baseline vitest red: mutants skipped"; exit 1;; esac; fi
nb=${b#*: }; KILLED=0; N=0
mut() {
  local name=$1 f=$2 from=$3 to=$4
  if [ -n "${ONLY:-}" ] && [[ " $ONLY " != *" ${name%%-*} "* ]]; then return; fi
  node .bieg/mix1657/mutate.mjs "$f" "$from" "$to" || { S "mutant $name: PATTERN-ERROR"; return; }
  if ! node --check "$f" > /dev/null 2>&1; then git checkout -- "$f"; S "mutant $name: INVALID (syntax)"; return; fi
  local d; d=$(git diff --numstat -- "$f" | tr '\t' ' ')
  local r; r=$(checks "$name")
  git checkout -- "$f"
  N=$((N + 1)); local res=przezyl
  if [ "$r" != "$b" ] && [ "$r" != "$nb" ]; then res=zabity; KILLED=$((KILLED + 1)); fi
  S "mutant $name: $res diff=[$d] $r"
}
mut M1-nonascii-punct-to-separator "$L" $'  return WILDCARD;\n}' $'  return /\\p{P}/u.test(c) ? \'/\' : WILDCARD;\n}'
mut M2-emdash-removed-from-allowlist "$L" "~\\u2014\\u2013');" "~\\u2013');"
mut M3-pipe-removed-from-allowlist "$L" "{|}~" "{}~"
mut M4-wildcard-skipped "$L" $'  return WILDCARD;\n}' $'  return \'/\';\n}'
mut M5-error-accepted-hidden-list "$L" "  if (!hiddenOk) problems.push(" "  if (false) problems.push("
mut M6-error-accepted-cli-read "$C" "  process.exit(1);" "  process.exit(0);"
mut M7-nfkc-skipped "$L" ".normalize('NFKC');" ";"
mut M8-any-whitespace-soft "$L" "  if (SOFT_SEP.has(c)) return ' ';" "  if (SOFT_SEP.has(c) || /\\s/u.test(c)) return ' ';"
mut M9-low-quote-removed "$L" "()\\u201E\\u201D" "()\\u201D"
# r2 (WERDYKT-MIX-1689 F1, Recenzja L-SYS: znaki łączące i Cf = dżoker, nigdy nie znikają)
mut M10-marks-dropped-again "$L" "    if (!LETTER_RE.test(ch)) {" "    if (false) {"
mut M11-mark-to-separator "$L" "  if (SOFT_SEP.has(c)) return ' ';" "  if (SOFT_SEP.has(c) || /\\p{M}/u.test(c)) return ' ';"
mut M12-cf-dropped "$L" "      out += skeletonChar(ch);" "      out += /\\p{Cf}/u.test(ch) ? '' : skeletonChar(ch);"
mut M13-only-marks-dropped "$L" "      out += skeletonChar(ch);" "      out += /\\p{M}/u.test(ch) ? '' : skeletonChar(ch);"
mut M14-cf-to-separator "$L" "      out += skeletonChar(ch);" "      out += /\\p{Cf}/u.test(ch) ? ' ' : skeletonChar(ch);"
mut M15-nonletter-decomposed "$L" "      out += skeletonChar(ch);" "      out += [...noMarks(ch)].map(skeletonChar).join('');"
S "summary: mutants=$N killed=$KILLED porcelain=$(git status --porcelain -- scripts tests | wc -l)"
