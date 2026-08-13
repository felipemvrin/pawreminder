import { defaultConfig as baseConfig } from '@tamagui/config/v4';
import { createTamagui } from 'tamagui';

import { colors, radius, spacing } from '@/theme/tokens';

const pawLight = {
  ...baseConfig.themes.light,
  background: colors.background,
  backgroundHover: colors.surface,
  backgroundPress: colors.muted,
  borderColor: colors.border,
  color: colors.foreground,
  colorHover: colors.foreground,
  colorPress: colors.foreground,
  placeholderColor: colors.muted,
  primary: colors.primary,
  primaryForeground: colors.primaryForeground,
  secondary: colors.secondary,
  success: colors.success,
  warning: colors.warning,
  error: colors.error
};

const tamaguiConfig = createTamagui({
  ...baseConfig,
  tokens: {
    ...baseConfig.tokens,
    size: { ...baseConfig.tokens.size, ...spacing },
    radius: { ...baseConfig.tokens.radius, ...radius }
  },
  themes: { ...baseConfig.themes, pawLight }
});

export type PawTamaguiConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends PawTamaguiConfig {}
}

export default tamaguiConfig;
