import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme/tokens';

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[2],
        padding: spacing[6],
        backgroundColor: colors.background
      }}
    >
      <Text style={{ ...typography.heading, color: colors.primary }}>PawReminder</Text>
      <Text style={{ ...typography.body, color: colors.muted }}>Base tecnica lista.</Text>
      <StatusBar style="dark" />
    </View>
  );
}
