import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { updateConsultation } from "@/app/(dashboard)/consultations/actions"
import { ConsultationForm } from "@/components/consultations/consultation-form"
import { requireRole } from "@/lib/services/auth.service"
import { getConsultationById } from "@/lib/services/consultations.service"
import { listDoctors } from "@/lib/services/doctors.service"
import { listPatients } from "@/lib/services/patients.service"
import type { ConsultationInput } from "@/schemas/consultation.schema"

export const metadata: Metadata = {
  title: "Modifier la consultation — Cabinet Médical",
}

export default async function EditConsultationPage({
  params,
}: PageProps<"/consultations/[id]/edit">) {
  await requireRole(["ADMIN", "DOCTOR"])

  const { id } = await params
  const consultation = await getConsultationById(id)

  if (!consultation) {
    notFound()
  }

  const [patients, doctors] = await Promise.all([
    listPatients(),
    listDoctors(),
  ])

  async function handleSubmit(values: ConsultationInput) {
    "use server"
    return updateConsultation(id, values)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Modifier la consultation</h1>
        <p className="text-muted-foreground">
          Mettez à jour les informations de la consultation.
        </p>
      </div>

      <div className="max-w-3xl rounded-xl border p-6">
        <ConsultationForm
          consultation={consultation}
          patients={patients}
          doctors={doctors}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
