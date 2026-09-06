"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import {
  medicalReportSchema,
  toMedicalReportRecord,
  type MedicalReportInput,
} from "@/schemas/medical-report.schema"

export interface MedicalReportActionState {
  error?: string
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_")
}

export async function createMedicalReport(
  values: MedicalReportInput,
  file: File | null
): Promise<MedicalReportActionState> {
  const parsed = medicalReportSchema.safeParse(values)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }
  if (!file || file.size === 0) {
    return { error: "Le document est obligatoire" }
  }

  const supabase = await createClient()

  const filePath = `${parsed.data.patient_id}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`
  const { error: uploadError } = await supabase.storage
    .from("medical-reports")
    .upload(filePath, file)

  if (uploadError) {
    return { error: "Impossible d'envoyer le document" }
  }

  const { data, error } = await supabase
    .from("medical_reports")
    .insert(toMedicalReportRecord(parsed.data, filePath))
    .select("id")
    .single()

  if (error) {
    await supabase.storage.from("medical-reports").remove([filePath])
    return { error: "Impossible de créer le bilan médical" }
  }

  revalidatePath("/medical-reports")
  revalidatePath(`/patients/${parsed.data.patient_id}`)
  revalidatePath("/dashboard")
  redirect(`/medical-reports/${data.id}`)
}

export async function updateMedicalReport(
  id: string,
  currentFilePath: string | null,
  values: MedicalReportInput,
  file: File | null
): Promise<MedicalReportActionState> {
  const parsed = medicalReportSchema.safeParse(values)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()

  let filePath = currentFilePath
  if (file && file.size > 0) {
    filePath = `${parsed.data.patient_id}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`
    const { error: uploadError } = await supabase.storage
      .from("medical-reports")
      .upload(filePath, file)

    if (uploadError) {
      return { error: "Impossible d'envoyer le document" }
    }
  }

  const { error } = await supabase
    .from("medical_reports")
    .update(toMedicalReportRecord(parsed.data, filePath))
    .eq("id", id)

  if (error) {
    return { error: "Impossible de modifier le bilan médical" }
  }

  if (file && file.size > 0 && currentFilePath) {
    await supabase.storage.from("medical-reports").remove([currentFilePath])
  }

  revalidatePath("/medical-reports")
  revalidatePath(`/medical-reports/${id}`)
  revalidatePath(`/patients/${parsed.data.patient_id}`)
  redirect(`/medical-reports/${id}`)
}

export async function deleteMedicalReport(
  id: string
): Promise<MedicalReportActionState> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("medical_reports")
    .delete()
    .eq("id", id)
    .select("patient_id, file_path")
    .single()

  if (error) {
    return { error: "Impossible de supprimer le bilan médical" }
  }

  if (data?.file_path) {
    await supabase.storage.from("medical-reports").remove([data.file_path])
  }

  revalidatePath("/medical-reports")
  if (data?.patient_id) {
    revalidatePath(`/patients/${data.patient_id}`)
  }
  revalidatePath("/dashboard")
  return {}
}
