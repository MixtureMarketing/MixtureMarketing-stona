// MIX-1607 r2: z czego sklada sie dist/baza-wiedzy/index.html (bajty): head, #root, skrypty, style, data: URI.
import fs from 'node:fs';
const f = process.argv[2];
const h = fs.readFileSync(f, 'utf8');
const sum = (re) => [...h.matchAll(re)].reduce((n, m) => n + m[0].length, 0);
const rootAt = h.indexOf('<div id="root"');
const bannerAt = h.indexOf('aria-label="Baner plików cookies"');
const mainAt = h.indexOf('<main');
console.log(`razem ${h.length} B; przed #root ${rootAt} B; #root ${h.length - rootAt} B`);
console.log(`pozycje (bajt od poczatku): <main ${mainAt}, baner ${bannerAt}, roznica baner-main ${bannerAt - mainAt}`);
console.log(`script: ${sum(/<script[\s\S]*?<\/script>/g)} B, style: ${sum(/<style[\s\S]*?<\/style>/g)} B, data: URI: ${sum(/data:[a-z/+-]+;base64,[A-Za-z0-9+/=]+/g)} B, svg inline: ${sum(/<svg[\s\S]*?<\/svg>/g)} B`);
const big = [...h.matchAll(/<script[^>]*>[\s\S]*?<\/script>/g)].map((m) => [m[0].length, m[0].slice(0, 90).replace(/\s+/g, ' ')]).sort((a, b) => b[0] - a[0]).slice(0, 4);
for (const [n, t] of big) console.log(`  script ${n} B: ${t}`);
