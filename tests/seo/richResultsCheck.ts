// Walidator JSON-LD odwzorowujący reguły Google dla typu Product (MIX-1261, audyt MIX-897 P7).
// Dwa raporty Search Console: „Opisy produktów” (product snippets) i „Informacje o sprzedawcy”
// (merchant listings). Lista pól = to, co GSC zgłosił dla /abonament/professional/ 3.11.2026,
// plus wymagane pola z dokumentacji Google (name, offers.price, offers.priceCurrency).

export type Issue = { report: 'snippet' | 'merchant' | 'website'; level: 'ERROR' | 'WARNING'; field: string };
type Node = Record<string, unknown>;

const types = (n: Node): string[] => {
  const t = n['@type'];
  return Array.isArray(t) ? t.map(String) : t ? [String(t)] : [];
};

const firstOffer = (n: Node): Node | undefined => {
  const o = n.offers;
  if (Array.isArray(o)) return o[0] as Node | undefined;
  return o && typeof o === 'object' ? (o as Node) : undefined;
};

const has = (n: Node | undefined, key: string): boolean => {
  const v = n?.[key];
  if (v === undefined || v === null || v === '') return false;
  return !(Array.isArray(v) && v.length === 0);
};

export function productIssues(n: Node): Issue[] {
  if (!types(n).includes('Product')) return [];
  const out: Issue[] = [];
  const offer = firstOffer(n);
  // Opisy produktów: name + jedno z offers/review/aggregateRating; reszta to ostrzeżenia.
  if (!has(n, 'name')) out.push({ report: 'snippet', level: 'ERROR', field: 'name' });
  if (!offer && !has(n, 'review') && !has(n, 'aggregateRating'))
    out.push({ report: 'snippet', level: 'ERROR', field: 'offers|review|aggregateRating' });
  if (!has(n, 'aggregateRating')) out.push({ report: 'snippet', level: 'WARNING', field: 'aggregateRating' });
  if (!has(n, 'review')) out.push({ report: 'snippet', level: 'WARNING', field: 'review' });
  if (offer && !has(offer, 'availability')) out.push({ report: 'snippet', level: 'WARNING', field: 'availability' });
  // Informacje o sprzedawcy: name, image, offers.price, offers.priceCurrency wymagane.
  if (!has(n, 'name')) out.push({ report: 'merchant', level: 'ERROR', field: 'name' });
  if (!has(n, 'image')) out.push({ report: 'merchant', level: 'ERROR', field: 'image' });
  if (!offer) out.push({ report: 'merchant', level: 'ERROR', field: 'offers' });
  if (offer && !has(offer, 'price')) out.push({ report: 'merchant', level: 'ERROR', field: 'offers.price' });
  if (offer && !has(offer, 'priceCurrency'))
    out.push({ report: 'merchant', level: 'ERROR', field: 'offers.priceCurrency' });
  const audience = n.audience as Node | undefined;
  if (audience && !types(audience).includes('PeopleAudience'))
    out.push({ report: 'merchant', level: 'WARNING', field: 'audience@type' });
  if (!['brand', 'gtin', 'gtin8', 'gtin12', 'gtin13', 'gtin14', 'mpn'].some((k) => has(n, k)))
    out.push({ report: 'merchant', level: 'WARNING', field: 'brand|gtin' });
  if (!has(offer, 'hasMerchantReturnPolicy') && !has(n, 'hasMerchantReturnPolicy'))
    out.push({ report: 'merchant', level: 'WARNING', field: 'hasMerchantReturnPolicy' });
  if (offer && !has(offer, 'shippingDetails'))
    out.push({ report: 'merchant', level: 'WARNING', field: 'shippingDetails' });
  if (offer && !has(offer, 'availability')) out.push({ report: 'merchant', level: 'WARNING', field: 'availability' });
  return out;
}

// SearchAction (sitelinks searchbox) Google wycofał w XI 2024; tu szukamy go w całym drzewie.
export function searchActionCount(value: unknown): number {
  if (Array.isArray(value)) return value.reduce((s: number, v) => s + searchActionCount(v), 0);
  if (!value || typeof value !== 'object') return 0;
  const n = value as Node;
  const self = types(n).includes('SearchAction') ? 1 : 0;
  return self + Object.values(n).reduce((s: number, v) => s + searchActionCount(v), 0);
}

export const issueKey = (i: Issue) => `${i.report}:${i.level}:${i.field}`;
