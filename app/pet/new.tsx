import { useRouter } from 'expo-router';
import { ScrollView, Text } from 'react-native';

import { PetForm } from '@/components/pet-form';
import { useCreatePet } from '@/lib/hooks/use-pets';
import { useToast } from '@/lib/toast-context';
import { colors, spacing, typography } from '@/theme/tokens';

export default function NewPetScreen() {
  const router = useRouter();
  const toast = useToast();
  const createPet = useCreatePet();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing[6], gap: spacing[5] }}
    >
      <Text style={{ ...typography.display, color: colors.primary }}>Nueva mascota</Text>

      <PetForm
        submitLabel="Guardar mascota"
        submittingLabel="Guardando…"
        isSubmitting={createPet.isPending}
        onSubmit={async (values) => {
          try {
            await createPet.mutateAsync({
              name: values.name,
              species: values.species,
              breed: values.breed || undefined,
              weightKg: values.weightKg,
              livesOutdoors: values.livesOutdoors
            });
            toast.success('Mascota agregada correctamente');
            router.back();
          } catch {
            toast.error('No se pudo guardar la mascota, intenta de nuevo');
          }
        }}
      />
    </ScrollView>
  );
}
