#!/usr/bin/env bash
# MIX-1991 mutanty (wszystkie z m1934 + nowe na końcu; (wzór .bieg/m1815/mut.sh): zielona linia bazowa; potem jeden mutant, potwierdzenie,
# że tekst był w pliku, testy celowane, przywrócenie TEGO pliku. Zabity = co najmniej jeden nazwany
# test czerwony (samo rc != 0 nie wystarcza).
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1991/mut; mkdir -p "$OUT"
T="functions/api/estimation/turnstileTestMode.test.ts tests/scripts/turnstileKeyGuard.test.ts tests/scripts/ciWorkflow.test.ts"
echo "MUT HEAD $(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
clean() { sed 's/\x1b\[[0-9;]*m//g' "$1"; }
# shellcheck disable=SC2086
npx vitest run $T --maxWorkers=2 > "$OUT/baseline.log" 2>&1; brc=$?
echo "MUT baseline rc=$brc $(clean "$OUT/baseline.log" | grep -aE '^\s+Tests ' | tr -s ' ')"
if [ "$brc" -ne 0 ]; then echo "MUT ABORT: baseline red"; exit 1; fi
run() { # nazwa plik z na
  local name="$1" f="$2" from="$3" to="$4"
  FROM="$from" TO="$to" node -e 'const fs=require("fs");const f=process.argv[1];const s=fs.readFileSync(f,"utf8");const a=process.env.FROM,b=process.env.TO;if(!s.includes(a)){process.exit(3)}fs.writeFileSync(f,s.replace(a,b))' "$f" || { echo "$name NOMATCH"; return; }
  local changed; changed=$(git diff --numstat -- "$f" | awk '{print $1"+/"$2"-"}')
  # shellcheck disable=SC2086
  npx vitest run $T --maxWorkers=2 > "$OUT/$name.log" 2>&1; local rc=$?
  local nf; nf=$(clean "$OUT/$name.log" | grep -aE '^\s+Tests ' | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+' || echo 0)
  local first; first=$(clean "$OUT/$name.log" | grep -aE '^\s*(×|FAIL) ' | head -1 | cut -c1-110)
  if [ "$rc" -ne 0 ] && [ "${nf:-0}" -gt 0 ]; then echo "$name rc=$rc zabity ($nf failed: $first) diff=$changed"
  elif [ "$rc" -ne 0 ]; then echo "$name rc=$rc NIEJASNY (0 named failures: $first) diff=$changed"
  else echo "$name rc=0 PRZEZYL diff=$changed"; fi
  git checkout -- "$f"
  git diff --quiet -- "$f" || echo "WARN $f dirty after $name"
}
G=scripts/lib/turnstileKeyGuard.mjs
M=functions/api/_shared/turnstileMode.ts
S=functions/api/_shared/security.ts
Q=functions/api/estimation/public-quote.ts
K=functions/api/estimation/_quoteGate.ts
PV=functions/api/estimation/public-preview.ts
C=functions/api/contact-submit.ts
A=functions/api/audit/capture-lead.ts
P=functions/api/_shared/publicGate.ts
L=functions/api/_leadToken.ts
V=vite.config.ts
Y=.github/workflows/ci.yml
D=scripts/ci-turnstile-deploy.sh
X=scripts/preview-access-check.sh
F=config/turnstileKey.ts
W=scripts/preview-turnstile-test-secret.sh

# strażnik budowy
run G1-test-key-any-target $G "if (target === 'preview') return { ok: true, key };" "if (target !== 'local') return { ok: true, key };"
run G2-trim-prod-key $G "if (key === TURNSTILE_PROD_SITE_KEY) return { ok: true, key };" "if (String(key).trim() === TURNSTILE_PROD_SITE_KEY) return { ok: true, key };"
run G3-case-insensitive-test-key $G "if (key === TURNSTILE_TEST_SITE_KEY) {" "if (String(key).toLowerCase() === TURNSTILE_TEST_SITE_KEY.toLowerCase()) {"
run G4-target-case-insensitive $G "!BUILD_TARGETS.includes(target))" "!BUILD_TARGETS.includes(target.toLowerCase()))"
run G5-empty-key-local $G "if (target === 'local' && key === undefined)" "if (target === 'local' && !key)"
# strażnik wgrania
run G6-env-from-branch-name $G "const cfEnv = branch === productionBranch ? 'Production' : 'Preview';" "const cfEnv = branch === 'main' ? 'Production' : 'Preview';"
run G7-no-preview-env-check $G "if (cfEnv !== 'Preview')" "if (false)"
run G8-no-dist-test-key-check $G "if (hasTest) return fail(" "if (false) return fail("
run G9-regex-case-sensitive $G "[0-9A-Za-z]{2}/i;" "[0-9A-Za-z]{2}/;"
run G10-prod-any-branch $G "if (branch !== 'main')" "if (false)"
# tryb testowy serwera
run M1-host-suffix $M "if (host !== TURNSTILE_TEST_HOST) return" "if (!host.endsWith('.pages.dev')) return"
run M2-secret-normalized $M "if (secret !== TURNSTILE_TEST_SECRET)" "if (secret.trim().toLowerCase() !== TURNSTILE_TEST_SECRET.toLowerCase())"
run M3-test-like-strict $M 'const TEST_LIKE_RE = /^\s*[0-9]x0{10,}/i;' 'const TEST_LIKE_RE = /^[0-9]x0{10,}/;'
run S1-test-mode-any-hostname $S "if (d.hostname !== TURNSTILE_TEST_HOSTNAME) return { ok: false, reason: 'captcha: hostname' };" "void TURNSTILE_TEST_HOSTNAME;"
run Q1-quote-persist-in-test $Q "  if (testMode) return quoteOk(result, true);" "  if (false) return quoteOk(result, true);"
run Q2-gated-persist-in-test $Q "  if (testMode) return quoteOk(result, true);
  await persist(" "  await persist("
run Q3-quote-no-refuse $Q "  if (tm.kind === 'refuse') {" "  if (false) {"
run Q4-quote-mode-real $Q "    testMode ? 'test' : 'real'," "    'real',"
run K1-gate-mode-real $K "    tm.kind === 'test' ? 'test' : 'real'," "    'real',"
run PV1-preview-no-refuse $PV "  if (tm.kind === 'refuse') return deny(ray, 503, tm.reason, BUSY);" "  void BUSY;"
run C1-contact-no-refuse $C "  if (tm.kind === 'refuse') return testModeRefusal('contact-submit', tm.reason);" "  void testModeRefusal;"
run C2-contact-insert-in-test $C "      if (tm.kind === 'test')" "      if (false)"
run A1-audit-insert-in-test $A "request.url).kind === 'test'" "request.url).kind === 'nigdy'"
run P1-audit-gate-no-refuse $P "  if (tm.kind === 'refuse')" "  if (false)"
run L1-test-secret-as-hmac $L "if (env.TURNSTILE_SECRET && !isTestLikeSecret(env.TURNSTILE_SECRET)) return" "if (env.TURNSTILE_SECRET) return"
# build, CI, skrypty, front
run V1-vite-guard-off $V "if (command === 'build') {" "if (command === 'nigdy') {"
run V2-vite-target-fixed $V "target: process.env.MM_DEPLOY_TARGET ?? 'local'," "target: 'preview',"
run Y1-ci-test-key-not-preview $Y "target == 'preview' && '1x00000000000000000000AA'" "target != 'none' && '1x00000000000000000000AA'"
run Y2-ci-no-prod-guard $Y "run: bash scripts/ci-turnstile-deploy.sh prod main" "run: echo pominiety"
run D1-deploy-no-token-check $D '[ -n "${CF_API_TOKEN:-}" ] || fail "brak CF_API_TOKEN"' 'true'
run X1-access-host-unanchored $X "'^[a-z0-9-]+\.cloudflareaccess\.com\$'" "'cloudflareaccess\.com'"
run X2-access-200-ok $X "  403)" "  403|200)"
run F1-front-ignores-build-key $F "return typeof raw === 'string' && raw !== '' ? raw : TURNSTILE_PROD_SITE_KEY;" "return TURNSTILE_PROD_SITE_KEY;"
run W1-secret-any-prod-branch $W '[ "$pb" = "main" ] ||' 'true ||'
run W2-secret-no-access-check $W 'bash "$here/preview-access-check.sh" ||' 'true ||'
# r2 (mutanty weryfikatora r1, które przeżyły dostawę)
run N10-audit-test-mode-only-without-pdf $A "request.url).kind === 'test')" "request.url).kind === 'test' && !pdf /*N10*/)"
run B2-guard-cli-silent scripts/ci-turnstile-guard.mjs 'process.stderr.write(`turnstile-guard: ODMOWA: ${msg}\n`);' 'void msg; // B2'
run B4-deploy-sh-silent $D 'fail() { echo "turnstile-guard: ODMOWA: $*" >&2; exit 1; }' 'fail() { exit 1; } # B4'
# MIX-1991: skrypt lidera czyta success z JSON
run W3-grep-success-bez-spacji $W 'printf '"'"'%s'"'"' "$res" | api_success ||' 'printf '"'"'%s'"'"' "$res" | grep -q '"'"'"success":true'"'"' ||'
run W4-success-truthy $W 'process.exit(j&&j.success===true?0:1)' 'process.exit(j&&j.success?0:1)'
run W5-success-zagniezdzone $W 'process.exit(j&&j.success===true?0:1)' 'process.exit(/"success": ?true/.test(s)?0:1)'
run W6-nie-json-ok $W 'catch{process.exit(1)}' 'catch{process.exit(0)}'
run W7-bez-odmowy $W '| api_success || fail "API nie potwierdziło zmiany"' '| api_success || true'
run W8-odmowa-cicha $W 'fail() { echo "preview-turnstile: ODMOWA: $*" >&2; exit 1; }' 'fail() { exit 1; }'
# MIX-1991: luki testów z MIX-1934 r2
run N3-preview-obcy-klucz $G '} else if (!hasProd && !distTexts.some((t) => t.includes(TURNSTILE_TEST_SITE_KEY))) {' '} else if (false) {'
run N3b-preview-dowolny-testowy $G '} else if (!hasProd && !distTexts.some((t) => t.includes(TURNSTILE_TEST_SITE_KEY))) {' '} else if (!hasProd && !hasTest) {'
run N5-test-ignoruje-success $S "if (d.success !== true) return { ok: false, reason: 'captcha: odrzucony' };" "if (d.success !== true && mode !== 'test') return { ok: false, reason: 'captcha: odrzucony' };"
run N5b-success-truthy $S "if (d.success !== true) return { ok: false, reason: 'captcha: odrzucony' };" "if (!d.success) return { ok: false, reason: 'captcha: odrzucony' };"
run N11-alert-budzetu-w-tescie $Q "if (gate.budgetAlert && !testMode) {" "if (gate.budgetAlert) {"
run N12-hmac-tylko-dokladny $L "if (env.TURNSTILE_SECRET && !isTestLikeSecret(env.TURNSTILE_SECRET)) return" "if (env.TURNSTILE_SECRET && env.TURNSTILE_SECRET !== '1x0000000000000000000000000000000AA') return"
echo "MUT END"
