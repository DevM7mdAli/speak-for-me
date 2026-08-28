import { MAX_UTTERANCE_CHARS, finishTimeoutFor } from '../speechLimits';

/**
 * The finish timer exists to notice a stuck utterance. It must never fire
 * while speech is still going: doing so calls Speech.stop(), which cuts the
 * patient off mid-sentence and then reports the failure of something that
 * was working.
 */
describe('finishTimeoutFor', () => {
  it('gives a short phrase a floor rather than a few hundred milliseconds', () => {
    expect(finishTimeoutFor('Yes', 0.85)).toBeGreaterThanOrEqual(10_000);
  });

  it('allows more time for a longer message', () => {
    const short = finishTimeoutFor('a'.repeat(50), 0.85);
    const long = finishTimeoutFor('a'.repeat(500), 0.85);
    expect(long).toBeGreaterThan(short);
  });

  it('allows more time when the caregiver has slowed the voice down', () => {
    const normal = finishTimeoutFor('a'.repeat(400), 1.0);
    const slow = finishTimeoutFor('a'.repeat(400), 0.7);
    expect(slow).toBeGreaterThan(normal);
  });

  it('does not cut off the longest message the app will accept', () => {
    // A full-length message at the slowest rate takes well over the 45s
    // the previous fixed ceiling allowed.
    const worstCase = finishTimeoutFor('a'.repeat(MAX_UTTERANCE_CHARS), 0.7);
    expect(worstCase).toBeGreaterThan(45_000);
  });

  it('still has an upper bound so a stuck utterance is eventually reported', () => {
    expect(finishTimeoutFor('a'.repeat(MAX_UTTERANCE_CHARS), 0.7)).toBeLessThanOrEqual(300_000);
  });
});

describe('MAX_UTTERANCE_CHARS', () => {
  it('is a real number the app chose, not a platform sentinel', () => {
    // Speech.maxSpeechInputLength is Number.MAX_VALUE on iOS, which is
    // meaningless as a TextInput maxLength and can never trip a guard.
    expect(Number.isSafeInteger(MAX_UTTERANCE_CHARS)).toBe(true);
    expect(MAX_UTTERANCE_CHARS).toBeGreaterThan(200);
    expect(MAX_UTTERANCE_CHARS).toBeLessThan(4000);
  });
});
