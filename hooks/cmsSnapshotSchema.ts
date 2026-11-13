/**
 * Lista dozwolonych pól zrzutu list CMS (MIX-1613 r2). Każda lista ma allowlistę WSZYSTKICH pól,
 * które szablony i hooki faktycznie czytają (z typem). Pozycja z brakującym wymaganym polem,
 * polem złego typu albo niebędąca obiektem unieważnia CAŁY zrzut listy (fail-closed): hook
 * pobiera wtedy dane z CMS jak bez zrzutu. Pola spoza allowlisty są ignorowane (nikt ich nie czyta).
 *
 * Dokumenty pojedyncze (MIX-1620: artykuł, branża, lokalizacja, realizacja) mają tę samą
 * allowlistę pól z typem (SNAPSHOT_DOCUMENT_SCHEMAS). Różnica względem list: w dokumencie `null`
 * w polu opcjonalnym jest poprawny (GROQ zwraca `null` dla pustego pola, np. `downloads`,
 * `credits`, `businessContext`), odrzuca dopiero zły TYP; pole wymagane (czytane bez straży
 * w szablonie) musi być obecne i właściwego typu. Nieznany identyfikator = odmowa (fail-closed).
 */

import { isRelatedType, isSafeSlug, MAX_RELATED_TITLE } from '../utils/related';

/** Maks. liczba pozycji listy; więcej = zrzut odrzucony (ochrona przed rozdmuchanym wpisem). */
export const MAX_SNAPSHOT_LIST_ITEMS = 1000;
/** Maks. długość tablicy tekstów w pozycji (tagi, podkategorie). */
export const MAX_SNAPSHOT_STRING_ARRAY = 50;
/** Maks. liczba elementów kolekcji w dokumencie (bloki treści, galeria, materiały, zespół). */
export const MAX_SNAPSHOT_COLLECTION = 500;

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

const fieldOk = (item: Record<string, unknown>, name: string, rule: FieldRule): boolean => {
  const present = Object.prototype.hasOwnProperty.call(item, name) && item[name] !== undefined;
  if (!present) return !rule.required;
  return rule.check(item[name]);
};

/** Obiekt, w którym każde pole z allowlisty spełnia regułę (pola spoza allowlisty ignorowane). */
const shape =
  (schema: ListSchema): Check =>
  (v) =>
    isRecord(v) && Object.entries(schema).every(([n, r]) => fieldOk(v, n, r));
/** Tablica (≤ max) elementów spełniających `check`. */
const arrayOf =
  (check: Check, max = MAX_SNAPSHOT_COLLECTION): Check =>
  (v) =>
    Array.isArray(v) && v.length <= max && v.every(check);
/** `null` (puste pole w CMS) albo wartość spełniająca `check`; tylko dla dokumentów. */
const orNull =
  (check: Check): Check =>
  (v) =>
    v === null || check(v);
/** Pole opcjonalne dokumentu: brak, `null` albo poprawny typ. */
const optN = (check: Check): FieldRule => opt(orNull(check));

/** Lista tekstów z ewentualnymi pustymi elementami (`null`): punkty, wymagania, żargon branży. */
const textOrNullList: Check = arrayOf(textOrNull, MAX_SNAPSHOT_STRING_ARRAY);
/** Referencja do zasobu Sanity (`designAssets[].asset`, czytana przez `urlFor`). */
const imageRef: Check = (v) =>
  isRecord(v) && typeof v._ref === 'string' && SANITY_IMAGE_REF.test(v._ref);

/**
 * Portable Text czytany przez `PortableText`: tablica bloków-obiektów z tekstowym `_type`.
 * Blok `block` ma `children` (tablicę obiektów) i `markDefs` (tablica; `link` ma tekstowy `href`,
 * czytany przez `.startsWith`), blok `image` ma poprawny obraz, blok `code` tekstowy `code`.
 */
const portableBlock: Check = (b) => {
  if (!isRecord(b) || typeof b._type !== 'string') return false;
  if (b._type === 'block') {
    if (!arrayOf((c) => isRecord(c))(b.children)) return false;
    const defs = b.markDefs;
    if (defs !== undefined && defs !== null) {
      if (!arrayOf((d) => isRecord(d) && (d._type !== 'link' || typeof d.href === 'string'))(defs))
        return false;
    }
    return true;
  }
  if (b._type === 'image') return image(b);
  if (b._type === 'code') return b.code === undefined || textOrNull(b.code);
  return true;
};
const portableText: Check = arrayOf(portableBlock);

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
  // Blok „Powiązane” (MIX-1268): components/common/Powiazane.tsx. Rodzaj z listy i slug ze
  // wzorca bezpiecznego adresu (utils/related.ts), bo oba trafiają do href linku.
  related: {
    _type: req(isRelatedType), // adres i podpis rodzaju
    slug: req(isSafeSlug), // adres
    title: req((v) => text(v) && (v as string).length <= MAX_RELATED_TITLE), // tekst linku
  },
};

// Dokumenty pojedyncze (MIX-1620). Klucze = identyfikatory dokumentów z CMS_DOC. Wartość to
// allowlista pól danego dokumentu (jak listy wyżej), z jedną różnicą: pole opcjonalne (`optN`)
// przyjmuje też `null`, bo tak GROQ oddaje puste pole (zmierzone na prodzie: `downloads`,
// `credits`, `businessContext`, `compliance`, `clientLogo` bywają `null`).
const ARTICLE: ListSchema = {
  // ArticleTemplate.tsx (+ ArticleSchemaSeo, RelatedArticles, PortableTextRenderer).
  _id: req(text), // id w JSON-LD
  title: req(text), // tytuł, <h1>, okruszki
  slug: req(text), // okruszki i adres w JSON-LD (GROQ: "slug": slug.current, MIX-1386)
  publishedAt: req(text), // new Date(...).toLocaleDateString (null dałby 1970), JSON-LD
  body: req(portableText), // PortableText: bez tablicy blok się wywraca
  excerpt: optN(anyText), // `excerpt &&`, `excerpt ||`
  category: optN(shape({ title: optN(anyText) })), // `category?.title`
  readTime: optN(anyText), // `readTime &&`, parseReadTime
  tags: optN(textList), // `tags || []`, `.map`
};

const CASE_STUDY_PROJECT: ListSchema = {
  // CaseStudyTemplate.tsx + case-study/{Hero,Content,Sidebar,Gallery,Stats}.
  title: req(text), // <h1>, alt, caseStudyTitle, okruszki
  category: req(text), // web | marketing | design (porównania ===), plakietka, RelatedArticles
  subcategory: optN(textList), // `subcategory?.[0]`
  client: optN(anyText),
  clientLogo: optN(image), // urlFor(...)
  date: optN(anyText),
  excerpt: optN(anyText),
  mainImage: optN(image), // urlFor(...)
  challenge: optN(portableText),
  solution: optN(portableText),
  result: optN(portableText),
  websiteUrl: optN(anyText), // href
  techStack: optN(textList), // .map, key
  integrations: optN(textList),
  tools: optN(textList),
  platforms: optN(textList),
  typography: optN(anyText),
  kpi: optN(arrayOf(shape({ value: req(anyText), label: req(anyText) }))), // CaseStudyStats
  gallery: optN(arrayOf(image)), // urlFor(img)
  designAssets: optN(arrayOf(shape({ asset: req(imageRef), caption: optN(anyText) }))), // urlFor(asset)
  downloads: optN(
    arrayOf(shape({ asset: req(shape({ url: req(text) })), description: optN(anyText) })),
  ), // `file.asset.url`
  credits: optN(
    arrayOf(
      shape({
        _id: req(text), // key
        name: req(text), // alt, `name.charAt(0)`
        role: optN(anyText),
        image: optN(image),
      }),
    ),
  ),
};
const CASE_STUDY_NEXT: ListSchema = {
  // CaseStudyNavigation.tsx: link (slug niepusty), tytuł, tło.
  title: req(text),
  slug: req(text),
  mainImage: optN(image),
};

export const SNAPSHOT_DOCUMENT_SCHEMAS: Record<string, ListSchema> = {
  article: ARTICLE,
  // Zrzut realizacji to para `{ project, nextProject }` (cmsService.getCaseStudyPage).
  caseStudy: {
    project: req(shape(CASE_STUDY_PROJECT)),
    nextProject: optN(shape(CASE_STUDY_NEXT)),
  },
  // PseoTemplate.tsx + PseoIndustryContent.tsx (adres bierze z trasy, nie z `slug` dokumentu).
  industry: {
    name: req(text), // nagłówek, okruszek, SEO
    forWho: optN(anyText), // industryAudience: `(forWho || '').trim()`
    painPoints: optN(textOrNullList), // .map, industryDescription
    techRequirements: optN(textOrNullList),
    jargon: optN(textOrNullList),
    compliance: optN(anyText), // `compliance ||`
  },
  // PseoTemplate.tsx + PseoLocationContent.tsx.
  location: {
    city: req(text), // tytuł, treść (null wypisałby „null”)
    genitive: req(text),
    businessContext: optN(anyText), // akapit (null = pusty)
    seoTitle: optN(anyText), // `seoTitle ||`
    seoDescription: optN(anyText),
  },
};

/**
 * Czy wpis zrzutu ma kształt, jakiego oczekuje szablon. Lista = tablica (≤ 1000) obiektów,
 * z których każdy spełnia allowlistę pól; dokument = obiekt spełniający allowlistę swojego
 * rodzaju. Nieznany identyfikator albo wynik = odmowa (fail-closed).
 */
export function isValidSnapshotEntry(id: string, value: unknown): boolean {
  const own = (o: object) => Object.prototype.hasOwnProperty.call(o, id);
  if (!own(SNAPSHOT_LIST_SCHEMAS)) {
    return own(SNAPSHOT_DOCUMENT_SCHEMAS) ? shape(SNAPSHOT_DOCUMENT_SCHEMAS[id])(value) : false;
  }
  const schema = SNAPSHOT_LIST_SCHEMAS[id];
  if (!Array.isArray(value) || value.length > MAX_SNAPSHOT_LIST_ITEMS) return false;
  const entries = Object.entries(schema);
  return value.every((item) => isRecord(item) && entries.every(([n, r]) => fieldOk(item, n, r)));
}
