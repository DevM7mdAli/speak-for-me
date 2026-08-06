import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { RestartOverlay } from '@/components/RestartOverlay';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SpeechHealthPanel } from '@/components/SpeechHealthPanel';
import { useLanguageSwitch, useSettings } from '@/hooks/useSettings';
import type { Phrase } from '@/data/models';
import { usePhraseStore } from '@/store/phraseStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAppColors } from '@/theme/useAppColors';
import { useSettingsGate } from './_layout';

const MY_WORDS_CATEGORY_ID = 'my-words';
const EMPTY_PHRASES: Phrase[] = [];
const TEXT_SCALE_MIN = 1.0;
const TEXT_SCALE_MAX = 1.6;
const TEXT_SCALE_STEP = 0.2;
const SPEECH_RATES: { key: string; value: number }[] = [
  { key: 'slow', value: 0.7 },
  { key: 'normal', value: 0.85 },
  { key: 'fast', value: 1.0 },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <AppText size="md" weight="bold" muted accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </View>
  );
}

/** Wide option button with a selected state. */
function OptionButton({
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
      minSize={64}
      tone={selected ? 'primary' : 'default'}
      className="flex-1 px-3"
    >
      <AppText weight="medium" tone={selected ? 'onPrimary' : 'default'} numberOfLines={1}>
        {label}
      </AppText>
    </BigButton>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useAppColors();
  const settings = useSettings();
  const update = useSettingsStore((s) => s.update);
  const resetSettings = useSettingsStore((s) => s.reset);
  const { restarting, switchLanguage } = useLanguageSwitch();
  const { restartPinSetup } = useSettingsGate();

  const customPhrases = usePhraseStore(
    (s) => s.phrasesByCategory[MY_WORDS_CATEGORY_ID] ?? EMPTY_PHRASES,
  );
  const loadCategory = usePhraseStore((s) => s.loadCategory);
  const resetToSeed = usePhraseStore((s) => s.resetToSeed);
  const [confirmReset, setConfirmReset] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCategory(MY_WORDS_CATEGORY_ID);
    }, [loadCategory]),
  );

  const setTextScale = (delta: number) => {
    const next = Math.min(
      TEXT_SCALE_MAX,
      Math.max(TEXT_SCALE_MIN, Math.round((settings.textScale + delta) * 10) / 10),
    );
    update({ textScale: next });
  };

  const handleReset = async () => {
    setConfirmReset(false);
    await resetToSeed();
    await resetSettings();
    await switchLanguage('en');
    router.back();
  };

  return (
    <Screen>
      <ScreenHeader title={t('settings.title')} />
      <ScrollView contentContainerClassName="gap-6 p-4">
        <Section title={t('settings.language')}>
          <View className="flex-row gap-3">
            <OptionButton
              label={t('settings.english')}
              selected={settings.language === 'en'}
              onPress={() => switchLanguage('en')}
            />
            <OptionButton
              label={t('settings.arabic')}
              selected={settings.language === 'ar'}
              onPress={() => switchLanguage('ar')}
            />
          </View>
        </Section>

        <Section title={t('settings.display')}>
          <View className="flex-row items-center gap-3">
            <BigButton
              onPress={() => setTextScale(-TEXT_SCALE_STEP)}
              accessibilityLabel={`${t('settings.textSize')} −`}
              disabled={settings.textScale <= TEXT_SCALE_MIN}
            >
              <AppText size="lg" weight="bold">
                A−
              </AppText>
            </BigButton>
            <AppText size="md" weight="medium" className="flex-1 text-center">
              {Math.round(settings.textScale * 100)}%
            </AppText>
            <BigButton
              onPress={() => setTextScale(TEXT_SCALE_STEP)}
              accessibilityLabel={`${t('settings.textSize')} +`}
              disabled={settings.textScale >= TEXT_SCALE_MAX}
            >
              <AppText size="lg" weight="bold">
                A+
              </AppText>
            </BigButton>
          </View>

          <BigButton
            onPress={() => update({ highContrast: !settings.highContrast })}
            accessibilityLabel={t('settings.highContrast')}
            accessibilityRole="switch"
            accessibilityState={{ checked: settings.highContrast }}
            minSize={64}
            className="flex-row gap-3 px-4"
          >
            <AppText weight="medium" className="flex-1">
              {t('settings.highContrast')}
            </AppText>
            <AppText weight="bold" tone={settings.highContrast ? 'success' : 'muted'}>
              {settings.highContrast ? t('settings.on') : t('settings.off')}
            </AppText>
          </BigButton>
        </Section>

        <Section title={t('settings.speech')}>
          <View className="flex-row gap-3">
            {SPEECH_RATES.map((rate) => (
              <OptionButton
                key={rate.key}
                label={`${rate.value}×`}
                selected={settings.speechRate === rate.value}
                onPress={() => update({ speechRate: rate.value })}
              />
            ))}
          </View>
          <SpeechHealthPanel />
        </Section>

        <Section title={t('settings.phrases')}>
          <BigButton
            onPress={() => router.push('/settings/edit-phrase')}
            accessibilityLabel={t('settings.addPhrase')}
            tone="primary"
            minSize={64}
            className="flex-row gap-3 px-4"
          >
            <MaterialCommunityIcons name="plus" size={28} color={colors.onPrimary} />
            <AppText weight="bold" tone="onPrimary">
              {t('settings.addPhrase')}
            </AppText>
          </BigButton>

          {customPhrases.map((phrase) => (
            <BigButton
              key={phrase.id}
              onPress={() =>
                router.push({ pathname: '/settings/edit-phrase', params: { id: phrase.id } })
              }
              accessibilityLabel={`${t('settings.editPhrase')}: ${phrase.text[settings.language]}`}
              minSize={64}
              className="flex-row gap-3 px-4"
            >
              <AppText weight="medium" className="flex-1" numberOfLines={1}>
                {phrase.text[settings.language]}
              </AppText>
              <MaterialCommunityIcons name="pencil" size={26} color={colors.muted} />
            </BigButton>
          ))}
        </Section>

        <Section title={t('settings.danger')}>
          <BigButton
            onPress={restartPinSetup}
            accessibilityLabel={t('settings.changePin')}
            minSize={64}
            className="px-4"
          >
            <AppText weight="medium">{t('settings.changePin')}</AppText>
          </BigButton>

          <BigButton
            onPress={() => setConfirmReset(true)}
            accessibilityLabel={t('settings.resetApp')}
            tone="dangerOutline"
            minSize={64}
            className="px-4"
          >
            <AppText weight="bold" tone="danger">
              {t('settings.resetApp')}
            </AppText>
          </BigButton>
        </Section>
      </ScrollView>

      <ConfirmDialog
        visible={confirmReset}
        title={t('settings.resetTitle')}
        body={t('settings.resetBody')}
        confirmLabel={t('settings.resetConfirm')}
        destructive
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />
      <RestartOverlay visible={restarting} message={t('language.restarting')} />
    </Screen>
  );
}
