import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { resolveSpeechLanguages } from '@/i18n/speechLanguage';
import { useAnnounce } from '@/hooks/useAnnounce';
import { useSettings } from '@/hooks/useSettings';
import { useSpeechStore } from '@/store/speechStore';
import { useAppColors } from '@/theme/useAppColors';
import { AppText } from './AppText';

/**
 * A persistent warning when a language the phone is set to speak has not
 * been verified.
 *
 * Follows the speech languages rather than the display language: with the
 * screen in Arabic and the output in English, warning about the Arabic
 * voice would report on one the phone is no longer using.
 */
export function SpeechStatusBanner() {
  const { t } = useTranslation();
  const colors = useAppColors();
  const settings = useSettings();
  const capabilities = useSpeechStore((state) => state.capabilities);

  const languages = resolveSpeechLanguages(settings.language, settings);
  const problem = languages.find((language) => {
    const capability = capabilities[language];
    if (capability.status === 'checking') return false;
    return capability.status !== 'ready' || !settings.speechCheckConfirmedAt[language];
  });

  const capability = problem ? capabilities[problem] : undefined;
  const languageName = t(problem === 'en' ? 'settings.english' : 'settings.arabic');
  const message = !capability
    ? undefined
    : capability.status === 'unavailable'
      ? t('speech.statusUnavailable', { language: languageName })
      : capability.status === 'degraded'
        ? t('speech.statusDegraded')
        : t('speech.needsConfirmation');

  useAnnounce(message);

  if (!message) return null;

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
