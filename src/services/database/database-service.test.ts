import * as SQLite from 'expo-sqlite';
import { databaseService } from './database-service';

const mockDatabase = {
  execAsync: jest.fn(),
  runAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn()
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn()
}));

describe('databaseService', () => {
  beforeAll(async () => {
    jest.mocked(SQLite.openDatabaseAsync).mockResolvedValue(mockDatabase as never);
    await databaseService.initialize();
  });

  let initialized = true;

  beforeEach(() => {
    if (initialized) {
      initialized = false;
      return;
    }

    jest.clearAllMocks();
  });

  it('initializes the database schema', async () => {
    expect(SQLite.openDatabaseAsync).toHaveBeenCalledWith('pawreminder.db');
    expect(mockDatabase.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS pets')
    );
    expect(mockDatabase.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS treatments')
    );
    expect(mockDatabase.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS treatment_logs')
    );
  });

  it('creates a pet and converts optional values and booleans for SQLite', async () => {
    const pet = await databaseService.createPet({
      name: 'Luna',
      species: 'dog',
      weightKg: 12.5,
      livesOutdoors: false
    });

    expect(pet).toMatchObject({
      name: 'Luna',
      species: 'dog',
      weightKg: 12.5,
      livesOutdoors: false
    });
    expect(pet.id).toEqual(expect.any(String));
    expect(pet.createdAt).toEqual(expect.any(String));
    expect(mockDatabase.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO pets'),
      [pet.id, 'Luna', 'dog', null, null, 12.5, 0, null, pet.createdAt, null, pet.updatedAt, null]
    );
  });

  it('maps a treatment row returned by SQLite', async () => {
    mockDatabase.getFirstAsync.mockResolvedValueOnce({
      id: 'treatment-1',
      petId: 'pet-1',
      type: 'external',
      productName: null,
      frequencyDays: 30,
      lastAppliedDate: '2026-08-01',
      nextDueDate: '2026-08-31',
      reminderDaysBefore: 2,
      notificationIdDueDate: null,
      notificationIdReminder: 'notification-1',
      active: 1,
      createdAt: '2026-08-01T12:00:00.000Z'
    });

    await expect(databaseService.getTreatmentById('treatment-1')).resolves.toEqual({
      id: 'treatment-1',
      petId: 'pet-1',
      type: 'external',
      frequencyDays: 30,
      lastAppliedDate: '2026-08-01',
      nextDueDate: '2026-08-31',
      reminderDaysBefore: 2,
      notificationIdReminder: 'notification-1',
      active: true,
      createdAt: '2026-08-01T12:00:00.000Z'
    });
    expect(mockDatabase.getFirstAsync).toHaveBeenCalledWith(
      'SELECT * FROM treatments WHERE id = ?',
      ['treatment-1']
    );
  });

  it('creates a treatment log with optional notes normalized to null', async () => {
    const log = await databaseService.createTreatmentLog({
      treatmentId: 'treatment-1',
      petId: 'pet-1',
      appliedDate: '2026-08-26'
    });

    expect(log).toMatchObject({
      treatmentId: 'treatment-1',
      petId: 'pet-1',
      appliedDate: '2026-08-26'
    });
    expect(mockDatabase.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO treatment_logs'),
      [log.id, 'treatment-1', 'pet-1', '2026-08-26', null, log.createdAt, null, log.updatedAt, null]
    );
  });

  it('deletes a pet and its dependent records in order', async () => {
    await expect(databaseService.deletePet('pet-1')).resolves.toBe(true);

    expect(mockDatabase.runAsync.mock.calls).toEqual([
      ['DELETE FROM treatment_logs WHERE petId = ?', ['pet-1']],
      ['DELETE FROM treatments WHERE petId = ?', ['pet-1']],
      ['DELETE FROM pets WHERE id = ?', ['pet-1']]
    ]);
  });

  it.each([
    ['2026-01-31', 1, '2026-02-01'],
    ['2024-02-28', 1, '2024-02-29'],
    ['2026-08-26', 30, '2026-09-25']
  ])(
    'calculates the next due date from %s plus %s days',
    (lastAppliedDate, frequencyDays, expectedDate) => {
      expect(databaseService.calculateNextDueDate(lastAppliedDate, frequencyDays)).toBe(
        expectedDate
      );
    }
  );
});
