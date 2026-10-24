import React from 'react';
import { Settings } from 'lucide-react';
import ComparisonPage from './comparison/ComparisonPage';
import type { ComparisonConfig } from './comparison/types';

const VS_WIX = {
  seo: {
    title: 'Mixture vs Wix — porównanie strony w abonamencie dla firmy',
    description:
      'Strona w abonamencie: Mixture 179 zł/mc (managed) vs Wix 60-165 zł/mc (DIY). Porównanie 14 cech: Local SEO, GBP, czas ładowania, support PL, faktura VAT.',
    canonical: '/abonament/vs-wix/',
    breadcrumb: 'Mixture vs Wix',
  },
  hero: {
    badge: 'Porównanie · Mixture vs Wix',
    title: 'Mixture vs Wix',
    highlight: 'managed vs DIY',
    lead: (
      <>
        Wix jest popularny w PL — i to dobry produkt dla osób które chcą same robić stronę. Mixture
        to <strong className="text-dark">managed service</strong> — robimy stronę za Ciebie + Local
        SEO + Google Business Profile. Porównanie 14 cech poniżej.
      </>
    ),
  },
  plans: {
    mixtureNote: 'Robimy za Ciebie',
    competitor: {
      label: 'Wix (DIY)',
      labelColor: 'text-gray-500',
      price: '60–165 zł / mc',
      note: 'Sam robisz, Wix daje narzędzia',
    },
  },
  table: {
    scrollLabel: 'Tabela porównawcza: Mixture vs Wix',
    caption:
      'Porównanie 14 cech: Mixture (abonament managed, od 179 zł/mc) vs Wix (DIY, 60–165 zł/mc).',
    competitorHeader: 'Wix (DIY)',
    rows: [
      {
        label: 'Cena podstawowa',
        mixture: { status: 'mid', text: '179 zł / mc (managed)' },
        competitor: { status: 'mid', text: '60-165 zł / mc (DIY)' },
      },
      {
        label: 'Konfiguracja strony',
        mixture: { status: 'ok', text: 'My robimy za Ciebie' },
        competitor: { status: 'no', text: 'Sam ją robisz (10+ h)' },
      },
      {
        label: 'Lokalne SEO (Mapy Google + dzielnice)',
        mixture: { status: 'ok', text: 'W cenie, auto-podstrony' },
        competitor: { status: 'no', text: 'Brak (samemu schema)' },
      },
      {
        label: 'Google Business Profile (synced)',
        mixture: { status: 'ok', text: 'W cenie · auto sync godzin/postów' },
        competitor: { status: 'no', text: 'Brak (samemu manage)' },
      },
      {
        label: 'AI Blog (treści automatyczne)',
        mixture: { status: 'ok', text: 'Premium+ (Claude, klient akceptuje)' },
        competitor: { status: 'no', text: 'Brak' },
      },
      {
        // Bez wymyślonej liczby LCP konkurenta (reklama porównawcza bez pomiaru)
        label: 'Czas ładowania (LCP)',
        mixture: { status: 'ok', text: '<1s (Cloudflare edge)' },
        competitor: { status: 'mid', text: 'Zależny od szablonu i aplikacji' },
      },
      {
        label: 'Hosting + SSL',
        mixture: { status: 'ok', text: 'W cenie (Cloudflare Workers)' },
        competitor: { status: 'ok', text: 'W cenie (Wix infra)' },
      },
      {
        label: 'Edycja treści przez klienta',
        mixture: { status: 'ok', text: 'CMS Sveltia (proste)' },
        competitor: { status: 'ok', text: 'Wix Editor (drag&drop)' },
      },
      {
        // 16 branż potwierdzone przez właściciela (FAQ i strona główna abonamentu)
        label: 'Galeria szablonów',
        mixture: { status: 'mid', text: '16 branż (4 dema online), każda kustomizowana' },
        competitor: { status: 'ok', text: '900+ szablonów' },
      },
      {
        label: 'Aplikacja mobilna do edycji',
        mixture: { status: 'no', text: 'Tylko web panel' },
        competitor: { status: 'ok', text: 'iOS + Android app' },
      },
      {
        label: 'E-commerce (sklep)',
        mixture: { status: 'no', text: 'Nie oferujemy — tylko strony usługowe' },
        competitor: { status: 'ok', text: 'Wix Stores (sklep online)' },
      },
      {
        label: 'Polski support',
        mixture: { status: 'ok', text: 'Email + telefon (PL, Pn-Pt 9-17)' },
        competitor: { status: 'mid', text: 'Chat EN, polski forum' },
      },
      {
        label: 'Lokalna spółka PL',
        mixture: { status: 'ok', text: 'Sp. z o.o. PL (KRS 0001034514)' },
        competitor: { status: 'no', text: 'Wix.com Ltd (Izrael, IE billing)' },
      },
      {
        label: 'Faktura VAT PL',
        mixture: { status: 'ok', text: 'Tak (Fakturownia.pl)' },
        competitor: { status: 'mid', text: 'Tak, ale wystawiana z IE' },
      },
    ],
  },
  decisions: {
    heading: 'Kiedy Wix, kiedy Mixture?',
    competitor: {
      heading: 'Wybierz Wix jeśli…',
      icon: Settings,
      iconTone: 'bg-blue-100 text-blue-700',
      checkColor: 'text-blue-600',
      items: [
        'Lubisz sam projektować stronę (drag&drop)',
        'Masz 10+ h tygodniowo na samodzielne ulepszenia',
        'Chcesz sklep online (Mixture nie oferuje e-commerce)',
        'Wystarczy Ci podstawowe SEO (bez Local + GBP managed)',
        'Cena podstawowa 60 zł/mc to jedyny budżet',
      ],
    },
    mixtureItems: [
      'Chcesz aby ktoś zrobił stronę za Ciebie (managed)',
      'Potrzebujesz lokalnych leadów z Google Maps',
      'Cenisz polski support (PL telefon + email)',
      'Wolisz polską spółkę i fakturę VAT z PL',
      'Cloudflare edge (LCP <1s) ma dla Ciebie znaczenie',
    ],
  },
  /**
   * FAQ widoczne na stronie i w JSON-LD z jednej tablicy (wcześniej tylko w schemie —
   * naruszenie wytycznych Google). Usunięte pytanie „Dlaczego Mixture jest 3× droższy"
   * (zmyślona wycena czasu klienta „500-1000 zł/mc") i niepotwierdzone „~5 dni roboczych".
   */
  faq: {
    items: [
      {
        q: 'Czy Mixture jest lepszy od Wix?',
        a: 'Wix jest lepszy dla DIY (sam robisz, 60-165 zł/mc, dużo szablonów, app mobilna). Mixture jest lepszy dla managed (my robimy za Ciebie, Local SEO + GBP w cenie, polski support, Cloudflare edge). Wybór zależy od tego, czy chcesz prowadzić firmę czy stronę.',
      },
      {
        q: 'Czy mogę przenieść stronę z Wix na Mixture?',
        a: 'Tak. Migracja jest częścią procesu setup w cenie pakietu. Przenosimy treści, zdjęcia, przekierowujemy domenę.',
      },
    ],
    className: 'bg-gray-50/60',
  },
  cta: {
    heading: 'Zdecydowany na Mixture?',
    text: 'Mamy 4 pakiety od 179 zł/mc. Konsultacja przed kupnem bezpłatna.',
    link: { to: '/abonament/#pricing', label: 'Zobacz pakiety' },
  },
} satisfies ComparisonConfig;

const VsWix: React.FC = () => <ComparisonPage config={VS_WIX} />;

export default VsWix;
