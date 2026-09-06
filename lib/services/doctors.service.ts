import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Doctor, Profile } from "@/types"

export type DoctorWithProfile = Doctor & {
  profile: Profile
}

export async function listDoctors(): Promise<DoctorWithProfile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("doctors")
    .select("*, profile:profiles(*)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as DoctorWithProfile[]
}

export async function getDoctorById(
  id: string
): Promise<DoctorWithProfile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("doctors")
    .select("*, profile:profiles(*)")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data as unknown as DoctorWithProfile | null
}

/** Profils ayant le rôle DOCTOR et ne disposant pas encore d'une fiche médecin. */
export async function listAvailableDoctorProfiles(
  excludeProfileId?: string
): Promise<Profile[]> {
  const supabase = await createClient()

  const [{ data: profiles, error: profilesError }, { data: doctors, error: doctorsError }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("role", "DOCTOR").order("full_name"),
      supabase.from("doctors").select("profile_id"),
    ])

  if (profilesError) throw profilesError
  if (doctorsError) throw doctorsError

  const takenProfileIds = new Set(
    (doctors ?? [])
      .map((doctor) => doctor.profile_id)
      .filter((profileId) => profileId !== excludeProfileId)
  )

  return (profiles ?? []).filter((profile) => !takenProfileIds.has(profile.id))
}
