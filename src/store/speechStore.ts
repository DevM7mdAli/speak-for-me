import { Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { create } from 'zustand';

import { SPEECH_LOCALES, type AppLanguage } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';

export type SpeechCapabilityStatus = 'checking' | 'ready' | 'degraded' | 'unavailable';
export type PlaybackStatus = 'idle' | 'starting' | 'speaking' | 'done' | 'error';

export interface LanguageSpeechCapability {
  status: SpeechCapabilityStatus;
  voices: Speech.Voice[];
  resolvedVoiceId?: string;
  issue?: 'check-failed' | 'selected-voice-missing' | 'no-language-voice';
}

export interface SpeechPlayback {
  requestId: number;
  status: PlaybackStatus;
  text: string;
  language: AppLanguage;
  emergency: boolean;
  error?: string;
}

export interface SpeechRequestOptions {
  emergency?: boolean;
}

interface SpeechState {
  capabilities: Record<AppLanguage, LanguageSpeechCapability>;
  playback: SpeechPlayback;
  lastCheckedAt?: string;
  checkCapabilities: () => Promise<void>;
  speak: (
    text: string,
    language: AppLanguage,
    options?: SpeechRequestOptions,
  ) => Promise<boolean>;
  dismissPlayback: () => void;
}

const emptyCapability = (): LanguageSpeechCapability => ({
  status: 'checking',
  voices: [],
});

const idlePlayback = (requestId = 0): SpeechPlayback => ({
  requestId,
  status: 'idle',
  text: '',
  language: 'en',
  emergency: false,
});

const VOICE_CHECK_TIMEOUT_MS = 5000;
const SPEECH_START_TIMEOUT_MS = 5000;
const MIN_SPEECH_FINISH_TIMEOUT_MS = 10000;
const MAX_SPEECH_FINISH_TIMEOUT_MS = 45000;

let requestSequence = 0;
let activeCheck: Promise<void> | undefined;
let startTimer: ReturnType<typeof setTimeout> | undefined;
let finishTimer: ReturnType<typeof setTimeout> | undefined;
let resetTimer: ReturnType<typeof setTimeout> | undefined;

function clearPlaybackTimers() {
  if (startTimer) clearTimeout(startTimer);
  if (finishTimer) clearTimeout(finishTimer);
  if (resetTimer) clearTimeout(resetTimer);
  startTimer = undefined;
  finishTimer = undefined;
  resetTimer = undefined;
}

function normalizeLocale(locale: string) {
  return locale.replace('_', '-').toLowerCase();
}

function voicesForLanguage(voices: Speech.Voice[], language: AppLanguage) {
  return voices.filter((voice) => normalizeLocale(voice.language).split('-')[0] === language);
}

function bestVoice(voices: Speech.Voice[], language: AppLanguage) {
  const target = normalizeLocale(SPEECH_LOCALES[language]);
  return [...voices].sort((a, b) => {
    const aExact = normalizeLocale(a.language) === target ? 1 : 0;
    const bExact = normalizeLocale(b.language) === target ? 1 : 0;
    if (aExact !== bExact) return bExact - aExact;
    const aEnhanced = a.quality === Speech.VoiceQuality.Enhanced ? 1 : 0;
    const bEnhanced = b.quality === Speech.VoiceQuality.Enhanced ? 1 : 0;
    return bEnhanced - aEnhanced;
  })[0];
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('voice-check-timeout')), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

export const useSpeechStore = create<SpeechState>((set, get) => ({
  capabilities: {
    en: emptyCapability(),
    ar: emptyCapability(),
  },
  playback: idlePlayback(),

  checkCapabilities: async () => {
    if (activeCheck) return activeCheck;

    activeCheck = (async () => {
      set((state) => ({
        capabilities: {
          en: { ...state.capabilities.en, status: 'checking' },
          ar: { ...state.capabilities.ar, status: 'checking' },
        },
      }));

      try {
        const allVoices = await withTimeout(
          Speech.getAvailableVoicesAsync(),
          VOICE_CHECK_TIMEOUT_MS,
        );
        const settings = useSettingsStore.getState().settings;
        const preferredVoiceId = { ...settings.preferredVoiceId };
        const speechCheckConfirmedAt = { ...settings.speechCheckConfirmedAt };
        let settingsChanged = false;

        const capabilityFor = (language: AppLanguage): LanguageSpeechCapability => {
          const voices = voicesForLanguage(allVoices, language);
          const selectedId = preferredVoiceId[language];
          const selectedVoice = voices.find((voice) => voice.identifier === selectedId);

          if (voices.length === 0) {
            if (selectedId) {
              preferredVoiceId[language] = undefined;
              settingsChanged = true;
            }
            if (speechCheckConfirmedAt[language]) {
              speechCheckConfirmedAt[language] = undefined;
              settingsChanged = true;
            }
            return { status: 'unavailable', voices, issue: 'no-language-voice' };
          }

          if (selectedId && !selectedVoice) {
            preferredVoiceId[language] = undefined;
            speechCheckConfirmedAt[language] = undefined;
            settingsChanged = true;
            return {
              status: 'degraded',
              voices,
              resolvedVoiceId: bestVoice(voices, language)?.identifier,
              issue: 'selected-voice-missing',
            };
          }

          return {
            status: 'ready',
            voices,
            resolvedVoiceId: selectedVoice?.identifier ?? bestVoice(voices, language)?.identifier,
          };
        };

        const capabilities = {
          en: capabilityFor('en'),
          ar: capabilityFor('ar'),
        };

        if (settingsChanged) {
          await useSettingsStore.getState().update({
            preferredVoiceId,
            speechCheckConfirmedAt,
          });
        }

        set({ capabilities, lastCheckedAt: new Date().toISOString() });
      } catch {
        set((state) => ({
          capabilities: {
            en: { ...state.capabilities.en, status: 'degraded', issue: 'check-failed' },
            ar: { ...state.capabilities.ar, status: 'degraded', issue: 'check-failed' },
          },
          lastCheckedAt: new Date().toISOString(),
        }));
      }
    })().finally(() => {
      activeCheck = undefined;
    });

    return activeCheck;
  },

  speak: async (text, language, options = {}) => {
    const normalizedText = text.trim();
    const emergency = options.emergency ?? false;
    const requestId = ++requestSequence;
    clearPlaybackTimers();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const fail = (error: string) => {
      const current = get().playback;
      if (
        current.requestId !== requestId ||
        (current.status !== 'starting' && current.status !== 'speaking')
      ) {
        return;
      }

      clearPlaybackTimers();
      set({ playback: { ...current, status: 'error', error } });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (emergency) {
        Vibration.vibrate([0, 300, 150, 300]);
      }
    };

    set({
      playback: {
        requestId,
        status: 'starting',
        text: normalizedText,
        language,
        emergency,
      },
    });

    if (!normalizedText) {
      fail('empty-text');
      return false;
    }

    if (normalizedText.length > Speech.maxSpeechInputLength) {
      fail('text-too-long');
      return false;
    }

    try {
      await Speech.stop();
      if (get().playback.requestId !== requestId) return false;

      const settings = useSettingsStore.getState().settings;
      const capability = get().capabilities[language];
      if (capability.status === 'unavailable') {
        fail('no-language-voice');
        return false;
      }
      const selectedId = settings.preferredVoiceId[language];
      const selectedVoice = capability.voices.find((voice) => voice.identifier === selectedId);
      const resolvedVoiceId = selectedVoice?.identifier ?? capability.resolvedVoiceId;

      startTimer = setTimeout(() => {
        fail('start-timeout');
        void Speech.stop();
      }, SPEECH_START_TIMEOUT_MS);

      Speech.speak(normalizedText, {
        language: SPEECH_LOCALES[language],
        voice: resolvedVoiceId,
        rate: settings.speechRate,
        volume: 1,
        onStart: () => {
          const current = get().playback;
          if (current.requestId !== requestId || current.status !== 'starting') return;
          if (startTimer) clearTimeout(startTimer);
          startTimer = undefined;
          set({ playback: { ...current, status: 'speaking' } });

          const estimatedTimeout = Math.min(
            MAX_SPEECH_FINISH_TIMEOUT_MS,
            Math.max(MIN_SPEECH_FINISH_TIMEOUT_MS, normalizedText.length * 350),
          );
          finishTimer = setTimeout(() => {
            fail('finish-timeout');
            void Speech.stop();
          }, estimatedTimeout);
        },
        onDone: () => {
          const current = get().playback;
          if (current.requestId !== requestId) return;
          clearPlaybackTimers();
          set({ playback: { ...current, status: 'done' } });
          resetTimer = setTimeout(() => {
            if (get().playback.requestId === requestId) {
              set({ playback: idlePlayback(requestId) });
            }
          }, 1200);
        },
        onStopped: () => fail('speech-stopped'),
        onError: (error) => fail(error.message || 'speech-error'),
      });
      return true;
    } catch (error) {
      fail(error instanceof Error ? error.message : 'speech-error');
      return false;
    }
  },

  dismissPlayback: () => {
    const requestId = ++requestSequence;
    clearPlaybackTimers();
    void Speech.stop();
    set({ playback: idlePlayback(requestId) });
  },
}));
