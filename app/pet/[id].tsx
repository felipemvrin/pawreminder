import { useLocalSearchParams, useRouter } from 'expo-router';
import { Cat, Dog, Plus } from 'lucide-react-native';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';

import { QueryErrorState, QueryLoadingState } from '@/components/query-state';
import { useDeletePet, usePet } from '@/lib/hooks/use-pets';
import { useMarkTreatmentApplied, useTreatmentsByPet } from '@/lib/hooks/use-treatments';
import { isoDateToDisplay, localDateToISO } from '@/lib/date-format';
import {
  getTreatmentStatus,
  treatmentStatusColors,
  treatmentStatusLabels
} from '@/lib/treatment-status';
import { Screen, useScreenBottomPadding } from '@/components/screen';
import { useToast } from '@/lib/toast-context';
import { colors, radius, spacing, typography } from '@/theme/tokens';
import type { Treatment } from '@/types/domain';

function treatmentTypeLabel(type: Treatment['type']) {
  return type === 'internal' ? 'Interno' : 'Externo';
}

function TreatmentCard({ treatment }: { treatment: Treatment }) {
  const router = useRouter();
  const toast = useToast();
  const markApplied = useMarkTreatmentApplied();
  const status = getTreatmentStatus(treatment.nextDueDate);

  const handleMarkApplied = () => {
    Alert.alert('Marcar como aplicado', '¿Confirmas que el tratamiento se aplicó hoy?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          try {
            await markApplied.mutateAsync({
              treatmentId: treatment.id,
              petId: treatment.petId,
              appliedDate: localDateToISO(new Date())
            });
            toast.success('Tratamiento registrado, próxima fecha actualizada');
          } catch {
            toast.error('No se pudo registrar el tratamiento');
          }
        }
      }
    ]);
  };

  return (
    <Pressable
      onPress={() => router.push(`/treatment/edit/${treatment.id}`)}
      style={{
        padding: spacing[5],
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        gap: spacing[3]
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ ...typography.label, color: colors.foreground }}>
          {treatment.productName || treatmentTypeLabel(treatment.type)}
        </Text>
        <View
          style={{
            paddingHorizontal: spacing[3],
            paddingVertical: spacing[1],
            borderRadius: radius.full,
            backgroundColor: treatmentStatusColors[status]
          }}
        >
          <Text style={{ ...typography.caption, color: colors.primaryForeground }}>
            {treatmentStatusLabels[status]}
          </Text>
        </View>
      </View>
      <Text style={{ ...typography.caption, color: colors.muted }}>
        {treatmentTypeLabel(treatment.type)} · cada {treatment.frequencyDays} días
      </Text>
      <Text style={{ ...typography.body, color: colors.foreground }}>
        Próxima fecha: {isoDateToDisplay(treatment.nextDueDate)}
      </Text>
      <Pressable
        onPress={handleMarkApplied}
        disabled={markApplied.isPending}
        style={{
          paddingVertical: spacing[3],
          borderRadius: radius.md,
          backgroundColor: colors.primary,
          alignItems: 'center',
          opacity: markApplied.isPending ? 0.7 : 1
        }}
      >
        <Text style={{ ...typography.label, color: colors.primaryForeground }}>
          Marcar como aplicado hoy
        </Text>
      </Pressable>
    </Pressable>
  );
}

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { data: pet, isLoading, isError, refetch } = usePet(id);
  const {
    data: treatments,
    isLoading: isLoadingTreatments,
    isError: isTreatmentsError,
    refetch: refetchTreatments
  } = useTreatmentsByPet(id);
  const deletePet = useDeletePet();
  const bottomPadding = useScreenBottomPadding();

  if (isLoading) {
    return (
      <Screen title="Mascota">
        <QueryLoadingState />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen title="Mascota">
        <QueryErrorState
          message="Revisa tu conexión e inténtalo nuevamente."
          onRetry={() => void refetch()}
        />
      </Screen>
    );
  }

  if (!pet) {
    return (
      <Screen title="Mascota">
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] }}
        >
          <Text style={{ ...typography.body, color: colors.muted }}>
            No se encontró la mascota.
          </Text>
        </View>
      </Screen>
    );
  }

  const Icon = pet.species === 'dog' ? Dog : Cat;

  const handleDeletePet = () => {
    Alert.alert(
      'Eliminar mascota',
      `¿Seguro que deseas eliminar a ${pet.name}? Se eliminarán sus tratamientos e historial.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePet.mutateAsync(pet.id);
              toast.success('Mascota eliminada');
              router.replace('/');
            } catch {
              toast.error('No se pudo eliminar la mascota');
            }
          }
        }
      ]
    );
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          padding: spacing[6],
          paddingTop: 0,
          paddingBottom: bottomPadding,
          gap: spacing[4]
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[4]
          }}
        >
          {pet.photoUri ? (
            <Image
              source={{ uri: pet.photoUri }}
              accessibilityLabel={`Foto de ${pet.name}`}
              style={{ width: 56, height: 56, borderRadius: radius.full }}
            />
          ) : (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: radius.full,
                backgroundColor: colors.secondary,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon size={28} color={colors.primary} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ ...typography.heading, color: colors.foreground }}>{pet.name}</Text>
            <Text style={{ ...typography.body, color: colors.muted }}>
              {pet.breed ? `${pet.breed} · ` : ''}
              {pet.weightKg} kg
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing[3] }}>
          <Pressable
            onPress={() => router.push(`/pet/edit/${pet.id}`)}
            style={{
              flex: 1,
              paddingVertical: spacing[3],
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center'
            }}
          >
            <Text style={{ ...typography.label, color: colors.foreground }}>Editar</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push({ pathname: '/history', params: { petId: pet.id } })}
            style={{
              flex: 1,
              paddingVertical: spacing[3],
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center'
            }}
          >
            <Text style={{ ...typography.label, color: colors.foreground }}>Historial</Text>
          </Pressable>
          <Pressable
            onPress={handleDeletePet}
            style={{
              flex: 1,
              paddingVertical: spacing[3],
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.error,
              alignItems: 'center'
            }}
          >
            <Text style={{ ...typography.label, color: colors.error }}>Eliminar</Text>
          </Pressable>
        </View>

        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text style={{ ...typography.label, color: colors.foreground }}>Tratamientos</Text>
          <Pressable
            onPress={() => router.push({ pathname: '/treatment/new', params: { petId: pet.id } })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing[1],
              paddingHorizontal: spacing[3],
              paddingVertical: spacing[2],
              borderRadius: radius.md,
              backgroundColor: colors.secondary
            }}
          >
            <Plus size={16} color={colors.primary} />
            <Text style={{ ...typography.label, color: colors.primary }}>Agregar</Text>
          </Pressable>
        </View>

        {isLoadingTreatments ? (
          <QueryLoadingState style={{ flex: 0, paddingVertical: spacing[6] }} />
        ) : isTreatmentsError ? (
          <QueryErrorState
            message="No pudimos cargar los tratamientos de esta mascota."
            onRetry={() => void refetchTreatments()}
            style={{ flex: 0 }}
          />
        ) : treatments && treatments.length > 0 ? (
          <View style={{ gap: spacing[3] }}>
            {treatments.map((treatment) => (
              <TreatmentCard key={treatment.id} treatment={treatment} />
            ))}
          </View>
        ) : (
          <View
            style={{
              padding: spacing[5],
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface
            }}
          >
            <Text style={{ ...typography.body, color: colors.muted }}>
              Aún no hay tratamientos configurados para {pet.name}.
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
