type SpeakOptions = {
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (e: { message: string }) => void;
};

const mockPending: { text: string; options: SpeakOptions }[] = [];

jest.mock('expo-speech', () => ({
  speak: (text: string, options: SpeakOptions) => {
    mockPending.push({ text, options });
  },
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

const flush = () => new Promise<void>((resolve) => setImmediate(() => resolve()));

/** Drives the leg that is currently waiting on the platform. */
const finishLeg = async () => {
  const leg = mockPending[mockPending.length - 1];
  leg.options.onStart?.();
  leg.options.onDone?.();
  await flush();
};

const failLeg = async () => {
  const leg = mockPending[mockPending.length - 1];
  leg.options.onError?.({ message: 'no-voice' });
  await flush();
};

const ready = { status: 'ready' as const, voices: [] };

describe('speaking a phrase in two languages', () => {
  beforeEach(() => {
    mockPending.length = 0;
    useSpeechStore.setState({ capabilities: { en: ready, ar: ready } });
    useSpeechStore.getState().resetEngineWarmth();
  });

  afterEach(() => {
    // Cancels any part still waiting on the platform, so a pending
    // sequence cannot keep a timer alive past the test.
    useSpeechStore.getState().dismissPlayback();
  });

  const parts = [
    { text: 'Call the nurse', language: 'en' as const },
    { text: 'نادِ الممرضة', language: 'ar' as const },
  ];

  it('speaks the second language only after the first finishes', async () => {
    void useSpeechStore.getState().speak(parts);
    await flush();

    expect(mockPending).toHaveLength(1);
    expect(mockPending[0].text).toBe('Call the nurse');

    await finishLeg();
    expect(mockPending).toHaveLength(2);
    expect(mockPending[1].text).toBe('نادِ الممرضة');
  });

  it('abandons the rest of the sequence when a new phrase is tapped', async () => {
    void useSpeechStore.getState().speak(parts);
    await flush();

    // The patient taps something else while the first language is playing.
    void useSpeechStore.getState().speak([{ text: 'I need water', language: 'en' }]);
    await flush();
    const afterInterrupt = mockPending.length;

    // The interrupted utterance now reports that it stopped. Its second
    // language must not follow the new phrase out of the speaker.
    mockPending[0].options.onStopped?.();
    await flush();

    expect(mockPending).toHaveLength(afterInterrupt);
    expect(mockPending.map((p) => p.text)).not.toContain('نادِ الممرضة');
  });

  it('still speaks the second language when the first has no voice', async () => {
    void useSpeechStore.getState().speak(parts);
    await flush();

    await failLeg();

    expect(mockPending).toHaveLength(2);
    expect(mockPending[1].text).toBe('نادِ الممرضة');
    expect(useSpeechStore.getState().playback.status).not.toBe('error');
  });

  it('reports failure only once both languages have failed', async () => {
    void useSpeechStore.getState().speak(parts, { emergency: true });
    await flush();

    await failLeg();
    expect(useSpeechStore.getState().playback.status).not.toBe('error');

    await failLeg();
    expect(useSpeechStore.getState().playback.status).toBe('error');
  });

  it('carries the phrase identity so duplicate text cannot light two tiles', async () => {
    void useSpeechStore.getState().speak(parts, { phraseId: 'seed:emergency:call-the-nurse' });
    await flush();

    expect(useSpeechStore.getState().playback.phraseId).toBe('seed:emergency:call-the-nurse');
  });

  it('keeps both languages on the playback so the screen can show both', async () => {
    void useSpeechStore.getState().speak(parts);
    await flush();

    expect(useSpeechStore.getState().playback.parts.map((p) => p.text)).toEqual([
      'Call the nurse',
      'نادِ الممرضة',
    ]);
  });
});
