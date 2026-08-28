import { Text, type TextProps } from 'react-native';

import { useSettings } from '@/hooks/useSettings';

export type AppTextSize = 'sm' | 'md' | 'lg' | 'xl' | 'display';
type AppTextWeight = 'regular' | 'medium' | 'bold';
type AppTextTone = 'default' | 'muted' | 'primary' | 'onPrimary' | 'danger' | 'onDanger' | 'success';

const sizes: Record<AppTextSize, Record<number, string>> = {
  sm: { 1: 'text-[16px]', 1.2: 'text-[19px]', 1.4: 'text-[22px]', 1.6: 'text-[26px]' },
  md: { 1: 'text-[20px]', 1.2: 'text-[24px]', 1.4: 'text-[28px]', 1.6: 'text-[32px]' },
  lg: { 1: 'text-[24px]', 1.2: 'text-[29px]', 1.4: 'text-[34px]', 1.6: 'text-[38px]' },
  xl: { 1: 'text-[30px]', 1.2: 'text-[36px]', 1.4: 'text-[42px]', 1.6: 'text-[48px]' },
  display: { 1: 'text-[38px]', 1.2: 'text-[46px]', 1.4: 'text-[53px]', 1.6: 'text-[61px]' },
};

const weights: Record<AppTextWeight, string> = {
  regular: 'font-tajawal',
  medium: 'font-tajawal-medium',
  bold: 'font-tajawal-bold',
};

const tones: Record<AppTextTone, string> = {
  default: 'text-foreground',
  muted: 'text-muted',
  primary: 'text-primary',
  onPrimary: 'text-on-primary',
  danger: 'text-danger',
  onDanger: 'text-on-danger',
  success: 'text-success',
};

export function textSizeClass(size: AppTextSize, textScale: number) {
  return sizes[size][textScale] ?? sizes[size][1];
}

interface AppTextProps extends Omit<TextProps, 'className' | 'style'> {
  size?: AppTextSize;
  weight?: AppTextWeight;
  tone?: AppTextTone;
  muted?: boolean;
  className?: string;
}

/**
 * The only Text used in the app: Tajawal (covers Arabic and Latin),
 * semantic CSS tokens, and the user's text scale applied via Uniwind.
 */
export function AppText({
  size = 'md',
  weight = 'regular',
  tone = 'default',
  muted = false,
  className,
  ...rest
}: AppTextProps) {
  const { textScale } = useSettings();
  return (
    <Text
      className={`${textSizeClass(size, textScale)} ${weights[weight]} ${tones[muted ? 'muted' : tone]} leading-[1.35] ${className ?? ''}`}
      {...rest}
    />
  );
}
