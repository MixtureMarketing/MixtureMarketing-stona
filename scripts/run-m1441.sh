#!/usr/bin/env bash
# MIX-1441: bieg kontrolny sond e2e (pomocnik preview-server). Ścieżki względne do repo.
#   bash scripts/run-m1441.sh [katalog-wynikow=.bieg/m1441] [krok...]
# Kroki: format lint tsc testy pelny (domyślnie: format lint tsc testy). Wynik: <katalog>/run-<kroki>.tsv.
set -u
OUT="${1:-.bieg/m1441}"
shift || true
if [ "$#" -gt 0 ]; then STEPS=("$@"); else STEPS=(format lint tsc testy); fi
mkdir -p "$OUT"
TSV="$OUT/run-$(IFS=_; echo "${STEPS[*]}").tsv"
: > "$TSV"
FILES="scripts/lib/preview-server.mjs scripts/e2e-ga4-calculator-events.mjs scripts/e2e-ga4-key-events.mjs scripts/probe-consent-zaraz.mjs scripts/probe-view-transitions.mjs tests/scripts/preview-server.test.ts tests/fixtures/preview-fixture-server.mjs tests/fixtures/preview-runner.mjs"
fail=0
run() {
  local name=$1
  shift
  "$@" > "$OUT/krok-$name.log" 2>&1
  local rc=$?
  echo -e "$name\t$rc" | tee -a "$TSV"
  if [ "$rc" -ne 0 ]; then fail=1; echo "--- $name (tail) ---"; grep -v "^$" "$OUT/krok-$name.log" | tail -n 45 | cut -c1-300; fi
}
for s in "${STEPS[@]}"; do
  case "$s" in
    format) run format npx prettier --check $FILES ;;
    lint) run lint npm run lint ;;
    tsc) run tsc npx tsc --noEmit -p tsconfig.json ;;
    testy) run testy npx vitest run --maxWorkers=2 tests/scripts/preview-server.test.ts ;;
    pelny) run pelny npx vitest run --maxWorkers=2 ;;
    *) echo "nieznany krok: $s" >&2; exit 2 ;;
  esac
done
exit "$fail"
