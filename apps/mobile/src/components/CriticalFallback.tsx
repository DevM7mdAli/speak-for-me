import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import i18n, { type AppLanguage } from '@/i18n';
import { seedPhrasesByCategory } from '@/data/seedFallback';
import { useSpeechStore } from '@/store/speechStore';
import { useAppColors } from '@/theme/useAppColors';
import { AppText } from './AppText';
import { BigButton } from './BigButton';

/** English text of the phrases that must survive any failure. */
const CRITICAL = ['Call the nurse', "I can't breathe well", 'Yes', 'No'];

/**
 * The floor the app can never drop through.
 *
 * Rendered when a screen throws. It reads from the seed compiled into the
 * bundle and talks straight to the speech store, so it does not need the
 * database, the phrase store, or the screen that just crashed to be
 * working. If speech also fails, the shared overlay still puts the phrase
 * on screen at display size.
 */
export function CriticalFallback({ message }: { message?: string }) {
  const colors = useAppColors();
  const language = (i18n.language === 'ar' ? 'ar' : 'en') as AppLanguage;

  const all = Object.values(seedPhrasesByCategory()).flat();
  const phrases = CRITICAL.map((en) => all.find((phrase) => phrase.text.en === en)).filter(
    (phrase): phrase is NonNullable<typeof phrase> => Boolean(phrase),
  );

  const speak = (text: string, emergency: boolean) => {
    void useSpeechStore.getState().speak([{ text, language }], { emergency });
  };

  return (
    <View className="flex-1 gap-3 bg-background p-4 pt-safe pb-safe">
      <AppText size="sm" muted className="text-center" accessibilityRole="header">
        {message ?? i18n.t('errors.criticalFallback')}
      </AppText>

      {phrases.map((phrase, index) => {
        const text = phrase.text[language];
        const emergency = index < 2;
        return (
          <BigButton
            key={phrase.id}
            onPress={() => speak(text, emergency)}
            accessibilityLabel={i18n.t('a11y.speaks', { text })}
            tone={emergency ? 'danger' : 'default'}
            haptic={false}
            className="flex-1 flex-row gap-3 px-4"
          >
            <MaterialCommunityIcons
              name="volume-high"
              size={36}
              color={emergency ? colors.onDanger : colors.primary}
            />
            <AppText
              size="lg"
              weight="bold"
              tone={emergency ? 'onDanger' : 'default'}
              className="flex-1"
            >
              {text}
            </AppText>
          </BigButton>
        );
      })}
    </View>
  );
}
