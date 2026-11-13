/**
 * Lista dozwolonych pól zrzutu list CMS (MIX-1613 r2). Każda lista ma allowlistę WSZYSTKICH pól,
 * które szablony i hooki faktycznie czytają (z typem). Pozycja z brakującym wymaganym polem,
 * polem złego typu albo niebędąca obiektem unieważnia CAŁY zrzut listy (fail-closed): hook
 * pobiera wtedy dane z CMS jak bez zrzutu. Pola spoza allowlisty są ignorowane (nikt ich nie czyta).
 * Dokumenty pojedyncze (artykuł, branża, lokalizacja, realizacja) sprawdza tylko `isRecord`.
 */

/** Maks. liczba pozycji listy; więcej = zrzut odrzucony (ochrona przed rozdmuchanym wpisem). */
export const MAX_SNAPSHOT_LIST_ITEMS = 1000;
/** Maks. długość tablicy tekstów w pozycji (tagi, podkategorie). */
export const MAX_SNAPSHOT_STRING_ARRAY = 50;

type Check = (v: unknown) => boolean;
interface FieldRule {
  required: boolean;
  check: Check;
}

export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Tekst niepusty. */
const text: Check = (v) => typeof v === 'string' && v.length > 0;
/** Tekst, także pusty (opis bez treści jest poprawny, ale musi być tekstem). */
const anyText: Check = (v) => typeof v === 'string';
/** Lista tekstów (każdy element tekstem). */
const textList: Check = (v) =>
  Array.isArray(v) &&
  v.length <= MAX_SNAPSHOT_STRING_ARRAY &&
  v.every((x) => typeof x === 'string');
/** Tekst albo `null` (brak wartości w CMS). */
const textOrNull: Check = (v) => v === null || typeof v === 'string';
/** Obraz Sanity czytany przez `urlFor`: `asset._ref` w formacie `image-<id>-<w>x<h>-<ext>`. */
const SANITY_IMAGE_REF = /^image-[A-Za-z0-9]+-\d+x\d+-[a-z0-9]+$/;
const image: Check = (v) =>
  isRecord(v) &&
  isRecord(v.asset) &&
  typeof v.asset._ref === 'string' &&
  SANITY_IMAGE_REF.test(v.asset._ref);

const req = (check: Check): FieldRule => ({ required: true, check });
const opt = (check: Check): FieldRule => ({ required: false, check });

type ListSchema = Record<string, FieldRule>;

/** Klucze = identyfikatory list z CMS_DOC (hooks/useCmsDocument.ts). */
export const SNAPSHOT_LIST_SCHEMAS: Record<string, ListSchema> = {
  // /baza-wiedzy/: KnowledgeBase.tsx + useKnowledgeSearch.ts czytają te pola Article.
  articleList: {
    id: req(text), // key
    title: req(text), // tytuł, aria-label, wyszukiwarka (.toLowerCase)
    description: req(anyText), // opis, wyszukiwarka (.toLowerCase)
    category: req(text), // filtr kategorii
    categoryLabel: req(text), // plakietka
    image: req(text), // src
    date: req(text), // formatDate
    readTime: req(text), // plakietka
    slug: req(text), // link
    tags: req(textList), // tags.slice(0, 2).map
  },
  // /portfolio/: PortfolioPage.tsx + PortfolioGrid.tsx.
  caseStudyList: {
    _id: req(text), // key
    title: req(text), // tytuł, alt
    slug: req(text), // link
    category: req(text), // filtr i plakietka
    subcategory: opt(textList), // .slice(0, 3).map, .length
    client: opt(anyText), // podpis (zapytanie go nie pobiera; jeśli jest, to tekst)
    excerpt: opt(anyText), // opis
    mainImage: opt(image), // urlFor(...).url()
  },
  // /branza/: IndustryHub.tsx.
  industryList: {
    name: req(text), // nagłówek, JSON-LD
    slug: req(text), // key, link, JSON-LD
    forWho: opt(textOrNull), // audienceLine(...).trim()
  },
};

const fieldOk = (item: Record<string, unknown>, name: string, rule: FieldRule): boolean => {
  const present = Object.prototype.hasOwnProperty.call(item, name) && item[name] !== undefined;
  if (!present) return !rule.required;
  return rule.check(item[name]);
};

/**
 * Czy wpis zrzutu ma kształt, jakiego oczekuje szablon. Lista = tablica (≤ 1000) obiektów,
 * z których każdy spełnia allowlistę pól; dokument = obiekt. Nieznany wynik = odmowa.
 */
export function isValidSnapshotEntry(id: string, value: unknown): boolean {
  const schema = SNAPSHOT_LIST_SCHEMAS[id];
  if (!schema) return isRecord(value);
  if (!Array.isArray(value) || value.length > MAX_SNAPSHOT_LIST_ITEMS) return false;
  const entries = Object.entries(schema);
  return value.every((item) => isRecord(item) && entries.every(([n, r]) => fieldOk(item, n, r)));
}
