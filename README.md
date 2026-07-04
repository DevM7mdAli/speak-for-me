# Speak For Me

Speak For Me is an ICU patient communication app built with Expo, React Native, and TypeScript. It helps patients who cannot speak, such as intubated, tracheostomy, ventilated, or post-surgery patients, communicate by tapping large bilingual phrase buttons and having the phone speak the selected phrase aloud.

The app is designed for stressful bedside use: no login, no onboarding, large touch targets, offline-first data, English and Arabic support, RTL layout handling, haptic feedback, and a one-tap emergency call button on the home screen.

## Status

Implemented in this codebase:

- Home screen with an always-visible "Call the nurse" emergency button.
- Category grid and category detail phrase grids.
- Bilingual English/Arabic seed content for emergency, basic needs, pain/body, emotions, questions, and my words.
- Offline local storage with `expo-sqlite`.
- Repository interfaces for phrases and settings, so a cloud sync layer can be added later without rewriting screens.
- Text-to-speech with `expo-speech`.
- Haptic feedback with `expo-haptics`.
- Language switching with i18next, Expo Localization, and React Native RTL reload handling.
- Tajawal font loading for Arabic and Latin text.
- Type/spell fallback screen with phrase suggestions and a persistent speak button.
- Recently used and favorite phrases screen.
- PIN-gated caregiver settings.
- Settings for language, text size, high contrast mode, speech rate, voice selection, PIN changes, and reset.
- Custom phrase editor (`/settings/edit-phrase`) with optional photo attachment via `expo-image-picker`; photos are copied into permanent app storage with `expo-file-system`.

## Tech Stack

- Expo SDK 57 managed workflow
- React Native 0.86
- React 19
- TypeScript
- Expo Router
- Zustand
- expo-sqlite
- expo-speech
- expo-haptics
- expo-localization
- expo-updates
- expo-image and expo-image-picker
- i18next and react-i18next
- @expo-google-fonts/tajawal
- @expo/vector-icons

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start the Expo development server:

```bash
pnpm start
```

Run on a platform:

```bash
pnpm ios
pnpm android
pnpm web
```

Lint:

```bash
pnpm lint
```

This project uses Expo SDK 57. When adding or changing Expo APIs, check the SDK 57 documentation first: <https://docs.expo.dev/versions/v57.0.0/>

## App Structure

```text
src/app/
  _layout.tsx             App boot, fonts, settings hydration, RTL alignment
  index.tsx               Home screen
  category/[id].tsx       Phrase category detail screen
  type-message.tsx        Free-text fallback speech screen
  my-phrases.tsx          Recently used and favorite phrases
  settings/
    _layout.tsx           PIN gate for caregiver settings
    index.tsx             Settings screen
    edit-phrase.tsx       Add/edit custom phrases with optional photo

src/components/           Reusable accessible UI controls
src/data/                 SQLite schema, models, seed data, repositories
src/hooks/                Speech and settings hooks
src/i18n/                 English/Arabic UI strings and i18next setup
src/store/                Zustand phrase/settings stores
src/theme/                Design tokens and theme helpers
```

## Data Layer

Screens and stores talk to repository interfaces instead of directly using SQLite:

- `PhraseRepository`
- `SettingsRepository`

The current implementations are local-only:

- `LocalPhraseRepository`
- `LocalSettingsRepository`

SQLite is opened, migrated, and seeded in `src/data/database.ts`. Built-in bilingual seed content lives in `src/data/seed/phrases.en-ar.json`.

The phrase model already includes future sync fields such as `syncStatus`, along with custom phrase fields such as `photoUri` and `isCustom`.

## Accessibility And ICU UX

The app is built around the original ICU constraints:

- Primary tap targets use an 88dp minimum through `MIN_TAP_TARGET`.
- Phrase taps provide visual press state, haptic feedback, and spoken audio.
- Emergency nurse call is reachable from home in one tap.
- Core phrase speaking is at most two taps from home.
- No login or onboarding blocks the patient.
- Arabic and English content ship together.
- Arabic selection forces RTL layout and reloads when needed.
- High contrast and text scaling are available from settings.
- Buttons and controls include accessibility roles and labels.

## Languages

Supported app languages:

- English
- Arabic

Speech locales:

- `en-US`
- `ar-SA`

Arabic mode uses RTL layout via `I18nManager` and reloads through `expo-updates` when the platform requires it.
