import type { Pet, Treatment, TreatmentLog } from '@/types/domain';

// Snake_case rows as defined in supabase/schema.sql. notificationId* fields are
// intentionally absent: they're Expo notification IDs tied to a single device.

export interface RemotePetRow {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed: string | null;
  birth_date: string | null;
  weight_kg: number;
  lives_outdoors: boolean;
  photo_uri: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface RemoteTreatmentRow {
  id: string;
  owner_id: string;
  pet_id: string;
  type: string;
  product_name: string | null;
  frequency_days: number;
  last_applied_date: string;
  next_due_date: string;
  reminder_days_before: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface RemoteTreatmentLogRow {
  id: string;
  owner_id: string;
  treatment_id: string;
  pet_id: string;
  applied_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function toRemotePet(pet: Pet, ownerId: string): RemotePetRow {
  return {
    id: pet.id,
    owner_id: ownerId,
    name: pet.name,
    species: pet.species,
    breed: pet.breed ?? null,
    birth_date: pet.birthDate ?? null,
    weight_kg: pet.weightKg,
    lives_outdoors: pet.livesOutdoors,
    photo_uri: pet.photoUri ?? null,
    created_at: pet.createdAt,
    updated_at: pet.updatedAt ?? pet.createdAt,
    deleted_at: pet.deletedAt ?? null
  };
}

export function fromRemotePet(row: RemotePetRow): Pet {
  return {
    id: row.id,
    name: row.name,
    species: row.species as Pet['species'],
    breed: row.breed ?? undefined,
    birthDate: row.birth_date ?? undefined,
    weightKg: row.weight_kg,
    livesOutdoors: row.lives_outdoors,
    photoUri: row.photo_uri ?? undefined,
    createdAt: row.created_at,
    ownerId: row.owner_id,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? undefined
  };
}

export function toRemoteTreatment(treatment: Treatment, ownerId: string): RemoteTreatmentRow {
  return {
    id: treatment.id,
    owner_id: ownerId,
    pet_id: treatment.petId,
    type: treatment.type,
    product_name: treatment.productName ?? null,
    frequency_days: treatment.frequencyDays,
    last_applied_date: treatment.lastAppliedDate,
    next_due_date: treatment.nextDueDate,
    reminder_days_before: treatment.reminderDaysBefore,
    active: treatment.active,
    created_at: treatment.createdAt,
    updated_at: treatment.updatedAt ?? treatment.createdAt,
    deleted_at: treatment.deletedAt ?? null
  };
}

export function fromRemoteTreatment(row: RemoteTreatmentRow): Treatment {
  return {
    id: row.id,
    petId: row.pet_id,
    type: row.type as Treatment['type'],
    productName: row.product_name ?? undefined,
    frequencyDays: row.frequency_days,
    lastAppliedDate: row.last_applied_date,
    nextDueDate: row.next_due_date,
    reminderDaysBefore: row.reminder_days_before,
    active: row.active,
    createdAt: row.created_at,
    ownerId: row.owner_id,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? undefined
  };
}

export function toRemoteTreatmentLog(log: TreatmentLog, ownerId: string): RemoteTreatmentLogRow {
  return {
    id: log.id,
    owner_id: ownerId,
    treatment_id: log.treatmentId,
    pet_id: log.petId,
    applied_date: log.appliedDate,
    notes: log.notes ?? null,
    created_at: log.createdAt,
    updated_at: log.updatedAt ?? log.createdAt,
    deleted_at: log.deletedAt ?? null
  };
}

export function fromRemoteTreatmentLog(row: RemoteTreatmentLogRow): TreatmentLog {
  return {
    id: row.id,
    treatmentId: row.treatment_id,
    petId: row.pet_id,
    appliedDate: row.applied_date,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    ownerId: row.owner_id,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at ?? undefined
  };
}
