# Przebudowa Preview po publikacji w CMS (MIX-1613)

Cel: listy `/baza-wiedzy/`, `/portfolio/`, `/branza/` są zrzutem z buildu (MIX-922, MIX-1589). Po publikacji w Sanity strona pokazuje starą listę, aż ktoś zbuduje ją od nowa. Ten runbook opisuje automatyczną przebudowę **Preview**. Produkcja: bez automatu, wgranie tylko po komentarzu `TAK <SHA>` (patrz „Produkcja”).

## Dlaczego nie „deploy hook Cloudflare Pages”

Projekt Pages (`mixturemarketing-stona`) dostaje gotowy `dist/` z GitHub Actions (`wrangler pages deploy`), Cloudflare niczego nie buduje, więc deploy hook Pages nie ma co przebudować. Budowę robi workflow `.github/workflows/ci.yml`. Zmiana w repo (ta gałąź): wdrożenie Preview działa też po ręcznym uruchomieniu workflow (`workflow_dispatch`) na gałęzi `dev`. Produkcja (`main`) dalej tylko po `push`.

## Co robi Jakub ręcznie (kolejność)

1. GitHub: token szczegółowy (fine-grained PAT) tylko do repozytorium strony, uprawnienie **Actions: Read and write**, nic więcej, termin ważności 90 dni. Wartość wpisuje się tylko w kroku 2, nigdzie indziej (nie do czatu, Lineara ani plików).
2. Sanity (projekt strony, dataset `production`) → API → Webhooks → Create:
   - Name: `Przebudowa Preview`; Dataset: `production`; Trigger on: Create, Update, Delete.
   - URL: `https://api.github.com/repos/MixtureMarketing/MixtureMarketing-stona/actions/workflows/ci.yml/dispatches`; Method: POST.
   - Filter (GROQ, tylko opublikowane, bez szkiców): `_type in ["article","industry","caseStudy","location"] && !(_id in path("drafts.**"))`
   - Projection: `{"ref": "dev"}`
   - HTTP headers: `Authorization: Bearer <token z kroku 1>`, `Accept: application/vnd.github+json`, `X-GitHub-Api-Version: 2022-11-28`.
   - Drafts: wyłączone („Include drafts” odznaczone).
3. Brak sekretu w repo: token żyje tylko w ustawieniach webhooka Sanity.

## Jak sprawdzić

1. W Sanity opublikuj zmianę testowego artykułu (albo użyj „Test webhook”/„Send test” w panelu webhooka: oczekiwany kod odpowiedzi 204).
2. GitHub → Actions → „CI Pipeline”: w ciągu ok. 1 min nowy bieg z zdarzeniem `workflow_dispatch` na `dev`; po 5–10 min kroki „Deploy to Cloudflare Pages (Preview dev)” zielone.
3. Otwórz `https://dev.mixturemarketing-stona.pages.dev/baza-wiedzy/`: opublikowana zmiana jest na liście bez ręcznego wgrywania.
4. Szkic (zapisany, niepublikowany) nie uruchamia biegu.
5. Kilka publikacji pod rząd: workflow ma `concurrency` z anulowaniem, więc kończy się tylko ostatni bieg (stan z ostatniej publikacji); to oczekiwane.

## Jak wycofać

- Wyłącz albo usuń webhook w Sanity (od razu kończy automat). Token GitHub unieważnij w ustawieniach GitHub.
- Cofnięcie zmiany w repo: przywróć warunki `if:` dwóch kroków „(dev)” w `ci.yml` do `github.event_name == 'push' && github.ref == 'refs/heads/dev'`. Bez webhooka zmiana jest nieszkodliwa (ręczne uruchomienie na `dev` wdraża Preview, jak push).
- Zła treść na Preview: opublikuj poprawkę w Sanity albo uruchom ręcznie workflow na `dev` (Actions → Run workflow → branch `dev`).

## Granice

- Awaria Sanity podczas budowy: lista artykułów to rejestr w kolejności „najnowsze pierwsze” (bez artykułów tylko z CMS do następnej przebudowy). `/portfolio/` i `/branza/` przy awarii przerywają budowę z komunikatem (bez zrzutu nie ma wdrożenia).
- Zrzut o złym kształcie (nie lista, uszkodzone pozycje) strona ignoruje i pobiera listę z CMS.

## Produkcja

Nie jest objęta. Webhook wskazuje wyłącznie `dev`; workflow z `workflow_dispatch` nie wdraża na `main` (warunek wymaga `push`). Przebudowa produkcji po publikacji = osobna decyzja i wgranie tylko po komentarzu Jakuba `TAK <SHA>` w zadaniu „Wdrożenie”.

Do akceptacji Jakuba: kroki 1–2 wykonuje człowiek (token i webhook), agent niczego nie zakłada.
