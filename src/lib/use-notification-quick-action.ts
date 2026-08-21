import { useCallback, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';

import { databaseService } from '@/services/database/database-service';
import { useMarkTreatmentApplied } from '@/lib/hooks/use-treatments';
import { useToast } from '@/lib/toast-context';
import type { Pet, Treatment } from '@/types/domain';

interface QuickActionState {
  isOpen: boolean;
  treatment: Treatment | null;
  pet: Pet | null;
}

/** Listens for taps on treatment reminder/due-date notifications and offers a quick "mark as applied" action. */
export function useNotificationQuickAction() {
  const [state, setState] = useState<QuickActionState>({ isOpen: false, treatment: null, pet: null });
  const markApplied = useMarkTreatmentApplied();
  const toast = useToast();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const treatmentId = response.notification.request.content.data?.treatmentId as string | undefined;
      if (!treatmentId) return;

      const treatment = await databaseService.getTreatmentById(treatmentId);
      if (!treatment) return;

      const pet = await databaseService.getPetById(treatment.petId);
      setState({ isOpen: true, treatment, pet });
    });

    return () => subscription.remove();
  }, []);

  const dismiss = useCallback(() => {
    setState({ isOpen: false, treatment: null, pet: null });
  }, []);

  const confirm = useCallback(async () => {
    if (!state.treatment) return;

    try {
      await markApplied.mutateAsync({
        treatmentId: state.treatment.id,
        petId: state.treatment.petId,
        appliedDate: new Date().toISOString().split('T')[0]
      });
      toast.success('Tratamiento registrado, próxima fecha actualizada');
      dismiss();
    } catch {
      toast.error('No se pudo registrar el tratamiento');
    }
  }, [state.treatment, markApplied, toast, dismiss]);

  return {
    isOpen: state.isOpen,
    treatment: state.treatment,
    petName: state.pet?.name,
    isLoading: markApplied.isPending,
    confirm,
    dismiss
  };
}
