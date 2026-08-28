# Speak For Me — monorepo

Nx over pnpm workspaces. `apps/mobile` (Expo), `apps/web` (Next.js),
`libs/brand` (design tokens), `libs/content` (legal + landing copy).

Run tasks from the repository root: `pnpm test`, `pnpm typecheck`, `pnpm lint`,
`pnpm build`. Scope to one project with `pnpm mobile <script>` or `pnpm web <script>`.

## apps/mobile — Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before
writing any code.

This app is safety-adjacent. Every failure needs a named next channel, and every
channel needs a test proving it is still connected. Do not add a fallback without
a test that exercises it.

## apps/web — Next.js 16

App Router, Turbopack, Tailwind CSS v4. `next build` no longer runs the linter.
Colours and type come from `libs/brand` and the app's own `global.css` — do not
introduce a separate marketing palette.

## Drafts

The clinical phrase set and the legal documents are drafts awaiting review by a
clinician and a lawyer respectively. Keep their review markers in place.
