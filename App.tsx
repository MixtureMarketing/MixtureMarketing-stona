import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useModal } from '@/context/ModalContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';
import Seo from '@/components/common/Seo';
import LazyHydrate from '@/components/common/LazyHydrate';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import CursorGlow from '@/components/common/CursorGlow';
import NotFound from '@/components/common/NotFound';
import { SITE_CONFIG } from '@/config/site';
import { leadService } from '@/services/leadService';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { AuthProvider } from '@/context/AuthContext';
import CookieBanner from '@/components/features/CookieBanner';
import { ContactType } from '@/types';

// --- Page Components (Lazy Loaded) ---
const ContactModal = lazy(() => import('@/components/features/ContactModal'));
import Hero from '@/components/sections/Hero';
const PortalLogin = lazy(() => import('@/components/portal/PortalLogin'));
const PortalVerify = lazy(() => import('@/components/portal/PortalVerify'));
const PortalDashboard = lazy(() => import('@/components/portal/PortalDashboard'));
const AdminDashboard = lazy(() => import('@/components/portal/AdminDashboard'));
const AuditPage = lazy(() => import('@/components/pages/AuditPage'));
const WhyUs = lazy(() => import('@/components/sections/WhyUs'));
const Services = lazy(() => import('@/components/sections/Services'));
const LeadMagnet = lazy(() => import('@/components/sections/LeadMagnet'));
const KnowledgeBaseTeaser = lazy(() => import('@/components/sections/KnowledgeBaseTeaser'));
const WebDevelopment = lazy(() => import('@/components/pages/WebDevelopment'));
const Offers = lazy(() => import('@/components/sections/Offers'));
const Marketing = lazy(() => import('@/components/pages/Marketing'));
const DesignBranding = lazy(() => import('@/components/pages/DesignBranding'));
const BrandIdentity = lazy(() => import('@/components/pages/BrandIdentity'));
const UiUxDesign = lazy(() => import('@/components/pages/UiUxDesign'));
const PrintDesign = lazy(() => import('@/components/pages/PrintDesign'));
const VisualAudit = lazy(() => import('@/components/pages/VisualAudit'));
const Ecommerce = lazy(() => import('@/components/pages/Ecommerce'));
const LandingPage = lazy(() => import('@/components/pages/LandingPage'));
const CorporateWebsite = lazy(() => import('@/components/pages/CorporateWebsite'));
const CustomWebApp = lazy(() => import('@/components/pages/CustomWebApp'));
const GoogleAds = lazy(() => import('@/components/pages/GoogleAds'));
const MetaAds = lazy(() => import('@/components/pages/MetaAds'));
const MarketingSeo = lazy(() => import('@/components/pages/MarketingSeo'));
const Analytics = lazy(() => import('@/components/pages/Analytics'));
const ContactPage = lazy(() => import('@/components/pages/ContactPage'));
const PrivacyPolicy = lazy(() => import('@/components/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/components/pages/TermsOfService'));
const KnowledgeBase = lazy(() => import('@/components/pages/KnowledgeBase'));
const RedisArticle = lazy(() => import('@/components/articles/RedisArticle'));
const CdnArticle = lazy(() => import('@/components/articles/CdnArticle'));
const ImageFormatsArticle = lazy(() => import('@/components/articles/ImageFormatsArticle'));
const WafArticle = lazy(() => import('@/components/articles/WafArticle'));
const EdgeComputingArticle = lazy(() => import('@/components/articles/EdgeComputingArticle'));
const CoreWebVitalsArticle = lazy(() => import('@/components/articles/CoreWebVitalsArticle'));
const GoogleAdsArticle = lazy(() => import('@/components/articles/GoogleAdsArticle'));
const UxAuditArticle = lazy(() => import('@/components/articles/UxAuditArticle'));
const ServerSideTrackingArticle = lazy(
  () => import('@/components/articles/ServerSideTrackingArticle'),
);
const NextJsArticle = lazy(() => import('@/components/articles/NextJsArticle'));
const HeadlessArticle = lazy(() => import('@/components/articles/HeadlessArticle'));
const TailwindArticle = lazy(() => import('@/components/articles/TailwindArticle'));
const TypeScriptArticle = lazy(() => import('@/components/articles/TypeScriptArticle'));
const PostgresArticle = lazy(() => import('@/components/articles/PostgresArticle'));
const MongoArticle = lazy(() => import('@/components/articles/MongoArticle'));
const ElasticsearchArticle = lazy(() => import('@/components/articles/ElasticsearchArticle'));
const ReactJsArticle = lazy(() => import('@/components/articles/ReactJsArticle'));
const VueArticle = lazy(() => import('@/components/articles/VueArticle'));
const PythonArticle = lazy(() => import('@/components/articles/PythonArticle'));
const LaravelArticle = lazy(() => import('@/components/articles/LaravelArticle'));
const GoArticle = lazy(() => import('@/components/articles/GoArticle'));
const NodeArticle = lazy(() => import('@/components/articles/NodeArticle'));
const FrontendArticle = lazy(() => import('@/components/articles/FrontendArticle'));
const DatabaseCompendiumArticle = lazy(
  () => import('@/components/articles/DatabaseCompendiumArticle'),
);
const BackendCompendiumArticle = lazy(
  () => import('@/components/articles/BackendCompendiumArticle'),
);
const DockerArticle = lazy(() => import('@/components/articles/DockerArticle'));
const CiCdArticle = lazy(() => import('@/components/articles/CiCdArticle'));
const DevOpsArticle = lazy(() => import('@/components/articles/DevOpsArticle'));
const ArticleTemplate = lazy(() => import('@/components/templates/ArticleTemplate'));
const IndustryTemplate = lazy(() => import('@/components/templates/IndustryTemplate'));
const LocationTemplate = lazy(() => import('@/components/templates/LocationTemplate'));
const PortfolioPage = lazy(() => import('@/components/pages/PortfolioPage'));
const CaseStudyTemplate = lazy(() => import('@/components/templates/CaseStudyTemplate'));

const GlobalSchema = () => (
  <Helmet>
    <script type="application/ld+json">
      {JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.domain,
        logo: `${SITE_CONFIG.domain}/assets/images/sygnet.png`,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: SITE_CONFIG.contact.phone,
          contactType: 'customer service',
          areaServed: 'PL',
          availableLanguage: ['Polish', 'English'],
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: SITE_CONFIG.contact.address.street,
          addressLocality: SITE_CONFIG.contact.address.city,
          postalCode: SITE_CONFIG.contact.address.postalCode,
          addressCountry: SITE_CONFIG.contact.address.countryCode,
        },
        vatID: SITE_CONFIG.contact.vatID,
        sameAs: [
          SITE_CONFIG.social.facebook,
          SITE_CONFIG.social.instagram,
          SITE_CONFIG.social.linkedin,
          SITE_CONFIG.social.tiktok,
        ],
      })}
    </script>
  </Helmet>
);

// Helper component for the Home Page structure
const Home = () => {
  const { openModal } = useModal();
  return (
    <>
      <Seo
        title="Agencja Marketingowa 360° i Software House"
        description="Łączymy precyzję Software House'u z kreatywnością Agencji Reklamowej. Budujemy systemy, które działają i kampanie, które sprzedają. Poznaj naszą ofertę."
        lcpImage="/assets/images/sygnet.png"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Mixture Marketing',
          url: 'https://mixturemarketing.pl',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://mixturemarketing.pl/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        }}
      />
      <Hero onOpenModal={() => openModal('general')} />
      <Suspense fallback={<div className="h-screen" />}>
        <Services />
        <LazyHydrate minHeight="600px">
          <WhyUs />
        </LazyHydrate>
        <LazyHydrate minHeight="400px">
          <LeadMagnet />
        </LazyHydrate>
        <LazyHydrate minHeight="600px">
          <KnowledgeBaseTeaser />
        </LazyHydrate>
      </Suspense>
    </>
  );
};

declare global {
  interface Window {
    isPrerendering?: boolean;
  }
}

// Fallback component for Suspense
const Loading = () => (
  <div className="flex justify-center items-center h-screen">
    <h1 className="sr-only">Ładowanie strony...</h1>
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
  </div>
);

function App() {
  const { isModalOpen, modalType, openModal, closeModal } = useModal();
  const location = useLocation();
  const showBreadcrumbs = location.pathname !== '/'; // Show breadcrumbs on all pages except homepage
  const resumeProcessed = React.useRef(false);

  // Check if we are in a browser environment and NOT during prerendering
  const isPrerendering =
    typeof window !== 'undefined' &&
    (window.navigator.userAgent.includes('Headless') || window.isPrerendering);

  // Handle Resume Form from Email
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resumeLeadId = params.get('resume_lead');
    const resumeStep = params.get('step');

    if (resumeLeadId && !resumeProcessed.current) {
      resumeProcessed.current = true; // Block further executions

      const fetchAndOpen = async () => {
        try {
          const lead = await leadService.getLead(resumeLeadId);
          if (lead) {
            // Map specific interest to main modal category
            const typeMap: Record<string, string> = {
              landing: 'web',
              ecommerce: 'web',
              corporate: 'web',
              custom: 'web',
              google: 'marketing',
              meta: 'marketing',
              seo: 'marketing',
              branding: 'design',
              uiux: 'design',
              print: 'design',
            };

            const mainCategory =
              typeMap[lead.service_interest || ''] || lead.service_interest || 'contact';

            // Open modal with resumed data
            openModal(mainCategory as ContactType, {
              resumedLead: lead,
              step: resumeStep || '2',
              specificType: lead.service_interest,
            });

            // Clean URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          }
        } catch (error) {
          console.error('Failed to resume lead:', error);
        }
      };

      fetchAndOpen();
    }
  }, [openModal]);

  const appContent = (
    <AuthProvider>
      <GlobalSchema />
      <div className="min-h-screen bg-gray-50">
        <CursorGlow />
        <ScrollToTop />

        {/* Skip Link for WCAG Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[60] bg-secondary text-white px-4 py-2 rounded-md font-bold shadow-lg ring-2 ring-white transition-none"
        >
          Przejdź do treści
        </a>

        <Navbar />

        <main id="main-content">
          {showBreadcrumbs && <Breadcrumbs />}
          <ErrorBoundary>
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Main Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />

                {/* Web Development */}
                <Route path="/web-development" element={<WebDevelopment />} />
                <Route path="/web-development/ecommerce" element={<Ecommerce />} />
                <Route path="/web-development/landing-page" element={<LandingPage />} />
                <Route path="/web-development/corporate" element={<CorporateWebsite />} />
                <Route path="/web-development/custom-app" element={<CustomWebApp />} />

                {/* Marketing */}
                <Route path="/marketing" element={<Marketing />} />
                <Route path="/marketing/google-ads" element={<GoogleAds />} />
                <Route path="/marketing/meta-ads" element={<MetaAds />} />
                <Route path="/marketing/seo" element={<MarketingSeo />} />
                <Route path="/marketing/analytics" element={<Analytics />} />

                {/* Design */}
                <Route path="/design" element={<DesignBranding />} />
                <Route path="/design/branding" element={<BrandIdentity />} />
                <Route path="/design/ui-ux" element={<UiUxDesign />} />
                <Route path="/design/print" element={<PrintDesign />} />
                <Route path="/design/visual-audit" element={<VisualAudit />} />

                {/* Knowledge Base */}
                <Route path="/baza-wiedzy" element={<KnowledgeBase />} />
                <Route path="/baza-wiedzy/redis-optymalizacja" element={<RedisArticle />} />
                <Route path="/baza-wiedzy/cdn-globalna-wydajnosc" element={<CdnArticle />} />
                <Route
                  path="/baza-wiedzy/optymalizacja-obrazow-webp-avif"
                  element={<ImageFormatsArticle />}
                />
                <Route path="/baza-wiedzy/waf-bezpieczenstwo" element={<WafArticle />} />
                <Route path="/baza-wiedzy/edge-computing" element={<EdgeComputingArticle />} />
                <Route
                  path="/baza-wiedzy/core-web-vitals-2025"
                  element={<CoreWebVitalsArticle />}
                />
                <Route
                  path="/baza-wiedzy/google-ads-skalowanie-budzetu"
                  element={<GoogleAdsArticle />}
                />
                <Route
                  path="/baza-wiedzy/audyt-ux-sklepu-internetowego"
                  element={<UxAuditArticle />}
                />
                <Route
                  path="/baza-wiedzy/server-side-tracking-koniec-cookies"
                  element={<ServerSideTrackingArticle />}
                />
                <Route
                  path="/baza-wiedzy/nextjs-zloty-standard-aplikacji-webowych"
                  element={<NextJsArticle />}
                />
                <Route
                  path="/baza-wiedzy/headless-wordpress-wydajnosc-i-bezpieczenstwo"
                  element={<HeadlessArticle />}
                />
                <Route
                  path="/baza-wiedzy/tailwind-css-utility-first-przyszlosc-projektowania"
                  element={<TailwindArticle />}
                />
                <Route
                  path="/baza-wiedzy/typescript-polisa-ubezpieczeniowa-twojego-kodu"
                  element={<TypeScriptArticle />}
                />
                <Route
                  path="/baza-wiedzy/postgresql-krol-baz-danych-open-source-dla-biznesu"
                  element={<PostgresArticle />}
                />
                <Route
                  path="/baza-wiedzy/mongodb-nosql-przyszlosc-big-data-i-dynamicznych-aplikacji"
                  element={<MongoArticle />}
                />
                <Route
                  path="/baza-wiedzy/elasticsearch-inteligentna-wyszukiwarka-ecommerce"
                  element={<ElasticsearchArticle />}
                />
                <Route
                  path="/baza-wiedzy/react-js-najbezpieczniejsza-technologia-dla-biznesu"
                  element={<ReactJsArticle />}
                />
                <Route
                  path="/baza-wiedzy/vue-js-harmonijny-kompromis-react-angular"
                  element={<VueArticle />}
                />
                <Route
                  path="/baza-wiedzy/python-django-bezpieczenstwo-fintech-mvp"
                  element={<PythonArticle />}
                />
                <Route
                  path="/baza-wiedzy/laravel-php-framework-szybkie-wdrozenie"
                  element={<LaravelArticle />}
                />
                <Route path="/baza-wiedzy/go-golang-jezyk-chmury" element={<GoArticle />} />
                <Route path="/baza-wiedzy/nodejs-jeden-jezyk" element={<NodeArticle />} />
                <Route
                  path="/baza-wiedzy/frontend-bez-tajemnic-kompendium-cto"
                  element={<FrontendArticle />}
                />
                <Route
                  path="/baza-wiedzy/bazy-danych-kompendium-architekta"
                  element={<DatabaseCompendiumArticle />}
                />
                <Route
                  path="/baza-wiedzy/backend-bez-tajemnic-przewodnik-cto"
                  element={<BackendCompendiumArticle />}
                />
                <Route
                  path="/baza-wiedzy/docker-konteneryzacja-przewodnik"
                  element={<DockerArticle />}
                />
                <Route path="/baza-wiedzy/ci-cd-automatyzacja-wdrozen" element={<CiCdArticle />} />
                <Route
                  path="/baza-wiedzy/devops-fundament-nowoczesnego-biznesu"
                  element={<DevOpsArticle />}
                />

                {/* Portal Routes */}
                <Route path="/portal" element={<PortalLogin />} />
                <Route path="/portal/verify" element={<PortalVerify />} />
                <Route path="/portal/dashboard" element={<PortalDashboard />} />
                <Route path="/portal/admin" element={<AdminDashboard />} />

                {/* Audit 360 */}
                <Route path="/audyt-360" element={<AuditPage />} />

                {/* Dynamic CMS Article Route */}
                <Route path="/baza-wiedzy/:slug" element={<ArticleTemplate />} />

                {/* Dynamic Industry Route */}
                <Route path="/branza/:slug" element={<IndustryTemplate />} />

                {/* Dynamic Location Route */}
                <Route path="/miasto/:slug" element={<LocationTemplate />} />

                {/* Portfolio Routes */}
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/portfolio/:slug" element={<CaseStudyTemplate />} />

                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>

        <section aria-label="Zarządzanie plikami cookies">
          <CookieBanner />
        </section>

        <LazyHydrate minHeight="400px">
          <Footer />
        </LazyHydrate>

        {/* Global Modal - Exclude during prerendering to avoid ReCaptcha context errors */}
        {!isPrerendering && (
          <Suspense fallback={null}>
            <ContactModal isOpen={isModalOpen} onClose={closeModal} type={modalType} />
          </Suspense>
        )}
      </div>
    </AuthProvider>
  );

  // Return clean content if prerendering, wrap with provider ONLY in browser
  if (isPrerendering) {
    return appContent;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={SITE_CONFIG.contact.recaptchaSiteKey}
      language="pl"
      useRecaptchaNet
    >
      {appContent}
    </GoogleReCaptchaProvider>
  );
}

export default App;
