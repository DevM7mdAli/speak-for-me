import { bedsideReadiness } from '../readiness';
import { DEFAULT_SETTINGS } from '@/data/models';

const ready = { status: 'ready' as const, voices: [] };
const missing = { status: 'unavailable' as const, voices: [] };

const settings = (over = {}) => ({ ...DEFAULT_SETTINGS, ...over });

/**
 * "Ready for the bedside" is a question about this device right now, not a
 * checklist someone ticks. Every item is derived from real state, so it
 * cannot say ready while the phone has no voice installed.
 */
describe('bedsideReadiness', () => {
  it('is not ready before a caregiver PIN exists', () => {
    const result = bedsideReadiness(settings(), { en: ready, ar: ready });
    const pin = result.items.find((i) => i.id === 'pin');
    expect(pin?.done).toBe(false);
    expect(result.ready).toBe(false);
  });

  it('is not ready while a language it will speak has no voice', () => {
    const result = bedsideReadiness(
      settings({ caregiverPinHash: 'x', speechLanguage: 'ar' }),
      { en: ready, ar: missing },
    );
    expect(result.items.find((i) => i.id === 'voice-ar')?.done).toBe(false);
    expect(result.ready).toBe(false);
  });

  it('ignores a missing voice in a language it will never speak', () => {
    const result = bedsideReadiness(
      settings({
        caregiverPinHash: 'x',
        speechLanguage: 'en',
        speechCheckConfirmedAt: { en: '2026-01-01T00:00:00.000Z' },
      }),
      { en: ready, ar: missing },
    );
    expect(result.items.some((i) => i.id === 'voice-ar')).toBe(false);
    expect(result.ready).toBe(true);
  });

  it('checks both languages when the phone is set to speak both', () => {
    const result = bedsideReadiness(
      settings({ caregiverPinHash: 'x', speechLanguage: 'both' }),
      { en: ready, ar: ready },
    );
    expect(result.items.some((i) => i.id === 'voice-en')).toBe(true);
    expect(result.items.some((i) => i.id === 'voice-ar')).toBe(true);
  });

  it('requires a human to confirm sound was actually audible', () => {
    // A voice being installed is not evidence anybody heard it: the phone
    // may be on silent, or the volume down.
    const result = bedsideReadiness(
      settings({ caregiverPinHash: 'x', speechLanguage: 'en' }),
      { en: ready, ar: ready },
    );
    expect(result.items.find((i) => i.id === 'heard-en')?.done).toBe(false);
    expect(result.ready).toBe(false);
  });

  it('reports ready once every derived item passes', () => {
    const result = bedsideReadiness(
      settings({
        caregiverPinHash: 'x',
        speechLanguage: 'both',
        speechCheckConfirmedAt: {
          en: '2026-01-01T00:00:00.000Z',
          ar: '2026-01-01T00:00:00.000Z',
        },
      }),
      { en: ready, ar: ready },
    );
    expect(result.ready).toBe(true);
  });
});
