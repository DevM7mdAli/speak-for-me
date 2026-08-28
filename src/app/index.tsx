import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Image, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { RestartOverlay } from '@/components/RestartOverlay';
import { Screen } from '@/components/Screen';
import { SpeechStatusBanner } from '@/components/SpeechStatusBanner';
import { phraseIcon } from '@/components/PhraseTile';
import { useLanguageSwitch, useSettings } from '@/hooks/useSettings';
import { useSpeech } from '@/hooks/useSpeech';
import { usePhraseStore } from '@/store/phraseStore';
import { useSpeechStore } from '@/store/speechStore';
import { useAppColors } from '@/theme/useAppColors';

const EMERGENCY_CATEGORY_ID = 'emergency';

interface HomeTile {
  key: string;
  label: string;
  iconName: string;
  onPress: () => void;
  a11yLabel: string;
  emphasis?: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useAppColors();
  const { language, textScale } = useSettings();
  const { restarting, switchLanguage } = useLanguageSwitch();
  const { speakPhrase, speakText } = useSpeech();

  const categories = usePhraseStore((s) => s.categories);
  const emergencyPhrases = usePhraseStore((s) => s.phrasesByCategory[EMERGENCY_CATEGORY_ID]);
  const loadCategory = usePhraseStore((s) => s.loadCategory);
  const playback = useSpeechStore((state) => state.playback);

  useEffect(() => {
    loadCategory(EMERGENCY_CATEGORY_ID);
  }, [loadCategory]);

  const speakCallNurse = () => {
    const nurseCall = emergencyPhrases?.[0];
    if (nurseCall) {
      speakPhrase(nurseCall, { emergency: true });
    } else {
      speakText(t('home.callNurse'), language, { emergency: true });
    }
  };

  const speakBreathingEmergency = () => {
    const breathingEmergency = emergencyPhrases?.[1];
    if (breathingEmergency) {
      speakPhrase(breathingEmergency, { emergency: true });
    } else {
      speakText(t('home.breathingEmergency'), language, { emergency: true });
    }
  };

  const speechActive = playback.status === 'starting' || playback.status === 'speaking';
  const nurseText = emergencyPhrases?.[0]?.text[language] ?? t('home.callNurse');
  const breathingText =
    emergencyPhrases?.[1]?.text[language] ?? t('home.breathingEmergency');
  const nurseSpeaking = playback.emergency && speechActive && playback.text === nurseText;
  const breathingSpeaking =
    playback.emergency && speechActive && playback.text === breathingText;
  const columnCount = textScale >= 1.4 ? 1 : 2;
  const stackedHeader = textScale >= 1.4;

  const tiles: HomeTile[] = [
    {
      key: 'type-message',
      label: t('home.typeMessage'),
      iconName: 'keyboard-outline',
      onPress: () => router.push('/type-message'),
      a11yLabel: t('home.typeMessage'),
      emphasis: true,
    },
    {
      key: 'my-phrases',
      label: t('home.savedPhrases'),
      iconName: 'star',
      onPress: () => router.push('/my-phrases'),
      a11yLabel: t('home.savedPhrases'),
    },
    ...categories
      .filter((category) => !category.isEmergency)
      .map((category) => {
        const label =
          category.id === 'my-words' ? t('home.customWords') : category.label[language];
        return {
          key: category.id,
          label,
          iconName: category.iconName,
          onPress: () =>
            router.push({ pathname: '/category/[id]', params: { id: category.id } }),
          a11yLabel: t('a11y.openCategory', { name: label }),
        };
      }),
  ];

  return (
    <Screen>
      <View
        className={`gap-3 px-4 py-2 ${stackedHeader ? '' : 'flex-row items-center'}`}
      >
        <View className={`flex-row items-center gap-3 ${stackedHeader ? '' : 'flex-1'}`}>
          <Image
            source={require('../../assets/images/app-icon-v2.png')}
            className="h-10 w-10 rounded-[8px]"
            resizeMode="contain"
            accessible={false}
            accessibilityIgnoresInvertColors
          />
          <AppText
            size="md"
            weight="bold"
            className="flex-1"
            numberOfLines={stackedHeader ? 2 : 1}
            accessibilityRole="header"
          >
            {t('app.name')}
          </AppText>
        </View>

        <View className="flex-row gap-3">
          <BigButton
            onPress={() => switchLanguage(language === 'en' ? 'ar' : 'en')}
            accessibilityLabel={t('a11y.languageToggle')}
            accessibilityHint={t('language.toggleHint')}
            minSize={64}
            className={stackedHeader ? 'flex-1 px-4' : 'px-3'}
          >
            <AppText weight="bold" tone="primary">
              {t('language.switchTo')}
            </AppText>
          </BigButton>

          <BigButton
            onPress={() => router.push('/settings')}
            accessibilityLabel={t('a11y.openSettings')}
            minSize={64}
          >
            <MaterialCommunityIcons name="cog" size={30} color={colors.muted} />
          </BigButton>
        </View>
      </View>

      {/* Urgent speech stays visible and never depends on category navigation. */}
      <View className="gap-2 px-4 pb-3">
        <BigButton
          onPress={speakCallNurse}
          accessibilityLabel={t('a11y.emergencyButton')}
          accessibilityState={{ busy: nurseSpeaking }}
          tone="danger"
          haptic={false}
          className="flex-row gap-3 py-4"
        >
          {nurseSpeaking ? (
            <ActivityIndicator size="large" colorClassName="accent-on-danger" />
          ) : (
            <MaterialCommunityIcons name="volume-high" size={40} color={colors.onDanger} />
          )}
          <AppText size="xl" weight="bold" tone="onDanger">
            {t('home.callNurse')}
          </AppText>
        </BigButton>

        <BigButton
          onPress={speakBreathingEmergency}
          accessibilityLabel={t('a11y.breathingEmergencyButton')}
          accessibilityState={{ busy: breathingSpeaking }}
          tone="dangerOutline"
          minSize={64}
          haptic={false}
          className="flex-row gap-3 px-4"
        >
          {breathingSpeaking ? (
            <ActivityIndicator colorClassName="accent-danger" />
          ) : (
            <MaterialCommunityIcons name="lungs" size={32} color={colors.danger} />
          )}
          <AppText size="lg" weight="bold" tone="danger" className="text-center">
            {t('home.breathingEmergency')}
          </AppText>
        </BigButton>
      </View>

      <SpeechStatusBanner />

      <FlatList
        data={tiles}
        key={`home-${columnCount}`}
        keyExtractor={(tile) => tile.key}
        numColumns={columnCount}
        columnWrapperClassName={columnCount === 2 ? 'gap-3' : undefined}
        contentContainerClassName="gap-3 px-4 pb-8"
        renderItem={({ item }) => (
          <BigButton
            onPress={item.onPress}
            accessibilityLabel={item.a11yLabel}
            tone={item.emphasis ? 'primary' : 'default'}
            className={`min-h-36 flex-1 p-3 ${item.emphasis ? '' : 'border-accent/30'}`}
          >
            <View
              className={`h-16 w-16 items-center justify-center rounded-full ${item.emphasis ? 'bg-on-primary/15' : 'bg-background'}`}
            >
              <MaterialCommunityIcons
                name={phraseIcon(item.iconName)}
                size={38}
                color={item.emphasis ? colors.onPrimary : colors.accent}
              />
            </View>
            <AppText
              size="md"
              weight="medium"
              tone={item.emphasis ? 'onPrimary' : 'default'}
              className="mt-2 text-center"
            >
              {item.label}
            </AppText>
          </BigButton>
        )}
      />

      <RestartOverlay visible={restarting} message={t('language.restarting')} />
    </Screen>
  );
}
