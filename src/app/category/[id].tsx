import { useEffect } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/AppText';
import { PhraseTile } from '@/components/PhraseTile';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useSettings } from '@/hooks/useSettings';
import { useSpeech } from '@/hooks/useSpeech';
import { usePhraseStore } from '@/store/phraseStore';
import { useAppColors } from '@/theme/useAppColors';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const colors = useAppColors();
  const { language, textScale } = useSettings();
  const { speakPhrase } = useSpeech();

  const category = usePhraseStore((s) => s.categories.find((c) => c.id === id));
  const phrases = usePhraseStore((s) => (id ? s.phrasesByCategory[id] : undefined));
  const loadCategory = usePhraseStore((s) => s.loadCategory);
  const toggleFavorite = usePhraseStore((s) => s.toggleFavorite);

  useEffect(() => {
    if (id) {
      loadCategory(id);
    }
  }, [id, loadCategory]);

  const columnCount = textScale >= 1.4 ? 1 : 2;
  const title =
    id === 'my-words'
      ? t('home.customWords')
      : category
        ? category.label[language]
        : t('common.loading');

  return (
    <Screen>
      <ScreenHeader title={title} />
      <FlatList
        data={phrases ?? []}
        key={`category-${columnCount}`}
        keyExtractor={(phrase) => phrase.id}
        numColumns={columnCount}
        columnWrapperClassName={columnCount === 2 ? 'gap-3' : undefined}
        contentContainerClassName="flex-grow gap-3 px-4 pb-8 pt-3"
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center gap-3 px-6 py-12">
            {phrases === undefined ? (
              <>
                <ActivityIndicator size="large" colorClassName="accent-primary" />
                <AppText muted accessibilityLiveRegion="polite">
                  {t('common.loading')}
                </AppText>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="message-outline" size={52} color={colors.muted} />
                <AppText muted className="text-center">
                  {t('category.empty')}
                </AppText>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <PhraseTile phrase={item} onSpeak={speakPhrase} onToggleFavorite={toggleFavorite} />
        )}
      />
    </Screen>
  );
}
