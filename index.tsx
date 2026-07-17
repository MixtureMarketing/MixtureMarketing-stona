import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { ModalProvider } from './context/ModalContext';
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';
import { trackEvent } from './utils/analytics';
import './index.css';

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

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Router>
        <ModalProvider>
          <App />
        </ModalProvider>
      </Router>
    </HelmetProvider>
  </React.StrictMode>,
);
