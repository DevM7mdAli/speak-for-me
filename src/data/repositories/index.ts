import { LocalPhraseRepository } from './LocalPhraseRepository';
import { LocalSettingsRepository } from './LocalSettingsRepository';
import type { PhraseRepository } from './PhraseRepository';
import type { SettingsRepository } from './SettingsRepository';

/**
 * Composition root. Swapping local storage for a cloud-sync
 * implementation later means changing these two lines only.
 */
export const phraseRepository: PhraseRepository = new LocalPhraseRepository();
export const settingsRepository: SettingsRepository = new LocalSettingsRepository();
