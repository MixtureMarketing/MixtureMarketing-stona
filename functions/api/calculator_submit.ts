/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Pages Function: calculator_submit
 * Path: /api/calculator_submit
 */

interface Env {
  RESEND_API_KEY: string;
  NOTIFY_EMAIL: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const pdf = formData.get('pdf') as File;
    const data = formData.get('data') as string;

    if (!email || !pdf) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // 1. Prepare Attachment for Resend
    const pdfArrayBuffer = await pdf.arrayBuffer();
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfArrayBuffer)));

    // 2. Send Email via Resend
    if (env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Mixture Marketing <biuro@mixturemarketing.pl>',
          to: [email],
          subject: 'Twoja wycena projektu - Mixture Marketing',
          html: `
            <h3>Dziękujemy za skorzystanie z naszego kalkulatora!</h3>
            <p>W załączniku przesyłamy wstępny kosztorys Twojego projektu.</p>
            <p>Jeśli masz pytania, odpowiedz na tego maila.</p>
            <br/>
            <p>Z poważaniem,</p>
            <p>Zespół Mixture Marketing</p>
          `,
          attachments: [
            {
              filename: 'wycena_mixture.pdf',
              content: pdfBase64,
            },
          ],
        }),
      });

      // Also notify Admin
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Mixture Marketing <system@mixturemarketing.pl>',
          to: [env.NOTIFY_EMAIL],
          subject: `Nowa wycena: ${email}`,
          html: `<p>Użytkownik <strong>${email}</strong> wygenerował wycenę.</p><pre>${data}</pre>`,
          attachments: [
            {
              filename: 'wycena_mixture.pdf',
              content: pdfBase64,
            },
          ],
        }),
      });
    }

    return new Response(JSON.stringify({ status: 'success' }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
