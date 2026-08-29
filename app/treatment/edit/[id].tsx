import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Screen, useScreenBottomPadding } from '@/components/screen';
import { TreatmentForm } from '@/components/treatment-form';
import {
  useDeleteTreatment,
  usePauseTreatment,
  useResumeTreatment,
  useTreatment,
  useUpdateTreatment
} from '@/lib/hooks/use-treatments';
import { useToast } from '@/lib/toast-context';
import { colors, radius, spacing, typography } from '@/theme/tokens';

export default function EditTreatmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { data: treatment, isLoading } = useTreatment(id);
  const updateTreatment = useUpdateTreatment();
  const deleteTreatment = useDeleteTreatment();
  const pauseTreatment = usePauseTreatment();
  const resumeTreatment = useResumeTreatment();
  const bottomPadding = useScreenBottomPadding();

  if (isLoading) {
    return (
      <Screen title="Editar tratamiento">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!treatment) {
    return (
      <Screen title="Editar tratamiento">
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] }}
        >
          <Text style={{ ...typography.body, color: colors.muted }}>
            No se encontró el tratamiento.
          </Text>
        </View>
      </Screen>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Eliminar tratamiento',
      '¿Seguro que deseas eliminar este tratamiento? Se cancelarán sus notificaciones y su historial.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTreatment.mutateAsync({
                treatmentId: treatment.id,
                petId: treatment.petId
              });
              toast.success('Tratamiento eliminado');
              router.back();
            } catch {
              toast.error('No se pudo eliminar el tratamiento');
            }
          }
        }
      ]
    );
  };

  const handleReminderToggle = async () => {
    try {
      if (treatment.active) {
        await pauseTreatment.mutateAsync({ treatmentId: treatment.id, petId: treatment.petId });
        toast.success('Recordatorios pausados');
      } else {
        await resumeTreatment.mutateAsync({ treatmentId: treatment.id, petId: treatment.petId });
        toast.success('Recordatorios reactivados');
      }
    } catch {
      toast.error('No se pudieron actualizar los recordatorios');
    }
  };

  return (
    <Screen title="Editar tratamiento">
      <ScrollView
        contentContainerStyle={{
          padding: spacing[6],
          paddingTop: 0,
          paddingBottom: bottomPadding,
          gap: spacing[5]
        }}
        keyboardShouldPersistTaps="handled"
      >
        <TreatmentForm
          defaultValues={{
            type: treatment.type,
            productName: treatment.productName ?? '',
            frequencyDays: treatment.frequencyDays,
            lastAppliedDate: treatment.lastAppliedDate,
            reminderDaysBefore: treatment.reminderDaysBefore
          }}
          submitLabel="Guardar cambios"
          submittingLabel="Guardando…"
          isSubmitting={updateTreatment.isPending}
          onSubmit={async (values) => {
            try {
              await updateTreatment.mutateAsync({
                treatmentId: treatment.id,
                petId: treatment.petId,
                type: values.type,
                productName: values.productName || undefined,
                frequencyDays: values.frequencyDays,
                lastAppliedDate: values.lastAppliedDate,
                reminderDaysBefore: values.reminderDaysBefore
              });
              toast.success('Tratamiento actualizado, notificaciones reprogramadas');
              router.back();
            } catch {
              toast.error('No se pudo actualizar el tratamiento, intenta de nuevo');
            }
          }}
        />

        <Pressable
          onPress={handleReminderToggle}
          disabled={pauseTreatment.isPending || resumeTreatment.isPending}
          style={{
            paddingVertical: spacing[4],
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.primary,
            alignItems: 'center',
            opacity: pauseTreatment.isPending || resumeTreatment.isPending ? 0.7 : 1
          }}
        >
          <Text style={{ ...typography.label, color: colors.primary }}>
            {treatment.active ? 'Pausar recordatorios' : 'Reactivar recordatorios'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleDelete}
          disabled={deleteTreatment.isPending}
          style={{
            paddingVertical: spacing[4],
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.error,
            alignItems: 'center',
            opacity: deleteTreatment.isPending ? 0.7 : 1
          }}
        >
          <Text style={{ ...typography.label, color: colors.error }}>Eliminar tratamiento</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
