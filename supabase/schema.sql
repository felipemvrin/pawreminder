-- PawReminder cloud sync schema
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query) after creating the project.
-- Mirrors src/types/domain.ts. Uses Supabase Auth (auth.users) as the source of truth for ownership.
--
-- NOT synced by design (device-local concepts, kept only in SQLite):
--   - Treatment.notificationIdDueDate / notificationIdReminder: Expo notification IDs are tied to
--     the OS notification scheduler of a single device and are meaningless on another device.
--   - Pet.photoUri: currently a local file:// URI. Syncing real photos requires Supabase Storage
--     (upload + public/signed URL) - out of scope until that's implemented separately.

create extension if not exists "pgcrypto";

-- Reusable trigger to keep updated_at current on every UPDATE.
-- search_path is pinned to '' to avoid search_path hijacking (Supabase security linter).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  species text not null check (species in ('dog', 'cat')),
  breed text,
  birth_date date,
  weight_kg numeric not null,
  lives_outdoors boolean not null default false,
  photo_uri text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.treatments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  type text not null check (type in ('internal', 'external', 'vaccine', 'other')),
  product_name text,
  frequency_days integer not null,
  last_applied_date date not null,
  next_due_date date not null,
  reminder_days_before integer not null default 2,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.treatment_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  treatment_id uuid not null references public.treatments(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  applied_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists pets_owner_id_idx on public.pets(owner_id);
create index if not exists treatments_owner_id_idx on public.treatments(owner_id);
create index if not exists treatments_pet_id_idx on public.treatments(pet_id);
create index if not exists treatment_logs_owner_id_idx on public.treatment_logs(owner_id);
create index if not exists treatment_logs_treatment_id_idx on public.treatment_logs(treatment_id);

drop trigger if exists set_pets_updated_at on public.pets;
create trigger set_pets_updated_at
  before update on public.pets
  for each row execute function public.set_updated_at();

drop trigger if exists set_treatments_updated_at on public.treatments;
create trigger set_treatments_updated_at
  before update on public.treatments
  for each row execute function public.set_updated_at();

drop trigger if exists set_treatment_logs_updated_at on public.treatment_logs;
create trigger set_treatment_logs_updated_at
  before update on public.treatment_logs
  for each row execute function public.set_updated_at();

-- Row Level Security: every user can only ever see/modify their own rows.
alter table public.pets enable row level security;
alter table public.treatments enable row level security;
alter table public.treatment_logs enable row level security;

drop policy if exists "pets_owner_select" on public.pets;
create policy "pets_owner_select" on public.pets
  for select using (auth.uid() = owner_id);

drop policy if exists "pets_owner_insert" on public.pets;
create policy "pets_owner_insert" on public.pets
  for insert with check (auth.uid() = owner_id);

drop policy if exists "pets_owner_update" on public.pets;
create policy "pets_owner_update" on public.pets
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "pets_owner_delete" on public.pets;
create policy "pets_owner_delete" on public.pets
  for delete using (auth.uid() = owner_id);

drop policy if exists "treatments_owner_select" on public.treatments;
create policy "treatments_owner_select" on public.treatments
  for select using (auth.uid() = owner_id);

drop policy if exists "treatments_owner_insert" on public.treatments;
create policy "treatments_owner_insert" on public.treatments
  for insert with check (auth.uid() = owner_id);

drop policy if exists "treatments_owner_update" on public.treatments;
create policy "treatments_owner_update" on public.treatments
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "treatments_owner_delete" on public.treatments;
create policy "treatments_owner_delete" on public.treatments
  for delete using (auth.uid() = owner_id);

drop policy if exists "treatment_logs_owner_select" on public.treatment_logs;
create policy "treatment_logs_owner_select" on public.treatment_logs
  for select using (auth.uid() = owner_id);

drop policy if exists "treatment_logs_owner_insert" on public.treatment_logs;
create policy "treatment_logs_owner_insert" on public.treatment_logs
  for insert with check (auth.uid() = owner_id);

drop policy if exists "treatment_logs_owner_update" on public.treatment_logs;
create policy "treatment_logs_owner_update" on public.treatment_logs
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "treatment_logs_owner_delete" on public.treatment_logs;
create policy "treatment_logs_owner_delete" on public.treatment_logs
  for delete using (auth.uid() = owner_id);
