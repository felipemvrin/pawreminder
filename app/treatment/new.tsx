import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text } from 'react-native';

import { TreatmentForm } from '@/components/treatment-form';
import { useCreateTreatment } from '@/lib/hooks/use-treatments';
import { useToast } from '@/lib/toast-context';
import { colors, spacing, typography } from '@/theme/tokens';

export default function NewTreatmentScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const router = useRouter();
  const toast = useToast();
  const createTreatment = useCreateTreatment();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing[6], gap: spacing[5] }}
    >
      <Text style={{ ...typography.display, color: colors.primary }}>Nuevo tratamiento</Text>

      <TreatmentForm
        submitLabel="Guardar tratamiento"
        submittingLabel="Guardando…"
        isSubmitting={createTreatment.isPending}
        onSubmit={async (values) => {
          if (!petId) return;
          try {
            await createTreatment.mutateAsync({
              petId,
              type: values.type,
              productName: values.productName || undefined,
              frequencyDays: values.frequencyDays,
              lastAppliedDate: values.lastAppliedDate,
              reminderDaysBefore: values.reminderDaysBefore
            });
            toast.success('Tratamiento configurado correctamente');
            router.back();
          } catch {
            toast.error('No se pudo guardar el tratamiento, intenta de nuevo');
          }
        }}
      />
    </ScrollView>
  );
}
