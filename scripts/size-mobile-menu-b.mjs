#!/usr/bin/env node
/**
 * MIX-1411 kryt. 12: rozmiar JS wariantu B menu (gzip po minifikacji), bez zależności wspólnych
 * z resztą paczki (react, react-router-dom, lucide-react, aliasy `@/`).
 *
 *   node scripts/size-mobile-menu-b.mjs [limit-bajtow=2048]
 *
 * Kod wyjścia 0 = MobileMenuB + przełącznik ≤ limit; 1 = ponad limit; 2 = błąd.
 */
import zlib from 'node:zlib';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const esbuild = require(require.resolve('esbuild', { paths: [require.resolve('vite')] }));
const limit = Number(process.argv[2] || 2048);

async function gz(entry) {
  const r = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    minify: true,
    format: 'esm',
    jsx: 'automatic',
    external: ['react', 'react/*', 'react-dom', 'react-router-dom', 'lucide-react', '@/*'],
    define: { 'import.meta.env.VITE_MM_MOBILE_MENU_B': 'undefined' },
    // navbarData: dane wspólne ze starym menu (i tak w paczce), nie liczone jako dodane.
    plugins: [
      {
        name: 'shared',
        setup(b) {
          b.onResolve({ filter: /navbarData$/ }, (a) => ({ path: a.path, external: true }));
        },
      },
    ],
    logLevel: 'error',
  });
  const code = r.outputFiles[0].contents;
  return { min: code.length, gz: zlib.gzipSync(code, { level: 9 }).length };
}

try {
  const b = await gz('components/layout/MobileMenuB.tsx');
  const flag = await gz('components/layout/mobileMenuFlag.ts');
  const old = await gz('components/layout/MobileMenu.tsx');
  const added = b.gz + flag.gz;
  console.log(`MobileMenuB: min ${b.min} B, gz ${b.gz} B`);
  console.log(`mobileMenuFlag: min ${flag.min} B, gz ${flag.gz} B`);
  console.log(`MobileMenu (stare, odniesienie): min ${old.min} B, gz ${old.gz} B`);
  console.log(`SIZE dodane gz=${added} B, limit ${limit} B -> ${added <= limit ? 'OK' : 'NIE'}`);
  process.exit(added <= limit ? 0 : 1);
} catch (e) {
  console.error('BLAD:', e);
  process.exit(2);
}
