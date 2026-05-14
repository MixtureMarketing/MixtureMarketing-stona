import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import viteCompression from 'vite-plugin-compression';
import svgo from 'vite-plugin-svgo';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
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
      // Image optimization (compression)
      ViteImageOptimizer({
        test: /\.(jpe?g|png|gif|tiff|svg)$/i, // Exclude webp/avif from re-optimization (handled by script)
        includePublic: true,
        logStats: true,
        ansiColors: true,
        png: {
          quality: 80,
        },
        jpeg: {
          quality: 80,
        },
        jpg: {
          quality: 80,
        },
        svg: {
          multipass: true,
        },
        // Cache settings
        cache: true,
        cacheLocation: 'node_modules/.cache/.vite-plugin-image-optimizer',
      }),
      // Gzip compression
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
      }),
      // Brotli compression (better for modern browsers)
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
      visualizer({
        filename: 'stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
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
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router/') ||
              id.includes('/react-router-dom/') ||
              id.includes('/react-helmet-async/') ||
              id.includes('/react-is/') ||
              id.includes('/scheduler/') ||
              id.includes('/use-sync-external-store/')
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
