-- ============================================================================
-- Cabinet Médical MVP — Row Level Security
-- ============================================================================
-- Principe : RLS activé sur toutes les tables, aucun accès par défaut.
-- Un helper `auth_role()` lit le rôle de l'utilisateur connecté depuis
-- `profiles` (SECURITY DEFINER pour éviter la récursion RLS sur profiles).
-- ============================================================================

create or replace function public.auth_role()
returns user_role
language sql
security definer
stable
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
    and is_active = true;
$$;

create or replace function public.is_admin()
returns boolean language sql stable as $$ select public.auth_role() = 'ADMIN'; $$;

create or replace function public.is_doctor()
returns boolean language sql stable as $$ select public.auth_role() = 'DOCTOR'; $$;

create or replace function public.is_secretary()
returns boolean language sql stable as $$ select public.auth_role() = 'SECRETARY'; $$;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_admin_insert"
  on public.profiles for insert
  with check (public.is_admin());

create policy "profiles_admin_update"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "profiles_admin_delete"
  on public.profiles for delete
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- doctors — annuaire lisible par tout utilisateur authentifié actif,
-- gestion réservée à l'admin.
-- ----------------------------------------------------------------------------

alter table public.doctors enable row level security;

create policy "doctors_select_authenticated"
  on public.doctors for select
  using (public.auth_role() is not null);

create policy "doctors_admin_write"
  on public.doctors for insert
  with check (public.is_admin());

create policy "doctors_admin_update"
  on public.doctors for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "doctors_admin_delete"
  on public.doctors for delete
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- patients — ADMIN, DOCTOR, SECRETARY
-- ----------------------------------------------------------------------------

alter table public.patients enable row level security;

create policy "patients_select"
  on public.patients for select
  using (public.auth_role() is not null);

create policy "patients_insert"
  on public.patients for insert
  with check (public.auth_role() is not null);

create policy "patients_update"
  on public.patients for update
  using (public.auth_role() is not null)
  with check (public.auth_role() is not null);

create policy "patients_delete"
  on public.patients for delete
  using (public.is_admin() or public.is_doctor());

-- ----------------------------------------------------------------------------
-- diseases — référentiel : ADMIN + DOCTOR uniquement
-- ----------------------------------------------------------------------------

alter table public.diseases enable row level security;

create policy "diseases_select"
  on public.diseases for select
  using (public.is_admin() or public.is_doctor());

create policy "diseases_write"
  on public.diseases for insert
  with check (public.is_admin() or public.is_doctor());

create policy "diseases_update"
  on public.diseases for update
  using (public.is_admin() or public.is_doctor())
  with check (public.is_admin() or public.is_doctor());

create policy "diseases_delete"
  on public.diseases for delete
  using (public.is_admin() or public.is_doctor());

-- ----------------------------------------------------------------------------
-- patient_diseases — ADMIN + DOCTOR uniquement
-- ----------------------------------------------------------------------------

alter table public.patient_diseases enable row level security;

create policy "patient_diseases_select"
  on public.patient_diseases for select
  using (public.is_admin() or public.is_doctor());

create policy "patient_diseases_write"
  on public.patient_diseases for insert
  with check (public.is_admin() or public.is_doctor());

create policy "patient_diseases_update"
  on public.patient_diseases for update
  using (public.is_admin() or public.is_doctor())
  with check (public.is_admin() or public.is_doctor());

create policy "patient_diseases_delete"
  on public.patient_diseases for delete
  using (public.is_admin() or public.is_doctor());

-- ----------------------------------------------------------------------------
-- appointments — ADMIN, DOCTOR, SECRETARY
-- ----------------------------------------------------------------------------

alter table public.appointments enable row level security;

create policy "appointments_select"
  on public.appointments for select
  using (public.auth_role() is not null);

create policy "appointments_insert"
  on public.appointments for insert
  with check (public.auth_role() is not null);

create policy "appointments_update"
  on public.appointments for update
  using (public.auth_role() is not null)
  with check (public.auth_role() is not null);

create policy "appointments_delete"
  on public.appointments for delete
  using (public.is_admin() or public.is_doctor() or public.is_secretary());

-- ----------------------------------------------------------------------------
-- consultations — ADMIN + DOCTOR uniquement (la secrétaire n'y a pas accès)
-- ----------------------------------------------------------------------------

alter table public.consultations enable row level security;

create policy "consultations_select"
  on public.consultations for select
  using (public.is_admin() or public.is_doctor());

create policy "consultations_write"
  on public.consultations for insert
  with check (public.is_admin() or public.is_doctor());

create policy "consultations_update"
  on public.consultations for update
  using (public.is_admin() or public.is_doctor())
  with check (public.is_admin() or public.is_doctor());

create policy "consultations_delete"
  on public.consultations for delete
  using (public.is_admin() or public.is_doctor());

-- ----------------------------------------------------------------------------
-- medical_reports — ADMIN + DOCTOR uniquement
-- ----------------------------------------------------------------------------

alter table public.medical_reports enable row level security;

create policy "medical_reports_select"
  on public.medical_reports for select
  using (public.is_admin() or public.is_doctor());

create policy "medical_reports_write"
  on public.medical_reports for insert
  with check (public.is_admin() or public.is_doctor());

create policy "medical_reports_update"
  on public.medical_reports for update
  using (public.is_admin() or public.is_doctor())
  with check (public.is_admin() or public.is_doctor());

create policy "medical_reports_delete"
  on public.medical_reports for delete
  using (public.is_admin() or public.is_doctor());

-- ----------------------------------------------------------------------------
-- medical_notes — ADMIN + DOCTOR uniquement (notes médicales confidentielles)
-- ----------------------------------------------------------------------------

alter table public.medical_notes enable row level security;

create policy "medical_notes_select"
  on public.medical_notes for select
  using (public.is_admin() or public.is_doctor());

create policy "medical_notes_write"
  on public.medical_notes for insert
  with check (public.is_admin() or public.is_doctor());

create policy "medical_notes_update"
  on public.medical_notes for update
  using (public.is_admin() or public.is_doctor())
  with check (public.is_admin() or public.is_doctor());

create policy "medical_notes_delete"
  on public.medical_notes for delete
  using (public.is_admin() or public.is_doctor());
