import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';

import { PetForm } from '@/components/pet-form';
import { Screen, useScreenBottomPadding } from '@/components/screen';
import { useCreatePet } from '@/lib/hooks/use-pets';
import { useToast } from '@/lib/toast-context';
import { spacing } from '@/theme/tokens';

export default function NewPetScreen() {
  const router = useRouter();
  const toast = useToast();
  const createPet = useCreatePet();
  const bottomPadding = useScreenBottomPadding();

  return (
    <Screen title="Nueva mascota">
      <ScrollView
        contentContainerStyle={{
          padding: spacing[6],
          paddingTop: 0,
          paddingBottom: bottomPadding,
          gap: spacing[5]
        }}
        keyboardShouldPersistTaps="handled"
      >
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
    </Screen>
  );
}
