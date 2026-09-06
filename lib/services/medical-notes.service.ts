import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Doctor, MedicalNote, Profile } from "@/types"

export type MedicalNoteWithRelations = MedicalNote & {
  doctor: Doctor & { profile: Profile }
}

const SELECT_WITH_RELATIONS = "*, doctor:doctors(*, profile:profiles(*))"

export async function listMedicalNotesForPatient(
  patientId: string
): Promise<MedicalNoteWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("medical_notes")
    .select(SELECT_WITH_RELATIONS)
    .eq("patient_id", patientId)
    .order("note_date", { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as MedicalNoteWithRelations[]
}

export async function listRecentMedicalNotes(
  limit = 5
): Promise<(MedicalNoteWithRelations & { patient_id: string })[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("medical_notes")
    .select(SELECT_WITH_RELATIONS)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as unknown as (MedicalNoteWithRelations & {
    patient_id: string
  })[]
}
