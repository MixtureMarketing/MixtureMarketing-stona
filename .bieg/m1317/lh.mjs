#!/usr/bin/env node
// MIX-1317: podsumowanie Lighthouse mobile (mediana z N przebiegów) baza vs on dla 6 podstron.
// Próg karty: wynik on nie gorszy niż o 2 pkt od bazy (integracja bc51ab2); CLS on ≤ 0,1. Kod 0 = progi spełnione.
import fs from 'node:fs';
import path from 'node:path';
const [dir] = process.argv.slice(2);
const med = (a) => { const s = a.filter((x) => x != null).sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : NaN; };
const rows = {};
for (const mode of ['base', 'on']) {
  const d = path.join(dir, mode);
  for (const f of fs.existsSync(d) ? fs.readdirSync(d).filter((x) => x.endsWith('.json')) : []) {
    const slug = f.replace(/-\d+\.json$/, '');
    let j; try { j = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')); } catch { continue; }
    const a = j.audits || {};
    const r = ((rows[slug] ||= {})[mode] ||= { score: [], lcp: [], tbt: [], cls: [], kb: [] });
    r.score.push(Math.round((j.categories?.performance?.score ?? NaN) * 100));
    r.lcp.push(a['largest-contentful-paint']?.numericValue);
    r.tbt.push(a['total-blocking-time']?.numericValue);
    r.cls.push(a['cumulative-layout-shift']?.numericValue);
    r.kb.push((a['total-byte-weight']?.numericValue ?? NaN) / 1024);
  }
}
let bad = 0;
console.log('| podstrona | wynik baza | wynik on | różnica | LCP baza / on (s) | TBT baza / on (ms) | CLS baza / on | kB baza / on | przebiegi |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const [slug, m] of Object.entries(rows)) {
  const b = m.base, o = m.on;
  if (!b || !o) { bad++; console.log(`| ${slug} | brak danych |`); continue; }
  const d = med(o.score) - med(b.score);
  const ok = d >= -2 && med(o.cls) <= 0.1 && o.score.length >= 3 && b.score.length >= 3;
  if (!ok) bad++;
  const f = (x, k = 1) => (Math.round(x * k) / k).toString();
  console.log(`| ${slug} | ${med(b.score)} | ${med(o.score)} | ${d >= 0 ? '+' : ''}${d}${ok ? '' : ' NIE'} | ${f(med(b.lcp) / 1000, 100)} / ${f(med(o.lcp) / 1000, 100)} | ${f(med(b.tbt))} / ${f(med(o.tbt))} | ${f(med(b.cls), 1000)} / ${f(med(o.cls), 1000)} | ${f(med(b.kb), 10)} / ${f(med(o.kb), 10)} | ${b.score.length}/${o.score.length} (${b.score.join(',')} / ${o.score.join(',')}) |`);
}
console.log(`LH ${bad ? 'NIE' : 'OK'} podstron=${Object.keys(rows).length} zle=${bad}`);
process.exit(bad || Object.keys(rows).length !== 6 ? 1 : 0);
