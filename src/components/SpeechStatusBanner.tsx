import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useSettings } from '@/hooks/useSettings';
import { useSpeechStore } from '@/store/speechStore';
import { useAppColors } from '@/theme/useAppColors';
import { AppText } from './AppText';

/** A persistent warning when the current language has not been verified for speech. */
export function SpeechStatusBanner() {
  const { t } = useTranslation();
  const colors = useAppColors();
  const settings = useSettings();
  const capability = useSpeechStore((state) => state.capabilities[settings.language]);
  const confirmedAt = settings.speechCheckConfirmedAt[settings.language];

  if (capability.status === 'checking' || (capability.status === 'ready' && confirmedAt)) {
    return null;
  }

  const languageName = t(
    settings.language === 'en' ? 'settings.english' : 'settings.arabic',
  );
  const message =
    capability.status === 'unavailable'
      ? t('speech.statusUnavailable', { language: languageName })
      : capability.status === 'degraded'
        ? t('speech.statusDegraded')
        : t('speech.needsConfirmation');

  return (
    <View
      accessibilityRole="alert"
      className="mx-4 mb-3 flex-row items-start gap-3 border-s-4 border-danger bg-surface p-3"
    >
      <MaterialCommunityIcons name="volume-off" size={28} color={colors.danger} />
      <View className="flex-1 gap-1">
        <AppText size="sm" weight="bold" tone="danger">
          {message}
        </AppText>
        <AppText size="sm" muted>
          {t('speech.visualFallbackHint')}
        </AppText>
      </View>
    </View>
  );
}
