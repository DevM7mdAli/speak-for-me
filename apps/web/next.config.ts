import type { NextConfig } from 'next';

const config: NextConfig = {
  // The libs are TypeScript source rather than built packages, so Next
  // has to compile them alongside the app.
  transpilePackages: ['@speak-for-me/brand', '@speak-for-me/content'],
};

export default config;
