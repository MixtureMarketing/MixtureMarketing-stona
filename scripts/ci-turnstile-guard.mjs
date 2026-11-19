#!/usr/bin/env node
// MIX-1934: strażnik wgrania (krok CI tuż przed `wrangler pages deploy`). Fail-closed: każda
// odmowa = rc 1 z jedną linią powodu na stderr. Reguły: scripts/lib/turnstileKeyGuard.mjs.
//
//   node scripts/ci-turnstile-guard.mjs deploy --target prod|preview --branch <gałąź wgrania>
//        --project-json <plik z odpowiedzią API Cloudflare GET /pages/projects/<nazwa>> --dist <katalog>
//
// Środowisko Cloudflare (Production/Preview) wynika z `result.production_branch` projektu Pages,
// nie z nazwy gałęzi w git: gałąź wgrania równa production_branch = Production.
import fs from 'node:fs';
import path from 'node:path';
import { checkDeploy } from './lib/turnstileKeyGuard.mjs';

const TEXT_EXT = new Set(['.html', '.js', '.mjs', '.json', '.txt', '.xml', '.css', '.map']);

function fail(msg) {
  process.stderr.write(`turnstile-guard: ODMOWA: ${msg}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 2) {
    const k = argv[i];
    const v = argv[i + 1];
    if (!k?.startsWith('--') || v === undefined) fail(`zły argument '${k ?? ''}'`);
    out[k.slice(2)] = v;
  }
  return out;
}

function readTexts(dir) {
  const texts = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && TEXT_EXT.has(path.extname(e.name).toLowerCase()))
        texts.push(fs.readFileSync(p, 'utf8'));
    }
  };
  walk(dir);
  return texts;
}

export function main(argv) {
  const [cmd, ...rest] = argv;
  if (cmd !== 'deploy') fail(`nieznane polecenie '${cmd ?? ''}' (deploy)`);
  const a = parseArgs(rest);
  let productionBranch;
  try {
    const j = JSON.parse(fs.readFileSync(a['project-json'] ?? '', 'utf8'));
    if (j?.success !== true) fail('odpowiedź API Cloudflare bez success=true');
    productionBranch = j?.result?.production_branch;
  } catch (e) {
    fail(`nieczytelna odpowiedź API Cloudflare (${e instanceof Error ? e.name : 'błąd'})`);
  }
  let distTexts;
  try {
    distTexts = readTexts(a.dist ?? '');
  } catch {
    fail(`nieczytelny katalog dist '${a.dist ?? ''}'`);
  }
  const r = checkDeploy({ target: a.target, branch: a.branch, productionBranch, distTexts });
  if (!r.ok) {
    process.stderr.write(`${r.reason}\n`);
    process.exit(1);
  }
  process.stdout.write(`turnstile-guard: OK: cel ${a.target}, gałąź ${a.branch}, środowisko ${r.cfEnv}\n`);
}

main(process.argv.slice(2));
