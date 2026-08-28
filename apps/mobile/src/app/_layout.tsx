import '@/global.css';

import { useEffect, useState } from 'react';
import { AppState, Platform, View } from 'react-native';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { setAudioModeAsync } from 'expo-audio';
import { useKeepAwake } from 'expo-keep-awake';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  useFonts,
} from '@expo-google-fonts/tajawal';
import { SafeAreaListener } from 'react-native-safe-area-context';
import { Uniwind } from 'uniwind';

import i18n from '@/i18n';
import { AppText } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { CriticalFallback } from '@/components/CriticalFallback';
import { ManualRestartNotice } from '@/components/RestartOverlay';
import { SpeechFeedbackOverlay } from '@/components/SpeechFeedbackOverlay';
import { platformDirectionDeps } from '@/hooks/useSettings';
import { applyLanguageDirection } from '@/i18n/languageSwitch';
import { usePhraseStore } from '@/store/phraseStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSpeechStore } from '@/store/speechStore';

SplashScreen.preventAutoHideAsync();

/**
 * Expo Router renders this instead of a white screen when anything below
 * throws. A crashed screen must never cost the patient their nurse call,
 * so the fallback speaks from the bundled seed rather than from any state
 * the crash may have taken with it.
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  void error;
  return (
    <>
      <CriticalFallback />
      <View className="bg-background px-4 pb-safe">
        <BigButton
          onPress={() => void retry()}
          accessibilityLabel={i18n.t('errors.retry')}
          minSize={64}
          className="px-4"
        >
          <AppText weight="medium">{i18n.t('errors.retry')}</AppText>
        </BigButton>
      </View>
      <SpeechFeedbackOverlay />
    </>
  );
}

/**
 * Boot sequence: load fonts, hydrate settings (opens + migrates + seeds
 * the database on first run), then make sure the native layout direction
 * matches the saved language — reloading once if it doesn't.
 */
export default function RootLayout() {
  // A weak or intubated patient cannot wake a sleeping phone. The screen
  // stays on for as long as the app is in the foreground.
  useKeepAwake();

  const [fontsLoaded] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
  });
  const [dataReady, setDataReady] = useState(false);
  const [needsManualRestart, setNeedsManualRestart] = useState(false);
  const theme = useSettingsStore((state) => state.settings.theme);
  const checkSpeechCapabilities = useSpeechStore((state) => state.checkCapabilities);

  useEffect(() => {
    async function boot() {
      // Kicked off first and deliberately not awaited. Probing voices is
      // what binds the platform TTS engine, and binding is slow on a cold
      // Android process — starting it here means the engine is usually
      // ready by the time the patient can reach a button, without holding
      // the splash screen hostage to a slow probe.
      void useSpeechStore.getState().checkCapabilities();

      // expo-speech uses the application audio session, so putting that
      // session in playback mode is what lets a phrase be heard on an
      // iPhone whose ringer switch is set to silent — the single most
      // likely way this app goes quiet on a real ward.
      void setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
        shouldPlayInBackground: false,
      }).catch(() => {
        // Audio routing is a bonus; never let it stop the app booting.
      });

      let settings = useSettingsStore.getState().settings;
      try {
        settings = await useSettingsStore.getState().hydrate();
        await usePhraseStore.getState().loadCategories();
      } catch {
        // SQLite is an optimisation, not the product. Fall back to the
        // seed compiled into the bundle rather than leaving the patient
        // looking at a splash screen that never goes away.
        usePhraseStore.getState().loadFromSeed();
      }

      if (Platform.OS !== 'web') {
        const outcome = await applyLanguageDirection(
          settings.language,
          platformDirectionDeps,
        );
        if (outcome.kind === 'reloaded') {
          return; // reloading — keep the splash screen up
        }
        if (outcome.kind === 'manual-restart-required') {
          // The direction is saved but cannot be applied until the app is
          // relaunched. Start anyway — a mirrored layout still speaks —
          // but say so instead of leaving the caregiver to guess.
          setNeedsManualRestart(true);
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

  useEffect(() => {
    Uniwind.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!dataReady) return;

    // The initial probe already ran during boot; this only refreshes it
    // when the app comes back to the foreground, where the caregiver may
    // have installed or removed a voice in device settings.
    let previousState = AppState.currentState;
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && previousState !== 'active') {
        void checkSpeechCapabilities();
      }
      previousState = nextState;
    });

    return () => subscription.remove();
  }, [checkSpeechCapabilities, dataReady]);

  if (!fontsLoaded || !dataReady) {
    return null;
  }

  return (
    <SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      <Stack screenOptions={{ headerShown: false }} />
      <SpeechFeedbackOverlay />
      <ManualRestartNotice
        visible={needsManualRestart}
        onDismiss={() => setNeedsManualRestart(false)}
      />
    </SafeAreaListener>
  );
}
