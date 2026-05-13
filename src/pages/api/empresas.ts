import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { JSON_HEADERS, EMAIL_RE, escHtml, getEmailConfig, parseJsonBody, str } from '../../lib/email';

export const prerender = false;

const ALLOWED_CATEGORIAS = new Set([
  'automatizacion',
  'asistentes-ia',
  'integracion',
  'analisis-datos',
  'capacitacion',
  'no-se',
]);

export const POST: APIRoute = async ({ request }) => {
  const { resendKey, toEmail } = getEmailConfig();

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: JSON_HEADERS });
  }

  const body = parseJsonBody(raw);
  if (!body) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: JSON_HEADERS });
  }

  const empresa     = str(body.empresa).trim();
  const responsable = str(body.responsable).trim();
  const email       = str(body.email).trim();
  const categoria   = str(body.categoria).trim();
  const mensaje     = str(body.mensaje).trim();

  if (!empresa || !responsable || !email || !categoria) {
    return new Response(JSON.stringify({ error: 'Campos requeridos faltantes' }), { status: 422, headers: JSON_HEADERS });
  }

  if (!EMAIL_RE.test(email) || email.length > 320) {
    return new Response(JSON.stringify({ error: 'Email inválido' }), { status: 422, headers: JSON_HEADERS });
  }

  if (!ALLOWED_CATEGORIAS.has(categoria)) {
    return new Response(JSON.stringify({ error: 'Categoría inválida' }), { status: 422, headers: JSON_HEADERS });
  }

  if (empresa.length > 200 || responsable.length > 200 || mensaje.length > 2000) {
    return new Response(JSON.stringify({ error: 'Campo demasiado largo' }), { status: 422, headers: JSON_HEADERS });
  }

  if (!resendKey) {
    console.warn('[empresas] RESEND_API_KEY not set — logging submission');
    console.log({ empresa, responsable, email, categoria, mensaje });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: JSON_HEADERS });
  }

  const resend = new Resend(resendKey);

  // Email 1: notification to cluster (critical)
  try {
    const { data, error } = await resend.emails.send({
      from:    'Cluster Tecnológico Azul <noreply@clustertecnologicoazul.org>',
      to:      [toEmail],
      replyTo: email,
      subject: `Nueva solicitud de asesoría: ${categoria} — ${empresa}`,
      html: `
        <h2>Nueva solicitud de asesoría</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:bold;color:#666">Empresa</td><td style="padding:8px">${escHtml(empresa)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#666">Responsable</td><td style="padding:8px">${escHtml(responsable)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#666">Email</td><td style="padding:8px"><a href="mailto:${escHtml(email)}">${escHtml(email)}</a></td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#666">Área de asesoría</td><td style="padding:8px">${escHtml(categoria)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#666;vertical-align:top">Mensaje</td><td style="padding:8px;white-space:pre-wrap">${mensaje ? escHtml(mensaje) : '—'}</td></tr>
        </table>
      `,
    });

    if (error) {
      console.error('[empresas] Resend notification error:', JSON.stringify(error));
      return new Response(JSON.stringify({ error: 'Error enviando email' }), { status: 500, headers: JSON_HEADERS });
    }

    console.log('[empresas] Notification sent:', data?.id);
  } catch (e) {
    console.error('[empresas] Resend threw:', e instanceof Error ? e.message : String(e));
    return new Response(JSON.stringify({ error: 'Error enviando email' }), { status: 500, headers: JSON_HEADERS });
  }

  // Email 2: auto-reply to company (best-effort — failure does not affect response)
  try {
    const { data, error } = await resend.emails.send({
      from:    'Cluster Tecnológico Azul <noreply@clustertecnologicoazul.org>',
      to:      [email],
      subject: 'Recibimos tu consulta — Cluster Tecnológico Azul',
      html: `
        <p>Hola ${escHtml(responsable)},</p>
        <p>Recibimos tu solicitud de asesoría para <strong>${escHtml(empresa)}</strong>. ¡Muchas gracias por tu interés!</p>
        <p>Nos pondremos en contacto con vos en los próximos días hábiles para coordinar los próximos pasos.</p>
        <p>Si tenés alguna consulta adicional, podés escribirnos directamente a
          <a href="mailto:info@clustertecnologicoazul.org">info@clustertecnologicoazul.org</a>.
        </p>
        <br>
        <p>Saludos,<br><strong>Cluster Tecnológico Azul</strong><br>Azul, Buenos Aires, Argentina</p>
      `,
    });

    if (error) {
      console.error('[empresas] Auto-reply error:', JSON.stringify(error));
    } else {
      console.log('[empresas] Auto-reply sent:', data?.id);
    }
  } catch (e) {
    console.error('[empresas] Auto-reply threw:', e instanceof Error ? e.message : String(e));
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: JSON_HEADERS });
};
