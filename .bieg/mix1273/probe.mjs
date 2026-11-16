// MIX-1273 r2: szybka próba unparsedUrlLike na kilku formach (bez vitest).
import fs from 'node:fs';
import { unparsedUrlLike, llmsReport } from '../../scripts/lib/llms.js';
const forms = ['Zobacz https://evil.example/x', '[x]: https://evil.example/x', '- [x](HTTPS://e/x)', '<a href="/b/">', 'Kontakt: info@mixturemarketing.pl', 'metadata: x', '- [uwaga] opis (w nawiasie): tekst'];
for (const f of forms) console.log(JSON.stringify(unparsedUrlLike(f)));
console.log('real', unparsedUrlLike(fs.readFileSync('public/llms.txt', 'utf8')).length);
const r = llmsReport('- [x](https://mixturemarketing.pl/a/)\n- [x](https://mixturemarketing.pl/sitemap.xml)', '<loc>https://mixturemarketing.pl/a/</loc>', { keyPaths: ['/a/', '/sitemap.xml'] });
console.log(JSON.stringify(r));
