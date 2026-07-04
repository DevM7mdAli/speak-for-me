import { useEffect, useState } from 'react';
import { I18nManager, KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import type { Phrase } from '@/data/models';
import { phraseRepository } from '@/data/repositories';
import { useSettings } from '@/hooks/useSettings';
import { useSpeech } from '@/hooks/useSpeech';
import { fontFamily, spacing, radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const SUGGESTION_LIMIT = 4;

export default function TypeMessageScreen() {
  const { t } = useTranslation();
  const { colors, bw, fs } = useTheme();
  const { language } = useSettings();
  const { speakText } = useSpeech();

  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState<Phrase[]>([]);

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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('type.placeholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            autoFocus
            accessibilityLabel={t('a11y.textInput')}
            style={{
              minHeight: 140,
              borderWidth: bw,
              borderColor: colors.border,
              borderRadius: radius.md,
              backgroundColor: colors.surface,
              color: colors.text,
              fontFamily: fontFamily.regular,
              fontSize: fs('lg'),
              padding: spacing.lg,
              textAlign: I18nManager.isRTL ? 'right' : 'left',
              textAlignVertical: 'top',
            }}
          />

          {suggestions.length > 0 && (
            <View style={{ gap: spacing.md }}>
              <AppText size="sm" weight="medium" muted>
                {t('type.suggestions')}
              </AppText>
              {suggestions.map((phrase) => (
                <BigButton
                  key={phrase.id}
                  onPress={() => setText(phrase.text[language])}
                  accessibilityLabel={phrase.text[language]}
                  minSize={64}
                  style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}
                >
                  <AppText weight="medium">{phrase.text[language]}</AppText>
                </BigButton>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Speak stays visible above the keyboard at all times. */}
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.md,
            padding: spacing.lg,
            borderTopWidth: bw,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          }}
        >
          <BigButton
            onPress={() => setText('')}
            accessibilityLabel={t('type.clear')}
            disabled={!text}
            style={{ paddingHorizontal: spacing.lg }}
          >
            <AppText weight="medium">{t('type.clear')}</AppText>
          </BigButton>
          <BigButton
            onPress={() => speakText(text.trim())}
            accessibilityLabel={t('type.speakWhatITyped')}
            disabled={!text.trim()}
            color={colors.primary}
            pressedColor={colors.primaryPressed}
            style={{ flex: 1, flexDirection: 'row', gap: spacing.md }}
          >
            <MaterialCommunityIcons name="volume-high" size={32} color={colors.onPrimary} />
            <AppText size="lg" weight="bold" color={colors.onPrimary}>
              {t('common.speak')}
            </AppText>
          </BigButton>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
