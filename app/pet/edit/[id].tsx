import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { PetForm } from '@/components/pet-form';
import { usePet, useUpdatePet } from '@/lib/hooks/use-pets';
import { useToast } from '@/lib/toast-context';
import { colors, spacing, typography } from '@/theme/tokens';

export default function EditPetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { data: pet, isLoading } = usePet(id);
  const updatePet = useUpdatePet();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!pet) {
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
        <Text style={{ ...typography.body, color: colors.muted }}>No se encontró la mascota.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing[6], gap: spacing[5] }}
    >
      <Text style={{ ...typography.display, color: colors.primary }}>Editar mascota</Text>

      <PetForm
        defaultValues={{
          name: pet.name,
          species: pet.species,
          breed: pet.breed ?? '',
          weightKg: pet.weightKg,
          livesOutdoors: pet.livesOutdoors
        }}
        submitLabel="Guardar cambios"
        submittingLabel="Guardando…"
        isSubmitting={updatePet.isPending}
        onSubmit={async (values) => {
          try {
            await updatePet.mutateAsync({
              petId: pet.id,
              updates: {
                name: values.name,
                species: values.species,
                breed: values.breed || undefined,
                weightKg: values.weightKg,
                livesOutdoors: values.livesOutdoors
              }
            });
            toast.success('Mascota actualizada correctamente');
            router.back();
          } catch {
            toast.error('No se pudo actualizar la mascota, intenta de nuevo');
          }
        }}
      />
    </ScrollView>
  );
}
