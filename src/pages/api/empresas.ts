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
import { CATEGORIA } from '../../config/form-options';
import { empresasAutoReply, empresasNotification } from '../../lib/email-templates';

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

  if (!CATEGORIA.allowed.has(categoria)) {
    return new Response(JSON.stringify({ error: 'Categoría inválida' }), { status: 422, headers: JSON_HEADERS });
  }

  if (empresa.length > 200 || responsable.length > 200 || mensaje.length > 2000) {
    return new Response(JSON.stringify({ error: 'Campo demasiado largo' }), { status: 422, headers: JSON_HEADERS });
  }

  if (!resendKey) {
    console.warn('[empresas] RESEND_API_KEY not set — logging submission');
    console.log({ empresa, responsable, email, categoria, mensaje });
    return new Response(JSON.stringify({ ok: true, autoReplySent: false }), { status: 200, headers: JSON_HEADERS });
  }

  const result = await sendFormEmails({
    resend: new Resend(resendKey),
    logPrefix: 'empresas',
    notification: {
      to: toEmail,
      replyTo: email,
      subject: `Nueva solicitud de asesoría: ${sanitizeSubject(CATEGORIA.label(categoria))} — ${sanitizeSubject(empresa)}`,
      html: empresasNotification({ empresa, responsable, email, categoria, mensaje }),
    },
    autoReply: {
      to: email,
      replyTo: toEmail,
      subject: `Recibimos tu consulta — ${sanitizeSubject(fromName)}`,
      html: empresasAutoReply(responsable, empresa, toEmail),
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
