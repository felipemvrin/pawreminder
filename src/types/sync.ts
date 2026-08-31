import type { EntityId, ISODateString } from './domain';

// Local-only bookkeeping: never sent to the backend, lives in a device-side sync table.
export type SyncEntityType = 'pet' | 'treatment' | 'treatment_log';
export type SyncOperation = 'upsert' | 'delete';
export type SyncStatus = 'pending' | 'synced' | 'conflict' | 'error';

// One entry per local change waiting to be pushed to Supabase (offline-first outbox).
export interface SyncQueueEntry {
  id: EntityId;
  entityType: SyncEntityType;
  entityId: EntityId;
  operation: SyncOperation;
  status: SyncStatus;
  updatedAt: ISODateString;
  attempts: number;
  lastError?: string;
}

// Per-account cursor to support incremental pulls from the backend.
export interface SyncCursor {
  ownerId: EntityId;
  entityType: SyncEntityType;
  lastPulledAt?: ISODateString;
}
