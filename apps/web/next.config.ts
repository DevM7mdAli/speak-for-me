import type { NextConfig } from 'next';

/**
 * GitHub Pages is static hosting. `PAGES_BASE_PATH` is set in CI from
 * `actions/configure-pages` (`/repo` on a project site, empty on a
 * user/org site or custom domain). Leave it unset for local `next dev`.
 */
function pagesBasePath(): string {
  const raw = process.env.PAGES_BASE_PATH ?? '';
  if (!raw || raw === '/') return '';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

const basePath = pagesBasePath();

const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  ...(basePath ? { basePath } : {}),
  // The libs are TypeScript source rather than built packages, so Next
  // has to compile them alongside the app.
  transpilePackages: ['@speak-for-me/brand', '@speak-for-me/content'],
};

export default config;
