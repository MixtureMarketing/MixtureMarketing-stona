#!/usr/bin/env bash
# MIX-1799 mutants (wzór .bieg/m1791/mut.sh): green baseline first; one mutant at a time, confirm
# the text was present, run the affected tests, restore THAT file. Killed = at least one named
# test failed (rc != 0 alone is not enough).
set -u
cd "$(git rev-parse --show-toplevel)" || exit 2
OUT=.bieg/m1799/mut
mkdir -p "$OUT"
T="lib/estimation/publicScope.test.ts services/pricePreviewService.scope.test.ts components/features/calculator/configLink.test.ts components/features/calculator/ConfigPreview.cookie.test.tsx components/features/calculator/ConfigPreview.test.tsx"
echo "MUT HEAD $(git rev-parse HEAD) dirty=$(git status --porcelain | grep -v '^??' | wc -l)"
clean() { sed 's/\x1b\[[0-9;]*m//g' "$1"; }
# shellcheck disable=SC2086
npx vitest run $T --maxWorkers=2 > "$OUT/baseline.log" 2>&1; brc=$?
echo "MUT baseline rc=$brc $(clean "$OUT/baseline.log" | grep -aE '^\s+Tests ' | tr -s ' ')"
if [ "$brc" -ne 0 ]; then echo "MUT ABORT: baseline red, mutants not run"; exit 1; fi
run() { # name file from to
  local name="$1" f="$2" from="$3" to="$4"
  FROM="$from" TO="$to" node -e 'const fs=require("fs");const f=process.argv[1];const s=fs.readFileSync(f,"utf8");const a=process.env.FROM,b=process.env.TO;if(!s.includes(a)){process.exit(3)}fs.writeFileSync(f,s.replace(a,b))' "$f" || { echo "$name NOMATCH"; return; }
  local changed; changed=$(git diff --numstat -- "$f" | awk '{print $1"+/"$2"-"}')
  # shellcheck disable=SC2086
  npx vitest run $T --maxWorkers=2 > "$OUT/$name.log" 2>&1; local rc=$?
  local nf; nf=$(clean "$OUT/$name.log" | grep -aE '^\s+Tests ' | grep -oE '[0-9]+ failed' | grep -oE '[0-9]+' || echo 0)
  local first; first=$(clean "$OUT/$name.log" | grep -aE '^\s*(×|FAIL) ' | head -1 | cut -c1-90)
  if [ "$rc" -ne 0 ] && [ "${nf:-0}" -gt 0 ]; then echo "$name rc=$rc zabity ($nf failed: $first) diff=$changed"
  elif [ "$rc" -ne 0 ]; then echo "$name rc=$rc NIEJASNY (0 named failures: $first) diff=$changed"
  else echo "$name rc=0 PRZEZYL diff=$changed"; fi
  git checkout -- "$f"
  git diff --quiet -- "$f" || echo "WARN $f dirty after $name"
}
S=lib/estimation/publicScope.ts
L=components/features/calculator/configLink.ts
P=components/features/calculator/ConfigPreview.tsx
H=components/features/calculator/useHideCookieOver.ts
B=components/features/calculator/ConfigLinkButtons.tsx
C=index.css
V=services/pricePreviewService.ts
run M1-bidi-202A-202E-dropped $S '\u202A-\u202E' ''
run M2-bidi-2066-2069-dropped $S '\u2066-\u2069' ''
run M3-C0-strip-dropped $S '\u0000-\u0008\u000B\u000C\u000E-\u001F' ''
run M4-C1-DEL-strip-dropped $S '\u007F-\u009F' ''
run M5-bidi-061C-dropped $S '\u061C' ''
run M6-link-cap-dropped $L "return k.length > CONFIG_LINK_MAX ? null : k;" "return k;"
run M7-cookie-hook-not-called $P "useHideCookieOver(boxRef, shown, 'configPreviewCookie');" "void useHideCookieOver;"
run M13-link-hook-not-called $B "useHideCookieOver(boxRef, true, 'configLinkCookie');" "void useHideCookieOver;"
run M8-cookie-x-overlap-ignored $H "c.left < p.right &&
            c.right > p.left &&" "true &&"
run M9-cookie-flag-not-cleared-on-unmount $H "if (raf) cancelAnimationFrame(raf);
      delete body.dataset[flag];" "if (raf) cancelAnimationFrame(raf);"
run M10-cookie-zero-rect-counted $H "if (c.width <= 0 || c.height <= 0) continue;" "void 0;"
run M11-css-hide-dropped $C "  visibility: hidden;
  pointer-events: none;
}" "  pointer-events: none;
}"
run M12-client-name-unfiltered $V "const name = cleanClientText(rec.client_name, SCOPE_NAME_MAX);" "const name = typeof rec.client_name === 'string' ? rec.client_name : null;"
echo "git status after: $(git status --porcelain | grep -v '^??' | wc -l) modified"
