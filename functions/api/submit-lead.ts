/**
 * Cloudflare Pages Function: submit-lead
 * Path: /api/submit-lead
 */

interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
  RECAPTCHA_SECRET: string;
  NOTIFY_EMAIL: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const data: any = await request.json();
    const { 
      id, name, email, phone, service_type, 
      package_name, website, budget, message, 
      details, recaptchaToken, source_url 
    } = data;

    // 1. Verify ReCaptcha v3
    if (!recaptchaToken) {
      return new Response(JSON.stringify({ error: 'Missing ReCaptcha token' }), { status: 400 });
    }

    const recaptchaVerify = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${env.RECAPTCHA_SECRET}&response=${recaptchaToken}`
    });

    const recaptchaResult: any = await recaptchaVerify.json();
    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      return new Response(JSON.stringify({ error: 'ReCaptcha failed', score: recaptchaResult.score }), { status: 403 });
    }

    // 2. Save to D1 Database
    const leadId = id || crypto.randomUUID();
    await env.DB.prepare(`
      INSERT INTO leads (
        id, name, email, phone, service_type, 
        package_name, source_url, website, budget, 
        message, details, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      leadId, name, email, phone || null, service_type || 'contact',
      package_name || null, source_url || null, website || null, 
      budget || null, message || null, 
      details ? JSON.stringify(details) : null,
      'new'
    ).run();

    // 3. Send Emails via Resend
    if (env.RESEND_API_KEY) {
      // Notify Admin
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Mixture Marketing <system@mixturemarketing.pl>',
          to: [env.NOTIFY_EMAIL],
          subject: `Nowy Lead: ${name} (${service_type})`,
          html: `
            <h3>Nowe zgłoszenie z Mixture Marketing</h3>
            <p><strong>Imię:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Telefon:</strong> ${phone || '-'}</p>
            <p><strong>Usługa:</strong> ${service_type}</p>
            <p><strong>Budżet:</strong> ${budget || '-'}</p>
            <p><strong>Wiadomość:</strong> ${message || '-'}</p>
            <hr/>
            <p>Źródło: ${source_url || 'Bezpośrednio'}</p>
          `
        })
      });

      // Auto-responder to Client
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Mixture Marketing <biuro@mixturemarketing.pl>',
          to: [email],
          subject: `Dziękujemy za kontakt, ${name}!`,
          html: `
            <h3>Witaj ${name}!</h3>
            <p>Otrzymaliśmy Twoje zgłoszenie dotyczące usługi <strong>${service_type}</strong>.</p>
            <p>Nasz zespół przeanalizuje Twoje zapytanie i skontaktuje się z Tobą w ciągu 24 godzin.</p>
            <br/>
            <p>Z poważaniem,</p>
            <p>Zespół Mixture Marketing</p>
          `
        })
      });
    }

    return new Response(JSON.stringify({ 
      status: 'success', 
      leadId: leadId 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
