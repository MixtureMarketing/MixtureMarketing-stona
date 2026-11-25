// Treść wszystkich maili strony w jednym miejscu (MIX-1866). Bez handlerów → nie tworzy trasy.
//
// Endpointy biorą stąd { subject, html, text } i dokładają tylko from/to/reply_to.
// Treść merytoryczna przeniesiona 1:1 z dawnych szablonów w endpointach; zmienił się
// wygląd (wspólna oprawa z emailLayout.ts) i doszła wersja text/plain.
// Wszystkie argumenty to SUROWE dane (z formularzy, D1) – escapuje emailLayout.

import { renderEmail, type EmailBlock, type EmailInline } from './emailLayout';

export interface EmailMessage {
  subject: string;
  html: string;
  text: string;
}

const PORTAL_URL = 'https://mixturemarketing.pl/portal';
const TEAM_NOTE = 'Mixture Marketing — automatyczne powiadomienie';
const subjectLine = (s: unknown) => String(s ?? '').replace(/[\r\n]+/g, ' ');

function build(
  subject: string,
  blocks: EmailBlock[],
  opts: { heading?: string; preheader?: string; note?: string } = {},
): EmailMessage {
  return { subject, ...renderEmail({ subject, blocks, ...opts }) };
}

// ── contact-submit.ts (do zespołu) ─────────────────────────────────────────────

const LEAD_SKIP = ['captcha_token', 'website_verify', 'id'];

/** Wiersze tabeli leada: niepuste pola proste, bez tokenów i id (jak dawny leadEmailHtml). */
export function leadRows(
  lead: Record<string, unknown>,
  details: Record<string, unknown> = {},
): Array<[string, unknown]> {
  return Object.entries({ ...lead, ...details }).filter(
    ([k, v]) => v && !LEAD_SKIP.includes(k) && typeof v !== 'object',
  );
}

/** Wspólne ciało 3 powiadomień o leadzie (nowy, aktualizacja kroku 3, notyfikacja). */
export function leadNotificationEmail(
  subject: string,
  lead: Record<string, unknown> & { id?: unknown },
  details: Record<string, unknown> = {},
): EmailMessage {
  const rows = leadRows(lead, details);
  const blocks: EmailBlock[] = [{ p: ['Lead ID: ', { code: String(lead.id ?? '') }] }];
  if (rows.length) blocks.push({ rows });
  return build(subject, blocks, {
    heading: 'Nowy lead z formularza',
    preheader: `Lead ID: ${String(lead.id ?? '')}`,
    note: TEAM_NOTE,
  });
}

export function newLeadSubject(name: unknown, serviceInterest: unknown): string {
  return subjectLine(`🆕 Nowy lead — ${name} (${serviceInterest || 'general'})`);
}

export function leadUpdateSubject(id: unknown, step: unknown): string {
  return subjectLine(`📝 Aktualizacja leada ${id} (step ${step})`);
}

const NOTIFICATION_SUBJECTS: Record<string, string> = {
  success: '✅ Lead skonwertowany',
  abandoned_step_1: '⚠️ Lead porzucony (krok 1)',
  abandoned_step_2: '⚠️ Lead porzucony (krok 2)',
};

export function leadNotificationSubject(type: string, id: unknown): string {
  return subjectLine(`${NOTIFICATION_SUBJECTS[type] || 'Lead notyfikacja'} — ID ${id}`);
}

// ── audit/capture-lead.ts ─────────────────────────────────────────────────────

/** Do klienta: raport PDF z audytu (załącznik dokłada endpoint). */
export function auditReportEmail(url: string): EmailMessage {
  return build(
    'Twój raport z audytu strony — Mixture Marketing',
    [
      { p: ['W załączniku znajdziesz raport PDF z pomiarów strony ', { a: url, href: url }, '.'] },
      { p: 'Masz pytania o wyniki? Po prostu odpowiedz na tego maila.' },
      { p: 'Zespół Mixture Marketing' },
    ],
    {
      heading: 'Dziękujemy za skorzystanie z audytu 360!',
      preheader: 'Raport PDF z audytu Twojej strony jest w załączniku.',
    },
  );
}

/** Do zespołu: lead z audytu 360. */
export function auditLeadTeamEmail(
  email: string,
  url: string,
  score: number | null | undefined,
  hasPdf: boolean,
): EmailMessage {
  const p: EmailInline[] = [
    'Użytkownik ',
    { b: email },
    ' ukończył audyt strony ',
    { a: url, href: url },
  ];
  if (typeof score === 'number') p.push(' (wynik: ', { b: `${score}/100` }, ')');
  p.push(`.${hasPdf ? ' Raport PDF w załączniku.' : ''}`);
  return build(subjectLine(`Nowy lead z audytu 360 — ${email}`), [{ p }], { note: TEAM_NOTE });
}

// ── estimation/public-quote.ts ────────────────────────────────────────────────

/** Do klienta: wstępne widełki z kalkulatora. */
export function quoteClientEmail(range: string): EmailMessage {
  return build(
    'Twoja wstępna wycena — Mixture Marketing',
    [
      { p: ['Wstępny orientacyjny koszt Twojego projektu: ', { b: range }, '.'] },
      {
        p: 'To zgrubne widełki z kalkulatora — skontaktujemy się, by doprecyzować zakres i podać dokładną ofertę.',
      },
    ],
    { heading: 'Dziękujemy!', preheader: `Wstępny orientacyjny koszt: ${range}` },
  );
}

/** Do zespołu: nowa wycena z kalkulatora. */
export function quoteTeamEmail(email: string, range: string): EmailMessage {
  return build(
    subjectLine(`🧮 Nowa wycena z kalkulatora — ${email}`),
    [
      {
        p: ['Klient ', { b: email }, ` policzył wycenę: ${range}. Draft czeka w panelu „Wyceny".`],
      },
    ],
    { note: TEAM_NOTE },
  );
}

/** Do zespołu: alert budżetu kalkulatora (linia bez danych osobowych). */
export function quoteBudgetAlertEmail(line: string): EmailMessage {
  return build(
    subjectLine(`Kalkulator: ${line}`),
    [{ p: `Kalkulator wyceny: ${line} (doba UTC).` }],
    {
      note: TEAM_NOTE,
    },
  );
}

// ── auth/send_magic_link.ts ───────────────────────────────────────────────────

export function magicLinkEmail(name: unknown, loginUrl: string): EmailMessage {
  return build(
    'Twój magiczny link do Portalu Klienta',
    [
      { p: 'Kliknij w poniższy przycisk, aby zalogować się do swojego panelu klienta:' },
      { button: 'Zaloguj się', href: loginUrl },
      { p: 'Link jest ważny przez 1 godzinę.' },
      { p: 'Jeśli to nie Ty prosiłeś o ten link, zignoruj tę wiadomość.' },
    ],
    {
      heading: `Witaj ${String(name ?? '')}!`,
      preheader: 'Link logowania do Portalu Klienta (ważny 1 godzinę).',
    },
  );
}

// ── portal/send_message.ts (do zespołu) ───────────────────────────────────────

export function portalMessageTeamEmail(name: unknown, content: string): EmailMessage {
  return build(
    subjectLine(`Nowa wiadomość od ${String(name ?? '')}`),
    [
      { p: ['Użytkownik ', { b: String(name ?? '') }, ' wysłał nową wiadomość:'] },
      { quote: content },
    ],
    { note: TEAM_NOTE },
  );
}

// ── admin/reply_lead.ts ───────────────────────────────────────────────────────

export function leadReplyEmail(message: string): EmailMessage {
  return build('Odpowiedź na Twoje zapytanie - Mixture Marketing', [
    { p: 'Witaj!' },
    { p: message },
    { hr: true },
    { p: 'Z poważaniem,\nJakub Niedziela\nMixture Marketing' },
  ]);
}

// ── admin/convert_lead.ts ─────────────────────────────────────────────────────

export function welcomePortalEmail(name: unknown): EmailMessage {
  return build(
    'Twoje konto w portalu Mixture Marketing jest gotowe!',
    [
      { p: 'Z radością informujemy, że utworzyliśmy dla Ciebie konto w naszym portalu klienta.' },
      {
        p: 'Możesz się tam zalogować w każdej chwili, używając swojego adresu email, aby sprawdzić postępy prac lub pobrać dokumenty.',
      },
      { button: 'Przejdź do Portalu', href: PORTAL_URL },
    ],
    { heading: `Witaj ${String(name ?? '')}!` },
  );
}

// ── admin/admin_reply_chat.ts ─────────────────────────────────────────────────

export function chatReplyClientEmail(name: unknown, content: string): EmailMessage {
  return build('Nowa wiadomość w Twoim panelu klienta', [
    { p: `Witaj ${String(name ?? '')}!` },
    { p: 'Otrzymałeś nową wiadomość w panelu klienta:' },
    { quote: content },
    { button: 'Zaloguj się, aby odpowiedzieć', href: PORTAL_URL },
  ]);
}
