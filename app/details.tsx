import { Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme/tokens';

export default function DetailsScreen() {
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
      <Text style={{ ...typography.body, color: colors.muted }}>PawReminder avanzó correctamente.</Text>
    </View>
  );
}
