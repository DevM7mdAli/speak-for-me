import type { AppSettings } from '../models';

/**
 * Persistence boundary for app settings. Same contract rules as
 * PhraseRepository: UI code only ever talks to this interface.
 */
export interface SettingsRepository {
  /** Returns stored settings merged over defaults. */
  get(): Promise<AppSettings>;
  save(settings: AppSettings): Promise<void>;
  reset(): Promise<void>;
}
