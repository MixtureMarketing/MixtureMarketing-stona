#!/usr/bin/env node
/**
 * MIX-1411 kryt. 12: rozmiar JS wariantu B menu (gzip po minifikacji), bez zależności wspólnych
 * z resztą paczki (react, react-router-dom, lucide-react, aliasy `@/`).
 *
 *   node scripts/size-mobile-menu-b.mjs [limit-bajtow=7680]
 *   node scripts/size-mobile-menu-b.mjs --dist <katalog-budowy> --expect on|off
 *
 * Kod wyjścia 0 = MobileMenuB (JS + CSS, od MIX-1465 z modułami karty) + przełącznik ≤ limit;
 * 1 = ponad limit; 2 = błąd. Limit 7680 B od MIX-1465 (makieta B: karta, zakładki, przeciąganie,
 * pułapka fokusu; pomiar 1465: JS 4473 B + CSS 2479 B gz; MIX-1411 miał 2048 B bez CSS).
 * Tryb --dist (MIX-1465 kryt. 2): napisy tylko z menu B w plikach JS/CSS budowy; --expect off =
 * w budowie bez przełącznika ma ich być 0, --expect on = każdy obecny. Kod 0 = zgodnie, 1 = nie.
 */
import zlib from 'node:zlib';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const esbuild = require(require.resolve('esbuild', { paths: [require.resolve('vite')] }));
const args = process.argv.slice(2);
const limit = Number(args[0] && !args[0].startsWith('--') ? args[0] : 7680);
// Napisy, które są tylko w menu B (mobileMenuBData.ts, mobileMenuB.css).
const B_ONLY = ['Obszary oferty', 'mmb-tab-ind', 'Manrope MMB'];

if (args.includes('--dist')) {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const dir = path.resolve(args[args.indexOf('--dist') + 1], 'assets');
  const expect = args[args.indexOf('--expect') + 1];
  if (!fs.existsSync(dir) || !['on', 'off'].includes(expect)) {
    console.error('BLAD: --dist <katalog z assets/> --expect on|off');
    process.exit(2);
  }
  const files = fs.readdirSync(dir).filter((f) => /\.(js|css)$/.test(f));
  const text = files.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
  const hits = B_ONLY.map((s) => [s, text.split(s).length - 1]);
  for (const [s, n] of hits) console.log(`DIST ${s}: ${n}`);
  const ok = expect === 'off' ? hits.every(([, n]) => n === 0) : hits.every(([, n]) => n > 0);
  console.log(`DIST pliki=${files.length} expect=${expect} -> ${ok ? 'OK' : 'NIE'}`);
  process.exit(ok ? 0 : 1);
}

async function gz(entry) {
  const r = await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    outdir: 'out',
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
          // Pliki krojów (?url) to osobne zasoby, ładowane w wolnej chwili, nie JS.
          b.onResolve({ filter: /\?url$/ }, (a) => ({ path: a.path, external: true }));
        },
      },
    ],
    logLevel: 'error',
  });
  const files = r.outputFiles;
  const code = Buffer.concat(files.map((f) => Buffer.from(f.contents)));
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
