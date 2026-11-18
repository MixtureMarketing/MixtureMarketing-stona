# Filmy realizacji w portfolio (MIX-1873, MIX-1896)

Film realizacji gra w dwóch miejscach: na liście `/portfolio/` (kafelek, po najechaniu myszą) i na stronie
realizacji (w miejscu zdjęcia hero, sam startuje po wczytaniu strony). Filmy są tylko poziome (16:9).
Filmów pionowych i ramki telefonu nie ma (usunięte w MIX-1896). Realizacja bez filmu wygląda jak dotąd:
samo zdjęcie. Całość działa przy `VITE_MM_PORTFOLIO_VIDEO=1`; od MIX-1896 jest włączony wszędzie
(produkcja, Preview, PR, `.github/workflows/ci.yml`).

## Pliki

Wszystko w `public/portfolio/video/`. `<base>` to krótka nazwa filmu: może być slugiem realizacji albo
krótsza od niego (np. `try-dive` dla realizacji `try-dive-szkola-nurkowania`).

| plik                                   | wymiary  | do czego           | limit          |
| -------------------------------------- | -------- | ------------------ | -------------- |
| `<base>-960.mp4` i `<base>-960.webm`   | 960×540  | kafelek listy      | ≤ 500 kB każdy |
| `<base>-1280.mp4` i `<base>-1280.webm` | 1280×720 | hero na komputerze | ≤ 1,5 MB każdy |
| `<base>-720.mp4` i `<base>-720.webm`   | 720×406  | hero na telefonie  | ≤ 0,5 MB każdy |

Limity są z MIX-1873. Film: 8–12 s, bez dźwięku, MP4 (H.264) i WebM (VP9), pętla (początek i koniec
podobne), 25 kl/s. Wysokość 406, nie 405, bo kodek wymaga parzystej wysokości.

## Krok po kroku

1. Film źródłowy (poziomy, np. 1920×1080) zapisz poza repo.
2. Kompresja skryptem z repo, poza serwerem (stacja albo chmura):

   ```bash
   npm i --no-save ffmpeg-static@5
   SRC=/sciezka/film.mp4 START=2 SECONDS=10 NAME=<base> node scripts/record-portfolio-video.mjs
   ```

   `START` = sekunda początku fragmentu, `SECONDS` = długość (8–12), `NAME` = `<base>` z tabeli.
   Skrypt robi sześć plików z tabeli, bez sieci i bez przeglądarki. Gdy plik nie mieści się w limicie,
   podnosi CRF; gdy mimo to limit jest przekroczony, kończy kodem 1 z napisem `PRZEKROCZONY`
   (wtedy skróć fragment). Bez `SRC` skrypt nagrywa przewijanie publicznej strony realizacji
   (adres tylko z sitemap.xml, ≤ 1 żądanie/s).

3. W `data/portfolioVideos.ts` dopisz jedną linię w `PORTFOLIO_VIDEOS`:

   ```ts
   '<slug-realizacji>': landscape('<base>'),
   ```

   `landscape('<base>')` daje komplet trzech wariantów z tabeli. Klucz to slug realizacji z Sanity
   (adres `/portfolio/<slug-realizacji>/`).

4. Testy uruchom przez bieg na stacji (nigdy na serwerze). `tests/data/portfolioVideos.test.ts`
   sprawdzi, że:
   - każdy wpis to dokładnie `landscape('<base>')` (trzy warianty, bez `portrait`);
   - wszystkie sześć plików istnieje i mieści się w limitach;
   - MP4 to H.264, WebM to VP9, żaden nie ma ścieżki dźwięku;
   - wymiary w plikach (metadane) zgadzają się z mapą;
   - w `public/portfolio/video/` nie ma plików spoza mapy ani plików pionowych (`*-540.*`).

## Zasady wydajności (MIX-1873)

- Przed zdarzeniem `load` strony nie idzie żaden bajt filmu (`preload="none"`, bez `src`); potem
  bezczynność przeglądarki i dopiero, gdy kafelek albo hero jest w polu widzenia.
- Element LCP to zdjęcie (hero albo kafelek); film leży nad nim i pojawia się dopiero, gdy gra.
- `prefers-reduced-motion`: bez filmu, samo zdjęcie. `Save-Data` i wolne łącze (2g/3g): bez
  doczytywania w tle; hero zostaje zdjęciem, kafelek wczytuje film dopiero po najechaniu.
- Dotyk (telefon, tablet): na liście bez filmu.
- Błąd pliku: film znika, zdjęcie zostaje, bez komunikatu.
- Ramka ma proporcje 16:9 z mapy, więc nic się nie przesuwa (CLS 0).

## Karta z filmem na liście (MIX-1896)

Karta, która gra film, nie ma granatowej nakładki najechania („Zobacz case study”) ani powiększenia
zdjęcia: nakładka zasłaniała film. Karta dalej jest linkiem (tytuł), a fokus z klawiatury pokazuje
niebieski pierścień na całej karcie. Karty bez filmu (i wszystkie przy wyłączonym przełączniku) mają
nakładkę jak dotąd. Warunek „karta gra film” jest w jednym miejscu:
`components/features/portfolio/cardVideo.ts` (przełącznik + zdjęcie realizacji + wpis w mapie).
