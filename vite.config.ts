import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgo from 'vite-plugin-svgo';
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
      svgo({
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
          'removeDimensions',
          'cleanupIds',
        ],
      }),
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
          // @portabletext/* (lazy), @marsidev/react-turnstile (ContactModal lazy).
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            // Granularny split: router + helmet wydzielone z vendor-react-core,
            // dzieki czemu zmiany w jednym nie invaliduja cache pozostalych
            // (poprzedni "vendor-react" mial 42% unused JS na home wg PSI).
            if (id.includes('/react-router/') || id.includes('/react-router-dom/')) {
              return 'vendor-router';
            }
            if (
              id.includes('/react-helmet-async/') ||
              id.includes('/react-is/') ||
              id.includes('/use-sync-external-store/')
            ) {
              return 'vendor-helmet';
            }
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/scheduler/')
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
    define: {
      // Pozwala na dostęp do klucza przez process.env (użyteczne dla niektórych bibliotek)
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
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
    },
  };
});
