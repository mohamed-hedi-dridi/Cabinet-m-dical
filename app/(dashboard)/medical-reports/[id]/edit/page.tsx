import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { updateMedicalReport } from "@/app/(dashboard)/medical-reports/actions"
import { MedicalReportForm } from "@/components/medical-reports/medical-report-form"
import { requireRole } from "@/lib/services/auth.service"
import { listConsultations } from "@/lib/services/consultations.service"
import { listDoctors } from "@/lib/services/doctors.service"
import { getMedicalReportById } from "@/lib/services/medical-reports.service"
import { listPatients } from "@/lib/services/patients.service"
import type { MedicalReportInput } from "@/schemas/medical-report.schema"

export const metadata: Metadata = {
  title: "Modifier le bilan médical — Cabinet Médical",
}

export default async function EditMedicalReportPage({
  params,
}: PageProps<"/medical-reports/[id]/edit">) {
  await requireRole(["ADMIN", "DOCTOR"])

  const { id } = await params
  const report = await getMedicalReportById(id)

  if (!report) {
    notFound()
  }

  const currentFilePath = report.file_path

  const [patients, doctors, consultations] = await Promise.all([
    listPatients(),
    listDoctors(),
    listConsultations({ patientId: report.patient_id }),
  ])

  async function handleSubmit(values: MedicalReportInput, file: File | null) {
    "use server"
    return updateMedicalReport(id, currentFilePath, values, file)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Modifier le bilan médical</h1>
        <p className="text-muted-foreground">
          Mettez à jour les informations du bilan.
        </p>
      </div>

      <div className="max-w-3xl rounded-xl border p-6">
        <MedicalReportForm
          report={report}
          patients={patients}
          doctors={doctors}
          consultations={consultations}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
