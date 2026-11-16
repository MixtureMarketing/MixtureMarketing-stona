/**
 * Tematy bloku „Powiązane” (MIX-1268): normalizacja tagów, kategorii i technologii z CMS
 * do postaci porównywalnej oraz tematy branży (branże nie mają tagów w CMS).
 */

import type { RelatedPoolItem } from './related';

/** Synonimy po normalizacji (różne zapisy tej samej rzeczy w tagach, techStack, podkategoriach). */
const ALIASES: Record<string, string> = {
  reactjs: 'react',
  golang: 'go',
  vuejs: 'vue',
  uxui: 'ux',
  uiux: 'ux',
  sklep: 'ecommerce',
  sklepy: 'ecommerce',
};

/** Temat porównywalny: małe litery, bez znaków spoza liter i cyfr, z synonimem. */
export const normalizeTopic = (raw: unknown): string => {
  if (typeof raw !== 'string') return '';
  const key = raw
    .toLowerCase()
    .replace(/ł/g, 'l') // jedyna polska litera bez rozkładu NFKD
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '');
  return ALIASES[key] ?? key;
};

/** Wspólny temat huba branż (branże nie mają tagów w CMS). */
export const INDUSTRY_HUB_TOPIC = '#branza';
const MIN_SLUG_WORD = 3;

/** Tematy branży: cały slug, jego słowa (≥ 3 znaki) i temat huba. */
export const industryTopics = (slug: string): string[] => [
  INDUSTRY_HUB_TOPIC,
  normalizeTopic(slug),
  ...slug.split('-').filter((w) => w.length >= MIN_SLUG_WORD),
];

export const topicSet = (item: RelatedPoolItem): Set<string> => {
  const raw =
    item._type === 'industry' ? [...item.topics, ...industryTopics(item.slug)] : item.topics;
  const out = new Set<string>();
  for (const t of raw) {
    const n = t === INDUSTRY_HUB_TOPIC ? t : normalizeTopic(t);
    if (n) out.add(n);
  }
  return out;
};
