import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

export default function DetailsScreen() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[3],
        padding: spacing[6],
        backgroundColor: colors.background
      }}
    >
      <Text style={{ ...typography.heading, color: colors.primary }}>Siguiente pantalla</Text>
      <Text style={{ ...typography.body, color: colors.muted }}>
        PawReminder avanzó correctamente.
      </Text>

      <Pressable
        onPress={() => router.back()}
        style={{
          backgroundColor: colors.secondary,
          paddingHorizontal: spacing[5],
          paddingVertical: spacing[3],
          borderRadius: radius.lg
        }}
      >
        <Text style={{ ...typography.label, color: colors.primary }}>Volver</Text>
      </Pressable>
    </View>
  );
}
