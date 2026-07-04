import { useEffect } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { RestartOverlay } from '@/components/RestartOverlay';
import { Screen } from '@/components/Screen';
import { phraseIcon } from '@/components/PhraseTile';
import { useLanguageSwitch, useSettings } from '@/hooks/useSettings';
import { useSpeech } from '@/hooks/useSpeech';
import { usePhraseStore } from '@/store/phraseStore';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const EMERGENCY_CATEGORY_ID = 'emergency';

interface HomeTile {
  key: string;
  label: string;
  iconName: string;
  onPress: () => void;
  a11yLabel: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { language } = useSettings();
  const { restarting, switchLanguage } = useLanguageSwitch();
  const { speakPhrase, speakText } = useSpeech();

  const categories = usePhraseStore((s) => s.categories);
  const emergencyPhrases = usePhraseStore((s) => s.phrasesByCategory[EMERGENCY_CATEGORY_ID]);
  const loadCategory = usePhraseStore((s) => s.loadCategory);

  useEffect(() => {
    loadCategory(EMERGENCY_CATEGORY_ID);
  }, [loadCategory]);

  const speakCallNurse = () => {
    const nurseCall = emergencyPhrases?.[0];
    if (nurseCall) {
      speakPhrase(nurseCall);
    } else {
      speakText(t('home.callNurse'));
    }
  };

  const tiles: HomeTile[] = [
    ...categories.map((category) => ({
      key: category.id,
      label: category.label[language],
      iconName: category.iconName,
      onPress: () => router.push({ pathname: '/category/[id]', params: { id: category.id } }),
      a11yLabel: t('a11y.openCategory', { name: category.label[language] }),
    })),
    {
      key: 'type-message',
      label: t('home.typeMessage'),
      iconName: 'keyboard-outline',
      onPress: () => router.push('/type-message'),
      a11yLabel: t('home.typeMessage'),
    },
    {
      key: 'my-phrases',
      label: t('home.myPhrases'),
      iconName: 'star',
      onPress: () => router.push('/my-phrases'),
      a11yLabel: t('home.myPhrases'),
    },
  ];

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
        }}
      >
        <AppText size="lg" weight="bold" style={{ flex: 1 }} accessibilityRole="header">
          {t('app.name')}
        </AppText>

        <BigButton
          onPress={() => switchLanguage(language === 'en' ? 'ar' : 'en')}
          accessibilityLabel={t('a11y.languageToggle')}
          accessibilityHint={t('language.toggleHint')}
          minSize={64}
          style={{ paddingHorizontal: spacing.lg }}
        >
          <AppText weight="bold" color={colors.primary}>
            {t('language.switchTo')}
          </AppText>
        </BigButton>

        <BigButton
          onPress={() => router.push('/settings')}
          accessibilityLabel={t('a11y.openSettings')}
          minSize={64}
        >
          <MaterialCommunityIcons name="cog" size={30} color={colors.textMuted} />
        </BigButton>
      </View>

      {/* Emergency: one tap, always visible, never behind a scroll. */}
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
        <BigButton
          onPress={speakCallNurse}
          accessibilityLabel={t('a11y.emergencyButton')}
          color={colors.danger}
          pressedColor={colors.dangerPressed}
          borderColor={colors.danger}
          style={{ flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.lg }}
        >
          <MaterialCommunityIcons name="bell-alert" size={40} color={colors.onDanger} />
          <AppText size="xl" weight="bold" color={colors.onDanger}>
            {t('home.callNurse')}
          </AppText>
        </BigButton>
      </View>

      <FlatList
        data={tiles}
        keyExtractor={(tile) => tile.key}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.md }}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl,
          gap: spacing.md,
        }}
        renderItem={({ item }) => (
          <BigButton
            onPress={item.onPress}
            accessibilityLabel={item.a11yLabel}
            style={{ flex: 1, minHeight: 130, padding: spacing.md }}
          >
            <MaterialCommunityIcons name={phraseIcon(item.iconName)} size={44} color={colors.accent} />
            <AppText size="md" weight="medium" style={{ textAlign: 'center', marginTop: spacing.sm }}>
              {item.label}
            </AppText>
          </BigButton>
        )}
      />

      <RestartOverlay visible={restarting} message={t('language.restarting')} />
    </Screen>
  );
}
