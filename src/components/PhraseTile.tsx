import { Image, Pressable, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import type { Phrase } from '@/data/models';
import { useSettings } from '@/hooks/useSettings';
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

  return (
    <View className="flex-1">
      <BigButton
        onPress={() => onSpeak(phrase)}
        accessibilityLabel={t('a11y.speaks', { text })}
        className="min-h-[132px] border-accent/35 p-3"
      >
        {phrase.photoUri ? (
          <Image
            source={{ uri: phrase.photoUri }}
            className="h-14 w-14 rounded-[10px]"
            resizeMode="cover"
            accessibilityLabel={t('a11y.photoOfPhrase')}
          />
        ) : (
          <MaterialCommunityIcons name={phraseIcon(phrase.iconName)} size={40} color={colors.accent} />
        )}
        <AppText size="md" weight="medium" className="mt-2 text-center">
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
          className="absolute top-1 end-1 h-12 w-12 items-center justify-center rounded-[10px] active:border-2 active:border-border active:bg-surface-pressed"
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
