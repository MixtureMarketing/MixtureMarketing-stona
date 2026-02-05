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
        headers: { 'Content-Type': 'application/json' }
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
        const { id: leadId, recaptcha_token, name, email, phone, service_interest } = lead;

        // Verify Turnstile Token (Cloudflare)
        if (recaptcha_token) {
          const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
          const verifyResult = await fetch(verifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${env.RECAPTCHA_SECRET}&response=${recaptcha_token}`
          });
          
          const verifyJson: any = await verifyResult.json();
          if (!verifyJson.success) {
            return new Response(JSON.stringify({ error: 'Turnstile verification failed' }), { status: 403 });
          }
        }

        await env.DB.prepare(`
          INSERT INTO leads (id, name, email, phone, service_type, source_url, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          leadId, name, email, phone || null, service_interest || 'contact', 
          source_url || null, 'new'
        ).run();

        return new Response(JSON.stringify({ status: 'success' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 2. UPDATE LEAD
      if (currentAction === 'update') {
        const leadId = id;
        if (!leadId) return new Response('Missing lead ID for update', { status: 400 });

        const { budget, message, website, package_name, ...otherDetails } = details || {};
        
        await env.DB.prepare(`
          UPDATE leads SET 
            budget = COALESCE(?, budget),
            message = COALESCE(?, message),
            website = COALESCE(?, website),
            package_name = COALESCE(?, package_name),
            details = ?,
            current_step = ?
          WHERE id = ?
        `).bind(
          budget || null, message || null, website || null, package_name || null,
          JSON.stringify(otherDetails), step || 1, leadId
        ).run();

        return new Response(JSON.stringify({ status: 'success' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 3. SEND NOTIFICATION
      if (currentAction === 'send_notification') {
        const leadRow: any = await env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first();
        if (!leadRow) return new Response('Lead not found', { status: 404 });

        if (env.RESEND_API_KEY) {
          if (type === 'success') {
            // Admin Notification
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                from: 'Mixture Marketing <system@mixturemarketing.pl>',
                to: [env.NOTIFY_EMAIL],
                subject: `Nowy Lead: ${leadRow.name}`,
                html: `<h3>Zgłoszenie: ${leadRow.service_type}</h3><p>Email: ${leadRow.email}</p><p>Wiadomość: ${leadRow.message || '-'}</p>`
              })
            });
          }
          // Note: In a real app, you'd add templates for abandoned_step_1 etc.
        }

        return new Response(JSON.stringify({ status: 'success' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response('Invalid Action', { status: 400 });

    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
};