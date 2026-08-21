import * as Notifications from 'expo-notifications';
import type { Treatment, TreatmentLog, EntityId, ISODateString } from '@/types/domain';
import { databaseService } from '@/services/database/database-service';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationServiceType {
  requestPermissions(): Promise<boolean>;
  scheduleTreatmentNotifications(treatment: Treatment): Promise<{ reminderNotificationId?: string; dueNotificationId?: string }>;
  cancelTreatmentNotifications(notificationIds: { reminderId?: string; dueId?: string }): Promise<void>;
  markTreatmentAsApplied(treatmentId: EntityId, appliedDate: ISODateString, notes?: string): Promise<TreatmentLog>;
}

class NotificationServiceImpl implements NotificationServiceType {
  async requestPermissions(): Promise<boolean> {
    try {
      const permission = await Notifications.getPermissionsAsync();

      if (permission.granted) {
        return true;
      }

      const result = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      return result.granted;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      throw error;
    }
  }

  async scheduleTreatmentNotifications(treatment: Treatment): Promise<{ reminderNotificationId?: string; dueNotificationId?: string }> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }

      const pet = await databaseService.getPetById(treatment.petId);
      if (!pet) {
        throw new Error('Pet not found');
      }

      const notificationIds = {
        reminderNotificationId: undefined as string | undefined,
        dueNotificationId: undefined as string | undefined,
      };

      // Calculate reminder date (X days before) - use number of seconds
      const reminderDate = new Date(treatment.nextDueDate);
      reminderDate.setDate(reminderDate.getDate() - treatment.reminderDaysBefore);
      const reminderSeconds = Math.floor((reminderDate.getTime() - Date.now()) / 1000);

      // Schedule reminder notification
      if (reminderSeconds > 0) {
        notificationIds.reminderNotificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `⏰ Recordatorio: ${treatment.productName || this.getTreatmentTypeLabel(treatment.type)}`,
            body: `En ${treatment.reminderDaysBefore} día(s) vence el tratamiento de ${pet.name}`,
            data: {
              treatmentId: treatment.id,
              petId: treatment.petId,
              type: 'reminder',
              treatmentType: treatment.type,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: reminderSeconds,
            repeats: false
          },
        });
      }

      // Schedule due date notification
      const dueSeconds = Math.floor((new Date(treatment.nextDueDate).getTime() - Date.now()) / 1000);
      if (dueSeconds > 0) {
        notificationIds.dueNotificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `💊 Hoy vence: ${treatment.productName || this.getTreatmentTypeLabel(treatment.type)}`,
            body: `Es hora de aplicar el tratamiento a ${pet.name}`,
            data: {
              treatmentId: treatment.id,
              petId: treatment.petId,
              type: 'due-date',
              treatmentType: treatment.type,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: dueSeconds,
            repeats: false
          },
        });
      }

      return notificationIds;
    } catch (error) {
      console.error('Failed to schedule notifications:', error);
      throw error;
    }
  }

  async cancelTreatmentNotifications(notificationIds: { reminderId?: string; dueId?: string }): Promise<void> {
    try {
      const promises: Promise<void>[] = [];

      if (notificationIds.reminderId) {
        promises.push(Notifications.cancelScheduledNotificationAsync(notificationIds.reminderId));
      }

      if (notificationIds.dueId) {
        promises.push(Notifications.cancelScheduledNotificationAsync(notificationIds.dueId));
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
      throw error;
    }
  }

  async markTreatmentAsApplied(treatmentId: EntityId, appliedDate: ISODateString, notes?: string): Promise<TreatmentLog> {
    try {
      const treatment = await databaseService.getTreatmentById(treatmentId);
      if (!treatment) {
        throw new Error('Treatment not found');
      }

      // Create treatment log
      const treatmentLog = await databaseService.createTreatmentLog({
        treatmentId: treatment.id,
        petId: treatment.petId,
        appliedDate,
        notes,
      });

      // Calculate new next due date
      const nextDueDate = databaseService.calculateNextDueDate(appliedDate, treatment.frequencyDays);

      // Cancel old notifications
      await this.cancelTreatmentNotifications({
        reminderId: treatment.notificationIdReminder,
        dueId: treatment.notificationIdDueDate,
      });

      // Update treatment with new dates
      const updatedTreatment = await databaseService.updateTreatment(treatmentId, {
        lastAppliedDate: appliedDate,
        nextDueDate,
        notificationIdReminder: undefined,
        notificationIdDueDate: undefined,
      });

      if (updatedTreatment) {
        // Schedule new notifications
        const newNotificationIds = await this.scheduleTreatmentNotifications(updatedTreatment);
        await databaseService.updateTreatment(treatmentId, {
          notificationIdReminder: newNotificationIds.reminderNotificationId,
          notificationIdDueDate: newNotificationIds.dueNotificationId,
        });
      }

      return treatmentLog;
    } catch (error) {
      console.error('Failed to mark treatment as applied:', error);
      throw error;
    }
  }

  private getTreatmentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      internal: 'Tratamiento interno',
      external: 'Tratamiento externo',
    };
    return labels[type] || 'Tratamiento';
  }
}

export const notificationService = new NotificationServiceImpl();
