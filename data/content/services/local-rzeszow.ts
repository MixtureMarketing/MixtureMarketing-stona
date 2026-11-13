/**
 * Sekcje lokalne „Rzeszów” (MIX-1286, plan SEO A35). Tekst do akceptacji Jakuba.
 * Fakty wyłącznie z repozytorium: public/llms.txt (obszar obsługi, spotkania, bezpłatna
 * konsultacja), config/site.ts (adres rejestrowy, telefon), tekst stron usług (Google Partner,
 * „od 2020”, konto zostaje klienta, dashboard 24/7). Źródła: docs/tresci/MIX-1286.md.
 * Liczb i klientów nie dopisujemy; nagłówek H2 nie jest H1 (strona ma własny H1 w hero).
 */

export interface LocalRzeszowContent {
  id: string;
  title: string;
  paragraphs: string[];
  bullets: string[];
  /** Strona lokalna o Rzeszowie, do której prowadzi drugi link sekcji. */
  localLink: { to: string; label: string };
  ctaLabel: string;
}

export const LOCAL_RZESZOW_GOOGLE_ADS: LocalRzeszowContent = {
  id: 'google-ads-rzeszow',
  title: 'Google Ads dla firm z Rzeszowa i Podkarpacia',
  paragraphs: [
    'Mixture Marketing ma siedzibę w Rzeszowie, a kampanie Google Ads prowadzimy dla firm z Podkarpacia od 2020 roku. Jesteśmy agencją Google Partner. Dla lokalnej firmy układamy reklamy tak, by trafiały do osób z Rzeszowa i okolic, które szukają usługi właśnie teraz: w wyszukiwarce, w Mapach Google i w remarketingu.',
    'Pracujemy bez zbędnych formalności. Konto reklamowe zostaje Twoje, a wyniki widzisz w dashboardzie dostępnym 24/7. Budżet mediowy trafia bezpośrednio do Google, osobno od naszego wynagrodzenia.',
  ],
  bullets: [
    'Bezpłatna konsultacja: online albo na spotkaniu u Ciebie w firmie, a gdy wolisz miejsce neutralne, w centrum Rzeszowa.',
    'Obsługujemy firmy z Rzeszowa, Mielca, Stalowej Woli, Krosna, Przemyśla, Dębicy i Jasła, a także z całej Polski zdalnie.',
  ],
  localLink: { to: '/miasto/rzeszow/', label: 'Agencja marketingowa w Rzeszowie' },
  ctaLabel: 'Umów rozmowę o Google Ads',
};

export const LOCAL_RZESZOW_ECOMMERCE: LocalRzeszowContent = {
  id: 'sklep-internetowy-rzeszow',
  title: 'Sklep internetowy w Rzeszowie i na Podkarpaciu',
  paragraphs: [
    'Budujemy sklepy internetowe dla firm z Rzeszowa i Podkarpacia od 2020 roku. Siedzibę mamy w Rzeszowie, więc o zakres sklepu, integracje i harmonogram możesz porozmawiać z nami osobiście, a nie tylko przez formularz.',
    'Sklep powstaje na otwartym oprogramowaniu: WooCommerce, PrestaShop, a przy nietypowej sprzedaży Medusa.js albo Sylius. Kod i dane należą do Ciebie, bez abonamentu za samo istnienie sklepu i bez prowizji od sprzedaży. Płatności, kurierów, Allegro i ERP podłączamy przez integracje (Allegro i ERP przez BaseLinker).',
  ],
  bullets: [
    'Bezpłatna konsultacja: online albo na spotkaniu u Ciebie w firmie, a gdy wolisz miejsce neutralne, w centrum Rzeszowa.',
    'Obsługujemy firmy z Rzeszowa, Mielca, Stalowej Woli, Krosna, Przemyśla, Dębicy i Jasła, a także z całej Polski zdalnie.',
  ],
  localLink: { to: '/web-development/rzeszow/', label: 'Tworzenie stron internetowych w Rzeszowie' },
  ctaLabel: 'Umów rozmowę o sklepie',
};
