import { ScrollView, Text, View } from 'react-native';

import { ProgressRing } from '@/components/progress-ring';
import type { CareProgress } from '@/lib/treatment-status';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import type { Pet } from '@/types/domain';

interface PetCareDashboardProps {
  pets: Pet[];
  progress: Map<string, CareProgress>;
}

export function PetCareDashboard({ pets, progress }: PetCareDashboardProps) {
  const total = pets.reduce((sum, pet) => sum + (progress.get(pet.id)?.total ?? 0), 0);
  const completed = pets.reduce((sum, pet) => sum + (progress.get(pet.id)?.completed ?? 0), 0);

  return (
    <View style={{ gap: spacing[3] }}>
      <View style={{ gap: spacing[1] }}>
        <Text style={{ ...typography.label, color: colors.foreground }}>Resumen de cuidados</Text>
        <Text style={{ ...typography.caption, color: colors.muted }}>
          {completed} de {total} cuidados al día
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing[3] }}
      >
        {pets.map((pet) => {
          const petProgress = progress.get(pet.id) ?? { completed: 0, total: 0 };
          return (
            <View
              key={pet.id}
              style={{
                width: 148,
                alignItems: 'center',
                gap: spacing[2],
                padding: spacing[3],
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface
              }}
            >
              <ProgressRing
                completed={petProgress.completed}
                total={petProgress.total}
                size={88}
                strokeWidth={8}
                accessibilityLabel={`${pet.name}: ${petProgress.completed} de ${petProgress.total} cuidados al día`}
              />
              <Text style={{ ...typography.label, color: colors.foreground }} numberOfLines={1}>
                {pet.name}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
