export type EntityId = string;
export type ISODateString = string;
export type Species = 'dog' | 'cat';
export type TreatmentType = 'internal' | 'external' | 'vaccine' | 'other';

// Antiparasitic treatment reminder model
export interface Pet {
  id: EntityId;
  name: string;
  species: Species;
  breed?: string;
  birthDate?: ISODateString;
  weightKg: number;
  livesOutdoors: boolean;
  photoUri?: string;
  createdAt: ISODateString;
  // Sync fields (optional until the sync migration lands): populated once cloud sync is wired up
  ownerId?: EntityId;
  updatedAt?: ISODateString;
  deletedAt?: ISODateString;
}

export interface Treatment {
  id: EntityId;
  petId: EntityId;
  type: TreatmentType;
  productName?: string;
  frequencyDays: number;
  lastAppliedDate: ISODateString;
  nextDueDate: ISODateString;
  reminderDaysBefore: number; // default 2
  notificationIdDueDate?: string;
  notificationIdReminder?: string;
  active: boolean;
  createdAt: ISODateString;
  ownerId?: EntityId;
  updatedAt?: ISODateString;
  deletedAt?: ISODateString;
}

export interface TreatmentLog {
  id: EntityId;
  treatmentId: EntityId;
  petId: EntityId;
  appliedDate: ISODateString;
  notes?: string;
  createdAt: ISODateString;
  ownerId?: EntityId;
  updatedAt?: ISODateString;
  deletedAt?: ISODateString;
}
