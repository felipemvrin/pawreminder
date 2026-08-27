import type { PropsWithChildren, ReactNode } from 'react';

import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/theme/tokens';

type ScreenHeaderProps = {
  title?: string;
  showBack?: boolean;
  right?: ReactNode;
};

export function ScreenHeader({ title, showBack = true, right }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Al entrar desde una notificación no hay historial previo: volvemos al inicio
  const handleBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View
      style={{
        paddingTop: insets.top + spacing[3],
        paddingHorizontal: spacing[6],
        paddingBottom: spacing[4],
        backgroundColor: colors.background,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3]
      }}
    >
      {showBack ? (
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={12}
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.full,
            backgroundColor: colors.secondary,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ChevronLeft size={22} color={colors.primary} />
        </Pressable>
      ) : null}

      {title ? (
        <Text style={{ ...typography.display, color: colors.primary, flex: 1 }} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View style={{ flex: 1 }} />
      )}

      {right}
    </View>
  );
}

type ScreenProps = PropsWithChildren<ScreenHeaderProps>;

export function Screen({ children, ...headerProps }: ScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader {...headerProps} />
      {children}
    </View>
  );
}

/** Espacio inferior seguro (home indicator) para listas y formularios scrolleables. */
export function useScreenBottomPadding() {
  return useSafeAreaInsets().bottom + spacing[6];
}
