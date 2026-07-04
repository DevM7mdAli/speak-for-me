import { useCallback, useState } from 'react';
import { I18nManager, Platform } from 'react-native';
import * as Updates from 'expo-updates';

import type { AppLanguage } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';

/** Read-only convenience accessor for the current settings. */
export function useSettings() {
  return useSettingsStore((s) => s.settings);
}

/**
 * Language switching. Changing between Arabic and English flips the
 * whole layout direction, which React Native can only apply on a JS
 * reload — so we persist first, flip I18nManager, then reload.
 * `restarting` lets the caller show a "Restarting…" overlay meanwhile.
 */
export function useLanguageSwitch() {
  const update = useSettingsStore((s) => s.update);
  const [restarting, setRestarting] = useState(false);

  const switchLanguage = useCallback(
    async (language: AppLanguage) => {
      await update({ language });
      const shouldBeRTL = language === 'ar';
      if (Platform.OS !== 'web' && I18nManager.isRTL !== shouldBeRTL) {
        setRestarting(true);
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
        try {
          await Updates.reloadAsync();
        } catch {
          // Dev servers without expo-updates: direction applies on next manual reload.
          setRestarting(false);
        }
      }
    },
    [update],
  );

  return { restarting, switchLanguage };
}
