// Kontrole SEO na zbudowanym dist/ (MIX-781, S6/M11): długość <title>, atrybut alt na
// każdym <img>, lastmod w sitemap.xml. Czyste funkcje — testy: tests/seo/*.test.ts.
// Uruchamia je scripts/seo-gate.js (część `npm run build`: czerwony build zamiast cichej regresji).
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import { lastmodProblems, parseSitemap } from './sitemap.js';

/** Maks. długość <title> w znakach (powyżej Google ucina tytuł w wynikach). */
export const TITLE_MAX = 60;

/**
 * @param {{ route: string, title: string }[]} pages
 * @returns {string[]} problemy
 */
export function titleProblems(pages, max = TITLE_MAX) {
  const out = [];
  for (const { route, title } of pages) {
    const t = (title || '').trim();
    if (!t) out.push(`${route}: brak <title>`);
    else if (t.length > max) out.push(`${route}: <title> ma ${t.length} znaków (> ${max}): "${t}"`);
  }
  return out;
}

/** Obrazy bez atrybutu alt (alt="" = dekoracja i jest dozwolone, brak atrybutu nie). */
export function imgsWithoutAlt(html, route = '') {
  const doc = new JSDOM(html).window.document;
  return [...doc.querySelectorAll('img')]
    .filter((img) => !img.hasAttribute('alt'))
    .map((img) => `${route}: <img> bez atrybutu alt (src="${img.getAttribute('src') ?? ''}")`);
}

/** <title> z <head> (pierwszy w kolejności dokumentu; puste <title/> z SVG wykresów pomijamy). */
export function headTitle(html) {
  const doc = new JSDOM(html).window.document;
  return doc.head.querySelector('title')?.textContent ?? '';
}

function htmlFiles(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) htmlFiles(p, acc);
    else if (name === 'index.html') acc.push(p);
  }
  return acc;
}

/** Pełna kontrola dist/: wszystkie prerenderowane strony + sitemap.xml. */
export function auditDist(distDir, now = new Date()) {
  const problems = [];
  const files = htmlFiles(distDir);
  for (const file of files) {
    const route = `/${path.relative(distDir, path.dirname(file)).split(path.sep).join('/')}`
      .replace(/\/+$/, '')
      .concat('/')
      .replace(/^\/\/$/, '/');
    const html = fs.readFileSync(file, 'utf8');
    problems.push(...titleProblems([{ route, title: headTitle(html) }]));
    problems.push(...imgsWithoutAlt(html, route));
  }
  const sitemapPath = path.join(distDir, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) problems.push('dist/sitemap.xml: brak pliku');
  else problems.push(...lastmodProblems(parseSitemap(fs.readFileSync(sitemapPath, 'utf8')), now));
  return { pages: files.length, problems };
}
