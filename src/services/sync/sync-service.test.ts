import { databaseService } from '@/services/database/database-service';
import type { Pet, Treatment } from '@/types/domain';
import type { SyncQueueEntry } from '@/types/sync';
import { pushPendingChanges } from './sync-service';

const mockGetUser = jest.fn();
const mockUpsert = jest.fn();
const mockFrom = jest.fn((_table: string) => ({ upsert: mockUpsert }));

jest.mock('@/services/supabase/supabase-client', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: { getUser: () => mockGetUser() },
    from: (table: string) => mockFrom(table)
  }
}));

jest.mock('@/services/storage/async-storage-service', () => ({
  asyncStorageService: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined)
  }
}));

const pet: Pet = {
  id: 'pet-1',
  name: 'Luna',
  species: 'dog',
  weightKg: 12,
  livesOutdoors: false,
  createdAt: '2026-08-01T12:00:00.000Z',
  updatedAt: '2026-08-01T12:00:00.000Z'
};

const treatment: Treatment = {
  id: 'treatment-1',
  petId: 'pet-1',
  type: 'external',
  frequencyDays: 30,
  lastAppliedDate: '2026-08-01',
  nextDueDate: '2026-12-01',
  reminderDaysBefore: 2,
  active: true,
  createdAt: '2026-08-01T12:00:00.000Z',
  updatedAt: '2026-08-01T12:00:00.000Z'
};

const pendingPetEntry: SyncQueueEntry = {
  id: 'queue-1',
  entityType: 'pet',
  entityId: 'pet-1',
  operation: 'upsert',
  status: 'pending',
  updatedAt: '2026-08-01T12:00:00.000Z',
  attempts: 0
};

describe('sync-service pushPendingChanges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    mockUpsert.mockResolvedValue({ error: null });
    jest.spyOn(databaseService, 'getPendingSyncEntries').mockResolvedValue([pendingPetEntry]);
    jest.spyOn(databaseService, 'getPetById').mockResolvedValue(pet);
    jest.spyOn(databaseService, 'getTreatmentById').mockResolvedValue(treatment);
    jest.spyOn(databaseService, 'deleteSyncEntry').mockResolvedValue(undefined);
    jest.spyOn(databaseService, 'updateSyncEntryStatus').mockResolvedValue(undefined);
  });

  it('does nothing when there is no authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await pushPendingChanges();

    expect(result).toEqual({ pushed: 0, failed: 0 });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('upserts the pending pet row into the pets table and clears the queue entry', async () => {
    const result = await pushPendingChanges();

    expect(mockFrom).toHaveBeenCalledWith('pets');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'pet-1', owner_id: 'user-1', name: 'Luna' }),
      { onConflict: 'id' }
    );
    expect(databaseService.deleteSyncEntry).toHaveBeenCalledWith('queue-1');
    expect(result).toEqual({ pushed: 1, failed: 0 });
  });

  it('marks the queue entry as error when the upsert fails', async () => {
    mockUpsert.mockResolvedValue({ error: { message: 'network down' } });

    const result = await pushPendingChanges();

    expect(databaseService.updateSyncEntryStatus).toHaveBeenCalledWith(
      'queue-1',
      'error',
      'network down'
    );
    expect(result).toEqual({ pushed: 0, failed: 1 });
  });

  it('drops the queue entry when the local entity no longer exists', async () => {
    jest.spyOn(databaseService, 'getPetById').mockResolvedValue(null);

    const result = await pushPendingChanges();

    expect(databaseService.deleteSyncEntry).toHaveBeenCalledWith('queue-1');
    expect(mockFrom).not.toHaveBeenCalled();
    expect(result).toEqual({ pushed: 0, failed: 0 });
  });
});
