import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme/tokens';

export default function HomeScreen() {
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
      <Text style={{ ...typography.heading, color: colors.primary }}>PawReminder</Text>
      <Text style={{ ...typography.body, color: colors.muted }}>Base tecnica lista.</Text>

      <Link href="/details" asChild>
        <Pressable
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: spacing[5],
            paddingVertical: spacing[3],
            borderRadius: 12
          }}
        >
          <Text style={{ ...typography.label, color: colors.primaryForeground }}>Ir a la siguiente</Text>
        </Pressable>
      </Link>

      <StatusBar style="dark" />
    </View>
  );
}
