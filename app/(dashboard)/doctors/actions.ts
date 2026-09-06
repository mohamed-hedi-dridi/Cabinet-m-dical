"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import {
  doctorSchema,
  toDoctorRecord,
  type DoctorInput,
} from "@/schemas/doctor.schema"

export interface DoctorActionState {
  error?: string
  success?: boolean
}

export async function createDoctor(
  values: DoctorInput
): Promise<DoctorActionState> {
  const parsed = doctorSchema.safeParse(values)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("doctors")
    .insert(toDoctorRecord(parsed.data))

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Ce profil est déjà associé à un médecin"
          : "Impossible de créer le médecin",
    }
  }

  revalidatePath("/doctors")
  return { success: true }
}

export async function updateDoctor(
  id: string,
  values: DoctorInput
): Promise<DoctorActionState> {
  const parsed = doctorSchema.safeParse(values)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("doctors")
    .update(toDoctorRecord(parsed.data))
    .eq("id", id)

  if (error) {
    return { error: "Impossible de modifier le médecin" }
  }

  revalidatePath("/doctors")
  return { success: true }
}

export async function deleteDoctor(id: string): Promise<DoctorActionState> {
  const supabase = await createClient()
  const { error } = await supabase.from("doctors").delete().eq("id", id)

  if (error) {
    return {
      error:
        error.code === "23503"
          ? "Impossible de supprimer ce médecin : il est associé à des rendez-vous ou consultations"
          : "Impossible de supprimer le médecin",
    }
  }

  revalidatePath("/doctors")
  return { success: true }
}
