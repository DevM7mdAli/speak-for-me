/**
 * Canonical site configuration.
 *
 * `SITE_URL` drives `metadataBase`, the sitemap, robots and every canonical
 * link, so it lives in one place. It is read from the environment because
 * a preview deployment must not advertise the production URL as canonical —
 * doing so tells search engines to index the wrong host.
 */
/**
 * The site is served from a custom subdomain on GitHub Pages, so it lives at
 * the root and there is no base path to carry into canonicals. Override with
 * NEXT_PUBLIC_SITE_URL on a preview host so it does not advertise the
 * production URL as canonical.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://icu.mohammed-alajmi.me'
).replace(/\/$/, '');

export const SITE_NAME = 'Speak For Me';

export const SITE_DESCRIPTION =
  'A bilingual English and Arabic communication aid for intubated, ventilated and post-surgical patients. One tap speaks the phrase aloud and shows it on screen. Works offline, with no account and no network.';
