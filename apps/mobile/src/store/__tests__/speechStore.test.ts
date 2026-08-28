type SpeakOptions = {
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (e: { message: string }) => void;
};

const mockSpeak = jest.fn<void, [string, SpeakOptions]>();

jest.mock('expo-speech', () => ({
  speak: (text: string, options: SpeakOptions) => mockSpeak(text, options),
  stop: jest.fn().mockResolvedValue(undefined),
  getAvailableVoicesAsync: jest.fn().mockResolvedValue([]),
  maxSpeechInputLength: 4000,
  VoiceQuality: { Enhanced: 'Enhanced', Default: 'Default' },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Medium: 'Medium' },
  NotificationFeedbackType: { Error: 'Error' },
}));

jest.mock('@/data/repositories', () => ({
  phraseRepository: {},
  settingsRepository: { get: jest.fn(), save: jest.fn(), reset: jest.fn() },
}));

import { useSpeechStore } from '../speechStore';

/**
 * On Android, expo-speech queues an utterance until the TTS engine binds,
 * which on a cold process can take well over five seconds. Declaring
 * failure at five seconds shows the patient "No alert was sent" and then
 * lets the engine speak the phrase anyway once it finishes binding.
 */
describe('speak() start timeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockSpeak.mockReset();
    useSpeechStore.setState({
      capabilities: {
        en: { status: 'ready', voices: [] },
        ar: { status: 'ready', voices: [] },
      },
    });
    useSpeechStore.getState().resetEngineWarmth();
  });

  afterEach(() => {
    useSpeechStore.getState().dismissPlayback();
    jest.useRealTimers();
  });

  const status = () => useSpeechStore.getState().playback.status;

  it('waits longer than five seconds before failing a cold engine', async () => {
    // The engine never calls back — it is still binding.
    mockSpeak.mockImplementation(() => {});

    void useSpeechStore
      .getState()
      .speak([{ text: 'Call the nurse', language: 'en' }], { emergency: true });
    await jest.advanceTimersByTimeAsync(0);

    await jest.advanceTimersByTimeAsync(5_500);
    expect(status()).toBe('starting');

    await jest.advanceTimersByTimeAsync(7_000);
    expect(status()).toBe('error');
  });

  it('uses the short timeout once the engine has spoken successfully', async () => {
    mockSpeak.mockImplementation((_text, options) => {
      options.onStart?.();
      options.onDone?.();
    });
    void useSpeechStore.getState().speak([{ text: 'warm up', language: 'en' }]);
    await jest.advanceTimersByTimeAsync(0);
    expect(status()).toBe('done');

    // Engine is warm now; a subsequent utterance that stalls is a real fault.
    mockSpeak.mockImplementation(() => {});
    void useSpeechStore.getState().speak([{ text: 'I need water', language: 'en' }]);
    await jest.advanceTimersByTimeAsync(0);

    await jest.advanceTimersByTimeAsync(5_500);
    expect(status()).toBe('error');
  });
});
