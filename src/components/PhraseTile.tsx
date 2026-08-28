import { ActivityIndicator, Image, Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import type { Phrase } from '@/data/models';
import { useSettings } from '@/hooks/useSettings';
import { useSpeechStore } from '@/store/speechStore';
import { useAppColors } from '@/theme/useAppColors';
import { AppText } from './AppText';
import { BigButton } from './BigButton';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export function phraseIcon(iconName?: string): IconName {
  return iconName && iconName in MaterialCommunityIcons.glyphMap
    ? (iconName as IconName)
    : 'message-text';
}

interface PhraseTileProps {
  phrase: Phrase;
  onSpeak: (phrase: Phrase) => void;
  /** When provided, shows a favorite star in the tile corner. */
  onToggleFavorite?: (phrase: Phrase) => void;
}

/**
 * A phrase card: the whole tile is one large speak target; the
 * favorite star is a separate, single-tap secondary control.
 */
export function PhraseTile({ phrase, onSpeak, onToggleFavorite }: PhraseTileProps) {
  const colors = useAppColors();
  const { language } = useSettings();
  const { t } = useTranslation();
  const text = phrase.text[language];
  // Keyed on the phrase's identity rather than its text. Matching on text
  // lit up every tile sharing a string, and dropped the indicator halfway
  // through a phrase spoken in two languages.
  const isSpeaking = useSpeechStore(
    (state) =>
      state.playback.phraseId === phrase.id &&
      (state.playback.status === 'starting' || state.playback.status === 'speaking'),
  );

  return (
    <View className="flex-1">
      <BigButton
        onPress={() => onSpeak(phrase)}
        accessibilityLabel={t('a11y.speaks', { text })}
        accessibilityState={{ busy: isSpeaking }}
        tone={isSpeaking ? 'primary' : 'default'}
        haptic={false}
        className="min-h-36 border-accent/35 p-3"
      >
        {isSpeaking ? (
          <ActivityIndicator size="large" colorClassName="accent-on-primary" />
        ) : phrase.photoUri ? (
          <Image
            source={{ uri: phrase.photoUri }}
            className="h-16 w-16 rounded-[8px]"
            resizeMode="cover"
            accessibilityLabel={t('a11y.photoOfPhrase')}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View className="h-16 w-16 items-center justify-center rounded-full bg-background">
            <MaterialCommunityIcons
              name={phraseIcon(phrase.iconName)}
              size={36}
              color={colors.accent}
            />
          </View>
        )}
        <AppText
          size="md"
          weight="medium"
          tone={isSpeaking ? 'onPrimary' : 'default'}
          className="mt-2 px-2 text-center"
        >
          {text}
        </AppText>
      </BigButton>

      {onToggleFavorite && (
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            onToggleFavorite(phrase);
          }}
          accessibilityRole="button"
          accessibilityLabel={phrase.isFavorite ? t('myPhrases.unfavorite') : t('myPhrases.favorite')}
          accessibilityState={{ selected: phrase.isFavorite }}
          hitSlop={8}
          className="absolute top-2 end-2 h-14 w-14 items-center justify-center rounded-[8px] border border-border bg-surface active:bg-surface-pressed"
        >
          <MaterialCommunityIcons
            name={phrase.isFavorite ? 'star' : 'star-outline'}
            size={28}
            color={phrase.isFavorite ? colors.accent : colors.muted}
          />
        </Pressable>
      )}
    </View>
  );
}
