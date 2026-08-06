import { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/AppText';
import { PhraseTile } from '@/components/PhraseTile';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import type { Phrase } from '@/data/models';
import { useSpeech } from '@/hooks/useSpeech';
import { usePhraseStore } from '@/store/phraseStore';

function TileGrid({ phrases }: { phrases: Phrase[] }) {
  const { speakPhrase } = useSpeech();
  const toggleFavorite = usePhraseStore((s) => s.toggleFavorite);

  // Render pairs manually: the grid lives inside a sectioned ScrollView.
  const rows: Phrase[][] = [];
  for (let i = 0; i < phrases.length; i += 2) {
    rows.push(phrases.slice(i, i + 2));
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
          {row.length === 1 && <View className="flex-1" />}
        </View>
      ))}
    </View>
  );
}

export default function MyPhrasesScreen() {
  const { t } = useTranslation();
  const recentlyUsed = usePhraseStore((s) => s.recentlyUsed);
  const favorites = usePhraseStore((s) => s.favorites);
  const loadMyPhrases = usePhraseStore((s) => s.loadMyPhrases);

  useFocusEffect(
    useCallback(() => {
      loadMyPhrases();
    }, [loadMyPhrases]),
  );

  const isEmpty = recentlyUsed.length === 0 && favorites.length === 0;

  return (
    <Screen>
      <ScreenHeader title={t('myPhrases.title')} />
      <ScrollView contentContainerClassName="gap-4 p-4">
        {isEmpty && (
          <AppText muted className="mt-8 text-center">
            {t('myPhrases.empty')}
          </AppText>
        )}

        {recentlyUsed.length > 0 && (
          <>
            <AppText size="md" weight="bold" muted accessibilityRole="header">
              {t('myPhrases.recentlyUsed')}
            </AppText>
            <TileGrid phrases={recentlyUsed} />
          </>
        )}

        {favorites.length > 0 && (
          <>
            <AppText size="md" weight="bold" muted accessibilityRole="header">
              {t('myPhrases.favorites')}
            </AppText>
            <TileGrid phrases={favorites} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
