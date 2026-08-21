import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView } from 'react-native';

import { Screen, useScreenBottomPadding } from '@/components/screen';
import { TreatmentForm } from '@/components/treatment-form';
import { useCreateTreatment } from '@/lib/hooks/use-treatments';
import { useToast } from '@/lib/toast-context';
import { spacing } from '@/theme/tokens';

export default function NewTreatmentScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const router = useRouter();
  const toast = useToast();
  const createTreatment = useCreateTreatment();
  const bottomPadding = useScreenBottomPadding();

  return (
    <Screen title="Nuevo tratamiento">
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
    </Screen>
  );
}
