// Pomocnicze formularza kontaktowego.
//
// Wykonanie Turnstile (reset+execute+poll tokenu) przeniesione do reużywalnego `utils/turnstile.ts`
// (getTurnstileToken po widgetId) — po incydencie 2026-07-16, gdzie inicjalizacja przez
// `@marsidev/react-turnstile` (onload-callback) przegrywała wyścig w SPA/Zaraz i blokowała leady.

export const isLocalhost = () => window.location.hostname === 'localhost';
