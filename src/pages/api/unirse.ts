import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { JSON_HEADERS, EMAIL_RE, escHtml, sanitizeSubject, getEmailConfig, parseJsonBody, str } from '../../lib/email';

export const prerender = false;

const ALLOWED_ROLES = new Set([
  'desarrollador', 'diseniador', 'data',
  'emprendedor', 'estudiante', 'docente', 'otro',
]);

const ALLOWED_COMO = new Set(['redes', 'amigo', 'evento', 'github', 'otro']);

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

  const nombre        = str(body.nombre).trim();
  const email         = str(body.email).trim();
  const rol           = str(body.rol).trim();
  const organizacion  = str(body.organizacion).trim();
  const mensaje       = str(body.mensaje).trim();
  const comoConociste = str(body['como-conociste']).trim();

  if (!nombre || !email || !rol) {
    return new Response(JSON.stringify({ error: 'Campos requeridos faltantes' }), { status: 422, headers: JSON_HEADERS });
  }

  if (!EMAIL_RE.test(email) || email.length > 320) {
    return new Response(JSON.stringify({ error: 'Email inválido' }), { status: 422, headers: JSON_HEADERS });
  }

  if (!ALLOWED_ROLES.has(rol)) {
    return new Response(JSON.stringify({ error: 'Rol inválido' }), { status: 422, headers: JSON_HEADERS });
  }

  if (comoConociste && !ALLOWED_COMO.has(comoConociste)) {
    return new Response(JSON.stringify({ error: 'Valor inválido' }), { status: 422, headers: JSON_HEADERS });
  }

  if (nombre.length > 200 || organizacion.length > 200 || mensaje.length > 5000) {
    return new Response(JSON.stringify({ error: 'Campo demasiado largo' }), { status: 422, headers: JSON_HEADERS });
  }

  if (!resendKey) {
    console.warn('[unirse] RESEND_API_KEY not set — logging submission');
    console.log({ nombre, email, rol, organizacion, mensaje, comoConociste });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: JSON_HEADERS });
  }

  const resend = new Resend(resendKey);

  try {
    const { data, error } = await resend.emails.send({
      from:    'Cluster Tecnológico Azul <noreply@clustertecnologicoazul.org>',
      to:      [toEmail],
      replyTo: email,
      subject: `Nueva solicitud de ingreso — ${sanitizeSubject(nombre)}`,
      html: `
        <h2>Nueva solicitud de ingreso al Cluster</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:bold;color:#666">Nombre</td><td style="padding:8px">${escHtml(nombre)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#666">Email</td><td style="padding:8px"><a href="mailto:${escHtml(email)}">${escHtml(email)}</a></td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#666">Rol</td><td style="padding:8px">${escHtml(rol)}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#666">Organización</td><td style="padding:8px">${organizacion ? escHtml(organizacion) : '—'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#666">¿Cómo nos conociste?</td><td style="padding:8px">${comoConociste ? escHtml(comoConociste) : '—'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#666;vertical-align:top">Mensaje</td><td style="padding:8px;white-space:pre-wrap">${mensaje ? escHtml(mensaje) : '—'}</td></tr>
        </table>
      `,
    });

    if (error) {
      console.error('[unirse] Resend API error:', JSON.stringify(error));
      return new Response(JSON.stringify({ error: 'Error enviando email' }), { status: 500, headers: JSON_HEADERS });
    }

    console.log('[unirse] Notification sent:', data?.id);
  } catch (e) {
    console.error('[unirse] Resend threw:', e instanceof Error ? e.message : String(e));
    return new Response(JSON.stringify({ error: 'Error enviando email' }), { status: 500, headers: JSON_HEADERS });
  }

  // Auto-reply to applicant (best-effort — failure does not affect response)
  try {
    const { data, error } = await resend.emails.send({
      from:    'Cluster Tecnológico Azul <noreply@clustertecnologicoazul.org>',
      to:      [email],
      replyTo: toEmail,
      subject: 'Recibimos tu solicitud — Cluster Tecnológico Azul',
      html: `
        <p>Hola ${escHtml(nombre)},</p>
        <p>¡Gracias por sumarte! Recibimos tu solicitud para formar parte del Cluster Tecnológico Azul y ya está en nuestras manos.</p>
        <p>En los próximos días la vamos a revisar y te escribimos a este mismo correo para contarte los próximos pasos. Por ahora no tenés que hacer nada más.</p>
        <p>Nos mueve una idea simple: la tecnología no tiene fronteras geográficas, pero el impacto más profundo ocurre cuando la aplicas en el lugar donde vivís. Gracias por querer construir eso con nosotros.</p>
        <p>Cualquier duda, respondé este mail y te contestamos.</p>
        <br>
        <p>Un abrazo,<br><strong>Equipo Cluster Tecnológico Azul</strong></p>
      `,
    });

    if (error) {
      console.error('[unirse] Auto-reply error:', JSON.stringify(error));
    } else {
      console.log('[unirse] Auto-reply sent:', data?.id);
    }
  } catch (e) {
    console.error('[unirse] Auto-reply threw:', e instanceof Error ? e.message : String(e));
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: JSON_HEADERS });
};
