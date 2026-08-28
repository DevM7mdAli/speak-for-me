import type { ReactNode } from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import i18n from '@/i18n';
import { useAppColors } from '@/theme/useAppColors';
import { AppText } from './AppText';
import { BigButton } from './BigButton';

function OverlayShell({ visible, children }: { visible: boolean; children: ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center gap-6 bg-background p-6">
        {children}
      </View>
    </Modal>
  );
}

/** Full-screen notice shown while the app reloads to flip layout direction. */
export function RestartOverlay({ visible, message }: { visible: boolean; message: string }) {
  return (
    <OverlayShell visible={visible}>
      <ActivityIndicator size="large" colorClassName="accent-primary" />
      <AppText size="lg" weight="medium" className="text-center" accessibilityLiveRegion="polite">
        {message}
      </AppText>
    </OverlayShell>
  );
}

/**
 * Shown when the layout direction was saved but could not be applied,
 * because this build has no way to reload the JS runtime.
 *
 * Deliberately bilingual: at this exact moment the app is rendering one
 * language's text inside the other language's layout, so we cannot assume
 * the caregiver can read whichever one happens to be active.
 */
export function ManualRestartNotice({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  const colors = useAppColors();
  const { t } = useTranslation();
  const en = i18n.getFixedT('en');
  const ar = i18n.getFixedT('ar');

  return (
    <OverlayShell visible={visible}>
      <MaterialCommunityIcons name="restart-alert" size={64} color={colors.primary} />

      <View className="w-full max-w-xl gap-5" accessibilityLiveRegion="assertive">
        <View className="gap-2">
          <AppText size="lg" weight="bold" className="text-center">
            {en('language.manualRestartTitle')}
          </AppText>
          <AppText weight="medium" muted className="text-center">
            {en('language.manualRestartBody')}
          </AppText>
        </View>

        <View className="gap-2">
          <AppText size="lg" weight="bold" className="text-center">
            {ar('language.manualRestartTitle')}
          </AppText>
          <AppText weight="medium" muted className="text-center">
            {ar('language.manualRestartBody')}
          </AppText>
        </View>
      </View>

      <BigButton
        onPress={onDismiss}
        accessibilityLabel={t('common.close')}
        minSize={64}
        className="w-full max-w-xl px-4"
      >
        <AppText weight="medium">{t('common.close')}</AppText>
      </BigButton>
    </OverlayShell>
  );
}
