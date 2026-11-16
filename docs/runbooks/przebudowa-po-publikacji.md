# Przebudowa Preview po publikacji w CMS (MIX-1613)

Cel: listy `/baza-wiedzy/`, `/portfolio/`, `/branza/` są zrzutem z buildu (MIX-922, MIX-1589). Po publikacji w Sanity strona pokazuje starą listę, aż ktoś zbuduje ją od nowa. Ten runbook opisuje automatyczną przebudowę **Preview**. Produkcja: bez automatu, wgranie tylko po komentarzu `TAK <SHA>` (patrz „Produkcja”).

## Dlaczego nie „deploy hook Cloudflare Pages”

Projekt Pages (`mixturemarketing-stona`) dostaje gotowy `dist/` z GitHub Actions (`wrangler pages deploy`), Cloudflare niczego nie buduje, więc deploy hook Pages nie ma co przebudować. Budowę robi workflow `.github/workflows/ci.yml`. Zmiana w repo (ta gałąź): wdrożenie Preview działa też po ręcznym uruchomieniu workflow (`workflow_dispatch`) na gałęzi `dev`. Cel wdrożenia wyznacza skrypt `scripts/ci-deploy-guard.sh` (rozróżnia wielkość liter: `DEV`, `Dev` nie wdrażają, a krok kończy się błędem). Produkcja (`main`) tylko po `push`, po strażniku powtórek.

## Warunek wstępny: gałąź `dev` musi istnieć na GitHub

Webhook woła GitHub API z `"ref": "dev"`. Gdy gałęzi `dev` nie ma w repozytorium na GitHub, GitHub odpowiada **422** („No ref found”), a nie 204, i nic się nie buduje. Stan na 13.11: `git ls-remote --heads origin dev` nie zwraca nic (gałęzi nie ma). Gałąź zakłada **lider** (push gałęzi wydania na `dev`, pierwsze wgranie Preview, zgoda MIX-868), nie Jakub. Przed krokiem 2 sprawdź w GitHub → Branches, że `dev` jest na liście. Bez niej test webhooka da 422.

## Przełączniki funkcji w Preview (zasada MIX-1411)

Build dla `dev` ustawia WSZYSTKIE przełączniki `VITE_MM_*` na `1`: `VITE_MM_AI_SECTION`, `VITE_MM_COOKIE_BANNER_STATIC`, `VITE_MM_LIVE_PRICE_BAR`, `VITE_MM_MOBILE_MENU_B`, `VITE_MM_POWIAZANE`, `VITE_MM_RZESZOW_SEKCJE`, `VITE_MM_TESTIMONIALS`, `VITE_MM_VIEW_TRANSITIONS`. Na produkcji i w pull requestach włączone jest tylko `VITE_MM_MOBILE_MENU_B` (decyzja MIX-1465); resztę włącza dopiero `TAK <SHA>`. Lista pochodzi z kodu: test `tests/scripts/ciWorkflow.test.ts` czyta wszystkie `VITE_MM_*` z kodu aplikacji i pada, gdy nowy przełącznik nie trafi do kroku budowy. `VITE_MM_HUB_URL` i `VITE_MM_PREONBOARD_KEY` to wartości konfiguracji, nie przełączniki. Poza zakresem: `VITE_RODO_KLAUZULA` (inny przedrostek, treść prawna do osobnej decyzji Jakuba).

## Co robi Jakub ręcznie (kolejność)

1. GitHub: token szczegółowy (fine-grained PAT) tylko do repozytorium strony, uprawnienie **Actions: Read and write**, nic więcej, termin ważności 90 dni. Wartość wpisuje się tylko w kroku 2, nigdzie indziej (nie do czatu, Lineara ani plików).
2. Sanity (projekt strony, dataset `production`) → API → Webhooks → Create:
   - Name: `Przebudowa Preview`; Dataset: `production`; Trigger on: Create, Update, Delete.
   - URL: `https://api.github.com/repos/MixtureMarketing/MixtureMarketing-stona/actions/workflows/ci.yml/dispatches`; Method: POST.
   - Filter (GROQ, tylko opublikowane, bez szkiców): `_type in ["article","category","industry","caseStudy","location"] && !(_id in path("drafts.**"))`. Zawiera `category`, bo lista artykułów czyta tytuł kategorii (`category->{title}`); inne typy dokumentów nie trafiają do list.
   - Projection: `{"ref": "dev"}`
   - HTTP headers: `Authorization: Bearer <token z kroku 1>`, `Accept: application/vnd.github+json`, `X-GitHub-Api-Version: 2022-11-28`.
   - Drafts: wyłączone („Include drafts” odznaczone).
3. Brak sekretu w repo: token żyje tylko w ustawieniach webhooka Sanity.

## Jak sprawdzić

1. W Sanity opublikuj zmianę testowego artykułu (albo użyj „Test webhook”/„Send test” w panelu webhooka: oczekiwany kod odpowiedzi 204; 422 = brak gałęzi `dev`).
2. GitHub → Actions → „CI Pipeline”: w ciągu ok. 1 min nowy bieg z zdarzeniem `workflow_dispatch` na `dev`; po 5–10 min kroki „Deploy to Cloudflare Pages (Preview dev)” zielone, a krok „Resolve deploy target” pokazuje `target=preview`.
3. Otwórz `https://dev.mixturemarketing-stona.pages.dev/baza-wiedzy/`: opublikowana zmiana jest na liście bez ręcznego wgrywania.
4. Szkic (zapisany, niepublikowany) nie uruchamia biegu.
5. Kilka publikacji pod rząd: workflow ma `concurrency` z anulowaniem, więc kończy się tylko ostatni bieg (stan z ostatniej publikacji); to oczekiwane.

## Jak wycofać

- Wyłącz albo usuń webhook w Sanity (od razu kończy automat). Token GitHub unieważnij w ustawieniach GitHub.
- Cofnięcie zmiany w repo: w `ci.yml` krok „Resolve deploy target” i warunek `steps.target.outputs.target == 'preview'` kroków „(dev)” zastąp warunkiem tylko na `push` na `dev`. Bez webhooka zmiana jest nieszkodliwa (ręczne uruchomienie na `dev` wdraża Preview, jak push).
- Zła treść na Preview: opublikuj poprawkę w Sanity albo uruchom ręcznie workflow na `dev` (Actions → Run workflow → branch `dev`).

## Granice i ryzyko resztkowe

- Awaria Sanity podczas budowy: lista artykułów to rejestr w kolejności „najnowsze pierwsze” (bez artykułów tylko z CMS do następnej przebudowy). `/portfolio/` i `/branza/` przy awarii przerywają budowę z komunikatem (bez zrzutu nie ma wdrożenia).
- Zrzut o złym kształcie (nie lista, pozycja z brakującym albo źle otypowanym polem, ponad 1000 pozycji) strona w całości ignoruje i pobiera listę z CMS (allowlista pól w `hooks/cmsSnapshotSchema.ts`).
- **Ponowne uruchomienie starego biegu na produkcji (re-run).** Token z uprawnieniem Actions: Write może ponownie uruchomić stary bieg „push na main”. Strażnik w `ci.yml` (krok „Replay guard”, `scripts/ci-deploy-guard.sh main-tip`) przed wdrożeniem sprawdza, że SHA biegu jest bieżącym końcem `main` w GitHub (`git ls-remote`); starszy SHA = kod 1 z linią powodu, produkcja bez zmian. Brak odpowiedzi GitHub albo niejednoznaczny wynik też kończy krok błędem. **Zostaje:** re-run biegu dla bieżącego końca `main` zbuduje produkcję ponownie z tym samym SHA i aktualną treścią CMS, bez nowego `TAK <SHA>`. Zalecane do decyzji recenzenta: środowisko GitHub `production` z wymaganym recenzentem (wtedy każdy bieg na `main` czeka na zatwierdzenie); tej zmiany ustawień repozytorium ta gałąź nie robi.
- Preview: ręczne uruchomienie na `dev` wdraża tylko Preview (`--branch=dev`), nigdy produkcję. Uruchomienie na `main` (workflow_dispatch) nie wdraża niczego.

## Produkcja

Nie jest objęta. Webhook wskazuje wyłącznie `dev`; workflow z `workflow_dispatch` nie wdraża na `main` (cel `prod` tylko dla `push` na `main`, po strażniku powtórek). Przebudowa produkcji po publikacji = osobna decyzja i wgranie tylko po komentarzu Jakuba `TAK <SHA>` w zadaniu „Wdrożenie”.

Do akceptacji Jakuba: kroki 1–2 wykonuje człowiek (token i webhook), agent niczego nie zakłada.
