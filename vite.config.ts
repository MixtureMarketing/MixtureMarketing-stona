import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import viteCompression from 'vite-plugin-compression';
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
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Standalone heavy libraries
              if (id.includes('recharts')) return 'vendor-charts';
              if (id.includes('framer-motion')) return 'vendor-motion';
              if (id.includes('jspdf')) return 'vendor-pdf';
              if (id.includes('@supabase')) return 'vendor-db';
              if (id.includes('@google/genai')) return 'vendor-ai';
              if (id.includes('@sanity/client')) return 'vendor-cms';
              if (id.includes('lucide-react')) return 'vendor-utils';

              // Group remaining standard react vendors
              if (
                id.includes('react') ||
                id.includes('react-dom') ||
                id.includes('react-router-dom')
              ) {
                return 'vendor-core';
              }

              // Generic vendor chunk for other small libs
              return 'vendor-others';
            }
          },
        },
      },
      chunkSizeWarningLimit: 800,
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
