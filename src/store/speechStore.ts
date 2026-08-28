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

/** One utterance in one language. A phrase may produce more than one. */
export interface SpeechPart {
  text: string;
  language: AppLanguage;
}

export interface SpeechPlayback {
  requestId: number;
  status: PlaybackStatus;
  /** The part currently being spoken. */
  text: string;
  language: AppLanguage;
  /** Every part of this request, so the screen can show them all. */
  parts: SpeechPart[];
  emergency: boolean;
  /** Identity of the phrase that started this, when it came from one. */
  phraseId?: string;
  error?: string;
}

export interface SpeechRequestOptions {
  emergency?: boolean;
  /**
   * Lets a tile know the request is its own. Matching on text alone lit up
   * every tile sharing a string, and dropped the indicator halfway through
   * a two-language sequence.
   */
  phraseId?: string;
}

interface SpeechState {
  capabilities: Record<AppLanguage, LanguageSpeechCapability>;
  playback: SpeechPlayback;
  lastCheckedAt?: string;
  checkCapabilities: () => Promise<void>;
  /** Clears the "engine has spoken before" flag. Test seam. */
  resetEngineWarmth: () => void;
  /**
   * Speaks every part in order under a single request. A new request always
   * cancels whatever is left of the previous one.
   */
  speak: (parts: SpeechPart[], options?: SpeechRequestOptions) => Promise<boolean>;
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
  parts: [],
  emergency: false,
});

const VOICE_CHECK_TIMEOUT_MS = 5000;
/**
 * Once the platform TTS engine has spoken at least once we know it is
 * bound, so a stalled start is a real fault and five seconds is plenty.
 */
const SPEECH_START_TIMEOUT_MS = 5000;
/**
 * Before that, expo-speech is queueing the utterance until the engine
 * finishes binding — which on a cold Android process regularly exceeds
 * five seconds. Failing early here is worse than waiting: `Speech.stop()`
 * does not clear the native queue, so the app would announce that nothing
 * was said and then let the engine say it anyway.
 */
const COLD_START_TIMEOUT_MS = 12000;
const MIN_SPEECH_FINISH_TIMEOUT_MS = 10000;
const MAX_SPEECH_FINISH_TIMEOUT_MS = 45000;

let requestSequence = 0;
/** True once any utterance has reached onStart in this process. */
let engineWarm = false;
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


interface PartResult {
  spoken: boolean;
  error: string;
}

/**
 * Speaks a single part and resolves once the platform is finished with it.
 * Never rejects: a failed part is an outcome the caller has to weigh
 * against the other parts, not an exception that aborts the sequence.
 */
function speakPart(
  part: SpeechPart,
  requestId: number,
  isCurrent: () => boolean,
  set: (partial: { playback: SpeechPlayback }) => void,
  get: () => SpeechState,
): Promise<PartResult> {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (result: PartResult) => {
      if (settled) return;
      settled = true;
      if (startTimer) clearTimeout(startTimer);
      if (finishTimer) clearTimeout(finishTimer);
      startTimer = undefined;
      finishTimer = undefined;
      resolve(result);
    };

    const settings = useSettingsStore.getState().settings;
    const capability = get().capabilities[part.language];
    if (capability.status === 'unavailable') {
      settle({ spoken: false, error: 'no-language-voice' });
      return;
    }

    const selectedId = settings.preferredVoiceId[part.language];
    const selectedVoice = capability.voices.find((voice) => voice.identifier === selectedId);
    const resolvedVoice = selectedVoice ?? capability.voices.find(
      (voice) => voice.identifier === capability.resolvedVoiceId,
    );

    set({
      playback: {
        ...get().playback,
        status: 'starting',
        text: part.text,
        language: part.language,
      },
    });

    startTimer = setTimeout(
      () => {
        settle({ spoken: false, error: 'start-timeout' });
        void Speech.stop();
      },
      engineWarm ? SPEECH_START_TIMEOUT_MS : COLD_START_TIMEOUT_MS,
    );

    try {
      Speech.speak(part.text, {
        // Prefer the resolved voice's own locale: bestVoice() may have
        // fallen back from ar-SA to another Arabic variant, and passing a
        // contradicting language leaves the engine to guess.
        language: resolvedVoice?.language ?? SPEECH_LOCALES[part.language],
        voice: resolvedVoice?.identifier,
        rate: settings.speechRate,
        volume: 1,
        onStart: () => {
          engineWarm = true;
          if (!isCurrent()) return;
          if (startTimer) clearTimeout(startTimer);
          startTimer = undefined;
          set({ playback: { ...get().playback, status: 'speaking' } });

          const estimated = Math.min(
            MAX_SPEECH_FINISH_TIMEOUT_MS,
            Math.max(MIN_SPEECH_FINISH_TIMEOUT_MS, part.text.length * 350),
          );
          finishTimer = setTimeout(() => {
            settle({ spoken: false, error: 'finish-timeout' });
            void Speech.stop();
          }, estimated);
        },
        onDone: () => settle({ spoken: true, error: '' }),
        // A stop we did not ask for — a call, an alarm, backgrounding.
        // Not a failure of this part, but nothing was fully heard either.
        onStopped: () => settle({ spoken: false, error: 'speech-stopped' }),
        onError: (error) => settle({ spoken: false, error: error.message || 'speech-error' }),
      });
    } catch (error) {
      settle({
        spoken: false,
        error: error instanceof Error ? error.message : 'speech-error',
      });
    }
  });
}

export const useSpeechStore = create<SpeechState>((set, get) => ({
  capabilities: {
    en: emptyCapability(),
    ar: emptyCapability(),
  },
  playback: idlePlayback(),

  resetEngineWarmth: () => {
    engineWarm = false;
  },

  checkCapabilities: async () => {
    if (activeCheck) return activeCheck;

    activeCheck = (async () => {
      // Only the very first probe shows "checking". On later refreshes the
      // last known status is held, because the banner hides while checking
      // and a warning that blinks out every time the app is picked up is
      // worse than a slightly stale one.
      set((state) => ({
        capabilities: {
          en:
            state.lastCheckedAt === undefined
              ? { ...state.capabilities.en, status: 'checking' }
              : state.capabilities.en,
          ar:
            state.lastCheckedAt === undefined
              ? { ...state.capabilities.ar, status: 'checking' }
              : state.capabilities.ar,
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

  speak: async (parts, options = {}) => {
    const emergency = options.emergency ?? false;
    const requestId = ++requestSequence;
    clearPlaybackTimers();

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    const usable = parts
      .map((part) => ({ ...part, text: part.text.trim() }))
      .filter((part) => part.text.length > 0);

    const isCurrent = () => get().playback.requestId === requestId;

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
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      if (emergency) {
        Vibration.vibrate([0, 300, 150, 300]);
      }
    };

    set({
      playback: {
        requestId,
        status: 'starting',
        text: usable[0]?.text ?? '',
        language: usable[0]?.language ?? 'en',
        parts: usable,
        emergency,
        phraseId: options.phraseId,
      },
    });

    if (usable.length === 0) {
      fail('empty-text');
      return false;
    }

    if (usable.some((part) => part.text.length > Speech.maxSpeechInputLength)) {
      fail('text-too-long');
      return false;
    }

    try {
      await Speech.stop();
    } catch {
      // Nothing was playing, or the platform had no opinion. Either is fine.
    }
    if (!isCurrent()) return false;

    // Every part shares this request, so an interrupting tap cancels the
    // whole remaining sequence rather than letting the previous phrase
    // finish over the top of the new one.
    let anySpoken = false;
    let lastError = 'speech-error';

    for (const part of usable) {
      if (!isCurrent()) return false;

      const result = await speakPart(part, requestId, isCurrent, set, get);
      if (result.spoken) {
        anySpoken = true;
      } else {
        lastError = result.error;
      }
    }

    if (!isCurrent()) return false;

    if (!anySpoken) {
      // Only now is this a failure. A missing Arabic voice must not stop
      // the English half being heard.
      fail(lastError);
      return false;
    }

    const current = get().playback;
    set({ playback: { ...current, status: 'done' } });
    resetTimer = setTimeout(() => {
      if (get().playback.requestId === requestId) {
        set({ playback: idlePlayback(requestId) });
      }
    }, 1200);
    return true;
  },

  dismissPlayback: () => {
    const requestId = ++requestSequence;
    clearPlaybackTimers();
    void Speech.stop();
    set({ playback: idlePlayback(requestId) });
  },
}));
