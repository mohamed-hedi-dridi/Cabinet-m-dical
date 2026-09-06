-- ============================================================================
-- Cabinet Médical MVP — Storage (documents médicaux)
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('medical-reports', 'medical-reports', false)
on conflict (id) do nothing;

-- Seuls ADMIN et DOCTOR peuvent lire/écrire les documents médicaux
-- (même règle que la table medical_reports qu'ils accompagnent).

create policy "medical_reports_bucket_select"
  on storage.objects for select
  using (
    bucket_id = 'medical-reports'
    and (public.is_admin() or public.is_doctor())
  );

create policy "medical_reports_bucket_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'medical-reports'
    and (public.is_admin() or public.is_doctor())
  );

create policy "medical_reports_bucket_update"
  on storage.objects for update
  using (
    bucket_id = 'medical-reports'
    and (public.is_admin() or public.is_doctor())
  )
  with check (
    bucket_id = 'medical-reports'
    and (public.is_admin() or public.is_doctor())
  );

create policy "medical_reports_bucket_delete"
  on storage.objects for delete
  using (
    bucket_id = 'medical-reports'
    and (public.is_admin() or public.is_doctor())
  );
