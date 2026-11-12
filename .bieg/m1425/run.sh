#!/bin/bash
# MIX-1425: baza + mutanty linii 29 utils/zarazConsent.ts; wyniki w .bieg/m1425/
set -u
F=utils/zarazConsent.ts
T="tests/utils/consentDelivery.test.ts tests/components/CookieBannerZaraz.test.tsx"
O=.bieg/m1425
cp $F $O/orig.ts
run(){ npx vitest run $T --maxWorkers=2 > $O/$1.log 2>&1; echo "$1 rc=$?" >> $O/summary.txt; grep -E "Tests  |Test Files|FAIL " $O/$1.log | sort -u | head -12 >> $O/summary.txt; cp $O/orig.ts $F; }
: > $O/summary.txt
run base
sed -i '29s/consentApi.APIReady === true/consentApi.APIReady !== false/' $F; run V2
sed -i '29s/consentApi.APIReady === true/!!consentApi.APIReady/' $F; run V3
sed -i '29s/consentApi.APIReady === true/true/' $F; run V4
sed -i '29s/apiSignalled ||/true ||/' $F; run V5
sed -i '29s/apiSignalled ||/apiSignalled \&\&/' $F; run V6
git diff --stat -- $F >> $O/summary.txt
