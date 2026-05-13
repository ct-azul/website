import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { JSON_HEADERS, EMAIL_RE, escHtml, sanitizeSubject, getEmailConfig, parseJsonBody, str } from '../../lib/email';

export const prerender = false;

const ALLOWED_ASUNTOS = new Set(['informacion', 'colaboracion', 'evento', 'prensa', 'otro']);

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

  const nombre  = str(body.nombre).trim();
  const email   = str(body.email).trim();
  const asunto  = str(body.asunto).trim();
  const mensaje = str(body.mensaje).trim();

  if (!nombre || !email || !asunto || !mensaje) {
    return new Response(JSON.stringify({ error: 'Campos requeridos faltantes' }), { status: 422, headers: JSON_HEADERS });
  }

  if (!EMAIL_RE.test(email) || email.length > 320) {
    return new Response(JSON.stringify({ error: 'Email inválido' }), { status: 422, headers: JSON_HEADERS });
  }

  if (!ALLOWED_ASUNTOS.has(asunto)) {
    return new Response(JSON.stringify({ error: 'Asunto inválido' }), { status: 422, headers: JSON_HEADERS });
  }

  if (nombre.length > 200 || mensaje.length > 5000) {
    return new Response(JSON.stringify({ error: 'Campo demasiado largo' }), { status: 422, headers: JSON_HEADERS });
  }

  if (!resendKey) {
    console.warn('[contacto] RESEND_API_KEY not set — logging submission');
    console.log({ nombre, email, asunto, mensaje });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: JSON_HEADERS });
  }

  const resend = new Resend(resendKey);

  try {
    const { data, error } = await resend.emails.send({
      from:    'Cluster Tecnológico Azul <noreply@clustertecnologicoazul.org>',
      to:      [toEmail],
      replyTo: email,
      subject: `Nuevo contacto: ${sanitizeSubject(asunto)} — ${sanitizeSubject(nombre)}`,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:bold;color:#666">Nombre</td><td style="padding:8px">${escHtml(nombre)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#666">Email</td><td style="padding:8px"><a href="mailto:${escHtml(email)}">${escHtml(email)}</a></td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#666">Asunto</td><td style="padding:8px">${escHtml(asunto)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#666;vertical-align:top">Mensaje</td><td style="padding:8px;white-space:pre-wrap">${escHtml(mensaje)}</td></tr>
        </table>
      `,
    });

    if (error) {
      console.error('[contacto] Resend API error:', JSON.stringify(error));
      return new Response(JSON.stringify({ error: 'Error enviando email' }), { status: 500, headers: JSON_HEADERS });
    }

    console.log('[contacto] Email sent:', data?.id);
  } catch (e) {
    console.error('[contacto] Resend threw:', e instanceof Error ? e.message : String(e));
    return new Response(JSON.stringify({ error: 'Error enviando email' }), { status: 500, headers: JSON_HEADERS });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: JSON_HEADERS });
};
