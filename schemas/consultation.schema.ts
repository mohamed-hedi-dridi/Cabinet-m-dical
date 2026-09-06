import { z } from "zod"

export const consultationSchema = z.object({
  patient_id: z.string().min(1, "Le patient est obligatoire"),
  doctor_id: z.string().min(1, "Le médecin est obligatoire"),
  appointment_id: z.string().optional(),
  consultation_date: z.string().min(1, "La date est obligatoire"),
  reason: z.string().optional(),
  symptoms: z.string().optional(),
  clinical_examination: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  medical_notes: z.string().optional(),
})

export type ConsultationInput = z.infer<typeof consultationSchema>

export function toConsultationRecord(values: ConsultationInput) {
  return {
    patient_id: values.patient_id,
    doctor_id: values.doctor_id,
    appointment_id: values.appointment_id || null,
    consultation_date: new Date(values.consultation_date).toISOString(),
    reason: values.reason || null,
    symptoms: values.symptoms || null,
    clinical_examination: values.clinical_examination || null,
    diagnosis: values.diagnosis || null,
    treatment: values.treatment || null,
    medical_notes: values.medical_notes || null,
  }
}
