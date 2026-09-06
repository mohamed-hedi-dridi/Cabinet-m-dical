"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import {
  patientDiseaseSchema,
  toPatientDiseaseRecord,
  type PatientDiseaseInput,
} from "@/schemas/patient-disease.schema"

export interface PatientDiseaseActionState {
  error?: string
  success?: boolean
}

export async function addPatientDisease(
  patientId: string,
  values: PatientDiseaseInput
): Promise<PatientDiseaseActionState> {
  const parsed = patientDiseaseSchema.safeParse(values)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("patient_diseases").insert({
    patient_id: patientId,
    ...toPatientDiseaseRecord(parsed.data),
  })

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Cette maladie est déjà associée à ce patient"
          : "Impossible d'ajouter la maladie",
    }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function updatePatientDisease(
  id: string,
  patientId: string,
  values: PatientDiseaseInput
): Promise<PatientDiseaseActionState> {
  const parsed = patientDiseaseSchema.safeParse(values)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("patient_diseases")
    .update(toPatientDiseaseRecord(parsed.data))
    .eq("id", id)

  if (error) {
    return { error: "Impossible de modifier la maladie" }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function removePatientDisease(
  id: string,
  patientId: string
): Promise<PatientDiseaseActionState> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("patient_diseases")
    .delete()
    .eq("id", id)

  if (error) {
    return { error: "Impossible de retirer la maladie" }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}
