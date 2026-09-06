"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { updateAppointmentStatus } from "@/app/(dashboard)/appointments/actions"
import { APPOINTMENT_STATUS_LABELS } from "@/components/appointments/appointment-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { APPOINTMENT_STATUSES } from "@/schemas/appointment.schema"
import type { AppointmentStatus } from "@/types"

export function AppointmentStatusSelect({
  appointmentId,
  status,
}: {
  appointmentId: string
  status: AppointmentStatus
}) {
  const [isPending, startTransition] = useTransition()

  function handleChange(value: string) {
    startTransition(async () => {
      const result = await updateAppointmentStatus(
        appointmentId,
        value as AppointmentStatus
      )
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger size="sm" className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {APPOINTMENT_STATUSES.map((value) => (
          <SelectItem key={value} value={value}>
            {APPOINTMENT_STATUS_LABELS[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
