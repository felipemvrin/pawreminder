import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';

import { Screen, useScreenBottomPadding } from '@/components/screen';
import { usePets } from '@/lib/hooks/use-pets';
import { useTreatmentLogsByPet, useTreatmentsByPet } from '@/lib/hooks/use-treatments';
import { isoDateToDisplay } from '@/lib/date-format';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import type { Pet, TreatmentLog } from '@/types/domain';

function PetPicker({ pets }: { pets: Pet[] | undefined }) {
  const router = useRouter();
  const bottomPadding = useScreenBottomPadding();

  return (
    <Screen title="Historial">
      <View style={{ flex: 1, paddingHorizontal: spacing[6], gap: spacing[3] }}>
        <Text style={{ ...typography.body, color: colors.muted }}>
          Selecciona una mascota para ver su historial.
        </Text>
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            gap: spacing[3],
            paddingTop: spacing[3],
            paddingBottom: bottomPadding
          }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.setParams({ petId: item.id })}
              style={{
                padding: spacing[4],
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface
              }}
            >
              <Text style={{ ...typography.label, color: colors.foreground }}>{item.name}</Text>
            </Pressable>
          )}
        />
      </View>
    </Screen>
  );
}

function LogRow({ log, productLabel }: { log: TreatmentLog; productLabel: string }) {
  return (
    <View
      style={{
        padding: spacing[4],
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        gap: spacing[1]
      }}
    >
      <Text style={{ ...typography.label, color: colors.foreground }}>{productLabel}</Text>
      <Text style={{ ...typography.body, color: colors.muted }}>
        Aplicado el {isoDateToDisplay(log.appliedDate)}
      </Text>
      {log.notes ? (
        <Text style={{ ...typography.caption, color: colors.muted }}>{log.notes}</Text>
      ) : null}
    </View>
  );
}

export default function HistoryScreen() {
  const { petId } = useLocalSearchParams<{ petId?: string }>();
  const { data: pets } = usePets();
  const { data: logs, isLoading } = useTreatmentLogsByPet(petId);
  const { data: treatments } = useTreatmentsByPet(petId);
  const bottomPadding = useScreenBottomPadding();

  if (!petId) {
    return <PetPicker pets={pets} />;
  }

  const pet = pets?.find((p) => p.id === petId);
  const treatmentById = new Map((treatments ?? []).map((t) => [t.id, t]));

  const getProductLabel = (log: TreatmentLog) => {
    const treatment = treatmentById.get(log.treatmentId);
    if (!treatment) return 'Tratamiento';
    return (
      treatment.productName ||
      (treatment.type === 'internal' ? 'Tratamiento interno' : 'Tratamiento externo')
    );
  };

  return (
    <Screen title={`Historial${pet ? ` de ${pet.name}` : ''}`}>
      {!isLoading && logs && logs.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] }}
        >
          <Text style={{ ...typography.body, color: colors.muted, textAlign: 'center' }}>
            Aún no hay tratamientos aplicados registrados.
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: spacing[6],
            paddingTop: 0,
            paddingBottom: bottomPadding,
            gap: spacing[3]
          }}
          renderItem={({ item }) => <LogRow log={item} productLabel={getProductLabel(item)} />}
        />
      )}
    </Screen>
  );
}
