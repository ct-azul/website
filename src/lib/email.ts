import type { Resend } from 'resend';
import { getRuntimeConfig } from './env';

export const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizeSubject(s: string): string {
  return s.replace(/[\r\n]/g, ' ');
}

export function escHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getEmailConfig(): { resendKey: string | undefined; toEmail: string; fromName: string } {
  const { resendKey, contactEmail, fromName } = getRuntimeConfig();
  return { resendKey, toEmail: contactEmail, fromName };
}

export function parseJsonBody(raw: unknown): Record<string, unknown> | null {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

export function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

export interface FormEmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export interface SendFormEmailsOptions {
  resend: Resend;
  logPrefix: string;
  notification: FormEmailMessage;
  autoReply?: FormEmailMessage;
}

/** Sends cluster notification (critical) + optional user auto-reply (best-effort). */
export async function sendFormEmails({
  resend,
  logPrefix,
  notification,
  autoReply,
}: SendFormEmailsOptions): Promise<{ ok: true; autoReplySent: boolean } | { ok: false }> {
  const { fromAddress } = getRuntimeConfig();

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: Array.isArray(notification.to) ? notification.to : [notification.to],
      replyTo: notification.replyTo,
      subject: notification.subject,
      html: notification.html,
    });

    if (error) {
      console.error(`[${logPrefix}] Notification error:`, JSON.stringify(error));
      return { ok: false };
    }

    console.log(`[${logPrefix}] Notification sent:`, data?.id);
  } catch (e) {
    console.error(`[${logPrefix}] Notification threw:`, e instanceof Error ? e.message : String(e));
    return { ok: false };
  }

  if (!autoReply) return { ok: true, autoReplySent: false };

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: Array.isArray(autoReply.to) ? autoReply.to : [autoReply.to],
      replyTo: autoReply.replyTo,
      subject: autoReply.subject,
      html: autoReply.html,
    });

    if (error) {
      console.error(`[${logPrefix}] Auto-reply error:`, JSON.stringify(error));
      return { ok: true, autoReplySent: false };
    }

    console.log(`[${logPrefix}] Auto-reply sent:`, data?.id);
    return { ok: true, autoReplySent: true };
  } catch (e) {
    console.error(`[${logPrefix}] Auto-reply threw:`, e instanceof Error ? e.message : String(e));
    return { ok: true, autoReplySent: false };
  }
}
