"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import {
  consultationSchema,
  toConsultationRecord,
  type ConsultationInput,
} from "@/schemas/consultation.schema"

export interface ConsultationActionState {
  error?: string
}

export async function createConsultation(
  values: ConsultationInput
): Promise<ConsultationActionState> {
  const parsed = consultationSchema.safeParse(values)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("consultations")
    .insert(toConsultationRecord(parsed.data))
    .select("id")
    .single()

  if (error) {
    return { error: "Impossible de créer la consultation" }
  }

  revalidatePath("/consultations")
  revalidatePath(`/patients/${parsed.data.patient_id}`)
  revalidatePath("/dashboard")
  redirect(`/consultations/${data.id}`)
}

export async function updateConsultation(
  id: string,
  values: ConsultationInput
): Promise<ConsultationActionState> {
  const parsed = consultationSchema.safeParse(values)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("consultations")
    .update(toConsultationRecord(parsed.data))
    .eq("id", id)

  if (error) {
    return { error: "Impossible de modifier la consultation" }
  }

  revalidatePath("/consultations")
  revalidatePath(`/consultations/${id}`)
  revalidatePath(`/patients/${parsed.data.patient_id}`)
  redirect(`/consultations/${id}`)
}

export async function deleteConsultation(
  id: string
): Promise<ConsultationActionState> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("consultations")
    .delete()
    .eq("id", id)
    .select("patient_id")
    .single()

  if (error) {
    return { error: "Impossible de supprimer la consultation" }
  }

  revalidatePath("/consultations")
  if (data?.patient_id) {
    revalidatePath(`/patients/${data.patient_id}`)
  }
  revalidatePath("/dashboard")
  return {}
}
