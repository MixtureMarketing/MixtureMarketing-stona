#!/usr/bin/env bash
# MIX-1579: mutanty (po jednym pliku, przywracanie kopią przez mv). Wynik: zabity = test czerwony.
set -u
T="tests/components/CookieBannerStatic.test.tsx tests/components/CookieBanner.test.tsx tests/components/CookieBannerZaraz.test.tsx"
run() { # id plik sed-wyrażenie
  local id=$1 f=$2 e=$3
  if [ -n "${ONLY:-}" ] && [ "$id" != "$ONLY" ]; then return; fi
  cp "$f" "$f.m1579bak"
  sed -i "$e" "$f"
  if cmp -s "$f" "$f.m1579bak"; then
    mv "$f.m1579bak" "$f"
    echo "| $id | $f | NIE ZASTOSOWANO |"
    return
  fi
  npx vitest run $T --maxWorkers=2 > "mut-$id.out" 2>&1
  local rc=$?
  mv "$f.m1579bak" "$f"
  if [ $rc -ne 0 ]; then echo "| $id | $f | zabity |"; else echo "| $id | $f | przeżył |"; fi
}
run M1 index.html "s/Object.keys(v).length === 2/Object.keys(v).length >= 2/"
run M2 index.html "s/typeof v.analytics === 'boolean'/v.analytics !== undefined/"
run M3 index.html "s/if (window.isPrerendering) return;//"
run M4 index.html "s/own.call(v, 'marketing') \&\&//"
run M5 components/features/CookieBanner.tsx "s/if (staticSnapshot) return true;/if (staticSnapshot) return false;/"
run M6 components/features/CookieBanner.tsx "s/return !checkStoredConsent(safeGetItem(CONSENT_KEY)).ok;/return true;/"
run M7 components/features/CookieBanner.tsx "s/useState(!staticBanner)/useState(true)/"
run M8 components/features/CookieBanner.tsx "s/if (isPrerenderingEnv()) return false;//"
run M9 config/flags.ts "s/VITE_MM_COOKIE_BANNER_STATIC === '1'/VITE_MM_COOKIE_BANNER_STATIC !== undefined/"
run M10 components/features/CookieBanner.tsx "s/staticBanner \&\& isSnapshotRender()/staticBanner/"
