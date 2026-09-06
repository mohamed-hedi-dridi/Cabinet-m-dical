import type { Database } from "./database.types"

export * from "./database.types"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Doctor = Database["public"]["Tables"]["doctors"]["Row"]
export type Patient = Database["public"]["Tables"]["patients"]["Row"]
export type Disease = Database["public"]["Tables"]["diseases"]["Row"]
export type PatientDisease =
  Database["public"]["Tables"]["patient_diseases"]["Row"]
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"]
export type Consultation = Database["public"]["Tables"]["consultations"]["Row"]
export type MedicalReport =
  Database["public"]["Tables"]["medical_reports"]["Row"]
export type MedicalNote = Database["public"]["Tables"]["medical_notes"]["Row"]
