import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { ModalProvider } from './context/ModalContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';
import { trackEvent } from './utils/analytics';
import { installChunkReloadHandler } from './utils/chunkReload';
import { installGlobalErrorHandlers } from './utils/errorReporter';
import { preloadRoute } from './config/routes';
import { markPrerenderBoot } from './utils/bootState';
import './index.css';

// Nieaktualne chunki po deployu → jednorazowy reload (z ochroną przed pętlą).
installChunkReloadHandler();

// Nieobsłużone wyjątki/odrzucenia → /api/client-error (console.* jest wycinane w prod).
installGlobalErrorHandlers();

// Performance Monitoring (Real User Metrics)
// Wczesniej wysylane do /api/rum-collect.php (Apache PHP backend). Po migracji na
// CF Pages PHP nie istnieje — endpoint zwracal 405. Teraz: forwardujemy do GA4
// przez Cloudflare Zaraz wrapper (trackEvent). Naming: 'web_vital_lcp' itp.
function reportWebVitals(metric: Metric) {
  const { name, value, id, delta } = metric;

  // Skip podczas prerenderu (Puppeteer/build) — brak window/zaraz wtedy
  if (window.isPrerendering) return;

  // Local log w DEV
  if (import.meta.env.DEV) {
    const color = value > 2500 ? 'color: #ff4d4f' : 'color: #52c41a';
    console.log(`%c[RUM] ${name}: ${Math.round(value)}ms`, color, { id, delta });
    return;
  }

  // Production: forward do GA4 via Zaraz
  trackEvent(`web_vital_${name.toLowerCase()}`, {
    metric_name: name,
    metric_value: Math.round(value),
    metric_delta: Math.round(delta),
    metric_id: id,
    page_path: window.location.pathname,
  });
}

// Initialize vitals
onFCP(reportWebVitals);
onLCP(reportWebVitals);
onCLS(reportWebVitals);
onINP(reportWebVitals);
onTTFB(reportWebVitals);

if (import.meta.env.DEV) {
  // Scan for re-renders
  const { scan } = await import('react-scan');
  scan({
    enabled: true,
    log: true,
  });
}

// Self-host fonts (Optimized weights and subset)
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-ext-400.css';
import '@fontsource/manrope/latin-800.css';
import '@fontsource/manrope/latin-ext-800.css';
// Montserrat + Playfair przeniesione do BrandDnaMixer (jedyny użytkownik) —
// ładują się z lazy chunkiem /design/branding zamiast na każdej stronie.

// Initialize accessibility auditor in development
if (import.meta.env.DEV) {
  const axe = await import('@axe-core/react');
  axe.default(React, ReactDOM, 1000);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

// Start z prerenderowanego HTML (Cloudflare serwuje zrzut z Puppeteera): createRoot
// podmienia całą zawartość #root. Żeby podmiana była niewidoczna (bez spinnera
// Suspense, bez zwijania sekcji i utraty pozycji przewijania), najpierw dociągamy
// chunk bieżącej trasy (+ jej pod-chunki i dane CMS), a dopiero potem renderujemy
// — pierwszy commit daje wtedy tę samą treść, co prerender. Do tego czasu widać
// statyczny HTML. Limit czasu: po PRELOAD_TIMEOUT_MS renderujemy i tak (dalej jak
// dawniej: Suspense/szkielety). Prerender (window.isPrerendering) i dev (pusty
// #root) idą starą ścieżką — render od razu.
const PRELOAD_TIMEOUT_MS = 3000;
const fromPrerender = !window.isPrerendering && rootElement.hasChildNodes();
let ready: Promise<unknown> = Promise.resolve();
if (fromPrerender) {
  markPrerenderBoot();
  ready = Promise.race([
    preloadRoute(window.location.pathname).catch(() => undefined),
    new Promise((resolve) => setTimeout(resolve, PRELOAD_TIMEOUT_MS)),
  ]);
}

const root = ReactDOM.createRoot(rootElement);
void ready.then(() =>
  root.render(
    <React.StrictMode>
      {/* Granica zewnętrzna: błąd w Navbar/Footer/CookieBanner/providerach (poza
        granicą w <main>) daje komunikat „odśwież stronę”, a nie białą stronę. */}
      <ErrorBoundary fallback="minimal">
        <HelmetProvider>
          <Router>
            <ModalProvider>
              <App />
            </ModalProvider>
          </Router>
        </HelmetProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  ),
);
