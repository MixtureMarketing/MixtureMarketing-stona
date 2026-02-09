/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: contact_submit
 * Handles multi-step lead generation, updates, and notifications.
 * Path: /api/contact_submit
 */

interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
  RECAPTCHA_SECRET: string;
  NOTIFY_EMAIL: string;
}

// --- Constants & Styles ---
const BRAND = {
  primary: '#213261', // Dark Navy
  secondary: '#3F3D91', // Indigo
  accent: '#61B6DE', // Light Blue
  bg: '#F0F4F8',
  white: '#FFFFFF',
  text: '#334155',
  gray: '#94A3B8',
  border: '#EAEAEA',
};

const EMAIL_STYLES = {
  body: `font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${BRAND.bg}; margin: 0; padding: 0; color: ${BRAND.text};`,
  container: `max-width: 600px; margin: 0 auto; background-color: ${BRAND.white}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);`,
  button: `display: inline-block; background-color: ${BRAND.primary}; color: ${BRAND.white}; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;`,
  footer: `background-color: #FAFAFA; padding: 30px; text-align: center; font-size: 12px; color: ${BRAND.gray}; border-top: 1px solid ${BRAND.border};`,
  table: `width: 100%; border-collapse: separate; border-spacing: 0; margin: 25px 0; border: 1px solid #eee; border-radius: 8px; overflow: hidden;`,
  table_label: `padding: 12px 15px; font-weight: 600; color: #555; width: 35%; border-bottom: 1px solid #eee; background-color: #fafafa;`,
  table_value: `padding: 12px 15px; color: #222; border-bottom: 1px solid #eee; background-color: #ffffff;`,
  card: `background-color: #F8FAFC; border: 1px dashed ${BRAND.gray}; border-radius: 12px; padding: 25px; margin-bottom: 25px;`,
  tip: `background-color: #E0EFFF; border-radius: 12px; padding: 20px; margin-bottom: 25px; color: ${BRAND.secondary};`,
};

const LABEL_MAP: Record<string, string> = {
  company: 'Firma',
  projectType: 'Typ projektu',
  deadline: 'Termin',
  goal: 'Cel projektu',
  assets: 'Materiały',
  traffic: 'Źródło ruchu',
  scope: 'Skala asortymentu',
  integrations: 'Integracje',
  history: 'Status projektu',
  area: 'Zasięg',
  tech: 'Zarządzanie treścią',
  appStage: 'Etap projektu',
  process: 'Główny proces',
  features: 'Funkcje specjalne',
  auditScope: 'Zasięg audytu',
  copywriting: 'Copywriting',
  trafficSource: 'Główne źródło ruchu',
  productCount: 'Liczba produktów',
  platform: 'Technologia',
  pageCount: 'Liczba podstron',
  languages: 'Wersje językowe',
  appPlatform: 'Platforma docelowa',
  campaignGoal: 'Główny cel kampanii',
  users: 'Użytkownicy / Grupa docelowa',
};

// --- Helper Functions ---

function getEmailTemplate(title: string, content: string, ctaLink?: string, ctaText?: string) {
  const siteUrl = 'https://mixturemarketing.pl';
  const logoUrl = 'https://mixturemarketing.pl/assets/images/sygnet.png';
  const address = 'Al. Józefa Piłsudskiego 17 / 4, 35-074 Rzeszów';
  const phone = '+48 794 443 551';
  const email = 'info@mixturemarketing.pl';

  let ctaHtml = '';
  if (ctaLink && ctaText) {
    ctaHtml = `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
        <tr>
          <td align="center">
            <a href="${ctaLink}" target="_blank" style="${EMAIL_STYLES.button}">${ctaText}</a>
          </td>
        </tr>
      </table>`;
  }

  const socials = {
    LinkedIn: 'https://pl.linkedin.com/company/mixture-marketing',
    Facebook: 'https://www.facebook.com/MixtureMarketing',
    TikTok: 'https://www.tiktok.com/@mixturemarketing',
  };

  const socialHtml = Object.entries(socials)
    .map(
      ([name, link]) =>
        `<a href="${link}" target="_blank" style="color: ${BRAND.primary}; text-decoration: none; margin: 0 12px; font-weight: 600; font-size: 12px; text-transform: uppercase;">${name}</a>`,
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { margin: 0; padding: 0; width: 100% !important; }
        img { border: 0; outline: none; text-decoration: none; }
        a { color: ${BRAND.accent}; text-decoration: none; font-weight: 600; }
        p { margin: 0 0 1.5em 0; line-height: 1.6; }
      </style>
    </head>
    <body style="${EMAIL_STYLES.body}">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${BRAND.bg};">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="${EMAIL_STYLES.container}">
              <tr>
                <td align="center" style="padding: 40px 0 20px 0;">
                  <a href="${siteUrl}" target="_blank">
                    <img src="${logoUrl}" alt="Mixture Marketing" width="50" style="display: block; width: 50px; height: auto; border-radius: 8px;">
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 50px 30px 50px; text-align: left;">
                  <h1 style="margin: 0 0 25px 0; font-size: 24px; font-weight: 800; color: ${BRAND.primary}; text-align: center; letter-spacing: -0.5px;">${title}</h1>
                  <div style="font-size: 16px; color: ${BRAND.text};">
                    ${content}
                  </div>
                  ${ctaHtml}
                </td>
              </tr>
              <tr>
                <td style="${EMAIL_STYLES.footer}">
                  <div style="margin-bottom: 20px;">${socialHtml}</div>
                  <p style="font-size: 12px; color: ${BRAND.gray}; margin-bottom: 10px;">
                    <strong>Mixture Marketing Sp. z o.o.</strong><br>${address}<br>NIP: PL5170435774
                  </p>
                  <p style="font-size: 12px; color: ${BRAND.gray}; margin: 0;">
                    <a href="mailto:${email}" style="color: ${BRAND.gray}; text-decoration: none;">${email}</a> &bull;
                    <a href="tel:${phone.replace(/\s/g, '')}" style="color: ${BRAND.gray}; text-decoration: none;">${phone}</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`;
}

function getProgressBar(progress: number) {
  const col1Color = progress >= 33 ? '#61B6DE' : '#CBD5E1';
  const col2Color = progress >= 66 ? '#61B6DE' : '#CBD5E1';
  const col3Color = progress >= 100 ? '#61B6DE' : '#CBD5E1';

  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 25px 0 35px 0;">
      <tr>
        <td align="left" width="33%" style="font-size: 10px; font-weight: 700; color: ${col1Color}; text-transform: uppercase; padding-bottom: 8px; font-family: Helvetica, Arial, sans-serif;">1. Kontakt</td>
        <td align="center" width="33%" style="font-size: 10px; font-weight: 700; color: ${col2Color}; text-transform: uppercase; padding-bottom: 8px; font-family: Helvetica, Arial, sans-serif;">2. Szczegóły</td>
        <td align="right" width="33%" style="font-size: 10px; font-weight: 700; color: ${col3Color}; text-transform: uppercase; padding-bottom: 8px; font-family: Helvetica, Arial, sans-serif;">3. Cel</td>
      </tr>
      <tr>
        <td colspan="3" height="6" style="background-color: #F1F5F9; border-radius: 3px; overflow: hidden; vertical-align: top;">
          <table border="0" cellpadding="0" cellspacing="0" width="${progress}%" height="6">
            <tr><td bgcolor="#61B6DE" height="6" style="line-height: 0px; font-size: 0px;">&nbsp;</td></tr>
          </table>
        </td>
      </tr>
    </table>`;
}

function getDataTable(lead: any) {
  const fields: Record<string, string> = {
    'Imię i nazwisko': lead.name,
    Email: `<a href="mailto:${lead.email}" style="color:${BRAND.accent};text-decoration:none;">${lead.email}</a>`,
    Telefon: lead.phone
      ? `<a href="tel:${lead.phone}" style="color:${BRAND.accent};text-decoration:none;">${lead.phone}</a>`
      : '-',
    Usługa:
      (lead.service_type || 'Ogólne').charAt(0).toUpperCase() +
      (lead.service_type || 'Ogólne').slice(1),
    Budżet: lead.budget || '-',
    'Strona WWW': lead.website
      ? `<a href="${lead.website}" target="_blank">${lead.website}</a>`
      : '-',
    Wiadomość: (lead.message || '-').replace(/\n/g, '<br>'),
  };

  // Dynamic details
  try {
    const details =
      typeof lead.details === 'string' ? JSON.parse(lead.details) : lead.details || {};
    for (const [key, val] of Object.entries(details)) {
      if (val && typeof val === 'string' && val !== 'id') {
        const label =
          LABEL_MAP[key] ||
          key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        fields[label] = String(val);
      }
    }
  } catch (e) {
    console.error('Error parsing details for table:', e);
  }

  let rows = '';
  for (const [label, value] of Object.entries(fields)) {
    if (value && value !== '-') {
      rows += `<tr><td style="${EMAIL_STYLES.table_label}">${label}</td><td style="${EMAIL_STYLES.table_value}">${value}</td></tr>`;
    }
  }

  return `<table style="${EMAIL_STYLES.table}">${rows}</table>`;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  // Handle GET requests (e.g., get_lead)
  if (request.method === 'GET') {
    if (action === 'get_lead') {
      const id = url.searchParams.get('id');
      if (!id) return new Response('Missing ID', { status: 400 });

      const lead = await env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first();
      return new Response(JSON.stringify({ lead }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response('Not Found', { status: 404 });
  }

  // Handle POST requests
  if (request.method === 'POST') {
    try {
      const data: any = await request.json();
      const { action: postAction, id, lead, details, step, type, source_url } = data;
      const currentAction = action || postAction;

      // 1. CREATE LEAD
      if (currentAction === 'create') {
        if (!lead)
          return new Response(JSON.stringify({ error: 'Missing lead object' }), { status: 400 });

        const leadId = lead.id || crypto.randomUUID();
        const name = lead.name || 'Anonim';
        const email = lead.email;
        const phone = lead.phone || null;
        const service_interest = lead.service_interest || 'contact';
        const recaptcha_token = lead.recaptcha_token;

        if (!email) {
          return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
        }

        // Verify Turnstile Token (Cloudflare)
        if (recaptcha_token && recaptcha_token !== 'local_bypass') {
          try {
            const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
            const verifyResult = await fetch(verifyUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `secret=${env.RECAPTCHA_SECRET}&response=${recaptcha_token}`,
            });

            const verifyJson: any = await verifyResult.json();
            if (!verifyJson.success) {
              return new Response(
                JSON.stringify({ error: 'Turnstile verification failed', details: verifyJson }),
                { status: 403 },
              );
            }
          } catch (e: any) {
            console.error('Turnstile Verify Error:', e.message);
            // We continue even if verify fails due to network, to not block users
          }
        }

        try {
          await env.DB.prepare(
            `
            INSERT INTO leads (id, name, email, phone, service_type, source_url, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          )
            .bind(
              String(leadId),
              String(name),
              String(email),
              phone ? String(phone) : null,
              String(service_interest),
              source_url ? String(source_url) : null,
              'new',
            )
            .run();
        } catch (dbErr: any) {
          return new Response(
            JSON.stringify({
              error: 'Database Insert Failed',
              message: dbErr.message,
              debug: { leadId, name, email },
            }),
            { status: 500 },
          );
        }

        return new Response(JSON.stringify({ status: 'success', id: leadId }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 2. UPDATE LEAD
      if (currentAction === 'update') {
        const leadId = id;
        if (!leadId) return new Response('Missing lead ID for update', { status: 400 });

        const { budget, message, website, package_name, ...otherDetails } = details || {};

        await env.DB.prepare(
          `
          UPDATE leads SET 
            budget = COALESCE(?, budget),
            message = COALESCE(?, message),
            website = COALESCE(?, website),
            package_name = COALESCE(?, package_name),
            details = ?,
            current_step = ?
          WHERE id = ?
        `,
        )
          .bind(
            budget || null,
            message || null,
            website || null,
            package_name || null,
            JSON.stringify(otherDetails),
            step || 1,
            leadId,
          )
          .run();

        return new Response(JSON.stringify({ status: 'success' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 3. SEND NOTIFICATION
      if (currentAction === 'send_notification') {
        if (!id) return new Response('Missing ID for notification', { status: 400 });

        const leadRow: any = await env.DB.prepare('SELECT * FROM leads WHERE id = ?')
          .bind(id)
          .first();

        if (!leadRow) {
          console.warn(`[API] Notification requested for non-existent lead: ${id}`);
          return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
        }

        if (env.RESEND_API_KEY) {
          const RESEND_URL = 'https://api.resend.com/emails';
          const HEADERS = {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          };
          const FROM_EMAIL = 'Mixture Marketing <system@mixturemarketing.pl>';

          const sendEmail = async (body: any) => {
            const res = await fetch(RESEND_URL, {
              method: 'POST',
              headers: HEADERS,
              body: JSON.stringify(body),
            });
            if (!res.ok) {
              const text = await res.text();
              throw new Error(`Resend API Error: ${res.status} ${text}`);
            }
            return res;
          };

          const firstName = leadRow.name.split(' ')[0];
          const dataTable = getDataTable(leadRow);

          if (type === 'success') {
            const progress = getProgressBar(100);

            // Admin Notification
            const adminEmailPromise = sendEmail({
              from: FROM_EMAIL,
              to: [env.NOTIFY_EMAIL],
              subject: `🔔 Nowy Lead: ${leadRow.name} (${leadRow.service_type})`,
              html: getEmailTemplate(
                `Nowy Lead: ${leadRow.name}`,
                `<div style="background: #e8f5e9; border: 1px solid #c8e6c9; padding: 15px; border-radius: 8px; margin-bottom: 20px; color: #2e7d32;">
                  <strong>Nowe, kompletne zgłoszenie ze strony WWW</strong>
                </div>
                ${progress}
                ${dataTable}
                <p style="text-align: center; margin-top: 20px;">
                  <a href="mailto:${leadRow.email}" style="color: ${BRAND.accent}; font-weight: bold;">Odpowiedz bezpośrednio (${leadRow.email})</a>
                </p>`,
              ),
            });

            // User Confirmation
            const userEmailPromise = sendEmail({
              from: FROM_EMAIL,
              to: [leadRow.email],
              subject: 'Dziękujemy za zgłoszenie - Mixture Marketing',
              html: getEmailTemplate(
                'Potwierdzenie zgłoszenia',
                `<p>Cześć ${firstName},</p>
                <p>Dziękujemy za zaufanie. Twój brief trafił bezpiecznie do naszego zespołu.</p>
                ${progress}
                <p>Przeanalizujemy Twoje zgłoszenie i wrócimy z propozycją terminu rozmowy w ciągu 24h.</p>
                <br>
                <h3>Twoje dane:</h3>
                ${dataTable}`,
                'https://calendar.app.google/udxBxEXf78nonaEh6',
                'UMÓW ROZMOWĘ WIDEO',
              ),
            });

            const results = await Promise.allSettled([adminEmailPromise, userEmailPromise]);
            results.forEach((r, i) => {
              if (r.status === 'rejected')
                console.error(`[Email Error] ${i === 0 ? 'Admin' : 'User'} failed:`, r.reason);
            });
          } else if (type === 'abandoned_step_1' || type === 'abandoned_step_2') {
            const isStep1 = type === 'abandoned_step_1';
            const sentColumn = isStep1 ? 'email_abandoned_1_sent' : 'email_abandoned_2_sent';

            // Check if already sent
            if (leadRow[sentColumn] === 1) {
              return new Response(
                JSON.stringify({ status: 'success', note: 'Email already sent' }),
                { status: 200 },
              );
            }

            const progressValue = isStep1 ? 33 : 66;
            const resumeStep = isStep1 ? '2' : '3';
            const progress = getProgressBar(progressValue);
            const resumeLink = `https://mixturemarketing.pl/?resume_lead=${id}&step=${resumeStep}`;

            // User Recovery Email
            const userRecoveryPromise = sendEmail({
              from: FROM_EMAIL,
              to: [leadRow.email],
              subject: `${firstName}, dokończmy Twoją wycenę`,
              html: getEmailTemplate(
                'Dokończ zgłoszenie',
                `<p style="font-size: 18px; font-weight: 600; color: ${BRAND.primary}; margin-bottom: 15px;">Cześć ${firstName},</p>
                <p>Zauważyliśmy, że przerwałeś wypełnianie formularza w sprawie projektu. Twoje dane są u nas bezpieczne – zapisaliśmy postęp prac.</p>
                ${progress}
                <p>Możesz wrócić do formularza dokładnie tam, gdzie skończyłeś:</p>
                <br>
                <div style="${EMAIL_STYLES.card}">
                    <p style="margin: 0 0 15px 0; font-size: 11px; font-weight: 800; color: ${BRAND.gray}; text-transform: uppercase; letter-spacing: 1px;">Twoje zapisane odpowiedzi:</p>
                    ${dataTable}
                </div>
                <div style="${EMAIL_STYLES.tip}">
                    <p style="margin: 0; font-size: 14px;"><strong>💡 Tip:</strong> Nawet jeśli nie zdążysz uzupełnić szczegółów, nasz konsultant skontaktuje się z Tobą wkrótce, aby pomóc w doprecyzowaniu wyceny.</p>
                </div>
                <p style="text-align: center; margin-bottom: 30px;">
                    <a href="https://calendar.app.google/atVivbU6qaL7KXPXA" target="_blank" style="color: ${BRAND.accent}; font-weight: bold; text-decoration: underline;">Wolisz od razu umówić rozmowę? Kliknij tutaj.</a>
                </p>`,
                resumeLink,
                'DOKOŃCZ ZGŁOSZENIE',
              ),
            });

            // Admin Alert
            const adminAlertPromise = sendEmail({
              from: FROM_EMAIL,
              to: [env.NOTIFY_EMAIL],
              subject: `⚠️ Niedokończone zgłoszenie: ${leadRow.name}`,
              html: getEmailTemplate(
                `Niedokończone zgłoszenie: ${leadRow.name}`,
                `<div style="background: #fff8e1; border: 1px solid #ffe0b2; padding: 15px; border-radius: 8px; margin-bottom: 20px; color: #f57c00;">
                    <strong>Klient przerwał wypełnianie formularza.</strong><br>
                    Etap: ${progressValue === 33 ? '1' : '2'}/3
                </div>
                <p>To co zdążył wpisać:</p>
                ${dataTable}
                <br>
                <p><a href="mailto:${leadRow.email}">Wyślij ręcznego maila (${leadRow.email})</a></p>`,
              ),
            });

            const results = await Promise.allSettled([userRecoveryPromise, adminAlertPromise]);

            // Mark as sent if user email succeeded
            if (results[0].status === 'fulfilled') {
              await env.DB.prepare(`UPDATE leads SET ${sentColumn} = 1 WHERE id = ?`)
                .bind(id)
                .run();
            }

            results.forEach((r, i) => {
              if (r.status === 'rejected')
                console.error(
                  `[Email Error] ${i === 0 ? 'User Recovery' : 'Admin Alert'} failed:`,
                  r.reason,
                );
            });
          }
        }

        return new Response(JSON.stringify({ status: 'success' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response('Invalid Action', { status: 400 });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
};
