"use client"

import { useState } from "react"

import {
  addPatientDisease,
  updatePatientDisease,
} from "@/app/(dashboard)/patients/diseases-actions"
import { PatientDiseaseForm } from "@/components/patients/patient-disease-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Disease, PatientDisease } from "@/types"

export function PatientDiseaseDialog({
  patientId,
  patientDisease,
  diseases,
  trigger,
}: {
  patientId: string
  patientDisease?: PatientDisease | null
  diseases: Disease[]
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {patientDisease ? "Modifier la maladie" : "Ajouter une maladie"}
          </DialogTitle>
        </DialogHeader>
        <PatientDiseaseForm
          patientDisease={patientDisease}
          diseases={diseases}
          onSubmit={
            patientDisease
              ? (values) =>
                  updatePatientDisease(patientDisease.id, patientId, values)
              : (values) => addPatientDisease(patientId, values)
          }
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
