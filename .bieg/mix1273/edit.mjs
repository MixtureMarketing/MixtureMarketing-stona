import fs from 'node:fs';
const f = 'tests/seo/llmsTxt.test.ts';
let s = fs.readFileSync(f, 'utf8');
const a = `import {
  BASE_URL,
  KEY_PATHS,
  llmsReport,
  llmsUrls,
  sitemapUrls,
} from '../../scripts/lib/llms.js';`;
const b = `import { BASE_URL, KEY_PATHS, llmsReport, llmsUrls, sitemapUrls } from '../../scripts/lib/llms.js';`;
if (!s.includes(a)) throw new Error('import');
s = s.replace(a, b);
const c = `  it('każdy wpis listy w llms.txt z adresem ma opis po dwukropku (strony kluczowe)', () => {
    for (const p of KEY_PATHS) {
      const line = llms.split('\\n').find((l) => l.includes(\`](\${BASE_URL}\${p})\`));
      expect(line, p).toBeDefined();
      expect(line, p).toMatch(/\\): \\S/);
    }
  });`;
const d = `  it('strony kluczowe mają w llms.txt wpis listy \`- [nazwa](adres): opis\`', () => {
    for (const p of KEY_PATHS) {
      const entry = new RegExp(\`^\\\\s*- \\\\[[^\\\\]]+\\\\]\\\\(\${BASE_URL}\${p}\\\\): \\\\S\`, 'm');
      expect(llms, p).toMatch(entry);
    }
  });`;
if (!s.includes(c)) throw new Error('test');
s = s.replace(c, d);
fs.writeFileSync(f, s);
