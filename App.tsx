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
import { leadService } from '@/services/leadService';
import { installContactLinkTracking } from '@/utils/analytics';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { BreadcrumbLabelProvider } from '@/context/BreadcrumbLabelContext';
import CookieBanner from '@/components/features/CookieBanner';
import { ContactType } from '@/types';
import { appRoutes, hasOwnBreadcrumbs } from '@/config/routes';
import { getOrganizationSchema } from '@/utils/seo/organizationSchema';
import { SITE_CONFIG } from '@/config/site';

// --- Page Components (Lazy Loaded) ---
const ContactModal = lazy(() => import('@/components/features/ContactModal'));

// Jedna encja firmy (#organization) dla całej domeny — patrz utils/seo/organizationSchema.ts.
const GlobalSchema = () => (
  <Helmet>
    <script type="application/ld+json">{JSON.stringify(getOrganizationSchema())}</script>
  </Helmet>
);

// Fallback, gdy modal kontaktowy nie może się wyrenderować (np. stary chunk po deployu).
const ContactModalError = ({ onClose }: { onClose: () => void }) => (
  <div
    role="alert"
    data-error-boundary=""
    className="fixed bottom-4 left-4 right-4 sm:left-auto sm:max-w-sm z-[1000] bg-white border border-red-200 shadow-xl rounded-xl p-4 text-sm text-gray-800"
  >
    <p className="font-bold mb-1">Nie udało się otworzyć formularza.</p>
    <p className="mb-3">
      Odśwież stronę albo zadzwoń:{' '}
      <a className="underline font-bold" href={`tel:${SITE_CONFIG.contact.phoneFull}`}>
        {SITE_CONFIG.contact.phone}
      </a>
    </p>
    <div className="flex gap-3">
      <button
        type="button"
        className="font-bold underline"
        onClick={() => window.location.reload()}
      >
        Odśwież
      </button>
      <button type="button" className="underline" onClick={onClose}>
        Zamknij
      </button>
    </div>
  </div>
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
  // Wszędzie poza stroną główną i portalem (/portal/* ma własny nagłówek pod stałym Navbarem) —
  // chyba że trasa renderuje własne okruszki (bez duplikatu landmarku).
  const showBreadcrumbs =
    location.pathname !== '/' &&
    !location.pathname.startsWith('/portal') &&
    !hasOwnBreadcrumbs(location.pathname);
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
        <BreadcrumbLabelProvider>
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
              {showBreadcrumbs && (
                // Okruszki stoją na samej górze dokumentu (y 0–52), a navbar jest `fixed` h-20 —
                // zasłania je przy KAŻDEJ pozycji scrolla, więc scroll-padding nic tu nie da.
                // WCAG 2.4.11: gdy fokus z klawiatury trafi w okruszek, pasek zjeżdża tuż pod
                // navbar (translate, bez zmiany layoutu strony); dla myszy wygląd bez zmian.
                <div className="relative z-20 has-[:focus-visible]:z-[var(--z-nav)] has-[:focus-visible]:translate-y-20 has-[:focus-visible]:bg-white has-[:focus-visible]:shadow-md">
                  <Breadcrumbs />
                </div>
              )}
              {/* resetKey: nawigacja (link w Navbarze) zdejmuje fallback błędu poprzedniej trasy. */}
              <ErrorBoundary resetKey={location.pathname}>
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
            {/* Własna granica: padnięty chunk/render modala nie kładzie całej strony. */}
            {!isPrerendering && isModalOpen && (
              <ErrorBoundary fallback={<ContactModalError onClose={closeModal} />}>
                <Suspense fallback={null}>
                  <ContactModal isOpen={true} onClose={closeModal} type={modalType} />
                </Suspense>
              </ErrorBoundary>
            )}
          </div>
        </BreadcrumbLabelProvider>
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
