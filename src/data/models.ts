import type { ArabicForm } from '@/i18n/arabicForm';
import type { SpeechLanguageMode } from '@/i18n/speechLanguage';

export type AppTheme = 'light' | 'dark' | 'high-contrast';

/** Text that must exist in every supported language — no partial content. */
export interface LocalizedText {
  en: string;
  ar: string;
  /**
   * Only on phrases whose Arabic changes with the speaker's gender.
   * First-person present verbs (أحتاج, أشعر) are the same for everyone
   * and carry no variant.
   */
  arFeminine?: string;
}

export type SyncStatus = 'local' | 'synced' | 'pending';

export interface Phrase {
  id: string;
  categoryId: string;
  text: LocalizedText;
  /** Icon key for built-in phrases (MaterialCommunityIcons name). */
  iconName?: string;
  /** Local file uri for custom/caregiver-added phrases. */
  photoUri?: string;
  isCustom: boolean;
  isFavorite: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  /** ISO timestamp of the last time the phrase was spoken. */
  lastUsedAt?: string;
  /** Unused now, reserved for cloud sync. */
  syncStatus?: SyncStatus;
}

export interface Category {
  id: string;
  label: LocalizedText;
  iconName: string;
  sortOrder: number;
  /** True only for the always-visible nurse-call category. */
  isEmergency?: boolean;
}

export interface AppSettings {
  /** What the patient reads: UI chrome, tile text, and layout direction. */
  language: 'en' | 'ar';
  /**
   * What the room hears, which is a separate question. The patient may
   * read Arabic while the nurse on shift reads only English, and `both`
   * covers the case where nobody knows who will be at the bedside.
   */
  speechLanguage: SpeechLanguageMode;
  /** Which language leads in `both` mode. Ignored otherwise. */
  speechLanguageLead: 'en' | 'ar';
  /**
   * Grammatical form, not identity: Arabic adjectives agree with the
   * speaker, so "I am tired" is متعب or متعبة depending on who says it.
   */
  arabicForm: ArabicForm;
  /** 1.0 default, up to 1.6. */
  textScale: number;
  /**
   * Chosen by the caregiver, never followed from the OS: a bay is bright
   * by day and dark at night regardless of what the phone thinks.
   */
  theme: AppTheme;
  preferredVoiceId: { en?: string; ar?: string };
  /** 0.5–1.0; default slower than normal for clarity. */
  speechRate: number;
  /** Last time a caregiver physically confirmed audible speech per language. */
  speechCheckConfirmedAt: { en?: string; ar?: string };
  /** SHA-256 hash; unset until the caregiver first opens settings. */
  caregiverPinHash?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  // Defaults reproduce the previous behaviour exactly, so an install that
  // predates these fields keeps working the way its caregiver expects.
  speechLanguage: 'follow',
  speechLanguageLead: 'en',
  arabicForm: 'masculine',
  textScale: 1.0,
  theme: 'light',
  preferredVoiceId: {},
  speechRate: 0.85,
  speechCheckConfirmedAt: {},
};

/** Fields a caregiver provides when creating or editing a phrase. */
export interface PhraseInput {
  categoryId: string;
  text: LocalizedText;
  iconName?: string;
  photoUri?: string;
}
