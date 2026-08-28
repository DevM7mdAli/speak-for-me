import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useSettings } from '@/hooks/useSettings';
import { bedsideReadiness } from '@/store/readiness';
import { useSpeechStore } from '@/store/speechStore';
import { useAppColors } from '@/theme/useAppColors';
import { AppText } from './AppText';

/** Physical checks this code cannot see, listed so they are not forgotten. */
const MANUAL_REMINDERS = [
  'readiness.manualCharger',
  'readiness.manualSilent',
  'readiness.manualReach',
  'readiness.manualBoard',
] as const;

/**
 * Whether this device is set up for a patient.
 *
 * Derived items are checked automatically. The physical ones underneath
 * are not — and are shown separately rather than as ticks, because a green
 * tick this code did not earn is worse than no tick at all.
 */
export function ReadinessPanel() {
  const { t } = useTranslation();
  const colors = useAppColors();
  const settings = useSettings();
  const capabilities = useSpeechStore((state) => state.capabilities);

  const { items, ready } = bedsideReadiness(settings, capabilities);

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-3">
        <MaterialCommunityIcons
          name={ready ? 'check-circle' : 'alert-circle'}
          size={30}
          color={ready ? colors.success : colors.danger}
        />
        <AppText weight="bold" tone={ready ? 'success' : 'danger'} className="flex-1">
          {t(ready ? 'readiness.ready' : 'readiness.notReady')}
        </AppText>
      </View>

      <View className="gap-2">
        {items.map((item) => (
          <View key={item.id} className="flex-row items-center gap-3">
            <MaterialCommunityIcons
              name={item.done ? 'check-circle-outline' : 'circle-outline'}
              size={26}
              color={item.done ? colors.success : colors.muted}
            />
            <AppText size="sm" className="flex-1" muted={item.done}>
              {t(
                item.labelKey,
                item.labelValues
                  ? { language: t(item.labelValues.language) }
                  : undefined,
              )}
            </AppText>
          </View>
        ))}
      </View>

      <AppText size="sm" weight="medium" muted>
        {t('readiness.manualTitle')}
      </AppText>
      <View className="gap-1">
        {MANUAL_REMINDERS.map((key) => (
          <AppText key={key} size="sm" muted>
            {`· ${t(key)}`}
          </AppText>
        ))}
      </View>
    </View>
  );
}
