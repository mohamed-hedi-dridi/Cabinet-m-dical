import type { Metadata } from "next"

import { createPatient } from "@/app/(dashboard)/patients/actions"
import { PatientForm } from "@/components/patients/patient-form"

export const metadata: Metadata = {
  title: "Nouveau patient — Cabinet Médical",
}

export default function NewPatientPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Nouveau patient</h1>
        <p className="text-muted-foreground">
          Renseignez les informations du patient.
        </p>
      </div>

      <div className="max-w-3xl rounded-xl border p-6">
        <PatientForm onSubmit={createPatient} />
      </div>
    </div>
  )
}
