/**
 * Blok „Powiązane” (MIX-1268, plan SEO A11, KPI K5: linki wewnętrzne).
 *
 * Czysta funkcja wyboru: z puli dokumentów CMS (artykuły, realizacje, branże) wybiera 3–4
 * linki do strony bieżącej. Reguły:
 * - bez linku do siebie (ten sam rodzaj i ten sam slug) i bez duplikatów;
 * - dopasowanie = wspólny temat (tag, kategoria, podkategoria, technologia; po normalizacji).
 *   Branże nie mają tagów w CMS: ich tematy to słowa sluga plus wspólny temat huba branż,
 *   więc branże wiążą się ze sobą, a z innymi rodzajami przez słowa sluga (np. „e-commerce”);
 * - kolejność: najpierw ten sam rodzaj (najwyżej `limit - 1`), potem inne rodzaje, potem
 *   dopełnienie tym samym rodzajem; w grupie więcej wspólnych tematów wyżej, remis = slug
 *   w porządku cyklicznym od sluga bieżącego (deterministycznie i bez tych samych 4 linków
 *   na każdej stronie);
 * - slug spoza wzorca bezpiecznego adresu = pozycja odrzucona (fail-closed);
 * - brak dopasowań = pusta lista (komponent nic nie renderuje i nie rezerwuje miejsca).
 */

import { topicSet } from './relatedTopics';

export { normalizeTopic, industryTopics, INDUSTRY_HUB_TOPIC } from './relatedTopics';
export type RelatedType = 'article' | 'caseStudy' | 'industry';

export const RELATED_TYPES: readonly RelatedType[] = ['article', 'caseStudy', 'industry'];

/** Dokument w puli: rodzaj, publiczny slug, tytuł i surowe tematy z CMS. */
export interface RelatedPoolItem {
  _type: RelatedType;
  slug: string;
  title: string;
  topics: string[];
}

/** Wybrany link (tylko to trafia do zrzutu w HTML i do komponentu). */
export interface RelatedLink {
  _type: RelatedType;
  slug: string;
  title: string;
}

export const RELATED_LIMIT = 4;

/** Slug publiczny: małe litery, cyfry i myślniki; bez ukośników, kropek, schematów. */
export const SAFE_SLUG = /^[a-z0-9]+(?:-+[a-z0-9]+)*$/;
const MAX_SLUG = 200;
export const MAX_RELATED_TITLE = 300;

export const isRelatedType = (v: unknown): v is RelatedType =>
  typeof v === 'string' && (RELATED_TYPES as readonly string[]).includes(v);

export const isSafeSlug = (v: unknown): v is string =>
  typeof v === 'string' && v.length <= MAX_SLUG && SAFE_SLUG.test(v);

const BASE: Record<RelatedType, string> = {
  article: '/baza-wiedzy/',
  caseStudy: '/portfolio/',
  industry: '/branza/',
};

/** Adres strony z ukośnikiem na końcu (jak w sitemap i canonical). */
export const relatedHref = (link: Pick<RelatedLink, '_type' | 'slug'>): string =>
  `${BASE[link._type]}${link.slug}/`;

const isUsable = (item: RelatedPoolItem | null | undefined): item is RelatedPoolItem =>
  !!item &&
  isRelatedType(item._type) &&
  isSafeSlug(item.slug) &&
  typeof item.title === 'string' &&
  item.title.trim() !== '' &&
  item.title.length <= MAX_RELATED_TITLE &&
  Array.isArray(item.topics);

interface Scored {
  item: RelatedPoolItem;
  score: number;
  rank: number;
}

/**
 * Wybiera powiązane linki dla strony `current` z puli `pool`.
 * `current` nieobecny w puli (albo z niebezpiecznym slugiem) = pusta lista.
 */
export function pickRelated(
  current: { _type: RelatedType; slug: string },
  pool: ReadonlyArray<RelatedPoolItem | null | undefined>,
  limit: number = RELATED_LIMIT,
): RelatedLink[] {
  if (!isRelatedType(current?._type) || !isSafeSlug(current?.slug)) return [];
  const max = Math.max(0, Math.min(RELATED_LIMIT, Math.floor(limit)));
  if (max === 0) return [];

  const usable = (Array.isArray(pool) ? pool : []).filter(isUsable);
  const self = usable.find((i) => i._type === current._type && i.slug === current.slug);
  if (!self) return [];
  const selfTopics = topicSet(self);

  // Jedna pozycja na (rodzaj, slug): pierwsza wygrywa (pula jest już deduplikowana w serwisie).
  const seen = new Set<string>([`${self._type}|${self.slug}`]);
  const candidates: RelatedPoolItem[] = [];
  for (const item of usable) {
    const key = `${item._type}|${item.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push(item);
  }

  // Porządek cykliczny sluga: pozycje „po” bieżącym slugu najpierw, potem od początku.
  const cyclic = (slug: string) => (slug > current.slug ? 0 : 1);
  const scored: Scored[] = candidates
    .map((item) => {
      let score = 0;
      for (const t of topicSet(item)) if (selfTopics.has(t)) score += 1;
      return { item, score, rank: cyclic(item.slug) };
    })
    .filter((s) => s.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.rank - b.rank ||
        (a.item.slug < b.item.slug ? -1 : a.item.slug > b.item.slug ? 1 : 0) ||
        RELATED_TYPES.indexOf(a.item._type) - RELATED_TYPES.indexOf(b.item._type),
    );

  const same = scored.filter((s) => s.item._type === current._type);
  const cross = scored.filter((s) => s.item._type !== current._type);
  const picked: Scored[] = [...same.slice(0, max - 1), ...cross.slice(0, max)].slice(0, max);
  if (picked.length < max) {
    picked.push(...same.slice(max - 1, max - 1 + (max - picked.length)));
  }

  return picked.map(({ item }) => ({
    _type: item._type,
    slug: item.slug,
    title: item.title.trim(),
  }));
}
