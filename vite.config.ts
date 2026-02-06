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
    base: '/',
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
      cssCodeSplit: true, // Split CSS to load only what's needed for the current page
      modulePreload: {
        polyfil: true,
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Critical heavy libs
              if (id.includes('recharts') || id.includes('d3')) return 'vendor-charts';
              if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
              if (id.includes('framer-motion')) return 'vendor-motion';
              if (id.includes('lucide-react')) return 'vendor-icons';
              if (id.includes('react-dom')) return 'vendor-react-dom';

              return 'vendor';
            }
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
