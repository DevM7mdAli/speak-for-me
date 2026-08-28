import type { ReactNode } from 'react';
import { View } from 'react-native';

/** Safe-area-aware screen root with the theme background. */
export function Screen({ children }: { children: ReactNode }) {
  return <View className="flex-1 bg-background pt-safe pb-safe">{children}</View>;
}
