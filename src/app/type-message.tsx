import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AppText, textSizeClass } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { EmergencyStrip } from '@/components/EmergencyStrip';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import type { Phrase } from '@/data/models';
import { phraseRepository } from '@/data/repositories';
import { useSettings } from '@/hooks/useSettings';
import { useSpeech } from '@/hooks/useSpeech';
import { MAX_UTTERANCE_CHARS } from '@/store/speechLimits';
import { useSpeechStore } from '@/store/speechStore';
import { useAppColors } from '@/theme/useAppColors';

const SUGGESTION_LIMIT = 4;

export default function TypeMessageScreen() {
  const { t } = useTranslation();
  const colors = useAppColors();
  const { language, textScale } = useSettings();
  const { speakText } = useSpeech();

  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState<Phrase[]>([]);
  const stackToolbar = textScale >= 1.4;
  const isSpeaking = useSpeechStore(
    (state) =>
      state.playback.language === language &&
      state.playback.text === text.trim() &&
      (state.playback.status === 'starting' || state.playback.status === 'speaking'),
  );

  useEffect(() => {
    let cancelled = false;
    const query = text.trim();
    const load = query
      ? phraseRepository.searchPhrases(query, language, SUGGESTION_LIMIT)
      : phraseRepository.getRecentlyUsed(SUGGESTION_LIMIT);
    load.then((phrases) => {
      if (!cancelled) {
        setSuggestions(phrases);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [text, language]);

  return (
    <Screen>
      <ScreenHeader title={t('type.title')} />
      <EmergencyStrip />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 p-4"
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('type.placeholder')}
            placeholderTextColorClassName="accent-muted"
            multiline
            autoFocus
            accessibilityLabel={t('a11y.textInput')}
            maxLength={MAX_UTTERANCE_CHARS}
            className={`min-h-40 rounded-control border-2 border-border bg-surface p-4 font-tajawal ${textSizeClass('lg', textScale)} text-foreground ltr:text-left rtl:text-right high-contrast:border-[3px]`}
          />

          {suggestions.length > 0 && (
            <View className="gap-3">
              <AppText size="sm" weight="medium" muted>
                {t('type.suggestions')}
              </AppText>
              {suggestions.map((phrase) => (
                <BigButton
                  key={phrase.id}
                  onPress={() => setText(phrase.text[language])}
                  accessibilityLabel={phrase.text[language]}
                  minSize={64}
                  className="items-start px-4 py-3"
                >
                  <AppText weight="medium">{phrase.text[language]}</AppText>
                </BigButton>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Speak stays visible above the keyboard at all times. */}
        <View
          className={`gap-3 border-t-2 border-border bg-background p-4 high-contrast:border-t-[3px] ${stackToolbar ? '' : 'flex-row'}`}
        >
          <BigButton
            onPress={() => setText('')}
            accessibilityLabel={t('type.clear')}
            disabled={!text}
            className={stackToolbar ? 'w-full px-4' : 'px-4'}
          >
            <AppText weight="medium">{t('type.clear')}</AppText>
          </BigButton>
          <BigButton
            onPress={() => speakText(text.trim())}
            accessibilityLabel={t('type.speakWhatITyped')}
            disabled={!text.trim()}
            accessibilityState={{ busy: isSpeaking }}
            tone="primary"
            haptic={false}
            className={`${stackToolbar ? 'w-full' : 'flex-1'} flex-row gap-3`}
          >
            {isSpeaking ? (
              <ActivityIndicator colorClassName="accent-on-primary" />
            ) : (
              <MaterialCommunityIcons name="volume-high" size={32} color={colors.onPrimary} />
            )}
            <AppText size="lg" weight="bold" tone="onPrimary">
              {isSpeaking ? t('speech.speaking') : t('common.speak')}
            </AppText>
          </BigButton>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
