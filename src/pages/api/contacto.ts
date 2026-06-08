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
import { ASUNTO } from '../../config/form-options';
import { contactoAutoReply, contactoNotification } from '../../lib/email-templates';

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

  if (!ASUNTO.allowed.has(asunto)) {
    return new Response(JSON.stringify({ error: 'Asunto inválido' }), { status: 422, headers: JSON_HEADERS });
  }

  if (nombre.length > 200 || mensaje.length > 5000) {
    return new Response(JSON.stringify({ error: 'Campo demasiado largo' }), { status: 422, headers: JSON_HEADERS });
  }

  if (!resendKey) {
    console.warn('[contacto] RESEND_API_KEY not set — logging submission');
    console.log({ nombre, email, asunto, mensaje });
    return new Response(JSON.stringify({ ok: true, autoReplySent: false }), { status: 200, headers: JSON_HEADERS });
  }

  const result = await sendFormEmails({
    resend: new Resend(resendKey),
    logPrefix: 'contacto',
    notification: {
      to: toEmail,
      replyTo: email,
      subject: `Nuevo contacto: ${sanitizeSubject(ASUNTO.label(asunto))} — ${sanitizeSubject(nombre)}`,
      html: contactoNotification({ nombre, email, asunto, mensaje }),
    },
    autoReply: {
      to: email,
      replyTo: toEmail,
      subject: `Recibimos tu mensaje — ${sanitizeSubject(fromName)}`,
      html: contactoAutoReply(nombre),
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
