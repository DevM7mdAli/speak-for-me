import next from 'eslint-config-next';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

// eslint-config-next v16 exports flat-config arrays, not a callable.
const config = [
  ...next,
  ...nextCoreWebVitals,
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**', 'next-env.d.ts'],
  },
  {
    // Config files are required by their tooling to default-export a literal.
    files: ['*.config.mjs', '*.config.ts'],
    rules: { 'import/no-anonymous-default-export': 'off' },
  },
];

export default config;
