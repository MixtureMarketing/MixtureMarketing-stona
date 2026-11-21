// Wspólny szablon wszystkich maili strony (MIX-1866). Bez handlerów → nie tworzy trasy.
//
// Każdy mail = ta sama oprawa: nagłówek z logo, treść z bloków, opcjonalny przycisk,
// stopka z danymi firmy (config/siteIdentity.ts, część config/site.ts bez Vite) i linkiem do polityki prywatności.
// Zawsze dwie wersje: HTML (tabele, 600 px, styl inline – Gmail, Outlook, Apple Mail)
// i text/plain z tej samej treści.
//
// Bezpieczeństwo: KAŻDY tekst z bloków jest escapowany tutaj (escapeHtml). Wywołujący
// podaje surowe dane z formularzy i nie składa HTML sam. Linki tylko http(s) –
// inny schemat (javascript:, data:) zostaje zwykłym tekstem.

import { SITE_IDENTITY as SITE_CONFIG } from '../../../config/siteIdentity';
import { escapeHtml } from './security';

/** Fragment akapitu: zwykły tekst, pogrubienie, kod albo link. */
export type EmailInline = string | { b: string } | { code: string } | { a: string; href: string };

export type EmailBlock =
  | { p: string | EmailInline[] }
  | { quote: string }
  | { rows: Array<[string, unknown]> }
  | { button: string; href: string }
  | { hr: true };

export interface EmailContent {
  /** Temat – trafia też do <title>. */
  subject: string;
  /** Krótki tekst podglądu w skrzynce (ukryty w treści). */
  preheader?: string;
  heading?: string;
  blocks: EmailBlock[];
  /** Mail do zespołu: dopisek w stopce, że to automatyczne powiadomienie. */
  note?: string;
}

export interface RenderedEmail {
  html: string;
  text: string;
}

const DOMAIN = SITE_CONFIG.domain;
export const EMAIL_LOGO_URL = `${DOMAIN}/assets/email/logo-mixture-white.png`;
export const EMAIL_PRIVACY_URL = `${DOMAIN}/privacy-policy/`;

// Kolory i krój z DESIGN.md.
const C = {
  deepDark: '#0b1120',
  sceneMid: '#0d1529',
  dark: '#213261',
  secondary: '#3f3d91',
  accentDark: '#2d739a',
  primary: '#61b6de',
  inkMuted: '#374151',
  inkSubtle: '#4b5563',
  hairline: '#f3f4f6',
  lightGray: '#f9fafb',
};
const FONT = "Manrope,'Segoe UI',Helvetica,Arial,sans-serif";

/** Tylko http(s); wszystko inne = brak linku. */
export function safeHref(href: unknown): string | null {
  const s = String(href ?? '').trim();
  return /^https?:\/\//i.test(s) ? s : null;
}

const esc = (s: unknown) => escapeHtml(s);
const escMulti = (s: unknown) => escapeHtml(s).replace(/\r?\n/g, '<br>');
const oneLine = (s: unknown) => String(s ?? '').replace(/[\r\n]+/g, ' ');

function inlineHtml(part: EmailInline): string {
  if (typeof part === 'string') return escMulti(part);
  if ('b' in part)
    return `<strong style="color:${C.dark}" class="mm-strong">${escMulti(part.b)}</strong>`;
  if ('code' in part)
    return `<code style="font-family:Consolas,Menlo,monospace;background:${C.hairline};padding:1px 4px;border-radius:3px" class="mm-code">${esc(part.code)}</code>`;
  const href = safeHref(part.href);
  // href zawsze ostatnim atrybutem: po jego cudzysłowie od razu ">".
  return href
    ? `<a class="mm-link" style="color:${C.accentDark};text-decoration:underline" href="${esc(href)}">${esc(part.a)}</a>`
    : esc(part.a);
}

function inlineText(part: EmailInline): string {
  if (typeof part === 'string') return part;
  if ('b' in part) return part.b;
  if ('code' in part) return part.code;
  const href = safeHref(part.href);
  return href && href !== part.a ? `${part.a} (${href})` : part.a;
}

const P_STYLE = `margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.6;color:${C.inkMuted}`;

function blockHtml(block: EmailBlock): string {
  if ('p' in block) {
    const parts = typeof block.p === 'string' ? [block.p] : block.p;
    return `<p class="mm-text" style="${P_STYLE}">${parts.map(inlineHtml).join('')}</p>`;
  }
  if ('quote' in block) {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px"><tr><td class="mm-quote" style="border-left:4px solid ${C.primary};background:${C.lightGray};padding:12px 16px;font-family:${FONT};font-size:16px;line-height:1.6;color:${C.inkMuted}">${escMulti(block.quote)}</td></tr></table>`;
  }
  if ('rows' in block) {
    const cell = `padding:8px 12px;border-bottom:1px solid ${C.hairline};font-family:${FONT};font-size:14px;line-height:1.5;vertical-align:top`;
    const rows = block.rows
      .map(
        ([k, v]) =>
          `<tr><td class="mm-text" style="${cell};font-weight:700;color:${C.dark};width:38%">${esc(k)}</td><td class="mm-text" style="${cell};color:${C.inkMuted};word-break:break-word">${escMulti(v)}</td></tr>`,
      )
      .join('');
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;border-collapse:collapse">${rows}</table>`;
  }
  if ('button' in block) {
    const href = safeHref(block.href);
    if (!href) return `<p class="mm-text" style="${P_STYLE}">${esc(block.button)}</p>`;
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px"><tr><td align="center" bgcolor="${C.secondary}" style="border-radius:8px;background:${C.secondary}"><a class="mm-button" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:16px;font-weight:700;line-height:1.2;color:#ffffff;text-decoration:none;border-radius:8px" href="${esc(href)}">${esc(block.button)}</a></td></tr></table>`;
  }
  return `<hr class="mm-hr" style="border:0;border-top:1px solid ${C.hairline};margin:24px 0">`;
}

function blockText(block: EmailBlock): string {
  if ('p' in block)
    return (typeof block.p === 'string' ? [block.p] : block.p).map(inlineText).join('');
  if ('quote' in block)
    return String(block.quote ?? '')
      .split(/\r?\n/)
      .map((l) => `> ${l}`)
      .join('\n');
  if ('rows' in block) return block.rows.map(([k, v]) => `${k}: ${String(v ?? '')}`).join('\n');
  if ('button' in block) {
    const href = safeHref(block.href);
    return href ? `${block.button}: ${href}` : block.button;
  }
  return '----';
}

function footerLines(): string[] {
  const c = SITE_CONFIG.contact;
  return [
    SITE_CONFIG.companyName,
    `${c.address.street}, ${c.address.postalCode} ${c.address.city}`,
    `NIP ${c.vatID.replace(/^PL/, '')} · KRS ${c.krs} · REGON ${c.regon}`,
    `tel. ${c.phone}`,
  ];
}

const DARK_CSS = `
:root{color-scheme:light dark;supported-color-schemes:light dark}
@media (prefers-color-scheme: dark){
.mm-body,.mm-bg{background:${C.deepDark}!important}
.mm-card{background:${C.sceneMid}!important}
.mm-text,.mm-heading,.mm-strong,.mm-quote{color:#f3f4f6!important}
.mm-quote{background:${C.deepDark}!important}
.mm-code{background:${C.deepDark}!important;color:#f3f4f6!important}
.mm-link,.mm-foot a{color:${C.primary}!important}
.mm-foot{color:#cbd5e1!important}
.mm-hr{border-top-color:#1e293b!important}
}
[data-ogsc] .mm-text,[data-ogsc] .mm-heading,[data-ogsc] .mm-strong,[data-ogsc] .mm-quote{color:#f3f4f6!important}
[data-ogsb] .mm-card{background:${C.sceneMid}!important}
[data-ogsb] .mm-body,[data-ogsb] .mm-bg{background:${C.deepDark}!important}
[data-ogsc] .mm-link{color:${C.primary}!important}
@media only screen and (max-width:620px){
.mm-pad{padding-left:20px!important;padding-right:20px!important}
}`;

/** Składa mail w oprawie strony: { html, text } do payloadu sendEmail. */
export function renderEmail(content: EmailContent): RenderedEmail {
  const heading = content.heading
    ? `<h1 class="mm-heading" style="margin:0 0 20px;font-family:${FONT};font-size:24px;line-height:1.3;font-weight:800;color:${C.dark}">${esc(content.heading)}</h1>`
    : '';
  const body = content.blocks.map(blockHtml).join('\n');
  const foot = footerLines().map(esc).join('<br>');
  const note = content.note
    ? `<p style="margin:0 0 12px;font-family:${FONT};font-size:12px;line-height:1.5" class="mm-foot">${esc(content.note)}</p>`
    : '';
  const preheader = content.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:transparent">${esc(oneLine(content.preheader))}</div>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="pl" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(oneLine(content.subject))}</title>
<style>${DARK_CSS}</style>
</head>
<body class="mm-body" style="margin:0;padding:0;background:${C.hairline};-webkit-text-size-adjust:100%">
${preheader}
<table role="presentation" class="mm-bg" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.hairline}" style="background:${C.hairline}">
<tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">
<tr><td class="mm-pad" bgcolor="${C.deepDark}" style="background:${C.deepDark};padding:24px 32px;border-radius:12px 12px 0 0">
<a style="text-decoration:none" href="${esc(DOMAIN)}"><img src="${esc(EMAIL_LOGO_URL)}" width="150" height="59" alt="Mixture Marketing" style="display:block;border:0;outline:none;width:150px;height:auto;font-family:${FONT};font-size:20px;font-weight:800;color:#ffffff"></a>
</td></tr>
<tr><td class="mm-card mm-pad" bgcolor="#ffffff" style="background:#ffffff;padding:32px">
${heading}
${body}
</td></tr>
<tr><td class="mm-card mm-pad mm-foot" bgcolor="#ffffff" style="background:#ffffff;padding:0 32px 28px;border-radius:0 0 12px 12px;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.inkSubtle}">
<hr class="mm-hr" style="border:0;border-top:1px solid ${C.hairline};margin:0 0 16px">
${note}
<p style="margin:0 0 8px;font-family:${FONT};font-size:12px;line-height:1.6" class="mm-foot">${foot}</p>
<p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.6" class="mm-foot"><a style="color:${C.accentDark};text-decoration:underline" href="${esc(DOMAIN)}">mixturemarketing.pl</a> · <a style="color:${C.accentDark};text-decoration:underline" href="${esc(EMAIL_PRIVACY_URL)}">Polityka prywatności</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const textParts = [
    content.heading ?? '',
    ...content.blocks.map(blockText),
    '--',
    ...(content.note ? [content.note] : []),
    footerLines().join('\n'),
    `${DOMAIN.replace(/^https?:\/\//, '')} · Polityka prywatności: ${EMAIL_PRIVACY_URL}`,
  ].filter((s) => s !== '');
  const text = textParts.join('\n\n').replace(/\n{3,}/g, '\n\n');

  return { html, text };
}
