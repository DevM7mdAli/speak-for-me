import { useState } from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';
import { BigButton } from './BigButton';

export const PIN_LENGTH = 4;

interface PinPadProps {
  prompt: string;
  error?: string;
  /** Called once PIN_LENGTH digits are entered; pad clears itself after. */
  onComplete: (pin: string) => void;
}

/** Large-key numeric pad; digits stay western in both languages. */
export function PinPad({ prompt, error, onComplete }: PinPadProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [digits, setDigits] = useState('');

  const pressDigit = (digit: string) => {
    const next = digits + digit;
    setDigits(next);
    if (next.length === PIN_LENGTH) {
      // Let the last dot render before the parent decides what happens next.
      setTimeout(() => {
        setDigits('');
        onComplete(next);
      }, 120);
    }
  };

  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ];

  return (
    <View style={{ alignItems: 'center', gap: spacing.lg }}>
      <AppText size="md" weight="medium" style={{ textAlign: 'center' }}>
        {prompt}
      </AppText>

      <View style={{ flexDirection: 'row', gap: spacing.md }} accessibilityLabel={`${digits.length} / ${PIN_LENGTH}`}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: colors.text,
              backgroundColor: i < digits.length ? colors.text : 'transparent',
            }}
          />
        ))}
      </View>

      {error ? (
        <AppText color={colors.danger} weight="medium" accessibilityLiveRegion="assertive">
          {error}
        </AppText>
      ) : null}

      <View style={{ gap: spacing.md }}>
        {rows.map((row) => (
          <View key={row[0]} style={{ flexDirection: 'row', gap: spacing.md }}>
            {row.map((digit) => (
              <BigButton key={digit} onPress={() => pressDigit(digit)} accessibilityLabel={digit}>
                <AppText size="xl" weight="medium">
                  {digit}
                </AppText>
              </BigButton>
            ))}
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: spacing.md, justifyContent: 'center' }}>
          <BigButton onPress={() => pressDigit('0')} accessibilityLabel="0">
            <AppText size="xl" weight="medium">
              0
            </AppText>
          </BigButton>
          <BigButton
            onPress={() => {
              Haptics.selectionAsync();
              setDigits((d) => d.slice(0, -1));
            }}
            accessibilityLabel={t('pin.deleteDigit')}
            haptic={false}
          >
            <MaterialCommunityIcons name="backspace-outline" size={32} color={colors.text} />
          </BigButton>
        </View>
      </View>
    </View>
  );
}
