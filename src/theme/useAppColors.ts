import { useCSSVariable } from 'uniwind';

const color = (value: string | number | undefined) => (typeof value === 'string' ? value : '#000000');

/**
 * Use semantic CSS tokens only where a third-party component needs a raw
 * color prop (for example, MaterialCommunityIcons).
 */
export function useAppColors() {
  const [foreground, muted, primary, onPrimary, danger, onDanger, success, accent] = useCSSVariable([
    '--color-foreground',
    '--color-muted',
    '--color-primary',
    '--color-on-primary',
    '--color-danger',
    '--color-on-danger',
    '--color-success',
    '--color-accent',
  ]);

  return {
    foreground: color(foreground),
    muted: color(muted),
    primary: color(primary),
    onPrimary: color(onPrimary),
    danger: color(danger),
    onDanger: color(onDanger),
    success: color(success),
    accent: color(accent),
  };
}
