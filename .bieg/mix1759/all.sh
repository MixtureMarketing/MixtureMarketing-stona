#!/usr/bin/env bash
# MIX-1759: one run on one machine (fixed ports: one at a time), steps in order, each on a tree without dist dirs:
#   ua (.bieg/mix1759/ua.sh), mut (.bieg/mix1759/mut.sh), full (.bieg/mix1759/full.sh),
#   footer (.bieg/mix1741/footer.sh head back 20 fixed), cond (.bieg/mix1745/cond.sh fixed),
#   classes375 / classes1280 (.bieg/mix1719/classes.sh; 100 ms gap = known residual, judged per gap from RESULT/REDGAPS).
# Optional ALL_STEPS="ua mut ..." (subset, allowlist). Lines: STEP <name> rc=<rc>. Exit 1 when full, mut, ua, footer
# or cond is not 0 (classes are judged per gap by the reader); 2 = unknown step.
set -u
STEPS=${ALL_STEPS:-ua mut full footer cond classes375 classes1280}
for s in $STEPS; do case $s in full|mut|ua|footer|cond|classes375|classes1280) ;; *) echo "step $s not allowed"; exit 2 ;; esac; done
echo "HEAD=$(git rev-parse HEAD 2>/dev/null) steps=$STEPS"
RED=0
for s in $STEPS; do
  rm -rf dist dist-old dist-head dist-head dist-on dist-on1711 dist-off dist-base dist-uahead dist-uabase dist-f536917 dist-bug
  echo "### step $s start $(date +%T)"
  case $s in
    full) bash .bieg/mix1759/full.sh ;;
    mut) bash .bieg/mix1759/mut.sh ;;
    ua) bash .bieg/mix1759/ua.sh ;;
    footer) bash .bieg/mix1741/footer.sh head back 20 fixed ;;
    cond) bash .bieg/mix1745/cond.sh fixed ;;
    classes375) bash .bieg/mix1719/classes.sh 375 ;;
    classes1280) bash .bieg/mix1719/classes.sh 1280 ;;
  esac
  rc=$?
  echo "STEP $s rc=$rc end $(date +%T)"
  case $s in classes*) ;; *) [ $rc -eq 0 ] || RED=$((RED + 1)) ;; esac
done
rm -rf dist dist-old dist-head dist-on dist-on1711 dist-off dist-base dist-uahead dist-uabase dist-f536917 dist-bug
echo "ALL-MIX1759 red-steps=$RED"
[ "$RED" -eq 0 ]
