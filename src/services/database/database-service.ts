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

const DATABASE_NAME = 'pawreminder.db';

function parseDate(dateString: string): Date {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!dateOnlyMatch) return new Date(dateString);

  const [, year, month, day] = dateOnlyMatch;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

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

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private ensureDb(): SQLite.SQLiteDatabase {
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }

  async createPet(pet: Omit<Pet, 'id' | 'createdAt'>): Promise<Pet> {
    const id = this.generateId();
    const createdAt = new Date().toISOString();

    const fullPet: Pet = { id, createdAt, ...pet };

    try {
      const db = this.ensureDb();
      await db.runAsync(
        `INSERT INTO pets (id, name, species, breed, birthDate, weightKg, livesOutdoors, photoUri, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fullPet.id,
          fullPet.name,
          fullPet.species,
          fullPet.breed || null,
          fullPet.birthDate || null,
          fullPet.weightKg,
          fullPet.livesOutdoors ? 1 : 0,
          fullPet.photoUri || null,
          fullPet.createdAt
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

    const updated = { ...pet, ...updates };

    try {
      const db = this.ensureDb();
      await db.runAsync(
        `UPDATE pets
         SET name = ?, species = ?, breed = ?, birthDate = ?, weightKg = ?, livesOutdoors = ?, photoUri = ?
         WHERE id = ?`,
        [
          updated.name,
          updated.species,
          updated.breed || null,
          updated.birthDate || null,
          updated.weightKg,
          updated.livesOutdoors ? 1 : 0,
          updated.photoUri || null,
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

    const fullTreatment: Treatment = { id, createdAt, ...treatment };

    try {
      const db = this.ensureDb();
      await db.runAsync(
        `INSERT INTO treatments (
          id, petId, type, productName, frequencyDays, lastAppliedDate, nextDueDate,
          reminderDaysBefore, notificationIdDueDate, notificationIdReminder, active, createdAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          fullTreatment.createdAt
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

    const updated = { ...treatment, ...updates };

    try {
      const db = this.ensureDb();
      await db.runAsync(
        `UPDATE treatments
         SET type = ?, productName = ?, frequencyDays = ?, lastAppliedDate = ?, nextDueDate = ?,
             reminderDaysBefore = ?, notificationIdDueDate = ?, notificationIdReminder = ?, active = ?
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

    const fullLog: TreatmentLog = { id, createdAt, ...log };

    try {
      const db = this.ensureDb();
      await db.runAsync(
        `INSERT INTO treatment_logs (id, treatmentId, petId, appliedDate, notes, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          fullLog.id,
          fullLog.treatmentId,
          fullLog.petId,
          fullLog.appliedDate,
          fullLog.notes || null,
          fullLog.createdAt
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
    const date = parseDate(lastAppliedDate);
    date.setDate(date.getDate() + frequencyDays);
    return date.toISOString().split('T')[0];
  }

  private generateId(): EntityId {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
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
      createdAt: row.createdAt
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
      createdAt: row.createdAt
    };
  }

  private mapRowToTreatmentLog(row: any): TreatmentLog {
    return {
      id: row.id,
      treatmentId: row.treatmentId,
      petId: row.petId,
      appliedDate: row.appliedDate,
      notes: row.notes || undefined,
      createdAt: row.createdAt
    };
  }
}

export const databaseService = new DatabaseService();
