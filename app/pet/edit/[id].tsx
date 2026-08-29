import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { PetForm } from '@/components/pet-form';
import { Screen, useScreenBottomPadding } from '@/components/screen';
import { usePet, useUpdatePet } from '@/lib/hooks/use-pets';
import { useToast } from '@/lib/toast-context';
import { colors, spacing, typography } from '@/theme/tokens';

export default function EditPetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { data: pet, isLoading } = usePet(id);
  const updatePet = useUpdatePet();
  const bottomPadding = useScreenBottomPadding();

  if (isLoading) {
    return (
      <Screen title="Editar mascota">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!pet) {
    return (
      <Screen title="Editar mascota">
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

  return (
    <Screen title="Editar mascota">
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
          defaultValues={{
            name: pet.name,
            species: pet.species,
            breed: pet.breed ?? '',
            photoUri: pet.photoUri ?? '',
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
                  photoUri: values.photoUri || undefined,
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
    </Screen>
  );
}
