import type { AppLanguage } from './index';

/**
 * What happened when we tried to make the native layout direction match
 * the chosen language.
 *
 * `manual-restart-required` is the case the app used to swallow. React
 * Native can only apply a direction change on a fresh JS runtime, and
 * this project ships with expo-updates disabled, so `reloadAsync()`
 * always rejects. The caller has to tell the caregiver to relaunch —
 * resolving quietly leaves Arabic text inside an LTR layout with no
 * explanation at the bedside.
 */
export type LanguageSwitchOutcome =
  | { kind: 'already-correct' }
  | { kind: 'reloaded' }
  | { kind: 'manual-restart-required'; reason: 'reload-unavailable' | 'reload-failed' };

export interface LanguageDirectionDeps {
  /** Current native layout direction. */
  isRTL: boolean;
  /** Whether a JS-runtime reload is actually available on this build. */
  canReload: boolean;
  forceRTL: (rtl: boolean) => void;
  reload: () => Promise<void>;
}

/**
 * Aligns the native layout direction with `language`, reporting which of
 * the three possible endings occurred. Deliberately free of React and of
 * expo-updates so the bedside contract can be tested directly.
 */
export async function applyLanguageDirection(
  language: AppLanguage,
  deps: LanguageDirectionDeps,
): Promise<LanguageSwitchOutcome> {
  const shouldBeRTL = language === 'ar';

  if (deps.isRTL === shouldBeRTL) {
    return { kind: 'already-correct' };
  }

  // Persisted natively, so the direction is correct on the next cold
  // launch even when we cannot reload right now.
  deps.forceRTL(shouldBeRTL);

  if (!deps.canReload) {
    return { kind: 'manual-restart-required', reason: 'reload-unavailable' };
  }

  try {
    await deps.reload();
    return { kind: 'reloaded' };
  } catch {
    return { kind: 'manual-restart-required', reason: 'reload-failed' };
  }
}
