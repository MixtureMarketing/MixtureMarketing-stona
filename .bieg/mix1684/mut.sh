#!/usr/bin/env bash
# MIX-1684: mutants of the letter allowlist. Baseline first (must be green), then each mutant: one change
# in one file, node --check, probe.mjs + attack.mjs (3 form files) and, with VITEST=1, vitest of
# tests/seo/llmsTxt.test.ts; restore exactly that file (git checkout -- <file>). From the repo root.
set -u
OUT=.bieg/r/mix1684; mkdir -p "$OUT"; : > "$OUT/mutants.txt"
L=scripts/lib/llms.js
S() { echo "$*" | tee -a "$OUT/mutants.txt"; }
T() { sed 's/\x1b\[[0-9;]*m//g' "$1" | grep -aE '^ +Tests ' | tail -n 1 | tr -s ' '; }
checks() { # $1 = name; prints "probe-failed=N leaks=N twins-refused=N vitest=rc"
  local n=$1 p a1 a2 a3 v=-
  node .bieg/mix1684/probe.mjs . > "$OUT/m-$n-probe.log" 2>&1
  p=$(grep -oE 'failed=[0-9]+' "$OUT/m-$n-probe.log" || echo failed=ERR)
  node .bieg/mix1684/attack.mjs . .bieg/mix1670/formy-v1662.txt > "$OUT/m-$n-a1.log" 2>&1
  node .bieg/mix1684/attack.mjs . .bieg/mix1684/formy-v1670.txt > "$OUT/m-$n-a2.log" 2>&1
  EXTRA_HIDDEN=/modern-cloud-platform/,/offline-profile-flow/ node .bieg/mix1684/attack.mjs . .bieg/mix1684/formy-v1670-b.txt > "$OUT/m-$n-a3.log" 2>&1
  a1=$(grep -oE 'got-through=[0-9]+' "$OUT/m-$n-a1.log"); a2=$(grep -oE 'got-through=[0-9]+' "$OUT/m-$n-a2.log"); a3=$(grep -oE 'got-through=[0-9]+' "$OUT/m-$n-a3.log")
  if [ "${VITEST:-0}" = 1 ]; then
    npx vitest run tests/seo/llmsTxt.test.ts --maxWorkers=2 > "$OUT/m-$n-vitest.log" 2>&1; v="rc=$?;$(T "$OUT/m-$n-vitest.log")"
  fi
  echo "probe-$p v1662-$a1 v1670-$a2 v1670b-$a3 vitest=$v"
}
b=$(checks baseline); S "baseline: $b"
case "$b" in *"probe-failed=0 v1662-got-through=0 v1670-got-through=3 v1670b-got-through=0"*) ;; *) S "baseline not green: mutants skipped"; exit 1;; esac
if [ "${VITEST:-0}" = 1 ]; then case "$b" in *"vitest=rc=0"*) ;; *) S "baseline vitest red: mutants skipped"; exit 1;; esac; fi
mut() {
  local name=$1 f=$2 from=$3 to=$4
  # ONLY="N7 N8" runs just those mutants (local node passes split under 1 min); empty = all.
  if [ -n "${ONLY:-}" ] && [[ " $ONLY " != *" ${name%%-*} "* ]]; then return; fi
  node .bieg/mix1657/mutate.mjs "$f" "$from" "$to" || { S "mutant $name: PATTERN-ERROR"; return; }
  if ! node --check "$f" > /dev/null 2>&1; then git checkout -- "$f"; S "mutant $name: INVALID (syntax)"; return; fi
  local d; d=$(git diff --numstat -- "$f" | tr '\t' ' ')
  local r; r=$(checks "$name")
  git checkout -- "$f"
  S "mutant $name: diff=[$d] $r"
}
mut N1-casefold-before-map "$L" 'const mapped = SKELETON_MAP.get(c);' 'const mapped = SKELETON_MAP.get(c.toLowerCase());'
mut N2-wildcard-to-separator "$L" '  if (isWild(c)) return WILDCARD;' "  if (isWild(c)) return '/';"
mut N3-missing-lunate-C-entry "$L" "  ['\\u03F9', 'C'],"$'\n' ''
mut N4-Y7-pair-second-exact "$L" '&& fits(t, two[0]) && fits(s[j + 1], two[1])' '&& fits(t, two[0]) && s[j + 1] === two[1]'
mut N5-latin-fallback-for-all "$L" '  if (LATIN_RE.test(c)) {' '  if (true) {'
mut N6-table-lookup-skipped "$L" 'const mapped = SKELETON_MAP.get(c);' 'const mapped = undefined;'
mut N7-sigma-as-e "$L" "  ['Σ', WILDCARD],"$'\n' "  ['Σ', 'e'],"$'\n'
mut N8-latin-unknown-to-separator "$L" "return /^[a-z0-9]+\$/.test(m) ? m : WILDCARD;" "return /^[a-z0-9]+\$/.test(m) ? m : '/';"
mut N9-pair-first-exact "$L" '&& fits(t, two[0]) && fits(s[j + 1], two[1])' '&& t === two[0] && fits(s[j + 1], two[1])'
mut N10-any-digit-kept "$L" "  if (/^[0-9]\$/.test(c)) return c;" "  if (/^\\p{N}\$/u.test(c)) return c;"
mut N11-omega-row-dropped "$L" "  ['ΑΒΕΖΗΙΚΜΝΟΡΤΥΧΩ', 'abezhikmnoptyxo'],"$'\n' ''
mut N12-pre-nfkc-off "$L" '.map((c) => PRE_NFKC.get(c) ?? c)' '.map((c) => c)'
S "after: porcelain=$(git status --porcelain -- scripts tests | wc -l)"
