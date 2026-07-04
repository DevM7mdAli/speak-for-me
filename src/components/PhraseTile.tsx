import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import type { Phrase } from '@/data/models';
import { useSettings } from '@/hooks/useSettings';
import { spacing, radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
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
  const { colors, bw } = useTheme();
  const { language } = useSettings();
  const { t } = useTranslation();
  const text = phrase.text[language];

  return (
    <View style={{ flex: 1 }}>
      <BigButton
        onPress={() => onSpeak(phrase)}
        accessibilityLabel={t('a11y.speaks', { text })}
        style={{ padding: spacing.md, minHeight: 120 }}
      >
        {phrase.photoUri ? (
          <Image
            source={{ uri: phrase.photoUri }}
            style={{ width: 56, height: 56, borderRadius: radius.sm }}
            contentFit="cover"
            accessibilityLabel={t('a11y.photoOfPhrase')}
          />
        ) : (
          <MaterialCommunityIcons name={phraseIcon(phrase.iconName)} size={40} color={colors.accent} />
        )}
        <AppText size="md" weight="medium" style={{ textAlign: 'center', marginTop: spacing.sm }}>
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
          style={({ pressed }) => ({
            position: 'absolute',
            top: spacing.xs,
            end: spacing.xs,
            width: 48,
            height: 48,
            borderRadius: radius.sm,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: pressed ? colors.surfacePressed : 'transparent',
            borderWidth: pressed ? bw : 0,
            borderColor: colors.border,
          })}
        >
          <MaterialCommunityIcons
            name={phrase.isFavorite ? 'star' : 'star-outline'}
            size={28}
            color={phrase.isFavorite ? colors.accent : colors.textMuted}
          />
        </Pressable>
      )}
    </View>
  );
}
