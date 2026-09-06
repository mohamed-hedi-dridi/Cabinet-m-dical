"use client"

import { useState } from "react"

import {
  createAppointment,
  updateAppointment,
} from "@/app/(dashboard)/appointments/actions"
import { AppointmentForm } from "@/components/appointments/appointment-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { AppointmentWithRelations } from "@/lib/services/appointments.service"
import type { DoctorWithProfile } from "@/lib/services/doctors.service"
import type { Patient } from "@/types"

export function AppointmentDialog({
  appointment,
  patients,
  doctors,
  defaultStart,
  defaultEnd,
  trigger,
  open,
  onOpenChange,
}: {
  appointment?: AppointmentWithRelations | null
  patients: Patient[]
  doctors: DoctorWithProfile[]
  defaultStart?: string
  defaultEnd?: string
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const dialogOpen = isControlled ? open : internalOpen
  const setDialogOpen = isControlled ? onOpenChange! : setInternalOpen

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
          </DialogTitle>
        </DialogHeader>
        <AppointmentForm
          appointment={appointment}
          patients={patients}
          doctors={doctors}
          defaultStart={defaultStart}
          defaultEnd={defaultEnd}
          onSubmit={
            appointment
              ? (values) => updateAppointment(appointment.id, values)
              : createAppointment
          }
          onSuccess={() => setDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
