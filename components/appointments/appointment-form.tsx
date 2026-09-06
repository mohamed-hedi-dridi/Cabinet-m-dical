"use client"

import { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import type { AppointmentActionState } from "@/app/(dashboard)/appointments/actions"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { DoctorWithProfile } from "@/lib/services/doctors.service"
import type { AppointmentWithRelations } from "@/lib/services/appointments.service"
import {
  APPOINTMENT_STATUSES,
  appointmentSchema,
  type AppointmentInput,
} from "@/schemas/appointment.schema"
import type { Patient } from "@/types"

export const APPOINTMENT_STATUS_LABELS: Record<
  (typeof APPOINTMENT_STATUSES)[number],
  string
> = {
  PLANNED: "Planifié",
  CONFIRMED: "Confirmé",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
  ABSENT: "Absent",
}

/** Convertit une date ISO en chaîne compatible avec un input datetime-local (heure locale). */
function toDatetimeLocal(iso: string): string {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function AppointmentForm({
  appointment,
  patients,
  doctors,
  defaultStart,
  defaultEnd,
  onSubmit,
  onSuccess,
}: {
  appointment?: AppointmentWithRelations | null
  patients: Patient[]
  doctors: DoctorWithProfile[]
  defaultStart?: string
  defaultEnd?: string
  onSubmit: (values: AppointmentInput) => Promise<AppointmentActionState>
  onSuccess: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: appointment?.patient_id ?? "",
      doctor_id: appointment?.doctor_id ?? "",
      start_at: appointment
        ? toDatetimeLocal(appointment.start_at)
        : (defaultStart ?? ""),
      end_at: appointment
        ? toDatetimeLocal(appointment.end_at)
        : (defaultEnd ?? ""),
      reason: appointment?.reason ?? "",
      status: appointment?.status ?? "PLANNED",
      notes: appointment?.notes ?? "",
    },
  })

  function handleSubmit(values: AppointmentInput) {
    setServerError(null)
    startTransition(async () => {
      const result = await onSubmit(values)
      if (result?.error) {
        setServerError(result.error)
      } else {
        onSuccess()
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="patient_id">Patient *</FieldLabel>
            <Controller
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger id="patient_id" className="w-full">
                    <SelectValue placeholder="Sélectionner un patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.last_name} {patient.first_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.patient_id]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="doctor_id">Médecin *</FieldLabel>
            <Controller
              control={form.control}
              name="doctor_id"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger id="doctor_id" className="w-full">
                    <SelectValue placeholder="Sélectionner un médecin" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.profile.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.doctor_id]} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="start_at">Début *</FieldLabel>
            <Input
              id="start_at"
              type="datetime-local"
              disabled={isPending}
              {...form.register("start_at")}
            />
            <FieldError errors={[form.formState.errors.start_at]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="end_at">Fin *</FieldLabel>
            <Input
              id="end_at"
              type="datetime-local"
              disabled={isPending}
              {...form.register("end_at")}
            />
            <FieldError errors={[form.formState.errors.end_at]} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="reason">Motif</FieldLabel>
            <Input
              id="reason"
              disabled={isPending}
              {...form.register("reason")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="status">Statut</FieldLabel>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {APPOINTMENT_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea
            id="notes"
            disabled={isPending}
            {...form.register("notes")}
          />
        </Field>

        {serverError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {serverError}
          </p>
        )}

        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {appointment ? "Enregistrer" : "Créer le rendez-vous"}
          </Button>
        </DialogFooter>
      </FieldGroup>
    </form>
  )
}
