#!/usr/bin/env bash
# MIX-1741: back from a case study landing on the footer (.bieg/mix1741/footer.mjs) at 375 and 1280.
# Usage: bash .bieg/mix1741/footer.sh <variants csv> <cases csv> <runs> [expect csv]
#   variants: head (this tree), f536917 (this tree with utils/caseStudyRootScroll.ts of f536917 = the owner's Preview),
#             bug (this tree with the grid class of 3febcb0: contain-intrinsic-size without `auto`),
#             nocv (this tree without content-visibility on the grid; diagnosis only)
#   cases: back,toggle; runs per width and case; expect per variant: fixed (0 FOOTER/OTHER) | bug (>= 1 FOOTER) | any
# From the repo root on a fresh tree (builds with VITE_MM_VIEW_TRANSITIONS=1). Result on stdout.
# Exit 0 only when every build is 0 and every variant meets its expectation at both widths (fail-closed:
# a probe rc 2 = not measured = failure).
set -u
VARIANTS=${1:?variants}; CASES=${2:?cases}; RUNS=${3:?runs}; EXPECT=${4:-}
OUT=.bieg/r/mix1741; mkdir -p "$OUT"
export VITE_SANITY_PROJECT_ID=azuef2ua VITE_SANITY_DATASET=production
echo "HEAD=$(git rev-parse HEAD 2>/dev/null) variants=$VARIANTS cases=$CASES runs=$RUNS expect=$EXPECT"
[ -d node_modules ] || { npm ci --legacy-peer-deps --no-audit --no-fund > "$OUT/npm-ci.log" 2>&1; echo "npm-ci rc=$?"; }
FAILS=0
bad() { echo "FAILCHECK $*"; FAILS=$((FAILS + 1)); }
GRID=components/features/portfolio/PortfolioGrid.tsx
RS=utils/caseStudyRootScroll.ts
cp "$GRID" "$OUT/grid.orig"; cp "$RS" "$OUT/rs.orig"
restore() { cp "$OUT/grid.orig" "$GRID"; cp "$OUT/rs.orig" "$RS"; }
IFS=, read -r -a VS <<< "$VARIANTS"; IFS=, read -r -a EX <<< "$EXPECT"
i=0
for v in "${VS[@]}"; do
  ex=${EX[$i]:-any}; i=$((i + 1))
  restore
  case $v in
    head) ;;
    f536917) (cd .bieg/mix1741/base-f536917 && sha256sum -c --quiet SHA256SUMS) || bad "base-f536917 checksum"
             cp .bieg/mix1741/base-f536917/caseStudyRootScroll.ts "$RS"; cmp -s "$RS" "$OUT/rs.orig" && echo "note: $RS equals f536917" ;;
    bug|fixa|nocv) node .bieg/mix1741/variant.mjs "$v" || bad "variant $v not applied" ;;
    *) bad "unknown variant $v"; continue ;;
  esac
  echo "variant $v grid class: $(grep -c content-visibility "$GRID") content-visibility line(s)"
  rm -rf dist "dist-$v"
  VITE_MM_VIEW_TRANSITIONS=1 npm run build > "$OUT/build-$v.log" 2>&1; rc=$?; echo "build-$v rc=$rc"
  [ $rc -eq 0 ] || { bad "build-$v rc=$rc"; tail -n 20 "$OUT/build-$v.log"; continue; }
  mv dist "dist-$v"
  for vp in 375 1280; do
    for c in $(echo "$CASES" | tr ',' ' '); do
      FOOT_VP=$vp FOOT_CASE=$c FOOT_RUNS=$RUNS FOOT_TAG=$v node .bieg/mix1741/footer.mjs "dist-$v" "$OUT" > "$OUT/f-$v-$vp-$c.txt" 2>&1; prc=$?
      grep -aE '^(CARDS|RUN|SUMMARY|ERROR)' "$OUT/f-$v-$vp-$c.txt" | cut -c1-330
      echo "probe $v $vp $c rc=$prc expect=$ex"
      case "$ex:$prc" in
        fixed:0|any:0|any:1|bug:1) ;;
        *) bad "$v $vp $c rc=$prc expect=$ex" ;;
      esac
      if [ "$ex" = bug ] && [ $prc -eq 1 ]; then
        grep -aqF " footer=0 " "$OUT/f-$v-$vp-$c.txt" && bad "$v $vp $c: not OK but no FOOTER landing"
      fi
    done
  done
done
restore
echo "porcelain: $(git status --porcelain 2>/dev/null | grep -v '^?? .bieg/' | grep -v '^?? dist-' | wc -l)"
echo "FOOTER-MIX1741 failchecks=$FAILS"
echo "### end"
[ "$FAILS" -eq 0 ]
