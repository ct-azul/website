import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_ROLES = new Set([
  'desarrollador', 'diseniador', 'data',
  'emprendedor', 'estudiante', 'docente', 'otro',
]);

function escHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as { runtime?: { env?: Record<string, string> } }).runtime;
  const resendKey = runtime?.env?.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY;
  const toEmail   = runtime?.env?.CONTACT_EMAIL    ?? import.meta.env.CONTACT_EMAIL ?? 'hola@clustertecnologicoazul.com';

  let body: Record<string, string>;
  try {
    body = await request.json() as Record<string, string>;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: JSON_HEADERS });
  }

  const { nombre, email, rol, organizacion, mensaje, 'como-conociste': comoConociste } = body;

  if (!nombre?.trim() || !email?.trim() || !rol?.trim()) {
    return new Response(JSON.stringify({ error: 'Campos requeridos faltantes' }), { status: 422, headers: JSON_HEADERS });
  }

  if (!EMAIL_RE.test(email) || email.length > 320) {
    return new Response(JSON.stringify({ error: 'Email inválido' }), { status: 422, headers: JSON_HEADERS });
  }

  if (!ALLOWED_ROLES.has(rol)) {
    return new Response(JSON.stringify({ error: 'Rol inválido' }), { status: 422, headers: JSON_HEADERS });
  }

  if (nombre.length > 200 || (organizacion && organizacion.length > 200) || (mensaje && mensaje.length > 5000)) {
    return new Response(JSON.stringify({ error: 'Campo demasiado largo' }), { status: 422, headers: JSON_HEADERS });
  }

  if (!resendKey) {
    console.warn('[unirse] RESEND_API_KEY not set — logging submission');
    console.log({ nombre, email, rol, organizacion, mensaje, comoConociste });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: JSON_HEADERS });
  }

  const resend = new Resend(resendKey);

  const { error } = await resend.emails.send({
    from: 'Cluster Tecnológico Azul <noreply@clustertecnologicoazul.com>',
    to:   [toEmail],
    replyTo: email,
    subject: `Nueva solicitud de ingreso — ${escHtml(nombre)}`,
    html: `
      <h2>Nueva solicitud de ingreso al Cluster</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;font-weight:bold;color:#666">Nombre</td><td style="padding:8px">${escHtml(nombre)}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#666">Email</td><td style="padding:8px"><a href="mailto:${escHtml(email)}">${escHtml(email)}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#666">Rol</td><td style="padding:8px">${escHtml(rol)}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#666">Organización</td><td style="padding:8px">${organizacion ? escHtml(organizacion) : '—'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#666">¿Cómo nos conoció?</td><td style="padding:8px">${comoConociste ? escHtml(comoConociste) : '—'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#666;vertical-align:top">Mensaje</td><td style="padding:8px;white-space:pre-wrap">${mensaje ? escHtml(mensaje) : '—'}</td></tr>
      </table>
    `,
  });

  if (error) {
    console.error('[unirse] Resend error:', error);
    return new Response(JSON.stringify({ error: 'Error enviando email' }), { status: 500, headers: JSON_HEADERS });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: JSON_HEADERS });
};
