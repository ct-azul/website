import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import {
  JSON_HEADERS,
  EMAIL_RE,
  sanitizeSubject,
  getEmailConfig,
  parseJsonBody,
  str,
  sendFormEmails,
} from '../../lib/email';
import { COMO, ROL } from '../../config/form-options';
import { unirseAutoReply, unirseNotification } from '../../lib/email-templates';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { resendKey, toEmail, fromName } = getEmailConfig();

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

  if (!ROL.allowed.has(rol)) {
    return new Response(JSON.stringify({ error: 'Rol inválido' }), { status: 422, headers: JSON_HEADERS });
  }

  if (comoConociste && !COMO.allowed.has(comoConociste)) {
    return new Response(JSON.stringify({ error: 'Valor inválido' }), { status: 422, headers: JSON_HEADERS });
  }

  if (nombre.length > 200 || organizacion.length > 200 || mensaje.length > 5000) {
    return new Response(JSON.stringify({ error: 'Campo demasiado largo' }), { status: 422, headers: JSON_HEADERS });
  }

  if (!resendKey) {
    console.warn('[unirse] RESEND_API_KEY not set — logging submission');
    console.log({ nombre, email, rol, organizacion, mensaje, comoConociste });
    return new Response(JSON.stringify({ ok: true, autoReplySent: false }), { status: 200, headers: JSON_HEADERS });
  }

  const result = await sendFormEmails({
    resend: new Resend(resendKey),
    logPrefix: 'unirse',
    notification: {
      to: toEmail,
      replyTo: email,
      subject: `Nueva solicitud de ingreso — ${sanitizeSubject(nombre)}`,
      html: unirseNotification({ nombre, email, rol, organizacion, mensaje, comoConociste }),
    },
    autoReply: {
      to: email,
      replyTo: toEmail,
      subject: `Recibimos tu solicitud — ${sanitizeSubject(fromName)}`,
      html: unirseAutoReply(nombre),
    },
  });

  if (!result.ok) {
    return new Response(JSON.stringify({ error: 'Error enviando email' }), { status: 500, headers: JSON_HEADERS });
  }

  return new Response(
    JSON.stringify({ ok: true, autoReplySent: result.autoReplySent }),
    { status: 200, headers: JSON_HEADERS },
  );
};
