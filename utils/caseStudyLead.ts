// MIX-1855: lead z przycisku „Chcesz podobny projekt?” w realizacji (CaseStudyTemplate).
// Nazwa realizacji idzie do leada (temat zadania w Linearze), a do GA4 tylko stała nazwa
// źródła i typ strony: bez nazwy klienta, bez danych osobowych (utils/ga4Allowlist.ts).
import { trackEvent } from './analytics';

/** Stała nazwa źródła: `form_id` zdarzenia generate_lead oraz `leadSource` w danych modala. */
export const CASE_STUDY_SIMILAR = 'case_study_similar';
/** Najdłuższa nazwa realizacji wysyłana w leadzie (serwer ucina temat do 40 znaków). */
export const SIMILAR_PROJECT_MAX = 100;

/** Dane modala dla przycisku w realizacji (jedno miejsce budowania; testy sprawdzają kształt). */
export const caseStudyModalData = (title: string): Record<string, unknown> => ({
  specificType: CASE_STUDY_SIMILAR,
  leadSource: CASE_STUDY_SIMILAR,
  similarProject: title,
});

/** Czytelna nazwa realizacji z danych modala (tekst, spacje ściśnięte, ≤ 100 zn.) albo undefined. */
export const similarProjectOf = (data: Record<string, unknown> | null | undefined) => {
  const raw = data?.similarProject;
  if (typeof raw !== 'string') return undefined;
  const name = raw.replace(/\s+/g, ' ').trim().slice(0, SIMILAR_PROJECT_MAX);
  return name === '' ? undefined : name;
};

/** Czy formularz pochodzi z przycisku w realizacji (jedyne źródło zdarzenia generate_lead). */
export const isCaseStudyLead = (data: Record<string, unknown> | null | undefined): boolean =>
  data?.leadSource === CASE_STUDY_SIMILAR;

/** GA4 generate_lead (słownik P4) po sukcesie formularza z przycisku w realizacji: same stałe. */
export const trackCaseStudyLead = (): void =>
  trackEvent('generate_lead', { form_id: CASE_STUDY_SIMILAR, page_type: 'case_study' });
