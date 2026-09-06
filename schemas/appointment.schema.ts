import { z } from "zod"

export const APPOINTMENT_STATUSES = [
  "PLANNED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "ABSENT",
] as const

export const appointmentSchema = z
  .object({
    patient_id: z.string().min(1, "Le patient est obligatoire"),
    doctor_id: z.string().min(1, "Le médecin est obligatoire"),
    start_at: z.string().min(1, "La date de début est obligatoire"),
    end_at: z.string().min(1, "La date de fin est obligatoire"),
    reason: z.string().optional(),
    status: z.enum(APPOINTMENT_STATUSES),
    notes: z.string().optional(),
  })
  .refine((values) => new Date(values.end_at) > new Date(values.start_at), {
    message: "L'heure de fin doit être après l'heure de début",
    path: ["end_at"],
  })

export type AppointmentInput = z.infer<typeof appointmentSchema>

export function toAppointmentRecord(values: AppointmentInput) {
  return {
    patient_id: values.patient_id,
    doctor_id: values.doctor_id,
    start_at: new Date(values.start_at).toISOString(),
    end_at: new Date(values.end_at).toISOString(),
    reason: values.reason || null,
    status: values.status,
    notes: values.notes || null,
  }
}
