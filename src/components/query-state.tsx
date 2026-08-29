import { ActivityIndicator, Pressable, Text, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

export function QueryLoadingState({ style }: { style?: ViewStyle }) {
  return (
    <View testID="query-loading" style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, style]}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export function QueryErrorState({
  message,
  onRetry,
  style
}: {
  message: string;
  onRetry: () => void;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing[3],
          padding: spacing[6]
        },
        style
      ]}
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
