import { useCallback } from 'react';

import { phraseTextFor } from '@/i18n/arabicForm';
import type { Phrase } from '@/data/models';
import { useSettings } from './useSettings';

/**
 * The text to display for a phrase.
 *
 * Goes through the same resolver the speech path uses, so the tile can
 * never show one Arabic form while the phone speaks the other.
 */
export function usePhraseText() {
  const settings = useSettings();
  return useCallback(
    (phrase: Phrase) => phraseTextFor(phrase, settings.language, settings.arabicForm),
    [settings.language, settings.arabicForm],
  );
}
