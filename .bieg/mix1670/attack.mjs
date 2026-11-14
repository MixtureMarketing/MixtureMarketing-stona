// MIX-1670: copy of the MIX-1665 verifier harness (82 refusal forms: 45 MIX-1662 + 37 own, 24 allowed twins).
// Usage from the repo root: node .bieg/mix1670/attack.mjs . .bieg/mix1670/formy-v1662.txt
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const WT = process.argv[2];
const { llmsReport } = await import(pathToFileURL(path.join(WT, 'scripts/lib/llms.js')).href);
const { prerenderOnlyRoutes: H } = await import(pathToFileURL(path.join(WT, 'routes.js')).href);
const base = fs.readFileSync(path.join(WT, 'public/llms.txt'), 'utf8');
const sm = fs.readFileSync(path.join(WT, 'public/sitemap.xml'), 'utf8');
const anchor = '- Obsługa zdalna: cała Polska\n';
if (!base.includes(anchor)) { console.log('ANCHOR MISSING'); process.exit(2); }
const old = fs.readFileSync(process.argv[3], 'utf8');
const forms = [...old.matchAll(/^\s+\['([^']+)', '([RA])', '(.*)'\],$/gmu)].map((m) => [m[1], m[2], m[3].replace(/\\n/g, '\n')]);
const own = [
  ['O01 latin open e U+025B', 'R', '- Strona abonamɛnt/dziekujemy'],
  ['O01t', 'A', '- Strona abonamɛnt i podziękowanie'],
  ['O02 z with stroke U+01B6', 'R', '- Strona abonament/dƶiekujemy'],
  ['O02t', 'A', '- Strona dƶiekujemy za abonament'],
  ['O03 greek capital NU', 'R', '- Strona ABOΝAMEΝT/DZIEKUJEMY'],
  ['O03t', 'A', '- Strona ABOΝAMEΝT i podziękowanie'],
  ['O04 greek capital UPSILON slug', 'R', '- Nowość: SYSTEMΥ-AI-APLIKACJE'],
  ['O04t', 'A', '- Nowość: SYSTEMΥ AI i APLIKACJE'],
  ['O05 greek capital MU', 'R', '- Strona ABONAΜENT/DZIEKUJEMY'],
  ['O06 greek capital ZETA', 'R', '- Strona ABONAMENT/DΖIEKUJEMY'],
  ['O07 armenian o U+0585', 'R', '- Strona abօnament/dziekujemy'],
  ['O08 coptic o U+2C9F', 'R', '- Strona abⲟnament/dziekujemy'],
  ['O09 rn for m', 'R', '- Strona abonarnent/dziekujemy'],
  ['O10 cl for d', 'R', '- Strona abonament/clziekujemy'],
  ['O11 lisu capital A U+A4EE', 'R', '- Strona ꓮBONAMENT/DZIEKUJEMY'],
  ['O12 math bold (NFKC)', 'R', '- Strona 𝐚𝐛𝐨𝐧𝐚𝐦𝐞𝐧𝐭/𝐝𝐳𝐢𝐞𝐤𝐮𝐣𝐞𝐦𝐲'],
  ['O13 digits 0 and 1', 'R', '- Strona ab0nament/dz1ekujemy'],
  ['O13t', 'A', '- Strona ab0nament i dz1ekujemy za wybór'],
  ['O14 cyrillic o a e k y', 'R', '- Strona аbоnаmеnt/dziекujеmу'],
  ['O15 greek omicron iota slug', 'R', '- Nowość: systemy-aι-aplιkacje'],
  ['O16 ZWJ inside', 'R', '- Strona abonament/dzie‍kujemy'],
  ['O17 RLO reversed', 'R', '- Strona ‮ymejukeizd/tnemanoba'],
  ['O18 html entity slash', 'R', '- Strona abonament&#47;dziekujemy'],
  ['O19 pct slash', 'R', '- Strona abonament%2Fdziekujemy'],
  ['O20 pct split over lines', 'R', '- abonament%2F\n- dziekujemy'],
  ['O21 i with stroke U+0268 slug', 'R', '- Nowość: systemy-aɨ-aplɨkacje'],
  ['O22 cyrillic komi de (table)', 'R', '- Strona abonament/ԁziekujemy'],
  ['O23 dotless i (table)', 'R', '- Strona abonament/dzıekujemy'],
  ['O24 double-struck (NFKC)', 'R', '- Strona 𝕒𝕓𝕠𝕟𝕒𝕞𝕖𝕟𝕥/𝕕𝕫𝕚𝕖𝕜𝕦𝕛𝕖𝕞𝕪'],
  ['O25 latin small beta U+A7B5', 'R', '- Strona aꞵonament/dziekujemy'],
  ['O26 link desc + next line', 'R', '- [O nas](https://mixturemarketing.pl/o-nas/): abonament\n- dziękujemy'],
  ['O27 cherokee capital A U+13AA', 'R', '- Strona ᎪBONAMENT/DZIEKUJEMY'],
  ['O28 greek capital ETA for H? n/a: cyr capital EN for H', 'R', '- Strona web-development/systemy-ai-aplikacje/'],
  ['O29 tag chars between letters', 'R', '- Strona abonament/dzie\u{E0020}kujemy'],
  ['O30 combining long overlay', 'R', '- Strona abonament/dzie̶kujemy'],
  ['P01 prose: abonament. Dziekujemy', 'A', '- Mamy abonament. Dziękujemy za zaufanie'],
  ['P02 heading Abonament + Dziekujemy line', 'A', '## Abonament\nDziękujemy za zaufanie'],
  ['P03 systemy AI, aplikacje', 'A', '- Budujemy systemy AI, aplikacje i strony'],
  ['P04 systemy AI oraz aplikacje', 'A', '- Systemy AI oraz aplikacje'],
  ['P05 abonament: dziekujemy', 'A', '- Abonament: dziękujemy, że jesteś z nami'],
  ['P06 link abonament + desc dziekujemy', 'A', '- [Abonament](https://mixturemarketing.pl/abonament/): dziękujemy za zaufanie'],
];
let R = 0, through = 0, ok = 0, fp = 0; const leaks = [], fps = [];
for (const [id, exp, ins] of [...forms, ...own]) {
  const text = base.replace(anchor, anchor + ins + '\n');
  const r = llmsReport(text, sm, { hiddenPaths: H });
  const why = r.problems.join(' | ').slice(0, 140);
  if (exp === 'R') { if (r.ok) { through++; leaks.push(id); } else R++; } else { if (r.ok) ok++; else { fp++; fps.push(id); } }
  const flag = exp === 'R' && r.ok ? 'GOT-THROUGH' : exp === 'A' && !r.ok ? 'TWIN-REFUSED' : 'ok';
  const hs = /ukrytej/.test(why) ? 'hidden-scan' : r.ok ? '' : 'grammar';
  console.log(`${id}\t${r.ok ? 'PASS' : 'REFUSED'}\t${flag}\t${hs}\t${why}`);
}
console.log(`TOTAL old=${forms.length} own=${own.length} refuse-forms=${R + through} refused=${R} got-through=${through} [${leaks.join(', ')}] allow-forms=${ok + fp} pass=${ok} false-refused=${fp} [${fps.join(', ')}]`);
