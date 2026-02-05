import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { ModalProvider } from './context/ModalContext';
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';
import './index.css';

// Performance Monitoring (Real User Metrics)
function reportWebVitals(metric: Metric) {
  const { name, value, id, delta } = metric;

  // Skip RUM if prerendering (build time) to avoid console errors
  if (window.isPrerendering) return;

  // Local log only in DEV
  if (import.meta.env.DEV) {
    const color = value > 2500 ? 'color: #ff4d4f' : 'color: #52c41a';
    console.log(`%c[RUM] ${name}: ${Math.round(value)}ms`, color, { id, delta });
  }

  // Placeholder for future GA4 ingestion
  if (import.meta.env.PROD) {
    const body = JSON.stringify({ name, value, id, delta, url: window.location.href });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/rum-collect', body);
    } else {
      fetch('/api/rum-collect', { body, method: 'POST', keepalive: true });
    }
  }
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
import '@fontsource/montserrat/latin-900.css';
import '@fontsource/montserrat/latin-ext-900.css';
import '@fontsource/playfair-display/latin-400.css';
import '@fontsource/playfair-display/latin-ext-400.css';
import '@fontsource/playfair-display/latin-700.css';
import '@fontsource/playfair-display/latin-ext-700.css';

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
