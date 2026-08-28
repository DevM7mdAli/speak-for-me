/**
 * The longest message the app will speak.
 *
 * Deliberately the app's own number rather than `Speech.maxSpeechInputLength`,
 * which is `Number.MAX_VALUE` on iOS — useless as a `TextInput` maxLength and
 * impossible to trip as a guard. Android's real ceiling is 4000; this sits
 * well inside it and far past anything an ICU patient will type by hand.
 */
export const MAX_UTTERANCE_CHARS = 600;

/** Roughly how many characters a voice gets through per second at rate 1.0. */
const CHARS_PER_SECOND = 9;
/** Generous margin: finishing late costs nothing, finishing early cuts the patient off. */
const SAFETY_FACTOR = 2;

const MIN_FINISH_MS = 10_000;
const MAX_FINISH_MS = 300_000;

/**
 * How long to wait before deciding an utterance is stuck.
 *
 * Scales with both length and the caregiver's chosen rate. The old fixed
 * 45s ceiling cut off any message past roughly 500 characters, calling
 * `Speech.stop()` mid-sentence and then showing a failure screen for
 * speech that was working perfectly.
 *
 * Erring long is safe now that the phrase is on screen for the whole
 * utterance: a slow message stays readable, where a truncated one is gone.
 */
export function finishTimeoutFor(text: string, rate: number): number {
  const safeRate = rate > 0 ? rate : 1;
  const estimatedMs = (text.length / (CHARS_PER_SECOND * safeRate)) * 1000 * SAFETY_FACTOR;
  return Math.min(MAX_FINISH_MS, Math.max(MIN_FINISH_MS, Math.round(estimatedMs)));
}
