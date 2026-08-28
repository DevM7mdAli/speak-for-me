import type { AppLanguage } from './index';

/**
 * What the phone says out loud, which is not the same question as what the
 * screen shows.
 *
 * A ward is bilingual in a way a single language setting cannot express:
 * the patient reads Arabic, the nurse on shift may read only English, and
 * often the honest answer is both because nobody knows who will be in the
 * room when the button is pressed.
 */
export type SpeechLanguageMode = 'follow' | 'en' | 'ar' | 'both';

export interface SpeechLanguagePreference {
  speechLanguage: SpeechLanguageMode;
  /** Which language leads in `both` mode. */
  speechLanguageLead: AppLanguage;
}

const OTHER: Record<AppLanguage, AppLanguage> = { en: 'ar', ar: 'en' };

/**
 * The languages one tap should produce, in the order they are spoken.
 *
 * `both` returns two entries and is therefore also a redundancy channel:
 * when one language has no installed voice, the other still speaks.
 */
export function resolveSpeechLanguages(
  displayLanguage: AppLanguage,
  preference: SpeechLanguagePreference,
): AppLanguage[] {
  switch (preference.speechLanguage) {
    case 'en':
    case 'ar':
      return [preference.speechLanguage];
    case 'both': {
      const lead = preference.speechLanguageLead;
      return [lead, OTHER[lead]];
    }
    default:
      return [displayLanguage];
  }
}

// Arabic block, plus the Arabic Supplement and Extended-A ranges.
const ARABIC_SCRIPT = /[؀-ۿݐ-ݿࢠ-ࣿ]/;
const LATIN_SCRIPT = /[A-Za-z]/;

/**
 * Picks a voice for text the app did not author — anything the caregiver
 * or patient typed. There is no on-device translation and there must not
 * be one, so the script itself is the only honest signal.
 */
export function detectScriptLanguage(text: string, fallback: AppLanguage): AppLanguage {
  if (ARABIC_SCRIPT.test(text)) return 'ar';
  if (LATIN_SCRIPT.test(text)) return 'en';
  return fallback;
}
