import { useState } from 'react';
import { ActivityIndicator, Linking as NativeLinking, Platform, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';

import i18n, { type AppLanguage } from '@/i18n';
import { useSettings } from '@/hooks/useSettings';
import { useSpeech } from '@/hooks/useSpeech';
import { useSettingsStore } from '@/store/settingsStore';
import {
  type SpeechCapabilityStatus,
  useSpeechStore,
} from '@/store/speechStore';
import { useAppColors } from '@/theme/useAppColors';
import { AppText } from './AppText';
import { BigButton } from './BigButton';

function statusKey(status: SpeechCapabilityStatus) {
  switch (status) {
    case 'checking':
      return 'speech.checking';
    case 'ready':
      return 'speech.ready';
    case 'unavailable':
      return 'speech.unavailable';
    default:
      return 'speech.degraded';
  }
}

async function openSpeechSettings() {
  try {
    if (Platform.OS === 'android') {
      await NativeLinking.sendIntent('android.settings.TTS_SETTINGS');
      return;
    }
    await Linking.openSettings();
  } catch {
    await Linking.openSettings();
  }
}

function VoiceOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <BigButton
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      tone={selected ? 'primary' : 'default'}
      minSize={64}
      className="items-start px-4"
    >
      <AppText
        size="sm"
        weight="medium"
        tone={selected ? 'onPrimary' : 'default'}
        numberOfLines={2}
      >
        {label}
      </AppText>
    </BigButton>
  );
}

function SpeechLanguageSection({ language }: { language: AppLanguage }) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const settings = useSettings();
  const update = useSettingsStore((state) => state.update);
  const capability = useSpeechStore((state) => state.capabilities[language]);
  const playback = useSpeechStore((state) => state.playback);
  const checkCapabilities = useSpeechStore((state) => state.checkCapabilities);
  const { speakText } = useSpeech();
  const [expanded, setExpanded] = useState(false);
  const [testRequestId, setTestRequestId] = useState<number>();
  /** The test the caregiver has already answered "heard" or "no sound" for. */
  const [answeredRequestId, setAnsweredRequestId] = useState<number>();
  const [reportedNoSound, setReportedNoSound] = useState(false);

  const languageName = t(language === 'en' ? 'settings.english' : 'settings.arabic');
  const voiceLabel = t(language === 'en' ? 'settings.voiceEn' : 'settings.voiceAr');
  const selectedId = settings.preferredVoiceId[language];
  const selectedName =
    capability.voices.find((voice) => voice.identifier === selectedId)?.name ??
    t('settings.systemDefault');
  const testSentence = i18n.getFixedT(language)('settings.testSentence');
  const isThisTest =
    playback.requestId === testRequestId &&
    (playback.status === 'starting' || playback.status === 'speaking');
  const confirmedAt = settings.speechCheckConfirmedAt[language];

  // Derived during render rather than pushed into state from an effect:
  // the question "has this test finished and not yet been answered?" is a
  // function of the playback the component is already reading.
  const confirmPending =
    testRequestId !== undefined &&
    playback.requestId === testRequestId &&
    playback.status === 'done' &&
    answeredRequestId !== testRequestId;

  const chooseVoice = async (identifier?: string) => {
    setTestRequestId(undefined);
    setReportedNoSound(false);
    await update({
      preferredVoiceId: { ...settings.preferredVoiceId, [language]: identifier },
      speechCheckConfirmedAt: {
        ...settings.speechCheckConfirmedAt,
        [language]: undefined,
      },
    });
    setExpanded(false);
    await checkCapabilities();
  };

  const runTest = () => {
    setReportedNoSound(false);
    void speakText(testSentence, language);
    setTestRequestId(useSpeechStore.getState().playback.requestId);
  };

  const confirmAudible = async () => {
    await update({
      speechCheckConfirmedAt: {
        ...settings.speechCheckConfirmedAt,
        [language]: new Date().toISOString(),
      },
    });
    setAnsweredRequestId(testRequestId);
    setReportedNoSound(false);
  };

  const reportNoSound = async () => {
    await update({
      speechCheckConfirmedAt: {
        ...settings.speechCheckConfirmedAt,
        [language]: undefined,
      },
    });
    setAnsweredRequestId(testRequestId);
    setReportedNoSound(true);
  };

  const statusTone =
    capability.status === 'ready'
      ? 'success'
      : capability.status === 'unavailable'
        ? 'danger'
        : 'muted';

  return (
    <View className="gap-3 border-t-2 border-border pt-4 high-contrast:border-t-[3px]">
      <View className="flex-row items-center gap-3">
        <MaterialCommunityIcons
          name={capability.status === 'ready' ? 'check-circle' : 'alert-circle'}
          size={28}
          color={capability.status === 'ready' ? colors.success : colors.danger}
        />
        <View className="flex-1">
          <AppText weight="bold">{languageName}</AppText>
          <AppText size="sm" tone={statusTone} weight="medium">
            {t(statusKey(capability.status))}
          </AppText>
        </View>
        {capability.status === 'checking' && (
          <ActivityIndicator colorClassName="accent-primary" />
        )}
      </View>

      <AppText size="sm" muted>
        {t('speech.installedVoices', { count: capability.voices.length })}
      </AppText>

      {capability.status === 'unavailable' && (
        <AppText size="sm" weight="medium" tone="danger">
          {t('speech.noVoiceForLanguage', { language: languageName })}
        </AppText>
      )}

      <BigButton
        onPress={() => setExpanded((value) => !value)}
        accessibilityLabel={`${voiceLabel}: ${selectedName}`}
        accessibilityState={{ expanded }}
        minSize={64}
        className="flex-row gap-3 px-4"
      >
        <AppText weight="medium" className="flex-1">
          {voiceLabel}
        </AppText>
        <AppText size="sm" muted numberOfLines={1} className="max-w-40">
          {selectedName}
        </AppText>
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={28}
          color={colors.muted}
        />
      </BigButton>

      {expanded && (
        <View className="gap-3 ps-4">
          <VoiceOption
            label={t('settings.systemDefault')}
            selected={!selectedId}
            onPress={() => void chooseVoice(undefined)}
          />
          {capability.voices.map((voice) => (
            <VoiceOption
              key={voice.identifier}
              label={voice.name}
              selected={voice.identifier === selectedId}
              onPress={() => void chooseVoice(voice.identifier)}
            />
          ))}
        </View>
      )}

      <BigButton
        onPress={runTest}
        accessibilityLabel={t('speech.testLanguage', { language: languageName })}
        disabled={capability.status === 'checking' || capability.status === 'unavailable'}
        tone="primary"
        minSize={64}
        haptic={false}
        className="flex-row gap-3 px-4"
      >
        {isThisTest ? (
          <ActivityIndicator colorClassName="accent-on-primary" />
        ) : (
          <MaterialCommunityIcons name="volume-high" size={28} color={colors.onPrimary} />
        )}
        <AppText weight="bold" tone="onPrimary">
          {isThisTest ? t('speech.speaking') : t('speech.testLanguage', { language: languageName })}
        </AppText>
      </BigButton>

      {confirmPending && (
        <View className="gap-3" accessibilityLiveRegion="polite">
          <AppText weight="bold">{t('speech.didYouHear')}</AppText>
          <View className="flex-row gap-3">
            <BigButton
              onPress={() => void confirmAudible()}
              accessibilityLabel={t('speech.yesHeard')}
              tone="primary"
              minSize={64}
              className="flex-1 px-3"
            >
              <AppText size="sm" weight="bold" tone="onPrimary" className="text-center">
                {t('speech.yesHeard')}
              </AppText>
            </BigButton>
            <BigButton
              onPress={() => void reportNoSound()}
              accessibilityLabel={t('speech.noSound')}
              tone="dangerOutline"
              minSize={64}
              className="flex-1 px-3"
            >
              <AppText size="sm" weight="bold" tone="danger" className="text-center">
                {t('speech.noSound')}
              </AppText>
            </BigButton>
          </View>
        </View>
      )}

      {confirmedAt && !confirmPending && (
        <AppText size="sm" weight="medium" tone="success">
          {t('speech.confirmed', {
            date: new Date(confirmedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US'),
          })}
        </AppText>
      )}

      {reportedNoSound && (
        <AppText size="sm" weight="medium" tone="danger" accessibilityLiveRegion="assertive">
          {t(Platform.OS === 'ios' ? 'speech.iosSilentModeHelp' : 'speech.androidVoiceHelp')}
        </AppText>
      )}
    </View>
  );
}

export function SpeechHealthPanel() {
  const { t } = useTranslation();
  const colors = useAppColors();
  const checkCapabilities = useSpeechStore((state) => state.checkCapabilities);

  return (
    <View className="gap-4">
      <AppText size="sm" muted>
        {t(Platform.OS === 'ios' ? 'speech.iosSilentModeHelp' : 'speech.androidVoiceHelp')}
      </AppText>

      <SpeechLanguageSection language="en" />
      <SpeechLanguageSection language="ar" />

      <View className="flex-row gap-3">
        <BigButton
          onPress={() => void checkCapabilities()}
          accessibilityLabel={t('speech.checkAgain')}
          minSize={64}
          className="flex-1 flex-row gap-2 px-3"
        >
          <MaterialCommunityIcons name="refresh" size={26} color={colors.primary} />
          <AppText size="sm" weight="bold" tone="primary" className="text-center">
            {t('speech.checkAgain')}
          </AppText>
        </BigButton>
        <BigButton
          onPress={() => void openSpeechSettings()}
          accessibilityLabel={t('speech.openDeviceSettings')}
          minSize={64}
          className="flex-1 flex-row gap-2 px-3"
        >
          <MaterialCommunityIcons name="cog" size={26} color={colors.primary} />
          <AppText size="sm" weight="bold" tone="primary" className="text-center">
            {t('speech.openDeviceSettings')}
          </AppText>
        </BigButton>
      </View>
    </View>
  );
}
