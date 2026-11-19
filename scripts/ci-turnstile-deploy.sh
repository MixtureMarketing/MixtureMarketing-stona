#!/usr/bin/env bash
# MIX-1934: strażnik Turnstile tuż przed `wrangler pages deploy` (krok CI). Fail-closed, rc 1 z linią powodu.
#
#   ci-turnstile-deploy.sh <cel: prod|preview> <gałąź wgrania: main|dev>
#
# Docelowe środowisko Cloudflare (Production/Preview) bierze z API Cloudflare: `production_branch`
# projektu Pages (gałąź wgrania równa production_branch = Production), nie z nazwy gałęzi w git.
# Potem scripts/ci-turnstile-guard.mjs sprawdza cel, gałąź, środowisko i klucz Turnstile w dist.
# Wymaga CF_API_TOKEN i CF_ACCOUNT_ID (sekrety GitHub); brak, błąd sieci albo HTTP ≠ 2xx = odmowa.
set -u

fail() { echo "turnstile-guard: ODMOWA: $*" >&2; exit 1; }

target="${1:-}"
branch="${2:-}"
[ -n "$target" ] || fail "brak celu (prod|preview)"
[ -n "$branch" ] || fail "brak gałęzi wgrania"
[ -n "${CF_API_TOKEN:-}" ] || fail "brak CF_API_TOKEN"
[ -n "${CF_ACCOUNT_ID:-}" ] || fail "brak CF_ACCOUNT_ID"
printf '%s' "$CF_ACCOUNT_ID" | grep -Eq '^[0-9a-f]{32}$' || fail "CF_ACCOUNT_ID nie wygląda na identyfikator konta"

project="${CF_PAGES_PROJECT:-mixturemarketing-stona}"
dir="${RUNNER_TEMP:-${TMPDIR:-/tmp}}"
out="$(mktemp "$dir/cf-pages-project.XXXXXX")" || fail "mktemp"
curl -fsS --max-time 30 \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/pages/projects/${project}" \
  -o "$out" || fail "API Cloudflare (projekt Pages) nie odpowiedziało poprawnie"

node scripts/ci-turnstile-guard.mjs deploy --target "$target" --branch "$branch" \
  --project-json "$out" --dist "${DIST_DIR:-dist}"
