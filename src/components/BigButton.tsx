import type { ReactNode } from 'react';
import {
  Pressable,
  type AccessibilityRole,
  type AccessibilityState,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { MIN_TAP_TARGET, radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface BigButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  children: ReactNode;
  /** Background / pressed-background; defaults to surface colors. */
  color?: string;
  pressedColor?: string;
  borderColor?: string;
  /**
   * Primary targets keep the 88dp minimum. Secondary controls
   * (favorite star, keypad delete) may opt down to 56dp.
   */
  minSize?: number;
  haptic?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
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
  color,
  pressedColor,
  borderColor,
  minSize = MIN_TAP_TARGET,
  haptic = true,
  disabled = false,
  style,
}: BigButtonProps) {
  const { colors, bw } = useTheme();

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
      style={({ pressed }) => [
        {
          minWidth: minSize,
          minHeight: minSize,
          borderRadius: radius.md,
          borderWidth: bw,
          borderColor: borderColor ?? colors.border,
          backgroundColor: pressed
            ? (pressedColor ?? colors.surfacePressed)
            : (color ?? colors.surface),
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
