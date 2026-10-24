import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cmsService, SanityIndustrySummary } from '@/services/cmsService';
import { useCmsDocument, CMS_LIST_KEY } from '@/hooks/useCmsDocument';
import Seo from '@/components/common/Seo';
import CmsErrorState from '@/components/common/CmsErrorState';
import Container from '@/components/common/Container';
import { withTrailingSlash } from '@/utils/url';

const BASE_URL = 'https://mixturemarketing.pl';
const industryPath = (slug: string) => withTrailingSlash(`/branza/${slug}/`);

/** Pole Sanity `forWho` bywa „dla Psychologów…” albo listą „Kliniki estetyczne, …”. */
const audienceLine = (forWho?: string | null): string => {
  const f = (forWho || '').trim();
  return f ? f.charAt(0).toUpperCase() + f.slice(1) : '';
};

/**
 * Hub /branza/ — lista branż z Sanity (`industry`), po jednym kafelku na slug.
 * Wcześniej segment /branza/ nie miał strony (okruszki prowadziły do 404),
 * a strony branż nie miały żadnego linku wewnętrznego.
 */
const IndustryHub: React.FC = () => {
  const { status, data, retry } = useCmsDocument<SanityIndustrySummary[]>(
    CMS_LIST_KEY,
    cmsService.getIndustryList,
  );
  const industries = data ?? [];

  // Bez <Seo> w stanie ładowania — prerender czeka na Helmet (title + canonical),
  // więc snapshot powstaje dopiero z listą (albo ze stanem błędu → bramka).
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-20">
        <Container>
          <div className="max-w-3xl space-y-6 mb-16">
            <div className="w-2/3 h-14 bg-gray-200 animate-pulse rounded-xl"></div>
            <div className="w-full h-8 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-dark">
      <Seo
        title="Branże — strony WWW i marketing według specyfiki rynku"
        description="Branże: typowe wyzwania, wymagania techniczne i kwestie prawne, które uwzględniamy przy stronach WWW, SEO i kampaniach reklamowych dla firm z danej branży."
        canonical="/branza/"
        breadcrumbs={[
          { name: 'Strona Główna', item: '/' },
          { name: 'Branże', item: '/branza/' },
        ]}
        jsonLd={
          industries.length > 0
            ? {
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: 'Branże',
                itemListElement: industries.map((i, idx) => ({
                  '@type': 'ListItem',
                  position: idx + 1,
                  name: i.name,
                  url: `${BASE_URL}${industryPath(i.slug)}`,
                })),
              }
            : undefined
        }
      />

      {status === 'error' || industries.length === 0 ? (
        // Pusta lista = źle skonfigurowany dataset albo awaria — traktujemy jak błąd CMS,
        // żeby bramka prerenderu (data-cms-error) nie przepuściła huba bez linków.
        <CmsErrorState onRetry={retry} />
      ) : (
        <div className="pt-16 pb-24">
          <Container>
            <header className="max-w-3xl mb-14">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                Strony WWW i marketing <span className="text-secondary">według branży</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                Każda branża ma własne ograniczenia — od przepisów o reklamie po ochronę danych
                klientów. Wybierz swoją, żeby zobaczyć typowe wyzwania, wymagania techniczne i
                kwestie prawne, które uwzględniamy przy projekcie.
              </p>
            </header>

            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {industries.map((industry) => (
                <li key={industry.slug}>
                  <Link
                    to={industryPath(industry.slug)}
                    className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-colors hover:border-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                  >
                    <h2 className="text-xl font-bold text-dark mb-3">{industry.name}</h2>
                    {audienceLine(industry.forWho) && (
                      <p className="text-gray-700 leading-relaxed mb-6">
                        {audienceLine(industry.forWho)}
                      </p>
                    )}
                    <span className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-secondary">
                      Zobacz branżę
                      <ArrowRight
                        size={16}
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-14 text-gray-700">
              Nie ma Twojej branży na liście?{' '}
              <Link to="/contact/" className="font-bold text-secondary underline">
                Napisz do nas
              </Link>{' '}
              albo{' '}
              <Link to="/wycena/" className="font-bold text-secondary underline">
                oblicz wstępną wycenę projektu
              </Link>
              .
            </p>
          </Container>
        </div>
      )}
    </div>
  );
};

export default IndustryHub;
