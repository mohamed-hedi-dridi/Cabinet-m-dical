import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { updatePatient } from "@/app/(dashboard)/patients/actions"
import { PatientForm } from "@/components/patients/patient-form"
import { getPatientById } from "@/lib/services/patients.service"
import type { PatientInput } from "@/schemas/patient.schema"

export const metadata: Metadata = {
  title: "Modifier le patient — Cabinet Médical",
}

export default async function EditPatientPage({
  params,
}: PageProps<"/patients/[id]/edit">) {
  const { id } = await params
  const patient = await getPatientById(id)

  if (!patient) {
    notFound()
  }

  async function handleSubmit(values: PatientInput) {
    "use server"
    return updatePatient(id, values)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Modifier {patient.first_name} {patient.last_name}
        </h1>
        <p className="text-muted-foreground">
          Mettez à jour les informations du patient.
        </p>
      </div>

      <div className="max-w-3xl rounded-xl border p-6">
        <PatientForm patient={patient} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
