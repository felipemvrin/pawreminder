import { supabase, isSupabaseConfigured } from '@/services/supabase/supabase-client';
import { databaseService } from '@/services/database/database-service';
import { asyncStorageService } from '@/services/storage/async-storage-service';
import type { EntityId, Pet, Treatment, TreatmentLog } from '@/types/domain';
import type { SyncEntityType, SyncQueueEntry } from '@/types/sync';
import {
  fromRemotePet,
  fromRemoteTreatment,
  fromRemoteTreatmentLog,
  toRemotePet,
  toRemoteTreatment,
  toRemoteTreatmentLog,
  type RemotePetRow,
  type RemoteTreatmentLogRow,
  type RemoteTreatmentRow
} from './sync-mappers';

const TABLE_BY_ENTITY: Record<SyncEntityType, string> = {
  pet: 'pets',
  treatment: 'treatments',
  treatment_log: 'treatment_logs'
};

const CURSOR_KEY_PREFIX = 'pawreminder:sync:lastPulledAt:';

async function getCurrentUserId(): Promise<EntityId | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

async function buildRemoteRow(
  entry: SyncQueueEntry,
  ownerId: EntityId
): Promise<Record<string, unknown> | null> {
  switch (entry.entityType) {
    case 'pet': {
      const pet = await databaseService.getPetById(entry.entityId);
      return pet ? (toRemotePet(pet, ownerId) as unknown as Record<string, unknown>) : null;
    }
    case 'treatment': {
      const treatment = await databaseService.getTreatmentById(entry.entityId);
      return treatment
        ? (toRemoteTreatment(treatment, ownerId) as unknown as Record<string, unknown>)
        : null;
    }
    case 'treatment_log': {
      const log = await databaseService.getTreatmentLogById(entry.entityId);
      return log ? (toRemoteTreatmentLog(log, ownerId) as unknown as Record<string, unknown>) : null;
    }
    default:
      return null;
  }
}

// Pushes every locally pending change (outbox) to Supabase, one row per queue entry.
// Requires an authenticated Supabase session; no-ops silently otherwise (offline-first by design).
export async function pushPendingChanges(): Promise<{ pushed: number; failed: number }> {
  if (!isSupabaseConfigured || !supabase) return { pushed: 0, failed: 0 };

  const ownerId = await getCurrentUserId();
  if (!ownerId) return { pushed: 0, failed: 0 };

  const pending = await databaseService.getPendingSyncEntries();
  let pushed = 0;
  let failed = 0;

  for (const entry of pending) {
    try {
      const row = await buildRemoteRow(entry, ownerId);

      if (!row) {
        // Local entity is gone (shouldn't normally happen with soft delete) - drop the stale entry
        await databaseService.deleteSyncEntry(entry.id);
        continue;
      }

      const { error } = await supabase.from(TABLE_BY_ENTITY[entry.entityType]).upsert(row, {
        onConflict: 'id'
      });
      if (error) throw error;

      await databaseService.deleteSyncEntry(entry.id);
      pushed += 1;
    } catch (error) {
      failed += 1;
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message: unknown }).message)
            : String(error);
      await databaseService.updateSyncEntryStatus(entry.id, 'error', message);
    }
  }

  return { pushed, failed };
}

async function getCursor(entityType: SyncEntityType): Promise<string | null> {
  return asyncStorageService.getItem(`${CURSOR_KEY_PREFIX}${entityType}`);
}

async function setCursor(entityType: SyncEntityType, value: string): Promise<void> {
  await asyncStorageService.setItem(`${CURSOR_KEY_PREFIX}${entityType}`, value);
}

// Last-write-wins: only overwrite the local row if the remote change is not older than it.
function shouldApplyRemote(localUpdatedAt: string | undefined, remoteUpdatedAt: string): boolean {
  if (!localUpdatedAt) return true;
  return new Date(remoteUpdatedAt).getTime() >= new Date(localUpdatedAt).getTime();
}

async function applyRemotePetRow(row: RemotePetRow): Promise<void> {
  const remotePet = fromRemotePet(row);
  const localPet = await databaseService.getPetById(remotePet.id);
  if (shouldApplyRemote(localPet?.updatedAt, remotePet.updatedAt as string)) {
    await databaseService.upsertPetFromRemote(remotePet as Pet);
  }
}

async function applyRemoteTreatmentRow(row: RemoteTreatmentRow): Promise<void> {
  const remoteTreatment = fromRemoteTreatment(row);
  const localTreatment = await databaseService.getTreatmentById(remoteTreatment.id);
  if (shouldApplyRemote(localTreatment?.updatedAt, remoteTreatment.updatedAt as string)) {
    await databaseService.upsertTreatmentFromRemote(remoteTreatment as Treatment);
  }
}

async function applyRemoteTreatmentLogRow(row: RemoteTreatmentLogRow): Promise<void> {
  const remoteLog = fromRemoteTreatmentLog(row);
  const localLog = await databaseService.getTreatmentLogById(remoteLog.id);
  if (shouldApplyRemote(localLog?.updatedAt, remoteLog.updatedAt as string)) {
    await databaseService.upsertTreatmentLogFromRemote(remoteLog as TreatmentLog);
  }
}

async function pullEntity(entityType: SyncEntityType, ownerId: EntityId): Promise<number> {
  const table = TABLE_BY_ENTITY[entityType];
  const cursor = await getCursor(entityType);

  let query = supabase!
    .from(table)
    .select('*')
    .eq('owner_id', ownerId)
    .order('updated_at', { ascending: true });
  if (cursor) {
    query = query.gt('updated_at', cursor);
  }

  const { data, error } = await query;
  if (error || !data || data.length === 0) return 0;

  for (const row of data) {
    if (entityType === 'pet') await applyRemotePetRow(row as RemotePetRow);
    else if (entityType === 'treatment') await applyRemoteTreatmentRow(row as RemoteTreatmentRow);
    else await applyRemoteTreatmentLogRow(row as RemoteTreatmentLogRow);
  }

  const lastRow = data[data.length - 1] as { updated_at: string };
  await setCursor(entityType, lastRow.updated_at);

  return data.length;
}

// Pulls remote changes newer than the last cursor for the signed-in user and applies
// them locally using last-write-wins conflict resolution based on updatedAt.
export async function pullRemoteChanges(): Promise<{ pulled: number }> {
  if (!isSupabaseConfigured || !supabase) return { pulled: 0 };

  const ownerId = await getCurrentUserId();
  if (!ownerId) return { pulled: 0 };

  let pulled = 0;
  pulled += await pullEntity('pet', ownerId);
  pulled += await pullEntity('treatment', ownerId);
  pulled += await pullEntity('treatment_log', ownerId);

  return { pulled };
}

// Convenience orchestrator: push local changes first, then pull remote ones.
export async function runSync(): Promise<{ pushed: number; failed: number; pulled: number }> {
  const { pushed, failed } = await pushPendingChanges();
  const { pulled } = await pullRemoteChanges();
  return { pushed, failed, pulled };
}
