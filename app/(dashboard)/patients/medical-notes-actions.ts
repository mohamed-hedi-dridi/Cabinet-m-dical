"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import {
  medicalNoteSchema,
  toMedicalNoteRecord,
  type MedicalNoteInput,
} from "@/schemas/medical-note.schema"

export interface MedicalNoteActionState {
  error?: string
  success?: boolean
}

export async function addMedicalNote(
  patientId: string,
  values: MedicalNoteInput
): Promise<MedicalNoteActionState> {
  const parsed = medicalNoteSchema.safeParse(values)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("medical_notes").insert({
    patient_id: patientId,
    ...toMedicalNoteRecord(parsed.data),
  })

  if (error) {
    return { error: "Impossible d'ajouter la note" }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function updateMedicalNote(
  id: string,
  patientId: string,
  values: MedicalNoteInput
): Promise<MedicalNoteActionState> {
  const parsed = medicalNoteSchema.safeParse(values)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("medical_notes")
    .update(toMedicalNoteRecord(parsed.data))
    .eq("id", id)

  if (error) {
    return { error: "Impossible de modifier la note" }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}

export async function deleteMedicalNote(
  id: string,
  patientId: string
): Promise<MedicalNoteActionState> {
  const supabase = await createClient()
  const { error } = await supabase.from("medical_notes").delete().eq("id", id)

  if (error) {
    return { error: "Impossible de supprimer la note" }
  }

  revalidatePath(`/patients/${patientId}`)
  return { success: true }
}
