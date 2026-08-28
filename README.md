# Speak For Me

An ICU patient communication aid, and the site that explains it.

Speak For Me helps patients who cannot speak — intubated, tracheostomy, ventilated,
post-surgical — communicate by tapping large bilingual phrase buttons that the phone
speaks aloud and shows on screen. It works offline, has no account, and ships English
and Arabic together.

**It is not a nurse-call system.** It speaks a phrase out loud on the device it is
installed on. It does not alert staff or connect to hospital systems. See
[the medical disclaimer](libs/content/src/legal.ts).

## Layout

An Nx monorepo over pnpm workspaces. Nx runs and caches tasks; each project keeps its
own tooling, so the Expo app's Metro, Jest and EAS setup is untouched by the workspace.

```text
apps/
  mobile/    Expo SDK 57 app — the thing patients use
  web/       Next.js 16 + Tailwind 4 marketing and legal site
libs/
  brand/     Design tokens, lifted from the app's global.css
  content/   Legal documents and landing copy, as typed data
```

`libs/brand` exists so the site and the app cannot drift apart: the teal a nurse sees
on the bedside phone is the teal on the marketing page. The web app consumes it today;
the mobile app still owns its own `global.css` and is not yet wired to it.

## Commands

From the repository root:

```bash
pnpm install
```

```bash
pnpm dev
```

Runs the website at <http://localhost:4200>.

```bash
pnpm test
```

Runs every project's tests. `pnpm typecheck`, `pnpm lint` and `pnpm build` work the
same way, and `pnpm graph` opens the Nx project graph.

To work on one project directly:

```bash
pnpm mobile start
```

```bash
pnpm web dev
```

## apps/mobile

Expo SDK 57, React Native 0.86, expo-router, Zustand, expo-sqlite, uniwind.

The app is offline-first: SQLite on the device, seeded from a JSON file compiled into
the bundle, which also serves as the fallback when the database will not open. Speech
goes through the platform TTS engine, and every failure has a named next channel —
audio, then full-screen text, then vibration.

Tests cover the reliability paths rather than the UI: language switching, the speech
sequencing contract, the seed's completeness and reachability, the schema and settings
migrations, and PIN lockout.

```bash
pnpm mobile test
```

When adding or changing Expo APIs, check the SDK 57 documentation first:
<https://docs.expo.dev/versions/v57.0.0/>

## apps/web

Next.js 16 (App Router, Turbopack) with Tailwind CSS v4. Static — every route is
prerendered, there is no database and no API.

The design deliberately uses the mobile app's own palette and typeface rather than a
separate marketing identity, and the landing page gives "what this is not" the same
visual weight as a feature. For a safety-adjacent tool that is the first thing a
clinical reader needs, not a footnote.

## Status of the content

Two things in this repository are drafts and are marked as such where they appear:

- **The clinical phrase set** (`apps/mobile/src/data/seed/phrases.en-ar.json`) needs
  review by a nurse or speech and language therapist. Its `_reviewNotes` field records
  every judgement call made while drafting it, including the Arabic rewording.
- **The legal documents** (`libs/content/src/legal.ts`) describe the app accurately and
  are written from the source, but have not been reviewed by a lawyer.

## Licence

See [LICENSE](LICENSE).
