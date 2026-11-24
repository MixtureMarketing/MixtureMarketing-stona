#!/usr/bin/env bash
# MIX-1934: włączenie (albo wycofanie) publicznego sekretu testowego Turnstile WYŁĄCZNIE w środowisku
# Preview projektu Cloudflare Pages. Uruchamia lider po werdykcie TAK. Domyślnie tryb próbny: wypisuje,
# co by zmienił (same nazwy, bez wartości), i nic nie wysyła.
#
#   preview-turnstile-test-secret.sh [--wykonaj] [--wycofaj]
#
# Kolejność (fail-closed, każda odmowa = rc 1 z linią powodu):
#   1. scripts/preview-access-check.sh: Preview za Cloudflare Access (302 do logowania albo 403);
#   2. GET projektu z API: production_branch = main (inaczej odmowa: dev mógłby być Production);
#   3. PATCH tylko deployment_configs.preview.env_vars.TURNSTILE_SECRET (secret_text, wartość testowa
#      Cloudflare „zawsze przechodzi”); --wycofaj ustawia null (usuwa zmienną z Preview).
#      deployment_configs.production NIGDY nie jest wysyłane.
# Token: CLOUDFLARE_API_TOKEN i CLOUDFLARE_ACCOUNT_ID ze środowiska (skrypt ich nie wypisuje).
set -u

fail() { echo "preview-turnstile: ODMOWA: $*" >&2; exit 1; }

TEST_SECRET='1x0000000000000000000000000000000AA'
project="${CF_PAGES_PROJECT:-mixturemarketing-stona}"
wykonaj=0
wycofaj=0
for a in "$@"; do
  case "$a" in
    --wykonaj) wykonaj=1 ;;
    --wycofaj) wycofaj=1 ;;
    *) fail "nieznany argument '$a'" ;;
  esac
done

here="$(cd "$(dirname "$0")" && pwd)"
if [ "$wycofaj" = 0 ]; then
  bash "$here/preview-access-check.sh" || fail "Preview nie jest za Cloudflare Access; sekret testowy NIE zostanie ustawiony"
fi

[ -n "${CLOUDFLARE_API_TOKEN:-}" ] || fail "brak CLOUDFLARE_API_TOKEN"
[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ] || fail "brak CLOUDFLARE_ACCOUNT_ID"
api="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${project}"

proj="$(curl -fsS --max-time 30 -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" "$api")" \
  || fail "GET projektu Pages nieudany"
pb="$(printf '%s' "$proj" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);process.stdout.write(j&&j.success===true&&j.result&&typeof j.result.production_branch==="string"?j.result.production_branch:"")})')" \
  || fail "nieczytelna odpowiedź API"
[ "$pb" = "main" ] || fail "production_branch projektu = '${pb:-brak}', oczekiwano 'main'"

if [ "$wycofaj" = 1 ]; then
  payload='{"deployment_configs":{"preview":{"env_vars":{"TURNSTILE_SECRET":null}}}}'
  opis="usunięcie TURNSTILE_SECRET z Preview"
else
  payload="{\"deployment_configs\":{\"preview\":{\"env_vars\":{\"TURNSTILE_SECRET\":{\"type\":\"secret_text\",\"value\":\"${TEST_SECRET}\"}}}}}"
  opis="TURNSTILE_SECRET (Preview) = publiczny sekret testowy Cloudflare"
fi
printf '%s' "$payload" | grep -q '"production"' && fail "payload dotyka production"

if [ "$wykonaj" = 0 ]; then
  echo "preview-turnstile: PRÓBA: $opis (projekt $project, production_branch=main). Uruchom z --wykonaj."
  exit 0
fi
res="$(curl -fsS --max-time 30 -X PATCH -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H 'Content-Type: application/json' --data "$payload" "$api")" || fail "PATCH nieudany"
# MIX-1991: pole `success` czytane jako JSON (API odpowiada `"success": true` ze spacją, więc wzorzec
# tekstu dawał fałszywą odmowę). Fail-closed: OK tylko obiekt z `success` === true (boolean);
# false, "true", 1, brak pola, pole zagnieżdżone, nie-JSON, pusta odpowiedź = odmowa.
api_success() {
  node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{let j;try{j=JSON.parse(s)}catch{process.exit(1)}process.exit(j&&j.success===true?0:1)})'
}
printf '%s' "$res" | api_success || fail "API nie potwierdziło zmiany"
echo "preview-turnstile: OK: $opis. Zadziała od następnego wdrożenia Preview (dev)."
