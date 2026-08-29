import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { databaseService } from '@/services/database/database-service';
import { notificationService } from './notification-service';
import type { Treatment } from '@/types/domain';

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' },
  AndroidImportance: { HIGH: 4 },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn()
}));

const pet = {
  id: 'pet-1',
  name: 'Luna',
  species: 'dog' as const,
  weightKg: 12,
  livesOutdoors: false,
  createdAt: '2026-08-01T12:00:00.000Z'
};

const treatment: Treatment = {
  id: 'treatment-1',
  petId: 'pet-1',
  type: 'external',
  productName: 'Pipeta',
  frequencyDays: 30,
  lastAppliedDate: '2026-08-01',
  nextDueDate: '2026-12-01',
  reminderDaysBefore: 2,
  notificationIdDueDate: 'old-due',
  notificationIdReminder: 'old-reminder',
  active: true,
  createdAt: '2026-08-01T12:00:00.000Z'
};

const originalPlatformOS = Platform.OS;

const databaseMethods = {
  getPetById: jest.spyOn(databaseService, 'getPetById'),
  getTreatmentById: jest.spyOn(databaseService, 'getTreatmentById'),
  createTreatmentLog: jest.spyOn(databaseService, 'createTreatmentLog'),
  calculateNextDueDate: jest.spyOn(databaseService, 'calculateNextDueDate'),
  updateTreatment: jest.spyOn(databaseService, 'updateTreatment')
};

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-26T12:00:00.000Z'));
    databaseMethods.getPetById.mockResolvedValue(pet);
    databaseMethods.getTreatmentById.mockResolvedValue(treatment);
    databaseMethods.createTreatmentLog.mockResolvedValue({
      id: 'log-1',
      treatmentId: treatment.id,
      petId: treatment.petId,
      appliedDate: '2026-08-26',
      createdAt: '2026-08-26T12:00:00.000Z'
    });
    databaseMethods.calculateNextDueDate.mockReturnValue('2026-09-25');
    databaseMethods.updateTreatment.mockResolvedValue({ ...treatment, nextDueDate: '2026-09-25' });
  });

  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatformOS });
  });

  it('returns existing permission without requesting it again', async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({ granted: true } as never);

    await expect(notificationService.requestPermissions()).resolves.toBe(true);

    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('requests permission when it has not been granted', async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({ granted: false } as never);
    jest
      .mocked(Notifications.requestPermissionsAsync)
      .mockResolvedValue({ granted: true } as never);

    await expect(notificationService.requestPermissions()).resolves.toBe(true);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledWith({
      ios: { allowAlert: true, allowBadge: true, allowSound: true }
    });
  });

  it('schedules reminder and due notifications for an existing pet', async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({ granted: true } as never);
    jest
      .mocked(Notifications.scheduleNotificationAsync)
      .mockResolvedValueOnce('reminder-1')
      .mockResolvedValueOnce('due-1');

    await expect(notificationService.scheduleTreatmentNotifications(treatment)).resolves.toEqual({
      reminderNotificationId: 'reminder-1',
      dueNotificationId: 'due-1'
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        content: expect.objectContaining({
          title: '⏰ Recordatorio: Pipeta',
          body: 'En 2 día(s) vence el tratamiento de Luna',
          data: expect.objectContaining({ treatmentId: 'treatment-1', type: 'reminder' })
        }),
        trigger: expect.objectContaining({
          type: 'timeInterval',
          channelId: 'treatment-reminders',
          repeats: false
        })
      })
    );
    expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        content: expect.objectContaining({
          title: '💊 Hoy vence: Pipeta',
          body: 'Es hora de aplicar el tratamiento a Luna',
          data: expect.objectContaining({ treatmentId: 'treatment-1', type: 'due-date' })
        }),
        trigger: expect.objectContaining({
          type: 'timeInterval',
          channelId: 'treatment-reminders',
          repeats: false
        })
      })
    );
  });

  it('configures the Android notification channel before scheduling reminders', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({ granted: true } as never);
    jest
      .mocked(Notifications.scheduleNotificationAsync)
      .mockResolvedValueOnce('reminder-1')
      .mockResolvedValueOnce('due-1');

    await notificationService.scheduleTreatmentNotifications(treatment);

    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith('treatment-reminders', {
      name: 'Recordatorios de tratamientos',
      importance: 4,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default'
    });
  });

  it('does not schedule past notifications', async () => {
    const pastTreatment = { ...treatment, nextDueDate: '2026-08-25' };
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({ granted: true } as never);

    await expect(
      notificationService.scheduleTreatmentNotifications(pastTreatment)
    ).resolves.toEqual({
      reminderNotificationId: undefined,
      dueNotificationId: undefined
    });
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('cancels only notification IDs that exist', async () => {
    await notificationService.cancelTreatmentNotifications({ reminderId: 'reminder-1' });

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('reminder-1');
  });

  it('marks a treatment as applied and reschedules its notifications', async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({ granted: true } as never);
    jest
      .mocked(Notifications.scheduleNotificationAsync)
      .mockResolvedValueOnce('new-reminder')
      .mockResolvedValueOnce('new-due');

    await expect(
      notificationService.markTreatmentAsApplied('treatment-1', '2026-08-26', 'Sin molestias')
    ).resolves.toEqual(expect.objectContaining({ id: 'log-1', appliedDate: '2026-08-26' }));

    expect(databaseMethods.createTreatmentLog).toHaveBeenCalledWith({
      treatmentId: 'treatment-1',
      petId: 'pet-1',
      appliedDate: '2026-08-26',
      notes: 'Sin molestias'
    });
    expect(databaseMethods.calculateNextDueDate).toHaveBeenCalledWith('2026-08-26', 30);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-reminder');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-due');
    expect(databaseMethods.updateTreatment).toHaveBeenNthCalledWith(1, 'treatment-1', {
      lastAppliedDate: '2026-08-26',
      nextDueDate: '2026-09-25',
      notificationIdReminder: undefined,
      notificationIdDueDate: undefined
    });
    expect(databaseMethods.updateTreatment).toHaveBeenNthCalledWith(2, 'treatment-1', {
      notificationIdReminder: 'new-reminder',
      notificationIdDueDate: 'new-due'
    });
  });

  it('rejects scheduling when permissions are denied', async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({ granted: false } as never);
    jest
      .mocked(Notifications.requestPermissionsAsync)
      .mockResolvedValue({ granted: false } as never);

    await expect(notificationService.scheduleTreatmentNotifications(treatment)).rejects.toThrow(
      'Notification permissions not granted'
    );
    expect(databaseMethods.getPetById).not.toHaveBeenCalled();
  });
});
