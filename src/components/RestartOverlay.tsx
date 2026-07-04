import { ActivityIndicator, Modal, View } from 'react-native';

import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';

/** Full-screen notice shown while the app reloads to flip layout direction. */
export function RestartOverlay({ visible, message }: { visible: boolean; message: string }) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.xl,
          padding: spacing.xl,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText size="lg" weight="medium" style={{ textAlign: 'center' }} accessibilityLiveRegion="polite">
          {message}
        </AppText>
      </View>
    </Modal>
  );
}
