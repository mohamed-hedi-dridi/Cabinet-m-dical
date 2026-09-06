import { z } from "zod"

export const patientDiseaseSchema = z.object({
  disease_id: z.string().min(1, "La maladie est obligatoire"),
  diagnosed_at: z.string().optional(),
  status: z.enum(["ACTIVE", "RESOLVED", "CHRONIC"]),
  notes: z.string().optional(),
})

export type PatientDiseaseInput = z.infer<typeof patientDiseaseSchema>

export function toPatientDiseaseRecord(values: PatientDiseaseInput) {
  return {
    disease_id: values.disease_id,
    diagnosed_at: values.diagnosed_at || null,
    status: values.status,
    notes: values.notes || null,
  }
}
