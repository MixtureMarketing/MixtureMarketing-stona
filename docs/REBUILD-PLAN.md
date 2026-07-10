# Plan odbudowy backendu — Mixture Marketing

> Status dokumentu: **plan roboczy** · Utworzono: 2026-07-10 · Właściciel: zespół MM
> Ten plik jest mapą prac. Każdą fazę **poprzedzamy** jej szczegółową analizą (odczyt
> odpowiednich funkcji z gałęzi `cloudflare-migration` + kontrakt z frontendem `main`)
> — sekcje „Faza 2/3/4" są celowo na poziomie planu do pogłębienia w momencie startu.

---

## 1. Stan zastany (fakty, nie założenia)

| Warstwa | Stan | Dowód |
|---|---|---|
| Front / SEO / treści | ✅ żyje | prod na Cloudflare **Pages** (`wrangler pages deploy dist`) |
| Formularz kontaktowy | ⚠️ działa, ale tylko e-mail (Resend), **bez zapisu** | `functions/api/contact-submit.ts` |
| Kalkulator, Audyt, Portal, Admin/CRM, Auth | ❌ **martwe** — wołają PHP → `405` | ~24 endpointy `.php`, patrz §2 |
| Backend PHP (`public/api/**`) | ❌ nie wykonuje się; **kod źródłowy publicznie czytelny** | GET `.php` → 200 raw source |
| Baza MySQL (LH.pl `main143.lh.pl`) | ❌ domena już nie obsługiwana przez LH.pl (403) | DNS → Cloudflare |

### 🔑 Kluczowe odkrycie — backend już istnieje
Cały backend został **przepisany PHP → TypeScript na gałęzi `origin/cloudflare-migration`**,
ale **nigdy nie zmergowany** i porzucony ~2026-02-11. `main` rozjechał się od tego czasu
(treść/SEO/abonament, do 2026-05-26).

- Rozjazd: **30 commitów** na migracji nieobecnych na main, **59** na main nieobecnych na migracji.
- Na `cloudflare-migration` jest: `wrangler.toml` z realnymi bindingami (D1 `mixture-db`,
  KV `CACHE`, R2 `mixture-files`, Durable Object `CHAT_ROOM`, Hyperdrive `AUDIT_DB`→legacy MySQL)
  oraz **komplet ~27 funkcji** `functions/api/**` (admin, portal, auth, audit, calculator,
  contact, rum, czat).
- Jest też gałąź `origin/legacy-hosting` = snapshot starego PHP.

**Wniosek strategiczny:** to nie jest „napisz backend od zera", tylko
**„pogódź gałęzie i dokończ migrację" (harvest & reconcile).** Znacznie mniejszy nakład,
ale inne ryzyka: kontrakty API z gałęzi migracyjnej były pisane pod front z lutego 2026 —
main ewoluował, więc każdą funkcję trzeba zweryfikować względem bieżącego frontendu.

---

## 2. Mapa martwych endpointów (front `main` → backend)

Działa **jeden**: `/api/contact-submit`. Reszta = martwy PHP na `main`, ale **ma już
odpowiednik TS** na `cloudflare-migration`:

| Obszar | Endpoint woła front (main) | Odpowiednik TS (migration) |
|---|---|---|
| Leady | `calculator_submit.php` | `functions/api/calculator_submit.ts` |
| Audyt | `audit/run_audit.php`, `audit/get_audit_result.php` | `audit/run_audit.ts`, `audit/get_result.ts` |
| Auth | `auth/send_magic_link.php`, `auth/verify_token.php` | `auth/send_magic_link.ts`, `auth/verify_token.ts` |
| Portal | `portal/{dashboard,get_messages,send_message,update_profile,update_milestone,download}.php` (6) | `portal/*.ts` + `portal/chat.ts` + `portal/_middleware.ts` |
| Admin | `admin/{get_leads,get_performance_stats,get_all_data,get_all_messages,admin_reply_chat,delete_document,upload_document,save_milestone,convert_lead,reply_lead,save_client,save_project}.php` (12) | `admin/*.ts` + `admin/_middleware.ts` |
| RUM | `rum-collect.php` | `rum-collect.ts` (już zastąpione Zaraz — do porzucenia) |

---

## 3. Zasady przewodnie

1. **Harvest, nie rebuild** — bazujemy na TS z `cloudflare-migration`, weryfikując każdy
   kontrakt względem `main`. Nie przepisujemy tego, co działa.
2. **Cloudflare jako domyślny kierunek**, ale bez betonowania: schemat D1 trzymamy w
   **przenośnym SQL** (łatwe wyjście do Postgresa/Supabase, gdyby portal przerósł D1).
3. **Skala mała** (kilka–kilkaset leadów) → D1/KV/R2 z ogromnym zapasem, koszt ~0.
4. **Pages Functions, nie Workers-with-assets (na teraz).** Reconciliacja na istniejący
   model Pages jest najniższego ryzyka. Migrację do Workers-with-assets traktujemy jako
   opcjonalną, późniejszą konsolidację (§7), nie warunek działania.
5. **Kolejność wg wartości biznesowej:** najpierw przestać tracić leady, portal na końcu.
6. **Każda faza kończy się działającym, wdrożonym wycinkiem** (nie „wielki bang").

---

## 4. Architektura docelowa

```
Cloudflare Pages (front: prerender + hydracja React)
   └─ Pages Functions  (functions/api/**, runtime Workers)
         ├─ leady:   contact / calculator          → D1 (leads) + Resend + R2 (PDF wyceny)
         ├─ audyt:   run_audit / get_result         → PSI API + KV (cache) + D1 (wynik)
         ├─ auth:    send_magic_link / verify_token  → D1 (auth_tokens, users) + Resend
         ├─ portal:  dashboard/messages/chat/docs    → D1 + R2 + Durable Object (czat)
         └─ admin:   leads/projects/clients/chat      → D1  (za _middleware auth)
```

Bindingi (z `cloudflare-migration/wrangler.toml`): `DB` (D1), `CACHE` (KV), `FILES` (R2),
`CHAT_ROOM` (DO). Sekrety w CF Pages: `TURNSTILE_SECRET`, `RESEND_API_KEY`, `NOTIFY_EMAIL`,
+ ewentualnie `PSI_API_KEY`, `JWT_SECRET`.

---

## 5. Fazy — przegląd

| Faza | Zakres | Wartość | Szac. nakład | Ryzyko |
|---|---|---|---|---|
| **0** | Recon, higiena, weryfikacja zasobów CF, strategia reconciliacji | odblokowuje resztę, zamyka wyciek kodu | 0.5–1 dzień | niskie |
| **1** | Fundament (wrangler+D1) + leady (contact+calculator) z zapisem | **przestajemy tracić leady** | 2–4 dni | średnie |
| **2** | Auth (magic-link) + Admin/CRM (podgląd i obsługa leadów) | znów widać i obsługuje leady | 3–5 dni | średnie |
| **3** | Silnik audytu (`/audyt-360`) | lead-magnet znów działa | 1–2 tyg. | wysokie (Hyperdrive/PSI) |
| **4** | Portal klienta + czat + dokumenty | pełny produkt „klient↔agencja" | 2–3 tyg. | wysokie (DO, R2, auth) |

---

## 6. Fazy — szczegóły

### ✅ Faza 0 — Recon, higiena, decyzje (SZCZEGÓŁY)

**Cel:** bezpieczny punkt startu, pełna wiedza o zasobach, wybór strategii scalania.

**Zadania:**
1. **Weryfikacja zasobów CF (blocker).** Potwierdzić, że bindingi z `wrangler.toml` realnie
   istnieją na koncie: D1 `mixture-db`, KV `CACHE`, R2 `mixture-files`, DO `CHAT_ROOM`,
   Hyperdrive `AUDIT_DB`. (Dostępne narzędzia Cloudflare MCP: `d1_databases_list`,
   `kv_namespaces_list`, `r2_buckets_list` — lub `wrangler` w interaktywnej sesji.)
   → Wynik determinuje, czy tworzymy zasoby od nowa, czy podpinamy istniejące.
2. **Higiena bezpieczeństwa:** usunąć `public/api/**` (martwy, publicznie czytelny PHP).
   Zweryfikować, że nic w `dist/` już go nie potrzebuje (front woła `/api/*`, nie pliki `.php`
   jako zasób — bezpieczne).
3. **Audyt gałęzi `cloudflare-migration`:** przeczytać każdą funkcję TS i spisać jej kontrakt
   (payload req/resp) vs bieżący front `main`. Zbudować tabelę „zgodne / do poprawki".
4. **Wybór strategii scalania** (rekomendacja: **cherry-pick per-plik/obszar**, nie merge
   całej gałęzi — bo 59 commitów main by się kłóciło). Alternatywy: (a) cherry-pick funkcji
   obszarami zgodnie z fazami; (b) `git checkout cloudflare-migration -- functions/... wrangler.toml`
   na feature-branchu od main. Rekomendacja: **(b) na branchu `feat/backend-revival`**.
5. **Naprawa drobnych krzaczków przy okazji:** obejście Turnstile (`local_bypass`/
   `existing_lead_verified` w `contact-submit.ts`), podwójny Zaraz (`index.html` +
   auto-inject), kłamliwy wpis D1 w `ROADMAP.md`, stały komentarz w `config/site.ts:29`.

**Definition of done:** wiemy które zasoby CF żyją; `public/api/**` usunięte; jest branch
`feat/backend-revival` od main; jest tabela kontraktów per-endpoint.

**Otwarte pytania Fazy 0:**
- Czy D1 `mixture-db` ma już jakieś dane (leady z krótkiego okresu, gdy migracja żyła)?
- Czy Hyperdrive→legacy MySQL jeszcze się łączy (wpływa na Fazę 3)?

---

### ✅ Faza 1 — Fundament + przechwytywanie leadów (SZCZEGÓŁY)

**Cel:** każde zgłoszenie (kontakt + kalkulator) trafia do D1 **oraz** na e-mail. Koniec
utraty leadów.

**1a. Bindingi i schemat D1**
- Przenieść `wrangler.toml` na `main` (lub feature-branch), zweryfikować `database_id`.
- **Schemat D1 (SQLite dialect)** — port z `scripts/db_backup/mysql_schema.sql`. Konwersje:
  - `int AUTO_INCREMENT` → `INTEGER PRIMARY KEY AUTOINCREMENT`
  - `tinyint(1)`/`boolean` → `INTEGER` (0/1)
  - `enum(...)` → `TEXT` + `CHECK(col IN (...))`
  - `datetime`/`timestamp` → `TEXT` (ISO8601) z `DEFAULT CURRENT_TIMESTAMP`
  - `longtext`/`text` → `TEXT`; usunąć `ENGINE=`/`CHARSET=`
  - FK zostają (D1 wspiera `PRAGMA foreign_keys`).
  - Migracje trzymać w `migrations/0001_init.sql` (portable SQL — patrz zasada §3.2).
- Tabela `leads` w Fazie 1 wystarczy; `users/projects/...` można w tej samej migracji
  (nie zaszkodzą) albo dołożyć w Fazie 2.

**1b. Funkcja `contact` (harvest + fix)**
- ⚠️ **Niespójność nazwy:** front `main` woła `/api/contact-submit` (myślnik), a migracja
  ma `contact_submit.ts` (podkreślnik). Ujednolicić — zostawić `contact-submit.ts` (żeby
  nie ruszać frontu i testów) i przenieść z niego logikę zapisu do D1 z wersji migracyjnej.
- Dodać `INSERT INTO leads` (create) + `UPDATE` (kroki 2/3) — schemat kolumn jak w PHP
  (`status='new'`, `current_step`, `details` JSON, `source`).
- ⚠️ **Fix bezpieczeństwa:** usunąć bezwarunkowe obejście Turnstile. `local_bypass` tylko
  gdy `ENVIRONMENT=dev`; `existing_lead_verified` zastąpić realnym sprawdzeniem, że lead
  o danym `id` istnieje w D1 (a nie „ufamy stringowi").

**1c. Funkcja `calculator` (harvest + istotna różnica)**
- ⚠️ **Front wysyła `multipart/form-data`** z polami `email`, `pdf` (Blob wygenerowany
  `jspdf` po stronie klienta), `data` (JSON `{selections, result}`) — patrz
  `components/features/PriceCalculator.tsx:77-86`. Funkcja TS musi:
  - sparsować FormData (`await request.formData()`),
  - zwalidować e-mail i typ pliku (PDF),
  - **zapisać PDF do R2** (`env.FILES.put(...)`) zamiast SMTP-attachment,
  - wysłać mail do klienta (link do PDF w R2 lub załącznik przez Resend) + powiadomienie
    do `NOTIFY_EMAIL`,
  - `INSERT INTO leads (... source='calculator', status='new')`.
- Przepiąć front z `/api/calculator_submit.php` → `/api/calculator-submit` (ujednolicić myślnik).

**1d. Sprzątanie**
- Usunąć wywołanie/relikt `rum-collect` (zastąpione Zaraz).

**Definition of done:** wysłanie formularza kontaktowego i kalkulatora na produkcji tworzy
wiersz w D1 (`wrangler d1 execute ... "SELECT * FROM leads"`) **i** wysyła maile; Turnstile
nie da się obejść; kalkulatorowy PDF ląduje w R2.

**Testy/weryfikacja:** rozszerzyć `tests/services/leadService.test.ts`; e2e: realne
wysłanie na preview deployu + `SELECT` z D1.

**Ryzyka Fazy 1:** rozbieżność kontraktu kalkulatora (FormData vs JSON), limit rozmiaru
requestu na Functions dla PDF, poprawność dialektu SQLite w migracji.

---

### ⏳ Faza 2 — Auth (magic-link) + Admin/CRM  (poziom planu — pogłębić przy starcie)

**Zamysł biznesowy:** „zgłoszenie → od razu w CRM" — panel admina `/portal/admin` czyta
i obsługuje leady/klientów/projekty z D1.

**Wstępny zakres (do potwierdzenia po odczycie funkcji z migracji):**
- **Auth:** zostać przy **magic-link na D1** (`auth_tokens`, `users.session_token`) — bo
  front (`context/AuthContext.tsx`) już go zakłada; port `auth/send_magic_link.ts` +
  `verify_token.ts` + `admin/_middleware.ts` (guard po `session_token`). Alternatywa
  (Cloudflare Access) odrzucona na teraz — wymagałaby przebudowy frontu logowania.
- **Admin:** port 12 funkcji `admin/*.ts`; weryfikacja kontraktu vs `useAdminData.ts` /
  `useAdminActions.ts` na main.
- Tabele: `users`, `projects`, `milestones`, `messages`, `documents`, `auth_tokens`.

**Do rozstrzygnięcia przy starcie fazy:** czy `get_performance_stats` / `get_all_data`
mają realne źródło danych, czy to były zapytania do MySQL; format tokenów sesji; hashowanie.

---

### ⏳ Faza 3 — Silnik audytu `/audyt-360`  (poziom planu — pogłębić przy starcie)

**Największa niewiadoma.** `wrangler.toml` ma `Hyperdrive AUDIT_DB → legacy MySQL` — audyt
mógł zależeć od zewnętrznej bazy/serwera, który może być martwy (jak LH.pl).

**Wstępny zakres:**
- Port `audit/run_audit.ts` + `get_result.ts`; cache w KV (`CACHE`).
- Źródło danych PSI: PageSpeed Insights API (wymaga `PSI_API_KEY` Google; limity — cache
  w KV konieczny). Zweryfikować, czego używała wersja migracyjna (PSI? własny scraper?
  Hyperdrive?).
- PDF audytu: `jspdf` (już w zależnościach) — generacja klient- lub serwer-side.

**Do rozstrzygnięcia przy starcie fazy:** czy trzymamy Hyperdrive/MySQL, czy przenosimy
wyniki audytu do D1; koszt/limit PSI; czy audyt zapisuje leada (`source='audit'`).

---

### ⏳ Faza 4 — Portal klienta + czat + dokumenty  (poziom planu — pogłębić przy starcie)

**Najcięższa, najmniej pilna.**

**Wstępny zakres:**
- Port `portal/*.ts`; dokumenty w **R2** (`FILES`); kontrakt vs `usePortalData.ts` /
  `PortalDashboard.tsx`.
- **Czat:** `portal/chat.ts` + Durable Object `CHAT_ROOM`. ⚠️ To najgłębszy punkt lock-inu
  Cloudflare — decyzja przy starcie: DO vs polling na D1 vs zewnętrzny (Supabase realtime).
- Auth jak w Fazie 2.

**Do rozstrzygnięcia przy starcie fazy:** realne użycie portalu (czy klienci logują się
dziś? — sprawdzić analytics); DO vs alternatywa; upload/skan plików w R2.

---

## 7. Opcjonalna konsolidacja: Pages → Workers-with-assets

Nie jest warunkiem działania. Rozważyć **po** Fazie 2, gdy backend jest znaczący:
Cloudflare rekomenduje Workers-with-assets dla nowych full-stack projektów (jeden Worker =
front+backend, jeden deploy). Migracja: `wrangler pages` → `wrangler deploy` + `assets`
w `wrangler.toml`, funkcje `functions/**` → routing Workers. Zysk: spójność z kierunkiem
CF; koszt: przepisanie deployu w CI. Decyzja odłożona — nie blokuje leadów.

---

## 8. Ryzyka i decyzje otwarte (przekrojowe)

- **Staleness kontraktów** — funkcje z lutego 2026 vs front z maja 2026. Mitigacja: tabela
  kontraktów w Fazie 0, weryfikacja per-endpoint.
- **Rozjazd gałęzi** — 59 commitów main. Nie merge'ujemy całej gałęzi; cherry-pick plików.
- **Zasoby CF** — czy D1/KV/R2/DO realnie istnieją i czy `database_id` jest aktualny.
- **Hyperdrive/MySQL audytu** — może być martwy; wpływa na Fazę 3.
- **Sekrety** — `RESEND_API_KEY`, `TURNSTILE_SECRET`, `NOTIFY_EMAIL`, `PSI_API_KEY`,
  `JWT_SECRET` muszą być ustawione w CF Pages (nie w repo).
- **Lock-in** — Durable Objects (czat) to najtrudniejszy do opuszczenia element; reszta
  (D1 z czystym SQL, KV, R2) przenośna.

---

## 8a. WYNIK AUDYTU (Faza 0, 2026-07-10) — wszystkie 28 funkcji

Werdykt ogólny: **funkcje są czyste, D1-owe, a kontrakty req/resp pasują do dzisiejszego
frontu** (poza sufiksem `.php`). Migracja była dobrze zrobiona — dokańczamy, nie piszemy od zera.

### Zasoby CF — potwierdzone (MCP)
- D1 `mixture-db` (`8a11290b…`) istnieje, **0 tabel** (schemat nigdy nie wgrany).
- KV `CACHE` = `mixture-cache` (`538d11bc…`) ✅. R2 `mixture-files` ✅ (pusty).
- Osobna, nowsza warstwa `mm-*` (maj 2026, control-plane/panel/invoices) = prawdopodobnie hub
  binary-planet (abonament), nie nasz projekt — nie mieszać.

### Matryca kontraktów (front `main` ↔ funkcja `cloudflare-migration`)
| Funkcja | Metoda | Kontrakt vs front | D1/KV/R2/DO | Status |
|---|---|---|---|---|
| contact_submit | POST/GET | ⚠️ **captcha**: branch=reCAPTCHA, main=Turnstile | D1 (leads: INSERT/UPDATE/SELECT) | **reconcile** |
| calculator_submit | POST (FormData) | ✅ email/pdf/data | ⚠️ **brak zapisu D1** (regresja vs PHP) | **dodać INSERT** |
| auth/send_magic_link | POST {email} | ✅ AuthContext.login | D1 (users, auth_tokens) | ✅ |
| auth/verify_token | POST {token} | ✅ → {user, session_token} | D1 (auth_tokens, users) | ✅ |
| portal/_middleware | — | ✅ Bearer session_token | D1 (users) | ✅ |
| portal/dashboard | GET | ✅ {projects[].documents,.milestones} | D1 | ✅ |
| portal/get_messages | GET | ✅ {messages} | D1 + KV cache | ✅ |
| portal/send_message | POST {content,project_id?} | ✅ | D1 + KV + Resend | ✅ |
| portal/update_profile | POST {name,company_name} | ✅ | D1 | ✅ |
| portal/update_milestone | POST {id,status,feedback} | ✅ useProjectActions | D1 (ownership check) | ✅ |
| portal/download | GET ?id | ✅ blob | D1 + **R2 (pusty→404)** | ⚠️ pliki |
| portal/chat | WS (DO) | ⚠️ **front używa pollingu 5s, nie WS** | DO CHAT_ROOM + D1 | **DO nieużywane → można usunąć** |
| admin/_middleware | — | ✅ Bearer + role='admin' | D1 | ✅ |
| admin/get_leads | GET | ✅ {leads} | D1 | ✅ |
| admin/get_all_data | GET | ✅ {clients,projects[]} | D1 | ✅ |
| admin/get_all_messages | GET ?user_id | ✅ {conversations,messages} | D1 | ✅ |
| admin/get_performance_stats | GET | ⚠️ pyta tabelę **`performance_metrics` (BRAK w schemacie)** | D1 | **dodać tabelę** |
| admin/admin_reply_chat | POST {user_id,content} | ✅ | D1 + KV + Resend | ✅ |
| admin/convert_lead | POST {lead_id} | ✅ (lead→user, status='converted') | D1 + Resend | ✅ |
| admin/reply_lead | POST {lead_id,email,message} | ✅ | D1 + Resend | ✅ |
| admin/save_client | POST {id,...} | ✅ | D1 | ✅ |
| admin/save_project | POST | ✅ INSERT/UPDATE | D1 | ✅ |
| admin/save_milestone | POST | ✅ INSERT/UPDATE | D1 | ✅ |
| admin/upload_document | POST FormData | ✅ | R2 + D1 | ✅ |
| admin/delete_document | POST {id} | ✅ | R2 + D1 | ✅ |
| audit/run_audit | POST {url,placeId?,force?} | ✅ → {data} | KV cache 24h; **PSI+Places API** | ⚠️ potrzebny `GOOGLE_BACKEND_KEY`; **brak zapisu leada** |
| audit/get_result | GET ?auditId | ⚠️ **STUB — zwraca 501** (miał czytać Hyperdrive/MySQL) | (KV) | **niedokończone** |
| rum-collect | POST | (zastąpione Zaraz) | D1 performance_metrics | do porzucenia |

### Kluczowe ustalenia zmieniające plan
1. **contact_submit — konflikt captcha.** Branch (luty) używa reCAPTCHA (`recaptcha_token`),
   a `main` przeszedł na Turnstile (`captcha_token`, commit 90bb958). **Nie kopiujemy funkcji
   z brancha 1:1** — bierzemy z niej logikę D1 (INSERT/UPDATE/get_lead/abandoned) i wkładamy
   w istniejący, turnstile'owy `contact-submit.ts`.
2. **calculator — brak zapisu D1.** Wersja TS tylko maile; trzeba dodać `INSERT INTO leads
   (... source='calculator')` jak w PHP.
3. **Schemat — brak tabeli `performance_metrics`** (używa jej `get_performance_stats` +
   `rum-collect`). Dodać do migracji D1 (lub uznać metryki za martwe i pominąć panel perf).
4. **audit/get_result to stub (501)** — nigdy nieukończony, zależał od Hyperdrive→MySQL.
   `run_audit` jest kompletny i samowystarczalny (HTMLRewriter + PSI + Places). Decyzja Fazy 3:
   albo zapis wyniku audytu do D1/KV i realny `get_result`, albo usunięcie ścieżki „get by id".
5. **audit nie zapisuje leada** — jeśli audyt ma być lead-magnetem, dodać `INSERT INTO leads
   (source='audit')`.
6. **Czat: Durable Object nieużywany** — front odpytuje `get_messages` co 5s (polling), nie
   WebSocket. Można **pominąć DO `chat.ts`** w Fazie 4 → eliminuje główny punkt lock-inu.
7. **Sufiks `.php`** — cały front woła `/api/....php`; funkcje serwują bez sufiksu. Ujednolicić
   (usunąć `.php` we froncie, ~10 plików) — albo przejściowo dodać reguły w `_redirects`.
8. **R2 pusty** — pobieranie dokumentów zwróci 404 do czasu wgrania plików (historycznych
   raczej brak; upload działa od teraz).

### Sekrety CF Pages potrzebne docelowo
`TURNSTILE_SECRET`, `RESEND_API_KEY`, `NOTIFY_EMAIL` (Faza 1) · `GOOGLE_BACKEND_KEY` (Faza 3,
PSI+Places) · sesje portalu nie wymagają JWT_SECRET (token = UUID w D1).

---

## 9. Następny krok

Start **Fazy 0**: (1) weryfikacja zasobów CF (D1/KV/R2), (2) usunięcie `public/api/**`,
(3) audyt kontraktów gałęzi `cloudflare-migration`, (4) branch `feat/backend-revival`.
Dopiero po tym — szczegółowe planowanie i wykonanie Fazy 1.
