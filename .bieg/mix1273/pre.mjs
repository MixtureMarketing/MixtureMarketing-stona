import fs from 'node:fs';
import { BASE_URL, KEY_PATHS } from '../../scripts/lib/llms.js';
const llms = fs.readFileSync('public/llms.txt', 'utf8');
for (const p of KEY_PATHS) console.log(p, new RegExp(`^\\s*- \\[[^\\]]+\\]\\(${BASE_URL}${p}\\): \\S`, 'm').test(llms));
