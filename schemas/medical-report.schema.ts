import { z } from "zod"

export const medicalReportSchema = z.object({
  patient_id: z.string().min(1, "Le patient est obligatoire"),
  doctor_id: z.string().optional(),
  consultation_id: z.string().optional(),
  title: z.string().min(1, "Le titre est obligatoire"),
  report_type: z.string().optional(),
  description: z.string().optional(),
  report_date: z.string().min(1, "La date est obligatoire"),
})

export type MedicalReportInput = z.infer<typeof medicalReportSchema>

export function toMedicalReportRecord(
  values: MedicalReportInput,
  filePath?: string | null
) {
  return {
    patient_id: values.patient_id,
    doctor_id: values.doctor_id || null,
    consultation_id: values.consultation_id || null,
    title: values.title,
    report_type: values.report_type || null,
    description: values.description || null,
    report_date: values.report_date,
    ...(filePath !== undefined ? { file_path: filePath } : {}),
  }
}
