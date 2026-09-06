import "server-only"

import { listConsultations } from "@/lib/services/consultations.service"
import { listMedicalNotesForPatient } from "@/lib/services/medical-notes.service"
import { listMedicalReports } from "@/lib/services/medical-reports.service"
import { listPatientDiseases } from "@/lib/services/patient-diseases.service"
import type { PatientHistoryEvent } from "@/lib/types/patient-history"

export {
  PATIENT_HISTORY_EVENT_TYPES,
  type PatientHistoryEvent,
  type PatientHistoryEventType,
} from "@/lib/types/patient-history"

export async function listPatientHistory(
  patientId: string
): Promise<PatientHistoryEvent[]> {
  const [consultations, reports, notes, patientDiseases] = await Promise.all([
    listConsultations({ patientId }),
    listMedicalReports({ patientId }),
    listMedicalNotesForPatient(patientId),
    listPatientDiseases(patientId),
  ])

  const events: PatientHistoryEvent[] = []

  for (const consultation of consultations) {
    events.push({
      id: consultation.id,
      type: "CONSULTATION",
      date: consultation.consultation_date,
      title: consultation.reason || "Consultation",
      description:
        [consultation.diagnosis, consultation.treatment]
          .filter(Boolean)
          .join(" — ") || null,
      doctorId: consultation.doctor_id,
      doctorName: consultation.doctor.profile.full_name,
      href: `/consultations/${consultation.id}`,
    })
  }

  for (const report of reports) {
    events.push({
      id: report.id,
      type: "MEDICAL_REPORT",
      date: report.report_date,
      title: report.title,
      description: report.report_type,
      doctorId: report.doctor_id,
      doctorName: report.doctor?.profile.full_name ?? null,
      href: `/medical-reports/${report.id}`,
    })
  }

  for (const note of notes) {
    events.push({
      id: note.id,
      type: "MEDICAL_NOTE",
      date: note.note_date,
      title: note.title || "Note médicale",
      description: note.content,
      doctorId: note.doctor_id,
      doctorName: note.doctor.profile.full_name,
      href: null,
    })
  }

  for (const patientDisease of patientDiseases) {
    events.push({
      id: patientDisease.id,
      type: "DISEASE",
      date: patientDisease.diagnosed_at ?? patientDisease.created_at,
      title: patientDisease.disease.name,
      description: patientDisease.notes,
      doctorId: null,
      doctorName: null,
      href: null,
    })
  }

  return events.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}
