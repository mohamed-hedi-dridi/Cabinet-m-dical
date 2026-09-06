import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Disease, PatientDisease } from "@/types"

export type PatientDiseaseWithDisease = PatientDisease & {
  disease: Disease
}

export async function listPatientDiseases(
  patientId: string
): Promise<PatientDiseaseWithDisease[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("patient_diseases")
    .select("*, disease:diseases(*)")
    .eq("patient_id", patientId)
    .order("diagnosed_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as PatientDiseaseWithDisease[]
}
