import '@/i18n';

import { useEffect, useState } from 'react';
import { I18nManager, Platform } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import { StatusBar } from 'expo-status-bar';
import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  useFonts,
} from '@expo-google-fonts/tajawal';

import { usePhraseStore } from '@/store/phraseStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTheme } from '@/theme/useTheme';

SplashScreen.preventAutoHideAsync();

/**
 * Boot sequence: load fonts, hydrate settings (opens + migrates + seeds
 * the database on first run), then make sure the native layout direction
 * matches the saved language — reloading once if it doesn't.
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
  });
  const [dataReady, setDataReady] = useState(false);
  const { highContrast } = useTheme();

  useEffect(() => {
    async function boot() {
      const settings = await useSettingsStore.getState().hydrate();
      await usePhraseStore.getState().loadCategories();

      const shouldBeRTL = settings.language === 'ar';
      if (Platform.OS !== 'web' && I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
        try {
          await Updates.reloadAsync();
          return; // reloading — keep the splash screen up
        } catch {
          // Dev server without updates: continue with the wrong direction
          // rather than blocking the app.
        }
      }
      setDataReady(true);
    }
    boot();
  }, []);

  useEffect(() => {
    if (fontsLoaded && dataReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dataReady]);

  if (!fontsLoaded || !dataReady) {
    return null;
  }

  return (
    <>
      <StatusBar style={highContrast ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
