# RAPORT MIX-1425
Kryteria: (1) nowe testy: brak APIReady, "true", 1, undefined bez zdarzenia = 0 wywołań consent.set i sendQueuedEvents; bliźniaki: APIReady===true = 1 wywołanie, zdarzenie gotowości przy braku APIReady = 1. (2) zielone na 3930d53, czerwone na V2 i >=2 innych mutantach linii 29. (3) prettier/eslint rc 0, plik testów rc 0; kod produkcyjny bez zmian.
SHA: patrz git log gałęzi mix1425-test-apiready (tests/utils/consentDelivery.test.ts, +describe "APIReady brakujące albo nie-boolean", 7 przypadków).
Mutanty (linia 29 utils/zarazConsent.ts; chmura, 2 pliki):
| mutant | zmiana | wynik |
| V2 | `=== true` -> `!== false` | zabity (5 FAIL nowe) |
| V3 | -> `!!consentApi.APIReady` | zabity (2 FAIL: "true", 1) |
| V4 | -> `true` | zabity (13 FAIL) |
| V5 | `apiSignalled ||` -> `true ||` | zabity (11 FAIL) |
| V6 | `||` -> `&&` | zabity (13 FAIL) |
Full check: bieg-na-stacji m1425 --maszyna chmura -- bash .bieg/m1425/run.sh (vitest consentDelivery + CookieBannerZaraz) → baza rc=0, 2 files, 45 passed (38 + 7 nowych); prettier rc=0, eslint rc=0; tsc NIE wykonany (chmura > 58 s, bieg nie dokończony).
Logi: logi/bieg-stacja-m1425-20261112-114656.log
