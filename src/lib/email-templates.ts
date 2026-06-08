import { asuntoLabel, categoriaLabel, comoLabel, rolLabel } from '../config/form-options';
import { escHtml } from './email';
import { getRuntimeConfig } from './env';

function tableRow(label: string, value: string): string {
  return `<tr><td style="padding:8px;font-weight:bold;color:#666">${escHtml(label)}</td><td style="padding:8px">${value}</td></tr>`;
}

function dataTable(rows: string): string {
  return `<table style="border-collapse:collapse;width:100%">${rows}</table>`;
}

export function emailLayout(body: string): string {
  const { siteUrl } = getRuntimeConfig();
  return `
    <div style="font-family:IBM Plex Sans,Arial,sans-serif;font-size:15px;line-height:1.65;color:#0f1e35;max-width:560px">
      ${body}
      <hr style="border:none;border-top:1px solid #c5d3e8;margin:28px 0 16px">
      <p style="font-size:13px;color:#607a96;margin:0">
        <a href="${escHtml(siteUrl)}" style="color:#1a6ff0">Cluster Tecnológico Azul</a> · Azul, Buenos Aires, Argentina
      </p>
    </div>
  `;
}

function signOff(): string {
  return `<p>Un abrazo,<br><strong>el equipo de Cluster Tecnológico Azul</strong></p>`;
}

function replyHint(): string {
  return '<p>Cualquier duda, respondé este mail y te contestamos.</p>';
}

// ── Unirse ────────────────────────────────────────────────────

export function unirseNotification(data: {
  nombre: string;
  email: string;
  rol: string;
  organizacion: string;
  mensaje: string;
  comoConociste: string;
}): string {
  const rows = [
    tableRow('Nombre', escHtml(data.nombre)),
    tableRow('Email', `<a href="mailto:${escHtml(data.email)}">${escHtml(data.email)}</a>`),
    tableRow('Rol', escHtml(rolLabel(data.rol))),
    tableRow('Organización', data.organizacion ? escHtml(data.organizacion) : '—'),
    tableRow('¿Cómo nos conociste?', data.comoConociste ? escHtml(comoLabel(data.comoConociste)) : '—'),
    tableRow('Mensaje', `<span style="white-space:pre-wrap">${data.mensaje ? escHtml(data.mensaje) : '—'}</span>`),
  ].join('');
  return emailLayout(`<h2 style="margin-top:0">Nueva solicitud de ingreso al Cluster</h2>${dataTable(rows)}`);
}

export function unirseAutoReply(nombre: string): string {
  return emailLayout(`
    <p>Hola ${escHtml(nombre)},</p>
    <p>¡Gracias por sumarte! Recibimos tu solicitud para formar parte del Cluster Tecnológico Azul y ya está en nuestras manos.</p>
    <p>En los próximos días la vamos a revisar y te escribimos a este mismo correo para contarte los próximos pasos. Por ahora no tenés que hacer nada más.</p>
    <p>Nos mueve una idea simple: la tecnología no tiene fronteras geográficas, pero el impacto más profundo ocurre cuando la aplicas en el lugar donde vivís. Gracias por querer construir eso con nosotros.</p>
    ${replyHint()}
    ${signOff()}
  `);
}

// ── Contacto ────────────────────────────────────────────────

export function contactoNotification(data: {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}): string {
  const rows = [
    tableRow('Nombre', escHtml(data.nombre)),
    tableRow('Email', `<a href="mailto:${escHtml(data.email)}">${escHtml(data.email)}</a>`),
    tableRow('Asunto', escHtml(asuntoLabel(data.asunto))),
    tableRow('Mensaje', `<span style="white-space:pre-wrap">${escHtml(data.mensaje)}</span>`),
  ].join('');
  return emailLayout(`<h2 style="margin-top:0">Nuevo mensaje de contacto</h2>${dataTable(rows)}`);
}

export function contactoAutoReply(nombre: string): string {
  return emailLayout(`
    <p>Hola ${escHtml(nombre)},</p>
    <p>Recibimos tu mensaje. ¡Gracias por escribirnos!</p>
    <p>Lo vamos a leer con atención y te respondemos a este mismo correo a la brevedad.</p>
    ${replyHint()}
    ${signOff()}
  `);
}

// ── Empresas (legacy) ───────────────────────────────────────

export function empresasNotification(data: {
  empresa: string;
  responsable: string;
  email: string;
  categoria: string;
  mensaje: string;
}): string {
  const rows = [
    tableRow('Empresa', escHtml(data.empresa)),
    tableRow('Responsable', escHtml(data.responsable)),
    tableRow('Email', `<a href="mailto:${escHtml(data.email)}">${escHtml(data.email)}</a>`),
    tableRow('Área de asesoría', escHtml(categoriaLabel(data.categoria))),
    tableRow('Mensaje', `<span style="white-space:pre-wrap">${data.mensaje ? escHtml(data.mensaje) : '—'}</span>`),
  ].join('');
  return emailLayout(`<h2 style="margin-top:0">Nueva solicitud de asesoría</h2>${dataTable(rows)}`);
}

export function empresasAutoReply(responsable: string, empresa: string, contactEmail: string): string {
  return emailLayout(`
    <p>Hola ${escHtml(responsable)},</p>
    <p>Recibimos tu solicitud de asesoría para <strong>${escHtml(empresa)}</strong>. ¡Muchas gracias por tu interés!</p>
    <p>Nos pondremos en contacto con vos en menos de 48 horas hábiles para coordinar los próximos pasos.</p>
    <p>Si tenés alguna consulta adicional, podés escribirnos directamente a
      <a href="mailto:${escHtml(contactEmail)}">${escHtml(contactEmail)}</a>.
    </p>
    ${signOff()}
  `);
}
