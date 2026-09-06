import { z } from "zod"

const optionalNumberString = z
  .string()
  .optional()
  .refine((value) => !value || (!Number.isNaN(Number(value)) && Number(value) > 0), {
    message: "La valeur doit être un nombre positif",
  })

export const patientSchema = z.object({
  first_name: z.string().min(1, "Le prénom est obligatoire"),
  last_name: z.string().min(1, "Le nom est obligatoire"),
  gender: z.enum(["M", "F", ""]).optional(),
  birth_date: z.string().optional(),
  weight_kg: optionalNumberString,
  height_cm: optionalNumberString,
  blood_group: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""])
    .optional(),
  phone: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Email invalide",
    }),
  address: z.string().optional(),
  allergies: z.string().optional(),
  medical_history: z.string().optional(),
  chronic_diseases: z.string().optional(),
})

export type PatientInput = z.infer<typeof patientSchema>

/** Convertit les valeurs du formulaire (chaînes) vers le format attendu par Supabase (null pour les champs vides). */
export function toPatientRecord(values: PatientInput) {
  return {
    first_name: values.first_name,
    last_name: values.last_name,
    gender: values.gender || null,
    birth_date: values.birth_date || null,
    weight_kg: values.weight_kg ? Number(values.weight_kg) : null,
    height_cm: values.height_cm ? Number(values.height_cm) : null,
    blood_group: values.blood_group || null,
    phone: values.phone || null,
    email: values.email || null,
    address: values.address || null,
    allergies: values.allergies || null,
    medical_history: values.medical_history || null,
    chronic_diseases: values.chronic_diseases || null,
  }
}
