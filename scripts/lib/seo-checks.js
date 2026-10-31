// Kontrole SEO na zbudowanym dist/ (MIX-781, S6/M11): długość <title>, atrybut alt na
// każdym <img>, lastmod w sitemap.xml. Czyste funkcje — testy: tests/seo/*.test.ts.
// Uruchamia je scripts/seo-gate.js (część `npm run build`: czerwony build zamiast cichej regresji).
import fs from 'node:fs';
import path from 'node:path';
import { parse, html } from 'parse5';
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

/**
 * HTML → drzewo parse5 (parser zgodny ze specyfikacją, BEZ CSSOM). Wcześniej JSDOM parsował
 * każdy wstawiony przy prerenderze blok <style> (setki kB CSS) dwa razy na stronę, więc
 * /abonament/ kosztował 107 s CPU, a cała bramka dziesiątki minut. Teraz jeden przebieg na
 * stronę. scriptingEnabled: false = zawartość <noscript> też jest sprawdzana.
 */
function parseHtml(source) {
  return parse(source, { scriptingEnabled: false });
}

const isHtmlElement = (node, tag) => node.tagName === tag && node.namespaceURI === html.NS.HTML;

/** Elementy w kolejności dokumentu (także zawartość <template>). */
function* elementsInOrder(root) {
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (node.tagName) yield node;
    const kids = [...(node.childNodes ?? []), ...(node.content ? [node.content] : [])];
    for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i]);
  }
}

const attr = (node, name) => node.attrs.find((a) => a.name === name);

const textOf = (node) =>
  (node.childNodes ?? []).map((n) => (n.nodeName === '#text' ? n.value : textOf(n))).join('');

/** Obrazy bez atrybutu alt (alt="" = dekoracja i jest dozwolone, brak atrybutu nie). */
export function imgsWithoutAlt(source, route = '') {
  const out = [];
  for (const el of elementsInOrder(parseHtml(source))) {
    if (isHtmlElement(el, 'img') && !attr(el, 'alt')) {
      out.push(`${route}: <img> bez atrybutu alt (src="${attr(el, 'src')?.value ?? ''}")`);
    }
  }
  return out;
}

/** <title> z <head> (pierwszy w kolejności dokumentu; puste <title/> z SVG wykresów pomijamy). */
export function headTitle(source) {
  const elements = [...elementsInOrder(parseHtml(source))];
  const head = elements.find((el) => isHtmlElement(el, 'head'));
  if (!head) return '';
  const title = [...elementsInOrder(head)].find((el) => isHtmlElement(el, 'title'));
  return title ? textOf(title) : '';
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
  // Pusty dist (zły katalog, nieudany prerender) to NIE jest sukces: brak stron = odmowa.
  if (files.length === 0) problems.push(`${distDir}: 0 stron index.html (nic do sprawdzenia)`);
  for (const file of files) {
    const route = `/${path.relative(distDir, path.dirname(file)).split(path.sep).join('/')}`
      .replace(/\/+$/, '')
      .concat('/')
      .replace(/^\/\/$/, '/');
    const source = fs.readFileSync(file, 'utf8');
    problems.push(...titleProblems([{ route, title: headTitle(source) }]));
    problems.push(...imgsWithoutAlt(source, route));
  }
  const sitemapPath = path.join(distDir, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) problems.push('dist/sitemap.xml: brak pliku');
  else {
    const entries = parseSitemap(fs.readFileSync(sitemapPath, 'utf8'));
    if (entries.length === 0) problems.push('dist/sitemap.xml: 0 adresów <url>');
    problems.push(...lastmodProblems(entries, now));
  }
  return { pages: files.length, problems };
}
