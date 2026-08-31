import * as SQLite from 'expo-sqlite';
import type {
  EntityId,
  ISODateString,
  Pet,
  Treatment,
  TreatmentLog,
  Species,
  TreatmentType
} from '@/types/domain';
import type { SyncQueueEntry, SyncStatus } from '@/types/sync';
import { isoDateToLocalDate, localDateToISO } from '@/lib/date-format';

const DATABASE_NAME = 'pawreminder.db';
const SCHEMA_VERSION = 1;

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);

      if (!this.db) throw new Error('Failed to open database');

      // Enable foreign keys and create tables
      await this.db.execAsync(`
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS pets (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          species TEXT NOT NULL,
          breed TEXT,
          birthDate TEXT,
          weightKg REAL NOT NULL,
          livesOutdoors INTEGER NOT NULL,
          photoUri TEXT,
          createdAt TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS treatments (
          id TEXT PRIMARY KEY,
          petId TEXT NOT NULL,
          type TEXT NOT NULL,
          productName TEXT,
          frequencyDays INTEGER NOT NULL,
          lastAppliedDate TEXT NOT NULL,
          nextDueDate TEXT NOT NULL,
          reminderDaysBefore INTEGER NOT NULL,
          notificationIdDueDate TEXT,
          notificationIdReminder TEXT,
          active INTEGER NOT NULL,
          createdAt TEXT NOT NULL,
          FOREIGN KEY (petId) REFERENCES pets(id)
        );
        CREATE TABLE IF NOT EXISTS treatment_logs (
          id TEXT PRIMARY KEY,
          treatmentId TEXT NOT NULL,
          petId TEXT NOT NULL,
          appliedDate TEXT NOT NULL,
          notes TEXT,
          createdAt TEXT NOT NULL,
          FOREIGN KEY (treatmentId) REFERENCES treatments(id),
          FOREIGN KEY (petId) REFERENCES pets(id)
        );
      `);

      await this.migrateToSyncSchema();

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  // Adds sync-related columns/table to installs created before cloud sync existed.
  // Idempotent: guarded by PRAGMA user_version so it only runs once per device.
  private async migrateToSyncSchema(): Promise<void> {
    const db = this.ensureDb();
    const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    if ((row?.user_version ?? 0) >= SCHEMA_VERSION) return;

    await db.execAsync(`
      ALTER TABLE pets ADD COLUMN ownerId TEXT;
      ALTER TABLE pets ADD COLUMN updatedAt TEXT;
      ALTER TABLE pets ADD COLUMN deletedAt TEXT;
      ALTER TABLE treatments ADD COLUMN ownerId TEXT;
      ALTER TABLE treatments ADD COLUMN updatedAt TEXT;
      ALTER TABLE treatments ADD COLUMN deletedAt TEXT;
      ALTER TABLE treatment_logs ADD COLUMN ownerId TEXT;
      ALTER TABLE treatment_logs ADD COLUMN updatedAt TEXT;
      ALTER TABLE treatment_logs ADD COLUMN deletedAt TEXT;
      UPDATE pets SET updatedAt = createdAt WHERE updatedAt IS NULL;
      UPDATE treatments SET updatedAt = createdAt WHERE updatedAt IS NULL;
      UPDATE treatment_logs SET updatedAt = createdAt WHERE updatedAt IS NULL;
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        entityType TEXT NOT NULL,
        entityId TEXT NOT NULL,
        operation TEXT NOT NULL,
        status TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        lastError TEXT
      );
      PRAGMA user_version = ${SCHEMA_VERSION};
    `);
  }

  private ensureDb(): SQLite.SQLiteDatabase {
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }

  async createPet(pet: Omit<Pet, 'id' | 'createdAt'>): Promise<Pet> {
    const id = this.generateId();
    const createdAt = new Date().toISOString();

    const fullPet: Pet = { updatedAt: createdAt, ...pet, id, createdAt };

    try {
      const db = this.ensureDb();
      await db.runAsync(
        `INSERT INTO pets (id, name, species, breed, birthDate, weightKg, livesOutdoors, photoUri, createdAt, ownerId, updatedAt, deletedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fullPet.id,
          fullPet.name,
          fullPet.species,
          fullPet.breed || null,
          fullPet.birthDate || null,
          fullPet.weightKg,
          fullPet.livesOutdoors ? 1 : 0,
          fullPet.photoUri || null,
          fullPet.createdAt,
          fullPet.ownerId || null,
          fullPet.updatedAt || null,
          fullPet.deletedAt || null
        ]
      );

      return fullPet;
    } catch (error) {
      console.error('Failed to create pet:', error);
      throw error;
    }
  }

  async getPetById(petId: EntityId): Promise<Pet | null> {
    try {
      const db = this.ensureDb();
      const row = await db.getFirstAsync<any>('SELECT * FROM pets WHERE id = ?', [petId]);
      return row ? this.mapRowToPet(row) : null;
    } catch (error) {
      console.error('Failed to get pet:', error);
      throw error;
    }
  }

  async getAllPets(): Promise<Pet[]> {
    try {
      const db = this.ensureDb();
      const rows = await db.getAllAsync<any>('SELECT * FROM pets ORDER BY createdAt DESC');
      return rows.map((row: any) => this.mapRowToPet(row));
    } catch (error) {
      console.error('Failed to get all pets:', error);
      throw error;
    }
  }

  async updatePet(
    petId: EntityId,
    updates: Partial<Omit<Pet, 'id' | 'createdAt'>>
  ): Promise<Pet | null> {
    const pet = await this.getPetById(petId);
    if (!pet) return null;

    const updated = { ...pet, ...updates, updatedAt: new Date().toISOString() };

    try {
      const db = this.ensureDb();
      await db.runAsync(
        `UPDATE pets
         SET name = ?, species = ?, breed = ?, birthDate = ?, weightKg = ?, livesOutdoors = ?, photoUri = ?, ownerId = ?, updatedAt = ?, deletedAt = ?
         WHERE id = ?`,
        [
          updated.name,
          updated.species,
          updated.breed || null,
          updated.birthDate || null,
          updated.weightKg,
          updated.livesOutdoors ? 1 : 0,
          updated.photoUri || null,
          updated.ownerId || null,
          updated.updatedAt,
          updated.deletedAt || null,
          petId
        ]
      );

      return updated;
    } catch (error) {
      console.error('Failed to update pet:', error);
      throw error;
    }
  }

  async deletePet(petId: EntityId): Promise<boolean> {
    try {
      const db = this.ensureDb();
      await db.runAsync('DELETE FROM treatment_logs WHERE petId = ?', [petId]);
      await db.runAsync('DELETE FROM treatments WHERE petId = ?', [petId]);
      await db.runAsync('DELETE FROM pets WHERE id = ?', [petId]);
      return true;
    } catch (error) {
      console.error('Failed to delete pet:', error);
      throw error;
    }
  }

  // ============ TREATMENT OPERATIONS ============

  async createTreatment(treatment: Omit<Treatment, 'id' | 'createdAt'>): Promise<Treatment> {
    const id = this.generateId();
    const createdAt = new Date().toISOString();

    const fullTreatment: Treatment = { updatedAt: createdAt, ...treatment, id, createdAt };

    try {
      const db = this.ensureDb();
      await db.runAsync(
        `INSERT INTO treatments (
          id, petId, type, productName, frequencyDays, lastAppliedDate, nextDueDate,
          reminderDaysBefore, notificationIdDueDate, notificationIdReminder, active, createdAt,
          ownerId, updatedAt, deletedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fullTreatment.id,
          fullTreatment.petId,
          fullTreatment.type,
          fullTreatment.productName || null,
          fullTreatment.frequencyDays,
          fullTreatment.lastAppliedDate,
          fullTreatment.nextDueDate,
          fullTreatment.reminderDaysBefore,
          fullTreatment.notificationIdDueDate || null,
          fullTreatment.notificationIdReminder || null,
          fullTreatment.active ? 1 : 0,
          fullTreatment.createdAt,
          fullTreatment.ownerId || null,
          fullTreatment.updatedAt || null,
          fullTreatment.deletedAt || null
        ]
      );

      return fullTreatment;
    } catch (error) {
      console.error('Failed to create treatment:', error);
      throw error;
    }
  }

  async getTreatmentById(treatmentId: EntityId): Promise<Treatment | null> {
    try {
      const db = this.ensureDb();
      const row = await db.getFirstAsync<any>('SELECT * FROM treatments WHERE id = ?', [
        treatmentId
      ]);
      return row ? this.mapRowToTreatment(row) : null;
    } catch (error) {
      console.error('Failed to get treatment:', error);
      throw error;
    }
  }

  async getTreatmentsByPetId(petId: EntityId): Promise<Treatment[]> {
    try {
      const db = this.ensureDb();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM treatments WHERE petId = ? ORDER BY createdAt DESC',
        [petId]
      );
      return rows.map((row: any) => this.mapRowToTreatment(row));
    } catch (error) {
      console.error('Failed to get treatments by pet:', error);
      throw error;
    }
  }

  async updateTreatment(
    treatmentId: EntityId,
    updates: Partial<Omit<Treatment, 'id' | 'createdAt'>>
  ): Promise<Treatment | null> {
    const treatment = await this.getTreatmentById(treatmentId);
    if (!treatment) return null;

    const updated = { ...treatment, ...updates, updatedAt: new Date().toISOString() };

    try {
      const db = this.ensureDb();
      await db.runAsync(
        `UPDATE treatments
         SET type = ?, productName = ?, frequencyDays = ?, lastAppliedDate = ?, nextDueDate = ?,
             reminderDaysBefore = ?, notificationIdDueDate = ?, notificationIdReminder = ?, active = ?,
             ownerId = ?, updatedAt = ?, deletedAt = ?
         WHERE id = ?`,
        [
          updated.type,
          updated.productName || null,
          updated.frequencyDays,
          updated.lastAppliedDate,
          updated.nextDueDate,
          updated.reminderDaysBefore,
          updated.notificationIdDueDate || null,
          updated.notificationIdReminder || null,
          updated.active ? 1 : 0,
          updated.ownerId || null,
          updated.updatedAt,
          updated.deletedAt || null,
          treatmentId
        ]
      );

      return updated;
    } catch (error) {
      console.error('Failed to update treatment:', error);
      throw error;
    }
  }

  async deleteTreatment(treatmentId: EntityId): Promise<boolean> {
    try {
      const db = this.ensureDb();
      await db.runAsync('DELETE FROM treatment_logs WHERE treatmentId = ?', [treatmentId]);
      await db.runAsync('DELETE FROM treatments WHERE id = ?', [treatmentId]);
      return true;
    } catch (error) {
      console.error('Failed to delete treatment:', error);
      throw error;
    }
  }

  // ============ TREATMENT LOG OPERATIONS ============

  async createTreatmentLog(log: Omit<TreatmentLog, 'id' | 'createdAt'>): Promise<TreatmentLog> {
    const id = this.generateId();
    const createdAt = new Date().toISOString();

    const fullLog: TreatmentLog = { updatedAt: createdAt, ...log, id, createdAt };

    try {
      const db = this.ensureDb();
      await db.runAsync(
        `INSERT INTO treatment_logs (id, treatmentId, petId, appliedDate, notes, createdAt, ownerId, updatedAt, deletedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fullLog.id,
          fullLog.treatmentId,
          fullLog.petId,
          fullLog.appliedDate,
          fullLog.notes || null,
          fullLog.createdAt,
          fullLog.ownerId || null,
          fullLog.updatedAt || null,
          fullLog.deletedAt || null
        ]
      );

      return fullLog;
    } catch (error) {
      console.error('Failed to create treatment log:', error);
      throw error;
    }
  }

  async getTreatmentLogsByTreatmentId(treatmentId: EntityId): Promise<TreatmentLog[]> {
    try {
      const db = this.ensureDb();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM treatment_logs WHERE treatmentId = ? ORDER BY appliedDate DESC',
        [treatmentId]
      );
      return rows.map((row: any) => this.mapRowToTreatmentLog(row));
    } catch (error) {
      console.error('Failed to get treatment logs:', error);
      throw error;
    }
  }

  async getTreatmentLogsByPetId(petId: EntityId): Promise<TreatmentLog[]> {
    try {
      const db = this.ensureDb();
      const rows = await db.getAllAsync<any>(
        'SELECT * FROM treatment_logs WHERE petId = ? ORDER BY appliedDate DESC',
        [petId]
      );
      return rows.map((row: any) => this.mapRowToTreatmentLog(row));
    } catch (error) {
      console.error('Failed to get treatment logs by pet:', error);
      throw error;
    }
  }

  // ============ HELPER METHODS ============

  calculateNextDueDate(lastAppliedDate: ISODateString, frequencyDays: number): ISODateString {
    const date = isoDateToLocalDate(lastAppliedDate);
    date.setDate(date.getDate() + frequencyDays);
    return localDateToISO(date);
  }

  private generateId(): EntityId {
    // UUID v4: required so IDs generated on different devices never collide when synced
    return crypto.randomUUID();
  }

  private mapRowToPet(row: any): Pet {
    return {
      id: row.id,
      name: row.name,
      species: row.species as Species,
      breed: row.breed || undefined,
      birthDate: row.birthDate || undefined,
      weightKg: row.weightKg,
      livesOutdoors: row.livesOutdoors === 1,
      photoUri: row.photoUri || undefined,
      createdAt: row.createdAt,
      ownerId: row.ownerId || undefined,
      updatedAt: row.updatedAt || undefined,
      deletedAt: row.deletedAt || undefined
    };
  }

  private mapRowToTreatment(row: any): Treatment {
    return {
      id: row.id,
      petId: row.petId,
      type: row.type as TreatmentType,
      productName: row.productName || undefined,
      frequencyDays: row.frequencyDays,
      lastAppliedDate: row.lastAppliedDate,
      nextDueDate: row.nextDueDate,
      reminderDaysBefore: row.reminderDaysBefore,
      notificationIdDueDate: row.notificationIdDueDate || undefined,
      notificationIdReminder: row.notificationIdReminder || undefined,
      active: row.active === 1,
      createdAt: row.createdAt,
      ownerId: row.ownerId || undefined,
      updatedAt: row.updatedAt || undefined,
      deletedAt: row.deletedAt || undefined
    };
  }

  private mapRowToTreatmentLog(row: any): TreatmentLog {
    return {
      id: row.id,
      treatmentId: row.treatmentId,
      petId: row.petId,
      appliedDate: row.appliedDate,
      notes: row.notes || undefined,
      createdAt: row.createdAt,
      ownerId: row.ownerId || undefined,
      updatedAt: row.updatedAt || undefined,
      deletedAt: row.deletedAt || undefined
    };
  }

  // ============ SYNC QUEUE OPERATIONS ============

  async enqueueSyncEntry(entry: Omit<SyncQueueEntry, 'id' | 'attempts'>): Promise<SyncQueueEntry> {
    const fullEntry: SyncQueueEntry = { id: this.generateId(), attempts: 0, ...entry };

    try {
      const db = this.ensureDb();
      await db.runAsync(
        `INSERT INTO sync_queue (id, entityType, entityId, operation, status, updatedAt, attempts, lastError)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fullEntry.id,
          fullEntry.entityType,
          fullEntry.entityId,
          fullEntry.operation,
          fullEntry.status,
          fullEntry.updatedAt,
          fullEntry.attempts,
          fullEntry.lastError || null
        ]
      );

      return fullEntry;
    } catch (error) {
      console.error('Failed to enqueue sync entry:', error);
      throw error;
    }
  }

  async getPendingSyncEntries(): Promise<SyncQueueEntry[]> {
    try {
      const db = this.ensureDb();
      const rows = await db.getAllAsync<any>(
        "SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY updatedAt ASC"
      );
      return rows.map((row: any) => this.mapRowToSyncQueueEntry(row));
    } catch (error) {
      console.error('Failed to get pending sync entries:', error);
      throw error;
    }
  }

  async updateSyncEntryStatus(id: EntityId, status: SyncStatus, lastError?: string): Promise<void> {
    try {
      const db = this.ensureDb();
      await db.runAsync(
        'UPDATE sync_queue SET status = ?, lastError = ?, attempts = attempts + 1 WHERE id = ?',
        [status, lastError || null, id]
      );
    } catch (error) {
      console.error('Failed to update sync entry status:', error);
      throw error;
    }
  }

  async deleteSyncEntry(id: EntityId): Promise<void> {
    try {
      const db = this.ensureDb();
      await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
    } catch (error) {
      console.error('Failed to delete sync entry:', error);
      throw error;
    }
  }

  private mapRowToSyncQueueEntry(row: any): SyncQueueEntry {
    return {
      id: row.id,
      entityType: row.entityType,
      entityId: row.entityId,
      operation: row.operation,
      status: row.status,
      updatedAt: row.updatedAt,
      attempts: row.attempts,
      lastError: row.lastError || undefined
    };
  }
}

export const databaseService = new DatabaseService();
