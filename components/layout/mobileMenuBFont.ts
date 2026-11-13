import latin400 from '@fontsource/manrope/files/manrope-latin-400-normal.woff2?url';
import latinExt400 from '@fontsource/manrope/files/manrope-latin-ext-400-normal.woff2?url';
import latin700 from '@fontsource/manrope/files/manrope-latin-700-normal.woff2?url';
import latinExt700 from '@fontsource/manrope/files/manrope-latin-ext-700-normal.woff2?url';

// MIX-1465: makieta B pisze menu Manrope 700 i 400. Strona ładuje tylko 400 i 800, a globalna
// rodzina „Manrope” z wagą 700 zmieniłaby pogrubienia na całej stronie. Dlatego menu ma własną
// rodzinę „Manrope MMB” (tylko w .mmb), ładowaną po załadowaniu strony, w wolnej chwili;
// do tego czasu menu pisze zwykłym Manrope. Pliki 400 to te same co strony (ten sam adres).

export const MMB_FONT_FAMILY = 'Manrope MMB';
const LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT =
  'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

let started = false;

/** Rejestruje rodzinę menu raz na stronę; bez FontFace (stare przeglądarki, jsdom) nic nie robi. */
export function loadMobileMenuBFont(): void {
  if (started || typeof FontFace === 'undefined' || !document.fonts?.add) return;
  started = true;
  const faces: [string, string, string][] = [
    [latin400, '400', LATIN],
    [latinExt400, '400', LATIN_EXT],
    [latin700, '700', LATIN],
    [latinExt700, '700', LATIN_EXT],
  ];
  for (const [url, weight, unicodeRange] of faces) {
    const face = new FontFace(MMB_FONT_FAMILY, `url(${url}) format('woff2')`, {
      weight,
      unicodeRange,
      display: 'swap',
    });
    document.fonts.add(face);
    face.load().catch(() => {});
  }
}
