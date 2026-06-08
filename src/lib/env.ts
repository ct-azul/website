import { env } from 'cloudflare:workers';
import {
  CONTACT_EMAIL as DEFAULT_CONTACT_EMAIL,
  FROM_NAME as DEFAULT_FROM_NAME,
  NOREPLY_EMAIL as DEFAULT_NOREPLY_EMAIL,
  SITE_URL as DEFAULT_SITE_URL,
} from 'astro:env/server';

interface WorkerEnv {
  RESEND_API_KEY?: string;
  CONTACT_EMAIL?: string;
  SITE_URL?: string;
  NOREPLY_EMAIL?: string;
  FROM_NAME?: string;
}

export interface RuntimeConfig {
  resendKey: string | undefined;
  contactEmail: string;
  siteUrl: string;
  fromName: string;
  fromAddress: string;
}

/** Worker runtime env overrides `.env` / astro:env defaults (see `.env.example`). */
export function getRuntimeConfig(): RuntimeConfig {
  const worker = env as WorkerEnv;
  const contactEmail = worker.CONTACT_EMAIL ?? DEFAULT_CONTACT_EMAIL;
  const siteUrl = worker.SITE_URL ?? DEFAULT_SITE_URL;
  const noreplyEmail = worker.NOREPLY_EMAIL ?? DEFAULT_NOREPLY_EMAIL;
  const fromName = worker.FROM_NAME ?? DEFAULT_FROM_NAME;

  return {
    resendKey: worker.RESEND_API_KEY,
    contactEmail,
    siteUrl,
    fromName,
    fromAddress: `${fromName} <${noreplyEmail}>`,
  };
}
