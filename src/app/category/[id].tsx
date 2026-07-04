import { useEffect } from 'react';
import { FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PhraseTile } from '@/components/PhraseTile';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useSettings } from '@/hooks/useSettings';
import { useSpeech } from '@/hooks/useSpeech';
import { usePhraseStore } from '@/store/phraseStore';
import { spacing } from '@/theme/tokens';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { language } = useSettings();
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

  return (
    <Screen>
      <ScreenHeader title={category ? category.label[language] : t('common.loading')} />
      <FlatList
        data={phrases ?? []}
        keyExtractor={(phrase) => phrase.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.md }}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl,
          gap: spacing.md,
        }}
        renderItem={({ item }) => (
          <PhraseTile phrase={item} onSpeak={speakPhrase} onToggleFavorite={toggleFavorite} />
        )}
      />
    </Screen>
  );
}
