#!/usr/bin/env bash
# Strażnik wdrożeń CI (MIX-1613 r2). Wołany z .github/workflows/ci.yml (kroki „Resolve deploy target”
# i „Replay guard”). Allowlista, fail-closed: puste albo nieznane wejście = rc 1 z linią powodu.
#
#   ci-deploy-guard.sh target    -> na stdout `target=prod|preview|none` (do $GITHUB_OUTPUT)
#       prod    = push na refs/heads/main
#       preview = push albo workflow_dispatch na refs/heads/dev
#       none    = wszystko inne (PR, tagi, inne gałęzie, repository_dispatch, schedule): bez wdrożenia
#     Porównanie ref jest CZUŁE NA WIELKOŚĆ LITER (wyrażenie `==` w GitHub Actions nie jest):
#     ref różniący się od refs/heads/dev albo refs/heads/main tylko wielkością liter = rc 1.
#   ci-deploy-guard.sh main-tip  -> rc 0 tylko gdy $GITHUB_SHA jest bieżącym końcem main w zdalnym
#       repozytorium (`git ls-remote`); ponowne uruchomienie starego biegu (re-run) nie wdroży
#       starszego SHA na produkcję. Zdalne repo: $GUARD_REMOTE (domyślnie origin).
set -u

fail() { echo "ci-deploy-guard: ODMOWA: $*" >&2; exit 1; }

lower() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]'; }

cmd_target() {
  local event="${GITHUB_EVENT_NAME:-}" ref="${GITHUB_REF:-}"
  [ -n "$event" ] || fail "puste GITHUB_EVENT_NAME"
  [ -n "$ref" ] || fail "puste GITHUB_REF"
  local want
  for want in refs/heads/dev refs/heads/main; do
    if [ "$ref" != "$want" ] && [ "$(lower "$ref")" = "$want" ]; then
      fail "ref '$ref' różni się od '$want' tylko wielkością liter"
    fi
  done
  local target=none
  if [ "$event" = "push" ] && [ "$ref" = "refs/heads/main" ]; then
    target=prod
  elif { [ "$event" = "push" ] || [ "$event" = "workflow_dispatch" ]; } && [ "$ref" = "refs/heads/dev" ]; then
    target=preview
  fi
  echo "target=$target"
}

cmd_main_tip() {
  local sha="${GITHUB_SHA:-}" remote="${GUARD_REMOTE:-origin}"
  printf '%s' "$sha" | grep -Eq '^[0-9a-f]{40}$' || fail "GITHUB_SHA nie jest pełnym SHA (40 znaków hex): '$sha'"
  local out
  out="$(git ls-remote "$remote" refs/heads/main 2>&1)" || fail "git ls-remote '$remote' nie powiódł się: $out"
  # Tylko dokładna linia `<sha>\trefs/heads/main` (wzorzec ls-remote łapie też refs/heads/x/refs/heads/main).
  local tips count tip
  tips="$(printf '%s\n' "$out" | awk -F'\t' '$2 == "refs/heads/main" { print $1 }')"
  count="$(printf '%s\n' "$tips" | grep -c . || true)"
  [ "$count" = "1" ] || fail "oczekiwano jednego końca refs/heads/main, jest $count"
  tip="$tips"
  printf '%s' "$tip" | grep -Eq '^[0-9a-f]{40}$' || fail "zdalny koniec main nie jest pełnym SHA: '$tip'"
  [ "$sha" = "$tip" ] || fail "SHA biegu $sha nie jest końcem main ($tip): to ponowne uruchomienie starego biegu, produkcja bez zmian"
  echo "ci-deploy-guard: OK: $sha jest końcem main"
}

case "${1:-}" in
  target) cmd_target ;;
  main-tip) cmd_main_tip ;;
  *) fail "nieznane polecenie '${1:-}' (target | main-tip)" ;;
esac
