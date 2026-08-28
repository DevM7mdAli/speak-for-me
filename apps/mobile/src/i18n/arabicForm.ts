import type { AppLanguage } from './index';

/**
 * Which Arabic grammatical form the patient uses about themselves.
 *
 * This is grammar, not identity: Arabic adjectives and participles agree
 * with the speaker, so "I am tired" is متعب or متعبة depending on who is
 * saying it. Storing one string makes the app misgender roughly half of
 * its patients every time they use it.
 */
export type ArabicForm = 'masculine' | 'feminine';

interface LocalizedPhraseText {
  en: string;
  ar: string;
  /** Only present on phrases whose Arabic actually changes. */
  arFeminine?: string;
}

/**
 * The text to show and speak for a phrase.
 *
 * Most phrases need no variant — first-person present verbs like أحتاج
 * and أشعر are the same for everyone — so `arFeminine` is the exception
 * rather than a required second translation.
 */
export function phraseTextFor(
  phrase: { text: LocalizedPhraseText },
  language: AppLanguage,
  form: ArabicForm,
): string {
  if (language !== 'ar') return phrase.text.en;
  if (form === 'feminine' && phrase.text.arFeminine?.trim()) {
    return phrase.text.arFeminine;
  }
  return phrase.text.ar;
}
