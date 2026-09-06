import { z } from "zod"

export const diseaseSchema = z.object({
  name: z.string().min(1, "Le nom est obligatoire"),
  code: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
})

export type DiseaseInput = z.infer<typeof diseaseSchema>

/** Convertit les valeurs du formulaire (chaînes) vers le format attendu par Supabase (null pour les champs vides). */
export function toDiseaseRecord(values: DiseaseInput) {
  return {
    name: values.name,
    code: values.code || null,
    category: values.category || null,
    description: values.description || null,
  }
}
