import { ActivityIndicator, Modal, View } from 'react-native';

import { AppText } from './AppText';

/** Full-screen notice shown while the app reloads to flip layout direction. */
export function RestartOverlay({ visible, message }: { visible: boolean; message: string }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center gap-6 bg-background p-6">
        <ActivityIndicator size="large" colorClassName="accent-primary" />
        <AppText size="lg" weight="medium" className="text-center" accessibilityLiveRegion="polite">
          {message}
        </AppText>
      </View>
    </Modal>
  );
}
