import { env } from 'cloudflare:workers';
import { CONTACT_EMAIL as DEFAULT_CONTACT_EMAIL } from '../config';

interface WorkerEnv {
  RESEND_API_KEY?: string;
  CONTACT_EMAIL?: string;
}

export const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function escHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getEmailConfig(): { resendKey: string | undefined; toEmail: string } {
  const { RESEND_API_KEY, CONTACT_EMAIL } = env as WorkerEnv;
  return {
    resendKey: RESEND_API_KEY,
    toEmail:   CONTACT_EMAIL ?? DEFAULT_CONTACT_EMAIL,
  };
}

export function parseJsonBody(raw: unknown): Record<string, unknown> | null {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

export function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}
