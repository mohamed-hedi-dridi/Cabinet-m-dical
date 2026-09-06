import { z } from "zod"

export const medicalNoteSchema = z.object({
  doctor_id: z.string().min(1, "Le médecin est obligatoire"),
  consultation_id: z.string().optional(),
  title: z.string().optional(),
  content: z.string().min(1, "Le contenu est obligatoire"),
  note_date: z.string().min(1, "La date est obligatoire"),
})

export type MedicalNoteInput = z.infer<typeof medicalNoteSchema>

export function toMedicalNoteRecord(values: MedicalNoteInput) {
  return {
    doctor_id: values.doctor_id,
    consultation_id: values.consultation_id || null,
    title: values.title || null,
    content: values.content,
    note_date: new Date(values.note_date).toISOString(),
  }
}
