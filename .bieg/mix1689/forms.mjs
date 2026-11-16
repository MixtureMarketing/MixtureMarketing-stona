// MIX-1689: separator allowlist forms (shared by probe.mjs; same data as the MIX-1689 block in
// tests/seo/llmsTxt.test.ts). [id, code point, attack line, twin line]; AB/AI = hidden pages.
export const AB = '- Strona ', AI = '- Nowość: ';
export const FORMS = [
  ['S01 inverted exclamation U+00A1', '¡', `${AB}abonament/dz¡ekujemy`, `${AB}abonament ¡ cennik`],
  ['S02 devanagari danda U+0964', '।', `${AI}systemy-ai-ap।ikacje`, `${AI}systemy । aplikacje`],
  ['S03 hebrew paseq U+05C0', '׀', `${AI}systemy-ai-ap׀ikacje`, `${AI}strony ׀ aplikacje`],
  ['S04 middle dot U+00B7', '·', `${AB}abonament/dz·ekujemy`, `${AB}strony · aplikacje · abonament`],
  ['S05 hyphenation point U+2027', '‧', `${AI}systemy-ai-apl‧kacje`, `${AI}strony ‧ aplikacje`],
  ['S06 hyphen U+2010', '‐', `${AB}abonament/dz‐ekujemy`, `${AB}strony‐aplikacje`],
  ['S07 fullwidth full stop U+FF0E', '．', `${AB}abonament/dz．ekujemy`, `${AB}abonament． Cennik`],
  ['S08 ideographic full stop U+3002', '。', `${AB}abonament/dz。ekujemy`, `${AB}abonament。 Cennik`],
  ['S09 modifier triangular colon U+02D0', 'ː', `${AB}abonament/dzːekujemy`, `${AB}abonament ː cennik`],
  ['S10 divides U+2223', '∣', `${AI}systemy-ai-ap∣ikacje`, `${AI}strony ∣ aplikacje`],
  ['S11 katakana middle dot U+30FB', '・', `${AB}abonament/dz・ekujemy`, `${AB}strony ・ aplikacje`],
  ['S12 armenian full stop U+0589', '։', `${AI}systemy-ai-ap։ikacje`, `${AI}strony։ aplikacje`],
  ['S13 ogham space mark U+1680', ' ', `${AB}abonament/dz ekujemy`, `${AB}abonament i cennik`],
  ['S14 greek ano teleia U+0387', '·', `${AB}abonament/dz·ekujemy`, '- Ελληνικά· ιστοσελίδες'],
  ['S15 word separator middle dot U+2E31', '⸱', `${AI}systemy-ai-ap⸱ikacje`, `${AI}strony ⸱ aplikacje`],
];
// Prose with the listed non-ASCII separators (— – „ ” “ ’ « ») and … (NFKC: ...); must pass.
export const PROSE = [
  '- Po polsku: „Strony, które działają” — szybkie, dostępne – i bez reklam…',
  '- Українською: «Сайти, що працюють» — швидкі, доступні – м’які…',
  '- По-русски: «Сайты, которые работают» — „быстрые“ и доступные…',
  '- Ελληνικά: «Ιστοσελίδες που λειτουργούν» — γρήγορες· προσβάσιμες;',
  '- Auf Deutsch: „Webseiten, die funktionieren“ – schnell, barrierefrei…',
  '- In English: it’s “fast” — and accessible…',
];
