import { z } from "zod"

export const doctorSchema = z.object({
  profile_id: z.string().min(1, "Le profil est obligatoire"),
  speciality: z.string().optional(),
  phone: z.string().optional(),
})

export type DoctorInput = z.infer<typeof doctorSchema>

export function toDoctorRecord(values: DoctorInput) {
  return {
    profile_id: values.profile_id,
    speciality: values.speciality || null,
    phone: values.phone || null,
  }
}
