import { useCallback } from 'react';

import type { AppLanguage } from '@/i18n';
import { detectScriptLanguage, resolveSpeechLanguages } from '@/i18n/speechLanguage';
import type { Phrase } from '@/data/models';
import { usePhraseStore } from '@/store/phraseStore';
import { useSettingsStore } from '@/store/settingsStore';
import { type SpeechRequestOptions, useSpeechStore } from '@/store/speechStore';

/**
 * Central speech output. Every utterance:
 *  - fires a haptic pulse so a tap is confirmed even if the volume is off,
 *  - interrupts any ongoing speech (a new tap always wins),
 *  - uses the caregiver-selected voice and rate for each language,
 *  - reports playback progress and failures through the shared speech store.
 *
 * What the screen shows and what the phone says are separate decisions:
 * the patient may read Arabic while the nurse on shift reads only English.
 */
export function useSpeech() {
  const settings = useSettingsStore((s) => s.settings);
  const recordUsage = usePhraseStore((s) => s.recordUsage);
  const speak = useSpeechStore((s) => s.speak);

  /**
   * Free text the app did not author. There is no on-device translation,
   * so this is routed by script rather than by the speech-language
   * setting — an English sentence must never reach an Arabic voice.
   */
  const speakText = useCallback(
    (text: string, language?: AppLanguage, options?: SpeechRequestOptions) => {
      const lang = language ?? detectScriptLanguage(text, settings.language);
      return speak([{ text, language: lang }], options);
    },
    [settings.language, speak],
  );

  const speakPhrase = useCallback(
    (phrase: Phrase, options?: SpeechRequestOptions) => {
      const languages = resolveSpeechLanguages(settings.language, settings);
      const parts = languages
        .map((language) => ({ text: phrase.text[language], language }))
        .filter((part) => part.text?.trim());

      const result = speak(parts, { ...options, phraseId: phrase.id });
      // Best effort: a usage write must never hold up or fail a phrase.
      void recordUsage(phrase.id).catch(() => {});
      return result;
    },
    [speak, settings, recordUsage],
  );

  return { speakText, speakPhrase };
}
