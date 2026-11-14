// usage: node mutate.mjs <file> <from> <to>  (plain string, must match exactly once)
import fs from 'node:fs';
const [file, from, to] = process.argv.slice(2);
const s = fs.readFileSync(file, 'utf8');
const n = s.split(from).length - 1;
if (n !== 1) { console.error(`mutate: wzorzec znaleziony ${n}x`); process.exit(2); }
fs.writeFileSync(file, s.replace(from, () => to));
