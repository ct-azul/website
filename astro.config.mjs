// @ts-check
import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { loadEnv } from 'vite';

const defaultSite = 'https://clustertecnologicoazul.org';
const viteEnv = loadEnv(process.env.MODE ?? 'production', process.cwd(), '');

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  site: viteEnv.SITE_URL || defaultSite,
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_EMAIL: envField.string({
        context: 'server',
        access: 'public',
        default: 'info@clustertecnologicoazul.org',
      }),
      SITE_URL: envField.string({ context: 'server', access: 'public', default: defaultSite }),
      NOREPLY_EMAIL: envField.string({
        context: 'server',
        access: 'public',
        default: 'noreply@clustertecnologicoazul.org',
      }),
      FROM_NAME: envField.string({
        context: 'server',
        access: 'public',
        default: 'Cluster Tecnológico Azul',
      }),
    },
  },
});
