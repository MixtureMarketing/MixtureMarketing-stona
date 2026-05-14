import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useModal } from '@/context/ModalContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/common/ScrollToTop';
import LazyHydrate from '@/components/common/LazyHydrate';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import CursorGlow from '@/components/common/CursorGlow';
import { SITE_CONFIG } from '@/config/site';
import { leadService } from '@/services/leadService';
import { installContactLinkTracking } from '@/utils/analytics';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import CookieBanner from '@/components/features/CookieBanner';
import { ContactType } from '@/types';
import { appRoutes } from '@/config/routes';

// --- Page Components (Lazy Loaded) ---
const ContactModal = lazy(() => import('@/components/features/ContactModal'));

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

  // Global tracking dla klikniec tel:/mailto: linkow -> GA4 (phone_click, email_click).
  // Single-time install na poziomie App, event delegation na document.
  useEffect(() => installContactLinkTracking(), []);

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
      <NotificationProvider>
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
                  {appRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                  ))}
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
          {!isPrerendering && isModalOpen && (
            <Suspense fallback={null}>
              <ContactModal isOpen={true} onClose={closeModal} type={modalType} />
            </Suspense>
          )}
        </div>
      </NotificationProvider>
    </AuthProvider>
  );

  // Return clean content if prerendering, wrap with provider ONLY in browser
  if (isPrerendering) {
    return appContent;
  }

  return appContent;
}

export default App;
