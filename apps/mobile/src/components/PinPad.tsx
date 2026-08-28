import { useRef, useState } from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { useAppColors } from '@/theme/useAppColors';
import { AppText } from './AppText';
import { BigButton } from './BigButton';

export const PIN_LENGTH = 4;

interface PinPadProps {
  prompt: string;
  error?: string;
  /** Blocks input while a lockout delay is running. */
  disabled?: boolean;
  /** Called once PIN_LENGTH digits are entered; pad clears itself after. */
  onComplete: (pin: string) => void;
}

/** Large-key numeric pad; digits stay western in both languages. */
export function PinPad({ prompt, error, disabled = false, onComplete }: PinPadProps) {
  const colors = useAppColors();
  const { t } = useTranslation();
  const [digits, setDigits] = useState('');
  // The parent's check is async, so the pad clears before it resolves.
  // Without this guard, digits typed during that window could submit twice.
  const submitting = useRef(false);

  const pressDigit = (digit: string) => {
    if (disabled || submitting.current) return;
    const next = digits + digit;
    setDigits(next);
    if (next.length === PIN_LENGTH) {
      submitting.current = true;
      // Let the last dot render before the parent decides what happens next.
      setTimeout(() => {
        setDigits('');
        submitting.current = false;
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
    <View className="items-center gap-4">
      <AppText size="md" weight="medium" className="text-center">
        {prompt}
      </AppText>

      <View className="flex-row gap-3" accessibilityLabel={`${digits.length} / ${PIN_LENGTH}`}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            className={`h-5 w-5 rounded-full border-2 border-foreground ${i < digits.length ? 'bg-foreground' : 'bg-transparent'}`}
          />
        ))}
      </View>

      {error ? (
        <AppText tone="danger" weight="medium" accessibilityLiveRegion="assertive">
          {error}
        </AppText>
      ) : null}

      <View className="gap-3">
        {rows.map((row) => (
          <View key={row[0]} className="flex-row gap-3">
            {row.map((digit) => (
              <BigButton
                key={digit}
                onPress={() => pressDigit(digit)}
                accessibilityLabel={digit}
                disabled={disabled}
              >
                <AppText size="xl" weight="medium">
                  {digit}
                </AppText>
              </BigButton>
            ))}
          </View>
        ))}
        <View className="flex-row justify-center gap-3">
          <BigButton onPress={() => pressDigit('0')} accessibilityLabel="0" disabled={disabled}>
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
            disabled={disabled}
            haptic={false}
          >
            <MaterialCommunityIcons name="backspace-outline" size={32} color={colors.foreground} />
          </BigButton>
        </View>
      </View>
    </View>
  );
}
