import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

export function QueryLoadingState() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export function QueryErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[3],
        padding: spacing[6]
      }}
    >
      <Text style={{ ...typography.heading, color: colors.foreground, textAlign: 'center' }}>
        No pudimos cargar esta información
      </Text>
      <Text style={{ ...typography.body, color: colors.muted, textAlign: 'center' }}>
        {message}
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Reintentar carga"
        style={{
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[3],
          borderRadius: radius.md,
          backgroundColor: colors.primary
        }}
      >
        <Text style={{ ...typography.label, color: colors.primaryForeground }}>Reintentar</Text>
      </Pressable>
    </View>
  );
}
