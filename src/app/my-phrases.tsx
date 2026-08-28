import { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/AppText';
import { PhraseTile } from '@/components/PhraseTile';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import type { Phrase } from '@/data/models';
import { useSettings } from '@/hooks/useSettings';
import { useSpeech } from '@/hooks/useSpeech';
import { usePhraseStore } from '@/store/phraseStore';
import { useAppColors } from '@/theme/useAppColors';

function TileGrid({ phrases }: { phrases: Phrase[] }) {
  const { textScale } = useSettings();
  const { speakPhrase } = useSpeech();
  const toggleFavorite = usePhraseStore((s) => s.toggleFavorite);
  const columnCount = textScale >= 1.4 ? 1 : 2;

  // Render rows manually because the grid lives inside a sectioned ScrollView.
  const rows: Phrase[][] = [];
  for (let i = 0; i < phrases.length; i += columnCount) {
    rows.push(phrases.slice(i, i + columnCount));
  }

  return (
    <View className="gap-3">
      {rows.map((row) => (
        <View key={row[0].id} className="flex-row gap-3">
          {row.map((phrase) => (
            <PhraseTile
              key={phrase.id}
              phrase={phrase}
              onSpeak={speakPhrase}
              onToggleFavorite={toggleFavorite}
            />
          ))}
          {columnCount === 2 && row.length === 1 && <View className="flex-1" />}
        </View>
      ))}
    </View>
  );
}

export default function MyPhrasesScreen() {
  const { t } = useTranslation();
  const colors = useAppColors();
  const recentlyUsed = usePhraseStore((s) => s.recentlyUsed);
  const favorites = usePhraseStore((s) => s.favorites);
  const loadMyPhrases = usePhraseStore((s) => s.loadMyPhrases);

  useFocusEffect(
    useCallback(() => {
      loadMyPhrases();
    }, [loadMyPhrases]),
  );

  const favoriteIds = new Set(favorites.map((phrase) => phrase.id));
  const recentOnly = recentlyUsed.filter((phrase) => !favoriteIds.has(phrase.id));
  const isEmpty = recentOnly.length === 0 && favorites.length === 0;

  return (
    <Screen>
      <ScreenHeader title={t('myPhrases.title')} />
      <ScrollView contentContainerClassName="flex-grow gap-5 p-4 pb-8">
        {isEmpty && (
          <View className="flex-1 items-center justify-center gap-4 px-6 py-12">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-surface">
              <MaterialCommunityIcons name="star-outline" size={48} color={colors.muted} />
            </View>
            <AppText muted className="text-center">
              {t('myPhrases.empty')}
            </AppText>
          </View>
        )}

        {favorites.length > 0 && (
          <>
            <AppText size="md" weight="bold" muted accessibilityRole="header">
              {t('myPhrases.favorites')}
            </AppText>
            <TileGrid phrases={favorites} />
          </>
        )}

        {recentOnly.length > 0 && (
          <>
            <AppText size="md" weight="bold" muted accessibilityRole="header">
              {t('myPhrases.recentlyUsed')}
            </AppText>
            <TileGrid phrases={recentOnly} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
