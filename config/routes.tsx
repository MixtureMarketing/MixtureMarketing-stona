import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// --- Page Components (Lazy Loaded) ---
const PortalLogin = lazy(() => import('@/components/portal/PortalLogin'));
const PortalVerify = lazy(() => import('@/components/portal/PortalVerify'));
const PortalDashboard = lazy(() => import('@/components/portal/PortalDashboard'));
const AdminDashboard = lazy(() => import('@/components/portal/AdminDashboard'));
const AuditPage = lazy(() => import('@/components/pages/AuditPage'));
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
const PseoTemplate = lazy(() => import('@/components/templates/pseo/PseoTemplate'));
const PortfolioPage = lazy(() => import('@/components/pages/PortfolioPage'));
const CaseStudyTemplate = lazy(() => import('@/components/templates/CaseStudyTemplate'));
const Home = lazy(() => import('@/components/pages/Home')); // We will extract Home to a page component
const AboutUs = lazy(() => import('@/components/pages/AboutUs'));
const NotFound = lazy(() => import('@/components/common/NotFound'));

export const appRoutes: RouteObject[] = [
  // Main Routes
  { path: '/', element: <Home /> },
  { path: '/offers', element: <Offers /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/o-nas', element: <AboutUs /> },
  { path: '/privacy-policy', element: <PrivacyPolicy /> },
  { path: '/terms', element: <TermsOfService /> },

  // Web Development
  { path: '/web-development', element: <WebDevelopment /> },
  { path: '/web-development/ecommerce', element: <Ecommerce /> },
  { path: '/web-development/landing-page', element: <LandingPage /> },
  { path: '/web-development/corporate', element: <CorporateWebsite /> },
  { path: '/web-development/custom-app', element: <CustomWebApp /> },

  // Marketing
  { path: '/marketing', element: <Marketing /> },
  { path: '/marketing/google-ads', element: <GoogleAds /> },
  { path: '/marketing/meta-ads', element: <MetaAds /> },
  { path: '/marketing/seo', element: <MarketingSeo /> },
  { path: '/marketing/analytics', element: <Analytics /> },

  // Design
  { path: '/design', element: <DesignBranding /> },
  { path: '/design/branding', element: <BrandIdentity /> },
  { path: '/design/ui-ux', element: <UiUxDesign /> },
  { path: '/design/print', element: <PrintDesign /> },
  { path: '/design/visual-audit', element: <VisualAudit /> },

  // Knowledge Base
  { path: '/baza-wiedzy', element: <KnowledgeBase /> },
  { path: '/baza-wiedzy/redis-optymalizacja', element: <RedisArticle /> },
  { path: '/baza-wiedzy/cdn-globalna-wydajnosc', element: <CdnArticle /> },
  {
    path: '/baza-wiedzy/optymalizacja-obrazow-webp-avif',
    element: <ImageFormatsArticle />,
  },
  { path: '/baza-wiedzy/waf-bezpieczenstwo', element: <WafArticle /> },
  { path: '/baza-wiedzy/edge-computing', element: <EdgeComputingArticle /> },
  {
    path: '/baza-wiedzy/core-web-vitals-2025',
    element: <CoreWebVitalsArticle />,
  },
  {
    path: '/baza-wiedzy/google-ads-skalowanie-budzetu',
    element: <GoogleAdsArticle />,
  },
  {
    path: '/baza-wiedzy/audyt-ux-sklepu-internetowego',
    element: <UxAuditArticle />,
  },
  {
    path: '/baza-wiedzy/server-side-tracking-koniec-cookies',
    element: <ServerSideTrackingArticle />,
  },
  {
    path: '/baza-wiedzy/nextjs-zloty-standard-aplikacji-webowych',
    element: <NextJsArticle />,
  },
  {
    path: '/baza-wiedzy/headless-wordpress-wydajnosc-i-bezpieczenstwo',
    element: <HeadlessArticle />,
  },
  {
    path: '/baza-wiedzy/tailwind-css-utility-first-przyszlosc-projektowania',
    element: <TailwindArticle />,
  },
  {
    path: '/baza-wiedzy/typescript-polisa-ubezpieczeniowa-twojego-kodu',
    element: <TypeScriptArticle />,
  },
  {
    path: '/baza-wiedzy/postgresql-krol-baz-danych-open-source-dla-biznesu',
    element: <PostgresArticle />,
  },
  {
    path: '/baza-wiedzy/mongodb-nosql-przyszlosc-big-data-i-dynamicznych-aplikacji',
    element: <MongoArticle />,
  },
  {
    path: '/baza-wiedzy/elasticsearch-inteligentna-wyszukiwarka-ecommerce',
    element: <ElasticsearchArticle />,
  },
  {
    path: '/baza-wiedzy/react-js-najbezpieczniejsza-technologia-dla-biznesu',
    element: <ReactJsArticle />,
  },
  {
    path: '/baza-wiedzy/vue-js-harmonijny-kompromis-react-angular',
    element: <VueArticle />,
  },
  {
    path: '/baza-wiedzy/python-django-bezpieczenstwo-fintech-mvp',
    element: <PythonArticle />,
  },
  {
    path: '/baza-wiedzy/laravel-php-framework-szybkie-wdrozenie',
    element: <LaravelArticle />,
  },
  { path: '/baza-wiedzy/go-golang-jezyk-chmury', element: <GoArticle /> },
  { path: '/baza-wiedzy/nodejs-jeden-jezyk', element: <NodeArticle /> },
  {
    path: '/baza-wiedzy/frontend-bez-tajemnic-kompendium-cto',
    element: <FrontendArticle />,
  },
  {
    path: '/baza-wiedzy/bazy-danych-kompendium-architekta',
    element: <DatabaseCompendiumArticle />,
  },
  {
    path: '/baza-wiedzy/backend-bez-tajemnic-przewodnik-cto',
    element: <BackendCompendiumArticle />,
  },
  {
    path: '/baza-wiedzy/docker-konteneryzacja-przewodnik',
    element: <DockerArticle />,
  },
  { path: '/baza-wiedzy/ci-cd-automatyzacja-wdrozen', element: <CiCdArticle /> },
  {
    path: '/baza-wiedzy/devops-fundament-nowoczesnego-biznesu',
    element: <DevOpsArticle />,
  },

  // Portal Routes
  { path: '/portal', element: <PortalLogin /> },
  { path: '/portal/verify', element: <PortalVerify /> },
  { path: '/portal/dashboard', element: <PortalDashboard /> },
  { path: '/portal/admin', element: <AdminDashboard /> },

  // Audit 360
  { path: '/audyt-360', element: <AuditPage /> },

  // Dynamic CMS Article Route
  { path: '/baza-wiedzy/:slug', element: <ArticleTemplate /> },

  // Dynamic Industry Route
  { path: '/branza/:slug', element: <PseoTemplate mode="industry" /> },

  // Dynamic Location Route
  { path: '/miasto/:slug', element: <PseoTemplate mode="location" /> },

  // Portfolio Routes
  { path: '/portfolio', element: <PortfolioPage /> },
  { path: '/portfolio/:slug', element: <CaseStudyTemplate /> },

  // 404 Not Found
  { path: '*', element: <NotFound /> },
];
