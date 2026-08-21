import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { TreatmentForm } from '@/components/treatment-form';
import { useDeleteTreatment, useTreatment, useUpdateTreatment } from '@/lib/hooks/use-treatments';
import { useToast } from '@/lib/toast-context';
import { colors, radius, spacing, typography } from '@/theme/tokens';

export default function EditTreatmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { data: treatment, isLoading } = useTreatment(id);
  const updateTreatment = useUpdateTreatment();
  const deleteTreatment = useDeleteTreatment();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!treatment) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
          padding: spacing[6]
        }}
      >
        <Text style={{ ...typography.body, color: colors.muted }}>No se encontró el tratamiento.</Text>
      </View>
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
              await deleteTreatment.mutateAsync({ treatmentId: treatment.id, petId: treatment.petId });
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing[6], gap: spacing[5] }}
    >
      <Text style={{ ...typography.display, color: colors.primary }}>Editar tratamiento</Text>

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
  );
}
