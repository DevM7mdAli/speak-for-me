import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { usePhraseText } from '@/hooks/usePhraseText';
import { useSpeech } from '@/hooks/useSpeech';
import { usePhraseStore } from '@/store/phraseStore';
import { useSpeechStore } from '@/store/speechStore';
import { useAppColors } from '@/theme/useAppColors';
import { AppText } from './AppText';
import { BigButton } from './BigButton';
import { phraseIcon } from './PhraseTile';

export const EMERGENCY_CATEGORY_ID = 'emergency';

/**
 * Urgent speech, reachable in one tap from wherever the patient already is.
 *
 * Renders the whole emergency category rather than a fixed pair of slots,
 * so a phrase added to it — suction, "I need to cough", "the tube hurts" —
 * is actually reachable instead of being seeded into a category with no
 * surface. Scrolls horizontally when the set outgrows the screen.
 */
export function EmergencyStrip() {
  const { t } = useTranslation();
  const colors = useAppColors();
  const { speakPhrase, speakText } = useSpeech();
  const phraseText = usePhraseText();

  const phrases = usePhraseStore((s) => s.phrasesByCategory[EMERGENCY_CATEGORY_ID]);
  const loadCategory = usePhraseStore((s) => s.loadCategory);
  const playback = useSpeechStore((state) => state.playback);

  useEffect(() => {
    if (!phrases) {
      loadCategory(EMERGENCY_CATEGORY_ID);
    }
  }, [phrases, loadCategory]);

  const speechActive = playback.status === 'starting' || playback.status === 'speaking';

  // If the row could not be read, the button still speaks — the wording
  // ships in the bundle, so an unreadable database never costs the patient
  // their nurse call.
  if (!phrases || phrases.length === 0) {
    return (
      <View className="border-b-2 border-danger/40 px-4 py-2">
        <BigButton
          onPress={() => speakText(t('home.callNurse'), undefined, { emergency: true })}
          accessibilityLabel={t('a11y.emergencyButton')}
          tone="danger"
          haptic={false}
          className="flex-row gap-3 px-4"
        >
          <MaterialCommunityIcons name="volume-high" size={32} color={colors.onDanger} />
          <AppText size="lg" weight="bold" tone="onDanger">
            {t('home.callNurse')}
          </AppText>
        </BigButton>
      </View>
    );
  }

  return (
    <View className="border-b-2 border-danger/40">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 px-4 py-2"
        keyboardShouldPersistTaps="handled"
      >
        {phrases.map((phrase) => {
          const text = phraseText(phrase);
          const busy = speechActive && playback.phraseId === phrase.id;
          return (
            <BigButton
              key={phrase.id}
              onPress={() => speakPhrase(phrase, { emergency: true })}
              accessibilityLabel={t('a11y.speaks', { text })}
              accessibilityState={{ busy }}
              tone="danger"
              haptic={false}
              className="flex-row gap-2 px-4"
            >
              {busy ? (
                <ActivityIndicator colorClassName="accent-on-danger" />
              ) : (
                <MaterialCommunityIcons
                  name={phraseIcon(phrase.iconName)}
                  size={30}
                  color={colors.onDanger}
                />
              )}
              <AppText weight="bold" tone="onDanger" numberOfLines={2} className="max-w-56">
                {text}
              </AppText>
            </BigButton>
          );
        })}
      </ScrollView>
    </View>
  );
}
