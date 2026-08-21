import { useCallback, useState } from 'react';
import type { Treatment } from '@/types/domain';
import { notificationService } from '@/services/notifications/notification-service';
import { databaseService } from '@/services/database/database-service';
import { useToast } from '@/lib/toast-context';

interface ConfirmationState {
  isOpen: boolean;
  treatment: Treatment | null;
  isLoading: boolean;
}

export const useNotificationConfirmation = () => {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    treatment: null,
    isLoading: false,
  });

  const { success, error } = useToast();

  const openConfirmation = useCallback((treatment: Treatment) => {
    setState({
      isOpen: true,
      treatment,
      isLoading: false,
    });
  }, []);

  const closeConfirmation = useCallback(() => {
    setState({
      isOpen: false,
      treatment: null,
      isLoading: false,
    });
  }, []);

  const confirmNotifications = useCallback(async (treatment: Treatment) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Cancel old notifications if they exist
      if (treatment.notificationIdReminder || treatment.notificationIdDueDate) {
        await notificationService.cancelTreatmentNotifications({
          reminderId: treatment.notificationIdReminder,
          dueId: treatment.notificationIdDueDate,
        });
      }

      // Schedule new notifications
      const newNotificationIds = await notificationService.scheduleTreatmentNotifications(treatment);

      // Update treatment with new notification IDs
      await databaseService.updateTreatment(treatment.id, {
        notificationIdReminder: newNotificationIds.reminderNotificationId,
        notificationIdDueDate: newNotificationIds.dueNotificationId,
      });

      success('Notificaciones actualizadas correctamente', 2000);
      setState({
        isOpen: false,
        treatment: null,
        isLoading: false,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al programar las notificaciones';
      error(`${errorMessage}. Por favor, intenta nuevamente.`);
      setState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [success, error]);

  return {
    isOpen: state.isOpen,
    treatment: state.treatment,
    isLoading: state.isLoading,
    openConfirmation,
    closeConfirmation,
    confirmNotifications,
  };
};
