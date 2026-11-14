// MIX-1684: plain-node probe of the new H forms, twins, prose lines and skeleton expectations
// (same data as the MIX-1684 block in tests/seo/llmsTxt.test.ts). No vitest; used for fast mutant
// checks next to attack.mjs. Usage from the repo root: node .bieg/mix1684/probe.mjs . ; rc 1 = a failure.
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const WT = process.argv[2] ?? '.';
const { llmsReport, skeletonText, WILDCARD: W } = await import(
  pathToFileURL(path.join(WT, 'scripts/lib/llms.js')).href
);
const { prerenderOnlyRoutes: H } = await import(pathToFileURL(path.join(WT, 'routes.js')).href);
const BASE = 'https://mixturemarketing.pl';
const sm = `<urlset><url><loc>${BASE}/a/</loc></url></urlset>`;
const opts = { keyPaths: ['/a/'], hiddenPaths: H };
const base = `# T\n\n- [a](${BASE}/a/): opis\n`;
const AB = 'Strona ', AI = 'Nowość: ', ART = 'Artykuł: ';
const forms = [
  ['H01', AI, 'SYSTEMY-AI-APLIKAϹJE', 'SYSTEMY-AI-APLIϹACJE'],
  ['H02', AI, 'systemy-ai-aplikaϲje', 'systemy-ai-apliϲacje'],
  ['H03', AB, 'ABONAMΣNT/DZIEKUJEMY', 'ABONAMΣNT/CENNIK'],
  ['H04', AI, 'ΣYΣTEMY-AI-APLIKACJE', 'ΣYΣTEMY AI i APLIKACJE'],
  ['H05', AB, 'ABΩNAMENT/DZIEKUJEMY', 'ABΩNAMENT/CENNIK'],
  ['H06', ART, 'APLIKACJE-DEDYKOWANE-Z-AI-KIEDY-WAΓTO', 'APLIKACJE-DEDYKOWANE-Z-AI-KIEDY-WAΓ'],
  ['H07', AB, 'ABONAMENT/ДZIEKUJEMY', 'CENNIK/ДZIEKUJEMY'],
  ['H08', AB, 'ABONAMЄNT/DZIEKUJEMY', 'ABONAMЄNT/CENNIK'],
  ['H09', AB, 'abonarօent/dziekujemy', 'abonarօent/cennik'],
  ['H10', AB, 'abonament/cօziekujemy', 'cennik/cօziekujemy'],
  ['H11', AB, 'abonaօnent/dziekujemy', 'abonaօnent/cennik'],
  ['H12', ART, 'aplikacje-dedykowane-z-ai-kiedy-vօarto', 'aplikacje-dedykowane-z-ai-kiedy-vօato'],
  ['H13', AI, 'SYSTEMY-AI-APŁIKACJE', 'SYSTEMY AI i APŁIKACJE'],
  ['H14', AB, 'АВОNAМЕNТ/DZIEKUJEMY', 'АВОNAМЕNТ/CENNIK'],
  ['J01', AI, 'systemy-ai-\n> - aplikaϹje', 'systemy-ai-\n> - apliϹacje'],
];
const prose = [
  '- Zażółć gęślą jaźń: ĄĆĘŁŃÓŚŹŻ ąćęłńóśźż',
  '- Українською: ми створюємо сайти, системи штучного інтелекту та застосунки для бізнесу',
  '- По-русски: мы делаем сайты, системы искусственного интеллекта и приложения для бизнеса',
  '- Ελληνικά: κατασκευή ιστοσελίδων και εφαρμογών τεχνητής νοημοσύνης για επιχειρήσεις',
  '- ΣΥΣΤΗΜΑΤΑ ΤΕΧΝΗΤΗΣ ΝΟΗΜΟΣΥΝΗΣ ΓΙΑ ΕΠΙΧΕΙΡΗΣΕΙΣ',
  '- Auf Deutsch: Webentwicklung, Systeme für künstliche Intelligenz, Größe und Qualität',
];
const skel = [
  ['ΑΒΩ Σ Ϲϲ ΓДЄ', `abo ${W} cc ${W}${W}${W}`],
  ['ŁÓĐƐ ßẞ', `iod${W} ssss`],
  ['АВЕКМНОРСТУХ', 'abekmhopctyx'],
  ['a|b @c 3 ١', `a/b /c 3 ${W}`],
];
let bad = 0;
const say = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`);
};
for (const [id, pre, atk, twin] of forms) {
  const r = llmsReport(`${base}- ${pre}${atk}\n`, sm, opts);
  say(!r.ok && r.problems.length === 1 && /ukrytej/.test(r.problems[0]), `${id} refused: ${r.problems.join(' | ').slice(0, 120)}`);
  const t = llmsReport(`${base}- ${pre}${twin}\n`, sm, opts);
  say(t.ok, `${id}t twin passes ${t.problems.join(' | ').slice(0, 100)}`);
}
for (const p of prose) {
  const r = llmsReport(`${base}${p}\n`, sm, opts);
  say(r.ok, `prose passes: ${p.slice(2, 16)} ${r.problems.join(' | ').slice(0, 100)}`);
}
for (const [inp, exp] of skel) {
  const got = skeletonText(inp);
  say(got === exp, `skeleton ${JSON.stringify(got)} == ${JSON.stringify(exp)}`);
}
console.log(`PROBE TOTAL checks=${forms.length * 2 + prose.length + skel.length} failed=${bad}`);
process.exit(bad ? 1 : 0);
