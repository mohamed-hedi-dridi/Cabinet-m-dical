import type { Metadata } from "next"

import { createMedicalReport } from "@/app/(dashboard)/medical-reports/actions"
import { MedicalReportForm } from "@/components/medical-reports/medical-report-form"
import { requireRole } from "@/lib/services/auth.service"
import { listConsultations } from "@/lib/services/consultations.service"
import { listDoctors } from "@/lib/services/doctors.service"
import { listPatients } from "@/lib/services/patients.service"

export const metadata: Metadata = {
  title: "Nouveau bilan médical — Cabinet Médical",
}

export default async function NewMedicalReportPage({
  searchParams,
}: PageProps<"/medical-reports/new">) {
  await requireRole(["ADMIN", "DOCTOR"])

  const params = await searchParams
  const patientId =
    typeof params.patientId === "string" ? params.patientId : undefined
  const consultationId =
    typeof params.consultationId === "string"
      ? params.consultationId
      : undefined

  const [patients, doctors, consultations] = await Promise.all([
    listPatients(),
    listDoctors(),
    patientId ? listConsultations({ patientId }) : Promise.resolve([]),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Nouveau bilan médical</h1>
        <p className="text-muted-foreground">
          Renseignez les informations du bilan et joignez le document.
        </p>
      </div>

      <div className="max-w-3xl rounded-xl border p-6">
        <MedicalReportForm
          patients={patients}
          doctors={doctors}
          consultations={consultations}
          lockedPatientId={patientId}
          lockedConsultationId={consultationId}
          onSubmit={createMedicalReport}
        />
      </div>
    </div>
  )
}
