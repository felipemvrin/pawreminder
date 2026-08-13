export type EntityId = string;
export type ISODateString = string;

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

export interface Reminder {
  id: EntityId;
  dogId: EntityId;
  kind: ReminderKind;
  title: string;
  scheduledAt: ISODateString;
  status: ReminderStatus;
  notes?: string;
}
