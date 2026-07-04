import type { ReactNode } from 'react';
import { I18nManager, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';
import { BigButton } from './BigButton';

interface ScreenHeaderProps {
  title: string;
  /** Optional control rendered at the trailing edge. */
  right?: ReactNode;
}

/**
 * In-screen header with an oversized, labeled back button. Icon glyphs
 * don't mirror with the layout, so the arrow direction is set explicitly.
 */
export function ScreenHeader({ title, right }: ScreenHeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
      }}
    >
      <BigButton
        onPress={() => router.back()}
        accessibilityLabel={t('common.back')}
        minSize={64}
        style={{ flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.xs }}
      >
        <MaterialCommunityIcons
          name={I18nManager.isRTL ? 'arrow-right' : 'arrow-left'}
          size={28}
          color={colors.text}
        />
        <AppText weight="medium">{t('common.back')}</AppText>
      </BigButton>

      <AppText size="lg" weight="bold" style={{ flex: 1 }} numberOfLines={1} accessibilityRole="header">
        {title}
      </AppText>

      {right}
    </View>
  );
}
