import { useMemo } from 'react';

import { useSettingsStore } from '@/store/settingsStore';
import {
  borderWidth,
  fontSize,
  highContrastPalette,
  lightPalette,
  type ColorPalette,
} from './tokens';

export interface Theme {
  colors: ColorPalette;
  /** Border width — thicker in high-contrast mode. */
  bw: number;
  /** Font size for a token step, with the user's text scale applied. */
  fs: (step: keyof typeof fontSize) => number;
  highContrast: boolean;
}

export function useTheme(): Theme {
  const highContrast = useSettingsStore((s) => s.settings.highContrast);
  const textScale = useSettingsStore((s) => s.settings.textScale);

  return useMemo(
    () => ({
      colors: highContrast ? highContrastPalette : lightPalette,
      bw: highContrast ? borderWidth.highContrast : borderWidth.standard,
      fs: (step) => Math.round(fontSize[step] * textScale),
      highContrast,
    }),
    [highContrast, textScale],
  );
}
