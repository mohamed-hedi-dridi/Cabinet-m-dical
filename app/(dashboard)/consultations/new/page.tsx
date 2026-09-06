import type { Metadata } from "next"

import { createConsultation } from "@/app/(dashboard)/consultations/actions"
import { ConsultationForm } from "@/components/consultations/consultation-form"
import { getAppointmentById } from "@/lib/services/appointments.service"
import { requireRole } from "@/lib/services/auth.service"
import { listDoctors } from "@/lib/services/doctors.service"
import { listPatients } from "@/lib/services/patients.service"

export const metadata: Metadata = {
  title: "Nouvelle consultation — Cabinet Médical",
}

export default async function NewConsultationPage({
  searchParams,
}: PageProps<"/consultations/new">) {
  await requireRole(["ADMIN", "DOCTOR"])

  const params = await searchParams
  const patientId =
    typeof params.patientId === "string" ? params.patientId : undefined
  const appointmentId =
    typeof params.appointmentId === "string" ? params.appointmentId : undefined

  const [patients, doctors, lockedAppointment] = await Promise.all([
    listPatients(),
    listDoctors(),
    appointmentId ? getAppointmentById(appointmentId) : Promise.resolve(null),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Nouvelle consultation</h1>
        <p className="text-muted-foreground">
          Renseignez les informations de la consultation.
        </p>
      </div>

      <div className="max-w-3xl rounded-xl border p-6">
        <ConsultationForm
          patients={patients}
          doctors={doctors}
          lockedPatientId={patientId}
          lockedAppointment={lockedAppointment}
          onSubmit={createConsultation}
        />
      </div>
    </div>
  )
}
