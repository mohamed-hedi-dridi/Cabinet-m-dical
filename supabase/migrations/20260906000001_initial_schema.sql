-- ============================================================================
-- Cabinet Médical MVP — Schéma initial
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------

create type user_role as enum ('ADMIN', 'DOCTOR', 'SECRETARY');
create type gender as enum ('M', 'F');
create type blood_group as enum ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
create type disease_status as enum ('ACTIVE', 'RESOLVED', 'CHRONIC');
create type appointment_status as enum ('PLANNED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'ABSENT');

-- ----------------------------------------------------------------------------
-- Fonction utilitaire : mise à jour automatique de updated_at
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles — étend auth.users avec le rôle applicatif
-- ----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  role user_role not null default 'SECRETARY',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Création automatique du profil à l'inscription d'un utilisateur Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'SECRETARY')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- doctors
-- ----------------------------------------------------------------------------

create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  speciality text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index doctors_profile_id_idx on public.doctors (profile_id);

create trigger set_doctors_updated_at
  before update on public.doctors
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- patients
-- ----------------------------------------------------------------------------

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  gender gender,
  birth_date date,
  weight_kg numeric(5, 2) check (weight_kg is null or weight_kg > 0),
  height_cm numeric(5, 2) check (height_cm is null or height_cm > 0),
  blood_group blood_group,
  phone text,
  email text,
  address text,
  allergies text,
  medical_history text,
  chronic_diseases text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index patients_last_name_idx on public.patients (last_name);
create index patients_first_name_idx on public.patients (first_name);
create index patients_phone_idx on public.patients (phone);

create trigger set_patients_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- diseases — référentiel médical
-- ----------------------------------------------------------------------------

create table public.diseases (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text,
  description text,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index diseases_category_idx on public.diseases (category);

create trigger set_diseases_updated_at
  before update on public.diseases
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- patient_diseases — association patient / maladie
-- ----------------------------------------------------------------------------

create table public.patient_diseases (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  disease_id uuid not null references public.diseases (id) on delete restrict,
  diagnosed_at date,
  status disease_status not null default 'ACTIVE',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (patient_id, disease_id)
);

create index patient_diseases_patient_id_idx on public.patient_diseases (patient_id);
create index patient_diseases_disease_id_idx on public.patient_diseases (disease_id);
create index patient_diseases_status_idx on public.patient_diseases (status);

create trigger set_patient_diseases_updated_at
  before update on public.patient_diseases
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- appointments
-- ----------------------------------------------------------------------------

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  doctor_id uuid not null references public.doctors (id) on delete restrict,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text,
  status appointment_status not null default 'PLANNED',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_end_after_start check (end_at > start_at)
);

create index appointments_patient_id_idx on public.appointments (patient_id);
create index appointments_doctor_id_idx on public.appointments (doctor_id);
create index appointments_start_at_idx on public.appointments (start_at);
create index appointments_status_idx on public.appointments (status);

create trigger set_appointments_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- consultations
-- ----------------------------------------------------------------------------

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments (id) on delete set null,
  patient_id uuid not null references public.patients (id) on delete cascade,
  doctor_id uuid not null references public.doctors (id) on delete restrict,
  consultation_date timestamptz not null default now(),
  reason text,
  symptoms text,
  clinical_examination text,
  diagnosis text,
  treatment text,
  medical_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index consultations_patient_id_idx on public.consultations (patient_id);
create index consultations_doctor_id_idx on public.consultations (doctor_id);
create index consultations_appointment_id_idx on public.consultations (appointment_id);
create index consultations_date_idx on public.consultations (consultation_date);

create trigger set_consultations_updated_at
  before update on public.consultations
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- medical_reports — bilans médicaux
-- ----------------------------------------------------------------------------

create table public.medical_reports (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  consultation_id uuid references public.consultations (id) on delete set null,
  doctor_id uuid references public.doctors (id) on delete set null,
  title text not null,
  report_type text,
  description text,
  report_date date not null default current_date,
  file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index medical_reports_patient_id_idx on public.medical_reports (patient_id);
create index medical_reports_consultation_id_idx on public.medical_reports (consultation_id);
create index medical_reports_type_idx on public.medical_reports (report_type);
create index medical_reports_date_idx on public.medical_reports (report_date);

create trigger set_medical_reports_updated_at
  before update on public.medical_reports
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- medical_notes — notes des médecins
-- ----------------------------------------------------------------------------

create table public.medical_notes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  doctor_id uuid not null references public.doctors (id) on delete set null,
  consultation_id uuid references public.consultations (id) on delete set null,
  title text,
  content text not null,
  note_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index medical_notes_patient_id_idx on public.medical_notes (patient_id);
create index medical_notes_doctor_id_idx on public.medical_notes (doctor_id);
create index medical_notes_consultation_id_idx on public.medical_notes (consultation_id);

create trigger set_medical_notes_updated_at
  before update on public.medical_notes
  for each row execute function public.set_updated_at();
