/**
 * Ambient types Expo provides, referenced from a committed file.
 *
 * Expo generates `expo-env.d.ts` with this same reference, but that file is
 * gitignored by the default template — so a fresh checkout (CI) has no
 * declaration for the `import '@/global.css'` side-effect import and
 * `tsc --noEmit` fails with TS2882.
 *
 * Referencing the types here instead makes `pnpm typecheck` pass from a
 * clean clone with no Expo command run first. The directive is idempotent,
 * so it does not conflict with the generated file when that also exists.
 */

/// <reference types="expo/types" />

export {};
