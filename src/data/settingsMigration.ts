import { DEFAULT_SETTINGS, type AppSettings, type AppTheme } from './models';

const THEMES: AppTheme[] = ['light', 'dark', 'high-contrast'];

/**
 * Turns whatever is in the settings row into a usable `AppSettings`.
 *
 * Settings are stored as a single JSON blob, so every shape this app has
 * ever written can still come back. Unknown keys are dropped and missing
 * ones take their default, which is what lets new fields ship without a
 * schema migration — but anything whose meaning changed needs translating
 * here, or a caregiver's choice silently reverts on update.
 */
export function migrateSettings(stored: unknown): AppSettings {
  if (typeof stored !== 'object' || stored === null) {
    return { ...DEFAULT_SETTINGS };
  }

  const raw = stored as Record<string, unknown>;
  const pick = <K extends keyof AppSettings>(key: K, guard: (v: unknown) => boolean) =>
    guard(raw[key]) ? (raw[key] as AppSettings[K]) : DEFAULT_SETTINGS[key];

  // `highContrast: boolean` became `theme`. Honour the old flag only when
  // no explicit theme has been chosen since.
  const storedTheme = raw.theme;
  const theme: AppTheme = THEMES.includes(storedTheme as AppTheme)
    ? (storedTheme as AppTheme)
    : raw.highContrast === true
      ? 'high-contrast'
      : 'light';

  return {
    language: raw.language === 'ar' ? 'ar' : 'en',
    textScale: typeof raw.textScale === 'number' ? raw.textScale : DEFAULT_SETTINGS.textScale,
    theme,
    speechLanguage: pick('speechLanguage', (v) =>
      ['follow', 'en', 'ar', 'both'].includes(v as string),
    ),
    speechLanguageLead: pick('speechLanguageLead', (v) => v === 'en' || v === 'ar'),
    preferredVoiceId:
      typeof raw.preferredVoiceId === 'object' && raw.preferredVoiceId !== null
        ? (raw.preferredVoiceId as AppSettings['preferredVoiceId'])
        : {},
    speechRate: typeof raw.speechRate === 'number' ? raw.speechRate : DEFAULT_SETTINGS.speechRate,
    speechCheckConfirmedAt:
      typeof raw.speechCheckConfirmedAt === 'object' && raw.speechCheckConfirmedAt !== null
        ? (raw.speechCheckConfirmedAt as AppSettings['speechCheckConfirmedAt'])
        : {},
    caregiverPinHash:
      typeof raw.caregiverPinHash === 'string' ? raw.caregiverPinHash : undefined,
  };
}
