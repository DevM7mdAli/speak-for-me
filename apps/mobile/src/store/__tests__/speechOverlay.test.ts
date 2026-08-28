import { speechOverlayMode } from '../speechOverlay';
import type { SpeechPlayback } from '../speechStore';

const playback = (over: Partial<SpeechPlayback> = {}): SpeechPlayback => ({
  requestId: 1,
  status: 'idle',
  text: 'I need water',
  language: 'en',
  parts: [],
  emergency: false,
  ...over,
});

/**
 * Audio is for the room; the screen is for the person who did not hear it.
 * The phrase therefore has to be readable for the whole time it is being
 * spoken, not only after speech has already failed.
 */
describe('speechOverlayMode', () => {
  it('shows the phrase while it is being spoken', () => {
    expect(speechOverlayMode(playback({ status: 'starting' }))).toBe('speaking');
    expect(speechOverlayMode(playback({ status: 'speaking' }))).toBe('speaking');
  });

  it('stays visible across a retry instead of blinking out', () => {
    // Retrying moves error -> starting. If the overlay keyed on 'error'
    // alone it would unmount at exactly the moment someone is holding the
    // phone up to a nurse.
    const retrying = speechOverlayMode(playback({ status: 'starting' }));
    expect(retrying).not.toBe('hidden');
  });

  it('holds the phrase through the done state so it does not flash away', () => {
    expect(speechOverlayMode(playback({ status: 'done' }))).toBe('speaking');
  });

  it('escalates to the failure treatment on error', () => {
    expect(speechOverlayMode(playback({ status: 'error' }))).toBe('failed');
  });

  it('hides when idle', () => {
    expect(speechOverlayMode(playback({ status: 'idle' }))).toBe('hidden');
  });

  it('hides when there is no text to show', () => {
    expect(speechOverlayMode(playback({ status: 'speaking', text: '' }))).toBe('hidden');
  });
});
