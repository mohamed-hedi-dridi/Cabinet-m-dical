export const PATIENT_HISTORY_EVENT_TYPES = [
  "CONSULTATION",
  "DISEASE",
  "MEDICAL_REPORT",
  "MEDICAL_NOTE",
] as const

export type PatientHistoryEventType =
  (typeof PATIENT_HISTORY_EVENT_TYPES)[number]

export interface PatientHistoryEvent {
  id: string
  type: PatientHistoryEventType
  date: string
  title: string
  description: string | null
  doctorId: string | null
  doctorName: string | null
  href: string | null
}
