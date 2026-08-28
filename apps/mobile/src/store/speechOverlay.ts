import type { SpeechPlayback } from './speechStore';

/**
 * `speaking` — the phrase is being said and is shown at display size so
 * someone who did not hear it can still read it.
 * `failed` — nothing audible happened; the screen is now the only channel.
 */
export type SpeechOverlayMode = 'hidden' | 'speaking' | 'failed';

/**
 * Decides what the full-screen phrase channel should be doing.
 *
 * Kept separate from the component because the important property is a
 * timing one: the overlay must not unmount between a retry starting and
 * that retry failing. Keying visibility on `status === 'error'` alone made
 * the giant text disappear for the whole retry attempt.
 */
export function speechOverlayMode(playback: SpeechPlayback): SpeechOverlayMode {
  if (!playback.text.trim()) return 'hidden';

  switch (playback.status) {
    case 'starting':
    case 'speaking':
    // Held so the phrase does not flash away the instant speech ends; the
    // store drops to idle a moment later.
    case 'done':
      return 'speaking';
    case 'error':
      return 'failed';
    default:
      return 'hidden';
  }
}
