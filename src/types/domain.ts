export type EntityId = string;
export type ISODateString = string;
export type Species = 'dog' | 'cat';
export type TreatmentType = 'internal' | 'external';

export interface Breed {
  id: EntityId;
  name: string;
  size?: 'small' | 'medium' | 'large' | 'giant';
}

export interface Dog {
  id: EntityId;
  name: string;
  birthDate?: ISODateString;
  breed?: Breed;
  photoUri?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Vaccination {
  id: EntityId;
  dogId: EntityId;
  name: string;
  appliedAt: ISODateString;
  nextDueAt?: ISODateString;
  notes?: string;
}

export interface Deworming {
  id: EntityId;
  dogId: EntityId;
  productName: string;
  appliedAt: ISODateString;
  nextDueAt?: ISODateString;
  notes?: string;
}

export interface Medication {
  id: EntityId;
  dogId: EntityId;
  name: string;
  dosage?: string;
  startsAt: ISODateString;
  endsAt?: ISODateString;
  notes?: string;
}

export type ReminderKind = 'vaccination' | 'deworming' | 'medication' | 'veterinary-checkup';
export type ReminderStatus = 'pending' | 'completed' | 'dismissed';

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
}

export interface TreatmentLog {
  id: EntityId;
  treatmentId: EntityId;
  petId: EntityId;
  appliedDate: ISODateString;
  notes?: string;
  createdAt: ISODateString;
}

export interface Reminder {
  id: EntityId;
  treatmentId: EntityId;
  petId: EntityId;
  petName: string;
  treatmentType: TreatmentType;
  dueDate: ISODateString;
  reminderKind: 'due-date' | 'reminder';
  notificationId?: string;
}

export interface Reminder {
  id: EntityId;
  dogId: EntityId;
  kind: ReminderKind;
  title: string;
  scheduledAt: ISODateString;
  status: ReminderStatus;
  notes?: string;
}
