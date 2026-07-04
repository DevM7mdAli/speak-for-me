import { Text, type TextProps } from 'react-native';

import { fontFamily, type fontSize } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface AppTextProps extends TextProps {
  size?: keyof typeof fontSize;
  weight?: keyof typeof fontFamily;
  color?: string;
  muted?: boolean;
}

/**
 * The only Text used in the app: Tajawal (covers Arabic and Latin),
 * theme colors, and the user's text scale applied via the theme.
 */
export function AppText({
  size = 'md',
  weight = 'regular',
  color,
  muted = false,
  style,
  ...rest
}: AppTextProps) {
  const { colors, fs } = useTheme();
  return (
    <Text
      style={[
        {
          fontFamily: fontFamily[weight],
          fontSize: fs(size),
          color: color ?? (muted ? colors.textMuted : colors.text),
        },
        style,
      ]}
      {...rest}
    />
  );
}
