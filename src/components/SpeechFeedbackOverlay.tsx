import { Modal, ScrollView, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useSpeech } from '@/hooks/useSpeech';
import { speechOverlayMode } from '@/store/speechOverlay';
import { useSpeechStore } from '@/store/speechStore';
import { useAppColors } from '@/theme/useAppColors';
import { AppText } from './AppText';
import { BigButton } from './BigButton';

/**
 * The phrase channel.
 *
 * Audio is for the room; this screen is for the person who did not hear
 * it — a nurse facing away, a bay full of alarms, a phone on silent. It is
 * therefore shown for the whole time a phrase is being spoken, not only
 * once speech has already failed, and it deliberately stays mounted across
 * a retry so the text never disappears while someone is holding the phone
 * up to a caregiver.
 */
export function SpeechFeedbackOverlay() {
  const { t } = useTranslation();
  const colors = useAppColors();
  const { speakText } = useSpeech();
  const playback = useSpeechStore((state) => state.playback);
  const dismissPlayback = useSpeechStore((state) => state.dismissPlayback);

  const mode = speechOverlayMode(playback);
  const failed = mode === 'failed';
  const emergency = playback.emergency;

  // Emergency keeps its red ground in both modes: the colour is the alarm,
  // and it should not change meaning depending on whether the audio worked.
  const onDanger = emergency;
  const textTone = onDanger ? 'onDanger' : 'default';
  const phraseSize =
    playback.text.length > 160 ? 'lg' : playback.text.length > 80 ? 'xl' : 'display';

  return (
    <Modal
      visible={mode !== 'hidden'}
      animationType="fade"
      onRequestClose={dismissPlayback}
      presentationStyle="fullScreen"
    >
      <View
        accessibilityViewIsModal
        className={`flex-1 items-center gap-4 p-6 ${onDanger ? 'bg-danger' : 'bg-background'}`}
      >
        <MaterialCommunityIcons
          name={failed ? (emergency ? 'alert-circle' : 'volume-off') : 'volume-high'}
          size={64}
          color={onDanger ? colors.onDanger : failed ? colors.danger : colors.primary}
        />

        <AppText
          size="xl"
          weight="bold"
          tone={failed ? textTone : onDanger ? 'onDanger' : 'primary'}
          className="text-center"
          accessibilityLiveRegion="assertive"
        >
          {failed
            ? t(emergency ? 'speech.emergencyFallback' : 'speech.outputFailed')
            : t('speech.speaking')}
        </AppText>

        {/* The message itself. Same size and position in both modes, so a
            failure never moves the text a reader is already looking at.
            When a phrase is spoken in two languages, both are shown: if the
            phone is addressing two readers, so is the screen. */}
        <ScrollView
          className="w-full flex-1"
          contentContainerClassName="min-h-full items-center justify-center gap-4 px-2"
        >
          {(playback.parts.length > 0
            ? playback.parts
            : [{ text: playback.text, language: playback.language }]
          ).map((part, index) => (
            <AppText
              key={`${part.language}-${index}`}
              size={index === 0 ? phraseSize : 'xl'}
              weight="bold"
              tone={textTone}
              className={`text-center ${index === 0 ? '' : 'opacity-80'}`}
            >
              {part.text}
            </AppText>
          ))}
        </ScrollView>

        {failed && emergency && (
          <AppText size="lg" weight="medium" tone="onDanger" className="text-center">
            {t('speech.noAlertSent')}
          </AppText>
        )}

        {failed && playback.error === 'text-too-long' && (
          <AppText size="md" weight="medium" tone={onDanger ? 'onDanger' : 'danger'}>
            {t('speech.textTooLong')}
          </AppText>
        )}

        <View className="w-full max-w-xl gap-3">
          {failed && (
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
          )}
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
