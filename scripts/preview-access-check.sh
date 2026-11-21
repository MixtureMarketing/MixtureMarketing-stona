#!/usr/bin/env bash
# MIX-1934 (warunek ryzyka resztkowego): Preview musi być za Cloudflare Access, zanim dostanie
# testowy sekret Turnstile. Jedno zapytanie GET bez logowania (bez ciasteczek, bez podążania za
# przekierowaniem) musi skończyć się:
#   - 403, albo
#   - 302/303/307 z przekierowaniem na *.cloudflareaccess.com (strona logowania Access).
# Wszystko inne (200, 404, 5xx, przekierowanie gdzie indziej, błąd sieci) = rc 1 z linią powodu.
#
#   preview-access-check.sh [adres]   domyślnie https://dev.mixturemarketing-stona.pages.dev/
set -u

fail() { echo "preview-access: ODMOWA: $*" >&2; exit 1; }

url="${1:-https://dev.mixturemarketing-stona.pages.dev/}"
case "$url" in https://*) ;; *) fail "adres musi zaczynać się od https://" ;; esac

res="$(curl -sS --max-time 20 --max-redirs 0 -o /dev/null \
  -A 'Mozilla/5.0 (compatible; MixtureE2E/1)' \
  -w '%{http_code} %{redirect_url}' "$url" 2>&1)" || fail "zapytanie nieudane: ${res:0:120}"

code="${res%% *}"
loc="${res#* }"
[ "$loc" = "$res" ] && loc=""
case "$code" in
  403)
    echo "preview-access: OK: $url -> 403 (bez logowania brak dostępu)"
    ;;
  302|303|307)
    host="$(printf '%s' "$loc" | sed -E 's#^https://([^/:?]+).*#\1#')"
    case "$loc" in https://*) ;; *) host="" ;; esac
    if printf '%s' "$host" | grep -Eq '^[a-z0-9-]+\.cloudflareaccess\.com$'; then
      echo "preview-access: OK: $url -> $code do logowania Cloudflare Access ($host)"
    else
      fail "$url -> $code, ale przekierowanie nie prowadzi do Cloudflare Access ('${host:-brak}')"
    fi
    ;;
  *)
    fail "$url -> HTTP $code bez logowania (oczekiwano 302 do Cloudflare Access albo 403)"
    ;;
esac
