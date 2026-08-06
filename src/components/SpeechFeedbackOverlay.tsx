import { Modal, ScrollView, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useSpeech } from '@/hooks/useSpeech';
import { useSpeechStore } from '@/store/speechStore';
import { useAppColors } from '@/theme/useAppColors';
import { AppText } from './AppText';
import { BigButton } from './BigButton';

/** Keeps the requested message usable even when audible speech fails. */
export function SpeechFeedbackOverlay() {
  const { t } = useTranslation();
  const colors = useAppColors();
  const { speakText } = useSpeech();
  const playback = useSpeechStore((state) => state.playback);
  const dismissPlayback = useSpeechStore((state) => state.dismissPlayback);
  const visible = playback.status === 'error';
  const emergency = playback.emergency;
  const textTone = emergency ? 'onDanger' : 'default';
  const phraseSize =
    playback.text.length > 160 ? 'lg' : playback.text.length > 80 ? 'xl' : 'display';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={dismissPlayback}
      presentationStyle="fullScreen"
    >
      <View
        accessibilityViewIsModal
        className={`flex-1 items-center gap-4 p-6 ${emergency ? 'bg-danger' : 'bg-background'}`}
      >
        <MaterialCommunityIcons
          name={emergency ? 'alert-circle' : 'volume-off'}
          size={64}
          color={emergency ? colors.onDanger : colors.danger}
        />

        <AppText
          size="xl"
          weight="bold"
          tone={textTone}
          className="text-center"
          accessibilityLiveRegion="assertive"
        >
          {t(emergency ? 'speech.emergencyFallback' : 'speech.outputFailed')}
        </AppText>

        <ScrollView
          className="w-full flex-1"
          contentContainerClassName="min-h-full items-center justify-center px-2"
        >
          <AppText size={phraseSize} weight="bold" tone={textTone} className="text-center">
            {playback.text}
          </AppText>
        </ScrollView>

        {emergency && (
          <AppText size="lg" weight="medium" tone="onDanger" className="text-center">
            {t('speech.noAlertSent')}
          </AppText>
        )}

        {playback.error === 'text-too-long' && (
          <AppText size="md" weight="medium" tone={emergency ? 'onDanger' : 'danger'}>
            {t('speech.textTooLong')}
          </AppText>
        )}

        <View className="w-full max-w-xl gap-3">
          <BigButton
            onPress={() =>
              speakText(playback.text, playback.language, { emergency: playback.emergency })
            }
            accessibilityLabel={t('speech.tryAgain')}
            haptic={false}
            className="flex-row gap-3 px-4"
          >
            <MaterialCommunityIcons name="volume-high" size={30} color={colors.primary} />
            <AppText size="lg" weight="bold" tone="primary">
              {t('speech.tryAgain')}
            </AppText>
          </BigButton>
          <BigButton
            onPress={dismissPlayback}
            accessibilityLabel={t('common.close')}
            minSize={64}
            className="px-4"
          >
            <AppText weight="medium">{t('common.close')}</AppText>
          </BigButton>
        </View>
      </View>
    </Modal>
  );
}
