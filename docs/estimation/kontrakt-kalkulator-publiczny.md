# KONTRAKT API — Publiczny kalkulator wyceny (f4a)

**Wersja kontraktu:** 1.1 · **Data:** 2026-07-17 · **Status:** ZATWIERDZONY (architekt, po korekcie §5)

Ten dokument jest **źródłem prawdy** dla dwóch sesji: f4a (warstwa API, ta sesja) i f4b
(UI, sesja redesignu). Kod nie wyprzedza kontraktu — zmiana kształtu API to zmiana TEGO
dokumentu (bump „Wersja kontraktu") przed implementacją. Wartości merytoryczne (parametry,
zestaw pytań publicznych) to treść w seedach (właściciel: Jakub, Level 2) — tu zapisane
jako zatwierdzone dla wersji 1.

---

## 1. Zasady nadrzędne

1. **Najwęższa polityka ujawniania (E3.1).** Publiczny POST zwraca **wyłącznie zawężone,
   poszerzone i zaokrąglone widełki cenowe**. NIGDY: godzin, Confidence/breakdownu, nazw
   reguł, poziomów obszarów, mnożników, danych biblioteki, `engine_version`, rekomendacji
   platformy (ta wraca dopiero w f4b jako osobne pytanie L2), ani identyfikatorów wewnętrznych
   (`quote_id`).
2. **Transform prezentacyjny, nie silnik (E3.2).** Poszerzenie/zaokrąglenie działa na wyniku
   `computeQuote().totals.offer` przez `toPublicOffer(totals, params)`. Formuła agregacji i
   `engine_version` **bez zmian** — publiczny band to warstwa prezentacji czytająca parametry.
3. **Wiedza = dane (inwariant 2).** Progi poszerzenia, zaokrąglenie, zestaw pytań publicznych
   i mapa archetypów fallback żyją w `est_params`/`est_questions` (seedy), nie w kodzie.
4. **Bez migracji (E3.3, wariant a).** Pytania są już w języku klienta (inwariant 9 — `text`
   i `options_json.label` są promise-safe), więc front renderuje istniejący `text`. Treść
   kliencka obszarów/poziomów (`client_name`/`client_description`, migracja 0007) NIE wychodzi
   w wersji 1 (najwęższa polityka = tylko widełki); rezerwujemy ją pod ewentualny „zakres
   słowami" w przyszłej wersji kontraktu.

---

## 2. `GET /api/estimation/public-questions`

Zwraca pytania publiczne do zbudowania formularza. Bez auth, bez efektów ubocznych,
cache’owalny. Bez Turnstile (brak zapisu/compute).

**Response 200:**
```json
{
  "contractVersion": 1,
  "questions": [
    {
      "code": "project_goal",
      "text": "Co ma robić projekt?",
      "help_text": null,
      "answer_type": "select",
      "options": [{ "value": "sklep", "label": "Sklep internetowy" }, "..."],
      "visible_if": null,
      "group": "projekt",
      "sort_order": 10
    }
  ]
}
```
Pola: **wyłącznie** `code, text, help_text, answer_type, options (value+label), visible_if,
group, sort_order`. NIE wychodzą: `unknown_weight`, `visibility`, żadne dane reguł/biblioteki.
Zwracane są tylko wiersze `est_questions` z `visibility='public' AND is_active=1`, w kolejności
`sort_order`. `visible_if` (jeśli obecny) używa formatu warunków silnika (05) — front stosuje
tę samą logikę widoczności co wizard; kaskada odwołująca się do pytania spoza zbioru publicznego
jest błędem treści (do wychwycenia przy kurateli L2).

---

## 3. `POST /api/estimation/public-quote`

Liczy wycenę, zapisuje leada + draft, zwraca sanityzowane widełki. Chroniony (Turnstile +
honeypot + rate-limit).

**Request (application/json):**
```json
{
  "answers": { "project_goal": "sklep", "languages": 2, "sensitive_data": true },
  "email": "jan@przyklad.pl",
  "captcha_token": "<turnstile>",
  "website_verify": ""
}
```
- `answers` — mapa `kod → wartość`. Akceptowane **wyłącznie kody z zestawu publicznego**;
  klucze spoza niego są odrzucane (ignorowane, nie liczą się). Typy walidowane wg `answer_type`
  (bool/number/select/multiselect). `project_goal` jest **wymagane** (steruje archetypem i
  większością reguł); jego brak → 400.
- `email` — **WYMAGANY** (decyzja: lead bez kontaktu nie jest leadem; spójnie z
  contact-submit/calculator-submit). Walidacja regex jak w calculator-submit. Brak/niepoprawny → 400.
- `captcha_token` — token Turnstile. Brak/nieważny → 403.
- `website_verify` — honeypot. Niepuste → 403 (bot).

**Przepływ serwera (kolejność):**
1. Honeypot (`website_verify` niepuste → 403).
2. Turnstile `verifyTurnstile(captcha_token, TURNSTILE_SECRET, ip)` → 403 przy porażce.
3. Rate-limit KV (per IP, §6) → 429 po przekroczeniu.
4. Walidacja: `email` poprawny, `project_goal` obecne, `answers` przefiltrowane do kodów
   publicznych + kontrola typów → 400 przy błędzie.
5. Archetyp wewnętrzny: **top-pick z `recommend_archetype`** (fallback: mapa per-cel, §5) — NIE ujawniany.
6. `loadRawLibrary(DB)` → `buildLibraryData(rawLib, archetyp, project_goal)` → `computeQuote`.
7. `toPublicOffer(computeQuote().totals, params)` → poszerzone/zaokrąglone widełki (§4).
8. Zapis (z retry/backoff D1, §6): lead (`source='calculator'`, odpowiedzi + widełki w `details`)
   + draft `est_quote` (§7) + `est_quote_answers`. Zapis best-effort nie blokuje odpowiedzi z ceną.
9. E-mail potwierdzający do klienta + powiadomienie do agencji (Resend, best-effort, §7).

**Response 200:**
```json
{ "priceRange": { "min": 27500, "max": 53000 }, "currency": "PLN", "status": "ok" }
```
**Wyłącznie** `priceRange` (+ `currency`, `status`). Zero godzin, zero id, zero platformy.

**Błędy:** `400` (walidacja: email/project_goal/typy), `403` (honeypot/captcha), `429` (rate-limit),
`500` (błąd serwera — bez szczegółów wewnętrznych w treści).

---

## 4. Transform publiczny — `toPublicOffer(totals, params)`

Wejście: `totals.offer = { min, max }` (zawężone widełki ofertowe silnika). Kroki:
1. **Poszerzenie** o `public_widen_k`: `wMin = offer.min × (1 − k)`, `wMax = offer.max × (1 + k)`.
2. **Zaokrąglenie** do `public_round_pln`: `min` w **dół**, `max` w **górę**.

Parametry (seed, wersja 1): `public_widen_k = 0.15`, `public_round_pln = 500`.

**Przypadek kontrolny (do testu, liczony ręcznie):** `offer = {min: 32400, max: 46000}` →
poszerzenie: `wMin = 32400 × 0.85 = 27540`, `wMax = 46000 × 1.15 = 52900` → zaokrąglenie 500:
`min = floor(27540/500)×500 = 27500`, `max = ceil(52900/500)×500 = 53000` → **`{27500, 53000}`**.

Determinizm i zero hardkodów: `k` i krok zaokrąglenia wyłącznie z `est_params`. Zmiana wartości
= UPDATE seeda (Level 2), nie zmiana kodu ani `engine_version`.

---

## 5. Archetyp wewnętrzny (top-pick reguł; fallback mapa per-cel) — NIE ujawniany

Publiczny compute potrzebuje archetypu (domyślne poziomy + tryb integracji), ale platforma
NIE wychodzi na front (E3.1, przeniesione do f4b). **Źródło (kolejność):**

1. **Primary — top-pick z `recommend_archetype`.** `evaluateRules(answers, rules)` zwraca
   `recommendedArchetypes` w kolejności **deterministycznej** (priorytet reguły DESC, `id` ASC);
   bierzemy `recommendedArchetypes[0].code`. Archetyp jest wtedy **wyprowadzony z odpowiedzi**
   (m.in. `custom_logic`, `frontend_headless`), więc dla projektów headless/custom band NIE jest
   zaniżony (korekta architekta: stała mapa ignorująca odpowiedzi ryzykowała „na stronie było
   taniej" i wkładała mylący archetyp do draftu). `project_goal` jest wymagane, a każdy cel ma
   regułę `recommend_archetype` (05: #35–#40, #45–#46, #39) → rekomendacja praktycznie zawsze istnieje.
2. **Fallback — mapa per-cel** (gdy, defensywnie, brak rekomendacji): `est_params.public_archetype_fallback`
   (JSON, Level 2): `sklep→woocommerce`, `wizytowka→wordpress`, `portal_tresci→wordpress`,
   `aplikacja→laravel`, `b2b→laravel`.
3. **Globalny fallback** (cel spoza mapy): `laravel`.

Zapisywane na draftcie: `archetype_code` = wybrany, `archetype_recommended` = ta sama wartość,
`archetype_reason` = `"Kalkulator publiczny — {reguła „<nazwa>" | fallback cel: <goal>}"`.
Jakub weryfikuje/zmienia przy dociąganiu w panelu.

---

## 6. Ochrona

- **Turnstile** — wzorzec `contact-submit.ts` (`verifyTurnstile`, env `TURNSTILE_SECRET`).
  Brak pseudo-tokenów obejścia.
- **Honeypot** — pole `website_verify`; niepuste = 403.
- **Rate-limit (KV `CACHE`)** — **5 żądań / godzinę / IP** (POST). Klucz `pubcalc:rl:{ip}`,
  licznik z TTL 3600 s; po 5 → 429. Miękki (KV jest eventually consistent) — twardą bramą
  botów jest Turnstile; rate-limit ogranicza nadużycie i koszt Resend/D1.
- **Retry/backoff D1** (dług z backlogu F3, `07`): zapisy D1 (lead + draft + answers) przez
  cienki `withRetry` (idempotentne; przejściowe 500/cold-start nie surfacuje jako błąd klienta).
- **CORS** — nagłówki jak w contact-submit (origin `https://mixturemarketing.pl`) + OPTIONS.

---

## 7. Lead, draft i e-mail

**Lead** (`leads`, `source='calculator'`): `details` (JSON) = `{ answers, priceRange }`;
`budget = "{min} - {max}"`. Wzorzec calculator-submit.

**Draft `est_quote`** (status `draft`): `name = "Kalkulator — {email} — {YYYY-MM-DD}"`,
`lead_id`, `archetype_code`/`archetype_recommended`/`archetype_reason` (§5), `params_json`
snapshotowany (jak quotes.ts POST). Odpowiedzi → `est_quote_answers`. **Draft NIE jest
finalizowany** — bez snapshotu obszarów/itemów/totals; Jakub otwiera w panelu („Wyceny") i
dociąga do pełnej (walidacja + finalize).

**E-mail (Resend, best-effort — porażka nie blokuje odpowiedzi):**
- do klienta: potwierdzenie z widełkami (`priceRange`);
- do agencji (`NOTIFY_EMAIL`): powiadomienie o nowym leadzie z kalkulatora.
Decyzja L2 (Jakub, rekomendacja: wymagany): status e-mail **wysyłany** w wersji 1.
**Degradacja łagodna (architekt):** brak `RESEND_API_KEY` = **ciche pominięcie wysyłki, nigdy 500**;
lead i draft zapisują się **zawsze**, niezależnie od maila (mail jest efektem ubocznym, nie warunkiem).

---

## 8. Parametry i pytania publiczne (seed, wersja 1 — zatwierdzone L2)

**Nowe `est_params`:** `public_widen_k = 0.15`, `public_round_pln = 500`, `public_rate_per_hour = 5`,
`public_archetype_fallback` = `{"sklep":"woocommerce","wizytowka":"wordpress","portal_tresci":"wordpress","aplikacja":"laravel","b2b":"laravel"}` (fallback §5, gdy brak rekomendacji reguł).

**Zestaw pytań `visibility='public'` (8):** `project_goal`, `languages`, `views_count`,
`users_type`, `sensitive_data`, `downtime_tolerance`, `custom_logic`, `frontend_headless`.
`project_goal` — semantycznie wymagane. (Kuratela/rozszerzenie zbioru = Level 2, kolejne wersje kontraktu.)

---

## 9. Poza kontraktem (świadomie)

- **UI kalkulatora** — f4b (sesja redesignu); ten dokument jest jej wejściem.
- **Rekomendacja platformy dla klienta** — f4b (osobne pytanie L2).
- **„Zakres słowami" (client_name/client_description obszarów)** — ewentualnie wersja 2 kontraktu.
- **Portal klienta / dociąganie pytań `portal` / rabaty D9** — f4c.
- **Stary kalkulator `/offers`** — zostaje do f4b.

## 10. Wersjonowanie
`contractVersion` w odpowiedzi GET. Zmiana kształtu pól = bump wersji + aktualizacja tego
dokumentu przed kodem. Zmiana wartości seedów (progi, zestaw pytań) NIE bumpuje wersji kontraktu
(to treść), ale jest odnotowana w §8.
