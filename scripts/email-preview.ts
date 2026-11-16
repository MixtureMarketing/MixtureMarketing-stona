/**
 * Podgląd wszystkich maili strony (MIX-1866): HTML + TXT każdego maila i zrzuty 600 px i 375 px.
 *
 * Uruchom:  node scripts/email-preview.ts [etykieta]      (Node >= 22.18, typy zdejmowane natywnie)
 * Wynik:    .bieg/<etykieta>/<mail>.html, <mail>.txt, <mail>-600.png, <mail>-375.png, index.html
 *
 * Nic nie wysyła: treść składają te same funkcje, których używają endpointy
 * (functions/api/_shared/emailMessages.ts). Przeglądarka nie wychodzi do sieci: logo z domeny
 * strony podajemy z pliku public/, każde inne żądanie spoza file:// jest blokowane (prod-safe).
 * PREVIEW_BEZ_ZRZUTOW=1 = tylko HTML/TXT (bez Chrome).
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer } from 'vite';
import puppeteer from 'puppeteer';
import { createProdSafe } from './lib/prod-safe.mjs';

interface EmailMessage {
  subject: string;
  html: string;
  text: string;
}
type Messages = Record<string, (...args: never[]) => EmailMessage>;

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const label = (process.argv[2] || 'email-preview').replace(/[^a-z0-9-]/gi, '-');
const OUT = path.join(ROOT, '.bieg', label);
const LOGO_PATH = '/assets/email/logo-mixture-white.png';

async function loadMessages(): Promise<{ m: Messages; logoUrl: string }> {
  // Vite ładuje moduły TS funkcji (importy bez rozszerzeń + config/site) bez budowania.
  const server = await createServer({
    configFile: false,
    root: ROOT,
    logLevel: 'error',
    appType: 'custom',
    server: { middlewareMode: true, hmr: false, watch: null },
  });
  try {
    const m = (await server.ssrLoadModule('/functions/api/_shared/emailMessages.ts')) as Messages;
    const { EMAIL_LOGO_URL } = (await server.ssrLoadModule(
      '/functions/api/_shared/emailLayout.ts',
    )) as { EMAIL_LOGO_URL: string };
    return { m, logoUrl: EMAIL_LOGO_URL };
  } finally {
    await server.close();
  }
}

/** Przykładowe dane (fikcyjne) dla każdego maila: [plik, nazwa, kto dostaje, wywołanie]. */
function samples(m: Messages): Array<[string, string, string, EmailMessage]> {
  const f = m as unknown as Record<string, (...a: unknown[]) => EmailMessage>;
  const lead = {
    id: '4f1c2d3e-0000-4000-8000-000000000001',
    name: 'Anna Przykładowa',
    email: 'anna@example.com',
    phone: '+48 600 000 000',
    service_interest: 'strony-www',
    message: 'Dzień dobry,\nchcemy odświeżyć stronę firmy i dodać sklep.',
  };
  const czat = 'Dzień dobry,\nprzesyłam poprawki do projektu strony głównej.';
  return [
    [
      'contact-submit.ts',
      '1a-nowy-lead',
      'zespół',
      f.leadNotificationEmail(f.newLeadSubject(lead.name, lead.service_interest), lead),
    ],
    [
      'contact-submit.ts',
      '1b-aktualizacja-leada',
      'zespół',
      f.leadNotificationEmail(
        f.leadUpdateSubject(lead.id, 3),
        { id: lead.id },
        { budget: '10–20 tys. zł', deadline: 'Q1 2027' },
      ),
    ],
    [
      'contact-submit.ts',
      '1c-notyfikacja-leada',
      'zespół',
      f.leadNotificationEmail(f.leadNotificationSubject('abandoned_step_1', lead.id), {
        id: lead.id,
      }),
    ],
    [
      'audit/capture-lead.ts',
      '2a-audyt-raport',
      'klient',
      f.auditReportEmail('https://firma-przyklad.pl/'),
    ],
    [
      'audit/capture-lead.ts',
      '2b-audyt-zespol',
      'zespół',
      f.auditLeadTeamEmail('anna@example.com', 'https://firma-przyklad.pl/', 87, true),
    ],
    [
      'estimation/public-quote.ts',
      '3a-wycena-klient',
      'klient',
      f.quoteClientEmail('8000–12000 zł'),
    ],
    [
      'estimation/public-quote.ts',
      '3b-wycena-zespol',
      'zespół',
      f.quoteTeamEmail('anna@example.com', '8000–12000 zł'),
    ],
    [
      'estimation/public-quote.ts',
      '3c-wycena-alert-budzetu',
      'zespół',
      f.quoteBudgetAlertEmail('budżet 80% n=160/200'),
    ],
    [
      'auth/send_magic_link.ts',
      '4-magiczny-link',
      'klient',
      f.magicLinkEmail(
        'Anna Przykładowa',
        'https://mixturemarketing.pl/portal/verify?token=PRZYKLAD',
      ),
    ],
    [
      'portal/send_message.ts',
      '5-wiadomosc-portal-zespol',
      'zespół',
      f.portalMessageTeamEmail('Anna Przykładowa', czat),
    ],
    [
      'admin/reply_lead.ts',
      '6-odpowiedz-na-zapytanie',
      'klient',
      f.leadReplyEmail('Dziękujemy za wiadomość.\nPrzygotujemy wycenę do piątku.'),
    ],
    [
      'admin/convert_lead.ts',
      '7-konto-w-portalu',
      'klient',
      f.welcomePortalEmail('Anna Przykładowa'),
    ],
    [
      'admin/admin_reply_chat.ts',
      '8-wiadomosc-od-zespolu',
      'klient',
      f.chatReplyClientEmail('Anna Przykładowa', czat),
    ],
  ];
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const { m, logoUrl } = await loadMessages();
  const list = samples(m);
  const rows: string[] = [];
  for (const [file, name, to, msg] of list) {
    fs.writeFileSync(path.join(OUT, `${name}.html`), msg.html);
    fs.writeFileSync(path.join(OUT, `${name}.txt`), `Temat: ${msg.subject}\n\n${msg.text}\n`);
    rows.push(
      `<tr><td>${name}</td><td>${file}</td><td>${to}</td><td>${msg.subject.replace(/</g, '&lt;')}</td><td><a href="${name}.html">HTML</a> · <a href="${name}.txt">TXT</a> · <a href="${name}-600.png">600</a> · <a href="${name}-375.png">375</a></td></tr>`,
    );
  }
  fs.writeFileSync(
    path.join(OUT, 'index.html'),
    `<!DOCTYPE html><meta charset="utf-8"><title>Maile strony</title><table border="1" cellpadding="6"><tr><th>mail</th><th>plik</th><th>do</th><th>temat</th><th>podgląd</th></tr>${rows.join('')}</table>`,
  );
  console.log(`PREVIEW maile=${list.length} katalog=${path.relative(ROOT, OUT)}`);
  if (process.env.PREVIEW_BEZ_ZRZUTOW === '1') return;

  const logo = fs.readFileSync(path.join(ROOT, 'public', LOGO_PATH));
  const safe = createProdSafe('http://localhost/');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  safe.watchBrowser(browser);
  try {
    const page = await browser.newPage();
    let blocked = 0;
    await safe.protect(page, {
      handler: (req: {
        url(): string;
        respond(r: { status: number; contentType: string; body: Buffer }): Promise<void>;
        abort(): Promise<void>;
        continue(): Promise<void>;
      }) => {
        const u = req.url();
        if (u === logoUrl) {
          req.respond({ status: 200, contentType: 'image/png', body: logo }).catch(() => {});
        } else if (u.startsWith('file:') || u.startsWith('data:')) {
          req.continue().catch(() => {});
        } else {
          blocked++;
          req.abort().catch(() => {});
        }
      },
    });
    for (const [, name] of list) {
      for (const width of [600, 375]) {
        await page.setViewport({ width, height: 800, deviceScaleFactor: 1 });
        await page.goto(pathToFileURL(path.join(OUT, `${name}.html`)).href, { waitUntil: 'load' });
        await page.screenshot({
          path: path.join(OUT, `${name}-${width}.png`) as `${string}.png`,
          fullPage: true,
        });
      }
    }
    console.log(`PREVIEW zrzuty=${list.length * 2} zablokowane_zadania=${blocked}`);
  } finally {
    await browser.close();
  }
  safe.finish();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
