import { useEffect, useRef } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Speaks a message to the screen reader on both platforms.
 *
 * `accessibilityLiveRegion` is Android-only, so on iOS the failure
 * overlay, the speech-health warning and the wrong-PIN error announced
 * nothing at all — silence on exactly the three messages that exist to be
 * noticed. This announces explicitly, and only when the message changes,
 * so a re-render does not repeat it.
 */
export function useAnnounce(message: string | undefined) {
  const previous = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!message) {
      previous.current = undefined;
      return;
    }
    if (message === previous.current) return;
    previous.current = message;
    AccessibilityInfo.announceForAccessibility(message);
  }, [message]);
}
