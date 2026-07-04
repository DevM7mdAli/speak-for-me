import { useCallback } from 'react';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

import { SPEECH_LOCALES, type AppLanguage } from '@/i18n';
import type { Phrase } from '@/data/models';
import { usePhraseStore } from '@/store/phraseStore';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Central speech output. Every utterance:
 *  - fires a haptic pulse so a tap is confirmed even if the volume is off,
 *  - interrupts any ongoing speech (a new tap always wins),
 *  - uses the caregiver-selected voice and rate for the active language.
 */
export function useSpeech() {
  const settings = useSettingsStore((s) => s.settings);
  const recordUsage = usePhraseStore((s) => s.recordUsage);

  const speakText = useCallback(
    (text: string, language?: AppLanguage) => {
      const lang = language ?? settings.language;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Speech.stop();
      Speech.speak(text, {
        language: SPEECH_LOCALES[lang],
        voice: settings.preferredVoiceId[lang],
        rate: settings.speechRate,
      });
    },
    [settings.language, settings.preferredVoiceId, settings.speechRate],
  );

  const speakPhrase = useCallback(
    (phrase: Phrase) => {
      speakText(phrase.text[settings.language]);
      recordUsage(phrase.id);
    },
    [speakText, settings.language, recordUsage],
  );

  return { speakText, speakPhrase };
}
