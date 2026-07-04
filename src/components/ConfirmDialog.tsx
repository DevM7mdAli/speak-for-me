import { Modal, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { spacing, radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';
import { BigButton } from './BigButton';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Replacement for Alert: every action is an explicit, oversized,
 * labeled button — nothing is dismissed by tapping outside or swiping.
 */
export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { colors, bw } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          padding: spacing.xl,
        }}
      >
        <View
          accessibilityViewIsModal
          style={{
            backgroundColor: colors.background,
            borderRadius: radius.lg,
            borderWidth: bw,
            borderColor: colors.border,
            padding: spacing.xl,
            gap: spacing.lg,
          }}
        >
          <AppText size="lg" weight="bold" accessibilityRole="header">
            {title}
          </AppText>
          <AppText muted>{body}</AppText>

          <BigButton
            onPress={onConfirm}
            accessibilityLabel={confirmLabel}
            color={destructive ? colors.danger : colors.primary}
            pressedColor={destructive ? colors.dangerPressed : colors.primaryPressed}
            style={{ padding: spacing.md }}
          >
            <AppText weight="bold" color={destructive ? colors.onDanger : colors.onPrimary}>
              {confirmLabel}
            </AppText>
          </BigButton>

          <BigButton onPress={onCancel} accessibilityLabel={t('common.cancel')} style={{ padding: spacing.md }}>
            <AppText weight="medium">{t('common.cancel')}</AppText>
          </BigButton>
        </View>
      </View>
    </Modal>
  );
}
