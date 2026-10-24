import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    plugins: [
      react(),
      tailwindcss(), // Tailwind v4 plugin
      // vite-plugin-svgo usuniety: dzialal tylko na `import x from './x.svg'`
      // w JS, a takich importow nie ma (SVG leza w public/ i ida jako pliki).
      // Obrazy: optymalizowane offline (scripts/convert-images.js -> webp/avif
      // commitowane) — usunieto ViteImageOptimizer (redundantny 2. przebieg).
      // Kompresja gzip/brotli usunieta: Cloudflare Pages kompresuje na krawedzi,
      // wiec pliki .gz/.br to martwy balast wydluzajacy build (brotli max jest wolny)
      // i powiekszajacy artefakt. Raport bundla (visualizer) tylko za flaga ANALYZE.
      ...(env.ANALYZE === 'true'
        ? [
            visualizer({
              filename: 'stats.html',
              gzipSize: true,
              brotliSize: true,
            }),
          ]
        : []),
    ],
    build: {
      emptyOutDir: true,
      rollupOptions: {
        output: {
          // Bezpieczne manualChunks: tylko biblioteki ladowane EAGERLY przez
          // 100% stron (react/router/helmet). Vite juz aktywnie splituje
          // wszystko inne lazy (jspdf, recharts, html2canvas, ContactModal itp.).
          //
          // Cel: poprawa caching (zmiana w app code nie invaliduje vendor-react),
          // dodatkowo eliminuje czesc "unused JS" z PSI - vendor jest sciagany
          // raz na cala wizyte zamiast wewnatrz main bundla.
          //
          // NIE splituj: framer-motion (uzywane w lazy chunks - naturalnie split),
          // lucide-react (tree-shake), @sanity/* (uzywane w lazy templates),
          // @portabletext/* (lazy). Turnstile: własny utils/turnstile (bez zależności npm —
          // api.js ładowany runtime z CDN Cloudflare przez jawny render, po incydencie 2026-07-16).
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            // Granularny split: router + helmet wydzielone z vendor-react-core,
            // dzieki czemu zmiany w jednym nie invaliduja cache pozostalych
            // (poprzedni "vendor-react" mial 42% unused JS na home wg PSI).
            if (
              id.includes('/node_modules/react-router/') ||
              id.includes('/node_modules/react-router-dom/')
            ) {
              return 'vendor-router';
            }
            if (
              id.includes('/node_modules/react-helmet-async/') ||
              id.includes('/node_modules/react-is/') ||
              id.includes('/node_modules/use-sync-external-store/')
            ) {
              return 'vendor-helmet';
            }
            if (
              // Pelna sciezka pakietu: samo '/react/' lapalo tez @portabletext/react
              // (+ toolkit, rxjs, tslib ~11 kB gzip) do chunka ladowanego na kazdej stronie.
              id.includes('/node_modules/react/') ||
              id.includes('/node_modules/react-dom/') ||
              id.includes('/node_modules/scheduler/')
            ) {
              return 'vendor-react';
            }
            return undefined;
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.ts',
      include: ['**/*.test.{ts,tsx}'],
      // .claude/worktrees = kopie robocze agentów (pełne klony repo) — bez tego
      // vitest zbierał ich testy jako własne.
      exclude: ['**/node_modules/**', '**/dist/**', '.claude/**', 'studio-mixture-marketing/**'],
    },
  };
});
