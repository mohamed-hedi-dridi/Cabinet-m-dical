"use client"

import { useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import type { ConsultationActionState } from "@/app/(dashboard)/consultations/actions"
import { Button } from "@/components/ui/button"
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
import type { AppointmentWithRelations } from "@/lib/services/appointments.service"
import type { ConsultationWithRelations } from "@/lib/services/consultations.service"
import type { DoctorWithProfile } from "@/lib/services/doctors.service"
import {
  consultationSchema,
  type ConsultationInput,
} from "@/schemas/consultation.schema"
import type { Patient } from "@/types"

function toDatetimeLocal(iso: string): string {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function ConsultationForm({
  consultation,
  patients,
  doctors,
  lockedPatientId,
  lockedAppointment,
  onSubmit,
}: {
  consultation?: ConsultationWithRelations | null
  patients: Patient[]
  doctors: DoctorWithProfile[]
  lockedPatientId?: string
  lockedAppointment?: AppointmentWithRelations | null
  onSubmit: (values: ConsultationInput) => Promise<ConsultationActionState>
}) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const patientLocked = Boolean(lockedPatientId || lockedAppointment)
  const doctorLocked = Boolean(lockedAppointment)

  const form = useForm<ConsultationInput>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      patient_id:
        consultation?.patient_id ??
        lockedAppointment?.patient_id ??
        lockedPatientId ??
        "",
      doctor_id: consultation?.doctor_id ?? lockedAppointment?.doctor_id ?? "",
      appointment_id:
        consultation?.appointment_id ?? lockedAppointment?.id ?? "",
      consultation_date: consultation
        ? toDatetimeLocal(consultation.consultation_date)
        : lockedAppointment
          ? toDatetimeLocal(lockedAppointment.end_at)
          : toDatetimeLocal(new Date().toISOString()),
      reason: consultation?.reason ?? lockedAppointment?.reason ?? "",
      symptoms: consultation?.symptoms ?? "",
      clinical_examination: consultation?.clinical_examination ?? "",
      diagnosis: consultation?.diagnosis ?? "",
      treatment: consultation?.treatment ?? "",
      medical_notes: consultation?.medical_notes ?? "",
    },
  })

  function handleSubmit(values: ConsultationInput) {
    setServerError(null)
    startTransition(async () => {
      const result = await onSubmit(values)
      if (result?.error) {
        setServerError(result.error)
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <FieldGroup>
        {lockedAppointment && (
          <p className="rounded-lg border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">
            Consultation créée à partir du rendez-vous du{" "}
            {new Date(lockedAppointment.start_at).toLocaleString("fr-FR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
            .
          </p>
        )}

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
                  disabled={isPending || patientLocked}
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
                  disabled={isPending || doctorLocked}
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

        <Field>
          <FieldLabel htmlFor="consultation_date">Date *</FieldLabel>
          <Input
            id="consultation_date"
            type="datetime-local"
            disabled={isPending}
            className="max-w-xs"
            {...form.register("consultation_date")}
          />
          <FieldError errors={[form.formState.errors.consultation_date]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="reason">Motif</FieldLabel>
          <Input id="reason" disabled={isPending} {...form.register("reason")} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="symptoms">Symptômes</FieldLabel>
            <Textarea
              id="symptoms"
              disabled={isPending}
              {...form.register("symptoms")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="clinical_examination">
              Examen clinique
            </FieldLabel>
            <Textarea
              id="clinical_examination"
              disabled={isPending}
              {...form.register("clinical_examination")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="diagnosis">Diagnostic</FieldLabel>
            <Textarea
              id="diagnosis"
              disabled={isPending}
              {...form.register("diagnosis")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="treatment">Traitement</FieldLabel>
            <Textarea
              id="treatment"
              disabled={isPending}
              {...form.register("treatment")}
            />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="medical_notes">Notes médicales</FieldLabel>
          <Textarea
            id="medical_notes"
            disabled={isPending}
            {...form.register("medical_notes")}
          />
        </Field>

        {serverError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {serverError}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {consultation ? "Enregistrer" : "Créer la consultation"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
