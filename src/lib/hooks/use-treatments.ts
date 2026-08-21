import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import { databaseService } from '@/services/database/database-service';
import { notificationService } from '@/services/notifications/notification-service';
import { getMostUrgentTreatment } from '@/lib/treatment-status';
import type { EntityId, ISODateString, Pet, Treatment } from '@/types/domain';

export const treatmentsKeys = {
  all: ['treatments'] as const,
  byPet: (petId: string) => ['treatments', 'pet', petId] as const,
  detail: (id: string) => ['treatments', 'detail', id] as const
};

export const treatmentLogsKeys = {
  byPet: (petId: string) => ['treatment-logs', 'pet', petId] as const,
  byTreatment: (treatmentId: string) => ['treatment-logs', 'treatment', treatmentId] as const
};

export function useTreatmentsByPet(petId: string | undefined) {
  return useQuery({
    queryKey: treatmentsKeys.byPet(petId ?? ''),
    queryFn: () => databaseService.getTreatmentsByPetId(petId as string),
    enabled: Boolean(petId)
  });
}

export function useTreatment(treatmentId: string | undefined) {
  return useQuery({
    queryKey: treatmentsKeys.detail(treatmentId ?? ''),
    queryFn: () => databaseService.getTreatmentById(treatmentId as string),
    enabled: Boolean(treatmentId)
  });
}

/** Fetches the most urgent active treatment for each pet, used for status badges on the home list. */
export function usePetTreatmentSummaries(pets: Pet[] | undefined) {
  const results = useQueries({
    queries: (pets ?? []).map((pet) => ({
      queryKey: treatmentsKeys.byPet(pet.id),
      queryFn: () => databaseService.getTreatmentsByPetId(pet.id),
      enabled: Boolean(pets)
    }))
  });

  const summaries = new Map<string, Treatment | undefined>();
  (pets ?? []).forEach((pet, index) => {
    summaries.set(pet.id, getMostUrgentTreatment(results[index]?.data ?? []));
  });

  return {
    summaries,
    isLoading: results.some((r) => r.isLoading)
  };
}

export function useTreatmentLogsByPet(petId: string | undefined) {
  return useQuery({
    queryKey: treatmentLogsKeys.byPet(petId ?? ''),
    queryFn: () => databaseService.getTreatmentLogsByPetId(petId as string),
    enabled: Boolean(petId)
  });
}

interface CreateTreatmentInput {
  petId: EntityId;
  type: Treatment['type'];
  productName?: string;
  frequencyDays: number;
  lastAppliedDate: ISODateString;
  reminderDaysBefore: number;
}

export function useCreateTreatment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTreatmentInput) => {
      const nextDueDate = databaseService.calculateNextDueDate(input.lastAppliedDate, input.frequencyDays);

      const treatment = await databaseService.createTreatment({
        petId: input.petId,
        type: input.type,
        productName: input.productName,
        frequencyDays: input.frequencyDays,
        lastAppliedDate: input.lastAppliedDate,
        nextDueDate,
        reminderDaysBefore: input.reminderDaysBefore,
        active: true
      });

      const notificationIds = await notificationService.scheduleTreatmentNotifications(treatment);
      return databaseService.updateTreatment(treatment.id, {
        notificationIdReminder: notificationIds.reminderNotificationId,
        notificationIdDueDate: notificationIds.dueNotificationId
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: treatmentsKeys.byPet(variables.petId) });
    }
  });
}

interface UpdateTreatmentInput {
  treatmentId: EntityId;
  petId: EntityId;
  type: Treatment['type'];
  productName?: string;
  frequencyDays: number;
  lastAppliedDate: ISODateString;
  reminderDaysBefore: number;
}

export function useUpdateTreatment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTreatmentInput) => {
      const current = await databaseService.getTreatmentById(input.treatmentId);
      if (!current) throw new Error('Tratamiento no encontrado');

      await notificationService.cancelTreatmentNotifications({
        reminderId: current.notificationIdReminder,
        dueId: current.notificationIdDueDate
      });

      const nextDueDate = databaseService.calculateNextDueDate(input.lastAppliedDate, input.frequencyDays);

      const updated = await databaseService.updateTreatment(input.treatmentId, {
        type: input.type,
        productName: input.productName,
        frequencyDays: input.frequencyDays,
        lastAppliedDate: input.lastAppliedDate,
        nextDueDate,
        reminderDaysBefore: input.reminderDaysBefore,
        notificationIdReminder: undefined,
        notificationIdDueDate: undefined
      });

      if (!updated) throw new Error('Tratamiento no encontrado');

      const notificationIds = await notificationService.scheduleTreatmentNotifications(updated);
      return databaseService.updateTreatment(input.treatmentId, {
        notificationIdReminder: notificationIds.reminderNotificationId,
        notificationIdDueDate: notificationIds.dueNotificationId
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: treatmentsKeys.byPet(variables.petId) });
      queryClient.invalidateQueries({ queryKey: treatmentsKeys.detail(variables.treatmentId) });
    }
  });
}

export function useDeleteTreatment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ treatmentId }: { treatmentId: EntityId; petId: EntityId }) => {
      const treatment = await databaseService.getTreatmentById(treatmentId);
      if (treatment) {
        await notificationService.cancelTreatmentNotifications({
          reminderId: treatment.notificationIdReminder,
          dueId: treatment.notificationIdDueDate
        });
      }
      return databaseService.deleteTreatment(treatmentId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: treatmentsKeys.byPet(variables.petId) });
      queryClient.invalidateQueries({ queryKey: treatmentLogsKeys.byPet(variables.petId) });
    }
  });
}

export function useMarkTreatmentApplied() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      treatmentId,
      appliedDate,
      notes
    }: {
      treatmentId: EntityId;
      petId: EntityId;
      appliedDate: ISODateString;
      notes?: string;
    }) => notificationService.markTreatmentAsApplied(treatmentId, appliedDate, notes),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: treatmentsKeys.byPet(variables.petId) });
      queryClient.invalidateQueries({ queryKey: treatmentsKeys.detail(variables.treatmentId) });
      queryClient.invalidateQueries({ queryKey: treatmentLogsKeys.byPet(variables.petId) });
    }
  });
}
