import React from 'react';
import { useParams } from 'react-router-dom';
import { cmsService, SanityIndustry, SanityLocation } from '../../../services/cmsService';
import Seo from '../../common/Seo';
import NotFound from '../../common/NotFound';
import AmbientBackground from '../../common/AmbientBackground';
import { useCmsDocument } from '../../../hooks/useCmsDocument';
import { useBreadcrumbLabel } from '../../../context/BreadcrumbLabelContext';
import CmsErrorState from '../../common/CmsErrorState';
import PseoIndustryContent from './PseoIndustryContent';
import PseoLocationContent from './PseoLocationContent';
import { RZESZOW_FAQ_SCHEMA } from './rzeszowFaq';
import { industryAudience } from '../../../utils/seo/title';
import { industryDescription } from '../../../utils/seo/description';

interface PseoTemplateProps {
  mode: 'industry' | 'location';
}

const fetcherFor = (mode: PseoTemplateProps['mode']) =>
  mode === 'industry' ? cmsService.getIndustryBySlug : cmsService.getLocationBySlug;

const PseoTemplate: React.FC<PseoTemplateProps> = ({ mode }) => {
  const { slug } = useParams<{ slug: string }>();

  const fetcher = fetcherFor(mode);

  // notfound (brak dokumentu) → NotFound/noindex; error (Sanity niedostępne) → CmsErrorState.
  const { status, data, retry } = useCmsDocument<SanityIndustry | SanityLocation>(slug, fetcher);
  // Okruszek branży: nazwa z CMS zamiast sluga („usugi b2b”). Miasto ma etykietę w mapie.
  useBreadcrumbLabel(mode === 'industry' ? (data as SanityIndustry | null)?.name : undefined);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="pt-32 pb-20 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-20 space-y-6">
            <div className="w-48 h-10 bg-gray-200 animate-pulse rounded-full mx-auto"></div>
            <div className="w-full h-16 bg-gray-200 animate-pulse rounded-xl"></div>
            <div className="w-2/3 h-10 bg-gray-200 animate-pulse rounded-lg mx-auto"></div>
            <div className="flex justify-center gap-4">
              <div className="w-40 h-12 bg-gray-200 animate-pulse rounded-lg"></div>
              <div className="w-40 h-12 bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
            <div className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
            <div className="h-48 bg-gray-200 animate-pulse rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return <CmsErrorState onRetry={retry} />;
  }

  if (!data) {
    return <NotFound />;
  }

  // Type Guards
  const isIndustry = (_item: unknown): _item is SanityIndustry => mode === 'industry';

  return (
    <div className="min-h-screen bg-gray-50 text-dark">
      {isIndustry(data) ? (
        <Seo
          title={`Marketing i Strony WWW ${industryAudience(data.forWho, data.name)}`}
          description={industryDescription(data.name, data.painPoints)}
          breadcrumbs={[
            { name: 'Strona Główna', item: '/' },
            { name: 'Branże', item: '/branza/' },
            { name: `Branża: ${data.name}`, item: `/branza/${slug}/` },
          ]}
          service={{
            name: `Usługi IT i Marketingowe ${industryAudience(data.forWho, data.name)}`,
            description: `Dedykowane rozwiązania technologiczne i strategie wzrostu skrojone pod specyfikę branży ${data.name}.`,
            serviceType: 'IT & Marketing Consulting',
          }}
        />
      ) : (
        <Seo
          // /miasto/rzeszow/ = lokalny hub (Rzeszów + Podkarpacie). Tytuł celowo inny niż
          // strony głównej („Agencja Marketingowa Rzeszów — …”): dwa niemal identyczne
          // <title> konkurowały o tę samą frazę (kanibalizacja, raport SEO W7).
          title={
            slug === 'rzeszow'
              ? 'Rzeszów i Podkarpacie — strony WWW, SEO i reklamy'
              : data.seoTitle || `Agencja Marketingowa ${data.city}`
          }
          description={
            slug === 'rzeszow'
              ? 'Dla firm z Rzeszowa i Podkarpacia: strony WWW, sklepy, SEO, Google Ads, branding. Spotkania u klienta na miejscu lub online. Wycena w 24h.'
              : data.seoDescription ||
                `Profesjonalne usługi IT, strony www i marketing internetowy dla firm z ${data.genitive}. Lokalne wsparcie, globalna jakość.`
          }
          canonical={slug === 'rzeszow' ? '/miasto/rzeszow/' : `/miasto/${slug}/`}
          // Strony miejskie inne niz siedziba (Rzeszow) sa tymczasowo noindex
          // do czasu uzupelnienia unikalnej tresci per lokalizacja. Chroni przed
          // doorway pages penalty Google. Zdjac noindex po dodaniu min. 600 slow
          // unikalnej tresci (lokalne case studies, partnerzy, dojazd).
          noindex={slug !== 'rzeszow'}
          breadcrumbs={[
            { name: 'Strona Główna', item: '/' },
            { name: `Marketing i Strony WWW ${data.city}`, item: `/miasto/${slug}/` },
          ]}
          service={{
            name: `Marketing i Software House ${data.city}`,
            description: `Kompleksowa obsługa technologiczna i reklamowa dla firm z lokalizacji: ${data.city} i okolic.`,
            areaServed: data.city,
          }}
          // FAQ ze strony /miasto/rzeszow/ — sygnal dla AI search (ChatGPT,
          // Perplexity, Google AI Overviews) ze strona ma cytowalne odpowiedzi.
          // Ta sama lista co widoczna sekcja (rzeszowFaq.ts) — schema = tekst na stronie.
          faq={slug === 'rzeszow' ? RZESZOW_FAQ_SCHEMA : undefined}
        />
      )}

      <AmbientBackground />

      <div className="pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {isIndustry(data) ? (
            <PseoIndustryContent data={data} />
          ) : (
            <PseoLocationContent data={data} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PseoTemplate;
