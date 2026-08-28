import { useCallback, useState } from 'react';
import { I18nManager, Platform } from 'react-native';
import * as Updates from 'expo-updates';

import type { AppLanguage } from '@/i18n';
import { applyLanguageDirection } from '@/i18n/languageSwitch';
import { useSettingsStore } from '@/store/settingsStore';

/** Read-only convenience accessor for the current settings. */
export function useSettings() {
  return useSettingsStore((s) => s.settings);
}

/** Binds the direction switch to the real platform. */
export const platformDirectionDeps = {
  get isRTL() {
    return I18nManager.isRTL;
  },
  get canReload() {
    // False in this project: expo-updates is disabled in the native
    // config, so reloadAsync() rejects with ERR_UPDATES_RELOAD.
    return Updates.isEnabled;
  },
  forceRTL: (rtl: boolean) => {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
  },
  reload: () => Updates.reloadAsync(),
};

/**
 * Language switching. Changing between Arabic and English flips the whole
 * layout direction, which React Native can only apply on a JS reload.
 *
 * When that reload is unavailable the switch cannot finish on its own, and
 * the caregiver has to relaunch the app. `manualRestart` exists so the
 * caller can say that out loud — the previous version swallowed the error
 * and left Arabic text sitting in an LTR layout with no explanation.
 */
export function useLanguageSwitch() {
  const update = useSettingsStore((s) => s.update);
  const [restarting, setRestarting] = useState(false);
  const [manualRestart, setManualRestart] = useState(false);

  const switchLanguage = useCallback(
    async (language: AppLanguage) => {
      await update({ language });
      if (Platform.OS === 'web') return;

      setRestarting(true);
      const outcome = await applyLanguageDirection(language, platformDirectionDeps);

      if (outcome.kind === 'reloaded') {
        // The runtime is going away — keep the overlay up until it does.
        return;
      }
      setRestarting(false);
      if (outcome.kind === 'manual-restart-required') {
        setManualRestart(true);
      }
    },
    [update],
  );

  return {
    restarting,
    manualRestart,
    dismissManualRestart: useCallback(() => setManualRestart(false), []),
    switchLanguage,
  };
}
