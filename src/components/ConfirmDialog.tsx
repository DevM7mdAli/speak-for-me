import { Modal, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 justify-center bg-black/60 p-6">
        <View accessibilityViewIsModal className="gap-4 rounded-dialog border-2 border-border bg-background p-6 high-contrast:border-[3px]">
          <AppText size="lg" weight="bold" accessibilityRole="header">
            {title}
          </AppText>
          <AppText muted>{body}</AppText>

          <BigButton
            onPress={onConfirm}
            accessibilityLabel={confirmLabel}
            tone={destructive ? 'danger' : 'primary'}
            className="p-3"
          >
            <AppText weight="bold" tone={destructive ? 'onDanger' : 'onPrimary'}>
              {confirmLabel}
            </AppText>
          </BigButton>

          <BigButton onPress={onCancel} accessibilityLabel={t('common.cancel')} className="p-3">
            <AppText weight="medium">{t('common.cancel')}</AppText>
          </BigButton>
        </View>
      </View>
    </Modal>
  );
}
