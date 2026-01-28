# Mixture Marketing - Strona Firmowa

Nowoczesna strona firmowa agencji Mixture Marketing, zbudowana w oparciu o React, Vite i Tailwind CSS v4. Projekt zoptymalizowany pod kątem Core Web Vitals (LCP, TBT, CLS) z wykorzystaniem technologii SSG (Static Site Generation).

## 🚀 Technologie

- **Frontend:** React 19, Tailwind CSS v4, Lucide React
- **Build Tool:** Vite 6
- **Optymalizacja:** Critters (Critical CSS), SSG (Puppeteer), React.lazy (Code Splitting)
- **Deployment:** Statyczny hosting (np. Vercel, Netlify, Cloudflare Pages)

## 🛠️ Instrukcja deweloperska

### Instalacja zależności

```bash
npm install --legacy-peer-deps
```

### Uruchomienie trybu deweloperskiego

```bash
npm run dev
```

### Budowanie wersji produkcyjnej

Proces budowania składa się z kompilacji Vite oraz kroku prerenderingu (SSG), który generuje zoptymalizowane pliki HTML z wstrzykniętym Critical CSS.

```bash
npm run build
```

## 📈 Optymalizacja Performance

Strona przeszła rygorystyczny proces optymalizacji:

1.  **Critical CSS**: Style powyżej linii zgięcia są wstrzykiwane bezpośrednio do HTML.
2.  **LCP Optimization**: Kluczowe obrazy (Logo, Hero) są preładowane i priorytetyzowane.
3.  **Code Splitting**: Ciężkie biblioteki (np. Recharts) oraz sekcje strony głównej ładowane są asynchronicznie.
4.  **DOM Size**: Dekoracje tła są renderowane po stronie klienta, aby odciążyć początkowy proces parsowania HTML.

## 📁 Struktura projektu

- `components/` - Komponenty React (w tym artykuły i wizualizacje)
- `public/` - Zasoby statyczne (obrazy, ikony)
- `scripts/` - Skrypty do audytów i konwersji zasobów
- `prerender.js` - Silnik SSG i optymalizacji HTML
