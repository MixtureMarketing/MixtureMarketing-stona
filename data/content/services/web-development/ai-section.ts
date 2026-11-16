/**
 * Teksty MIX-1276 (plan SEO A20): sekcja „AI i systemy” na stronie głównej i zdanie z linkiem na
 * /web-development/custom-app/. Całość za przełącznikiem VITE_MM_AI_SECTION (domyślnie wyłączona).
 * TEKSTY DO AKCEPTACJI JAKUBA (docs/tresci/MIX-1276.md). Bez nazw klientów i bez liczb:
 * opisy pochodzą z oferty na stronie usługi (ai-systems.ts, MIX-1272).
 */
import { AI_SYSTEMS_PATH } from './ai-systems';

export const AI_SECTION_PATH = AI_SYSTEMS_PATH;

export const AI_SECTION_CONTENT = {
  title: 'Aplikacje i systemy z elementami AI',
  intro:
    'Budujemy dedykowane aplikacje, w których sztuczna inteligencja skraca ręczną pracę: podpowiada pracownikom, porządkuje zgłoszenia i odpowiada na pytania. Resztę systemu robimy tak solidnie jak każdą aplikację, a kod i prawa autorskie zostają u Ciebie.',
  bullets: [
    {
      title: 'Asystent w codziennej pracy',
      desc: 'Podpowiedzi i rekomendacje dla zespołu w miejscu, w którym on pracuje.',
    },
    {
      title: 'Obieg zgłoszeń i zmian',
      desc: 'Historia każdej sprawy i powiadomienia zamiast arkuszy i komunikatorów.',
    },
    {
      title: 'Platforma dla klientów lub uczestników',
      desc: 'Kursy, dokumenty i panel administratora w jednym miejscu.',
    },
  ],
  cta: 'Zobacz ofertę: systemy AI i aplikacje',
} as const;

export const AI_CONTEXT_LINK = {
  text: 'Potrzebujesz w aplikacji asystenta AI albo automatycznego porządkowania zgłoszeń? Zobacz, jak dodajemy elementy AI do systemów dedykowanych:',
  label: 'Systemy AI i aplikacje',
} as const;
