"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import {
  diseaseSchema,
  toDiseaseRecord,
  type DiseaseInput,
} from "@/schemas/disease.schema"

export interface DiseaseActionState {
  error?: string
  success?: boolean
}

export async function createDisease(
  values: DiseaseInput
): Promise<DiseaseActionState> {
  const parsed = diseaseSchema.safeParse(values)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("diseases")
    .insert(toDiseaseRecord(parsed.data))

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Cette maladie existe déjà"
          : "Impossible de créer la maladie",
    }
  }

  revalidatePath("/diseases")
  return { success: true }
}

export async function updateDisease(
  id: string,
  values: DiseaseInput
): Promise<DiseaseActionState> {
  const parsed = diseaseSchema.safeParse(values)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("diseases")
    .update(toDiseaseRecord(parsed.data))
    .eq("id", id)

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Cette maladie existe déjà"
          : "Impossible de modifier la maladie",
    }
  }

  revalidatePath("/diseases")
  return { success: true }
}

export async function deleteDisease(id: string): Promise<DiseaseActionState> {
  const supabase = await createClient()
  const { error } = await supabase.from("diseases").delete().eq("id", id)

  if (error) {
    return { error: "Impossible de supprimer la maladie" }
  }

  revalidatePath("/diseases")
  return { success: true }
}
