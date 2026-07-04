/** Text that must exist in every supported language — no partial content. */
export interface LocalizedText {
  en: string;
  ar: string;
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
  language: 'en' | 'ar';
  /** 1.0 default, up to 1.6. */
  textScale: number;
  highContrast: boolean;
  preferredVoiceId: { en?: string; ar?: string };
  /** 0.5–1.0; default slower than normal for clarity. */
  speechRate: number;
  /** SHA-256 hash; unset until the caregiver first opens settings. */
  caregiverPinHash?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  textScale: 1.0,
  highContrast: false,
  preferredVoiceId: {},
  speechRate: 0.85,
};

/** Fields a caregiver provides when creating or editing a phrase. */
export interface PhraseInput {
  categoryId: string;
  text: LocalizedText;
  iconName?: string;
  photoUri?: string;
}
