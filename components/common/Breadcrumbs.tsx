import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const pathMap: { [key: string]: string } = {
  '/web-development': 'Web Development',
  '/web-development/ecommerce': 'E-commerce',
  '/web-development/landing-page': 'Landing Page',
  '/web-development/corporate': 'Strona Firmowa',
  '/web-development/custom-app': 'Aplikacje Dedykowane',
  '/marketing': 'Marketing Cyfrowy',
  '/marketing/google-ads': 'Google Ads',
  '/marketing/meta-ads': 'Meta Ads',
  '/marketing/seo': 'SEO & Content',
  '/marketing/analytics': 'Data & Analityka',
  '/design': 'Grafika & Design',
  '/design/branding': 'Brand Identity',
  '/design/ui-ux': 'UI/UX Design',
  '/design/print': 'Materiały Druk',
  '/design/visual-audit': 'Audyt Wizualny',
  '/contact': 'Kontakt',
  '/offers': 'Oferta',
  '/baza-wiedzy': 'Baza Wiedzy',
  '/baza-wiedzy/redis-optymalizacja': 'Redis - Optymalizacja',
  '/baza-wiedzy/cdn-globalna-wydajnosc': 'CDN - Globalna Wydajność',
  '/baza-wiedzy/optymalizacja-obrazow-webp-avif': 'Next-Gen Image Formats',
  '/baza-wiedzy/waf-bezpieczenstwo': 'WAF - Bezpieczeństwo',
  '/baza-wiedzy/edge-computing': 'Edge Computing',
  '/baza-wiedzy/core-web-vitals-2025': 'Core Web Vitals 2025',
  '/baza-wiedzy/google-ads-skalowanie-budzetu': 'Google Ads - Skalowanie',
};

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Note: Using a hardcoded domain is necessary for absolute URLs in schema.
  // This should be replaced with an environment variable in a real-world scenario.
  const domain = 'https://mixturemarketing.pl';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: domain,
      },
      ...pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}/`;
        const displayName = pathMap[routeTo.slice(0, -1)] || name.replace(/-/g, ' '); // remove trailing slash for lookup if map keys don't have it
        return {
          '@type': 'ListItem',
          position: index + 2,
          name: displayName,
          item: `${domain}${routeTo}`,
        };
      }),
    ],
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>
      <nav
        aria-label="Breadcrumb"
        className="text-sm font-medium text-gray-700 py-4 px-4 sm:px-6 lg:px-8 relative z-20"
      >
        <ol className="max-w-screen-2xl mx-auto flex items-center space-x-2">
          <li>
            <Link
              to="/"
              className="text-gray-700 hover:text-secondary flex items-center transition-colors"
            >
              <HomeIcon size={16} className="mr-1" aria-hidden="true" /> Strona Główna
            </Link>
          </li>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}/`;
            const isLast = index === pathnames.length - 1;
            const displayName = pathMap[routeTo.slice(0, -1)] || name.replace(/-/g, ' ');

            return (
              <li key={name} className="flex items-center">
                <ChevronRight size={16} className="text-gray-600 mx-2" aria-hidden="true" />
                {isLast ? (
                  <span className="text-gray-800 font-bold" aria-current="page">
                    {displayName}
                  </span>
                ) : (
                  <Link
                    to={routeTo}
                    className="text-gray-800 hover:text-secondary transition-colors"
                  >
                    {displayName}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
