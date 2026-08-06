import { useCallback } from 'react';

import type { AppLanguage } from '@/i18n';
import type { Phrase } from '@/data/models';
import { usePhraseStore } from '@/store/phraseStore';
import { useSettingsStore } from '@/store/settingsStore';
import { type SpeechRequestOptions, useSpeechStore } from '@/store/speechStore';

/**
 * Central speech output. Every utterance:
 *  - fires a haptic pulse so a tap is confirmed even if the volume is off,
 *  - interrupts any ongoing speech (a new tap always wins),
 *  - uses the caregiver-selected voice and rate for the active language,
 *  - reports playback progress and failures through the shared speech store.
 */
export function useSpeech() {
  const settings = useSettingsStore((s) => s.settings);
  const recordUsage = usePhraseStore((s) => s.recordUsage);
  const speak = useSpeechStore((s) => s.speak);

  const speakText = useCallback(
    (text: string, language?: AppLanguage, options?: SpeechRequestOptions) => {
      const lang = language ?? settings.language;
      return speak(text, lang, options);
    },
    [settings.language, speak],
  );

  const speakPhrase = useCallback(
    (phrase: Phrase, options?: SpeechRequestOptions) => {
      const result = speakText(phrase.text[settings.language], settings.language, options);
      recordUsage(phrase.id);
      return result;
    },
    [speakText, settings.language, recordUsage],
  );

  return { speakText, speakPhrase };
}
