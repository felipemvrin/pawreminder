import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { databaseService } from '@/services/database/database-service';
import type { Pet } from '@/types/domain';

export const petsKeys = {
  all: ['pets'] as const,
  detail: (id: string) => ['pets', id] as const
};

export function usePets() {
  return useQuery({
    queryKey: petsKeys.all,
    queryFn: () => databaseService.getAllPets()
  });
}

export function usePet(petId: string | undefined) {
  return useQuery({
    queryKey: petsKeys.detail(petId ?? ''),
    queryFn: () => databaseService.getPetById(petId as string),
    enabled: Boolean(petId)
  });
}

export function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pet: Omit<Pet, 'id' | 'createdAt'>) => databaseService.createPet(pet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: petsKeys.all });
    }
  });
}

export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ petId, updates }: { petId: string; updates: Partial<Omit<Pet, 'id' | 'createdAt'>> }) =>
      databaseService.updatePet(petId, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: petsKeys.all });
      queryClient.invalidateQueries({ queryKey: petsKeys.detail(variables.petId) });
    }
  });
}

export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (petId: string) => databaseService.deletePet(petId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: petsKeys.all });
    }
  });
}
