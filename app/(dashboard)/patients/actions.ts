"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import {
  patientSchema,
  toPatientRecord,
  type PatientInput,
} from "@/schemas/patient.schema"

export interface PatientActionState {
  error?: string
}

export async function createPatient(
  values: PatientInput
): Promise<PatientActionState> {
  const parsed = patientSchema.safeParse(values)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("patients")
    .insert(toPatientRecord(parsed.data))
    .select("id")
    .single()

  if (error) {
    return { error: "Impossible de créer le patient" }
  }

  revalidatePath("/patients")
  redirect(`/patients/${data.id}`)
}

export async function updatePatient(
  id: string,
  values: PatientInput
): Promise<PatientActionState> {
  const parsed = patientSchema.safeParse(values)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("patients")
    .update(toPatientRecord(parsed.data))
    .eq("id", id)

  if (error) {
    return { error: "Impossible de modifier le patient" }
  }

  revalidatePath("/patients")
  revalidatePath(`/patients/${id}`)
  redirect(`/patients/${id}`)
}

export async function deletePatient(id: string): Promise<PatientActionState> {
  const supabase = await createClient()
  const { error } = await supabase.from("patients").delete().eq("id", id)

  if (error) {
    return { error: "Impossible de supprimer le patient" }
  }

  revalidatePath("/patients")
  redirect("/patients")
}
