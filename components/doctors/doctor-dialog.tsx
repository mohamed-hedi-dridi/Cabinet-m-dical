"use client"

import { useState } from "react"

import { createDoctor, updateDoctor } from "@/app/(dashboard)/doctors/actions"
import { DoctorForm } from "@/components/doctors/doctor-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { DoctorWithProfile } from "@/lib/services/doctors.service"
import type { Profile } from "@/types"

export function DoctorDialog({
  doctor,
  availableProfiles,
  trigger,
}: {
  doctor?: DoctorWithProfile | null
  availableProfiles: Profile[]
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {doctor ? "Modifier le médecin" : "Nouveau médecin"}
          </DialogTitle>
        </DialogHeader>
        <DoctorForm
          doctor={doctor}
          availableProfiles={availableProfiles}
          onSubmit={
            doctor
              ? (values) => updateDoctor(doctor.id, values)
              : createDoctor
          }
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
