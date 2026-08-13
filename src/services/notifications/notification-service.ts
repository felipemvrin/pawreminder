import type { Reminder } from '@/types/domain';

export interface NotificationService {
  requestPermissions(): Promise<boolean>;
  scheduleReminder(reminder: Reminder): Promise<string>;
  cancelReminder(reminderId: string): Promise<void>;
}
