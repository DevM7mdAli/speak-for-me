/**
 * Design tokens for Speak For Me.
 *
 * Sizing is driven by the accessibility requirements of ICU patients:
 * users may have tremor, weakness, IV lines, or only one usable hand,
 * so every primary target is at least MIN_TAP_TARGET on each side.
 */

/** Minimum side of any primary tap target, in dp. Never go below this. */
export const MIN_TAP_TARGET = 88;

/** Minimum gap between adjacent tap targets, in dp. */
export const TARGET_GAP = 12;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
} as const;

/**
 * Base font sizes before the user's textScale (1.0–1.6) is applied.
 * Deliberately larger than typical mobile defaults.
 */
export const fontSize = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 30,
  display: 38,
} as const;

export interface ColorPalette {
  background: string;
  surface: string;
  surfacePressed: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  primaryPressed: string;
  danger: string;
  onDanger: string;
  dangerPressed: string;
  success: string;
  /** Card accents per category; falls back to primary. */
  accent: string;
}

export const lightPalette: ColorPalette = {
  background: '#F4F7FB',
  surface: '#FFFFFF',
  surfacePressed: '#D7E4F5',
  border: '#C4D2E3',
  text: '#122033',
  textMuted: '#4A5B70',
  primary: '#1D4ED8',
  onPrimary: '#FFFFFF',
  primaryPressed: '#153DA8',
  danger: '#C62828',
  onDanger: '#FFFFFF',
  dangerPressed: '#9A1F1F',
  success: '#1B7F4B',
  accent: '#1D4ED8',
};

/**
 * High-contrast mode: near-black background, white text, thick borders,
 * saturated primaries. Meets WCAG AAA for body text.
 */
export const highContrastPalette: ColorPalette = {
  background: '#000000',
  surface: '#0D0D0D',
  surfacePressed: '#333333',
  border: '#FFFFFF',
  text: '#FFFFFF',
  textMuted: '#E6E6E6',
  primary: '#FFD60A',
  onPrimary: '#000000',
  primaryPressed: '#C7A600',
  danger: '#FF5252',
  onDanger: '#000000',
  dangerPressed: '#C41C1C',
  success: '#4ADE80',
  accent: '#FFD60A',
};

/** Border width grows in high-contrast mode so edges stay findable. */
export const borderWidth = { standard: 1.5, highContrast: 3 } as const;

export const fontFamily = {
  /** Tajawal renders both Arabic and Latin scripts; used app-wide. */
  regular: 'Tajawal_400Regular',
  medium: 'Tajawal_500Medium',
  bold: 'Tajawal_700Bold',
} as const;
