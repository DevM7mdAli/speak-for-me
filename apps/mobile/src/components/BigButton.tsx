import type { ReactNode } from 'react';
import {
  Pressable,
  type AccessibilityRole,
  type AccessibilityState,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const MIN_TAP_TARGET = 88;
type ButtonTone = 'default' | 'primary' | 'danger' | 'dangerOutline';

const tones: Record<ButtonTone, string> = {
  default: 'border-border bg-surface active:bg-surface-pressed',
  primary: 'border-primary bg-primary active:bg-primary-pressed',
  danger: 'border-danger bg-danger active:bg-danger-pressed',
  dangerOutline: 'border-danger bg-surface active:bg-surface-pressed',
};

interface BigButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  children: ReactNode;
  tone?: ButtonTone;
  /**
   * Primary targets keep the 88dp minimum. Secondary controls
   * (favorite star, keypad delete) may opt down to 56dp.
   */
  minSize?: number;
  haptic?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Base tap target for every button in the app. Enforces the minimum
 * target size, a clearly visible pressed state, haptic feedback, and
 * screen-reader metadata — so no screen can forget them.
 */
export function BigButton({
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  children,
  tone = 'default',
  minSize = MIN_TAP_TARGET,
  haptic = true,
  disabled = false,
  className,
}: BigButtonProps) {
  const handlePress = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, ...accessibilityState }}
      className={`${minSize >= MIN_TAP_TARGET ? 'min-h-[88px] min-w-[88px]' : 'min-h-16 min-w-16'} items-center justify-center rounded-control border-2 high-contrast:border-[3px] active:scale-[0.98] disabled:opacity-40 ${tones[tone]} ${className ?? ''}`}
    >
      {children}
    </Pressable>
  );
}
