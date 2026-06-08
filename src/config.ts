/** Build-time / prerender defaults from `.env` via astro:env. Runtime overrides in Worker env. */
export { CONTACT_EMAIL, SITE_URL } from 'astro:env/server';
