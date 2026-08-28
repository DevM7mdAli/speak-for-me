/**
 * The product's design tokens, lifted verbatim from the mobile app's
 * `global.css` so the site and the app cannot drift apart.
 *
 * These are the app's real colours — the teal a nurse sees on the bedside
 * phone is the same teal on the marketing page. Danger red is reserved for
 * what it means in the app: urgency and limitation. It is never decoration.
 */
export const light = {
  ground: '#f2f6f5',
  surface: '#ffffff',
  surfacePressed: '#dbe8e5',
  border: '#afc6c0',
  ink: '#102a27',
  muted: '#4b6560',
  primary: '#006c67',
  onPrimary: '#ffffff',
  primaryPressed: '#00524e',
  danger: '#c83331',
  onDanger: '#ffffff',
  success: '#087443',
  accent: '#007e79',
} as const;

export const dark = {
  ground: '#102421',
  surface: '#17312e',
  surfacePressed: '#26433e',
  border: '#7faaa0',
  ink: '#f2fbf8',
  muted: '#c2d7d1',
  primary: '#62d1c6',
  onPrimary: '#062725',
  primaryPressed: '#42b8ad',
  danger: '#ff8580',
  onDanger: '#32110f',
  success: '#76e0a8',
  accent: '#62d1c6',
} as const;

/** Matches the app's `--radius-control` and `--radius-dialog`. */
export const radius = { control: '16px', dialog: '24px' } as const;

/** The app ships Tajawal because it covers Arabic and Latin in one family. */
export const fontFamily = 'Tajawal';

export type BrandPalette = typeof light;
