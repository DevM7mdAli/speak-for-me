import type { ReactNode } from 'react';
import { I18nManager, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useAppColors } from '@/theme/useAppColors';
import { AppText } from './AppText';
import { BigButton } from './BigButton';

interface ScreenHeaderProps {
  title: string;
  /** Optional control rendered at the trailing edge. */
  right?: ReactNode;
}

/**
 * In-screen header with a large, familiar back target. Icon glyphs don't
 * mirror with the layout, so the arrow direction is set explicitly.
 */
export function ScreenHeader({ title, right }: ScreenHeaderProps) {
  const router = useRouter();
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-3 border-b border-border/60 px-4 py-2">
      <BigButton
        onPress={() => router.back()}
        accessibilityLabel={t('common.back')}
        minSize={64}
      >
        <MaterialCommunityIcons
          name={I18nManager.isRTL ? 'arrow-right' : 'arrow-left'}
          size={28}
          color={colors.foreground}
        />
      </BigButton>

      <AppText
        size="lg"
        weight="bold"
        className="flex-1"
        numberOfLines={2}
        accessibilityRole="header"
      >
        {title}
      </AppText>

      {right}
    </View>
  );
}
