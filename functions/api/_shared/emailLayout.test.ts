// MIX-1866: wspólny szablon maili – oprawa, treść każdego maila, escapowanie, podpięcie 8 endpointów.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { EMAIL_LOGO_URL, EMAIL_PRIVACY_URL, renderEmail, safeHref } from './emailLayout';
import * as M from './emailMessages';

const LEAD = {
  id: 'lead-1',
  name: 'Anna Przykładowa',
  email: 'anna@example.com',
  service_interest: 'strony-www',
  captcha_token: 'TAJNE',
  website_verify: '',
  privacy: true,
};

/** 13 wariantów z 8 plików: [plik endpointu, nazwa, mail]. */
const ALL: Array<[string, string, M.EmailMessage]> = [
  [
    'contact-submit.ts',
    'nowy lead',
    M.leadNotificationEmail(M.newLeadSubject(LEAD.name, LEAD.service_interest), LEAD),
  ],
  [
    'contact-submit.ts',
    'aktualizacja',
    M.leadNotificationEmail(M.leadUpdateSubject('lead-1', 3), { id: 'lead-1' }, { budget: '10k' }),
  ],
  [
    'contact-submit.ts',
    'notyfikacja',
    M.leadNotificationEmail(M.leadNotificationSubject('success', 'lead-1'), { id: 'lead-1' }),
  ],
  ['audit/capture-lead.ts', 'audyt klient', M.auditReportEmail('https://firma.pl/')],
  [
    'audit/capture-lead.ts',
    'audyt zespół',
    M.auditLeadTeamEmail('anna@example.com', 'https://firma.pl/', 87, true),
  ],
  ['estimation/public-quote.ts', 'wycena klient', M.quoteClientEmail('8000–12000 zł')],
  [
    'estimation/public-quote.ts',
    'wycena zespół',
    M.quoteTeamEmail('anna@example.com', '8000–12000 zł'),
  ],
  ['estimation/public-quote.ts', 'alert budżetu', M.quoteBudgetAlertEmail('budżet 80% n=160/200')],
  [
    'auth/send_magic_link.ts',
    'magiczny link',
    M.magicLinkEmail('Anna', 'https://mixturemarketing.pl/portal/verify?token=abc'),
  ],
  [
    'portal/send_message.ts',
    'wiadomość portal',
    M.portalMessageTeamEmail('Anna', 'Linia 1\nLinia 2'),
  ],
  ['admin/reply_lead.ts', 'odpowiedź', M.leadReplyEmail('Dziękujemy.\nWycena w piątek.')],
  ['admin/convert_lead.ts', 'konto', M.welcomePortalEmail('Anna')],
  ['admin/admin_reply_chat.ts', 'czat klient', M.chatReplyClientEmail('Anna', 'Linia 1\nLinia 2')],
];

const FOOTER_TEXT =
  [
    'Mixture Marketing Sp. z o.o.',
    'Al. Józefa Piłsudskiego 17 / 4, 35-074 Rzeszów',
    'NIP 5170435774 · KRS 0001034514 · REGON 525228202',
    'tel. +48 794 443 551',
  ].join('\n') +
  '\n\nmixturemarketing.pl · Polityka prywatności: https://mixturemarketing.pl/privacy-policy/';
const TEAM = 'Mixture Marketing — automatyczne powiadomienie';

/** Oczekiwana wersja text/plain (temat + treść) – treść merytoryczna dawnych szablonów. */
const EXPECTED_TEXT: Record<string, [string, string, string?]> = {
  'nowy lead': [
    '🆕 Nowy lead — Anna Przykładowa (strony-www)',
    'Nowy lead z formularza\n\nLead ID: lead-1\n\nname: Anna Przykładowa\nemail: anna@example.com\nservice_interest: strony-www\nprivacy: true',
    TEAM,
  ],
  aktualizacja: [
    '📝 Aktualizacja leada lead-1 (step 3)',
    'Nowy lead z formularza\n\nLead ID: lead-1\n\nbudget: 10k',
    TEAM,
  ],
  notyfikacja: [
    '✅ Lead skonwertowany — ID lead-1',
    'Nowy lead z formularza\n\nLead ID: lead-1',
    TEAM,
  ],
  'audyt klient': [
    'Twój raport z audytu strony — Mixture Marketing',
    'Dziękujemy za skorzystanie z audytu 360!\n\nW załączniku znajdziesz raport PDF z pomiarów strony https://firma.pl/.\n\nMasz pytania o wyniki? Po prostu odpowiedz na tego maila.\n\nZespół Mixture Marketing',
  ],
  'audyt zespół': [
    'Nowy lead z audytu 360 — anna@example.com',
    'Użytkownik anna@example.com ukończył audyt strony https://firma.pl/ (wynik: 87/100). Raport PDF w załączniku.',
    TEAM,
  ],
  'wycena klient': [
    'Twoja wstępna wycena — Mixture Marketing',
    'Dziękujemy!\n\nWstępny orientacyjny koszt Twojego projektu: 8000–12000 zł.\n\nTo zgrubne widełki z kalkulatora — skontaktujemy się, by doprecyzować zakres i podać dokładną ofertę.',
  ],
  'wycena zespół': [
    '🧮 Nowa wycena z kalkulatora — anna@example.com',
    'Klient anna@example.com policzył wycenę: 8000–12000 zł. Draft czeka w panelu „Wyceny".',
    TEAM,
  ],
  'alert budżetu': [
    'Kalkulator: budżet 80% n=160/200',
    'Kalkulator wyceny: budżet 80% n=160/200 (doba UTC).',
    TEAM,
  ],
  'magiczny link': [
    'Twój magiczny link do Portalu Klienta',
    'Witaj Anna!\n\nKliknij w poniższy przycisk, aby zalogować się do swojego panelu klienta:\n\nZaloguj się: https://mixturemarketing.pl/portal/verify?token=abc\n\nLink jest ważny przez 1 godzinę.\n\nJeśli to nie Ty prosiłeś o ten link, zignoruj tę wiadomość.',
  ],
  'wiadomość portal': [
    'Nowa wiadomość od Anna',
    'Użytkownik Anna wysłał nową wiadomość:\n\n> Linia 1\n> Linia 2',
    TEAM,
  ],
  odpowiedź: [
    'Odpowiedź na Twoje zapytanie - Mixture Marketing',
    'Witaj!\n\nDziękujemy.\nWycena w piątek.\n\n----\n\nZ poważaniem,\nJakub Niedziela\nMixture Marketing',
  ],
  konto: [
    'Twoje konto w portalu Mixture Marketing jest gotowe!',
    'Witaj Anna!\n\nZ radością informujemy, że utworzyliśmy dla Ciebie konto w naszym portalu klienta.\n\nMożesz się tam zalogować w każdej chwili, używając swojego adresu email, aby sprawdzić postępy prac lub pobrać dokumenty.\n\nPrzejdź do Portalu: https://mixturemarketing.pl/portal',
  ],
  'czat klient': [
    'Nowa wiadomość w Twoim panelu klienta',
    'Witaj Anna!\n\nOtrzymałeś nową wiadomość w panelu klienta:\n\n> Linia 1\n> Linia 2\n\nZaloguj się, aby odpowiedzieć: https://mixturemarketing.pl/portal',
  ],
};

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

describe('każdy z 13 maili (8 endpointów) idzie przez wspólny szablon', () => {
  it.each(ALL)('%s – %s: temat i text/plain jak w dawnej treści', (_f, name, mail) => {
    const [subject, body, note] = EXPECTED_TEXT[name];
    expect(mail.subject).toBe(subject);
    expect(mail.text).toBe(`${body}\n\n--\n\n${note ? `${note}\n\n` : ''}${FOOTER_TEXT}`);
  });

  it.each(ALL)('%s – %s: oprawa (logo, 600 px, tryb ciemny, stopka)', (_f, _n, mail) => {
    const doc = parse(mail.html);
    const logo = doc.querySelector('img');
    expect(logo?.getAttribute('src')).toBe(EMAIL_LOGO_URL);
    expect(logo?.getAttribute('alt')).toBe('Mixture Marketing');
    expect(doc.querySelector('table[width="600"]')).not.toBeNull();
    expect(mail.html).toContain('max-width:600px');
    expect(doc.querySelector('meta[name="color-scheme"]')?.getAttribute('content')).toBe(
      'light dark',
    );
    expect(mail.html).toContain('@media (prefers-color-scheme: dark)');
    expect(doc.querySelector(`a[href="${EMAIL_PRIVACY_URL}"]`)?.textContent).toBe(
      'Polityka prywatności',
    );
    expect(doc.body.textContent).toContain('Mixture Marketing Sp. z o.o.');
    expect(doc.body.textContent).toContain('KRS 0001034514');
    expect(doc.title).toBe(mail.subject);
    expect(mail.text.trim().length).toBeGreaterThan(0);
    expect(doc.querySelectorAll('script')).toHaveLength(0);
  });

  it('HTML wszystkich maili = snapshot', () => {
    expect(Object.fromEntries(ALL.map(([f, n, m]) => [`${f} ${n}`, m.html]))).toMatchSnapshot();
  });

  it('pola tokenów leada (captcha_token, website_verify, id) nie trafiają do maila', () => {
    const mail = M.leadNotificationEmail('x', LEAD);
    expect(mail.html).not.toContain('TAJNE');
    expect(mail.text).not.toContain('captcha_token');
    expect(parse(mail.html).querySelectorAll('td.mm-text')).toHaveLength(8);
  });

  it('przycisk akcji: tabela z tłem i link do celu', () => {
    const doc = parse(
      M.magicLinkEmail('Anna', 'https://mixturemarketing.pl/portal/verify?token=abc').html,
    );
    const a = doc.querySelector('a.mm-button');
    expect(a?.getAttribute('href')).toBe('https://mixturemarketing.pl/portal/verify?token=abc');
    expect(a?.textContent).toBe('Zaloguj się');
    expect(a?.closest('td')?.getAttribute('bgcolor')).toBe('#3f3d91');
  });
});

describe('escapowanie danych z formularzy', () => {
  const ATAK = '<script>alert(1)</script>"><img src=x onerror=alert(2)>\'';
  const cases: Array<[string, M.EmailMessage]> = [
    [
      'lead (imię i pola)',
      M.leadNotificationEmail(M.newLeadSubject(ATAK, ATAK), { id: ATAK, name: ATAK, [ATAK]: ATAK }),
    ],
    ['audyt klient', M.auditReportEmail(`https://firma.pl/${ATAK}`)],
    ['audyt zespół', M.auditLeadTeamEmail(ATAK, `https://firma.pl/${ATAK}`, 5, false)],
    ['wycena', M.quoteClientEmail(ATAK)],
    ['wycena zespół', M.quoteTeamEmail(ATAK, ATAK)],
    ['alert', M.quoteBudgetAlertEmail(ATAK)],
    ['magic link', M.magicLinkEmail(ATAK, 'https://mixturemarketing.pl/portal/verify?token=a"b')],
    ['portal', M.portalMessageTeamEmail(ATAK, ATAK)],
    ['odpowiedź', M.leadReplyEmail(ATAK)],
    ['konto', M.welcomePortalEmail(ATAK)],
    ['czat', M.chatReplyClientEmail(ATAK, ATAK)],
  ];

  it.each(cases)('%s: <script> i " w danych nie łamią HTML', (_n, mail) => {
    expect(mail.html).not.toContain('<script>');
    expect(mail.html).not.toContain('"><img src=x');
    const doc = parse(mail.html);
    expect(doc.querySelectorAll('script')).toHaveLength(0);
    expect(doc.querySelectorAll('img')).toHaveLength(1); // tylko logo
    expect(doc.querySelectorAll('[onerror]')).toHaveLength(0);
    expect(doc.body.textContent).toContain('<script>alert(1)</script>');
    // text/plain niesie dane dosłownie (to nie HTML), ale jest niepusty
    expect(mail.text.length).toBeGreaterThan(0);
  });

  it('temat bez znaków nowej linii (wstrzyknięcie nagłówka)', () => {
    expect(M.portalMessageTeamEmail('A\r\nBcc: x@y.pl', 'x').subject).toBe(
      'Nowa wiadomość od A Bcc: x@y.pl',
    );
    expect(M.newLeadSubject('A\nB', 'c')).not.toMatch(/[\r\n]/);
  });

  it('link tylko http(s): javascript: i data: zostają tekstem', () => {
    expect(safeHref('javascript:alert(1)')).toBeNull();
    expect(safeHref(' data:text/html,x')).toBeNull();
    expect(safeHref('https://a.pl/')).toBe('https://a.pl/');
    const audyt = M.auditReportEmail('javascript:alert(1)');
    expect(parse(audyt.html).querySelector('a[href^="javascript"]')).toBeNull();
    expect(audyt.html).toContain('javascript:alert(1)');
    const btn = renderEmail({ subject: 's', blocks: [{ button: 'Klik', href: 'javascript:x' }] });
    expect(parse(btn.html).querySelector('a.mm-button')).toBeNull();
    expect(btn.text).toContain('Klik');
    expect(btn.text).not.toContain('javascript');
  });

  it('href zawsze ostatnim atrybutem (po cudzysłowie od razu ">")', () => {
    for (const [, , mail] of ALL) expect(mail.html).not.toMatch(/href="[^"]*"[^>]*"/);
  });
});

describe('8 endpointów używa modułu (bez własnego HTML maili)', () => {
  const ROOT = path.resolve(__dirname, '..');
  const FILES = [
    'contact-submit.ts',
    'audit/capture-lead.ts',
    'estimation/public-quote.ts',
    'auth/send_magic_link.ts',
    'portal/send_message.ts',
    'admin/reply_lead.ts',
    'admin/convert_lead.ts',
    'admin/admin_reply_chat.ts',
  ];
  it.each(FILES)('%s', (f) => {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    expect(src).toMatch(
      /from '\.\.?\/(_shared\/)?emailMessages'|from '\.\/_shared\/emailMessages'/,
    );
    expect(src).not.toMatch(/<(p|h[1-6]|div|table|blockquote|strong|a)[\s>]/);
    expect(src).not.toMatch(/\bhtml\s*:/);
    expect(src).not.toMatch(/escapeHtml/);
  });
});

describe('Functions bez zależności od Vite (import.meta.env nie istnieje w Cloudflare Functions)', () => {
  const FN = path.resolve(__dirname, '../..');
  const CONFIG = path.resolve(__dirname, '../../../config');
  const walk = (d: string): string[] =>
    fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(d, e.name);
      if (e.isDirectory()) return e.name === 'node_modules' ? [] : walk(p);
      return /\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) ? [p] : [];
    });
  it('żaden plik w functions/ nie importuje config/site (używa import.meta.env)', () => {
    const zle = walk(FN).filter((f) =>
      /from\s+['"][^'"]*config\/site['"]/.test(fs.readFileSync(f, 'utf8')),
    );
    expect(zle).toEqual([]);
  });
  it('config/siteIdentity.ts nie używa import.meta i niczego nie importuje', () => {
    const src = fs.readFileSync(path.join(CONFIG, 'siteIdentity.ts'), 'utf8');
    expect(src).not.toMatch(/import\.meta/);
    expect(src).not.toMatch(/^\s*import\s/m);
  });
});

describe('luki z weryfikacji r1 (w2, w5, w6, w8, w9, w10)', () => {
  it('href przycisku escapowany: cudzysłów w adresie nie urywa atrybutu', () => {
    const url = 'https://mixturemarketing.pl/portal/verify?token=a"b onmouseover="x';
    const m = M.magicLinkEmail('Anna', url);
    const linki = Array.from(parse(m.html).querySelectorAll('a')).filter((a) =>
      (a.getAttribute('href') ?? '').includes('portal/verify'),
    );
    expect(linki.length).toBeGreaterThan(0);
    for (const a of linki) expect(a.getAttribute('href')).toBe(url);
    expect(m.html).not.toMatch(/token=a"b/);
  });

  it('temat maila audytu (zespół) bez CR/LF', () => {
    const m = M.auditLeadTeamEmail('a@b.pl\r\nBcc: x@y.pl', 'https://firma.pl/', 5, false);
    expect(m.subject).not.toMatch(/[\r\n]/);
  });

  it('safeHref: adres bez schematu (//host) zostaje tekstem', () => {
    expect(safeHref('//evil.example/x')).toBeNull();
    expect(safeHref('/portal')).toBeNull();
  });

  it('endpoint nie nadpisuje subject/html/text po maili z modułu (text/plain zawsze idzie)', () => {
    const ROOT = path.resolve(__dirname, '..');
    const FILES = [
      'contact-submit.ts',
      'audit/capture-lead.ts',
      'estimation/public-quote.ts',
      'auth/send_magic_link.ts',
      'portal/send_message.ts',
      'admin/reply_lead.ts',
      'admin/convert_lead.ts',
      'admin/admin_reply_chat.ts',
    ];
    let spready = 0;
    for (const f of FILES) {
      const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
      // Każdy spread maila (`...message,` / `...xxxEmail(...)`) aż do końca literału obiektu.
      for (const m of src.matchAll(/\.\.\.(message|\w+Email\([^)]*\)),\n([\s\S]*?)\n\s*\}/g)) {
        spready++;
        expect(m[2], `${f}: klucz po spreadzie`).not.toMatch(/\b(subject|html|text)\s*:/);
      }
    }
    expect(spready).toBeGreaterThanOrEqual(9);
  });
});
