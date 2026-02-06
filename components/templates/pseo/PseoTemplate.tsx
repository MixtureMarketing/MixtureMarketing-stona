import React from 'react';
import { useParams } from 'react-router-dom';
import { cmsService, SanityIndustry, SanityLocation, urlFor } from '../../../services/cmsService';
import Seo from '../../common/Seo';
import NotFound from '../../common/NotFound';
import AmbientBackground from '../../common/AmbientBackground';
import { usePseoData } from '../../../hooks/usePseoData';
import PseoIndustryContent from './PseoIndustryContent';
import PseoLocationContent from './PseoLocationContent';

interface PseoTemplateProps {
  mode: 'industry' | 'location';
}

const PseoTemplate: React.FC<PseoTemplateProps> = ({ mode }) => {
  const { slug } = useParams<{ slug: string }>();

  const fetcher = mode === 'industry' ? cmsService.getIndustryBySlug : cmsService.getLocationBySlug;

  const { data, loading, error } = usePseoData<SanityIndustry | SanityLocation>(slug, fetcher);

  if (loading) {
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

  if (error || !data) {
    console.error(`[PSEO_ERROR] Failed to load data for slug: ${slug}, mode: ${mode}`);
    return <NotFound />;
  }

  // Type Guards
  const isIndustry = (item: any): item is SanityIndustry => mode === 'industry';

  return (
    <div className="min-h-screen bg-gray-50 text-dark">
      {isIndustry(data) ? (
        <Seo
          title={`Marketing i Strony WWW dla ${data.forWho || data.name}`}
          description={`Specjalistyczne usługi IT i marketingu dla branży: ${data.name}. ${data.painPoints?.length ? `Rozwiązujemy problemy: ${data.painPoints.slice(0, 2).join(', ')}.` : ''}`}
          lcpImage={
            data.heroImage?.asset?._ref
              ? urlFor(data.heroImage).width(1200).url()
              : '/assets/images/sygnet.png'
          }
          breadcrumbs={[
            { name: 'Strona Główna', item: '/' },
            { name: `Branża: ${data.name}`, item: `/branza/${slug}` },
          ]}
          service={{
            name: `Usługi IT i Marketingowe dla ${data.forWho || data.name}`,
            description: `Dedykowane rozwiązania technologiczne i strategie wzrostu skrojone pod specyfikę branży ${data.name}.`,
            serviceType: 'IT & Marketing Consulting',
          }}
        />
      ) : (
        <Seo
          title={data.seoTitle || `Agencja Marketingowa i Software House - ${data.city}`}
          description={
            data.seoDescription ||
            `Profesjonalne usługi IT, strony www i marketing internetowy dla firm z ${data.genitive}. Lokalne wsparcie, globalna jakość.`
          }
          lcpImage="/assets/images/sygnet.png"
          breadcrumbs={[
            { name: 'Strona Główna', item: '/' },
            { name: `Marketing i Strony WWW ${data.city}`, item: `/miasto/${slug}` },
          ]}
          service={{
            name: `Marketing i Software House ${data.city}`,
            description: `Kompleksowa obsługa technologiczna i reklamowa dla firm z lokalizacji: ${data.city} i okolic.`,
            areaServed: data.city,
          }}
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
